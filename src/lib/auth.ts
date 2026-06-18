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
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo } })
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}

export interface AuthUser {
  id: string
  nickname?: string
  avatarUrl?: string
}

/** 현재 로그인 사용자(없으면 null). */
export async function getAuthUser(): Promise<AuthUser | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  const u = data.user
  if (!u) return null
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>
  return {
    id: u.id,
    nickname: (meta.name as string) || (meta.nickname as string) || undefined,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || undefined,
  }
}

/** 로그인 상태 변화 구독. cleanup 함수 반환. */
export function onAuthChange(cb: (userId: string | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session?.user?.id ?? null))
  return () => data.subscription.unsubscribe()
}
