/**
 * 만세력(萬歲曆) 계산 — 사주팔자(년·월·일·시주)와 음력↔양력 변환.
 * 외부 의존 없음(순수 함수 + 표준 Intl) — scripts/saju-check.mjs가 node에서 그대로 검증한다.
 *
 * ── 무엇을 어디서 가져왔나(지어낸 표 없음) ──
 *  · 음력 변환: 브라우저/Node 내장 ICU의 'dangi'(한국 전통력) 달력. ICU는 천문 계산으로 삭(朔)·중기를
 *    구하고 한국 표준 자오선(시대별 UTC+8·+8:30·+9)을 쓴다 — 중국 음력('chinese')과 윤달이 갈리는 해
 *    (예: 2017년 한국 윤5월 / 중국 윤6월)도 한국 기준으로 맞는다. dangi가 없는 엔진은 'chinese'로 폴백.
 *    검증: 한국천문연구원(KASI) 월력요항으로 공표된 설날·추석·윤달 시작일 — scripts/saju-check.mjs.
 *  · 절기: 태양 겉보기 황경(apparent ecliptic longitude)을 Meeus『Astronomical Algorithms』(2판) 25장의
 *    저정밀 식(오차 약 0.01° ≈ 15분)으로 계산. 입춘=315°, 경칩=345° … 30°마다 월이 바뀐다(節 기준).
 *    ΔT(TT−UT)는 NASA(Espenak·Meeus) 표 값을 선형 보간 — 1분 이내 영향.
 *    검증: KASI 발표 입춘·경칩 시각(2023~2026) — 15분 이내 일치.
 *  · 일주: 율리우스일(JDN) 기반 60갑자. 앵커 1900-01-01=갑술, 2000-01-01=무오, 2024-01-01=갑자.
 *  · 시간대: 출생 시각은 한국 시각(Asia/Seoul)으로 받는다. IANA tz 데이터(Intl)로 당시 표준시·서머타임을
 *    반영해 UTC로 바꾼 뒤, 시주는 동경 127.5° 지방평균시(UTC+8:30)로 본다 — 국내 만세력이 흔히 쓰는
 *    '30분 보정'(자시=23:30~01:29 KST)과 같다.
 *  · 자시(子時) 규칙: 야자시/조자시를 나누지 않는 전통 방식 — 자시가 시작되면(23:30 KST) 다음 날 일주.
 *
 * ⚠️ 절기 경계 ±15분·자시 경계 규칙은 유파마다 다르다. 이 앱의 운세는 재미·참고용이다.
 */

export type El = '목' | '화' | '토' | '금' | '수'
export interface YMD {
  y: number
  m: number
  d: number
}
export interface Pillar {
  stem: number // 0=갑 … 9=계
  branch: number // 0=자 … 11=해
}

export const STEM_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const
export const STEM_HJ = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const BRANCH_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const
export const BRANCH_HJ = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
export const STEM_EL: El[] = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수']
export const BRANCH_EL: El[] = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수']
/** 지지의 본기(本氣) 천간 — 자계·축기·인갑·묘을·진무·사병·오정·미기·신경·유신·술무·해임 */
export const BRANCH_MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8]
export const ELS: El[] = ['목', '화', '토', '금', '수']
/** 상생(A가 B를 낳음)·상극(A가 B를 누름) */
export const SHENG: Record<El, El> = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' }
export const KE: Record<El, El> = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' }

const mod = (n: number, m: number) => ((n % m) + m) % m

/** 60갑자 순번(0=갑자 … 59=계해) ↔ 천간·지지 */
export const pillarIndex = (p: Pillar): number => mod(6 * p.stem - 5 * p.branch, 60)
export const pillarOf = (idx: number): Pillar => ({ stem: mod(idx, 10), branch: mod(idx, 12) })
export const pillarKo = (p: Pillar): string => STEM_KO[p.stem] + BRANCH_KO[p.branch]
export const pillarHj = (p: Pillar): string => STEM_HJ[p.stem] + BRANCH_HJ[p.branch]

