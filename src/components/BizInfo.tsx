import { COMPANY, COMPANY_LINE, CONTACT_EMAIL, CONTACT_PHONE, MAIL_ORDER_NO } from '../data/company'

/**
 * 사업자 정보 한 덩어리 — 푸터와 온보딩(가입 전 첫 화면)이 같은 표기를 쓴다.
 * 값은 data/company.ts 한 곳. 비어 있는 항목(문의·전화·통신판매업 신고번호)은 줄째 숨긴다 — 지어낸 값을 보이지 않게.
 */
export default function BizInfo({ className = '' }: { className?: string }) {
  const extra = [
    CONTACT_PHONE && `전화 ${CONTACT_PHONE}`,
    MAIL_ORDER_NO && `통신판매업 신고 ${MAIL_ORDER_NO}`,
  ].filter(Boolean)
  return (
    <p className={`text-[11px] font-medium leading-relaxed text-ink-faint ${className}`}>
      {COMPANY_LINE}
      <br />
      {COMPANY.address}
      {extra.length > 0 && (
        <>
          <br />
          {extra.join(' · ')}
        </>
      )}
      <br />
      {CONTACT_EMAIL ? `문의 ${CONTACT_EMAIL} · ` : ''}© {new Date().getFullYear()} NURI MIND
    </p>
  )
}
