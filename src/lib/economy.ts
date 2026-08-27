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
 *
 * 비로그인·미설정 시 전부 no-op — 앱은 기존 localStorage 단독으로 동작.
 * ⚠️ 적립은 p_is_free=false(일일 무료 상한은 제품 정책상 제거됨). 차감은 mirror_spend RPC
 *    (supabase/economy-sync.sql — 배포 필수. 미배포 시 차감 이벤트는 아웃박스에 대기하고
 *    새 기기 복원도 보류됨 — 소비 미반영 잔액을 복원하는 사고 방지).
 */
import { supabase } from './supabase'
import { onAuthChange } from './auth'

const OUTBOX_KEY = 'nuri-mind-econ-outbox-v1'
/** 이 기기가 마지막으로 동기화를 완료한 계정 uid — 첫 동기화/계정 전환 판별 */
const SYNC_UID_KEY = 'nuri-mind-econ-sync-uid'
const MAX_OUTBOX = 300
/** 서버 grant_points/mirror_spend의 건당 상한과 일치 */
const MAX_AMOUNT = 100000

interface OutboxEntry {
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

let currentUid: string | null = null
let flushing = false
let syncing = false
/** mirror_spend 미배포(PGRST202) 감지 — 이번 세션 재시도만 중단(아웃박스에는 유지) */
let spendRpcMissing = false
/** initEconomySync가 등록한 훅 — enqueue 등 모든 트리거가 syncAccount로 수렴하기 위한 참조 */
let hooksRef: SyncHooks | null = null

const uniq = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
const evtKey = () => 'evt:' + uniq()

function loadOutbox(): OutboxEntry[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY)
    const list = raw ? (JSON.parse(raw) as OutboxEntry[]) : []
    if (!Array.isArray(list)) return []
    // 구버전 항목(id 없음) 호환 — k를 id로 승계
    return list.map((x) => (x.id ? x : { ...x, id: x.k }))
  } catch {
    return []
  }
}
function saveOutbox(list: OutboxEntry[]): void {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(list.slice(-MAX_OUTBOX)))
  } catch {
    /* 저장소 불가 — 미러 포기(로컬 동작엔 영향 없음) */
  }
}

