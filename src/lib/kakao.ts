/**
 * 카카오톡 공유 — 한국 1위 공유 채널.
 * VITE_KAKAO_KEY(카카오 JavaScript 키) 설정 시에만 동작. 미설정이면 no-op.
 *   카카오 developers.kakao.com → 내 앱 → 앱 키 → JavaScript 키
 *   + 플랫폼 > Web 사이트 도메인에 https://www.nurimind.co.kr 등록 필요.
 */
// JavaScript 키만 사용(클라이언트 공개 안전). REST/네이티브/어드민 키는 절대 클라에 넣지 말 것.
// env에 플레이스홀더(XXXX)가 들어가도 무시하고 진짜 키 사용.
const _kk = import.meta.env.VITE_KAKAO_KEY as string | undefined
const KAKAO_KEY = _kk && !/[Xx]{3,}/.test(_kk) ? _kk : '29ca4adfadc69f6b9580cec0edb033dc'

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

/**
 * 카카오 JS SDK 주입 + init — 공유 버튼이 화면에 나타날 때(버튼의 ref 콜백) 한 번.
 * 예전엔 main.tsx가 모든 페이지 로드마다 받아 공유를 안 하는 방문자도 SDK를 내려받았다.
 * 클릭 때가 아니라 버튼이 보일 때 미리 받는 이유: 클릭 뒤에 받으면 sendDefault가 사용자 제스처 밖에서 불려
 * iOS·일부 브라우저가 공유 창을 막는다. 아직 준비 전에 누르면 호출부가 텍스트 공유로 폴백한다.
 * (카카오 '로그인'은 Supabase OAuth 리다이렉트라 이 SDK와 무관하다 — lib/auth signInWithKakao)
 */
export function loadKakao(): void {
  if (!kakaoEnabled() || typeof document === 'undefined') return
  if (document.getElementById('kakao-sdk')) return
  const s = document.createElement('script')
  s.id = 'kakao-sdk'
  s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
  s.crossOrigin = 'anonymous'
  // 받기 실패(오프라인·차단)면 태그를 지워 다음에 버튼이 보일 때 다시 시도하게 한다
  s.onerror = () => s.remove()
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
  if (!K || !K.isInitialized?.()) {
    loadKakao() // 미리 받기가 실패했으면 다음 탭을 위해 다시 받아 둔다(이번 탭은 호출부 폴백)
    return false
  }
  try {
    K.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: opts.title,
        description: opts.description,
        imageUrl: opts.imageUrl || 'https://www.nurimind.co.kr/og.jpg',
        link: { mobileWebUrl: opts.link, webUrl: opts.link },
      },
      buttons: [{ title: '나도 검사하기 🧠', link: { mobileWebUrl: opts.link, webUrl: opts.link } }],
    })
    return true
  } catch {
    return false
  }
}
