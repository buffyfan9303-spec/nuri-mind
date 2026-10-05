# 누리 마인드 Google Play · App Store 등록 준비

공식 정보 확인·수정 기준: **2026-10-06 KST**. 기존 2026-09-24 `STORE.md`, `BILLING.md`, `HANDOFF-2026-09-24.md`를 먼저 읽고 현재 소스·운영 증거와 대조했다. 등록 정보 초안과 제출 전 수용 기준이며, 콘솔 등록·심사 완료 문서는 아니다.

## 현재 상태와 제출 판정

**등록 자료는 준비했지만, 현재 앱을 곧바로 양쪽 스토어에 제출할 상태는 아니다.** 개인정보처리방침의 이메일·프로필 사진 누락은 직접 보완하고 운영 반영까지 확인했다. iOS 동등 로그인, AI 전송 동의·신고, 네이티브 실기기 검증 및 서명 배포본은 별도 완료가 필요하다.

| 항목 | 확인 증거 | 상태 / 남은 일 |
|---|---|---|
| 웹 서비스 | 최초 점검 `786119d`, 보완 후 운영 READY SHA `bb92f99`; 실제 검사·결과 재열람·카카오 로그인·로그아웃 | 웹 증거 확보. 네이티브 검증과 구분 |
| 개인정보처리방침 | `src/data/legalDocs.ts` 제1·2·4·8·12·17조에 이메일·프로필 사진 URL 반영 | 운영 공개 전문과 가입 시트 대조 완료 |
| 삭제 안내 | `src/pages/AccountDeletion.tsx` 한국어·영어·일본어 항목 보완 | 소스 완료. 실제 테스트 계정 삭제→재조회 미검증 |
| Android 설정 | `android/variables.gradle` compile/target 36, min 24, 패키지 `kr.nuri.mind` | 새 서명 AAB·설치·OAuth 복귀 검증 필요 |
| Android 빌드 기반 | SDK 36 android.jar·adb 파일 존재. 최근 Android CI debug APK 성공 | 과거 ‘SDK 없음’ 삭제. Java 현재 PATH 미확인. 이번 보완본 AAB 빌드 증거 없음 |
| iOS | `ios/` 프로젝트·번들 ID, 최소 iOS 15 설정 존재 | Mac/Xcode Archive·TestFlight 미검증 |
| Apple 로그인 | `APPLE_SIGNIN_ENABLED=false`, 버튼·OAuth 함수만 준비 | 활성·인증·기기 복귀 확인 전 iOS 제출 보류 |
| 결제·설문 | `PAYMENTS_ENABLED=false`, `SURVEYS_ENABLED=false` | 판매·설문 운영 중으로 설명 금지. 준비 중 화면도 심사 대상 |
| AI | 검사 해석·심층 해석·운세·꿈 해몽 코드 | 모든 호출 전 전송 고지·명시적 허락, 결과 신고 흐름 점검 필요 |
| 커뮤니티 | 글/댓글·신고·차단 코드, 목록 실조회 | 신고→운영 처리→차단·해제 실제 검증 필요 |
| 이미지 | 아이콘 원본·네이티브 리소스, 카카오용 웹 캡처 존재 | 웹 캡처·카카오 PDF가 스토어 규격/설치 증거를 대체하지 않음 |

