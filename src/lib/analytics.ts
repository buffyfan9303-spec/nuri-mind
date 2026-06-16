/**
 * 분석 — GA4(Google Analytics 4). VITE_GA_ID(G-XXXXXXX) 설정 시에만 동작.
 * 미설정이면 모든 함수 no-op → 앱 영향 없음.
 *   Vercel/.env 에 VITE_GA_ID=G-XXXXXXXXXX 넣으면 켜짐.
 */
// 공개 측정 ID — 진짜 값 박음. env에 플레이스홀더(XXXX)가 들어가도 무시.
const _ga = import.meta.env.VITE_GA_ID as string | undefined
export const GA_ID = _ga && !/[Xx]{3,}/.test(_ga) ? _ga : 'G-5E3GP1D9K7'

/** localhost/프리뷰에선 비활성 — 개발 트래픽이 GA를 더럽히지 않도록 */
export function analyticsEnabled(): boolean {
  if (!GA_ID) return false
  if (typeof location === 'undefined') return false
  const h = location.hostname
  return h !== 'localhost' && h !== '127.0.0.1' && !h.endsWith('.local')
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** GA4 스크립트 주입 (main.tsx 시작 시 1회). SPA라 page_view는 수동 전송. */
export function loadAnalytics(): void {
  if (!analyticsEnabled() || typeof document === 'undefined') return
  if (document.getElementById('ga4-js')) return
  const s = document.createElement('script')
  s.id = 'ga4-js'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = (...args: unknown[]) => {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

/** SPA 라우트 변경 시 페이지뷰 */
export function pageView(path: string): void {
  if (!analyticsEnabled()) return
  try {
    window.gtag?.('event', 'page_view', { page_path: path, page_location: location.href })
  } catch {
    /* noop */
  }
}

/** 핵심 전환 이벤트 (검사완료·공유·적립·교환 등) */
export function track(event: string, params?: Record<string, unknown>): void {
  if (!analyticsEnabled()) return
  try {
    window.gtag?.('event', event, params)
  } catch {
    /* noop */
  }
}
