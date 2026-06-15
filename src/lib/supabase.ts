import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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
    ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
    : null

export function supabaseReady(): boolean {
  return supabase !== null
}