/** 그레고리력 날짜의 율리우스 일수(JDN, 정오 기준 정수) */
export function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
}
/** 일주 순번 — JDN−11을 60으로 나눈 나머지(1900-01-01 JDN 2415021 → 10=갑술) */
export const dayIndex = (y: number, m: number, d: number): number => mod(jdn(y, m, d) - 11, 60)

export function isValidSolar(y: number, m: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false
  if (m < 1 || m > 12 || d < 1) return false
  return d <= new Date(Date.UTC(y, m, 0)).getUTCDate()
}

// ───────────────────────── 음력(한국 전통력) ─────────────────────────

let lunarFmt: Intl.DateTimeFormat | null | undefined
function getLunarFmt(): Intl.DateTimeFormat | null {
  if (lunarFmt !== undefined) return lunarFmt
  lunarFmt = null
  for (const cal of ['dangi', 'chinese']) {
    try {
      const f = new Intl.DateTimeFormat(`en-u-ca-${cal}`, { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' })
      if (f.resolvedOptions().calendar === cal) {
        lunarFmt = f
        break
      }
    } catch {
      /* 다음 달력 시도 */
    }
  }
  return lunarFmt
}

/** 이 환경에서 음력 변환이 되는가(ICU 달력 미지원 브라우저 대비) */
export const lunarSupported = (): boolean => getLunarFmt() !== null

export interface LunarDate extends YMD {
  leap: boolean
}

/** 양력 → 음력(한국). 지원 안 되면 null */
export function solarToLunar(y: number, m: number, d: number): LunarDate | null {
  const f = getLunarFmt()
  if (!f || !isValidSolar(y, m, d)) return null
  const dt = new Date(Date.UTC(2000, 0, 1))
  dt.setUTCFullYear(y, m - 1, d) // 0~99년도 Date.UTC 보정 없이 그대로
  const parts = f.formatToParts(dt)
  const get = (t: string) => parts.find((p) => p.type === t)?.value
  const mv = get('month') ?? ''
  const lm = parseInt(mv, 10)
  const ld = parseInt(get('day') ?? '', 10)
  // 윤달 표기는 엔진·로캘마다 다르다('5bis', '閏5' 등) — 숫자 외 문자가 붙으면 윤달
  const leap = /\D/.test(mv.replace(/^\s+|\s+$/g, ''))
  let ly = parseInt(get('relatedYear') ?? '', 10)
  if (!Number.isFinite(ly)) {
    const yv = parseInt(get('year') ?? '', 10)
    // relatedYear가 없는 엔진: 음력 11·12월이 양력 1·2월에 걸리면 전년도
    ly = Number.isFinite(yv) && yv > 1000 ? yv : lm >= 11 && m <= 2 ? y - 1 : y
  }
  if (!Number.isFinite(lm) || !Number.isFinite(ld)) return null
  return { y: ly, m: lm, d: ld, leap }
}

/**
 * 음력(한국) → 양력. 없는 날(작은달 30일, 윤달이 아닌 달의 윤달 지정 등)이면 null.
 * 음력 날짜는 같은 숫자의 양력 날짜보다 항상 약 10~60일(윤달이면 최대 약 90일) 뒤에 온다 — 그 창만 훑는다.
 */
export function lunarToSolar(y: number, m: number, d: number, leap: boolean): YMD | null {
  if (!getLunarFmt()) return null
  if (!Number.isInteger(y) || m < 1 || m > 12 || d < 1 || d > 30) return null
  const start = new Date(Date.UTC(2000, 0, 1))
  start.setUTCFullYear(y, m - 1, Math.min(d, 28))
  for (let k = 0; k <= 110; k++) {
    const t = new Date(start.getTime() + k * 86_400_000)
    const sy = t.getUTCFullYear()
    const sm = t.getUTCMonth() + 1
    const sd = t.getUTCDate()
    const l = solarToLunar(sy, sm, sd)
    if (l && l.y === y && l.m === m && l.d === d && l.leap === leap) return { y: sy, m: sm, d: sd }
    // 목표 음력 연도를 지나쳤으면 더 볼 필요 없음
    if (l && l.y > y) break
  }
  return null
}

// ───────────────────────── 시간대 ─────────────────────────

let seoulFmt: Intl.DateTimeFormat | null | undefined
function seoulOffsetMin(utcMs: number): number {
  if (seoulFmt === undefined) {
    try {
      seoulFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul', hourCycle: 'h23',
        year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
      })
    } catch {
      seoulFmt = null
    }
  }
  if (!seoulFmt) return 540
  const p = seoulFmt.formatToParts(new Date(utcMs))
  const g = (t: string) => parseInt(p.find((x) => x.type === t)?.value ?? '0', 10)
  const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'), g('second'))
  return Math.round((asUtc - utcMs) / 60000)
}

