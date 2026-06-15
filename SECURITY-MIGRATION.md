# 🔒 보안 점검 & 포인트 서버화 마이그레이션

## 1) 보안 감사 결과 (2026-06-15)

### ✅ 정상 (정직한 유저의 우발적 이중·중복 적립 → 이미 차단됨)
모든 적립 함수에 1회성 플래그 또는 일일 상한 가드가 있음:
| 적립 | 가드 |
|---|---|
| 가입 보너스 100P | 최초 1회(초기 ledger) |
| 검사 완료 30P | `rewardedTests`(검사별 1회) |
| 출석 | `lastCheckIn === today` |
| 설문 참여 | `takenSurveys` |
| 데일리 퀴즈 | `lastQuizDate` |
| 랜덤박스 | `lastSpinDate` + 일일 무료상한 50P |
| 결과 공유 | `sharedResults` |
| 첫 글/첫 댓글 | `firstPostDone`/`firstCommentDone` |
| 친구 코드 | `referredBy`(1회) |
| 바이브 | `vibeDone` |
| 무료 적립 전반 | `DAILY_FREE_CAP=50P/일` |

→ **앱을 정상적으로 쓰는 한 중복 적립은 발생하지 않음.**

### 🔴 치명 (악의적 조작 — 클라이언트로는 막을 수 없음)
1. **localStorage 직접 수정** → `points`를 임의값으로 위조
2. **localStorage 초기화** → 가입 100P + 모든 첫보상 + 일일상한 리셋 → 무한 파밍
3. **운영자 PIN `5690`이 JS 번들에 노출** → 추출 → 관리자 콘솔 열어 본인 교환 승인
4. **교환 승인이 표시 포인트 기반** → 위조 포인트로 실물보상 수령 가능

→ **4가지 모두 서버 권위(인증+서버 원장)로만 해결 가능.** 아래 마이그레이션이 유일한 근본 대책.

### 🟡 즉시 조치 (이번에 처리)
- 랜덤박스 "광고 보고 한 번 더"(무료 추가 박스) **제거** → 어뷰징 표면 축소

---

## 2) 마이그레이션 실행 순서 (포인트 서버화 + 카카오 로그인)

> 핵심: 포인트/원장/관리자 권한을 Supabase로 옮겨 **위조·중복을 서버에서 차단**.
> 스키마는 [`supabase/v2-auth-economy.sql`](supabase/v2-auth-economy.sql)에 완성돼 있음.

### STEP 1 — 카카오 로그인 설정 (너의 작업)
1. developers.kakao.com → 내 앱 → **카카오 로그인** → 활성화 ON
2. **동의항목**: 닉네임, 프로필 이미지(선택)
3. **Redirect URI** 등록: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
   - 프로젝트ref = `xdcglyavndiwbbaryocx`
   - 즉 `https://xdcglyavndiwbbaryocx.supabase.co/auth/v1/callback`

### STEP 2 — Supabase에 카카오 OAuth 연결 (너의 작업)
1. Supabase 대시보드 → **Authentication → Providers → Kakao** → Enable
2. **REST API 키**(c27d…)를 Client ID 칸에, 카카오 **Client Secret**(보안 → 코드 생성)을 Secret 칸에
3. Authentication → URL Configuration → Site URL = `https://www.nurimind.co.kr`

### STEP 3 — 서버 스키마 실행 (너의 작업)
- Supabase SQL Editor에 `supabase/v2-auth-economy.sql` 전체 붙여넣기 → Run
- (profiles / points_ledger / redemptions + grant_points·my_points·request_redeem·report_and_maybe_hide RPC 생성)

### STEP 4 — 클라이언트 전환 (내가 한 번에 — STEP 1~3 완료 후)
1. `supabase.auth.signInWithOAuth({ provider:'kakao' })` 로그인 버튼(프로필/게스트)
2. `onAuthStateChange` → 로그인 유저 프로필 동기화
3. 포인트 표시 = `my_points()` RPC, 적립 = `grant_points()`, 교환 = `request_redeem()` 로 교체
4. 관리자 화면을 `profiles.is_admin` 으로 게이트 → **PIN 제거**
5. 기존 localStorage 유저: 최초 로그인 시 1회 이관(선택)

> STEP 1~3은 대시보드 작업이라 너만 가능. **끝나면 알려줘 → STEP 4를 안전하게 한 번에 처리.**

---

## 3) 그 외 권고
- 채팅에 노출된 **카카오 어드민/REST 키 재발급**
- Supabase **secret 키 로테이트**(이전 노출분)
- 트래픽/홍보는 STEP 4(서버화) 이후 권장 — 그 전 대량 유입 시 어뷰징 손실
