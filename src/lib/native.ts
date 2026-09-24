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
    if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return
    void completeOAuth(url).finally(() => void Browser.close().catch(() => {}))
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

/** 딥링크의 토큰(implicit: #access_token) 또는 코드(PKCE: ?code)로 세션을 만든다 */
async function completeOAuth(url: string): Promise<void> {
  if (!supabase) return
  const u = new URL(url)
  const hash = new URLSearchParams(u.hash.replace(/^#/, ''))
  const access_token = hash.get('access_token')
  const refresh_token = hash.get('refresh_token')
  if (access_token && refresh_token) {
    await supabase.auth.setSession({ access_token, refresh_token })
    return
  }
  const code = u.searchParams.get('code')
  if (code) await supabase.auth.exchangeCodeForSession(code)
}

/** 네이티브 앱에서 OAuth 시작 — 인증 URL을 외부 브라우저로 연다(WebView 안 로그인은 카카오·구글 정책상 막힌다) */
export async function openOAuthInBrowser(url: string): Promise<void> {
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url, presentationStyle: 'popover' })
}
