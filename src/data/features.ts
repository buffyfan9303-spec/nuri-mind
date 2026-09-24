/**
 * 기능 스위치 — 운영 상황에 따라 켜고 끄는 기능을 한곳에 모은다.
 */

/**
 * 리워드 설문(참여·만들기). 지금은 운영 중인 설문이 없어 꺼 둔다(2026-09).
 * false면: 상단 띠·홈 설문 카드·리워드 설문 목록·'설문 만들기'가 '준비 중'으로 바뀌고,
 * /rewards/survey/:id · /rewards/create 는 준비 중 화면을 보여 준다. 되살릴 땐 true 한 줄이면 된다.
 * (관리자 화면의 설문 승인 탭은 운영 도구라 그대로 둔다.)
 */
export const SURVEYS_ENABLED = false

/**
 * 유료 결제(다이아 충전·프리미엄 구독). 2026-09 현재 결제 수단이 연동되지 않아 꺼 둔다.
 *
 * 예전엔 '베타 즉시 지급'으로 유료 재화를 공짜로 줬다. 이 상태로는
 *  - 스토어 심사: 가격을 보여 주고 결제 없이 지급 → 결제 정책/오해 소지(Google Play 결제 정책·Apple 3.1.1)
 *  - 운영: 유료 재화가 무한 발행돼 경제가 무너진다
 * false면: 충전·구독 화면이 '결제 준비 중'으로 바뀌고 어떤 버튼도 재화를 만들지 않는다.
 * 이미 받은 다이아·진행 중인 프리미엄 기간은 그대로 둔다(사용자 자산을 소급해 빼앗지 않는다).
 *
 * 켤 때: 웹은 PG(카카오페이·토스 등), 앱(Capacitor)은 반드시 스토어 결제(src/lib/billing.ts)만 탄다.
 * 서버 영수증 검증(엣지 함수)이 붙기 전에는 true로 바꾸지 말 것 — docs/BILLING.md 참고.
 */
export const PAYMENTS_ENABLED = false

/**
 * Sign in with Apple(Apple 심사 지침 4.8). 카카오 같은 제3자 로그인을 iOS 앱에서 제공하면
 * 이메일 비공개가 가능한 동등한 로그인(=Apple 로그인)을 함께 내야 한다.
 * Supabase 대시보드에서 Apple provider를 켜고(docs/STORE.md) iOS 빌드를 낼 때 true로 바꾼다.
 * false면 버튼이 아예 그려지지 않는다.
 */
export const APPLE_SIGNIN_ENABLED = false
