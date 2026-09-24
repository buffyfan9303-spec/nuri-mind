# 결제 연동 계획

현재(2026-09-24): `PAYMENTS_ENABLED = false` — 충전·프리미엄 버튼은 '결제 준비 중', 어떤 경로도 재화를 만들지 않는다.
이미 받은 다이아·진행 중인 프리미엄 기간은 그대로 둔다.

## 켜기 전 조건 (하나라도 빠지면 켜지 않는다)

1. **경로 분리** — 웹은 PG(카카오페이·토스 등), 앱은 스토어 결제(Google Play Billing / StoreKit)만.
   앱 안에서 외부 결제로 유도하면 스토어 정책 위반 소지(정책 원문 재확인).
2. **서버 영수증 검증** — 결제 성공 콜백을 클라가 믿지 않는다. 엣지 함수가 PG/스토어 서버에 영수증을 검증한 뒤
   `diamond_grants`(우편함)로 지급한다. 클라의 `addDiamonds` 직접 호출 경로는 제거.
3. **멱등성** — 같은 영수증(주문번호) 재전송 시 두 번 지급하지 않도록 유니크 키.
4. **환불·청약철회** — 미사용 다이아 7일 내 철회(화면 문구와 약관 일치), 스토어 환불 알림(RTDN / App Store Server Notifications) 수신 시 회수.
5. **통신판매업 신고번호** 표시(`src/data/company.ts`), 약관 유료 조항 갱신.

## 코드 위치

- 스위치: `src/data/features.ts`
- 화면: `src/pages/Charge.tsx`, `src/pages/Premium.tsx`
- 스토어 가드: `useStore.subscribePremiumBeta`
- 새로 만들 것: `src/lib/billing.ts`(웹/앱 분기), 엣지 함수 `verify-purchase`
