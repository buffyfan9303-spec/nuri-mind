/**
 * 다이아 운영자 지급 수령 — supabase/diamonds.sql 의 RPC 호출.
 *   운영자가 서버에 적재한 다이아를 로그인 사용자가 1회 수령(서버 atomic claim) → 로컬 잔액에 가산.
 *   비로그인·미배포·오류 시 0 반환(폴백, 앱 동작엔 영향 없음).
 */
import { supabase } from './supabase'

/** 내게 온 미수령 다이아 지급분을 수령하고 그 합계를 반환. 없거나 비로그인이면 0. */
export async function claimDiamondGrantsServer(): Promise<number> {
  if (!supabase) return 0
  try {
    const { data, error } = await supabase.rpc('claim_my_diamond_grants')
    if (error || typeof data !== 'number') return 0
    return data
  } catch {
    return 0
  }
}
