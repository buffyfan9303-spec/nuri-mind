/**
 * 우편함(Mailbox) — supabase/mailbox.sql 의 RPC 호출.
 *   국내 게임 방식: 운영자 지급/시스템/개인우편/유료결제가 우편함에 적재 → '받기'(수령)로 첨부 재화 가산.
 *   청약철회: 유료결제(purchase)는 '미수령'일 때만 환불 가능 — '받기'(수령) 후엔 불가.
 */
import { supabase } from './supabase'

export interface MailItem {
  id: number
  kind: 'grant' | 'purchase' | 'system' | 'personal' | string
  title: string
  body: string | null
  sender: string
  amount: number
  points: number
  claimed: boolean
  refundable: boolean
  at: string
}

export async function fetchMail(): Promise<MailItem[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.rpc('my_mail')
    if (error || !Array.isArray(data)) return []
    return data as MailItem[]
  } catch {
    return []
  }
}

/** 우편 1건 받기 → 첨부 다이아 수. */
export async function claimMail(id: number): Promise<number> {
  if (!supabase) return 0
  try {
    const { data, error } = await supabase.rpc('claim_mail', { p_id: id })
    if (error || typeof data !== 'number') return 0
    return data
  } catch {
    return 0
  }
}

/** 미수령 일괄 받기 → 받은 다이아 합계. */
export async function claimAllMail(): Promise<number> {
  if (!supabase) return 0
  try {
    const { data, error } = await supabase.rpc('claim_all_mail')
    if (error || typeof data !== 'number') return 0
    return data
  } catch {
    return 0
  }
}

/** 청약철회(환불 요청) — 미수령 유료결제만. 반환: 'refunded'·'already_claimed'·'not_refundable'·'not_found'·'unavailable' */
export async function cancelPurchase(id: number): Promise<string> {
  if (!supabase) return 'unavailable'
  try {
    const { data, error } = await supabase.rpc('cancel_purchase', { p_id: id })
    if (error) return 'unavailable'
    return (data as string) ?? 'unavailable'
  } catch {
    return 'unavailable'
  }
}