[확인한 Android CI](https://github.com/buffyfan9303-spec/nuri-mind/actions/runs/37260345586)는 SHA `c0ff3524`의 성공이다. 현재 웹 SHA 또는 이번 변경본의 서명 AAB 성공으로 해석하지 않는다.

## 최신 공식 기준

### Google Play

- **Target API**: 2026-08-31부터 일반 모바일 신규 앱·업데이트는 Android 16 / API 36 이상. 현재 설정 36 유지 및 최종 AAB manifest 확인. [공식 요구사항](https://developer.android.com/google/play/requirements/target-sdk)
- **16KB 페이지**: API 35 이상 64bit 앱 호환성 검증. 현재 공식 페이지는 미지원 업데이트의 출시 제한을 **2027-02-01**로 안내한다. 과거 2025년 안내만 복사하지 않는다. AAB 내 `.so` 존재·정렬과 16KB 환경 실행 확인. [공식 호환성 안내](https://developer.android.com/guide/practices/page-sizes)
- **개인 계정 테스트**: 2023-11-13 이후 생성한 개인 개발자 계정이면 연속 14일 이상 참여한 최소 12명으로 비공개 테스트 후 프로덕션 권한 신청. 조직 계정에 같은 조건이 자동 적용되는 것은 아니다. 현재 계정 유형·생성일 미확인. [테스트 요건](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- **Data safety**: SDK·관리하는 WebView의 기기 밖 전송 포함. 순간 처리도 설문 답변 대상이며, 공급자 보관까지 확인해야 일시 처리로 분류할 수 있다. [작성 기준](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- **삭제**: 앱 내부 삭제와 앱 밖 웹 삭제 요청 경로 필요. 현재 공개 `/account-deletion`은 로그인 삭제 경로·문의 이메일을 제공한다. 실제 삭제 성공을 안내 페이지 열림만으로 판정하지 않는다. [삭제 정책](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)
- **건강 앱 선언**: 설문 작성. 심리·인지·정신건강 문항이 있으므로 엔터테인먼트 카테고리라는 이유로 건강 관련 기능을 일괄 ‘없음’ 처리하지 않는다. Mental and behavioral health 관련성 검토. [건강 선언](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en), [분류](https://support.google.com/googleplay/android-developer/answer/13996367?hl=en)
- **생성형 AI**: 적용 대상 기능에는 앱 내부의 부적절한 결과 신고 경로 필요. 현재 AI 결과 화면의 신고 경로를 확인하지 못했다. [AI 정책](https://support.google.com/googleplay/android-developer/answer/13985936?hl=en), [적용 범위](https://support.google.com/googleplay/android-developer/answer/14094294?hl=en)

### Apple App Store

- **SDK**: 2026-04-28부터 iOS/iPadOS 26 SDK 이상으로 빌드. 해당 SDK가 있는 Xcode로 Archive. 최소 지원 OS 15와 빌드 SDK 26은 서로 다른 값이다. [SDK 요구사항](https://developer.apple.com/news/?id=ueeok6yw)
- **로그인 4.8**: 주 계정을 제3자 로그인으로 제공하면 이메일 비공개 등을 지원하는 동등 로그인 필요. 현재 앱은 Sign in with Apple 활성·검증이 적합한 보완 방안. 게스트 기능만으로 예외라고 판단하지 않는다. [4.8 원문](https://developer.apple.com/app-store/review/guidelines/#login-services)
- **1.2 / 2.1 / 5.1**: UGC 신고·차단·운영 대응, 완성된 기능, 공개 방침·앱 내 삭제 점검. 개인정보를 외부 AI로 전달할 때 전송처·용도 공개와 명시적 허락 필요. 검사 해석의 ‘무료로 열기’만으로 완료 판단 금지. [심사 지침](https://developer.apple.com/app-store/review/guidelines/)
- **App Privacy**: 이메일은 Contact Info / Email Address, 식별값은 Identifiers / User ID, 프로필 사진은 User Content / Photos or Videos 범주 검토. SDK·WebView 포함. Google과 일시 처리 제외 기준이 다르다. [신고 기준](https://developer.apple.com/app-store/app-privacy-details/)
- **Privacy Manifest**: Capacitor는 대상 SDK. 설치 패키지의 `PrivacyInfo.xcprivacy` 존재뿐 아니라 최종 Archive 포함·Required Reason API 사유 확인. 실제 추적이 있으면 ATT 판단. [SDK 요건](https://developer.apple.com/support/third-party-SDK-requirements/)
- **연령 등급**: 4+/9+/13+/16+/18+ 및 지역별 차이 반영. 의료·웰니스, UGC, AI, 랜덤 보상 등에 실제 기능으로 답한다. 만 14세 이상 이용 조건과 자동 등급이 어긋나면 상향 검토. [최신 등급 안내](https://developer.apple.com/news/?id=ks775ehf)

## 콘솔 입력 정보와 문구

| 항목 | 입력 초안 |
|---|---|
| 앱 이름 | 누리 마인드 |
| 패키지 / 번들 ID | `kr.nuri.mind` |
| 운영 주체 | 엔에이치홀딩스 / 대표 김윤혜 / 사업자 525-20-02937 |
| 연락처 | ace@nuriholdem.com / 070-8098-1727 |
| 사업장 | 경기도 남양주시 다산중앙로82번안길 166-46, 207-본244호(다산동, 파인듀파크빌딩) |
| 서비스 / 지원 | https://www.nurimind.co.kr/ / https://www.nurimind.co.kr/about |
| 개인정보처리방침 | https://www.nurimind.co.kr/legal/privacy |
| 계정·데이터 삭제 | https://www.nurimind.co.kr/account-deletion |
| 카테고리 초안 | 엔터테인먼트 또는 라이프스타일. 건강 선언은 실제 기능으로 별도 판단 |
| 버전 | 기본 1.0.0 / Android versionCode 1. 업로드 이력 확인 후 VERSION_CODE·VERSION_NAME 지정 |

판매자 이름은 개발자 계정에 검증된 실제 이름으로 확정한다. Apple/Google 계정·계약·사업자 인증과 등록증 원본은 미확인. 연락처 원본은 `src/data/company.ts`다.

Google 짧은 설명(80자 이내):

> 심리검사·인지 과제와 운세 콘텐츠로 나를 이해하는 시간을 가져 보세요.

Apple 부제(30자 이내):

> 심리검사와 운세로 만나는 나

Apple 키워드(100자 이내):

> 심리검사,성향,자기이해,기억,집중,인지,운세,사주,타로,꿈해몽

공통 상세 설명(4,000자 이내):

> 나를 조금 더 알아가는 시간, 누리 마인드.
>
> 심리검사와 기억·집중 등 인지 과제를 통해 나의 성향과 강점을 돌아보세요. 검사 소개를 읽고 문항에 답하면 동물 캐릭터와 함께 결과를 확인할 수 있습니다. 기기에 남은 검사 이력은 프로필에서 다시 열어 볼 수 있습니다.
>
> 심리 매거진과 운세·사주·별자리·타로·꿈 해몽 콘텐츠도 만나 보세요. 일부 콘텐츠에는 AI가 만든 해석이 포함되며 정확성을 보장하지 않습니다.
>
> 닉네임과 필수 동의로 게스트 이용을 시작할 수 있습니다. 카카오 로그인은 계정 연동 기능에 사용되며, 로그인 시 계정 식별값·닉네임·프로필 사진 URL·이메일을 제공받습니다. 이용자가 직접 게시하는 익명 커뮤니티가 있습니다.
>
> 누리 마인드는 의료 진단·치료 서비스가 아니며 검사·인지 과제 결과는 자기이해 참고용입니다. 운세 콘텐츠는 오락용이며 미래를 보장하지 않습니다. 도움이 필요할 때는 전문가와 상담해 주세요. 서비스 이용은 만 14세 이상을 대상으로 합니다.
>
> 개인정보처리방침: https://www.nurimind.co.kr/legal/privacy
> 계정 삭제 안내: https://www.nurimind.co.kr/account-deletion
> 문의: ace@nuriholdem.com

최종 배포본에 위 기능이 있을 때 사용한다. 제외한 기능은 설명·이미지·설문에서도 제외한다. iOS Apple 로그인 활성 후 설명에 반영한다. 판매·설문·진단 정확도·검사 개수·검증된 백분위 등의 미확인 주장을 추가하지 않았다.

## Data safety / App Privacy 대응표

최종 네이티브 빌드의 환경·네트워크·공급자 보관을 확인한 뒤 저장한다. 로그인 시 필수 scope와 앱 전체에서 수집 거부/게스트 이용 가능 여부는 다른 질문이다.

| 실제 항목 | Google 유형 후보 | Apple 유형 후보 | 목적·연결·신고 판단 |
|---|---|---|---|
| 이메일 | Personal info / Email address | Contact Info / Email Address | 계정 인증·관리, 사용자 연결. 로그인 시 필수; 게스트 가능하므로 전체 required 여부 별도 판단 |
| 닉네임 | Personal info / Name | Name 또는 화면 이름의 User ID 기준 | 계정·프로필, 사용자 연결 |
| 카카오·Supabase ID | User IDs | Identifiers / User ID | 인증·계정 관리, 사용자 연결 |
| 프로필 사진 URL | Photos 범주 검토 | Photos or Videos 범주 검토 | 인증 메타데이터. 사진첩 권한이 없다고 사진 정보 미수집으로 답하지 않음 |
| 포인트·우편함·교환·AI 횟수 | App interactions / Other actions | Product Interaction / Other Usage Data | 서버 기록, 사용자 연결. 결제 꺼짐이므로 없는 카드·구매 기록을 수집으로 답하지 않음 |
| 글·댓글·기기 익명 식별값 | Other user-generated content / Device or other IDs | Other User Content / Device ID | 게시 시 전송·공개. 해시 식별값도 완전 익명으로 단정하지 않음 |
| 일반 검사·운세 입력 | 기기 내 처리만인 경로는 미수집 | 기기 내 처리만인 경로는 미수집 | AI·공유 등 외부 전송 경로와 분리 |
| AI 입력: 결과 요약·생일·꿈 내용 등 | User-generated content / Other personal info / 건강에 해당 시 Health info | Other User Content / Other Data / 건강에 해당 시 Health | 외부 전송. 공급자 보관 확인 전 일시 처리 제외 확정 금지 |
| 교환 수령 정보·문의 | Phone number 등 실제 항목 / 사용자 콘텐츠 | Phone Number / Customer Support | 최종 입력·전송 payload로 확정. 포괄적인 ‘전화 미수집’ 답변 금지 |
| Sentry 오류 | Crash logs / Diagnostics | Crash Data / Performance Data | DSN 설정 시 전송. sendDefaultPii=false가 모든 개인정보 없음의 증거는 아님 |
| GA4 | App interactions / Device or other IDs 등 | Product Interaction / Device ID 등 | hostname 기준으로 활성. 기본 native localhost에서는 비활성이나 최종 빌드로 검증; 별도 native guard 없음 |
| 웹 푸시 구독 | Device or other IDs 등 | Device ID 등 | 동의·구독 시 전송. 네이티브 알림 검증과 별도 |

Google 서비스 제공자 예외가 적용돼도 **수집** 신고는 별도다. Supabase 사용만으로 모든 sharing 답을 ‘아니오’로 확정하지 않는다. Apple 사용자 연결·추적도 따로 판단한다. native 광고는 `adsEnabled()` guard로 비활성, AdMob 미연동. 웹 AdSense와 앱 광고 설문을 혼동하지 않는다. [Google 분류](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [Apple 분류](https://developer.apple.com/app-store/app-privacy-details/)

## 심사 동선과 노트

1. 첫 실행 → 닉네임 → 만 14세 이상·필수 문서 동의 → 시작.
2. 홈 → 검사 소개 → 문항 응답 → 실제 결과.
3. 프로필 → 이력 → 같은 결과 재열람.
4. 프로필/우편함 → 카카오 로그인 → 외부 인증 → 앱 복귀.
5. 프로필 → 로그아웃 → 게스트. 재로그인 계정 선택/인증 확인.
6. 프로필 → 계정 삭제 → 확인. 익명 게시물 별도 삭제 안내 확인.
7. 소개·사업자·개인정보처리방침·삭제 안내는 가입 없이 열람.

App Review Notes / App access 초안:

> The app provides self-understanding assessments, cognitive activities and entertainment content. It does not provide medical diagnosis or treatment. A guest flow is available after nickname entry and required consent. Assessment results remain on the device unless the user requests an AI interpretation or another feature explicitly transmits data. Kakao sign-in is used for account-linked features. Account deletion is available in Profile. Public instructions: https://www.nurimind.co.kr/account-deletion. Purchases and surveys are currently disabled.

로그인 전용 기능에 필요한 작동하는 테스트 계정·접근 방법을 콘솔 비공개 입력란에 제공해야 한다. OTP·개인 소셜 계정 자동 로그인만 의존하지 않는다. 비밀번호는 저장소·첨부 PDF에 적지 않는다. iOS에는 활성·검증한 Apple 로그인 동선을 추가한다. 아직 없는 테스트 계정을 제공했다고 적지 않는다.

## 이미지와 서명 업로드본

- Google: 아이콘 512×512, 32bit PNG, 최대 1,024KB. 기능 그래픽 1,024×500 JPG/24bit PNG. 스크린샷 최소 2장, JPG/24bit PNG, 320~3840px, 긴 변이 짧은 변의 2배 이하. 권장 노출을 위해 실제 Android 화면 1080×1920 4장 이상 준비. [공식 규격](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
- Apple: 실제 iOS/시뮬레이터 촬영 및 Connect 기기별 슬롯 사용. 6.9인치 iPhone, iPad 지원 시 13인치 허용 규격 확인. 예: iPad 2064×2752 또는 2048×2732. [공식 규격](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- 장면: 홈 → 검사 소개 → 문항 → 결과 → 운세 → 이력. 개인정보·삭제는 별도 심사 증거. 긴 카카오용 브라우저 캡처를 iPhone 설치 화면으로 표기하지 않는다.
- 업로드는 Google 서명 AAB / Apple Archive. 기존 CI debug APK는 테스트용. 업로드 키·프로비저닝·유료 개발자 가입·판매 계약을 이번에 생성/변경하지 않았다.

## 개인정보 보완과 작업 범위

공통 원본 `src/data/legalDocs.ts`를 공개 전문(`pages/Legal`)과 가입 시트(`components/LegalSheet`)가 함께 읽는다. 목적·수집 항목·경로·거부 시 영향·보관·삭제·Supabase 국외 이전을 함께 보완했다. 사진 URL과 사진첩 수집을 구별하고 이메일을 자동 마케팅 동의로 처리하지 않음을 명시했다. 계정 삭제 안내도 3언어에 반영했다.

시행일 2026-10-05와 `LEGAL_VERSION`은 유지하며 **2026-10-06 기존 처리 항목 고지 보완**을 상단·변경 이력에 표시했다. scope·이용 목적을 새로 확대한 변경은 아니다. 이 수정으로 과거 고지·동의의 적법성이 소급 확인되거나 사전 공지·재동의 의무가 충족되었다고 판단하지 않는다. 향후 실제 처리 변경에는 방침 제17조의 공지 및 필요한 동의를 적용한다. [개인정보위 현재 작성지침(2026.4.)](https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=D010000000&nttId=12018)

체크아웃: `C:/Users/buffy/.codex/worktrees/d86d/NURI MIND`, 브랜치 `codex/kakao-review-20261006`, 기반 `786119d`. Codex 역할은 코드·자료와 검증. 운영자는 원본 서류·개발자 계정 인증·서명 소유권·테스트 계정 제공·최종 제출 담당. 현재 호스트 모델로 개인정보 흐름·정책 대조를 수행했으며 정확한 모델 ID는 도구에 노출되지 않아 임의 기재하지 않았다.

| 도구·가용성 확인 | 실행/인증 상태 |
|---|---|
| 스킬·브라우저 플러그인 | 기존 built-in-browser SKILL.md 읽고 CUA 실제 호출 성공. 운영 동선·카카오 scope 확인 |
| 공식 웹 조회 | Google·Apple·개인정보위 원문 호출 성공. 위 근거 링크 사용 |
| Vercel MCP / CLI | MCP 인증된 배포 조회 성공. CLI 설치와 로그아웃 상태 구분 |
| GitHub CLI | 인증된 CI 조회 성공. debug APK와 스토어 서명본 구분 |
| npm·TypeScript·Playwright | 설치된 도구 사용. 새 의존성·SDK 설치 없음 |
| Android / Apple 환경 | SDK 36·adb 존재, Java PATH 미확인. Mac/Xcode·새 네이티브 빌드 미검증 |
| 스토어 등록 MCP·커넥터 | 현재 사용 가능한 등록 API·인증된 콘솔 확인 못 함. 공식 콘솔에서 입력 |
| hooks·에이전트·자동화 | 기존 CI·저장소 훅 존재 확인. 새 hooks·하위 에이전트·예약 작업 생성 없음 |

수용 기준: 공통 원본에 이메일·사진·목적·보관·삭제·이전 표시, 가입 시트와 공개 전문 동일 표시, `npm run verify` 및 관련 기존 E2E 통과. **운영 완료는 공개 URL 본문 대조**, **출시 완료는 서명본 설치·인증·삭제·정책 설문·심사 승인**으로 구분한다.

이번 수정 검증: 스모크 16개·타입·프로덕션 빌드·번들 예산 통과, 관련 기존 온보딩·접근성 E2E **14/14 통과**, [PR 전체 E2E 82/82](https://github.com/buffyfan9303-spec/nuri-mind/actions/runs/37347025427) 및 [PR CodeQL·gitleaks 통과](https://github.com/buffyfan9303-spec/nuri-mind/actions/runs/37347025366). E2E는 dummy Supabase 설정과 외부 요청 제어를 사용하며 실제 계정 삭제·네이티브 설치 증거가 아니다.

[PR #17](https://github.com/buffyfan9303-spec/nuri-mind/pull/17)을 머지하고 Vercel MCP에서 production READY·SHA `bb92f99d459462f540fa857c993dfaffe4e35c40`를 확인했다. CUA에서 운영 공개 전문이 로컬 수정 전문과 완전히 일치함을 대조하고 가입 전 시트와 삭제 안내에도 이메일·사진 항목이 표시됨을 확인했다. [운영 전문 화면](store-review/2026-10-06/개인정보처리방침_운영반영.png), [운영 가입 시트](store-review/2026-10-06/가입시트_운영반영.png), [방침 전문 TXT](store-review/2026-10-06/개인정보처리방침_보완본.txt), [운영 확인 기록](store-review/2026-10-06/운영반영_검증기록.txt). 후속 검증 자료는 이 체크아웃에 보관하며 실제 스토어 신청은 실행하지 않았다.

관련 자료: [결제 개시 조건](BILLING.md), [카카오 심사·실제 웹 점검](kakao-review/2026-10-06/검증및제출안내.md). 이번 개인정보 누락 수정과 남은 스토어 구현을 분리했다.