/** 한국 시각(당시 표준시·서머타임 포함) → UTC ms */
export function seoulToUtc(y: number, m: number, d: number, h: number, mi: number): number {
  const wall = Date.UTC(y, m - 1, d, h, mi)
  let utc = wall - seoulOffsetMin(wall - 540 * 60000) * 60000
  const off2 = seoulOffsetMin(utc)
  utc = wall - off2 * 60000
  return utc
}

// ───────────────────────── 태양 황경 · 절기 ─────────────────────────

const RAD = Math.PI / 180
/** ΔT(초) — NASA Espenak·Meeus 표(1900 −2.8, 1920 21.2, 1940 24.3, 1960 33.1, 1980 50.5, 2000 63.8, 2020 69.4) 선형 보간 */
const DT_TABLE: [number, number][] = [[1900, -2.8], [1920, 21.2], [1940, 24.3], [1960, 33.1], [1980, 50.5], [2000, 63.8], [2020, 69.4], [2050, 75]]
function deltaT(year: number): number {
  if (year <= DT_TABLE[0][0]) return DT_TABLE[0][1]
  for (let i = 1; i < DT_TABLE.length; i++) {
    const [y1, v1] = DT_TABLE[i]
    const [y0, v0] = DT_TABLE[i - 1]
    if (year <= y1) return v0 + ((v1 - v0) * (year - y0)) / (y1 - y0)
  }
  return DT_TABLE[DT_TABLE.length - 1][1]
}

const utcToJd = (ms: number) => ms / 86_400_000 + 2440587.5
const jdToUtc = (jd: number) => (jd - 2440587.5) * 86_400_000

/** 태양의 겉보기 황경(도) — Meeus 25장 저정밀 식. 입력은 UTC ms(내부에서 ΔT로 TT 변환) */
export function sunLongitude(utcMs: number): number {
  const year = new Date(utcMs).getUTCFullYear()
  const jde = utcToJd(utcMs) + deltaT(year) / 86400
  const T = (jde - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) +
    0.000289 * Math.sin(3 * M * RAD)
  const omega = 125.04 - 1934.136 * T
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD)
  return mod(lambda, 360)
}

/** year(양력) 안에서 태양 황경이 lon(도)이 되는 순간(UTC ms) — 뉴턴 반복 */
export function solarTermUtc(year: number, lon: number): number {
  // 춘분(0°)≈3/20(연중 79일째)에서 황경 1°≈1.0146일
  const doy = mod(79 + (lon / 360) * 365.2422, 365.2422)
  let jd = utcToJd(Date.UTC(year, 0, 1)) + doy
  for (let i = 0; i < 8; i++) {
    const diff = mod(lon - sunLongitude(jdToUtc(jd)) + 180, 360) - 180
    jd += (diff * 365.2422) / 360
    if (Math.abs(diff) < 1e-7) break
  }
  return jdToUtc(jd)
}

/** 월주를 바꾸는 12절(節) — 황경(도)과 이름 */
export const JIE: { lon: number; ko: string }[] = [
  { lon: 285, ko: '소한' }, { lon: 315, ko: '입춘' }, { lon: 345, ko: '경칩' }, { lon: 15, ko: '청명' },
  { lon: 45, ko: '입하' }, { lon: 75, ko: '망종' }, { lon: 105, ko: '소서' }, { lon: 135, ko: '입추' },
  { lon: 165, ko: '백로' }, { lon: 195, ko: '한로' }, { lon: 225, ko: '입동' }, { lon: 255, ko: '대설' },
]

