/**
 * 이모지 아이콘 동기화 — `node scripts/emoji-sync.mjs`
 *
 * 왜 필요한가: UI 아이콘을 기기 글꼴 이모지로 그리면 삼성·애플·윈도·리눅스(컬러 글꼴 없음)마다 모양이 다르다.
 * 실제로 🃏가 어떤 기기에선 액자 같은 카드로 나와 화면에서 혼자 튀었다. 그래서 아이콘은 한 가지 화풍
 * (Microsoft Fluent Emoji · Flat, MIT)의 SVG 파일로 그린다 — 어느 기기에서나 똑같이 보인다.
 *
 * 하는 일:
 *  ① src/ 전체에서 이모지를 뽑는다(코드에 새 이모지를 적으면 다음 실행 때 자동으로 따라온다)
 *  ② Fluent 저장소를 **고정 커밋(FLUENT_SHA)** 으로 받아 metadata.json의 unicode로 폴더를 찾는다
 *     (@main을 쓰면 원본이 바뀔 때 같은 파일명에 다른 그림이 들어와 캐시와 어긋난다)
 *  ③ Flat SVG를 public/emoji/v1/<코드>.svg 로 복사(주석·XML 선언·공백 제거, viewBox 유지)
 *     피부색이 있는 이모지는 Default/Flat(노란 기본색)을 쓴다
 *  ④ Fluent에 없는(또는 흰 바탕에서 안 보이는) 아이콘은 scripts/emoji-custom/ 의 손그림 SVG(같은 화풍)로 채운다 → custom-<이름>.svg
 *  ⑤ 있는 코드 목록을 src/data/emojiManifest.ts 로 생성 — 없는 파일을 요청(404)하지 않게
 *  ⑥ 매핑이 없는 이모지를 목록으로 보고한다(그 이모지는 화면에서 기기 글꼴로 남는다)
 *
 * 파일명 규칙: 코드포인트 소문자 16진수를 '-'로 잇고 FE0F(이모지 표시 선택자)는 뺀다 — ❤️ → 2764.svg
 * 그림이 바뀌면(커밋 SHA 갱신·손그림 수정) 폴더를 v2로 올린다 — vercel.json이 /emoji/v1/을 1년 immutable로 캐시한다.
 *
 * 필요: git(부분 클론). 캐시: node_modules/.cache/fluentui-emoji
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
/** microsoft/fluentui-emoji 고정 커밋 — 2026-09-24 main HEAD */
export const FLUENT_SHA = '1ffb34c752ecf5d402f04cfb4b392c77f57c54bc'
export const EMOJI_DIR = 'public/emoji/v1'
const CACHE = join(ROOT, 'node_modules/.cache/fluentui-emoji')
const CUSTOM_SRC = join(ROOT, 'scripts/emoji-custom')
const MANIFEST = 'src/data/emojiManifest.ts'

