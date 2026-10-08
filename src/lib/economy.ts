/**
 * 서버 경제 동기화 v2 — "키 있는 영속 아웃박스" 방식.
 *
 * 원칙(1·2차 적대 리뷰 반영):
 *  1) 모든 서버 기록은 고유 reason_key를 가진 "이벤트"로만 전송 — 서버 unique index가
 *     재시도·중복탭·재큐잉을 전부 멱등 처리. "잔액 차액을 서버로 밀어넣는" 델타 코드는 없음
 *     (델타는 키가 없어 서버 중복차단을 우회하고, localStorage 위조를 서버 발행으로 승격시킴).
 *  2) 아웃박스는 localStorage에 영속 — 모든 변이는 저장소를 다시 읽어 병합(스테일 스냅샷을
 *     통째로 되쓰면 전송 중 적립된 이벤트가 파괴됨). 전송 실패는 아웃박스에 남아 재시도.
 *  3) 계정당 1회 이관: 신규 계정 첫 로그인 때만 로컬 잔액을 'local_migration' 키로 이관(서버가 봉인).
 *     이관 스냅샷과 아웃박스 폐기는 같은 동기 tick에 수행(그 사이 적립의 유실/이중 계상 차단).
 *  4) 새 기기 복원: 마커 없음 + 서버 원장 있음 → 아웃박스를 "완전히" 비운 뒤(미완료면 중단·재시도)
 *     서버 잔액으로 복원. 스냅샷은 flush 완료 후에 떠서 드리프트 이중 계상을 방지.
 *  5) 계정 전환(uid 마커 불일치): 이전 계정 지갑을 절대 이관하지 않음 — 서버 상태로 재설정.
 *  6) 개별 이벤트 전송은 첫 동기화(마커) 완료 후에만 — 이관액과의 이중 계상 차단.
 *  7) 모든 트리거(앱시작·auth 이벤트·online·포그라운드 복귀·enqueue)는 syncAccount 하나로 수렴 —
 *     첫 동기화가 일시 실패해도 다음 트리거가 재시도(마커==uid면 flush만 하는 값싼 경로).
 *  8) 늦은 응답 가드: 계정 세대(AuthMark)를 두고 모든 await 뒤에 지금 값과 비교한다 — 로그아웃·전환 사이에
 *     늦게 끝난 이전 계정의 호출이 새 계정의 지갑·마커를 쓰지 못한다. 아웃박스는 항목마다 보내기 직전
 *     세션 uid를 다시 확인한다(보안 검토 S3). 판정·순서 로직은 econCore.ts(의존성 없음, 스모크가 행동 검사).
 *
 * 비로그인·미설정 시 전부 no-op — 앱은 기존 localStorage 단독으로 동작.
 * ⚠️ 적립은 p_is_free=false(일일 무료 상한은 제품 정책상 제거됨). 차감은 mirror_spend RPC
 *    (supabase/economy-sync.sql — 배포 필수. 미배포 시 차감 이벤트는 아웃박스에 대기하고
 *    새 기기 복원도 보류됨 — 소비 미반영 잔액을 복원하는 사고 방지).
 */
import { supabase } from './supabase'
import { clearKakaoReauth, onAuthChange, signOut } from './auth'
import { safeLocalStorage } from './safeStorage'
import {
  GUEST,
  LOCAL_UID_KEY,
  MAX_AMOUNT,
  OUTBOX_KEY,
  SYNC_UID_KEY,
  createRerunGate,
  deleteErrorCode,
  drainOutbox,
  loadOutboxFrom,
  nextAuthMark,
  runAccountSync,
  saveOutboxTo,
  vaultDrop,
  type AuthMark,
  type DeleteAccountError,
  type OutboxEntry,
  type SpendResult,
  type SyncHooks,
} from './econCore'

export type { SyncHooks, AuthMark, DeleteAccountError } from './econCore'
export { isStaleAuth } from './econCore'

/** 저장소 접근은 전부 이 보호 래퍼로 — 시크릿 모드·용량 초과에서 읽기만 해도 던진다 */
const kv = safeLocalStorage

/** 지금 이 기기의 로그인 계정과 세대 — 직접 대입하지 말고 noteAuthUid로만 바꾼다 */
let auth: AuthMark = { uid: null, epoch: 0 }
/** 늦은 응답 가드용 getter — 시작 시 잡은 값과 비교할 "지금 값"은 반드시 이걸로 읽는다 */
export const authMark = (): AuthMark => auth
function noteAuthUid(uid: string | null): void {
  auth = nextAuthMark(auth, uid)
}

