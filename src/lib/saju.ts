/**
 * 사주팔자·음양오행 결정론적 계산 — '오늘의 운세'용. 점술 단정이 아닌 '재미로 보는 오늘의 기운'.
 * 만세력(년·월·일·시주, 음력, 절기)은 ./manse.ts — 출처와 검증(scripts/saju-check.mjs)은 그 파일 머리말 참조.
 * 일주(60갑자) 공식은 3개 독립 권위자료로 교차검증(2019-01-27=갑자, 2000-01-01=무오, 2026-06-17=임술).
 */
import { FORTUNE_TEMPLATES, BIRTH_FLOWERS, COMPAT_TEMPLATES, SHORT_LINES, YEAR_LINES, MONTH_LINES, type FortuneTemplate, type BirthFlower, type CompatTemplate } from '../data/fortune'
import type { L } from '../data/types'
import { buildDetail, type FortuneDetail } from '../data/fortuneDetail'
import {
  chartOf, dayChart, dayIndex, pillarKo, pillarIndex, strengthOf, elementCount, tenGod, TEN_GOD_GROUP, SHENG, KE,
  STEM_EL, BRANCH_EL, stemHap, stemChung, branchHap, branchChung, branchSamhap,
  type Chart, type El, type TenGod, type StrengthInfo, type ElementCount,
} from './manse'
export type { FortuneDetail, Chart }

const STEMS = [
  { ko: '갑', el: '목', ym: '양' }, { ko: '을', el: '목', ym: '음' },
  { ko: '병', el: '화', ym: '양' }, { ko: '정', el: '화', ym: '음' },
  { ko: '무', el: '토', ym: '양' }, { ko: '기', el: '토', ym: '음' },
  { ko: '경', el: '금', ym: '양' }, { ko: '신', el: '금', ym: '음' },
  { ko: '임', el: '수', ym: '양' }, { ko: '계', el: '수', ym: '음' },
] as const

const BRANCHES = [
  { ko: '자', el: '수', zo: '쥐', emoji: '🐭' }, { ko: '축', el: '토', zo: '소', emoji: '🐮' },
  { ko: '인', el: '목', zo: '호랑이', emoji: '🐯' }, { ko: '묘', el: '목', zo: '토끼', emoji: '🐰' },
  { ko: '진', el: '토', zo: '용', emoji: '🐲' }, { ko: '사', el: '화', zo: '뱀', emoji: '🐍' },
  { ko: '오', el: '화', zo: '말', emoji: '🐴' }, { ko: '미', el: '토', zo: '양', emoji: '🐑' },
  { ko: '신', el: '금', zo: '원숭이', emoji: '🐵' }, { ko: '유', el: '금', zo: '닭', emoji: '🐔' },
  { ko: '술', el: '토', zo: '개', emoji: '🐶' }, { ko: '해', el: '수', zo: '돼지', emoji: '🐷' },
] as const

const COLOR_KO: Record<string, string> = { 목: '초록', 화: '빨강', 토: '노랑', 금: '흰색', 수: '남색' }
const COLOR_HEX: Record<string, string> = { 목: '#36B37E', 화: '#FF5630', 토: '#FFAB00', 금: '#C7CDD6', 수: '#2B4C7E' }
const GRAD: Record<string, [string, string]> = {
  목: ['#36B37E', '#79E0B0'], 화: ['#FF5630', '#FF9E7A'], 토: ['#FFAB00', '#FFD56B'],
  금: ['#8E99AB', '#C7CDD6'], 수: ['#2B4C7E', '#5E80B5'],
}
const DIR_KO: Record<string, string> = { 목: '동', 화: '남', 토: '중앙', 금: '서', 수: '북' }
const NUMS: Record<string, [number, number]> = { 목: [3, 8], 화: [2, 7], 토: [5, 10], 금: [4, 9], 수: [1, 6] }

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))
type YMD = { y: number; m: number; d: number }
export type Gender = 'm' | 'f' | ''

/** 그레고리력 Y/M/D → 60갑자 일주 인덱스(0=갑자 … 59=계해). */
export function dayPillarIndex(y: number, m: number, d: number): number {
  return dayIndex(y, m, d)
}

