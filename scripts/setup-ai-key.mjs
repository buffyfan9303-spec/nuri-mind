/**
 * AI 키 설정 도우미 — `npm run setup:ai`
 *
 * 키 입력은 이 스크립트를 실행하는 사람의 터미널에서만 일어난다(입력은 화면에 표시되지 않는다).
 * 스크립트가 하는 일은 시크릿 등록과 배포·확인 안내뿐이고, 키 값을 파일이나 로그에 남기지 않는다.
 *
 * 왜 스크립트인가: supabase secrets set 한 줄이면 되지만, 실제로는 그 앞뒤가 더 헷갈린다 —
 * 키 형식이 맞는지, 어느 프로젝트인지, 넣고 나서 뭘 눌러 확인하는지. 그걸 한 번에 끝낸다.
 */
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { stdin, stdout } from 'node:process'

const PROJECT_REF = 'xdcglyavndiwbbaryocx'

/** 입력을 에코하지 않는 프롬프트 — 어깨너머·터미널 스크롤백에 키가 남지 않게 */
function askSecret(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true })
    const onData = (ch) => {
      // 개행이 오기 전까지는 커서를 되돌려 입력 문자를 지운다
      if (!['\n', '\r', ''].includes(ch.toString('utf8'))) {
        stdout.clearLine(0)
        stdout.cursorTo(0)
        stdout.write(question)
      }
    }
    stdin.on('data', onData)
    rl.question(question, (answer) => {
      stdin.off('data', onData)
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

/** 키 형식을 미리 걸러 낸다 — 잘못된 값을 넣고 나중에 원인을 찾는 게 제일 오래 걸린다 */
function classify(key) {
  if (/^AIza[0-9A-Za-z_-]{30,}$/.test(key)) return { ok: true, name: 'GOOGLE_API_KEY', provider: 'Gemini' }
  if (/^sk-ant-[0-9A-Za-z_-]{20,}$/.test(key)) return { ok: true, name: 'ANTHROPIC_API_KEY', provider: 'Claude' }
  if (/^ya29\.|^AQ\./.test(key)) {
    return {
      ok: false,
      why: 'OAuth 액세스 토큰으로 보입니다(보통 1시간이면 만료). API 키가 아닙니다.\n     Gemini 키는 https://aistudio.google.com/apikey 에서 AIza… 형태로 발급됩니다.',
    }
  }
  return {
    ok: false,
    why: '알 수 없는 형식입니다. Gemini는 AIza…, Anthropic은 sk-ant-… 로 시작합니다.',
  }
}

const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts })

console.log(`
┌─ 누리 마인드 AI 키 설정 ────────────────────────────────
│ 대상 프로젝트: ${PROJECT_REF} (nuri mind)
│ 키는 여기서만 입력되고 화면·파일·로그 어디에도 남지 않습니다.
│ 발급: Gemini → https://aistudio.google.com/apikey
└──────────────────────────────────────────────────────────
`)

const key = await askSecret('API 키를 붙여넣고 Enter (입력은 표시되지 않습니다): ')
if (!key) {
  console.log('\n입력이 없어 종료합니다.')
  process.exit(1)
}

const kind = classify(key)
if (!kind.ok) {
  console.log(`\n❌ 이 값은 넣지 않았습니다.\n   ${kind.why}\n`)
  process.exit(1)
}

console.log(`\n✅ ${kind.provider} 키로 인식했습니다 → 시크릿 이름 ${kind.name}`)
const go = await ask('이 프로젝트에 등록할까요? (y/N) ')
if (go.toLowerCase() !== 'y') {
  console.log('취소했습니다.')
  process.exit(0)
}

// 키를 인자로 넘기면 셸 히스토리·프로세스 목록에 남는다 → 환경변수로 전달
const r = run('npx', ['supabase', 'secrets', 'set', `${kind.name}="$NURI_AI_KEY"`, '--project-ref', PROJECT_REF], {
  env: { ...process.env, NURI_AI_KEY: key },
})

if (r.status !== 0) {
  console.log(`
❌ 시크릿 등록에 실패했습니다.
   먼저 로그인이 필요할 수 있어요:  npx supabase login
`)
  process.exit(1)
}

console.log(`
✅ 등록 완료.

확인 방법 (30초):
  1) https://www.nurimind.co.kr 접속
  2) 프로필 → 운영자 콘솔 → PIN 5690
  3) '현황' 탭 → 🩺 AI 연결 진단 → [3종 함수 진단 실행]

  3종 모두 "✅ 정상 (${kind.provider === 'Gemini' ? 'google · gemini-3.7-flash' : 'anthropic · claude-opus-5'})" 이면 끝입니다.
  실패하면 화면이 원인(키 오타 / 할당량 / 모델명)까지 구분해서 알려줍니다.

참고: 두 제공자 키를 다 넣으면 Claude가 우선 사용됩니다.
      Gemini로 강제하려면:  npx supabase secrets set LLM_PROVIDER=google --project-ref ${PROJECT_REF}
`)
