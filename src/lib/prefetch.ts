/**
 * 탭을 누르는 순간 그 화면의 코드를 미리 받아온다.
 *
 * 왜 필요한가: 라우트 전환이 AnimatePresence mode="wait"라 **이전 화면이 다 사라진 뒤에야**
 * 새 화면이 마운트된다. 청크 요청은 그때 시작하므로 처음 가는 탭은 항상 exit 애니메이션(140ms)만큼
 * 늦게 뜬다. 손가락이 닿는 순간(pointerdown) 요청을 걸면 그 140ms가 통신 시간으로 쓰인다.
 *
 * 대상은 하단 내비 4개뿐이다 — 다음에 갈 확률이 가장 높고, 그 이상 미리 받으면
 * 한 번도 안 볼 화면까지 데이터를 쓰게 된다. 홈은 정적 import라 애초에 청크가 없다.
 *
 * import 경로가 App.tsx와 겹치지만 Vite가 같은 청크로 합치므로 두 번 받지 않는다.
 * 페이지를 옮기면 여기서도 타입 에러가 나 조용히 깨지지 않는다.
 */
const MAP: Record<string, () => Promise<unknown>> = {
  '/rewards': () => import('../pages/Rewards'),
  '/community': () => import('../pages/Community'),
  '/shop': () => import('../pages/Shop'),
  '/profile': () => import('../pages/Profile'),
}

const started = new Set<string>()

export function prefetchRoute(path: string): void {
  if (started.has(path)) return
  const load = MAP[path]
  if (!load) return
  started.add(path)
  // 실패는 삼킨다 — 미리 받기가 안 됐다고 알릴 일은 없다. 실제 이동 때 lazyWithReload가 처리한다.
  void load().catch(() => started.delete(path))
}