function relation(me: string, today: string): string {
  if (me === today) return '비화'
  if (SHENG[today as El] === me) return '생받음'
  if (SHENG[me as El] === today) return '생해줌'
  if (KE[today as El] === me) return '극받음'
  return '극해줌'
}

/** 생년월일만 있을 때의 사주 — 시각 모름(정오 기준으로 년·월주 판정) */
const chartOfDate = (b: YMD): Chart => chartOf(b, { kind: 'unknown' })

export interface Saju {
  iljuKo: string
  ilganKo: string
  ilganEl: string
  ilganYm: string
  zodiacKo: string
  zodiacEmoji: string
  birthFlower: BirthFlower
}

/**
 * 생년월일 → 일주·일간 오행·띠·탄생화.
 * 띠는 사주 기준(입춘에 바뀜) — 예전엔 양력 1월 1일에 바꿔 1~2월 초 생일의 띠가 한 해 앞섰다.
 */
export function sajuOf(y: number, m: number, d: number, chart?: Chart): Saju {
  const c = chart ?? chartOfDate({ y, m, d })
  const stem = STEMS[c.day.stem]
  const zo = BRANCHES[c.year.branch]
  return {
    iljuKo: pillarKo(c.day),
    ilganKo: stem.ko,
    ilganEl: stem.el,
    ilganYm: stem.ym,
    zodiacKo: zo.zo,
    zodiacEmoji: zo.emoji,
    birthFlower: BIRTH_FLOWERS[clamp(m, 1, 12) - 1],
  }
}

const BASE: Record<string, number> = { 생받음: 85, 극해줌: 78, 비화: 70, 생해줌: 62, 극받음: 52 }

export type PillarPos = 'year' | 'month' | 'day' | 'hour'
export interface BranchRel {
  pos: PillarPos
  kind: 'hap' | 'samhap' | 'chung'
}

export interface DailyFortune {
  relation: string
  template: FortuneTemplate
  overall: number
  love: number
  money: number
  health: number
  todayIljuKo: string
  todayEl: string
  luckyColorKo: string
  luckyColorHex: string
  luckyNumber: number
  luckyDir: string
  grad: [string, string]
  /** 오늘 일진 천간의 십신(내 일간 기준) */
  tenGod: TenGod
  /** 오늘 천간 ↔ 내 일간 합·충 */
  stemRel: 'hap' | 'chung' | null
  /** 오늘 지지 ↔ 내 사주 지지 합·충 */
  branchRels: BranchRel[]
  /** 오늘 기운(천간·지지)이 내게 필요한 오행인가 */
  favorableToday: boolean
  /** 행운 요소를 고른 오행 */
  luckyEl: string
}

/** 결정론적 흔들림 −r…+r */
const jitter = (a: number, b: number, r: number) => ((((a + b) % (2 * r + 1)) + 2 * r + 1) % (2 * r + 1)) - r

/**
 * 오늘의 기운 — 결정론적(같은 입력=같은 결과).
 *  · 바탕 점수: 내 일간 오행 vs 오늘 일진 천간 오행(생·극 5관계)
 *  · 보정: 오늘 오행이 내게 필요한 기운(억부)인가, 천간합·충, 지지 육합·삼합·충(일지=가까운 사람 자리)
 *  · 분야: 재성일→금전, 식상일→금전 소폭(식상생재), 비겁일→금전 주의, 인성일→건강, 편관일→건강 주의,
 *          애정은 전통 해석대로 남성=재성·여성=관성이 들어오는 날 가산(성별을 모르면 가산 없음)
 * chart를 주면 시주까지 반영한 전체 사주로, 없으면 생년월일만으로(시각 모름) 계산한다.
 */
