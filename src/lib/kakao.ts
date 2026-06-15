/**
 * 카카오톡 공유 — 한국 1위 공유 채널.
 * VITE_KAKAO_KEY(카카오 JavaScript 키) 설정 시에만 동작. 미설정이면 no-op.
 *   카카오 developers.kakao.com → 내 앱 → 앱 키 → JavaScript 키
 *   + 플랫폼 > Web 사이트 도메인에 https://www.nurimind.co.kr 등록 필요.
 */
// JavaScript 키만 사용(클라이언트 공개 안전). REST/네이티브/어드민 키는 절대 클라에 넣지 말 것.
const KAKAO_KEY = (import.meta.env.VITE_KAKAO_KEY as string | undefined) || '29ca4adfadc69f6b9580cec0edb033dc'

declare global {
  interface Window {
    Kakao?: {
      isInitialized?: () => boolean
      init: (k: string) => void
      Share: { sendDefault: (o: unknown) => void }
    }
  }
}

export function kakaoEnabled(): boolean {
  return Boolean(KAKAO_KEY)
}

/** 카카오 JS SDK 주입 + init (main.tsx 시작 시 1회) */
export function loadKakao(): void {
  if (!kakaoEnabled() || typeof document === 'undefined') return
  if (document.getElementById('kakao-sdk')) return
  const s = document.createElement('script')
  s.id = 'kakao-sdk'
  s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
  s.crossOrigin = 'anonymous'
  s.onload = () => {
    try {
      if (window.Kakao && !window.Kakao.isInitialized?.()) window.Kakao.init(KAKAO_KEY!)
    } catch {
      /* noop */
    }
  }
  document.head.appendChild(s)
}

/** 결과 카드형 공유. 성공 시 true, SDK 미준비면 false(호출부가 폴백). */
export function shareKakao(opts: { title: string; description: string; link: string; imageUrl?: string }): boolean {
  const K = window.Kakao
  if (!K || !K.isInitialized?.()) return false
  try {
    K.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: opts.title,
        description: opts.description,
        imageUrl: opts.imageUrl || 'https://www.nurimind.co.kr/og.svg',
        link: { mobileWebUrl: opts.link, webUrl: opts.link },
      },
      buttons: [{ title: '나도 검사하기 🧠', link: { mobileWebUrl: opts.link, webUrl: opts.link } }],
    })
    return true
  } catch {
    return false
  }
}
