// 커밋 직전 비밀 검사 — 누리홀덤 .githooks/pre-commit(secretlint)을 의존성 없이 옮겼다.
//
// 왜: 저장소가 공개되면 이력이 곧 공개다. 새면 삭제 커밋이 아니라 **키 로테이션**이 답이다.
// 이 저장소엔 실제로 VAPID·PUSH_ADMIN_TOKEN이 담긴 PUSH-KEYS.local.txt가 루트에 있고,
// 채팅으로 Gemini 토큰이 붙여 넣어진 적도 있다. 커밋 단계가 마지막 로컬 방어선이다.
//
// 공개 키(anon JWT·publishable·VAPID 공개키·GA·AdSense)는 통과시킨다 — 원래 번들에 박히는 값이다.
// 홀덤 교훈: 파일이 많으면 xargs 인자 한계로 훅이 '비밀 발견'이라고 거짓 실패해 사람이 --no-verify로 우회했다.
//            그래서 파일 목록을 인자로 넘기지 않고 git에서 직접 읽는다.
import { execFileSync } from 'node:child_process'

// -z 필수: 없으면 git이 한글 파일명을 "\353\210…"처럼 따옴표·8진수로 감싸 내보내고,
// 그 이름으로 git show를 부르면 실패해 **그 파일은 조용히 검사에서 빠진다**(이 저장소엔 한글 파일명이 있다).
const staged = execFileSync('git', ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], { encoding: 'utf8' })
  .split('\0')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((f) => !/^(node_modules|dist|test-results|playwright-report)\//.test(f))
  .filter((f) => !/\.(png|jpe?g|gif|webp|ico|woff2?|ttf|pdf|zip)$/i.test(f))

const FORBIDDEN_FILES = /(^|\/)(\.env(\.[^/]*)?|PUSH-KEYS[^/]*|[^/]*\.(pem|key|p12|pfx)|service-account[^/]*\.json)$/
const ALLOWED_FILES = /(^|\/)\.env\.example$/

const PATTERNS = [
  { name: 'Anthropic API 키', re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'Google API 키', re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'Google OAuth 토큰', re: /\bya29\.[0-9A-Za-z_-]{20,}|\bAQ\.[A-Za-z0-9_-]{30,}/ },
  { name: 'OpenAI 키', re: /sk-(proj-)?[A-Za-z0-9]{32,}/ },
  { name: '개인키 블록', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'GitHub 토큰', re: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: 'Supabase 비밀키', re: /sb_secret_[A-Za-z0-9_-]{20,}/ },
  { name: 'VAPID 개인키 할당', re: /VAPID_PRIVATE[A-Z_]*\s*[:=]\s*['"]?[A-Za-z0-9_-]{30,}/ },
  { name: '푸시 관리자 토큰 할당', re: /PUSH_ADMIN_TOKEN\s*[:=]\s*['"]?[A-Za-z0-9_-]{16,}/ },
]

// JWT는 payload의 role을 열어 본다 — anon은 공개, service_role은 치명
function jwtRole(tok) {
  try {
    const p = tok.split('.')[1]
    const json = Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return JSON.parse(json).role ?? null
  } catch {
    return null
  }
}

const problems = []
for (const f of staged) {
  if (FORBIDDEN_FILES.test(f) && !ALLOWED_FILES.test(f)) {
    problems.push(`${f}: 비밀 파일 자체가 스테이징됨`)
    continue
  }
  let text
  try {
    text = execFileSync('git', ['show', `:${f}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  } catch {
    continue
  }
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    for (const p of PATTERNS) if (p.re.test(line)) problems.push(`${f}:${i + 1}: ${p.name}`)
    for (const m of line.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g)) {
      const role = jwtRole(m[0])
      if (role && role !== 'anon' && role !== 'authenticated') problems.push(`${f}:${i + 1}: JWT(role=${role})`)
    }
  })
}

if (problems.length) {
  console.error('✖ 비밀로 보이는 것이 스테이징돼 있어요:\n' + problems.map((p) => '  - ' + p).join('\n'))
  console.error('\n값은 .env(로컬)·Supabase 시크릿(서버)으로 옮기고 다시 커밋하세요.')
  console.error('이미 푸시된 적이 있다면 삭제보다 **키 로테이션이 먼저**예요.')
  process.exit(1)
}
