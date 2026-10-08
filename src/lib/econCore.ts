/**
 * 경제 동기화의 판정·순서 로직 — **의존성이 없는** 모듈(supabase·스토어·DOM·import 없음).
 *
 * 왜 떼어냈나: 계정 전환·로그아웃 사이에 늦게 끝난 동기화가 이전 계정의 마커·지갑을 새 계정에 쓰는 부류,
 * 비밀번호 로그인처럼 리로드 없이 세션이 바뀌면 A의 아웃박스가 B의 토큰으로 나가는 부류(보안 검토 S3)는
 * 브라우저 두 계정 없이는 재현이 어렵다. 판정과 순서를 여기 두고 economy.ts는 배선만 하게 하면,
 * node 스모크(scripts/econ-check.mjs)가 이 파일을 직접 import 해 **행동**을 검사할 수 있다.
 * ⚠️ 그래서 이 파일엔 import를 두지 않는다(node 타입 제거 실행이 확장자 없는 import를 못 푼다).
 *    erasable 문법만 쓴다(enum·namespace·생성자 매개변수 속성 금지).
 */

export const OUTBOX_KEY = 'nuri-mind-econ-outbox-v1'
/** 이 기기가 마지막으로 동기화를 완료한 계정 uid — 첫 동기화/계정 전환 판별 */
export const SYNC_UID_KEY = 'nuri-mind-econ-sync-uid'
/**
 * 이 기기의 로컬 프로필이 "누구 것인가" — 서버 왕복과 무관한 로컬 경계.
 * SYNC_UID_KEY(서버 동기화 완료)와 분리한 이유: 계정 전환 감지 후 서버 호출이 한 번만 실패해도
 * 이전 계정의 유료 재화·기록이 새 계정 화면에 남는 창이 생기기 때문(경계는 네트워크와 무관해야 함).
 */
export const LOCAL_UID_KEY = 'nuri-mind-econ-local-uid'
/** 로그아웃 상태의 기기 프로필도 하나의 '계정'처럼 보관 — 재로그인 시 원상 복구를 위해 */
export const GUEST = 'guest'
export const MAX_OUTBOX = 300
/** 서버 grant_points/mirror_spend의 건당 상한과 일치 */
export const MAX_AMOUNT = 100000

/** 예외를 삼키는 저장소(lib/safeStorage.ts) — 테스트에서는 가짜를 넣는다 */
export interface KV {
  getItem(k: string): string | null
  /** 성공 여부 — 계정 보관본이 "못 쓴 것"을 알아야 한다 */
  setItem(k: string, v: string): boolean
  removeItem(k: string): void
}

export interface OutboxEntry {
  /** 항목 고유 인스턴스 id — 클레임/제거의 매칭 기준(같은 의미 키가 계정별로 공존 가능하므로 k로 매칭 금지) */
  id: string
  /** 서버 reason_key — 재시도 멱등성의 핵심(의미 키 또는 생성 시 1회 발급되는 evt: 키) */
  k: string
  kind: 'earn' | 'spend'
  amount: number
  memo: string
  /** 이벤트 발생 시점의 계정(비로그인은 null → 첫 로그인 계정이 클레임) */
  uid: string | null
}

export interface SyncHooks {
  getWallet: () => { points: number }
  /** 새 기기 복원 — points = 서버잔액 + (현재 − 스냅샷) 으로 동기화 중 적립을 보존 */
  restoreTo: (serverPoints: number, snapshotPoints: number) => void
  /**
   * 계정 전환 — 이전 계정의 기기-로컬 프로필을 uid별로 보관(스냅샷)하고,
   * 새 계정의 보관본이 있으면 복원한다. 파기하지 않는 이유: 유료 재화(다이아·프리미엄)는
   * 서버 복원 경로가 없어 지우면 영구 소멸이고, 남기면 남의 계정에 승계되기 때문.
   */
  swapAccount: (prevUid: string, nextUid: string) => void
  /** 서버 권위 잔액으로 지갑을 맞춤(차액은 원장 1행으로 기록) */
  setWallet: (points: number, memo: string) => void
}

export function loadOutboxFrom(kv: KV): OutboxEntry[] {
  try {
    const raw = kv.getItem(OUTBOX_KEY)
    const list = raw ? (JSON.parse(raw) as OutboxEntry[]) : []
    if (!Array.isArray(list)) return []
    // 구버전 항목(id 없음) 호환 — k를 id로 승계
    return list.map((x) => (x.id ? x : { ...x, id: x.k }))
  } catch {
    return []
  }
}