// ───────────────────────── 사주팔자 ─────────────────────────

export type TimeInput =
  | { kind: 'unknown' }
  | { kind: 'branch'; branch: number } // 12지 시진으로 고름
  | { kind: 'exact'; h: number; mi: number } // 한국 시각 HH:MM

export interface Chart {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
  /** 계산에 쓴 양력 생일 */
  solar: YMD
  /** 출생 순간의 태양 황경(도) — 절기 경계 근처인지 안내용 */
  sunLon: number
  /** 절기 경계 가까이 태어남(시각 정밀도 대비) — 년·월주가 만세력마다 다를 수 있음 */
  nearTerm: boolean
}

/** 시진 대표 시각(한국 시각) — 자시 00:30, 축시 02:30 … (30분 보정 체계의 한가운데) */
export const branchMidTime = (b: number): { h: number; mi: number } => ({ h: (b * 2) % 24, mi: 30 })
/** 시진의 한국 시각 범위 표기 — 자시 23:30~01:29 */
export function branchRangeKo(b: number): string {
  const p = (n: number) => String(n).padStart(2, '0')
  const sh = mod(b * 2 - 1, 24)
  const eh = mod(b * 2 + 1, 24)
  return `${p(sh)}:30~${p(eh)}:29`
}

/** 양력 생일 + 시각 → 사주팔자 */
export function chartOf(solar: YMD, time: TimeInput): Chart {
  const { y, m, d } = solar
  // 년·월주를 가를 '순간' — 시각을 모르면 정오로 본다
  const tm = time.kind === 'exact' ? { h: time.h, mi: time.mi } : time.kind === 'branch' ? branchMidTime(time.branch) : { h: 12, mi: 0 }
  const utc = seoulToUtc(y, m, d, tm.h, tm.mi)
  const lon = sunLongitude(utc)

  // 년주 — 입춘(315°) 전이면 전년도
  const ipchun = solarTermUtc(y, 315)
  const sajuYear = utc < ipchun ? y - 1 : y
  const year: Pillar = { stem: mod(sajuYear - 4, 10), branch: mod(sajuYear - 4, 12) }

  // 월주 — 입춘부터 30°마다 인·묘·진…축. 월간은 오호둔(五虎遁): 갑기년→병인월 …
  const ord = Math.floor(mod(lon - 315, 360) / 30)
  const month: Pillar = { stem: mod((year.stem % 5) * 2 + 2 + ord, 10), branch: mod(2 + ord, 12) }

  // 일주·시주
  let day: Pillar
  let hour: Pillar | null = null
  if (time.kind === 'exact') {
    // 동경 127.5° 지방평균시(UTC+8:30). 23시 이후(자시)는 다음 날 일주
    const lmt = new Date(utc + 510 * 60000)
    const lh = lmt.getUTCHours() + lmt.getUTCMinutes() / 60
    const base = { y: lmt.getUTCFullYear(), m: lmt.getUTCMonth() + 1, d: lmt.getUTCDate() }
    const di = mod(dayIndex(base.y, base.m, base.d) + (lh >= 23 ? 1 : 0), 60)
    day = pillarOf(di)
    const hb = Math.floor((lh + 1) / 2) % 12
    hour = { stem: mod((day.stem % 5) * 2 + hb, 10), branch: hb }
  } else {
    day = pillarOf(dayIndex(y, m, d))
    if (time.kind === 'branch') {
      const hb = mod(time.branch, 12)
      hour = { stem: mod((day.stem % 5) * 2 + hb, 10), branch: hb }
    }
  }

  // 절기 경계 근처 → 안내. 황경 1° ≈ 1일. 시각 모름=±1일, 시진=±2시간, 정확한 시각=±20분(계산 오차 15분 + 여유)
  const tol = time.kind === 'unknown' ? 1.02 : time.kind === 'branch' ? 0.09 : 0.014
  const nearTerm = JIE.some((j) => Math.abs(mod(lon - j.lon + 180, 360) - 180) < tol)
  return { year, month, day, hour, solar, sunLon: lon, nearTerm }
}

