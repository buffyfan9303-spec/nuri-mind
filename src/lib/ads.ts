/**
 * 광고 추상화 레이어 — 수익 모델의 단일 진입점.
 *
 * 웹(현재): Google AdSense — .env에 VITE_ADSENSE_CLIENT 설정 시 활성화
 * APK(예정): Capacitor + AdMob — isNative() 분기에 전면/배너/보상형 연결
 *   - @capacitor-community/admob 설치 후 아래 TODO 지점에 구현
 */
export const ADSENSE_CLIENT: string | undefined = import.meta.env.VITE_ADSENSE_CLIENT
export const ADSENSE_SLOT_BANNER: string | undefined = import.meta.env.VITE_ADSENSE_SLOT_BANNER
export const ADSENSE_SLOT_RECT: string | undefined = import.meta.env.VITE_ADSENSE_SLOT_RECT

export function adsEnabled(): boolean {
  return Boolean(ADSENSE_CLIENT)
}

/**
 * AdSense 로더 스크립트를 <head>에 1회 주입.
 * VITE_ADSENSE_CLIENT 설정 시에만 동작 — index.html을 건드릴 필요 없이 env로 켜고 끔.
 * main.tsx 시작 시 호출.
 */
export function loadAdSenseScript(): void {
  if (!adsEnabled() || typeof document === 'undefined') return
  if (document.getElementById('adsbygoogle-js')) return
  const s = document.createElement('script')
  s.id = 'adsbygoogle-js'
  s.async = true
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
  s.crossOrigin = 'anonymous'
  document.head.appendChild(s)
}

export function isNative(): boolean {
  // TODO(APK): Capacitor.isNativePlatform() 으로 교체
  return false
}

/** 전면 광고 트리거 — 검사 완료 → 결과 사이 (AdGate 컴포넌트가 웹 폴백 처리) */
export async function showInterstitial(): Promise<void> {
  if (isNative()) {
    // TODO(APK): AdMob.showInterstitial()
  }
}

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function pushAd(): void {
  if (!adsEnabled()) return
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch {
    /* AdBlock 등 — 조용히 무시 */
  }
}
