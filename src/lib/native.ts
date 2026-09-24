/**
 * 스토어 앱(Capacitor) 전용 초기화 — main.tsx가 isNativeApp()일 때만 동적 import 한다.
 * 웹 방문자의 메인 번들에는 이 파일도, @capacitor/* 플러그인도 실리지 않는다(platform.ts 참고).
 *
 *  · 안드로이드 하드웨어 뒤로가기: 열린 오버레이/이전 화면이 있으면 history.back(), 없으면 앱 종료
 *  · OAuth 복귀: 카카오 로그인은 외부 브라우저(@capacitor/browser)에서 하고
 *    kr.nuri.mind://auth-callback#access_token=… 딥링크로 돌아온다 → 세션을 심고 브라우저를 닫는다
 *  · 상태바·스플래시
 */
import { NATIVE_AUTH_CALLBACK } from './platform'
import { openLayerCount } from './backstack'
import { supabase } from './supabase'

let started = false

export async function initNative(): Promise<void> {
  if (started) return
  started = true
  const [{ App }, { Browser }] = await Promise.all([import('@capacitor/app'), import('@capacitor/browser')])

  void App.addListener('backButton', ({ canGoBack }) => {
    if (openLayerCount() > 0 || canGoBack) window.history.back()
    else void App.exitApp()
  })

  void App.addListener('appUrlOpen', ({ url }) => {
    if (!isAuthCallback(url)) return
    void completeOAuth(url)
      .catch(() => alert('로그인을 마치지 못했어요. 다시 시도해 주세요.'))
      .finally(() => void Browser.close().catch(() => {}))
  })

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
  } catch {
    /* 상태바 플러그인이 없는 플랫폼 */
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    /* ignore */
  }
}

/**
 * 이 앱이 방금 로그인을 시작했는가 — 외부 웹페이지·앱이 딥링크를 열어 '남의 세션'을 심는 것(로그인 CSRF)을 막는다.
 * 메모리에만 둔다: 앱이 죽었다 살아나면 로그인을 다시 시작하면 된다.
 */
let pendingSince = 0
const PENDING_MS = 10 * 60_000

function isAuthCallback(url: string): boolean {
  try {
    const u = new URL(url)
    const want = new URL(NATIVE_AUTH_CALLBACK)
    return u.protocol === want.protocol && u.host === want.host
  } catch {
    return false
  }
}

/**
 * PKCE 코드로만 세션을 만든다(supabase.ts가 앱에서 flowType 'pkce').
 * URL 조각에 토큰을 실어 오는 implicit 콜백은 받지 않는다 — 누구나 만들 수 있는 링크라서.
 */
async function completeOAuth(url: string): Promise<void> {
  if (!supabase) return
  if (!pendingSince || Date.now() - pendingSince > PENDING_MS) return // 우리가 시작하지 않은 로그인
  pendingSince = 0
  const code = new URL(url).searchParams.get('code')
  if (!code) throw new Error('no_code')
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) throw error
}

/** 네이티브 앱에서 OAuth 시작 — 인증 URL을 외부 브라우저로 연다(WebView 안 로그인은 카카오·구글 정책상 막힌다) */
export async function openOAuthInBrowser(url: string): Promise<void> {
  pendingSince = Date.now()
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url, presentationStyle: 'popover' })
}
