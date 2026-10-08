/**
 * 네트워크 제한 시간·실패 경로 검사 — src/lib/net.ts를 Node에서 직접 불러 행동을 재현한다.
 * (net.ts는 import가 없는 파일이라 Node 22.6+ 타입 제거 실행으로 그대로 읽힌다.)
 *
 * 1) 행동: 영원히 안 끝나는 fetch가 제한 시간 뒤 AbortError로 끝나는가 / 빠른 응답은 안 끊는가 / 바깥 신호를 존중하는가
 * 2) 근거: deep-report 상한이 엣지의 상류 제한(_shared/llm.ts LLM_TIMEOUT_MS)보다 긴가
 * 3) 배선 앵커: 순수 함수가 맞아도 호출부가 안 쓰면 소용없다 — raw fetch 0곳, supabase 전역 fetch, 실패 상태 배선
 *
 * 실행: node scripts/net-check.mjs  (smoke ⑭에서도 불린다)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
// 주석을 뺀 코드만 — '예전엔 window.confirm…' 같은 설명 주석이 부재 단언을 깨지 않게
const code = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

export async function runNetCheck() {
  const N = await import(pathToFileURL(join(ROOT, 'src/lib/net.ts')).href)
  const passes = []
  const fails = []
  const check = (name, cond, detail = '') => (cond ? passes.push(name) : fails.push(`${name}${detail ? ' — ' + detail : ''}`))

  const realFetch = globalThis.fetch
  // 신호를 듣는 가짜 fetch — delay 뒤 응답, abort되면 AbortError로 거절(브라우저 fetch와 같은 모양)
  const fakeFetch = (delay) => (_input, init = {}) =>
    new Promise((resolve, reject) => {
      const abortErr = () => Object.assign(new Error('aborted'), { name: 'AbortError' })
      if (init.signal?.aborted) return reject(abortErr()) // 브라우저 fetch도 이미 끊긴 신호는 바로 거절
      const t = delay >= 0 ? setTimeout(() => resolve({ ok: true, init }), delay) : null
      init.signal?.addEventListener('abort', () => {
        if (t) clearTimeout(t)
        reject(abortErr())
      })
    })
  // 검사 자체가 멈추지 않게 바깥 상한(가드가 빠지면 '멈춤'으로 실패 처리)
  const settle = (p, ms = 1500) => {
    let t
    return Promise.race([
      p.then((v) => ({ kind: 'ok', v }), (e) => ({ kind: 'err', e })),
      new Promise((r) => (t = setTimeout(() => r({ kind: 'hang' }), ms))),
    ]).finally(() => clearTimeout(t))
  }

  try {
    /* ── 1. 행동 ── */
    globalThis.fetch = fakeFetch(-1) // 영원히 안 끝남
    const t0 = Date.now()
    const hung = await settle(N.fetchWithTimeout('x', {}, 50))
    check('멈춘 요청: 제한 시간 뒤 AbortError로 끝난다', hung.kind === 'err' && hung.e?.name === 'AbortError', hung.kind)
    check('멈춘 요청: 제한 시간 근처에서 끝난다(1초 안)', hung.kind !== 'hang' && Date.now() - t0 < 1000)

    globalThis.fetch = fakeFetch(5)
    const fast = await settle(N.fetchWithTimeout('x', { method: 'POST', headers: { a: '1' } }, 500))
    check('빠른 응답(반대편): 끊지 않는다', fast.kind === 'ok' && fast.v.ok === true, fast.kind)
    check('호출 옵션 보존(method·headers) + 신호 주입', fast.kind === 'ok' && fast.v.init.method === 'POST' && fast.v.init.headers.a === '1' && fast.v.init.signal instanceof AbortSignal)

    globalThis.fetch = fakeFetch(-1)
    // 제한 시간(400ms)보다 훨씬 빨리 끝났는지로 '바깥 신호 때문에' 끝났음을 가른다
    const outer = new AbortController()
    const t1 = Date.now()
    const p = settle(N.fetchWithTimeout('x', { signal: outer.signal }, 400))
    outer.abort()
    const ab = await p
    check('바깥 신호(취소)도 존중한다', ab.kind === 'err' && ab.e?.name === 'AbortError' && Date.now() - t1 < 200, `${ab.kind} ${Date.now() - t1}ms`)

    const pre = new AbortController()
    pre.abort()
    const t2 = Date.now()
    const ab2 = await settle(N.fetchWithTimeout('x', { signal: pre.signal }, 400))
    check('이미 취소된 신호는 바로 끝난다', ab2.kind === 'err' && Date.now() - t2 < 200, `${ab2.kind} ${Date.now() - t2}ms`)
  } finally {
    globalThis.fetch = realFetch
  }

  /* ── 2. 상한 근거 ── */
  {
    const llm = Number((read('supabase/functions/_shared/llm.ts').match(/LLM_TIMEOUT_MS = ([\d_]+)/)?.[1] ?? '0').replace(/_/g, ''))
    const T = N.TIMEOUT
    check(`엣지 상류 제한을 읽었다(${llm}ms)`, llm > 0)
    check('deep-report 상한 > 엣지 상류 제한(먼저 끊으면 유료 생성이 버려진다)', T.deepAi > llm, `${T.deepAi} vs ${llm}`)
    check('AI 생성 상한은 api < ai <= deepAi', T.api < T.ai && T.ai <= T.deepAi)
    check('일반 API 상한 10~20초', T.api >= 10_000 && T.api <= 20_000, String(T.api))
  }

  /* ── 3. 배선 앵커 ── */
  {
    // raw fetch 0곳 — 새 호출이 제한 시간 없이 다시 생기는 것을 막는다(net.ts 자신만 예외)
    const raw = []
    const walk = (d) => {
      for (const e of readdirSync(join(ROOT, d), { withFileTypes: true })) {
        const rel = `${d}/${e.name}`
        if (e.isDirectory()) walk(rel)
        else if (/\.(ts|tsx)$/.test(e.name) && rel !== 'src/lib/net.ts') {
          read(rel).split(/\r?\n/).forEach((ln, i) => {
            if (/(^|[^\w.])fetch\(/.test(ln.replace(/\/\/.*$/, ''))) raw.push(`${rel}:${i + 1}`)
          })
        }
      }
    }
    walk('src')
    check('src에 제한 시간 없는 fetch( 0곳', raw.length === 0, raw.slice(0, 5).join(', '))

    const sb = read('src/lib/supabase.ts')
    check('supabase 전역 fetch = fetchWithTimeout(RPC·인증·functions 전부)', /global:\s*\{\s*fetch:[^}]*fetchWithTimeout/.test(sb))

    const deep = read('src/lib/deepReport.ts')
    check('deep-report는 deepAi 상한', /fetchWithTimeout\([\s\S]*?TIMEOUT\.deepAi\)/.test(deep))
    for (const f of ['src/lib/fortuneAi.ts', 'src/lib/dreamAi.ts', 'src/components/AiReport.tsx']) {
      check(`${f.split('/').pop()}는 ai 상한`, /fetchWithTimeout\([\s\S]*?TIMEOUT\.ai\)/.test(read(f)))
    }

    const fo = read('src/pages/Fortune.tsx')
    check('운세 AI: 늦은 응답 버림 + 실패면 failed(로딩 해제)', /if \(cancelled\) return[\s\S]{0,300}setAiState\(res \? null : 'failed'\)/.test(fo))
    check('운세 AI: 다시 시도가 재요청을 일으킨다(aiTry가 deps)', /setAiTry\(\(n\) => n \+ 1\)/.test(fo) && /\[view, data, fortuneDetailDate, premium, lang, aiTry\]/.test(fo))
    check('운세 AI: 실패 문구 노출', fo.includes('AI 풀이를 불러오지 못했어요') && fo.includes("aiState === 'failed'"))

    const auth = read('src/lib/auth.ts')
    const admin = read('src/pages/Admin.tsx')
    check("isServerAdmin: 조회 오류는 'error'(권한 없음과 구분)", /if \(error\) return 'error'/.test(auth))
    check("isServerAdmin: 'yes'만 연다(반대편)", /data\?\.is_admin === true \? 'yes' : 'no'/.test(auth) && /if \(r === 'yes'\)[\s\S]{0,60}unlockAdmin\(\)/.test(admin))
    check("Admin: 예외도 'error'로 · 연결 안내 문구", /isServerAdmin\(\)\.catch\(\(\) => 'error' as const\)/.test(admin) && admin.includes('연결을 확인할 수 없어요'))

    check('프리미엄 해지: window.confirm 없음(앱 시트)', !/window\.confirm/.test(code('src/pages/Premium.tsx')) && /<Modal open=\{cancelAsk\}/.test(code('src/pages/Premium.tsx')))

    const main = code('src/main.tsx')
    check('카카오 SDK: 시작 시 전역 로드 없음', !/loadKakao\(\)/.test(main) && !/lib\/kakao/.test(main))
    const users = ['src/pages/QuickTest.tsx', 'src/pages/TestResult.tsx']
    const noPrefetch = users.filter((f) => /shareKakao\(/.test(read(f)) && !/ref=\{loadKakao\}/.test(read(f)))
    check('카카오 공유 버튼마다 보일 때 미리 받기(ref)', noPrefetch.length === 0, noPrefetch.join(', '))

    const mb = read('src/lib/mailbox.ts')
    check('우편 배지: 실패면 같은 계정 직전 값', /lastUnread && uid && lastUnread\.uid === uid \? lastUnread\.n : 0/.test(mb))
  }

  return { passes, fails }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { passes, fails } = await runNetCheck()
  passes.forEach((n) => console.log('  ✅ ' + n))
  fails.forEach((n) => console.log('  ❌ ' + n))
  console.log(`\n통과 ${passes.length} · 실패 ${fails.length}`)
  process.exit(fails.length ? 1 : 0)
}
