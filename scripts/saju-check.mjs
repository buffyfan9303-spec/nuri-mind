/**
 * 만세력 검증 — src/lib/manse.ts를 esbuild로 묶어 node에서 알려진 기준값과 대조한다.
 * 단독 실행: node scripts/saju-check.mjs   ·   smoke.mjs도 이 모듈의 runSajuCheck()를 부른다.
 *
 * 기준값 출처(지어낸 값 없음):
 *  · 설날·추석·윤달 — 한국천문연구원(KASI) 월력요항/천문우주지식정보 음양력 변환으로 공표된 날짜
 *    (정부 공휴일 지정과 같다: 2023-01-22, 2024-02-10, 2025-01-29, 2026-02-17 설날 등).
 *  · 2017 윤달 — 한국은 윤5월(6/24 시작), 중국은 윤6월 — 한·중 음력이 갈리는 대표 사례.
 *  · 입춘·경칩 시각 — KASI 발표 24절기 시각(KST).
 *  · 일진 — 1900-01-01 갑술, 2000-01-01 무오, 2024-01-01 갑자(만세력 공통 앵커).
 */
import { buildSync } from 'esbuild'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

async function loadManse() {
  const out = buildSync({ entryPoints: [join(ROOT, 'src/lib/manse.ts')], bundle: true, format: 'esm', write: false, platform: 'neutral' })
  const dir = mkdtempSync(join(tmpdir(), 'manse-'))
  const file = join(dir, 'manse.mjs')
  writeFileSync(file, out.outputFiles[0].text)
  try {
    return await import(pathToFileURL(file).href)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

export async function runSajuCheck() {
  const M = await loadManse()
  const fails = []
  const passes = []
  const eq = (name, got, want) => (JSON.stringify(got) === JSON.stringify(want) ? passes.push(name) : fails.push(`${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`))

  // ① 일진 앵커
  const dayKo = (y, m, d) => M.pillarKo(M.pillarOf(M.dayIndex(y, m, d)))
  eq('일진 1900-01-01=갑술', dayKo(1900, 1, 1), '갑술')
  eq('일진 2000-01-01=무오', dayKo(2000, 1, 1), '무오')
  eq('일진 2024-01-01=갑자', dayKo(2024, 1, 1), '갑자')
  eq('일진 2024-02-10(설날)=갑진', dayKo(2024, 2, 10), '갑진')

  // ② 음력 → 양력(KASI 공표일)
  if (!M.lunarSupported()) fails.push('이 Node에 ICU dangi/chinese 달력이 없음')
  else {
    const L = [
      ['설날 2023', [2023, 1, 1, false], { y: 2023, m: 1, d: 22 }],
      ['설날 2024', [2024, 1, 1, false], { y: 2024, m: 2, d: 10 }],
      ['설날 2025', [2025, 1, 1, false], { y: 2025, m: 1, d: 29 }],
      ['설날 2026', [2026, 1, 1, false], { y: 2026, m: 2, d: 17 }],
      ['설날 2000', [2000, 1, 1, false], { y: 2000, m: 2, d: 5 }],
      ['설날 1990', [1990, 1, 1, false], { y: 1990, m: 1, d: 27 }],
      ['추석 2023', [2023, 8, 15, false], { y: 2023, m: 9, d: 29 }],
      ['추석 2024', [2024, 8, 15, false], { y: 2024, m: 9, d: 17 }],
      ['추석 2025', [2025, 8, 15, false], { y: 2025, m: 10, d: 6 }],
      ['추석 2026', [2026, 8, 15, false], { y: 2026, m: 9, d: 25 }],
      ['2017 윤5월 1일(한국)', [2017, 5, 1, true], { y: 2017, m: 6, d: 24 }],
      ['2020 윤4월 1일', [2020, 4, 1, true], { y: 2020, m: 5, d: 23 }],
      ['2023 윤2월 1일', [2023, 2, 1, true], { y: 2023, m: 3, d: 22 }],
      ['2025 윤6월 1일', [2025, 6, 1, true], { y: 2025, m: 7, d: 25 }],
    ]
    for (const [name, args, want] of L) eq(`음력 ${name}`, M.lunarToSolar(...args), want)
    eq('없는 윤달 거절(2024 윤1월)', M.lunarToSolar(2024, 1, 1, true), null)
    eq('양력→음력 2017-07-01=윤5.8', M.solarToLunar(2017, 7, 1), { y: 2017, m: 5, d: 8, leap: true })
  }

  // ③ 절기 시각(KST) — 15분 이내
  const kst = (ms) => new Date(ms + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ')
  const T = [
    ['입춘 2023', 2023, 315, '2023-02-04 11:43'],
    ['입춘 2024', 2024, 315, '2024-02-04 17:27'],
    ['입춘 2025', 2025, 315, '2025-02-03 23:10'],
    ['입춘 2026', 2026, 315, '2026-02-04 05:02'],
    ['경칩 2024', 2024, 345, '2024-03-05 11:23'],
  ]
  for (const [name, y, lon, want] of T) {
    const got = M.solarTermUtc(y, lon)
    const wantMs = Date.parse(want.replace(' ', 'T') + ':00+09:00')
    const diffMin = Math.abs(got - wantMs) / 60000
    if (diffMin <= 15) passes.push(`${name} ${kst(got)} (기준 ${want}, 차 ${diffMin.toFixed(1)}분)`)
    else fails.push(`${name}: got ${kst(got)} want ${want} (${diffMin.toFixed(1)}분 차)`)
  }

  // ④ 사주팔자(년·월·일·시) — 규칙 기반 기대값
  const chart = (y, m, d, time) => {
    const c = M.chartOf({ y, m, d }, time)
    return [c.year, c.month, c.day, c.hour].map((p) => (p ? M.pillarKo(p) : '-')).join(' ')
  }
  // 입춘(2024-02-04 17:27) 직전·직후 — 년주 계묘→갑진, 월주 을축→병인
  eq('2024-02-04 12:00 (입춘 전)', chart(2024, 2, 4, { kind: 'exact', h: 12, mi: 0 }), '계묘 을축 무술 무오')
  eq('2024-02-04 18:00 (입춘 후)', chart(2024, 2, 4, { kind: 'exact', h: 18, mi: 0 }), '갑진 병인 무술 신유')
  // 설날 자정 넘은 직후 — 갑진일 갑자시(갑·기일 → 갑자시, 오서둔)
  eq('2024-02-10 00:40 자시', chart(2024, 2, 10, { kind: 'exact', h: 0, mi: 40 }), '갑진 병인 갑진 갑자')
  // 23:40 KST = 자시 시작 → 다음 날 일주(을사일 병자시)
  eq('2024-02-10 23:40 → 다음 날 일주', chart(2024, 2, 10, { kind: 'exact', h: 23, mi: 40 }), '갑진 병인 을사 병자')
  // 2000-01-01 무오일, 1999 기묘년 병자월(대설~소한), 시각 모름
  eq('2000-01-01 시각 모름', chart(2000, 1, 1, { kind: 'unknown' }), '기묘 병자 무오 -')
  // 1984 갑자년 — 입춘 이후 병인월
  eq('1984-03-01 시진=오', chart(1984, 3, 1, { kind: 'branch', branch: 6 }).split(' ').slice(0, 2).join(' '), '갑자 병인')

  // ⑤ 나이
  eq('만 나이', M.ageOf({ y: 2000, m: 9, d: 25 }, { y: 2026, m: 9, d: 24 }), { man: 25, korean: 27 })

  return { passes, fails }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { passes, fails } = await runSajuCheck()
  passes.forEach((p) => console.log('  ✓ ' + p))
  fails.forEach((f) => console.log('  ✗ ' + f))
  console.log(`\n만세력 검증: 통과 ${passes.length} · 실패 ${fails.length}`)
  process.exit(fails.length ? 1 : 0)
}