export function saveOutboxTo(kv: KV, list: OutboxEntry[]): void {
  try {
    kv.setItem(OUTBOX_KEY, JSON.stringify(list.slice(-MAX_OUTBOX)))
  } catch {
    /* 저장소 불가 — 미러 포기(로컬 동작엔 영향 없음) */
  }
}

// ── 로컬 경계 표식(LOCAL_UID_KEY) — 저장소에 못 쓰면 메모리로 대신 보관 ──────────────

/**
 * undefined = 메모리 대체본 없음(저장소가 기준). 문자열·null = 저장소 쓰기가 실패해 이 값이 기준.
 * 왜: 용량 초과로 setItem이 실패하면 표식이 옛 계정(A)으로 남는다. 그러면 B로 동기화할 때마다
 * swapAccount(A, B)가 다시 실행되고, 그때의 화면(이미 B)이 'A의 보관본'으로 저장돼 A의 메모리본을 B 데이터로 덮는다.
 */
let localUidMem: string | null | undefined = undefined

/** 읽기 — 메모리 대체본이 있으면 그것이 우선 */
export function readLocalUid(kv: KV): string | null {
  return localUidMem !== undefined ? localUidMem : kv.getItem(LOCAL_UID_KEY)
}

export function writeLocalUid(kv: KV, uid: string): void {
  localUidMem = kv.setItem(LOCAL_UID_KEY, uid) ? undefined : uid
}

/** 지우기 — removeItem도 조용히 실패할 수 있다. 지워졌으면 저장소가 기준, 남아 있으면 메모리를 '없음(null)'으로 확정 */
export function clearLocalUid(kv: KV): void {
  kv.removeItem(LOCAL_UID_KEY)
  localUidMem = kv.getItem(LOCAL_UID_KEY) === null ? undefined : null
}

// ── 계정 세대(늦은 응답 가드) ─────────────────────────────────────────────

/** 지금 이 기기의 로그인 계정과 그 세대 — 세대는 "이전 계정의 진행 중 작업을 무효로 만드는" 전이에서만 오른다 */
export interface AuthMark {
  uid: string | null
  epoch: number
}

/**
 * 인증 이벤트를 세대에 반영한다.
 *  · 로그아웃(null)        → 무조건 +1 — 진행 중인 동기화·수령을 끊는 것이 목적이다(이미 로그아웃이어도).
 *  · uid → 다른 uid(전환) → +1 — 이전 계정의 진행 중 작업 전부 폐기.
 *  · null → uid(로그인), 같은 uid 재확인(TOKEN_REFRESHED) → 그대로 — 올리면 방금 시작한 정상 동기화까지 버려진다.
 */
export function nextAuthMark(prev: AuthMark, uid: string | null): AuthMark {
  if (uid === null) return { uid: null, epoch: prev.epoch + 1 }
  if (prev.uid !== null && prev.uid !== uid) return { uid, epoch: prev.epoch + 1 }
  if (prev.uid === uid) return prev
  return { uid, epoch: prev.epoch }
}

/**
 * 시작 시점(start)과 지금(now)이 같은 계정·같은 세대인가 — 둘 중 하나라도 다르면 낡았다.
 * ⚠️ now는 반드시 **getter로 지금 읽은 값**이어야 한다. 시작할 때 잡아 둔 값끼리 비교하면 항상 같다(재발 사고).
 * 세대만 보면 놓치는 경우: (없음 — 계정이 바뀌면 세대도 오른다) / uid만 보면 놓치는 경우: A → 로그아웃 → A.
 */
export function isStaleAuth(start: AuthMark, now: AuthMark): boolean {
  return start.epoch !== now.epoch || start.uid !== now.uid
}

/**
 * 재진입 게이트 — 진행 중에 들어온 호출을 **버리지 않고** "끝난 뒤 한 번 더"로 접는다.
 * 예전엔 syncing 중 들어온 auth 이벤트를 그냥 return으로 버려, 전환 직후의 새 계정 동기화가
 * 다음 트리거(포그라운드 복귀 등)까지 미뤄졌다.
 */
export function createRerunGate(): { tryEnter(): boolean; exit(): boolean } {
  let busy = false
  let pending = false
  return {
    tryEnter() {
      if (busy) {
        pending = true
        return false
      }
      busy = true
      return true
    },
    /** 반환 true = 진행 중에 요청이 들어왔다 → 호출부가 한 번 더 실행해야 한다 */
    exit() {
      busy = false
      const again = pending
      pending = false
      return again
    },
  }
}