async function sessionUid(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
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

async function sendEarn(amount: number, memo: string, key: string): Promise<boolean> {
  if (!supabase) return false
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

type SpendResult = 'ok' | 'fail' | 'defer'
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
 * 모든 변이는 localStorage를 다시 읽어 병합 — 전송 중 enqueue된 항목을 절대 덮어쓰지 않고,
 * 한 바퀴 배출 후 새로 들어온 항목까지 재확인(rerun 루프).
 * 첫 동기화(마커) 전에는 전송하지 않음(force는 syncAccount 내부 전용).
 */
async function flushOutbox(force = false): Promise<boolean> {
  if (!supabase || flushing) return false
  flushing = true
  try {
    const uid = await sessionUid()
    if (!uid) return false
    if (!force && localStorage.getItem(SYNC_UID_KEY) !== uid) return false
    for (;;) {
      const eligible = loadOutbox().filter((x) => x.uid === uid || x.uid === null)
      if (eligible.length === 0) return true
      let progressed = false
      let deferred = 0
      for (const e of eligible) {
        if (e.uid === null) {
          // 이 기기 지갑을 현재 계정이 소유(클레임) — 저장소 재읽기 후 해당 항목만 갱신(id 매칭)
          saveOutbox(loadOutbox().map((x) => (x.id === e.id ? { ...x, uid } : x)))
        }
        if (e.kind === 'earn') {
          if (!(await sendEarn(e.amount, e.memo, e.k))) return false // 네트워크 실패 — 다음 기회에
        } else {
          const r = await sendSpend(e.amount, e.memo, e.k)
          if (r === 'fail') return false
          if (r === 'defer') {
            deferred++
            continue // RPC 미배포 — 항목 유지하고 다음으로
          }
        }
        saveOutbox(loadOutbox().filter((x) => x.id !== e.id))
        progressed = true
      }
      if (deferred > 0) return false // 차감 대기 잔존 — 완전 배출 아님
      if (!progressed) return true
      // 전송 도중 새 항목이 들어왔을 수 있음 → 한 바퀴 더
    }
  } finally {
    flushing = false
  }
}

function enqueue(kind: 'earn' | 'spend', amount: number, memo: string, key: string | null): void {
  const n = Math.round(amount)
  if (!supabase || n <= 0 || n > MAX_AMOUNT) return
  const entry: OutboxEntry = { id: uniq(), k: key ?? evtKey(), kind, amount: n, memo, uid: currentUid }
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

export interface SyncHooks {
  getWallet: () => { points: number }
  /** 새 기기 복원 — points = 서버잔액 + (현재 − 스냅샷) 으로 동기화 중 적립을 보존 */
  restoreTo: (serverPoints: number, snapshotPoints: number) => void
  /** 계정 전환 — 지갑을 지정 값으로 재설정(이전 계정 잔액 이관 금지) */
  resetWallet: (points: number, memo: string) => void
}

/**
 * 계정 동기화 — 모든 트리거가 이 함수로 수렴(멱등·재진입 가드).
 *  · 마커 == uid       → 아웃박스만 전송
 *  · 마커 없음 + 서버 원장 있음 → 복원: 아웃박스 완전 배출 확인 → 스냅샷 → 서버 잔액 → restoreTo
 *  · 마커 없음 + 서버 원장 없음 → 이관: 같은 tick에 아웃박스 폐기+스냅샷 → 'local_migration' 1회
 *  · 마커 ≠ uid(계정 전환)     → 이관 없이 서버 상태로 지갑 재설정
 * 실패(네트워크·부분 전송) 시 마커를 남기지 않고 반환 → 다음 트리거가 재시도(전부 멱등).
 */
async function syncAccount(hooks: SyncHooks): Promise<void> {
  if (syncing || !supabase) return
  syncing = true
  try {
    const uid = await sessionUid()
    if (!uid) return
    currentUid = uid
    const marker = localStorage.getItem(SYNC_UID_KEY)
    if (marker === uid) {
      await flushOutbox()
      return
    }

    const ledgerCount = await fetchServerLedgerCount()
    if (ledgerCount === null) return // 네트워크 실패 — 마커 미설정 상태로 다음 트리거에서 재시도

    if (marker && marker !== uid) {
      // 계정 전환: 이전 지갑(다른 사람 포인트일 수 있음)을 새 계정으로 이관하지 않음.
      // ⚠️ 다만 '이전 계정 소유(uid 태그)' 미전송 항목은 지갑을 덮어쓰기 전에 반드시 배출해야
      //    적립분이 로컬에서 영구 증발하지 않는다(force로 마커 불일치와 무관하게 전송).
      if (!(await flushOutbox(true))) return
      saveOutbox(loadOutbox().filter((e) => e.uid !== null)) // 이전 지갑의 비로그인 활동 폐기
      if (ledgerCount > 0) {
        const server = await fetchServerPoints()
        if (server === null) return
        hooks.resetWallet(server, '👤 계정 전환 — 서버 지갑으로 재설정')
      } else {
        // 새 지갑 시드 100P — 전송 성공을 확인한 뒤에만 지갑 재설정·마커 확정(실패 시 재시도)
        if (!(await sendEarn(100, '💾 로컬 지갑 이관', 'local_migration'))) return
        hooks.resetWallet(100, '👤 계정 전환 — 새 지갑 시작')
      }
      localStorage.setItem(SYNC_UID_KEY, uid)
      return
    }

    // 이 기기에서 이 계정 첫 동기화
    if (ledgerCount > 0) {
      // 기존 계정(재설치·새 기기) → 비로그인 활동을 전부 서버에 반영한 뒤 서버 잔액으로 복원.
      // 완전 배출이 아니면(네트워크 실패·차감 RPC 미배포) 복원 보류 — 부정확한 잔액 복원 방지.
      if (!(await flushOutbox(true))) return
      // 스냅샷은 flush "완료 후"에 — flush로 서버에 반영된 적립이 드리프트에 중복 계상되는 것 방지
      const snapshot = hooks.getWallet().points
      const server = await fetchServerPoints()
      if (server === null) return
      hooks.restoreTo(server, snapshot)
    } else {
      // 신규 계정 → 로컬 잔액 1회 이관. 아웃박스 폐기와 스냅샷을 같은 동기 tick에 수행 —
      // 현재 계정·비로그인 이벤트 금액은 전부 스냅샷에 포함돼 있으므로 폐기가 정확(이중 지급 차단).
      saveOutbox(loadOutbox().filter((e) => e.uid !== null && e.uid !== uid))
      const amt = Math.min(Math.max(hooks.getWallet().points, 0), MAX_AMOUNT)
      if (amt > 0 && !(await sendEarn(amt, '💾 로컬 지갑 이관', 'local_migration'))) return
    }
    localStorage.setItem(SYNC_UID_KEY, uid)
  } finally {
    syncing = false
  }
}

/** 동기화 초기화 — useStore 모듈 로드 시 1회 호출. */
export function initEconomySync(hooks: SyncHooks): void {
  if (typeof window === 'undefined' || !supabase) return
  hooksRef = hooks
  void supabase.auth.getSession().then(({ data }) => {
    currentUid = data.session?.user?.id ?? null
    if (currentUid) void syncAccount(hooks)
  })
  // ⚠️ setTimeout으로 콜백 밖에서 실행 — onAuthStateChange 안의 supabase 재호출은 교착 위험(supabase-js v2)
  // TOKEN_REFRESHED 등 모든 세션 이벤트에서 재시도 — 첫 동기화 실패 시에도 세션 내 재시도 확보
  // (마커==uid·아웃박스 빈 상태면 RPC 0회의 값싼 경로라 반복 호출 무해)
  onAuthChange((uid) => {
    currentUid = uid
    if (uid) setTimeout(() => void syncAccount(hooks), 0)
  })
  window.addEventListener('online', () => void syncAccount(hooks))
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void syncAccount(hooks)
  })
}
