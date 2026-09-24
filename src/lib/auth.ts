/**
 * 카카오 로그인 (Supabase OAuth) — 서버 권위 포인트·경제의 기반.
 *
 * ⚠️ 비밀키(REST/Admin/Native)는 절대 클라이언트에 두지 않습니다.
 *    카카오 로그인은 Supabase 대시보드 > Authentication > Providers > Kakao 에
 *    REST API 키 + Client Secret 을 입력해 활성화합니다(서버 측). 이 파일엔 키가 없습니다.
 *
 * Provider 미설정 시 signInWithKakao()는 에러를 반환하고, 호출부가 안내 메시지를 보여줍니다.
 */
import { supabase } from './supabase'
import { isNativeApp, NATIVE_AUTH_CALLBACK } from './platform'

/**
 * 로그아웃 뒤 다음 카카오 로그인에서 계정을 다시 고르게 하는 표식.
 * ⚠️ 우리 세션을 지워도 카카오 쪽 로그인 세션(kauth.kakao.com 쿠키)은 브라우저에 남는다.
 *    그 상태로 authorize를 다시 부르면 카카오가 같은 계정으로 자동 로그인시켜, '로그아웃 → 다른 계정'이
 *    불가능했다. 표식이 있으면 prompt=login으로 카카오 로그인 화면을 강제로 띄운다(카카오 REST API 문서의 prompt 값).
 *    새 세션이 생기면(onAuthChange) 지운다 — 카카오 화면에서 취소하고 돌아와도 다음 시도에 여전히 적용되게.
 */
const REAUTH_KEY = 'nuri-mind-kakao-reauth'

export function clearKakaoReauth(): void {
  try {
    localStorage.removeItem(REAUTH_KEY)
  } catch {
    /* ignore */
  }
}

export function authReady(): boolean {
  return supabase !== null
}

/**
 * 카카오 OAuth 로그인 시작(리다이렉트). 성공 시 카카오 동의화면으로 이동.
 * chooseAccount: 카카오 로그인 화면을 반드시 띄워 다른 계정을 고를 수 있게 한다(로그아웃 직후엔 자동 적용).
 */
export async function signInWithKakao(chooseAccount = false): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'supabase_not_configured' }
  // 로그인 후 '지금 있던 페이지'로 복귀(예: 우편함). Supabase Redirect URLs에 `https://www.nurimind.co.kr/**` 와일드카드 등록 필요.
  // query·hash까지 보존 — 공유 링크(?s=, /vs 결과 등)로 들어온 사용자가 로그인 왕복에서 맥락을 잃지 않게.
  const redirectTo =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname + window.location.search + window.location.hash
      : undefined
  // 닉네임만 요청 — account_email은 카카오 동의항목 미설정 시 KOE205 발생(이메일은 비즈앱 검수 필요).
  let reauth = chooseAccount
  try {
    reauth = reauth || localStorage.getItem(REAUTH_KEY) === '1'
  } catch {
    /* 저장소 불가 — 인자로 받은 값만 따른다 */
  }
  return oauth('kakao', 'profile_nickname', redirectTo, reauth ? { prompt: 'login' } : undefined)
}

/**
 * Sign in with Apple(Apple 심사 지침 4.8) — features.APPLE_SIGNIN_ENABLED일 때만 버튼이 보인다.
 * Supabase 대시보드 Apple provider 설정(Services ID·키) 전에는 에러를 돌려준다(docs/STORE.md).
 */
export async function signInWithApple(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'supabase_not_configured' }
  const redirectTo =
    typeof window !== 'undefined' ? window.location.origin + window.location.pathname + window.location.search : undefined
  return oauth('apple', 'name email', redirectTo)
}

async function oauth(
  provider: 'kakao' | 'apple',
  scopes: string,
  redirectTo: string | undefined,
  queryParams?: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'supabase_not_configured' }
  if (isNativeApp()) {
    // 앱: WebView 안에서 로그인 화면을 띄우지 않는다 — 외부 브라우저 → kr.nuri.mind://auth-callback 딥링크로 복귀(lib/native.ts)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: NATIVE_AUTH_CALLBACK, scopes, skipBrowserRedirect: true, queryParams },
    })
    if (error || !data.url) return { ok: false, error: error?.message ?? 'no_auth_url' }
    const { openOAuthInBrowser } = await import('./native')
    await openOAuthInBrowser(data.url)
    return { ok: true }
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, scopes, queryParams } })
  return error ? { ok: false, error: error.message } : { ok: true }
}

/** 로그아웃 — 서버 로그아웃 실패(오프라인·5xx) 시에도 로컬 세션은 반드시 제거(공유 기기 보안). */
export async function signOut(): Promise<{ ok: boolean }> {
  if (!supabase) return { ok: true }
  try {
    localStorage.setItem(REAUTH_KEY, '1')
  } catch {
    /* ignore */
  }
  let error: unknown = null
  try {
    error = (await supabase.auth.signOut()).error
  } catch (e) {
    // 네트워크 예외는 throw로도 온다 — 호출부의 leaveAccount가 건너뛰어지지 않게 여기서 흡수
    error = e
  }
  if (error) {
    // 네트워크 실패 등으로 서버 로그아웃이 안 되면 로컬 세션만이라도 제거 → UI와 실제 상태 일치
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      /* ignore */
    }
  }
  return { ok: !error }
}

export interface AuthUser {
  id: string
  nickname?: string
  avatarUrl?: string
}

const pickMeta = (id: string, meta: Record<string, unknown>): AuthUser => ({
  id,
  nickname: (meta.name as string) || (meta.nickname as string) || undefined,
  avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || undefined,
})

/**
 * 현재 로그인 사용자(없으면 null).
 *
 * ⚠️ 로그인 여부 판정은 로컬 세션(getSession)으로 한다. getUser()는 네트워크 호출이라
 *    지하철·비행기·일시 5xx에서 null을 돌려주고, 그러면 화면 3곳이 전부 '로그아웃'으로 렌더돼
 *    로그아웃 버튼조차 사라진다(실제로는 로그인 상태). getUser는 메타데이터 보강용 best-effort로만 쓴다.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  if (!supabase) return null
  const { data: sess } = await supabase.auth.getSession()
  const su = sess.session?.user
  if (!su) return null
  const local = pickMeta(su.id, (su.user_metadata ?? {}) as Record<string, unknown>)
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return local // 네트워크성 오류 — 세션 메타로 폴백(로그인 상태 유지)
    return pickMeta(data.user.id, (data.user.user_metadata ?? {}) as Record<string, unknown>)
  } catch {
    return local
  }
}

/**
 * 운영자인가 — 서버 profiles.is_admin(본인 행만 읽히는 RLS). 'no_login'이면 로그인이 먼저다.
 * 화면 잠금용일 뿐 권한 경계는 서버 RPC(send_mail_admin 등)의 is_admin 확인이다.
 */
export async function isServerAdmin(): Promise<'yes' | 'no' | 'no_login'> {
  if (!supabase) return 'no'
  const { data: sess } = await supabase.auth.getSession()
  const uid = sess.session?.user?.id
  if (!uid) return 'no_login'
  const { data, error } = await supabase.from('profiles').select('is_admin').eq('id', uid).maybeSingle()
  return !error && data?.is_admin === true ? 'yes' : 'no'
}

/** 로그인 상태 변화 구독. cleanup 함수 반환. */
export function onAuthChange(cb: (userId: string | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session?.user?.id ?? null))
  return () => data.subscription.unsubscribe()
}