// ── 아웃박스 배출 ─────────────────────────────────────────────────────────

export type SpendResult = 'ok' | 'fail' | 'defer'

export interface DrainDeps {
  /** 이 배출의 주인 — 시작 시 세션에서 확인한 uid */
  uid: string
  kv: KV
  /** 지금 이 순간의 세션 uid(getSession) — 항목마다 보내기 직전에 다시 묻는다 */
  sessionUid: () => Promise<string | null>
  /** 시작 이후 로그아웃·전환이 있었는가(getter 기반) */
  isStale: () => boolean
  sendEarn: (e: OutboxEntry) => Promise<boolean>
  sendSpend: (e: OutboxEntry) => Promise<SpendResult>
}

/**
 * 아웃박스 전송 루프. 반환 true = 이 계정의 적격 항목이 하나도 남지 않음(완전 배출).
 * 모든 변이는 저장소를 다시 읽어 병합 — 전송 중 enqueue된 항목을 절대 덮어쓰지 않고,
 * 한 바퀴 배출 후 새로 들어온 항목까지 재확인(rerun 루프).
 *
 * ⚠️ 항목마다 **보내기 직전에** 현재 세션 uid가 이 배출의 주인과 같은지 다시 확인한다(보안 검토 S3).
 *    RPC는 "지금 세션의 토큰"으로 나간다 — 비밀번호 로그인처럼 리로드 없이 세션이 바뀌면
 *    A 태그 항목(또는 A가 방금 클레임한 비로그인 항목)이 B의 원장에 적립된다. 다르면 즉시 중단(항목은 보존).
 */
export async function drainOutbox(d: DrainDeps): Promise<boolean> {
  const { uid, kv } = d
  for (;;) {
    if (d.isStale()) return false
    const eligible = loadOutboxFrom(kv).filter((x) => x.uid === uid || x.uid === null)
    if (eligible.length === 0) return true
    let progressed = false
    let deferred = 0
    for (const e of eligible) {
      if (d.isStale()) return false
      const now = await d.sessionUid()
      // getSession을 기다리는 사이에도 전환될 수 있다 — 응답 뒤에 한 번 더
      if (now !== uid || d.isStale()) return false
      if (e.uid === null) {
        // 이 기기 지갑을 현재 계정이 소유(클레임) — 저장소 재읽기 후 해당 항목만 갱신(id 매칭)
        saveOutboxTo(kv, loadOutboxFrom(kv).map((x) => (x.id === e.id ? { ...x, uid } : x)))
      }
      if (e.kind === 'earn') {
        if (!(await d.sendEarn(e))) return false // 네트워크 실패 — 다음 기회에
      } else {
        const r = await d.sendSpend(e)
        if (r === 'fail') return false
        if (r === 'defer') {
          deferred++
          continue // RPC 미배포 — 항목 유지하고 다음으로
        }
      }
      saveOutboxTo(kv, loadOutboxFrom(kv).filter((x) => x.id !== e.id))
      progressed = true
    }
    if (deferred > 0) return false // 차감 대기 잔존 — 완전 배출 아님
    if (!progressed) return true
    // 전송 도중 새 항목이 들어왔을 수 있음 → 한 바퀴 더
  }
}

// ── 계정 동기화 ───────────────────────────────────────────────────────────

export interface SyncDeps {
  kv: KV
  hooks: SyncHooks
  sessionUid: () => Promise<string | null>
  /** 지금의 계정·세대 — 매번 새로 읽는 getter */
  getAuth: () => AuthMark
  /** 세션에서 확인한 uid를 계정 표식에 반영 */
  noteUid: (uid: string) => void
  flush: (opts: { force: boolean; uid: string; isStale: () => boolean }) => Promise<boolean>
  fetchLedgerCount: () => Promise<number | null>
  fetchServerPoints: () => Promise<number | null>
  /** asUid: 보내기 직전 세션이 이 계정인지 확인하고, 아니면 보내지 않고 false */
  sendEarn: (amount: number, memo: string, key: string, asUid: string) => Promise<boolean>
}

