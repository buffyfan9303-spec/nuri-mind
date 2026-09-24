import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isNativeApp } from './platform'

/**
 * Supabase 클라이언트 — 백엔드 연동 단일 진입점.
 *
 * 프로젝트 ref: xdcglyavndiwbbaryocx (region: ap-northeast-1 / Tokyo)
 * URL은 ref로 자동 구성. anon(publishable) 키만 .env에 넣으면 활성화됩니다:
 *   VITE_SUPABASE_URL=https://xdcglyavndiwbbaryocx.supabase.co   (생략 시 ref로 자동)
 *   VITE_SUPABASE_ANON_KEY=eyJ...   ← Supabase 대시보드 > Settings > API > Project API keys (anon public)
 *
 * 키가 없으면 supabase = null 이며, 앱은 기존처럼 localStorage로 동작합니다(오프라인 우선).
 */
const PROJECT_REF = 'xdcglyavndiwbbaryocx'

const url = import.meta.env.VITE_SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  anonKey && anonKey.length > 20
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // 앱(Capacitor)은 커스텀 스킴 딥링크로 돌아온다 — implicit이면 토큰이 URL에 실려 같은 스킴을 등록한
          // 다른 앱이 가로챌 수 있다. PKCE는 code만 오고, 교환에 이 WebView에만 있는 verifier가 필요하다.
          // 웹은 기존 흐름(implicit) 유지 — 운영 로그인 동작을 이번 변경으로 흔들지 않는다.
          flowType: isNativeApp() ? 'pkce' : 'implicit',
        },
      })
    : null

export function supabaseReady(): boolean {
  return supabase !== null
}

/** Edge Functions 베이스 URL + anon 키 — 키 없으면 빈 값(클라가 정적 폴백). */
export const FUNCTIONS_URL: string = anonKey && anonKey.length > 20 ? `${url}/functions/v1` : ''
export const ANON_KEY: string = anonKey && anonKey.length > 20 ? anonKey : ''