let flushing = false
/** 동기화 재진입 게이트 — 진행 중 들어온 트리거(auth 이벤트 등)는 버리지 않고 끝난 뒤 한 번 더 */
const syncGate = createRerunGate()
/** mirror_spend 미배포(PGRST202) 감지 — 이번 세션 재시도만 중단(아웃박스에는 유지) */
let spendRpcMissing = false
/** initEconomySync가 등록한 훅 — enqueue 등 모든 트리거가 syncAccount로 수렴하기 위한 참조 */
let hooksRef: SyncHooks | null = null

const uniq = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
const evtKey = () => 'evt:' + uniq()

const loadOutbox = (): OutboxEntry[] => loadOutboxFrom(kv)
const saveOutbox = (list: OutboxEntry[]): void => saveOutboxTo(kv, list)

async function sessionUid(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id ?? null
  } catch {
    return null
  }
}

/** 서버 잔액(원장 합계) — 비로그인/오류 시 null */
export async function fetchServerPoints(): Promise<number | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('my_points')
    if (error || typeof data !== 'number') return null
    return data
  } catch {
    return null
  }
}

/** 서버 원장 행 수 — "이 계정이 서버 지갑을 가진 적 있는가" 판별(잔액 0과 신규 계정 구분) */
async function fetchServerLedgerCount(): Promise<number | null> {
  if (!supabase) return null
  try {
    const { count, error } = await supabase.from('points_ledger').select('id', { count: 'exact', head: true })
    if (error || typeof count !== 'number') return null
    return count
  } catch {
    return null
  }
}

/**
 * 적립 전송. asUid를 주면 보내기 직전 세션이 그 계정인지 확인한다 — RPC는 "지금 세션의 토큰"으로 나가므로
 * 그 사이 계정이 바뀌었으면 다른 사람 원장에 적립된다(보안 검토 S3).
 */
async function sendEarn(amount: number, memo: string, key: string, asUid: string | null = null): Promise<boolean> {
  if (!supabase) return false
  if (asUid !== null && (await sessionUid()) !== asUid) return false
  try {
    const { error } = await supabase.rpc('grant_points', {
      p_amount: Math.round(amount),
      p_memo: memo,
      p_reason_key: key,
      p_is_free: false,
    })
    return !error
  } catch {
    return false
  }
}

async function sendSpend(amount: number, memo: string, key: string): Promise<SpendResult> {
  if (!supabase) return 'fail'
  if (spendRpcMissing) return 'defer'
  try {
    const { error } = await supabase.rpc('mirror_spend', {
      p_amount: Math.round(amount),
      p_memo: memo,
      p_reason_key: key,
    })
    if (error) {
      if (error.code === 'PGRST202') {
        // economy-sync.sql 미배포 — 아웃박스에 남겨두고 이번 세션은 건너뜀(배포 후 자동 재시도)
        spendRpcMissing = true
        return 'defer'
      }
      return 'fail'
    }
    return 'ok'
  } catch {
    return 'fail'
  }
}

/**
 * 아웃박스 전송. 반환 true = 이 계정의 적격 항목이 하나도 남지 않음(완전 배출).
 * 첫 동기화(마커) 전에는 전송하지 않음(force는 syncAccount 내부 전용).
 * expectUid: 호출부가 확인한 계정 — 세션이 그와 다르면 아무것도 보내지 않는다.
 * isStale: 호출부의 늦은 응답 가드(없으면 이 배출 시작 이후 세대가 바뀌었는지만 본다).
 * 루프·항목별 세션 재확인은 econCore.drainOutbox.
 */
async function flushOutbox(force = false, expectUid: string | null = null, isStale?: () => boolean): Promise<boolean> {
  if (!supabase || flushing) return false
  flushing = true
  try {
    const epoch0 = auth.epoch
    const uid = await sessionUid()
    if (!uid) return false
    if (expectUid !== null && uid !== expectUid) return false
    if (!force && kv.getItem(SYNC_UID_KEY) !== uid) return false
    return await drainOutbox({
      uid,
      kv,
      sessionUid,
      isStale: isStale ?? (() => authMark().epoch !== epoch0),
      sendEarn: (e) => sendEarn(e.amount, e.memo, e.k),
      sendSpend: (e) => sendSpend(e.amount, e.memo, e.k),
    })
  } finally {
    flushing = false
  }
}

