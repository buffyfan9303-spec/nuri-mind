# 🚀 NURI MIND · Vercel 배포 가이드

- **Vercel 프로젝트 ID**: `prj_ZzAnOy7avjshtskJHe1jcMkcMAwa`
- 빌드 설정은 `vercel.json`에 명시돼 있어 자동 인식됩니다:
  - Framework: `vite` · Build: `npm run build` · Output: `dist`
  - SPA 라우팅: 모든 경로 → `/index.html` (react-router용 rewrite)

## 1단계: Vercel 환경변수 설정 (대시보드)

`.env`는 git에 올라가지 않으므로, **Vercel 대시보드 → 프로젝트 → Settings → Environment Variables**에 직접 추가하세요. (Vite는 빌드 시점에 `VITE_` 변수를 코드에 새겨 넣습니다.)

| 키 | 값 | 비고 |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xdcglyavndiwbbaryocx.supabase.co` | |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon public 키) | Supabase Settings→API |
| `VITE_ADSENSE_CLIENT` | `ca-pub-…` | 승인 후 (선택) |

세 변수 모두 없어도 배포는 됩니다(앱이 localStorage로 동작). 키를 나중에 넣고 재배포해도 OK.

## 2단계: 배포 — 아래 중 택 1

### ⓐ 내 PC에서 CLI로 (가장 빠름 · NURI CRM 배포 경험 활용)
이미 Vercel에 로그인돼 있으니, 프로젝트 폴더에서:
```powershell
npx vercel link        # "기존 프로젝트에 연결" 선택 → NURI MIND(prj_ZzAn…) 고르기
npx vercel --prod      # 프로덕션 배포
```
`vercel link`가 끝나면 `.vercel/` 폴더(org+project ID)가 생기고, 이후엔 `npx vercel --prod` 한 줄이면 됩니다.

### ⓑ GitHub 자동 배포 (NURI CRM과 동일 방식 · 추천)
1. 이 폴더를 GitHub 저장소로 push
2. Vercel 대시보드에서 해당 저장소를 위 프로젝트(prj_ZzAn…)에 연결
3. 이후 `git push`마다 자동 빌드·배포

## 3단계 (선택): 도메인 연결
Vercel → Settings → Domains 에서 `mind.nuricrm.co.kr` 같은 서브도메인 연결.

---

### 여기(에이전트)서 바로 배포하려면?
Vercel **액세스 토큰**(Settings → Tokens)과 **팀/조직 ID**가 필요합니다. 토큰은 계정 전체 권한이라 민감하니, 위 ⓐ(내 PC CLI) 방식을 권장합니다. 꼭 원하시면 토큰을 주시면 `npx vercel --prod --token=… --yes`로 진행하겠습니다.

---

## 2026-09 릴리스 (PR #2 `nuri/magical-knuth-yqet7x` → `main`) — 2026-09-24 점검

### 이미 라이브에 반영된 것 (머지 전에 먼저 나감 — 현재 main 클라와 호환 확인 완료)
- **DB**: 마이그레이션 `audit_fixes_2026_09` 적용 완료(`supabase/audit-fixes-2026-09.sql`, 주석 처리한 2곳 제외).
- **엣지 함수**(2026-09-24 PR 코드로 배포, `verify_jwt=true` 유지):
  | 함수 | 버전 | 비고 |
  |---|---|---|
  | `ai-report` | v9 | `_shared/llm.ts` 포함(타임아웃 110초·입력 자르기) |
  | `deep-report` | v9 | 〃 |
  | `fortune-detail` | v8 | 사주 필드(pillars·gender·age·strength·favorable·todayTenGod·todayIlju)는 **선택** — 옛 클라 요청 그대로 동작 |
  | `push-send` | v3 | PR 변경 없음 — **재배포 금지**(아래 ⚠️ 참고) |
  - 확인: 세 함수 모두 비JSON 본문 → `400 bad_json`, 정상 본문 → LLM 호출 단계까지 도달(현재 `500 no_key`, 아래 ①).

### 머지 순서
1. PR #2 CI·Vercel Preview(READY) 확인 → Preview에서 아래 스모크 몇 개 확인(Preview는 Vercel 로그인 필요)
2. GitHub에서 **Squash/Merge** → Vercel이 `main`을 Production으로 자동 배포(Production Branch = `main`)
3. Vercel → Deployments에서 새 Production 배포 `READY` 확인 → 아래 스모크 테스트
4. 문제 시: Vercel → Deployments → 직전 Production(현재 `cc7d344`) → **Instant Rollback**
   (엣지 함수·DB는 옛 클라와 호환이므로 프런트만 되돌리면 됨)

### 남은 수동 작업 (대시보드)
- ① **AI 키 미설정** — 세 AI 함수가 지금 `no_key`로 응답 → 앱은 정적 폴백만 보여줌(머지 전부터 그랬음).
  Supabase → Project Settings → **Edge Functions → Secrets**(또는 Edge Functions → Secrets)에
  `ANTHROPIC_API_KEY` 또는 `GOOGLE_API_KEY`(선택: `LLM_PROVIDER`, `AI_MODEL`, `GEMINI_MODEL`) 추가.
  → 운영자 화면의 AI 헬스체크(aiHealth)로 ✅ 확인.
- ② **Auth Redirect URLs** — Supabase → Authentication → **URL Configuration**:
  Site URL `https://www.nurimind.co.kr`, Redirect URLs에 `https://www.nurimind.co.kr/**`
  (+ Preview에서 카카오 로그인까지 볼 거면 `https://*-nuridream.vercel.app/**`). MCP로는 조회 불가라 눈으로 확인할 것.
  Kakao provider는 켜져 있음(`/auth/v1/settings` 확인).