/**
 * 계정 동기화 본체 — 모든 트리거가 이 함수로 수렴(재진입은 호출부의 createRerunGate가 막는다).
 *  · 마커 == uid       → 아웃박스만 전송
 *  · 마커 없음 + 서버 원장 있음 → 복원: 아웃박스 완전 배출 확인 → 스냅샷 → 서버 잔액 → restoreTo
 *  · 마커 없음 + 서버 원장 없음 → 이관: 같은 tick에 아웃박스 폐기+스냅샷 → 'local_migration' 1회
 *  · 마커 ≠ uid(계정 전환)     → 이관 없이 서버 상태로 지갑 재설정
 * 실패(네트워크·부분 전송) 시 마커를 남기지 않고 반환 → 다음 트리거가 재시도(전부 멱등).
 *
 * ⚠️ 모든 await 뒤에 stale()을 본다 — 그 사이 로그아웃·계정 전환이 있었으면 아무것도 쓰지 않고 중단한다.
 *    예전엔 A의 동기화가 서버 응답을 기다리는 동안 B로 바뀌면, 늦게 끝난 A의 호출이
 *    B 화면의 지갑을 A의 서버 잔액으로 덮고 마커를 A로 박았다. 중단 후엔 호출부가 새 계정으로 다시 돈다.
 */
export async function runAccountSync(d: SyncDeps): Promise<void> {
  const { kv, hooks } = d
  const epoch0 = d.getAuth().epoch
  const uid = await d.sessionUid()
  if (!uid) return
  // getSession을 기다리는 사이 로그아웃·전환이 있었다 — 이 uid는 이미 낡았다
  if (d.getAuth().epoch !== epoch0) return
  d.noteUid(uid)
  const start = d.getAuth()
  const stale = () => isStaleAuth(start, d.getAuth())

  // ── ① 로컬 경계를 서버보다 먼저 세운다 ──
  // 전환 감지 즉시 프로필을 스왑한다. 서버 응답을 기다리면 네트워크가 한 번만 실패해도
  // 이전 계정의 다이아·프리미엄·검사기록이 새 계정 화면에 그대로 남는다.
  const localUid = readLocalUid(kv)
  if (localUid && localUid !== uid) {
    hooks.swapAccount(localUid, uid)
    // 이전 지갑에서 로그아웃 상태로 쌓인 활동(uid=null)은 새 계정 것이 아니다.
    // ⚠️ 반드시 flush "이전"에 폐기 — 뒤에 두면 force flush가 먼저 새 계정 원장에 적립해버린다.
    saveOutboxTo(kv, loadOutboxFrom(kv).filter((e) => e.uid !== null))
    writeLocalUid(kv, uid)
  }

  const marker = kv.getItem(SYNC_UID_KEY)
  if (marker === uid) {
    await d.flush({ force: false, uid, isStale: stale })
    return
  }

  if (marker && marker !== uid) {
    // 계정 전환 — 경계는 ①에서 이미 확정됐고, 여기서는 잔액만 서버 권위로 정산한다.
    // 이전 계정 태그(uid=marker) 항목은 배출하지 않고 휴면 보관 — 그 사용자가 재로그인할 때 전송된다.
    if (!(await d.flush({ force: true, uid, isStale: stale }))) return
    if (stale()) return
    // ⚠️ 원장 행 수는 반드시 flush "이후"에 읽는다. 배출로 갓 생긴 행을 못 보면
    //    신규 계정으로 오판해 local_migration 100P를 덧대 로컬·서버가 영구히 어긋난다.
    const count = await d.fetchLedgerCount()
    if (count === null || stale()) return
    if (count > 0) {
      const server = await d.fetchServerPoints()
      if (server === null || stale()) return
      hooks.setWallet(server, '👤 계정 전환 — 서버 지갑으로 동기화')
    } else {
      // 새 지갑 시드 100P — 전송 성공을 확인한 뒤에만 지갑 확정(실패 시 다음 트리거가 재시도)
      if (!(await d.sendEarn(100, '💾 로컬 지갑 이관', 'local_migration', uid))) return
      if (stale()) return
      hooks.setWallet(100, '👤 계정 전환 — 새 지갑 시작')
    }
    kv.setItem(SYNC_UID_KEY, uid)
    return
  }

  // ── 이 기기에서 이 계정 첫 동기화 ──
  // 여기서는 원장 행 수를 flush 전에 읽어야 한다. 신규 계정 경로는 flush가 아니라
  // '아웃박스 폐기 + 잔액 1회 이관'이라서, 먼저 배출해버리면 이관액과 이중 계상된다.
  const ledgerCount = await d.fetchLedgerCount()
  if (ledgerCount === null || stale()) return
  if (ledgerCount > 0) {
    // 기존 계정(재설치·새 기기) → 비로그인 활동을 전부 서버에 반영한 뒤 서버 잔액으로 복원.
    // 완전 배출이 아니면(네트워크 실패·차감 RPC 미배포) 복원 보류 — 부정확한 잔액 복원 방지.
    if (!(await d.flush({ force: true, uid, isStale: stale }))) return
    if (stale()) return
    // 스냅샷은 flush "완료 후"에 — flush로 서버에 반영된 적립이 드리프트에 중복 계상되는 것 방지
    const snapshot = hooks.getWallet().points
    const server = await d.fetchServerPoints()
    if (server === null || stale()) return
    hooks.restoreTo(server, snapshot)
  } else {
    // 신규 계정 → 로컬 잔액 1회 이관. 아웃박스 폐기와 스냅샷을 같은 동기 tick에 수행 —
    // 현재 계정·비로그인 이벤트 금액은 전부 스냅샷에 포함돼 있으므로 폐기가 정확(이중 지급 차단).
    saveOutboxTo(kv, loadOutboxFrom(kv).filter((e) => e.uid !== null && e.uid !== uid))
    const amt = Math.min(Math.max(hooks.getWallet().points, 0), MAX_AMOUNT)
    if (amt > 0 && !(await d.sendEarn(amt, '💾 로컬 지갑 이관', 'local_migration', uid))) return
    if (stale()) return
  }
  kv.setItem(SYNC_UID_KEY, uid)
  writeLocalUid(kv, uid)
}

