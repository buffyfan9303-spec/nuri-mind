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
