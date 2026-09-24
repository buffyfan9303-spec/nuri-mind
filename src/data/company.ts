/**
 * 운영 주체(사업자) 정보 — 사업자등록증 기재 사항 그대로. 푸터·온보딩·소개 페이지·약관/개인정보처리방침이 이 한 곳을 본다.
 * ⚠️ 대표자 생년월일·등록증 발급번호는 게시하지 않는다(게시 의무 없음 + 개인정보).
 */
export const COMPANY = {
  name: '엔에이치홀딩스',
  ceo: '김윤혜',
  bizNo: '525-20-02937',
  address: '경기도 남양주시 진건읍 사릉로372번길 25, 201동 1403호',
  bizType: '정보통신업',
  bizItems: '컴퓨터 프로그래밍 서비스업, 포털 및 기타 인터넷 정보 매개 서비스업',
  openedAt: '2026-06-15',
  taxType: '간이과세자',
  serviceName: '누리 마인드',
  site: 'www.nurimind.co.kr',
} as const

/**
 * 문의 전자우편 — 비어 있으면 화면에서 문의 줄을 통째로 숨긴다.
 * TODO(운영자): 공개할 문의 주소를 여기 한 곳에 넣으면 푸터·온보딩·소개 페이지에 표시된다.
 */
export const CONTACT_EMAIL = 'buffyfan9303@gmail.com'

/**
 * 통신판매업 신고번호 — 다이아·프리미엄(유료 결제)을 파는 이상 전자상거래법 제12·13조에 따라 신고·표시 의무가 있다.
 * TODO(운영자): 신고 완료 후 번호를 넣으면 푸터·소개 페이지에 표시된다. 지어내서 채우지 말 것.
 */
export const MAIL_ORDER_NO = ''

/**
 * 대표 전화번호 — 전자상거래법상 사업자 신원 표시 항목이다. 자료가 없어 비워 둔다.
 * TODO(운영자): 번호가 정해지면 넣는다. 비어 있으면 표시하지 않는다.
 */
export const CONTACT_PHONE = ''

/** 한 줄 요약 — 푸터·온보딩처럼 좁은 자리용 */
export const COMPANY_LINE = `${COMPANY.name} · 대표 ${COMPANY.ceo} · 사업자등록번호 ${COMPANY.bizNo}`