function enqueue(kind: 'earn' | 'spend', amount: number, memo: string, key: string | null): void {
  const n = Math.round(amount)
  if (!supabase || n <= 0 || n > MAX_AMOUNT) return
  const entry: OutboxEntry = { id: uniq(), k: key ?? evtKey(), kind, amount: n, memo, uid: auth.uid }
  const list = loadOutbox()
  // 같은 의미 키 재큐잉 방지 — 단, 소유자가 같거나 클레임 가능(null)한 경우만 차단.
  // 다른 계정의 dormant 항목이 현재 계정의 정당한 이벤트를 막으면 안 됨(서버 멱등성은 계정 단위).
  if (key !== null && list.some((x) => x.k === entry.k && (x.uid === entry.uid || x.uid === null || entry.uid === null)))
    return
  list.push(entry)
  saveOutbox(list)
  // 첫 동기화 미완료면 syncAccount가, 완료면 flush가 처리 — 트리거 단일화
  if (hooksRef) void syncAccount(hooksRef)
  else void flushOutbox()
}

/**
 * 적립 미러 — 로컬 적립 직후 호출(파이어&포겟).
 * @param key 서버 중복 차단 키 — 1회성('first_post')·일일('checkin:2026-08-18') 보상은 의미 키,
 *            생략 시 이벤트별 고유 키 자동 발급(재시도 멱등).
 */
export function mirrorEarn(amount: number, memo: string, key: string | null = null): void {
  enqueue('earn', amount, memo, key)
}

/** 차감 미러 — 로컬 차감 직후 호출(파이어&포겟). key 생략 시 고유 키 자동 발급. */
export function mirrorSpend(amount: number, memo: string, key: string | null = null): void {
  enqueue('spend', amount, memo, key)
}

/**
 * 계정 동기화 — 모든 트리거가 이 함수로 수렴. 분기·늦은 응답 가드는 econCore.runAccountSync.
 * 진행 중에 들어온 호출은 버리지 않고, 끝난 뒤 한 번 더 실행한다(전환 직후 새 계정 동기화가 미뤄지지 않게).
 */
async function syncAccount(hooks: SyncHooks): Promise<void> {
  if (!supabase) return
  if (!syncGate.tryEnter()) return
  try {
    await runAccountSync({
      kv,
      hooks,
      sessionUid,
      getAuth: authMark,
      noteUid: (uid) => noteAuthUid(uid),
      flush: ({ force, uid, isStale }) => flushOutbox(force, uid, isStale),
      fetchLedgerCount: fetchServerLedgerCount,
      fetchServerPoints,
      sendEarn: (amount, memo, key, asUid) => sendEarn(amount, memo, key, asUid),
    })
  } finally {
    // setTimeout — 같은 tick에 재진입하지 않게(호출 스택이 아니라 다음 태스크에서)
    if (syncGate.exit()) setTimeout(() => void syncAccount(hooks), 0)
  }
}

/**
 * 로그아웃 — 계정 경계를 "로그인 시점"뿐 아니라 로그아웃 시점에도 적용한다.
 * 적용하지 않으면 로그아웃한 비로그인 사용자가 직전 계정의 지갑·유료재화·검사기록을 그대로 이어받는다.
 * 기기 프로필을 계정 uid로 보관하고 게스트 프로필로 되돌린 뒤, 마커를 지워 재로그인 시
 * '보관본 복원 + 서버 잔액 정산' 경로를 다시 타게 한다.
 */
export function leaveAccount(): void {
  const prev = auth.uid ?? kv.getItem(LOCAL_UID_KEY)
  // 세대를 먼저 올린다 — 진행 중인 동기화가 다음 await 뒤에 이 계정의 지갑·마커를 쓰지 못하게
  noteAuthUid(null)
  if (hooksRef && prev && prev !== GUEST) hooksRef.swapAccount(prev, GUEST)
  kv.setItem(LOCAL_UID_KEY, GUEST)
  kv.removeItem(SYNC_UID_KEY)
  saveOutbox(loadOutbox().filter((e) => e.uid !== null))
}

/**
 * 로그아웃의 단일 진입점 — 세션 제거와 계정 경계(leaveAccount)를 항상 한 쌍으로 적용한다.
 * 호출부마다 둘을 따로 부르면 한쪽이 빠진다(실제로 온보딩의 '다른 계정으로 로그인'이 signOut만 불러,
 * 직전 계정의 지갑·검사기록이 게스트 프로필에 그대로 남았다).
 */