/** 오늘(또는 임의 날짜)의 일진·월건·세운 — 정오 기준 */
export function dayChart(date: YMD): Chart {
  return chartOf(date, { kind: 'unknown' })
}

// ───────────────────────── 해석 재료(십신·합충·강약) ─────────────────────────

export type TenGod = '비견' | '겁재' | '식신' | '상관' | '편재' | '정재' | '편관' | '정관' | '편인' | '정인'

/** 일간 기준 다른 천간의 십신 — 오행 관계 + 음양 같음/다름 */
export function tenGod(dayStem: number, other: number): TenGod {
  const me = STEM_EL[dayStem]
  const o = STEM_EL[other]
  const same = dayStem % 2 === other % 2
  if (me === o) return same ? '비견' : '겁재'
  if (SHENG[me] === o) return same ? '식신' : '상관'
  if (KE[me] === o) return same ? '편재' : '정재'
  if (KE[o] === me) return same ? '편관' : '정관'
  return same ? '편인' : '정인'
}
export const TEN_GOD_GROUP: Record<TenGod, '비겁' | '식상' | '재성' | '관성' | '인성'> = {
  비견: '비겁', 겁재: '비겁', 식신: '식상', 상관: '식상', 편재: '재성', 정재: '재성', 편관: '관성', 정관: '관성', 편인: '인성', 정인: '인성',
}

/** 천간합(갑기·을경·병신·정임·무계) — 차이 5 */
export const stemHap = (a: number, b: number) => Math.abs(a - b) === 5
/** 천간충(갑경·을신·병임·정계) — 같은 음양, 차이 6(무·기는 충 없음) */
export const stemChung = (a: number, b: number) => Math.abs(a - b) === 6
/** 지지 육합(자축·인해·묘술·진유·사신·오미) — 합이 13 또는 1(mod 12) */
export const branchHap = (a: number, b: number) => mod(a + b, 12) === 1
/** 지지 육충(자오·축미·인신·묘유·진술·사해) — 차이 6 */
export const branchChung = (a: number, b: number) => mod(a - b, 12) === 6
/** 삼합(신자진·해묘미·인오술·사유축) — 같은 조(차이 4·8) */
export const branchSamhap = (a: number, b: number) => a !== b && mod(a - b, 4) === 0

export interface ElementCount {
  counts: Record<El, number>
  total: number
}
/** 사주 여덟 글자(시각 모르면 여섯)의 오행 분포 — 천간 오행 + 지지 본 오행 */
export function elementCount(c: Chart): ElementCount {
  const counts: Record<El, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  const ps = [c.year, c.month, c.day, c.hour].filter(Boolean) as Pillar[]
  for (const p of ps) {
    counts[STEM_EL[p.stem]]++
    counts[BRANCH_EL[p.branch]]++
  }
  return { counts, total: ps.length * 2 }
}

export type Strength = 'strong' | 'balanced' | 'weak'
export interface StrengthInfo {
  strength: Strength
  /** 일간을 돕는 기운(비겁+인성) 비율 0~1 */
  ratio: number
  /** 억부(抑扶) 기준으로 도움 되는 오행 — 앞쪽이 우선 */
  favorable: El[]
}

/**
 * 일간 강약 — 억부법의 단순화. 일간과 같은 오행(비겁)·일간을 낳는 오행(인성)을 '돕는 힘'으로 보고
 * 월지(득령) 3, 일지(득지) 1.5, 나머지 글자 1의 가중치로 비율을 낸다(무작위 기대값 0.4).
 * 강하면 설기·극하는 오행(식상·재·관), 약하면 돕는 오행(인성·비겁)이 '필요한 기운'.
 */
