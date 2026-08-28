/**
 * AI 키 설정 도우미 — `npm run setup:ai`  (검증용: `npm run setup:ai -- --dry-run`)
 *
 * 키 입력은 이 스크립트를 실행하는 사람의 터미널에서만 일어나고, 값은 화면에도 로그에도 남지 않는다.
 *
 * ⚠️ 이 스크립트의 1차 버전은 두 가지가 틀렸다. 같은 함정을 다시 밟지 않도록 남긴다:
 *   1) stdout.clearLine()은 TTY에서만 존재한다 — 파이프로 실행하면 TypeError로 죽었다.
 *   2) `secrets set KEY="$VAR"` 를 shell:true로 넘겼는데, Windows cmd는 $VAR를 확장하지 않는다.
 *      크래시도 없이 시크릿에 문자열 "$NURI_AI_KEY" 가 그대로 저장돼, 나중에 "키가 틀렸다"는
 *      엉뚱한 곳을 파게 만든다. 조용히 잘못되는 쪽이 크래시보다 나쁘다.
 *      → 지금은 임시 .env 파일 + `--env-file` 로 넘기고 finally에서 반드시 지운다.
 */
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { writeFileSync, unlinkSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { stdin, stdout, argv } from 'node:process'

const PROJECT_REF = 'xdcglyavndiwbbaryocx'
const DRY = argv.includes('--dry-run')

/** 입력을 화면에 남기지 않는 프롬프트. TTY가 아니면 가리지 못한다는 사실을 숨기지 않는다. */
function askSecret(question) {
  const canHide = stdin.isTTY && typeof stdout.clearLine === 'function'
  if (!canHide) stdout.write('⚠️  터미널이 아니라 입력을 가릴 수 없습니다(파이프 실행).\n')

  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: canHide })
    let onData
    if (canHide) {
      onData = () => {
        stdout.clearLine(0)
        stdout.cursorTo(0)
        stdout.write(question)
      }
      stdin.on('data', onData)
    }
    rl.question(question, (answer) => {
      if (onData) stdin.off('data', onData)
      rl.close()
      stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout })
    rl.question(question, (a) => {
      rl.close()
      resolve(a.trim())
    })
  })
}

/** 형식을 먼저 거른다 — 잘못된 값을 넣고 나중에 원인을 찾는 게 제일 오래 걸린다 */
function classify(key) {
  if (/^AIza[0-9A-Za-z_-]{30,}$/.test(key)) {
    return { ok: true, name: 'GOOGLE_API_KEY', provider: 'Gemini', expect: 'google · gemini-3.7-flash' }
  }
  if (/^sk-ant-[0-9A-Za-z_-]{20,}$/.test(key)) {
    return { ok: true, name: 'ANTHROPIC_API_KEY', provider: 'Claude', expect: 'anthropic · claude-opus-5' }
  }
  if (/^ya29\.|^AQ\./.test(key)) {
    return {
      ok: false,
      why:
        'OAuth 액세스 토큰으로 보입니다(보통 1시간이면 만료). API 키가 아닙니다.\n' +
        '     Gemini 키는 https://aistudio.google.com/apikey 에서 AIza… 형태로 발급됩니다.',
    }
  }
  return { ok: false, why: '알 수 없는 형식입니다. Gemini는 AIza…, Anthropic은 sk-ant-… 로 시작합니다.' }
}

/** 값이 제대로 전달됐는지 눈으로 확인하되 전체는 보이지 않는다 */
const fingerprint = (k) => `${k.length}자 · ${k.slice(0, 4)}…${k.slice(-4)}`

console.log(`
┌─ 누리 마인드 AI 키 설정 ${DRY ? '(예행연습 — 실제로 등록하지 않음)' : ''}
│ 대상 프로젝트: ${PROJECT_REF} (nuri mind)
│ 키 값은 화면·셸 기록·프로세스 목록 어디에도 남지 않습니다.
│ 발급: Gemini → https://aistudio.google.com/apikey
└────────────────────────────────────────────────────
`)

const key = await askSecret('API 키를 붙여넣고 Enter: ')
if (!key) {
  console.log('입력이 없어 종료합니다.')
  process.exit(1)
}

const kind = classify(key)
if (!kind.ok) {
  console.log(`\n❌ 이 값은 등록하지 않았습니다.\n   ${kind.why}\n`)
  process.exit(1)
}

console.log(`\n✅ ${kind.provider} 키로 인식 → 시크릿 이름 ${kind.name}`)
console.log(`   전달될 값: ${fingerprint(key)}`)

if (DRY) {
  console.log('\n예행연습이라 여기서 멈춥니다. 위 지문이 실제 키와 맞으면 전달 경로는 정상입니다.\n')
  process.exit(0)
}

const go = await ask('이 프로젝트에 등록할까요? (y/N) ')
if (go.toLowerCase() !== 'y') {
  console.log('취소했습니다.')
  process.exit(0)
}

// 인자로 넘기면 프로세스 목록에, $VAR로 넘기면 Windows에서 확장되지 않는다.
// 임시 .env 파일이 두 문제를 모두 피하는 유일한 경로 — 대신 반드시 지운다.
const dir = mkdtempSync(join(tmpdir(), 'nuri-ai-'))
const envPath = join(dir, '.env')
let status = 1
try {
  writeFileSync(envPath, `${kind.name}=${key}\n`, { mode: 0o600 })
  // ⚠️ Windows에서 npx는 npx.cmd다. Node 20+ 보안 패치(CVE-2024-27980) 이후
  //    .cmd/.bat은 shell:true 없이 spawn하면 EINVAL로 거부된다 — 실제로 이걸로 실패했다.
  //    그래서 셸을 쓰되, 셸에 닿는 건 임시 파일 '경로'뿐이고 키 값은 파일 안에만 있다.
  //    (경로는 우리가 만든 mkdtemp 결과라 인젝션 여지가 없다)
  const r = spawnSync(`npx supabase secrets set --env-file "${envPath}" --project-ref ${PROJECT_REF}`, {
    stdio: 'inherit',
    shell: true,
  })
  if (r.error) console.log(`
실행 오류: ${r.error.code ?? ''} ${r.error.message ?? ''}`)
  status = r.status ?? 1
} finally {
  try {
    if (existsSync(envPath)) unlinkSync(envPath)
    rmSync(dir, { recursive: true, force: true })
  } catch {
    console.log(`\n⚠️  임시 파일을 지우지 못했습니다. 직접 삭제하세요: ${envPath}`)
  }
}

if (status !== 0) {
  console.log(`
❌ 등록에 실패했습니다.
   로그인이 안 돼 있을 수 있어요:  npx supabase login
`)
  process.exit(1)
}

console.log(`
✅ 등록 완료.

확인 (30초):
  1) https://www.nurimind.co.kr
  2) 프로필 → 운영자 콘솔 → PIN 5690
  3) '현황' 탭 → 🩺 AI 연결 진단 → [3종 함수 진단 실행]

  3종 모두 "✅ 정상 (${kind.expect})" 이면 끝입니다.
  실패하면 화면이 원인(키 오타 / 할당량 / 모델명)까지 구분해 알려줍니다.

참고: 두 제공자 키를 다 넣으면 Claude가 우선입니다.
      Gemini로 강제:  npx supabase secrets set LLM_PROVIDER=google --project-ref ${PROJECT_REF}
`)
