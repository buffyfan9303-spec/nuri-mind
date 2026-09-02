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
 *  ⑦ 엣지 함수가 공용 모듈(_shared)을 올바르게 참조하는가 · 사본이 남아 원본을 가리지 않는가
 *  ⑧ 모션이 lib/motion 프리셋을 우회하고 스프링을 하드코딩하지 않는가
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

/* ② i18n 3국어 키 대칭 — 사전은 언어별 파일로 분리돼 있다(dict.ko/en/ja) */
{
  const keysOf = (lang) =>
    new Set([...read(`src/i18n/dict.${lang}.ts`).matchAll(/^\s{2}'([^']+)':/gm)].map((m) => m[1]))
  const [k, e, j] = ['ko', 'en', 'ja'].map(keysOf)
  const missIn = (a, b, label) => [...a].filter((x) => !b.has(x)).slice(0, 6).map((x) => `${label}:${x}`)
  const diffs = [...missIn(k, e, 'en누락'), ...missIn(k, j, 'ja누락'), ...missIn(e, k, 'ko누락')]
  check(`i18n 키 대칭(ko ${k.size})`, diffs.length === 0, diffs.join(', '))
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
  const tr = read('src/i18n/dict.ko.ts')
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

/* ⑦ 엣지 함수가 공용 모듈을 올바른 경로로 참조하는가 */
{
  const FNS = ['deep-report', 'ai-report', 'fortune-detail']
  const shared = existsSync(join(ROOT, 'supabase/functions/_shared/llm.ts'))
  // 폴더 안에 사본이 남아 있으면 CLI가 그걸 쓰게 돼 원본 수정이 반영되지 않는다
  const strays = FNS.filter((fn) => existsSync(join(ROOT, `supabase/functions/${fn}/llm.ts`)))
  const wrong = FNS.filter((fn) => !read(`supabase/functions/${fn}/index.ts`).includes("from '../_shared/llm.ts'"))
  check(
    `엣지 공용 모듈 참조(${FNS.length}종)`,
    shared && strays.length === 0 && wrong.length === 0,
    [!shared && '_shared/llm.ts 없음', strays.length && `사본 잔존: ${strays.join(', ')}`, wrong.length && `참조 경로 오류: ${wrong.join(', ')}`]
      .filter(Boolean)
      .join(' · '),
  )
}

/* ⑧ 모션이 프리셋을 우회하지 않는가 */
{
  // stiffness/damping을 손으로 적으면 화면마다 물성이 갈라진다 — 실제로 97곳이 제각각이었다.
  // 예외는 BottomNav 하나(속성별 키프레임 오버라이드)라 파일 단위로 허용한다.
  // BottomNav: 속성별 키프레임 오버라이드. Pill: useSpring(값 보간) API로 형태가 다르다.
  const ALLOW = ['src/components/BottomNav.tsx', 'src/components/primitives/Pill.tsx']
  const bad = []
  const walk = (dir) => {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`
      if (e.isDirectory()) walk(rel)
      else if (/\.tsx$/.test(e.name) && !ALLOW.includes(rel) && /stiffness:\s*\d/.test(read(rel))) bad.push(rel)
    }
  }
  walk('src')
  check('모션 프리셋 사용(하드코딩 스프링 0)', bad.length === 0, bad.slice(0, 5).join(', '))
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