export function strengthOf(c: Chart): StrengthInfo {
  const me = STEM_EL[c.day.stem]
  const genMe = (Object.keys(SHENG) as El[]).find((k) => SHENG[k] === me)!
  const supports = (el: El) => el === me || el === genMe
  const items: [El, number][] = [
    [STEM_EL[c.year.stem], 1], [BRANCH_EL[c.year.branch], 1],
    [STEM_EL[c.month.stem], 1], [BRANCH_EL[c.month.branch], 3],
    [BRANCH_EL[c.day.branch], 1.5],
  ]
  if (c.hour) items.push([STEM_EL[c.hour.stem], 1], [BRANCH_EL[c.hour.branch], 1])
  const total = items.reduce((a, [, w]) => a + w, 0)
  const sup = items.reduce((a, [el, w]) => a + (supports(el) ? w : 0), 0)
  const ratio = sup / total
  const strength: Strength = ratio >= 0.5 ? 'strong' : ratio <= 0.34 ? 'weak' : 'balanced'
  const { counts } = elementCount(c)
  const byFewest = (els: El[]) => [...els].sort((a, b) => counts[a] - counts[b] || ELS.indexOf(a) - ELS.indexOf(b))
  const ctlMe = (Object.keys(KE) as El[]).find((k) => KE[k] === me)!
  let favorable: El[]
  if (strength === 'strong') favorable = byFewest([SHENG[me], KE[me], ctlMe])
  else if (strength === 'weak') favorable = byFewest([genMe, me])
  else favorable = byFewest(ELS).slice(0, 2)
  return { strength, ratio, favorable }
}

/** 만 나이·세는 나이 */
export function ageOf(birth: YMD, today: YMD): { man: number; korean: number } {
  const before = today.m < birth.m || (today.m === birth.m && today.d < birth.d)
  return { man: today.y - birth.y - (before ? 1 : 0), korean: today.y - birth.y + 1 }
}

// ───────────────────────── 운세 프로필(입력값) ─────────────────────────

/**
 * 오늘의 운세 입력값 — 본인 또는 가족·친구. 입력한 그대로 저장한다(음력이면 음력 숫자).
 * time: '' = 모름 · 'b:0'~'b:11' = 12지 시진 · 'HH:MM' = 한국 시각
 */
export interface FortuneProfile {
  name: string
  gender: 'm' | 'f' | ''
  calendar: 'solar' | 'lunar'
  /** YYYY-MM-DD (calendar 기준 숫자) */
  date: string
  leap: boolean
  time: string
  /** 본인 정보 — 이때만 계정의 생일(birthDate: 홈·궁합이 쓰는 양력)과 동기화 */
  self: boolean
}

export const emptyProfile = (): FortuneProfile => ({ name: '', gender: '', calendar: 'solar', date: '', leap: false, time: '', self: false })

/** 예전 버전의 양력 생일(birthDate)만 있던 사용자 → 본인 프로필 */
export const profileFromBirthDate = (birthDate: string): FortuneProfile => ({ ...emptyProfile(), date: birthDate, self: true })

export function parseTime(t: string): TimeInput {
  const b = /^b:(\d{1,2})$/.exec(t)
  if (b && +b[1] >= 0 && +b[1] < 12) return { kind: 'branch', branch: +b[1] }
  const e = /^(\d{2}):(\d{2})$/.exec(t)
  if (e && +e[1] < 24 && +e[2] < 60) return { kind: 'exact', h: +e[1], mi: +e[2] }
  return { kind: 'unknown' }
}

export function parseYmd(s: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null
}
export const fmtYmd = (d: YMD): string => `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`

/** 프로필 → 양력 생일. 음력이 존재하지 않는 날이면 null */
export function profileSolar(p: FortuneProfile): YMD | null {
  const d = parseYmd(p.date)
  if (!d) return null
  if (p.calendar === 'lunar') return lunarToSolar(d.y, d.m, d.d, p.leap)
  return isValidSolar(d.y, d.m, d.d) ? d : null
}

/** 같은 사람 판정 키 — 계산에 쓰이는 값만(이름 제외: 이름은 풀이에 쓰지 않는다) */
export const profileKey = (p: FortuneProfile): string => [p.calendar, p.date, p.calendar === 'lunar' && p.leap ? 'L' : '', p.time, p.gender].join('|')
