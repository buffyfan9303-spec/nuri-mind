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

export function authReady(): boolean {
  return supabase !== null
}

/** 카카오 OAuth 로그인 시작(리다이렉트). 성공 시 카카오 동의화면으로 이동. */
export async function signInWithKakao(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'supabase_not_configured' }
  // 로그인 후 '지금 있던 페이지'로 복귀(예: 우편함). Supabase Redirect URLs에 `https://www.nurimind.co.kr/**` 와일드카드 등록 필요.
  // query·hash까지 보존 — 공유 링크(?s=, /vs 결과 등)로 들어온 사용자가 로그인 왕복에서 맥락을 잃지 않게.
  const redirectTo =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname + window.location.search + window.location.hash
      : undefined
  // 닉네임만 요청 — account_email은 카카오 동의항목 미설정 시 KOE205 발생(이메일은 비즈앱 검수 필요).
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo, scopes: 'profile_nickname' },
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

/** 로그아웃 — 서버 로그아웃 실패(오프라인·5xx) 시에도 로컬 세션은 반드시 제거(공유 기기 보안). */
export async function signOut(): Promise<{ ok: boolean }> {
  if (!supabase) return { ok: true }
  const { error } = await supabase.auth.signOut()
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

/** 로그인 상태 변화 구독. cleanup 함수 반환. */
export function onAuthChange(cb: (userId: string | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session?.user?.id ?? null))
  return () => data.subscription.unsubscribe()
}