export function fortuneOf(birth: YMD, today: YMD, opts: { chart?: Chart; gender?: Gender } = {}): DailyFortune {
  const c = opts.chart ?? chartOfDate(birth)
  const st = strengthOf(c)
  const birthIdx = pillarIndex(c.day)
  const birthEl = STEM_EL[c.day.stem]
  const todayIdx = dayPillarIndex(today.y, today.m, today.d)
  const tStem = todayIdx % 10
  const tBranch = todayIdx % 12
  const todayEl = STEM_EL[tStem]
  const rel = relation(birthEl, todayEl)
  const tg = tenGod(c.day.stem, tStem)
  const grp = TEN_GOD_GROUP[tg]

  const stemRel = stemHap(c.day.stem, tStem) ? 'hap' : stemChung(c.day.stem, tStem) ? 'chung' : null
  const natal: [PillarPos, number | null][] = [['year', c.year.branch], ['month', c.month.branch], ['day', c.day.branch], ['hour', c.hour?.branch ?? null]]
  const branchRels: BranchRel[] = []
  for (const [pos, b] of natal) {
    if (b === null) continue
    if (branchChung(b, tBranch)) branchRels.push({ pos, kind: 'chung' })
    else if (branchHap(b, tBranch)) branchRels.push({ pos, kind: 'hap' })
    else if (branchSamhap(b, tBranch)) branchRels.push({ pos, kind: 'samhap' })
  }
  const dayRel = branchRels.find((r) => r.pos === 'day')?.kind
  const stemFav = st.favorable.includes(todayEl)
  const branchFav = st.favorable.includes(BRANCH_EL[tBranch])

  let mod = (stemFav ? 5 : -2) + (branchFav ? 3 : -1)
  if (stemRel === 'hap') mod += 3
  if (stemRel === 'chung') mod -= 4
  for (const r of branchRels) {
    const w = r.pos === 'day' ? 1 : 0.5
    mod += Math.round((r.kind === 'hap' ? 4 : r.kind === 'samhap' ? 2 : -5) * w)
  }
  const base = BASE[rel] + mod
  const seed = birthIdx * 12 + (c.hour?.branch ?? 12)
  const g = opts.gender ?? ''
  const loveBonus = (g === 'm' && grp === '재성') || (g === 'f' && grp === '관성') ? 6 : 0
  const love = base + loveBonus + (dayRel === 'hap' ? 4 : dayRel === 'chung' ? -4 : 0) + jitter(todayIdx * 3, seed * 2, 5)
  const money = base + (grp === '재성' ? 6 : grp === '식상' ? 3 : grp === '비겁' ? -3 : 0) + jitter(todayIdx * 5, seed * 4, 5)
  const health = base + (grp === '인성' ? 4 : tg === '편관' ? -5 : 0) + (dayRel === 'chung' ? -3 : 0) + jitter(todayIdx * 11, seed * 8, 5)

  // 행운 오행 — 오늘 기운이 내게 필요한 것이면 그 흐름을 타고, 나를 누르는 날(관살)이면 통관(인성)으로,
  // 아니면 내게 가장 필요한 오행으로
  const genMe = (Object.keys(SHENG) as El[]).find((k) => SHENG[k] === birthEl)!
  const luckyEl: El = stemFav ? todayEl : KE[todayEl] === birthEl ? genMe : st.favorable[0]

  return {
    relation: rel,
    template: FORTUNE_TEMPLATES[rel],
    overall: clamp(base + jitter(todayIdx * 7, seed, 5), 5, 98),
    love: clamp(love, 5, 98),
    money: clamp(money, 5, 98),
    health: clamp(health, 5, 98),
    todayIljuKo: STEMS[tStem].ko + BRANCHES[tBranch].ko,
    todayEl,
    luckyColorKo: COLOR_KO[luckyEl],
    luckyColorHex: COLOR_HEX[luckyEl],
    luckyNumber: NUMS[luckyEl][todayIdx % 2],
    luckyDir: DIR_KO[luckyEl],
    grad: GRAD[todayEl],
    tenGod: tg,
    stemRel,
    branchRels,
    favorableToday: stemFav || branchFav,
    luckyEl,
  }
}

/** 사주 원국 요약 — 오행 분포·일간 강약 */
export function analysisOf(c: Chart): { elements: ElementCount; strength: StrengthInfo } {
  return { elements: elementCount(c), strength: strengthOf(c) }
}

/** 오늘의 '상세 운세'(유료/광고 해제 영역) — 결정론적. */
export function detailOf(birth: YMD, today: YMD, chart?: Chart): FortuneDetail {
  const c = chart ?? chartOfDate(birth)
  // 같은 일주라도 태어난 시가 다르면 다른 풀이가 나오도록 시지를 섞는다
  return buildDetail(pillarIndex(c.day) + (c.hour ? c.hour.branch * 60 : 0), dayPillarIndex(today.y, today.m, today.d))
}

