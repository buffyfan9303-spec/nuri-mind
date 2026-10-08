/**
 * 화면 전용 재화 판정(우편함 '모두 받기'·초대 코드) — econCore에서 분리했다.
 * econCore는 store·economy가 쓰므로 메인 번들에 실린다. 이 두 판정은 지연 로드 화면(Mailbox·Invite)만 쓰므로
 * 따로 두어 메인 번들에 끌려오지 않게 한다(번들 예산). import 없는 파일 — scripts/econ-check.mjs가 직접 불러 검사한다.
 */

export interface ClaimAllDeps {
  /** claim_all_mail — 미수령을 claimed로 바꾸고 'claimed && 미확정(undelivered)' 전액을 돌려준다. 실패는 null */
  claimAll: () => Promise<number | null>
  /** 시작 이후 로그아웃·계정 전환이 있었는가(getter 기반) */
  isStale: () => boolean
  addDiamonds: (n: number) => void
  /** confirm_mail_delivery(null) — 이 계정의 미확정분 전부 확정 */
  confirmAll: () => void
}

/**
 * 일괄 받기 — **claim_all_mail 1회**로 받는다.
 * ⚠️ 항목별 claim_mail 루프로 바꾸면 안 된다: my_mail은 claimed 원값을 그대로 주므로
 *    '받았지만 응답이 유실돼 확정 안 된(claimed && undelivered)' 우편은 화면에서 이미 '수령 완료'로 보여
 *    루프 대상에서 빠진다 → 그 다이아를 돌려받을 경로가 끊긴다. claim_all_mail은 그 미확정분까지 합쳐 돌려준다.
 * 순서: 받기 → (응답 대기 중 계정이 바뀌었으면 아무것도 더하지도 확정하지도 않고 끝 — 서버에 미확정으로 남아
 *       다음 '모두 받기'가 같은 금액을 다시 준다) → 로컬 가산 → 가산한 **뒤에만** 확정.
 */
export async function claimAllGuarded(d: ClaimAllDeps): Promise<{ status: 'stale' } | { status: 'fail' } | { status: 'ok'; total: number }> {
  const got = await d.claimAll()
  if (d.isStale()) return { status: 'stale' }
  if (got === null || !Number.isFinite(got)) return { status: 'fail' }
  const total = Math.max(0, got)
  if (total > 0) d.addDiamonds(total)
  d.confirmAll()
  return { status: 'ok', total }
}

// ── 초대 코드 서버 판정 → 화면 처리 ─────────────────────────────────────────

/**
 * redeem_referral 응답을 화면 처리로 바꾼다. 'local' = 로컬 보상 경로(redeemCode)를 타도 된다.
 *  · 'used'·'self'·'invalid' — 서버 확정 판정. 로컬 폴백 금지(자기 서버 코드 자가지급 구멍).
 *  · 'ok' — 서버 지급 완료. 로컬 반영(같은 멱등키 referral_redeem이라 서버 이중 지급 없음).
 *  · 'no_auth' — 비로그인. 서버 판정 대상이 아니므로 로컬 전용 동작.
 *  · 'unavailable'·모르는 응답·응답 대기 중 계정 변경 — 'blocked'. 서버가 확인하지 못한 보상은 주지 않는다
 *    (예전엔 여기서 로컬 +100P로 내려가, 이미 보상받은 계정도 장애 한 번에 다시 받았다).
 */
export function referralNextStep(sv: string, staleAccount: boolean): 'blocked' | 'used' | 'self' | 'invalid' | 'local' {
  if (staleAccount) return 'blocked'
  if (sv === 'used' || sv === 'self' || sv === 'invalid') return sv
  if (sv === 'ok' || sv === 'no_auth') return 'local'
  return 'blocked'
}
