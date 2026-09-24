/**
 * PWA — 서비스워커 등록 + '홈 화면에 설치' 프롬프트 관리.
 *  · SW는 라이브 도메인에서만 등록(localhost 개발/프리뷰는 캐시 혼란 방지로 비활성).
 *  · beforeinstallprompt를 가로채 두었다가, 유저가 버튼을 누를 때 promptInstall()로 띄움.
 */
interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BIPEvent | null = null
const listeners = new Set<(canInstall: boolean) => void>()
const emit = () => listeners.forEach((cb) => cb(!!deferred))

/** 서비스워커 등록 — 오프라인 + 설치 가능 조건 충족(라이브에서만). */
export function registerSW(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return
  // 배포로 새 SW가 제어권을 잡으면(=업데이트) 1회 자동 새로고침 → 최신 에셋 즉시 반영.
  // 최초 설치(controller 없음)에는 reload 안 함(불필요한 새로고침 방지).
  if (navigator.serviceWorker.controller) {
    let reloaded = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return
      // 검사 진행 중 강제 새로고침 금지 — 응답이 날아가는 최악의 순간. 다음 자연 내비게이션에서 적용됨.
      if (/\/run$/.test(window.location.pathname)) return
      reloaded = true
      window.location.reload()
    })
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

/** beforeinstallprompt/appinstalled 후킹 — main에서 1회 호출. */
export function initInstallPrompt(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BIPEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    emit()
  })
}

export function canInstall(): boolean {
  return !!deferred
}

/** 설치 가능 여부 변화 구독 — 컴포넌트에서 사용. 해제 함수 반환. */
export function onInstallable(cb: (canInstall: boolean) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** 네이티브 설치 프롬프트 표시. accepted면 true. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  // 이벤트는 1회용 — 먼저 떼어 낸다. 응답을 기다리는 동안 버튼을 한 번 더 누르면 같은 이벤트에
  // prompt()를 두 번 불러 InvalidStateError(미처리 거부)가 나고, deferred가 남아 버튼이 계속 실패했다.
  const d = deferred
  deferred = null
  emit()
  try {
    await d.prompt()
    const { outcome } = await d.userChoice
    return outcome === 'accepted'
  } catch {
    return false
  }
}
