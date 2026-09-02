import { lazy, type ComponentType } from 'react'

/**
 * 코드 분할 청크 로드 실패를 1회 새로고침으로 복구한다 — 홀덤 캘린더에서 이식.
 *
 * 왜 필요한가: 라우트 38개가 전부 lazy이고 청크 파일명에 해시가 붙는다. 재배포 뒤 옛 index.html을
 * 든 탭(어제 켜둔 PWA)이 라우트를 옮기면 존재하지 않는 해시의 청크를 요청해 404 → import 거부 →
 * 화면이 통째로 빈다. 오늘만 번들 구성을 두 번 바꿨으니 배포마다 이 창이 열린다.
 *
 * 복구 규칙: 실패 시 sessionStorage에 시각을 남기고 reload 1회. 10초 안에 또 실패하면(진짜 장애)
 * 루프 대신 throw → ErrorBoundary가 받는다. reload 중에는 영원히 pending인 Promise를 돌려
 * 컴포넌트가 마운트되지 않게 한다.
 */
const KEY = 'nuri-mind-chunk-reload-at'
const RETRY_WINDOW_MS = 10_000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithReload<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (err) {
      let last = 0
      try {
        last = Number(sessionStorage.getItem(KEY) || 0)
      } catch {
        /* 저장소 불가 — 재시도 판단 없이 1회 reload */
      }
      const now = Date.now()
      if (now - last > RETRY_WINDOW_MS) {
        try {
          sessionStorage.setItem(KEY, String(now))
        } catch {
          /* ignore */
        }
        window.location.reload()
        return await new Promise<{ default: T }>(() => {})
      }
      throw err
    }
  })
}
