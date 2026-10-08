# 누리 마인드 Google Play 출시 체크리스트

작성 2026-10-08 KST · 브랜치 `play-release` (기반 `origin/main` d48c12c). Android(Google Play) 전용 실행 문서예요.
iOS·Apple 기준과 공통 운영 정보(사업자·연락처)는 [STORE.md](STORE.md)에 있고, 여기서는 반복하지 않아요.

상태 표기: **PASS** 실제로 실행해 통과 · **FAIL** 실행해 실패 · **NOT_RUN** 실행 못 함(이유 적음) · **NEEDS_USER** 사용자만 할 수 있음.
"문서 작성·코드 수정"은 출시 완료가 아니에요. 출시 완료 = 서명 AAB 업로드 → 비공개 테스트 14일 → 프로덕션 심사 승인.

---

## 0. 한눈에 보기

| 구분 | 항목 | 상태 |
|---|---|---|
| BLOCKER | 개발자 계정 유형·생성일 확인, (개인 계정이면) 비공개 테스트 12명×14일 | NEEDS_USER |
| BLOCKER | 업로드 키 생성·서명 AAB 빌드 (이 PC엔 JDK 없음) | NEEDS_USER / Gradle NOT_RUN |
| BLOCKER | 운영 `.env`(Supabase 공개 키)로 빌드 — 없으면 로그인·커뮤니티·계정 삭제가 죽은 앱이 됨 | `cap:sync`가 이제 막아 줌(PASS) |
| BLOCKER | Supabase Redirect URLs에 `kr.nuri.mind://auth-callback` 등록 확인 + 실기기 카카오·구글 로그인 복귀 | NEEDS_USER |
| BLOCKER | 실기기에서 계정 삭제 → 재조회로 삭제 확인 | NEEDS_USER |
| BLOCKER | 기능 그래픽 1024×500 제작 | NEEDS_USER(디자인) |
| 고침 | 앱에서 결제 경로 차단·광고 자리 숨김·랜덤박스 교환 숨김·확률 공개·댓글 신고/차단·AI 전송 고지 | 이번 커밋(아래 2절) |
| SHOULD | 앱 안 AI 결과 신고 기능(서버 테이블 필요) | NEEDS_USER(DB 승인) |
| SHOULD | 운세 잠금 문구 "광고 1회면 무료"가 광고 없이 열림 — 문구·다이아 버튼 정리 | NEEDS_USER(상품 결정) |
| SHOULD | 충전·프리미엄 화면(다이아 '+' 버튼·프로필·상점 카드에서 진입)이 앱에서 원화 가격표를 '준비 중'으로 보여 줌. 맨 위 가격 띠는 이번에 숨김 | NEEDS_USER(상품 결정) |
| OK | target/compile SDK 36, min 24, 권한은 INTERNET 하나, 백업 끔 | 설정 확인(PASS) |

---

## 1. 공식 정책 확인 결과 (2026-10-08 원문 조회)