// ── 계정 삭제 오류 코드 ────────────────────────────────────────────────────

export type DeleteAccountError =
  | 'supabase_not_configured'
  | 'not_logged_in'
  | 'session_unavailable'
  | 'network'
  | 'server_rejected'
  | 'server_unavailable'
  | 'unknown'

/**
 * 엣지 함수 호출 실패 → 코드. **서버 원문(message)은 절대 돌려주지 않는다** —
 * 원문에는 함수·테이블 이름이 섞일 수 있고, 화면은 코드만 보고 문장을 고른다.
 * supabase-js의 FunctionsFetchError(네트워크)·FunctionsRelayError(중계)·FunctionsHttpError(함수가 거절)를 name으로 가른다.
 */
export function deleteErrorCode(err: unknown): DeleteAccountError {
  const name = err && typeof err === 'object' && typeof (err as { name?: unknown }).name === 'string' ? (err as { name: string }).name : ''
  if (name === 'FunctionsFetchError' || name === 'TypeError' || name === 'AbortError') return 'network'
  if (name === 'FunctionsRelayError') return 'server_unavailable'
  if (name === 'FunctionsHttpError') return 'server_rejected'
  return 'unknown'
}

// ── 우편 일괄 수령 ─────────────────────────────────────────────────────────

export interface ClaimAllDeps {
  /** claim_all_mail — 미수령을 claimed로 바꾸고 'claimed && 미확정(undelivered)' 전액을 돌려준다. 실패는 null */
  claimAll: () => Promise<number | null>
  /** 시작 이후 로그아웃·계정 전환이 있었는가(getter 기반) */
  isStale: () => boolean
  addDiamonds: (n: number) => void
  /** confirm_mail_delivery(null) — 이 계정의 미확정분 전부 확정 */
  confirmAll: () => void
}

/**
 * 일괄 받기 — **claim_all_mail 1회**로 받는다.
 * ⚠️ 항목별 claim_mail 루프로 바꾸면 안 된다: my_mail은 claimed 원값을 그대로 주므로
 *    '받았지만 응답이 유실돼 확정 안 된(claimed && undelivered)' 우편은 화면에서 이미 '수령 완료'로 보여
 *    루프 대상에서 빠진다 → 그 다이아를 돌려받을 경로가 끊긴다. claim_all_mail은 그 미확정분까지 합쳐 돌려준다.
 * 순서: 받기 → (응답 대기 중 계정이 바뀌었으면 아무것도 더하지도 확정하지도 않고 끝 — 서버에 미확정으로 남아
 *       다음 '모두 받기'가 같은 금액을 다시 준다) → 로컬 가산 → 가산한 **뒤에만** 확정.
 */