export interface Compat {
  relation: string
  template: CompatTemplate
  score: number
  aIlju: string
  bIlju: string
  aEl: string
  bEl: string
  grad: [string, string]
}

/** 두 생일 궁합 — 나(A) 일간 오행 vs 상대(B) 일간 오행 관계. */
export function compatOf(a: { y: number; m: number; d: number }, b: { y: number; m: number; d: number }): Compat {
  const ai = dayPillarIndex(a.y, a.m, a.d)
  const bi = dayPillarIndex(b.y, b.m, b.d)
  const aEl = STEMS[ai % 10].el
  const bEl = STEMS[bi % 10].el
  const rel = relation(aEl, bEl)
  const tpl = COMPAT_TEMPLATES[rel]
  return {
    relation: rel,
    template: tpl,
    score: tpl.score,
    aIlju: STEMS[ai % 10].ko + BRANCHES[ai % 12].ko,
    bIlju: STEMS[bi % 10].ko + BRANCHES[bi % 12].ko,
    aEl,
    bEl,
    grad: GRAD[aEl],
  }
}

export interface WeekDay {
  y: number
  m: number
  d: number
  weekdayKo: string
  overall: number
  relation: string
  isToday: boolean
}
const WD = ['일', '월', '화', '수', '목', '금', '토']

/** 오늘부터 7일 총운 추이. */
export function weekOf(birth: YMD, today: YMD, opts: { chart?: Chart; gender?: Gender } = {}): WeekDay[] {
  const c = opts.chart ?? chartOfDate(birth)
  const out: WeekDay[] = []
  for (let i = 0; i < 7; i++) {
    const dt = new Date(today.y, today.m - 1, today.d + i)
    const day = { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() }
    const f = fortuneOf(birth, day, { chart: c, gender: opts.gender })
    out.push({ ...day, weekdayKo: WD[dt.getDay()], overall: f.overall, relation: f.relation, isToday: i === 0 })
  }
  return out
}

/** 올해의 운 — 출생 일간 오행 vs 올해 세운(歲運) 천간 오행. */
export function yearOf(birth: YMD, year: number, chart?: Chart): { relation: string; line: L; el: string } {
  const c = chart ?? chartOfDate(birth)
  const birthEl = STEM_EL[c.day.stem]
  const yearStemEl = STEMS[(((year - 4) % 10) + 10) % 10].el
  const rel = relation(birthEl, yearStemEl)
  return { relation: rel, line: YEAR_LINES[rel], el: yearStemEl }
}

/**
 * 이달의 운 — 출생 일간 오행 vs 이달 월건(月建) 천간 오행.
 * 월건은 그 달 15일 정오의 절기 월로 본다(절입일은 매달 4~8일이라 달의 대부분이 이 월건).
 */
export function monthOf(birth: YMD, year: number, month: number, chart?: Chart): { relation: string; line: L; el: string; overall: number } {
  const c = chart ?? chartOfDate(birth)
  const bi = pillarIndex(c.day)
  const birthEl = STEM_EL[c.day.stem]
  const monthEl = STEM_EL[dayChart({ y: year, m: month, d: 15 }).month.stem]
  const rel = relation(birthEl, monthEl)
  const base = BASE[rel]
  const k = year * 12 + month
  const overall = clamp(base + ((((k * 7 + bi) % 15) + 15) % 15 - 7), 1, 99)
  return { relation: rel, line: MONTH_LINES[rel], el: monthEl, overall }
}

/** 띠별 오늘 한 줄 — 각 띠 지지 오행 vs 오늘 일간 오행. */
export function zodiacTodayLines(today: { y: number; m: number; d: number }): { zodiacKo: string; zodiacEmoji: string; line: L; relation: string }[] {
  const todayIdx = dayPillarIndex(today.y, today.m, today.d)
  const todayEl = STEMS[todayIdx % 10].el
  return BRANCHES.map((b) => {
    const rel = relation(b.el, todayEl)
    return { zodiacKo: b.zo, zodiacEmoji: b.emoji, line: SHORT_LINES[rel], relation: rel }
  })
}
