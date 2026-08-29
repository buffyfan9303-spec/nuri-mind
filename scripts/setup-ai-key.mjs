/**
 * AI 키 설정 도우미
 *
 *   node "<프로젝트>/scripts/setup-ai-key.mjs"            등록
 *   node "<프로젝트>/scripts/setup-ai-key.mjs" --check    등록 없이 사전 점검만(키 불필요)
 *   node "<프로젝트>/scripts/setup-ai-key.mjs" --dry-run  키는 받되 등록하지 않고 지문만 확인
 *
 * ⚠️ PowerShell 실행 정책이 Restricted면 npm/npx를 못 띄운다(그것들이 .ps1 껍데기라서).
 *    node.exe는 진짜 실행파일이라 무관하고, 내부 npx 호출도 Node가 ComSpec(cmd.exe)을 쓰므로
 *    정책 영향을 받지 않는다. 어느 폴더에서 실행하든 프로젝트 루트는 스스로 잡는다.
 *
 * ⚠️ 이 스크립트가 과거에 틀렸던 것들 — 같은 함정을 다시 밟지 않도록 남긴다:
 *   1) stdout.clearLine()은 TTY에만 존재 → 파이프 실행 시 TypeError
 *   2) `KEY="$VAR"` 를 shell:true로 넘김 → Windows cmd는 $VAR를 확장하지 않아
 *      시크릿에 문자열 "$VAR"가 그대로 저장됐다. 조용히 잘못되는 쪽이 크래시보다 나쁘다.
 *   3) npx.cmd를 shell:false로 spawn → Node 20+ 보안 패치(CVE-2024-27980)로 EINVAL
 *   4) exit 코드만 보고 "등록 완료"라고 말했다 → 실제로는 등록이 안 돼 있었다.
 *      이제 등록 후 반드시 다시 읽어서 확인한다.
 */
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { writeFileSync, unlinkSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { stdin, stdout, argv } from 'node:process'

const PROJECT_REF = 'xdcglyavndiwbbaryocx'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHECK = argv.includes('--check')
const DRY = argv.includes('--dry-run')

/** supabase CLI 호출. 실패해도 던지지 않는다 — 사유를 화면에 그대로 보여줘야 하니까. */
function cli(args) {
  const r = spawnSync(`npx supabase ${args}`, { shell: true, cwd: ROOT, encoding: 'utf8' })
  return {
    status: r.status,
    out: (r.stdout ?? '').trim(),
    err: (r.stderr ?? '').trim(),
    spawnError: r.error ? `${r.error.code ?? ''} ${r.error.message ?? ''}`.trim() : '',
  }
}

/** CLI 출력에 배너가 섞여 나오므로 마지막 JSON 줄만 골라 파싱한다 */
function lastJson(text) {
  const line = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('{'))
    .pop()
  if (!line) return null
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}

function secretNames() {
  const r = cli(`secrets list --project-ref ${PROJECT_REF}`)
  const j = lastJson(r.out) ?? lastJson(r.err)
  if (!j?.secrets) return { ok: false, names: [], why: r.err || r.out || r.spawnError || '응답을 읽지 못함' }
  return { ok: true, names: j.secrets.map((s) => s.name), why: '' }
}

/* ─────────────────────── 사전 점검 ─────────────────────── */

function preflight() {
  const rows = []
  const add = (name, ok, note = '') => rows.push({ name, ok, note })

  add('Node 실행', true, process.version)

  const ver = cli('--version')
  const cliOk = ver.status === 0 && /\d+\.\d+/.test(ver.out)
  add('supabase CLI', cliOk, cliOk ? `v${ver.out}` : ver.spawnError || ver.err || '실행 실패')

  let names = []
  if (cliOk) {
    // 로그인이 안 됐거나 프로젝트 접근 권한이 없으면 여기서 걸린다 — 등록 실패의 대부분이 이 경우다
    const s = secretNames()
    add('로그인 · 프로젝트 접근', s.ok, s.ok ? `시크릿 ${s.names.length}개 조회됨` : s.why.slice(0, 160))
    names = s.names
  } else {
    add('로그인 · 프로젝트 접근', false, 'CLI가 안 떠서 확인 불가')
  }

  const has = ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'ANTHROPIC_API_KEY'].filter((k) => names.includes(k))
  add('AI 키 등록 여부', has.length > 0, has.length ? has.join(', ') : '아직 없음 — 이 스크립트로 등록하세요')

  // 한글은 터미널에서 2칸을 차지한다 — .length로 padEnd하면 열이 어긋난다
  const width = (t) => [...t].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x1100 ? 2 : 1), 0)
  const w = Math.max(...rows.map((r) => width(r.name)))
  console.log('\n사전 점검')
  for (const r of rows) console.log(`  ${r.ok ? '✅' : '❌'} ${r.name}${' '.repeat(w - width(r.name))}  ${r.note}`)

  const blocked = rows.find((r) => !r.ok && r.name !== 'AI 키 등록 여부')
  if (blocked) {
    console.log(`\n막힌 지점: ${blocked.name}`)
    console.log(
      blocked.name === 'supabase CLI'
        ? '  · 인터넷 연결을 확인하세요(npx가 CLI를 내려받습니다).'
        : '  · 로그인이 필요할 수 있습니다:  npx supabase login',
    )
  }
  console.log()
  return !blocked
}

