/**
 * 초대(레퍼럴) 서버 검증 — supabase/referrals.sql 의 RPC 호출.
 *  계정(카카오 auth uid)당 1회만 초대 보상 → localStorage 초기화 파밍 차단.
 *  미배포/비로그인이면 'unavailable'/'no_auth'를 반환하고 호출부가 로컬 동작으로 폴백.
 */
import { supabase } from './supabase'

export function referralReady(): boolean {
  return supabase !== null
}

export type ReferralResult = 'ok' | 'used' | 'self' | 'no_auth' | 'invalid' | 'unavailable'

/** 피초대자 코드 1회 등록(서버). RPC 미배포·오류 시 'unavailable'. */
export async function redeemReferralServer(code: string): Promise<ReferralResult> {
  if (!supabase) return 'unavailable'
  try {
    const { data, error } = await supabase.rpc('redeem_referral', { p_code: code })
    if (error) return 'unavailable'
    return ((data as ReferralResult) ?? 'unavailable')
  } catch {
    return 'unavailable'
  }
}

/** 내 서버 초대코드(profiles.referral_code) 조회·생성. 코드→uid 매핑의 기준 = 인바이터 보상이 꽂히는 코드.
 *  비로그인(auth.uid 없음)·미배포·오류 시 null → 호출부가 로컬 코드로 폴백. */
export async function ensureReferralCodeServer(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('ensure_my_referral_code')
    if (error || typeof data !== 'string' || !data) return null
    return data
  } catch {
    return null
  }
}

/** 인바이터: 내 코드로 가입한 인원 수(서버). 실패 시 null. */
export async function referralCountServer(code: string): Promise<number | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('referral_count', { p_code: code })
    if (error || typeof data !== 'number') return null
    return data
  } catch {
    return null
  }
}