export async function claimAllGuarded(d: ClaimAllDeps): Promise<{ status: 'stale' } | { status: 'fail' } | { status: 'ok'; total: number }> {
  const got = await d.claimAll()
  if (d.isStale()) return { status: 'stale' }
  if (got === null || !Number.isFinite(got)) return { status: 'fail' }
  const total = Math.max(0, got)
  if (total > 0) d.addDiamonds(total)
  d.confirmAll()
  return { status: 'ok', total }
}

// ── 초대 코드 서버 판정 → 화면 처리 ─────────────────────────────────────────

/**
 * redeem_referral 응답을 화면 처리로 바꾼다. 'local' = 로컬 보상 경로(redeemCode)를 타도 된다.
 *  · 'used'·'self'·'invalid' — 서버 확정 판정. 로컬 폴백 금지(자기 서버 코드 자가지급 구멍).
 *  · 'ok' — 서버 지급 완료. 로컬 반영(같은 멱등키 referral_redeem이라 서버 이중 지급 없음).
 *  · 'no_auth' — 비로그인. 서버 판정 대상이 아니므로 로컬 전용 동작.
 *  · 'unavailable'·모르는 응답·응답 대기 중 계정 변경 — 'blocked'. 서버가 확인하지 못한 보상은 주지 않는다
 *    (예전엔 여기서 로컬 +100P로 내려가, 이미 보상받은 계정도 장애 한 번에 다시 받았다).
 */
export function referralNextStep(sv: string, staleAccount: boolean): 'blocked' | 'used' | 'self' | 'invalid' | 'local' {
  if (staleAccount) return 'blocked'
  if (sv === 'used' || sv === 'self' || sv === 'invalid') return sv
  if (sv === 'ok' || sv === 'no_auth') return 'local'
  return 'blocked'
}

// ── 계정 보관본(전환 시 이전 계정 프로필) ─────────────────────────────────────

export const acctKey = (u: string) => `nuri-mind-acct-${u}`

/** 이번 방문 동안의 보관본 — 저장소에 못 써도 같은 탭 안에서 돌아오면 그대로 복원된다 */
const memoryVault = new Map<string, Record<string, unknown>>()

export type VaultSaveResult = 'full' | 'compact' | 'memory'

function trySetJson(kv: KV, k: string, v: unknown): boolean {
  try {
    return kv.setItem(k, JSON.stringify(v)) === true
  } catch {
    return false
  }
}

/**
 * 이전 계정 보관 — 실패를 조용히 넘기지 않는다.
 *  1) 메모리에 전체 보관(이번 방문 동안은 항상 완전 복원)
 *  2) 저장소에 전체 → 실패(용량 초과 등)면 유료 권리·보상 가드만 담은 축약본 → 그것도 실패면 'memory'
 * 호출부는 'full'이 아니면 사용자에게 알린다. 포인트는 다음 로그인 때 서버 원장으로 다시 맞춰지지만
 * 다이아·프리미엄은 서버 복원 경로가 없어서, 축약본은 그것을 최우선으로 담는다.
 * ⚠️ 저장소의 옛 보관본은 지우지 않는다 — 지우면 다음 방문에 그 계정의 유료 재화가 0으로 시작한다.
 */
export function vaultSave(kv: KV, uid: string, full: Record<string, unknown>, compact: Record<string, unknown>): VaultSaveResult {
  if (trySetJson(kv, acctKey(uid), full)) {
    // 저장소에 전체가 들어갔으면 메모리본은 버린다 — 메모리본은 읽을 때 저장소보다 우선하므로,
    // 남겨 두면 오래된 메모리본이 되살아나거나(다른 탭이 저장소를 갱신한 뒤) 엉뚱한 데이터가 이긴다.
    memoryVault.delete(uid)
    return 'full'
  }
  memoryVault.set(uid, full)
  if (trySetJson(kv, acctKey(uid), compact)) return 'compact'
  return 'memory'
}

/** 보관본 읽기 — 메모리본은 저장소에 전체를 못 쓴 경우에만 존재하고, 그때는 저장소본(축약·옛 본)보다 최신이다 */
export function vaultLoad(kv: KV, uid: string): Record<string, unknown> | null {
  const mem = memoryVault.get(uid)
  if (mem) return mem
  try {
    const raw = kv.getItem(acctKey(uid))
    if (!raw) return null
    const v = JSON.parse(raw) as unknown
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** 계정 삭제 — 메모리·저장소 양쪽에서 지운다 */
export function vaultDrop(kv: KV, uid: string): void {
  memoryVault.delete(uid)
  kv.removeItem(acctKey(uid))
}