/* ─────────────────────── 입력 ─────────────────────── */

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
  if (/^AIza/.test(key)) {
    return { ok: false, why: `구글 키 형태지만 길이가 짧습니다(${key.length}자). 붙여넣기가 잘렸는지 확인하세요.` }
  }
  return { ok: false, why: `알 수 없는 형식입니다(${key.length}자). Gemini는 AIza…, Anthropic은 sk-ant-… 로 시작합니다.` }
}

const fingerprint = (k) => `${k.length}자 · ${k.slice(0, 4)}…${k.slice(-4)}`

/* ─────────────────────── 본류 ─────────────────────── */

console.log(`
┌─ 누리 마인드 AI 키 설정 ${CHECK ? '(점검만)' : DRY ? '(예행연습)' : ''}
│ 프로젝트: ${PROJECT_REF} (nuri mind)
│ 발급: Gemini → https://aistudio.google.com/apikey
└────────────────────────────────────────────────────`)

const ready = preflight()
if (CHECK) process.exit(ready ? 0 : 1)
if (!ready) {
  console.log('사전 점검이 통과하지 않아 중단합니다. 위 안내를 먼저 해결해 주세요.\n')
  process.exit(1)
}

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
// 임시 .env 파일이 두 문제를 모두 피하는 유일한 경로 — 대신 finally에서 반드시 지운다.
const dir = mkdtempSync(join(tmpdir(), 'nuri-ai-'))
const envPath = join(dir, '.env')
let result
try {
  writeFileSync(envPath, `${kind.name}=${key}\n`, { mode: 0o600 })
  console.log('\n등록 중…')
  result = cli(`secrets set --env-file "${envPath}" --project-ref ${PROJECT_REF}`)
} finally {
  try {
    if (existsSync(envPath)) unlinkSync(envPath)
    rmSync(dir, { recursive: true, force: true })
  } catch {
    console.log(`\n⚠️  임시 파일을 지우지 못했습니다. 직접 삭제하세요: ${envPath}`)
  }
}

// ⚠️ exit 코드만 믿지 않는다 — 0을 받고도 등록이 안 돼 있던 적이 있다. 읽어서 확인한다.
const after = secretNames()
if (!(after.ok && after.names.includes(kind.name))) {
  console.log(`
❌ 등록되지 않았습니다.

  CLI 종료코드: ${result?.status ?? '(없음)'}
${result?.spawnError ? `  실행 오류: ${result.spawnError}\n` : ''}${result?.out ? `  출력: ${result.out.slice(0, 400)}\n` : ''}${result?.err ? `  오류: ${result.err.slice(0, 400)}\n` : ''}  확인 결과: ${after.ok ? `현재 시크릿 [${after.names.join(', ')}]` : after.why.slice(0, 200)}

  위 내용을 그대로 알려주시면 원인을 짚을 수 있습니다.
`)
  process.exit(1)
}

console.log(`
✅ 등록 확인 완료 — ${kind.name} 이(가) 실제로 존재합니다.

다음 (30초):
  1) https://www.nurimind.co.kr
  2) 프로필 → 운영자 콘솔 → PIN 5690
  3) '현황' 탭 → 🩺 AI 연결 진단 → [3종 함수 진단 실행]

  3종 모두 "✅ 정상 (${kind.expect})" 이면 끝입니다.

참고: 두 제공자 키를 다 넣으면 Claude가 우선입니다.
      Gemini로 강제하려면 LLM_PROVIDER=google 시크릿을 추가하세요.
`)
