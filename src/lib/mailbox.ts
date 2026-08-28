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
  expires_at: string | null
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

/** 우편 1건 받기 → 첨부 다이아 수. 실패(RPC 에러·오프라인·세션 만료)는 null — 0다이아 정상 수령과 구분. */
export async function claimMail(id: number): Promise<number | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('claim_mail', { p_id: id })
    if (error || typeof data !== 'number') return null
    return data
  } catch {
    return null
  }
}

/** 미수령 일괄 받기 → 받은 다이아 합계. 실패는 null. */
export async function claimAllMail(): Promise<number | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('claim_all_mail')
    if (error || typeof data !== 'number') return null
    return data
  } catch {
    return null
  }
}

/** 안 받은 우편 개수(홈 배지용). 비로그인/미배포면 0. */
export async function unreadMailCount(): Promise<number> {
  const m = await fetchMail()
  return m.filter((x) => !x.claimed).length
}

/** 운영자: 닉네임으로 다이아 지급. 반환 'ok'·'no_user'·'unavailable'(권한없음/오류) */
export async function grantDiamondsNick(nick: string, amount: number): Promise<string> {
  if (!supabase) return 'unavailable'
  try {
    const { data, error } = await supabase.rpc('grant_diamonds_nick', { p_nick: nick, p_amount: amount })
    if (error) return 'unavailable'
    return (data as string) ?? 'unavailable'
  } catch {
    return 'unavailable'
  }
}

/** 운영자: 닉네임으로 개인 우편 발송. 반환 'ok'·'no_user'·'unavailable' */
export async function sendMailNick(nick: string, title: string, body: string, dia: number): Promise<string> {
  if (!supabase) return 'unavailable'
  try {
    const { data, error } = await supabase.rpc('send_mail_nick', { p_nick: nick, p_title: title, p_body: body, p_dia: dia })
    if (error) return 'unavailable'
    return (data as string) ?? 'unavailable'
  } catch {
    return 'unavailable'
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

/**
 * 수령 확정 — 클라가 로컬 잔액에 실제로 가산한 뒤 호출.
 * 이 호출 전까지 서버는 delivered=false로 남겨두므로, 응답이 유실돼 클라가 못 받은 경우
 * 다음 claim에서 같은 금액이 다시 반환된다(다이아 영구 소실 방지).
 * 실패해도 사용자에겐 이미 지급된 상태 — 다음 수령 때 서버가 자동 정리한다.
 */
export async function confirmMailDelivery(ids?: number[]): Promise<void> {
  if (!supabase) return
  try {
    await supabase.rpc('confirm_mail_delivery', { p_ids: ids ?? null })
  } catch {
    /* 무시 — 미확정으로 남아 다음 수령 시 복구된다 */
  }
}
