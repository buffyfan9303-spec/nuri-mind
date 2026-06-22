# 카카오 로그인 활성화 가이드 (NURI MIND)

> 클라이언트 코드는 **이미 완성**되어 있습니다(`auth.ts`/`supabase.ts`/`Onboarding`/`Mailbox`).
> 아래 **대시보드 설정만** 마치면 "카카오로 로그인" 버튼이 실제로 동작하고, 우편함·서버 경제(운영자 지급·결제 다이아·개인 우편)가 열립니다.
> 설정 전에는 버튼을 눌러도 "준비 중" 안내만 뜹니다(앱은 그대로 로컬로 동작).

프로젝트 ref: **`xdcglyavndiwbbaryocx`** · 도메인: **`https://www.nurimind.co.kr`**

---

## A. 카카오 디벨로퍼스 (developers.kakao.com)

1. **내 애플리케이션** → 앱 선택(공유용 앱 재사용 가능) 또는 **애플리케이션 추가하기**
2. **앱 설정 → 앱 키**에서 **REST API 키** 복사 → 이게 Supabase의 **Client ID**가 됩니다
3. **제품 설정 → 카카오 로그인 → 활성화 설정 ON**
4. **카카오 로그인 → Redirect URI** 등록(정확히 이 값):
   ```
   https://xdcglyavndiwbbaryocx.supabase.co/auth/v1/callback
   ```
5. **카카오 로그인 → 동의항목** → **닉네임(profile_nickname)** 을 "필수 동의"로 ON
   (⚠️ 이메일은 비즈앱 검수가 필요하므로 요청하지 않습니다 — 코드도 `profile_nickname`만 요청)
6. **앱 설정 → 보안 → Client Secret** → **코드 생성** 후 **활성화 상태 ON** → 코드 복사 → Supabase의 **Client Secret**
7. **앱 설정 → 플랫폼 → Web 플랫폼 등록** → 사이트 도메인:
   ```
   https://www.nurimind.co.kr
   http://localhost:5179        ← 로컬 테스트 시
   ```

## B. Supabase (supabase.com 대시보드 · 프로젝트 xdcglyavndiwbbaryocx)

1. **Authentication → Providers → Kakao → Enable(켜기)**
2. **Kakao Client ID** = A-2의 **REST API 키**
3. **Kakao Client Secret** = A-6의 **Client Secret 코드**
4. **Save**
5. **Authentication → URL Configuration**:
   - **Site URL**: `https://www.nurimind.co.kr`
   - **Redirect URLs** 에 추가(와일드카드 — 로그인 후 원래 페이지로 복귀):
     ```
     https://www.nurimind.co.kr/**
     http://localhost:5179/**     ← 로컬 테스트 시
     ```

## C. 동작 확인

1. 우편함(또는 가입화면)의 **"💬 카카오로 로그인"** 탭 → 카카오 동의화면 → 돌아오면 로그인 완료
2. 로그인 후 **우편함**에서 운영자 지급분(예: 윤정준·WTA에게 적재된 💎10,000)을 **"받기"** 가능
3. 가입화면에서 로그인 시 카카오 닉네임이 자동 채워짐(`onboard.kakaoReady`)

## D. 자주 헷갈리는 점

- **Redirect URI 두 개를 혼동 금지**:
  - 카카오쪽 Redirect URI = **Supabase 콜백** `https://xdcglyavndiwbbaryocx.supabase.co/auth/v1/callback`
  - Supabase쪽 Redirect URLs = **내 사이트** `https://www.nurimind.co.kr/**`
- **KOE205**(동의항목 오류) → 이메일 등 미설정 항목 요청 시 발생. 닉네임만 쓰므로 A-5만 맞추면 됨.
- **profiles 자동 생성**: 가입 시 프로필 행은 `supabase/v2-auth-economy.sql`의 `handle_new_user` 트리거가 자동 생성(이미 적용됨). 미적용이면 그 SQL부터 실행.
- 키는 **대시보드에만** 입력 — 코드/저장소엔 카카오 비밀키가 없습니다(anon 공개키만 `.env`).

---

설정 완료 후 별도 배포 불필요(클라 코드는 준비됨). 카카오·Supabase 저장 즉시 버튼이 동작합니다.