/** 이모지 한 덩어리(국기·키캡·ZWJ 결합·피부색 포함) */
export const EMOJI_RE =
  /\p{Regional_Indicator}{2}|[#*0-9]️?⃣|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*/gu

/** 파일명 코드 — 소문자 16진수를 '-'로, FE0F/FE0E 제외 */
export const codeOf = (e) =>
  [...e]
    .map((c) => c.codePointAt(0))
    .filter((cp) => cp !== 0xfe0f && cp !== 0xfe0e)
    .map((cp) => cp.toString(16))
    .join('-')

/** 아이콘이 아닌 글자 기호(텍스트 속 ©·®·™) — 그림으로 바꾸지 않는다 */
const SKIP = new Set(['a9', 'ae', '2122'])

/**
 * Fluent에 없는 아이콘 → 손그림 파일(scripts/emoji-custom/<이름>.svg). 키는 파일명 코드.
 * 새로 그리면 여기에 한 줄 추가하고 다시 돌린다.
 */
const CUSTOM = {
  // 🧑‍🤝‍🧑 손잡은 두 사람(1분 테스트 '친구 유형') — Fluent는 다인원 피부색 조합 이모지를 싣지 않는다
  '1f9d1-200d-1f91d-200d-1f9d1': 'people-holding-hands',
  // 💬 말풍선(하단 내비 '커뮤니티' 등) — Fluent 원본은 흰 풍선이라 흰 바탕에서 윤곽만 남는다. 같은 화풍의 파란 풍선으로 대체
  '1f4ac': 'speech-balloon',
}

function collect() {
  const found = new Map() // code → glyph
  const walk = (dir) => {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`
      if (e.isDirectory()) walk(rel)
      else if (/\.(ts|tsx)$/.test(e.name) && rel !== MANIFEST) {
        for (const m of readFileSync(join(ROOT, rel), 'utf8').matchAll(EMOJI_RE)) {
          const c = codeOf(m[0])
          if (!SKIP.has(c) && !found.has(c)) found.set(c, m[0])
        }
      }
    }
  }
  walk('src')
  return found
}

function fetchFluent() {
  const git = (...a) => execFileSync('git', ['-C', CACHE, ...a], { stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim()
  if (existsSync(join(CACHE, '.git'))) {
    try {
      if (git('rev-parse', 'HEAD') === FLUENT_SHA) return
    } catch {
      /* 깨진 캐시 — 새로 받는다 */
    }
    rmSync(CACHE, { recursive: true, force: true })
  }
  mkdirSync(CACHE, { recursive: true })
  console.log(`Fluent Emoji @${FLUENT_SHA.slice(0, 7)} 받는 중(메타데이터+Flat SVG만)…`)
  git('init', '-q')
  git('remote', 'add', 'origin', 'https://github.com/microsoft/fluentui-emoji.git')
  git('sparse-checkout', 'set', '--no-cone', '/assets/*/metadata.json', '/assets/*/Flat/*', '/assets/*/Default/Flat/*')
  git('fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', FLUENT_SHA)
  git('checkout', '-q', 'FETCH_HEAD')
}

function indexFluent() {
  const idx = new Map() // code → svg 경로
  const assets = join(CACHE, 'assets')
  for (const folder of readdirSync(assets)) {
    const metaPath = join(assets, folder, 'metadata.json')
    if (!existsSync(metaPath)) continue
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
    const flatDir = [join(assets, folder, 'Flat'), join(assets, folder, 'Default', 'Flat')].find(existsSync)
    if (!flatDir) continue
    const svg = readdirSync(flatDir).find((f) => f.endsWith('.svg'))
    if (!svg) continue
    const code = meta.unicode
      .split(' ')
      .filter((h) => h !== 'fe0f' && h !== 'fe0e')
      .join('-')
    idx.set(code, join(flatDir, svg))
  }
  return idx
}

/** 가벼운 최적화 — XML 선언·주석·메타데이터·태그 사이 공백 제거. viewBox·도형은 그대로 */
const optimize = (svg) =>
  svg
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata[\s\S]*?<\/metadata>/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim() + '\n'

function main() {
  const used = collect()
  fetchFluent()
  const idx = indexFluent()
  const out = join(ROOT, EMOJI_DIR)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })

  const have = []
  const missing = []
  let bytes = 0
  for (const [code, glyph] of [...used].sort()) {
    const custom = CUSTOM[code]
    const src = custom ? join(CUSTOM_SRC, `${custom}.svg`) : idx.get(code)
    if (!src || !existsSync(src)) {
      missing.push(`${glyph} ${code}`)
      continue
    }
    const svg = optimize(readFileSync(src, 'utf8'))
    if (!/viewBox=/.test(svg)) throw new Error(`viewBox 없음: ${src}`)
    const name = custom ? `custom-${custom}` : code
    writeFileSync(join(out, `${name}.svg`), svg)
    bytes += svg.length
    have.push(custom ? `${code}=${name}` : code)
  }
  // 손그림 중 코드에 매핑되지 않은 이름 아이콘도 싣는다(<Emoji name="…"> 용)
  if (existsSync(CUSTOM_SRC)) {
    const mapped = new Set(Object.values(CUSTOM))
    for (const f of readdirSync(CUSTOM_SRC).filter((f) => f.endsWith('.svg'))) {
      const n = f.slice(0, -4)
      if (mapped.has(n)) continue
      const svg = optimize(readFileSync(join(CUSTOM_SRC, f), 'utf8'))
      writeFileSync(join(out, `custom-${n}.svg`), svg)
      bytes += svg.length
    }
  }

  writeFileSync(
    join(ROOT, MANIFEST),
    `/**
 * ⚠️ 자동 생성 파일 — 손으로 고치지 말 것. \`node scripts/emoji-sync.mjs\` 가 만든다.
 * public/${EMOJI_DIR.replace('public/', '')}/ 에 SVG가 있는 이모지 코드 목록(공백 구분 한 줄 — 메인 번들에 들어가므로 최소 형태).
 * 'code=custom-이름' 은 Fluent에 없어 손그림으로 채운 아이콘. 출처: microsoft/fluentui-emoji@${FLUENT_SHA.slice(0, 7)} (MIT)
 */
export const EMOJI_DIR = '/${EMOJI_DIR.replace('public/', '')}/'
export const EMOJI_CODES = '${have.join(' ')}'
`,
  )

  console.log(`\n이모지 ${used.size}종 중 ${have.length}종 → ${EMOJI_DIR} (평균 ${Math.round(bytes / Math.max(1, have.length))}B)`)
  if (missing.length) {
    console.log(`⚠️ 매핑 없음 ${missing.length}종 — 화면에서 기기 글꼴로 남는다(아이콘으로 쓰면 CUSTOM에 손그림 추가):`)
    for (const m of missing) console.log('   ' + m)
  }
}

main()
