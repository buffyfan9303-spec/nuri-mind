/**
 * 런칭 스모크 게이트 — 브라우저 없이 도는 정적 회귀 검사.
 *
 * 이번 감사에서 실제로 나온 버그 유형만 골라 자동화했다:
 *  ① UTC 날짜키 잔재(KST 00~09시 게이트 어긋남의 근원)
 *  ② i18n 키 3국어 비대칭(한 언어에만 있는 문구)
 *  ③ 라우트가 가리키는 페이지 파일 부재
 *  ④ 검사 메타 ↔ i18n 키 불일치(test.{id}.name/short)
 *  ⑤ sitemap 등재 URL ↔ 실제 라우트/데이터 불일치
 *  ⑥ 16유형 심층 문항의 극별 균형(불균형 시 채점 편향)
 *
 * 실행: npm run smoke   (실패 시 exit 1 — 배포 전 게이트로 사용)
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const fails = []
const ok = []
const check = (name, cond, detail = '') => (cond ? ok.push(name) : fails.push(`${name}${detail ? ' — ' + detail : ''}`))

/* ① UTC 날짜키 잔재 */
{
  const bad = []
  const walk = (dir) => {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`
      if (e.isDirectory()) walk(rel)
      else if (/\.(ts|tsx)$/.test(e.name)) {
        const src = read(rel)
        if (/toISOString\(\)\.slice\(0,\s*10\)/.test(src)) bad.push(rel)
      }
    }
  }
  walk('src')
  check('UTC 날짜키 없음', bad.length === 0, bad.join(', '))
}

/* ② i18n 3국어 키 대칭 */
{
  const src = read('src/i18n/translations.ts')
  // 사전 블록 3개(ko/en/ja)를 순서대로 분리 — 각 블록의 최상위 키 집합 비교
  const blocks = src.split(/const (?:ko|en|ja)\b[^=]*=\s*\{/).slice(1)
  if (blocks.length < 3) {
    check('i18n 블록 3개 인식', false, `발견 ${blocks.length}`)
  } else {
    const keysOf = (b) => new Set([...b.matchAll(/^\s{2}'([^']+)':/gm)].map((m) => m[1]))
    const [k, e, j] = blocks.slice(0, 3).map(keysOf)
    const missIn = (a, b, label) => [...a].filter((x) => !b.has(x)).slice(0, 6).map((x) => `${label}:${x}`)
    const diffs = [...missIn(k, e, 'en누락'), ...missIn(k, j, 'ja누락'), ...missIn(e, k, 'ko누락')]
    check(`i18n 키 대칭(ko ${k.size})`, diffs.length === 0, diffs.join(', '))
  }
}

/* ③ 라우트 → 페이지 파일 존재 */
{
  const app = read('src/App.tsx')
  const miss = [...app.matchAll(/import\('\.\/(pages\/[A-Za-z]+)'\)/g)]
    .map((m) => m[1])
    .filter((p) => !existsSync(join(ROOT, 'src', `${p}.tsx`)))
  check('라우트 페이지 파일 존재', miss.length === 0, miss.join(', '))
}

/* ④ 검사 메타 ↔ i18n 키 */
{
  const ids = [...read('src/data/tests.ts').matchAll(/id: '([a-z]+)'/g)].map((m) => m[1])
  const tr = read('src/i18n/translations.ts')
  const miss = ids.filter((id) => !tr.includes(`'test.${id}.name'`) || !tr.includes(`'test.${id}.short'`))
  check(`검사 i18n 키(${ids.length}종)`, miss.length === 0, miss.join(', '))
}

/* ⑤ sitemap ↔ 라우트/데이터 */
{
  const sm = read('public/sitemap.xml')
  const slugs = [...read('src/pages/ZodiacLanding.tsx').matchAll(/slug: '([a-z]+)'/g)].map((m) => m[1])
  const smZodiac = [...sm.matchAll(/\/zodiac\/([a-z]+)</g)].map((m) => m[1])
  const orphan = smZodiac.filter((z) => !slugs.includes(z))
  check(`sitemap 띠 URL(${smZodiac.length})`, orphan.length === 0 && smZodiac.length === 12, orphan.join(', '))

  // 공개 라우트 화이트리스트가 sitemap 경로를 실제로 열어주는지
  const pub = read('src/App.tsx').match(/PUBLIC_ROUTES = ([^\n]+)/)?.[1] ?? ''
  check('공개 라우트에 zodiac·magazine 포함', pub.includes('zodiac') && pub.includes('magazine'), pub)
}

/* ⑥ 16유형 심층 문항 극별 균형 */
{
  const src = read('src/data/mbti.ts')
  const poles = [...src.matchAll(/^\s*D\('([EISNTFJP])'/gm)].map((m) => m[1])
  const cnt = poles.reduce((a, p) => ((a[p] = (a[p] ?? 0) + 1), a), {})
  const pairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']]
  const bad = pairs.filter(([a, b]) => (cnt[a] ?? 0) !== (cnt[b] ?? 0)).map(([a, b]) => `${a}${cnt[a] ?? 0}:${b}${cnt[b] ?? 0}`)
  check(`16유형 심층 문항 균형(${poles.length}문항)`, bad.length === 0, bad.join(', '))
}

/* 결과 */
console.log(`\n✅ 통과 ${ok.length}`)
ok.forEach((n) => console.log(`   · ${n}`))
if (fails.length) {
  console.log(`\n❌ 실패 ${fails.length}`)
  fails.forEach((n) => console.log(`   · ${n}`))
  process.exit(1)
}
console.log('\n스모크 전부 통과 — 배포 가능\n')