export async function logoutAccount(): Promise<void> {
  try {
    await signOut()
  } finally {
    leaveAccount()
  }
}

/**
 * 계정 삭제(스토어 필수) — 서버(엣지 함수 delete-account)가 auth 사용자와 연결 데이터를 지운 뒤,
 * 이 기기에서도 그 계정의 흔적(보관 프로필)을 지우고 게스트로 돌아간다.
 * 서버 삭제가 실패하면 로컬은 건드리지 않는다(지워졌다고 믿게 만들지 않는다).
 * 실패는 **코드로만** 돌려준다 — 서버 원문(message)은 화면에 닿지 않게 콘솔에만 남긴다.
 * 예외도 던지지 않는다(던지면 호출부의 '삭제 중' 표시가 풀리지 않았다).
 */
export async function deleteAccount(): Promise<{ ok: boolean; error?: DeleteAccountError }> {
  if (!supabase) return { ok: false, error: 'supabase_not_configured' }
  let uid: string | undefined
  try {
    const { data: sess } = await supabase.auth.getSession()
    uid = sess.session?.user?.id
  } catch {
    return { ok: false, error: 'session_unavailable' }
  }
  if (!uid) return { ok: false, error: 'not_logged_in' }
  try {
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' })
    if (error) {
      console.warn('[account] delete-account 실패', deleteErrorCode(error))
      return { ok: false, error: deleteErrorCode(error) }
    }
  } catch (e) {
    console.warn('[account] delete-account 예외', deleteErrorCode(e))
    return { ok: false, error: deleteErrorCode(e) === 'unknown' ? 'network' : deleteErrorCode(e) }
  }
  leaveAccount() // 게스트 프로필로 경계 — 이때 계정 스냅샷이 보관되므로 바로 아래에서 지운다
  vaultDrop(kv, uid) // 저장소·이번 방문 메모리 보관본 둘 다
  try {
    await supabase.auth.signOut({ scope: 'local' }) // 서버 사용자는 이미 없다 — 로컬 세션만 정리
  } catch {
    /* ignore */
  }
  return { ok: true }
}

/**
 * 계정 전환이 아직 반영되지 않은 상태인가 — 다이아 수령처럼 "받는 즉시 로컬에만 남는" 동작을
 * 이 구간에서 하면 직후의 프로필 스왑에 덮여 소멸한다. 그 창에서는 수령을 막는다.
 */
export function isAccountSwitchPending(uid: string | null): boolean {
  if (!uid) return false
  const localUid = kv.getItem(LOCAL_UID_KEY)
  return !!localUid && localUid !== uid
}

/** 전체 초기화 — 동기화 마커·아웃박스를 통째로 비워 다음 로그인이 처음부터 판정하게 한다. */
export function clearAccountSync(): void {
  noteAuthUid(null)
  kv.removeItem(LOCAL_UID_KEY)
  kv.removeItem(SYNC_UID_KEY)
  kv.removeItem(OUTBOX_KEY)
}

/** 동기화 초기화 — useStore 모듈 로드 시 1회 호출. */
export function initEconomySync(hooks: SyncHooks): void {
  if (typeof window === 'undefined' || !supabase) return
  hooksRef = hooks
  void supabase.auth.getSession().then(
    ({ data }) => {
      const uid = data.session?.user?.id ?? null
      noteAuthUid(uid)
      if (uid) void syncAccount(hooks)
    },
    () => {
      /* 세션 저장소를 못 읽음 — 다음 auth 이벤트·포그라운드 복귀가 다시 시도한다 */
    },
  )
  // ⚠️ setTimeout으로 콜백 밖에서 실행 — onAuthStateChange 안의 supabase 재호출은 교착 위험(supabase-js v2)
  // TOKEN_REFRESHED 등 모든 세션 이벤트에서 재시도 — 첫 동기화 실패 시에도 세션 내 재시도 확보
  // (마커==uid·아웃박스 빈 상태면 RPC 0회의 값싼 경로라 반복 호출 무해)
  // 세대 반영은 콜백 안에서 **동기로** — 진행 중인 이전 계정 작업이 다음 await 뒤에 바로 멈추게.
  onAuthChange((uid) => {
    noteAuthUid(uid)
    if (uid) {
      clearKakaoReauth() // 새 세션이 섰다 — 다음 로그인부터는 다시 자동 로그인 허용
      setTimeout(() => void syncAccount(hooks), 0)
    }
  })
  window.addEventListener('online', () => void syncAccount(hooks))
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void syncAccount(hooks)
  })
}