- ③ **Leaked password protection** — Supabase → Authentication → Attack Protection(또는 Providers → Email) → ON.
- ④ **어드바이저 후속 SQL 검토·적용** — `supabase/advisor-fixes-2026-09.sql`(미적용). A·B·G 섹션은 클라 영향 없음,
  D(남의 글 삭제 구멍)는 클라 수정과 함께.
- ⑤ (선택) Vercel → Settings → **Environment Variables**: `VITE_SENTRY_DSN`, `VITE_GA_ID`, `VITE_KAKAO_KEY` 미등록 →
  에러 모니터링·GA·카카오 공유가 꺼져 있음. 넣으면 재배포 필요(Vite 빌드 시점 주입).
- ⚠️ `push-send`: 라이브 v3는 시크릿 미설정 시 코드 안의 폴백 값을 쓰는 버전이고, 리포 버전은 `Deno.env`만 읽는다.
  재배포 전 Edge Functions → Secrets에 `VAPID_PUBLIC_KEY`·`VAPID_PRIVATE_KEY`·`VAPID_SUBJECT`·`PUSH_ADMIN_TOKEN`이
  있는지(그리고 크론 `morning-fortune-push`의 x-admin-token과 같은지) 먼저 확인. 없으면 아침 푸시가 403으로 멈춘다.

### 스모크 테스트 (Production 배포 직후)
- https://nurimind.co.kr → `308` → https://www.nurimind.co.kr/ (apex 리다이렉트)
- https://www.nurimind.co.kr/ — 홈, 글꼴(나눔스퀘어라운드)·Fluent 이모지 아이콘 표시
- https://www.nurimind.co.kr/fonts/NanumSquareRoundB.woff2 — `200`, `Cache-Control: …immutable`, `Access-Control-Allow-Origin: *`
- https://www.nurimind.co.kr/emoji/v1/1f195.svg — `200` SVG / 없는 파일(`/emoji/v1/zzzz.svg`)은 `404`(index.html 아님)
- https://www.nurimind.co.kr/assets/없는파일.js — `404`(예전엔 index.html이 나와 SW 캐시 오염)
- https://www.nurimind.co.kr/sw.js — `Cache-Control: no-cache`, 본문에 `nurimind-v3`
- https://www.nurimind.co.kr/magazine/adhd-focus · /about · /test/… — 새로고침(딥링크) 정상
- https://www.nurimind.co.kr/fortune — 운세 결과 → 상세 운세(키 넣기 전엔 결정론 폴백)
- https://www.nurimind.co.kr/mail — 카카오 로그인 왕복 후 같은 페이지로 복귀
- https://www.nurimind.co.kr/api/og · /api/duel?r=… — 공유 카드/리다이렉트
- https://www.nurimind.co.kr/robots.txt · /sitemap.xml · /ads.txt(`pub-6018943099120763`) · /manifest.webmanifest
- 응답 헤더: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`
- Vercel → Observability/Logs: `/api/*` 런타임 오류 없는지(배포 전 7일: 0건)