| 정책 | 핵심 | 누리 마인드 판단 |
|---|---|---|
| [대상 API](https://developer.android.com/google/play/requirements/target-sdk) | 2026-08-31부터 신규 앱·업데이트는 **API 36 이상**. 연장 신청 시 2026-11-01까지 | `android/variables.gradle:3-4` compile·target 36 → **OK** |
| [신규 개인 계정 테스트](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) | 2023-11-13 이후 만든 **개인** 계정은 비공개 테스트 **12명 이상, 연속 14일** 참여 후 '프로덕션 액세스 신청'. 심사 보통 7일 안팎 | 계정 유형 미확인 → NEEDS_USER |
| [실제 돈·경품·로열티](https://support.google.com/googleplay/android-developer/answer/9877032?hl=en) | 돈(또는 돈으로 산 아이템)을 걸고 현금성 상품을 타는 구조 금지. **비게임 앱**의 확률형 보상은 앱 안에 공식 규칙 게시 + 확률 공개 | 랜덤박스 교환(포인트를 걸고 무작위 포인트) → 앱에서 숨김. 매일 무료 박스 → 확률 표시 추가 |
| [사용자 제작 콘텐츠(UGC)](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en) | 약관 동의 후 작성, 앱 안에서 콘텐츠·사용자 **신고와 차단**, 지속적인 모더레이션 | 글은 있었음, **댓글 신고·차단 추가**. 운영자 처리 절차는 NEEDS_USER |
| [AI 생성 콘텐츠](https://support.google.com/googleplay/android-developer/answer/13985936?hl=en) | 적용 앱은 **앱을 나가지 않고** 불쾌한 AI 결과를 신고할 수 있어야 함. 대표 대상은 대화형 챗봇·이미지 생성 | 검사 해석문은 챗봇이 핵심 기능은 아니라 적용 범위가 애매 → SHOULD(아래 5절) |
| [결제](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en) | Play로 배포한 앱의 디지털 상품·구독·광고 제거는 원칙적으로 Play 결제 | `PAYMENTS_ENABLED`가 앱에선 항상 false(이번 수정) → **OK** |
| [건강 앱 선언](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en) | 공개된 **모든 앱**이 App content > Health apps 작성(건강 기능 없어도) | 아래 4-3 답안 |
| [계정 삭제](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en) | 앱 안 삭제 + 앱 밖 웹 삭제 요청 URL | 앱 `src/pages/Profile.tsx:586` → `src/lib/economy.ts:278-289`(엣지 `delete-account`), 웹 `/account-deletion` → 실제 삭제 검증 NEEDS_USER |
| [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en) | SDK·WebView 전송 포함, 서비스 제공자 전송은 '공유' 예외지만 '수집'은 신고 | 아래 4-1 |
| AdSense in WebView | 앱 WebView 안 AdSense 게재는 지원 방식이 아니면 위반 소지 | `src/lib/ads.ts:21` 앱에서 끔 + 이번에 빈 광고 자리도 숨김 → **광고 없음** 선언 |

---

## 2. 이번 커밋에서 고친 것 (파일:줄 · 근거 · 검증)

| 파일:줄 | 무엇 | 왜 |
|---|---|---|
| `src/data/features.ts:4,30-31` | `PAYMENTS_ENABLED = PAYMENTS_SWITCH && !isNativeApp()` | 웹 PG를 켜려고 스위치를 true로 바꾸는 순간 앱에도 외부 결제가 새는 구조였어요. 앱은 Play 결제 연동 전까지 항상 꺼짐 |
| `src/components/AdSlot.tsx:40-42` | 앱에서 광고 슬롯 `return null` | 앱에선 AdSense가 꺼져 있어 '광고 영역' 점선 자리표시와 살 수 없는 프리미엄 업셀이 그대로 보였어요(미완성처럼 보이고 '광고 없음' 선언과 어긋남) |
| `src/components/TopStrip.tsx:28-29` | 앱에서 모든 화면 맨 위 '프리미엄 월 5,900원' 띠 숨김 | 살 수 없는 구독 가격을 첫 화면부터 내걸면 심사자가 누르자마자 '결제 준비 중'에 막혀요 |
| `src/pages/Shop.tsx:95-97` | 앱에서 `randombox`(1,500P를 걸고 500~5,000P 무작위) 교환 숨김 | 포인트가 상품권으로 바뀌는 구조라 '가치 있는 것을 걸고 무작위 보상' = 도박성 판단 소지. 웹은 별도 판단(NEEDS_USER) |
| `src/data/daily.ts:43-65`, `src/store/useStore.ts:648`, `src/components/Daily.tsx:81-84` | 매일 랜덤박스 확률표 `SPIN_ODDS`를 지급과 화면 고지가 함께 읽음 | 비게임 앱 확률형 보상은 확률 공개 필요. 표 하나라 화면과 실제가 어긋날 수 없음 |
| `src/pages/Community.tsx:325-350, 755-766` | 댓글마다 신고(🚩)·차단(🚫) 버튼, 신고는 기존 `reports` 테이블(부모 글 id + `comment-report`). 이미 같은 글을 신고한 기기의 중복(23505, `supabase/v2-auth-economy.sql:123` 유일 키)은 '접수됨'으로 처리 | 공개 UGC는 콘텐츠·사용자 신고와 차단이 앱 안에 있어야 함. 글에만 있었음. 한계: 같은 글의 두 번째 댓글 신고는 첫 행에 묻힘(댓글 단위 행은 마이그레이션 필요) |
| `src/components/AiReport.tsx:77-85` | '무료로 열기' 아래 외부 AI 전송 고지 | 결과 구간·백분위(번아웃 등 마음 건강 관련)가 누르는 즉시 외부 AI로 가는데 화면 고지가 없었음 |
| `src/pages/Fortune.tsx:548-556` | 상세 운세 잠금 카드에 외부 AI 전송 고지 | 열면 일주·오행·성별·나이가 AI로 전송됨 |
| `src/lib/deepReport.ts:53-90`, `src/pages/DeepReport.tsx:96` | 심층 리포트 AI 요청에서 닉네임 제거 | 개인정보처리방침은 "이름은 전송하지 아니함"인데 닉네임을 보내고 있었음. 엣지 함수는 없으면 생략(`supabase/functions/deep-report/index.ts:112`) |
| `scripts/check-native-env.mjs`, `package.json:16` | `npm run cap:sync` 전에 Supabase 공개 키 확인, 없으면 종료 코드 1 | 키 없이 빌드하면 오류 없이 '서버 없는 앱'이 만들어져 업로드될 수 있었음. 값은 출력하지 않음 |
| `scripts/store-shots.mjs` | 스토어 스크린샷 재촬영 스크립트 | 7절 |

검증(2026-10-08, 이 브랜치):

| 명령 | 결과 |
|---|---|
| `npx tsc --noEmit` | PASS (exit 0) |
| `npm run verify` (스모크 18종 · 빌드 · 번들 예산) | PASS (커밋 직전 재실행 exit 0, 스모크 18/18, 메인 번들 163KB gzip / 예산 225KB) |
| `rollSpin` 대조: 옛 공식과 경계값 24개 + 무작위 100만 회 비교, 확률 합 100 | PASS (차이 0) |
| `node scripts/check-native-env.mjs` 키 없음 / 가짜 키 | exit 1 / exit 0 (음성·양성 대조 PASS) |
| `npx cap sync android` | PASS (exit 0, 플러그인 6개 반영). 운영 키 없는 빌드라 업로드용이 아님 |
| 스토어 스크린샷 `node scripts/store-shots.mjs` | PASS (16장, 페이지 오류 0, 결과 화면은 실제 20문항 응답으로 생성) |
| `gradlew bundleRelease` | **NOT_RUN** — 이 PC에 JDK 없음(`java` 미설치, Android SDK 36·build-tools 36은 있음). 지시대로 설치하지 않음 |
| 웹 E2E | NOT_RUN(부모 담당) |

---

## 3. 계정 · 테스트 트랙 절차

1. **개발자 계정 확인 (NEEDS_USER)** — Play Console > 설정 > 개발자 계정에서 *개인/조직*과 생성일을 확인해요.
   - 사업자(엔에이치홀딩스)로 **조직 계정**을 만들면 D-U-N-S 번호가 필요하지만 12명×14일 테스트 의무는 개인 계정 조건이에요.
   - 2023-11-13 이후 만든 **개인 계정**이면 아래 2~4단계가 필수예요.
2. **앱 만들기** — 앱 이름 `누리 마인드`, 기본 언어 한국어, 앱(게임 아님), 무료.
3. **App content(앱 콘텐츠) 모두 작성** — 4절 답안 사용. 하나라도 비면 트랙 출시가 막혀요.
4. **내부 테스트**(선택, 최대 100명) → 서명 AAB 업로드 → 설치·로그인·삭제 동선 확인.
5. **비공개 테스트**(개인 계정 필수) — 테스터 **12명 이상**이 옵트인 후 **연속 14일** 유지. 중간에 빠진 사람은 세지 않아요. 여유 있게 15명 이상 모으세요.
6. 대시보드 > **프로덕션 액세스 신청** — '비공개 테스트 정보 / 앱 정보 / 프로덕션 준비' 3개 섹션 작성 후 신청. 검토 보통 7일 안팎.
7. 프로덕션 출시 → 심사. 승인 전에는 '출시 완료'라고 말하지 않아요.

---

## 4. App content 답안 초안

### 4-1. 데이터 보안(Data safety)

전제: **운영 `.env`로 만든 앱 빌드** 기준. 앱 WebView 주소가 `https://localhost`라서 GA4·웹 푸시는 앱에서 꺼져요
(`src/lib/analytics.ts:11-16` hostname 검사, `src/lib/pwa.ts:18` 서비스워커 미등록 → `src/lib/push.ts:16-21` 미지원). 광고는 `src/lib/ads.ts:21`에서 꺼져요.
`capacitor.config.ts`에 `server.hostname`을 바꾸면 이 전제가 깨지니 그때 이 표를 다시 써야 해요.

공통 질문:

| 질문 | 답 | 근거 |
|---|---|---|
| 데이터를 수집하거나 공유하나요? | 예 | 아래 표 |
| 전송 중 암호화되나요? | 예 | 모든 요청 HTTPS(Supabase·엣지 함수) |
| 사용자가 삭제를 요청할 수 있나요? | 예 | 앱 `Profile.tsx:586`, 웹 https://www.nurimind.co.kr/account-deletion |

데이터 유형별(모두 **선택 수집** — 게스트로 검사·운세를 쓸 수 있고, 로그인·게시·AI 요청을 할 때만 전송):

| Google 유형 | 실제 항목 · 전송 위치(파일:줄) | 공유? | 목적 |
|---|---|---|---|
| 개인 정보 > 이름 | 닉네임·카카오/구글 이름 → Supabase 프로필·게시물 (`src/lib/community.ts:186,196`) | 아니요 | 앱 기능, 계정 관리 |
| 개인 정보 > 이메일 주소 | 카카오(기본 scope에 account_email, `src/lib/auth.ts:47-55`)·구글(`auth.ts:85`) 로그인 시 | 아니요 | 계정 관리 |
| 개인 정보 > 사용자 ID | Supabase 사용자 ID, 카카오/구글 계정 식별값 | 아니요 | 계정 관리, 앱 기능 |
| 개인 정보 > 기타 정보 | 상세 운세 AI 요청의 성별·나이·사주 요약 (`src/pages/Fortune.tsx:171-185` → `src/lib/fortuneAi.ts:58`) | 아니요(처리 위탁) | 앱 기능 |
| 사진 및 동영상 > 사진 | 카카오/구글 프로필 사진 **URL**(사진첩 접근 없음). 보수적으로 신고 권장 | 아니요 | 계정 관리 |
| 건강 및 피트니스 > 건강 정보 | AI 해석 요청 시 검사 이름·결과 구간·백분위·성향 요약 (`src/components/AiReport.tsx:42-53`, `src/lib/deepReport.ts:96-100`) | 아니요(처리 위탁) | 앱 기능 |
| 앱 활동 > 기타 사용자 제작 콘텐츠 | 커뮤니티 글·댓글(`community.ts:186,196`), 신고(`community.ts:355`), 꿈 해몽 AI 입력(`src/lib/dreamAi.ts:59-62`) | 아니요 | 앱 기능 |
| 앱 활동 > 기타 작업 | 포인트 적립·사용·교환 신청·우편함·AI 이용 횟수 (`src/lib/economy.ts:123,139`) | 아니요 | 앱 기능, 사기 방지 |
| 기기 또는 기타 ID | 커뮤니티 글 소유 확인용 기기 토큰 해시(`community.ts:186`) | 아니요 | 앱 기능, 보안 |
| 앱 정보 및 성능 > 비정상 종료 로그·진단 | **빌드 때 `VITE_SENTRY_DSN`이 있을 때만** Sentry 전송(`src/lib/sentry.ts:10-17`, 성능 샘플 10%). `npm run cap:sync`가 시작할 때 "Sentry DSN 있음/없음"을 알려 줘요 | 아니요 | 분석(오류 수정) |

수집 안 함: 위치, 연락처, 금융 정보(결제 꺼짐), 메시지(1:1 대화 없음), 캘린더, 웹 기록, 파일, 오디오, 광고 ID.

판단이 필요한 점:
- **AI 전송**: Anthropic 또는 Google API(운영 설정에 따라 한 곳, `supabase/functions/_shared/llm.ts:50-62`)로 갑니다. 공급자가 요청을 일정 기간 보관할 수 있어 '일시적 처리(ephemeral)'로 답하지 않는 게 안전해요.
- **서비스 제공자 예외**: Supabase·AI 공급자는 회사 대신 처리하는 곳이라 '공유=아니요'로 답하되, '수집=예'는 그대로 신고해요.
- 기프티콘 수령용 휴대전화번호는 앱 코드에서 받지 않아요(코드 검색 결과 없음). 운영에서 따로 받으면 그때 추가해요.

### 4-2. 콘텐츠 등급(IARC) 설문 초안

| 질문 | 답 | 이유 |
|---|---|---|
| 카테고리 | 콘솔 선택지 중 '참고·교육' 또는 '기타(유틸리티 등)' — 게임 아님 | 심리검사·인지 과제·운세 콘텐츠 |
| 폭력·공포·성적 콘텐츠·약물 | 아니요 | 해당 콘텐츠 없음 |
| 욕설 | 아니요(사용자 글은 필터 `src/lib/moderation.ts:43`) | 앱이 만든 콘텐츠엔 없음 |
| 사용자 간 상호작용·콘텐츠 공유 | **예** | 익명 커뮤니티 글·댓글 |
| 위치 공유 | 아니요 | |
| 디지털 상품 구매 | 아니요 | 앱에서 결제 꺼짐 |
| 도박·모의 도박 | 아니요 | 판돈을 거는 교환은 앱에서 숨김. 매일 무료 박스는 거는 것 없는 활동 보상 |

예상: 낮은 연령 등급 + '사용자 상호작용' 표기. 실제 등급은 제출 후 IARC가 정해요.

### 4-3. 건강 앱 선언 (NEEDS_USER 최종 선택)

- 권장: **Stress Management, Relaxation, Mental Acuity**(번아웃·스트레스 자기점검, 기억·집중 인지 과제).
- ADHD 경향·사회불안 등 자기점검 검사가 있으니 **Mental and Behavioral Health**("정신 건강 지원 도구")도 해당하는지 검토하세요. 정직하게 체크하는 편이 나중에 거부당하는 것보다 나아요.
- 의료기기 앱: 아니요. 의료 진단·치료를 하지 않아요(앱 고지: `src/pages/About.tsx:121`).

### 4-4. 대상 연령 (NEEDS_USER)

- 서비스 이용 조건이 **만 14세 이상**이라 13~15세 구간을 고르면 13세가 포함돼요.
- 권장: **16~17세, 18세 이상**. 상품권 교환·익명 커뮤니티가 있어 아동 대상 정책(Families) 검토를 피하는 쪽이 안전해요. 13세 미만은 절대 선택하지 않아요.

### 4-5. 그 밖의 선언

| 항목 | 답 |
|---|---|
| 광고 포함 | **아니요** (앱에서 AdSense 끔 + 광고 자리 숨김. AdMob 미연동) |
| 앱 액세스 | 일부 기능 로그인 필요 → **아이디 로그인 테스트 계정**(`/login`, `src/lib/auth.ts:100-125`)을 콘솔 비공개 칸에만 입력. 저장소에 비밀번호 금지 |
| 개인정보처리방침 URL | https://www.nurimind.co.kr/legal/privacy |
| 계정 삭제 URL | https://www.nurimind.co.kr/account-deletion |
| 정부 앱 · 금융 기능 · 뉴스 앱 | 아니요 |

---

## 5. 정책 판단: 리워드 · 포인트 · 랜덤박스 · 상품권

| 기능 | 판단 | 조치 |
|---|---|---|
| 활동 포인트(출석·퀴즈·검사·퀘스트) → 포인트 상점에서 상품권·교환권 교환 신청(운영자 확인 후 지급) | 돈을 내지 않고 모으는 보상이라 실제 돈 게임에는 해당하지 않아요. 비게임 앱 보상 프로그램은 **앱 안 공식 규칙**이 필요 → 이용약관 포인트·교환 조항(`src/data/legalDocs.ts:97-107`)이 규칙 역할 | OK. 교환 비율·지급 방식을 약관과 상점 화면에 계속 맞춰 두세요 |
| 상점 '포인트 랜덤박스'(1,500P → 500~5,000P 무작위) | 상품권으로 바뀌는 포인트를 **걸고** 무작위 결과를 받는 구조 → 도박성으로 볼 소지 | **앱에서 숨김**(`Shop.tsx:96-98`). 웹 유지 여부는 NEEDS_USER |
| 매일 무료 랜덤박스(3~50P) | 거는 것이 없는 무작위 보상. 확률 공개 필요 | **확률 표시 추가**(`Daily.tsx:76-79`) |
| '광고 보고 한 번 더'(광고 보너스 박스) | 이미 비활성(`Daily.tsx:32`). 광고 시청 보상은 AdMob 보상형 정책을 따로 따라야 함 | 그대로 비활성 유지 |
| 친구 초대 +100P | 웹 주소로 초대하고 가입 시 보상(`src/components/Invite.tsx:70`). '설치 수 부풀리기'와 다름 | OK. 보상 조건을 'Play에서 설치'로 바꾸지 마세요. 별점·리뷰에 보상 금지 |
| 오퍼월(앱 설치 미션) | 다른 브랜치에서 제거 중 | 그 브랜치가 먼저 합쳐져야 해요 |
| 다이아·프리미엄 | 앱 결제 꺼짐(`features.ts:29-30`). 기존 보유분은 유지 | 판매하려면 **Play 결제 연동 + 서버 영수증 검증** 먼저([BILLING.md](BILLING.md)) |

---

## 6. 스토어 등록정보 초안

**앱 이름**(30자 이내): `누리 마인드`

**짧은 설명**(80자 이내 — 실측 50자):

> 심리검사와 기억·집중 인지 과제로 나를 돌아보는 자기이해 앱이에요. 의료 진단은 아니에요.

**자세한 설명**(4,000자 이내 — 실측 1,101자, 줄바꿈 포함):

> 나를 조금 더 알아가는 시간, 누리 마인드예요.
>
> ■ 심리검사
> 번아웃, 자존감, 회복탄력성, 자기효능감, 연애 성향 같은 자기보고 검사에 답하고 동물 캐릭터와 함께 결과를 확인해요. 결과에는 점수 구간과 함께 강점, 주의할 점, 해 볼 만한 작은 행동이 담겨 있어요. 검사마다 소개 화면에서 어떤 척도를 참고했는지와 주의 사항을 먼저 읽을 수 있어요.
>
> ■ 인지 과제
> 기억, 집중, 처리 속도, 공간, 전환 과제를 짧게 해 보고 내 기록을 모아 볼 수 있어요. 게임처럼 가볍게 즐기는 활동이며 지능이나 질환을 판정하지 않아요.
>
> ■ 기록과 매거진
> 검사 기록은 기기에 저장되어 프로필에서 다시 열어 볼 수 있어요. 마음과 습관을 다룬 매거진 글도 읽을 수 있어요.
>
> ■ 운세 콘텐츠
> 사주, 별자리, 타로, 꿈 해몽을 재미로 즐겨 보세요. 운세는 오락용이며 미래를 보장하지 않아요.
>
> ■ AI 해석(선택)
> 원할 때만 AI 해석을 열 수 있어요. 열면 해석에 필요한 결과 요약이 외부 AI 서비스로 전송되며, 이름은 보내지 않아요. AI가 쓴 글은 틀릴 수 있어요.
>
> ■ 익명 커뮤니티
> 닉네임으로 이야기를 나눌 수 있어요. 불편한 글과 댓글은 신고하거나 작성자를 차단할 수 있어요.
>
> ■ 활동 포인트
> 출석, 퀴즈 같은 활동으로 포인트를 모으고 포인트 상점에서 교환을 신청할 수 있어요. 교환은 운영자 확인 후 지급되며 상품은 사정에 따라 바뀔 수 있어요.
>
> ■ 꼭 알아 두세요
> 누리 마인드는 의료 진단이나 치료 서비스가 아니에요. 모든 결과는 자기이해를 돕는 참고 자료예요. 결과가 걱정되거나 일상이 힘들다면 정신건강의학과 전문의나 상담 전문가와 이야기해 보세요. 급하게 마음이 힘들 때는 자살예방 상담전화 109, 정신건강 위기상담전화 1577-0199에서 24시간 도움을 받을 수 있어요.
>
> 닉네임과 필수 동의로 바로 시작할 수 있고, 계정 연동이 필요한 기능은 카카오·구글·아이디 로그인으로 이용해요. 만 14세 이상 이용할 수 있어요.
>
> 개인정보처리방침: https://www.nurimind.co.kr/legal/privacy
> 계정 삭제 안내: https://www.nurimind.co.kr/account-deletion
> 문의: ace@nuriholdem.com

쓰지 않은 말: 검사 개수, '정확한 진단', 'IQ 측정', 검증된 백분위, 할인·마감, 결제·구독(앱에서 꺼짐). 최종 빌드에 없는 기능은 설명과 이미지에서 빼요.
카테고리 권장: **라이프스타일**(또는 엔터테인먼트). '건강/피트니스'·'의료'는 고르지 않아요.

---

## 7. 그래픽 자료

| 자료 | 규격(Play) | 있는 것 | 할 일 |
|---|---|---|---|
| 앱 아이콘 | 512×512, **32비트 PNG**(알파), 1MB 이하 | `docs/store-assets/icon-512.png`(이번에 1024 원본 `resources/icon.png`에서 생성 — PNG 색 형식 6=RGBA·8비트, 50KB 실측) | 확인만. 기존 `public/icons/icon-512.png`는 24비트라 그대로 쓰지 않아요 |
| 기능 그래픽 | 1024×500, JPG 또는 24비트 PNG | 없음 | **NEEDS_USER(디자인)** — 로고+한 줄 문구, 가장자리 여백 넉넉히 |
| 휴대전화 스크린샷 | 2~8장, 각 변 320~3,840px, **긴 변 ≤ 짧은 변×2** | `docs/store-assets/play-1080x1920/` 8장(1080×1920, 비율 1.78) | 사람이 보고 고르기. 개인정보·테스트 닉네임 확인 |
| 원본 캡처 | — | `docs/store-assets/raw-390x844/` 8장(1170×2532, 비율 2.16) | **Play에 그대로 올리면 비율 초과** — 원본 보관용 |
| 적응형 아이콘 | 안드로이드 런처 | `android/app/src/main/res/mipmap-*`(전경 432px) | 실기기 원형·물방울 마스크에서 잘림 확인(NOT_RUN) |

찍힌 화면: 01 홈 · 02 번아웃 검사 소개 · 03 첫 문항 · 04 결과(실제로 20문항에 답해 생성) · 05 인지 프로필 · 06 매거진 · 07 운세 입력 · 08 프로필.
캡처에서 눈에 띈 점(고치지 않음, 화면 담당 확인 필요): 프로필 통계 카드 포인트가 360px 폭에서 `1,3...`로 잘림, 결과 한 줄 문구 앞에 따옴표가 겹침(`""할 만해"…`), 상단 다이아 `+`(충전 화면 진입)가 앱에서도 보임, 홈에 'IQ' 칩이 있음(등록정보에는 IQ 표현을 쓰지 않음).

스크린샷은 웹 프로덕션 빌드를 앱 모드(window.Capacitor 흉내)로 찍었어요. 실제 기기 화면이 아니라서 상태바·내비게이션 바는 없어요. 다시 찍기: `npm run build && node scripts/store-shots.mjs`(외부 요청 전부 차단, 끝나면 브라우저·서버 종료).

---

## 8. 빌드 · 서명 · 업로드

준비물(NEEDS_USER): **JDK 21**(Android Studio에 들어 있는 JBR 사용 가능), Android SDK 36(이 PC에 있음), 운영 `.env`.

```powershell
# 1) 운영 값이 든 체크아웃에서 (.env에 VITE_SUPABASE_ANON_KEY 필수, VITE_SENTRY_DSN은 선택)
npm ci
npm run cap:sync          # 키 확인 → tsc+vite build → cap sync. 키가 없으면 여기서 멈춰요

# 2) 업로드 키 만들기(최초 1회, 저장소 밖에 보관 — *.jks는 android/.gitignore가 막지만 아예 밖에 두세요)
keytool -genkeypair -v -keystore C:\keys\nuri-mind-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000

# 3) 서명 없는 릴리스 AAB 빌드(버전은 올릴 때마다 증가)
cd android
$env:VERSION_CODE='1'; $env:VERSION_NAME='1.0.0'
.\gradlew.bat bundleRelease
#   → android\app\build\outputs\bundle\release\app-release.aab

# 4) 업로드 키로 서명
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore C:\keys\nuri-mind-upload.jks app\build\outputs\bundle\release\app-release.aab upload

# 5) 정리
.\gradlew.bat --stop
```

- 더 쉬운 길: Android Studio > Build > **Generate Signed App Bundle** (같은 결과).
- Play Console에서 **Play 앱 서명**을 켜고 위 업로드 키로 서명한 AAB를 올려요. 키 비밀번호·키스토어 파일은 저장소·채팅·문서에 쓰지 않아요.
- `versionCode`는 `android/app/build.gradle:12`가 환경변수 `VERSION_CODE`로 받아요. 같은 번호 재업로드는 거부돼요.
- 16KB 페이지 크기: AAB 안에 `.so`(네이티브 라이브러리)가 있는지 업로드 후 Play Console '앱 번들 탐색기'에서 확인해요.

---

## 9. 실기기 확인 목록 (내부 테스트 트랙에서, NEEDS_USER)

1. 첫 실행: 스플래시가 걷히고 온보딩(닉네임·만 14세·필수 동의)이 보인다.
2. 상태바·하단 바가 화면을 가리지 않는다(안드로이드 15+ 전체 화면 강제). 가리면 CSS `env(safe-area-inset-*)`에 Capacitor `--safe-area-inset-*` 변수를 먼저 쓰도록 바꿔요([Capacitor SystemBars](https://capacitorjs.com/docs/apis/system-bars)).
3. 하드웨어 뒤로가기: 모달 닫힘 → 이전 화면 → 첫 화면에서 두 번 눌러 종료(`src/lib/native.ts:74-79`).
4. 카카오·구글 로그인: 외부 브라우저(Custom Tab)로 열리고 `kr.nuri.mind://auth-callback`으로 돌아와 로그인된다(`native.ts:81-86,135-150`, `AndroidManifest.xml` 딥링크 intent-filter). Supabase Redirect URLs 등록 필수.
5. 아이디 로그인(`/login`)으로 심사용 계정 로그인.
6. 프로필 > 계정 삭제 → 다시 로그인했을 때 데이터가 없다.
7. 커뮤니티 글·댓글 신고 → Supabase `reports`에 행이 생긴다. 차단하면 그 사람 글·댓글이 사라지고 차단 해제가 된다.
8. 공유 버튼이 안드로이드 공유 시트를 연다(`src/lib/share.ts:196-204`), 링크는 `https://www.nurimind.co.kr`.
9. 광고 자리·충전 결제 버튼·랜덤박스 교환이 보이지 않는다. 매일 랜덤박스에 확률이 보인다.
10. 비행기 모드에서 무한 로딩 없이 안내가 뜬다.

---

## 10. 남은 일 (NEEDS_USER)

1. 개발자 계정 유형·생성일 확인, (개인이면) 테스터 15명 모집 → 14일 연속 유지.
2. JDK 21 설치(또는 Android Studio) → 업로드 키 생성 → 서명 AAB 빌드·업로드.
3. Supabase Redirect URLs에 `kr.nuri.mind://auth-callback` 등록 확인.
4. 심사용 아이디 계정 만들기(콘솔 비공개 칸에만 입력).
5. 기능 그래픽 1024×500 제작, 스크린샷 고르기.
6. 건강 앱 선언 범주·대상 연령 최종 선택(4-3, 4-4).
7. 신고 처리 운영 절차 정하기 — 누가, 며칠 안에 `reports`를 보고 숨김·차단하는지.
8. 상품 결정: (a) 운세 '광고 1회면 무료' 문구와 '광고 없이 바로 보기(다이아)' 버튼 정리, (b) 앱의 충전·프리미엄 화면을 Play 결제 전까지 숨길지, (c) 웹의 포인트 랜덤박스 유지 여부.
9. AI 결과 신고: 앱을 나가지 않는 신고가 필요하면 `ai_reports` 같은 서버 테이블(insert만 허용하는 RLS)이 필요해요 — 운영 DB 변경이라 별도 승인 후 마이그레이션 먼저, 화면은 그다음.
10. 오퍼월 제거 브랜치(`no-offerwall`)를 이 브랜치보다 먼저 합치기.

## 사용한 도구와 상태

| 도구 | 쓴 곳 | 상태 |
|---|---|---|
| WebFetch(공식 문서) | 1절 정책 원문 확인 | 호출 성공 |
| capability-router·nuri-edit 스킬 | 문서 형식, 줄끝(CRLF) 보존 편집 | 적용 |
| TypeScript·Vite·스모크 | 2절 검증 | PASS |
| Playwright(Chromium 1개, 라이브러리 직접) | 7절 스크린샷 | PASS(16장), 브라우저·preview 서버 종료 |
| Capacitor CLI | `cap sync android` | PASS |
| Gradle | `bundleRelease` | NOT_RUN(JDK 없음) |
| Play Console API·MCP | 없음 | 콘솔에서 직접 입력 |
