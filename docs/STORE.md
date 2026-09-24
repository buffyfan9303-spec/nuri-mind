# 스토어 등록 가이드 (Google Play · App Store)

작성 2026-09-24. 코드로 준비된 것과 **운영자가 콘솔에서 직접 해야 하는 것**을 나눠 적는다.
⚠️ 스토어 정책은 자주 바뀐다. 아래 정책 번호·요건은 제출 직전에 공식 원문으로 다시 확인할 것
(Google Play 정책 센터, App Store Review Guidelines). 이 문서는 심사 통과를 보장하지 않는다.

## 0. 도구·상태

| 작업 | 파일·명령 | 상태 | 대안 |
|---|---|---|---|
| 앱 셸 | `capacitor.config.ts`, `android/`, `ios/`, `npm run cap:sync` | 프로젝트 생성·동기화 확인 | — |
| 네이티브 아이콘·스플래시 | `resources/icon.png`(1024) → `npx @capacitor/assets generate` | 생성 확인(안드 74·iOS 7) | `node scripts/make-icons.mjs`로 원본 재생성 |
| 안드로이드 빌드(AAB) | Android Studio → Build → Generate Signed Bundle | **이 PC에 Java·Android SDK 없음 — 미검증** | Android Studio 설치 후 빌드 |
| iOS 빌드 | Xcode(맥 필요) → Archive | **맥 없음 — 미검증** | 맥 또는 클라우드 빌드(Codemagic 등, 유료 여부 확인) |
| 계정 삭제 | 프로필 → 계정 삭제, 엣지 함수 `delete-account`(v1 배포), `/account-deletion` | 거부 경로(401) 확인, 실계정 삭제 미검증 | — |
| Apple 로그인 | `APPLE_SIGNIN_ENABLED`(features.ts) | 코드 준비, 꺼짐 | — |
| 스토어 결제 | `PAYMENTS_ENABLED=false` | 결제 화면 '준비 중' | docs/BILLING.md |

## 1. 앱 기본 정보

- 패키지/번들 ID: `kr.nuri.mind` (바꾸면 `src/lib/platform.ts` NATIVE_APP_ID도 같이)
- 앱 이름: 누리 마인드
- 개발자(판매자): 엔에이치홀딩스 (사업자 525-20-02937) — `src/data/company.ts`
- 개인정보처리방침 URL: https://www.nurimind.co.kr/legal/privacy
- 계정·데이터 삭제 URL: https://www.nurimind.co.kr/account-deletion
- 지원 URL: https://www.nurimind.co.kr/about (문의 이메일을 company.ts에 넣으면 페이지에 표시됨)
- 카테고리(제안): 라이프스타일 또는 건강/피트니스가 아닌 **엔터테인먼트/라이프스타일** — '진단' 앱으로 분류되지 않게

## 2. 등록 문구(초안)

- 짧은 설명(80자): 나를 이해하는 심리검사·인지 과제와 오늘의 운세를 한 곳에서
- 긴 설명 요지:
  - 공개 학술 척도를 바탕으로 한 자기이해 검사, 기억·집중·처리속도 등 인지 과제
  - 결과를 동물 캐릭터와 백분위로 쉽게 풀이, 강점·주의점·오늘의 한 걸음
  - 사주·띠 운세, 심리 매거진, 익명 커뮤니티
  - **의료 진단이 아니며 전문 상담을 대신하지 않음**을 설명 끝에 명시(건강 주장 오해 방지)
- 스크린샷: 홈 → 검사 목록 → 문항 → 결과 → 운세 → 커뮤니티 (카카오 심사용 캡처와 같은 동선 재사용)

## 3. 연령 등급 설문(예상 답)

- 사용자 생성 콘텐츠: 있음(익명 커뮤니티) — 신고·차단·운영자 숨김 있음
- 폭력·성적·도박 요소: 없음 / 운세: 오락 목적으로 표기
- 인앱 구매: 현재 없음(결제 꺼짐). 결제를 켜면 다시 제출
- 광고: 앱에서는 현재 없음(AdSense는 웹 전용, 앱 AdMob 미연동)

## 4. 개인정보 답변서(데이터 보안 / App Privacy) — 코드 기준 사실

| 데이터 | 수집 여부 | 용도 | 연결 | 비고 |
|---|---|---|---|---|
| 닉네임(카카오 profile_nickname) | 로그인 시 | 계정 | 사용자 연결 | 이메일·전화 수집 안 함 |
| 앱 활동(포인트·교환·우편함) | 로그인 시 서버 저장 | 앱 기능 | 사용자 연결 | 계정 삭제 시 삭제 |
| 검사 결과·운세 입력(생년월일, 타인 생일 포함) | **기기에만 저장** | 앱 기능 | — | 서버 전송은 AI 해석 요청 때만(이름 제외) |
| AI 해석 요청 내용 | 요청 시 엣지 함수 → LLM 제공자 | 앱 기능 | 저장 안 함(일별 호출 수만) | 국외 이전 여부 방침에 명시 필요 |
| 커뮤니티 글·댓글 | 게시 시 | 앱 기능 | 기기 연결(익명) | 공개 |
| 오류 로그(Sentry) | 설정 시 | 진단 | PII 끔 | |
| 분석(GA4) | 웹만 | 분석 | | 앱 적용 여부 확인 필요 |
| 푸시 구독 | 동의 시 | 알림 | 사용자 연결 | |

전송 암호화: 예(HTTPS). 삭제 요청: 앱 내 + 웹 페이지.

## 5. 심사 노트(App Review / Play 검토)

- 로그인 없이 대부분 기능 사용 가능(온보딩에서 닉네임만 입력). 로그인은 서버 보관·우편함용.
- 테스트 계정: 카카오 테스트 계정이 필요하면 운영자가 발급해 여기 적는다(비밀번호는 문서에 쓰지 말고 콘솔 입력란에만).
- 결제: 현재 판매 없음. 가격 표시는 있으나 구매 버튼은 '결제 준비 중'으로 비활성.
  → Apple 3.1.1 관점에서 **가격만 보이고 살 수 없는 화면**이 문제될 수 있으면, 앱에서는 충전·프리미엄 진입을 숨기는 방안 검토.

## 6. 운영자가 직접 할 일 (콘솔·계정)

1. Google Play Console 개발자 등록(유료 1회), Apple Developer Program(연간 유료) — 비용·약관은 직접 확인
2. Supabase → Auth → URL Configuration → Redirect URLs에 `kr.nuri.mind://auth-callback` 추가
3. 카카오 디벨로퍼스 → 플랫폼: Android(패키지명 `kr.nuri.mind`, 키 해시), iOS(번들 ID) 등록
4. Apple 로그인을 켤 때: Apple Developer에서 Services ID·Key 생성 → Supabase Auth Providers → Apple 입력 → `APPLE_SIGNIN_ENABLED = true`
5. 서명 키(업로드 키) 보관 — 잃어버리면 업데이트 불가. 저장소에 올리지 말 것
6. 문의 이메일·전화·통신판매업 번호 → `src/data/company.ts`
