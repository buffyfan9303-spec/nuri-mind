/**
 * 사주(일주)·음양오행 결정론적 계산 — '오늘의 운세'용. 점술 단정이 아닌 '재미로 보는 오늘의 기운'.
 * 일주(60갑자) 공식은 3개 독립 권위자료로 교차검증(2019-01-27=갑자, 2000-01-01=무오, 2026-06-17=임술).
 */
import { FORTUNE_TEMPLATES, BIRTH_FLOWERS, COMPAT_TEMPLATES, SHORT_LINES, YEAR_LINES, type FortuneTemplate, type BirthFlower, type CompatTemplate } from '../data/fortune'
import type { L } from '../data/types'

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

const SHENG: Record<string, string> = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' }
const KE: Record<string, string> = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' }
const COLOR_KO: Record<string, string> = { 목: '초록', 화: '빨강', 토: '노랑', 금: '흰색', 수: '남색' }
const COLOR_HEX: Record<string, string> = { 목: '#36B37E', 화: '#FF5630', 토: '#FFAB00', 금: '#C7CDD6', 수: '#2B4C7E' }
const GRAD: Record<string, [string, string]> = {
  목: ['#36B37E', '#79E0B0'], 화: ['#FF5630', '#FF9E7A'], 토: ['#FFAB00', '#FFD56B'],
  금: ['#8E99AB', '#C7CDD6'], 수: ['#2B4C7E', '#5E80B5'],
}
const DIR_KO: Record<string, string> = { 목: '동', 화: '남', 토: '중앙', 금: '서', 수: '북' }
const NUMS: Record<string, [number, number]> = { 목: [3, 8], 화: [2, 7], 토: [5, 10], 금: [4, 9], 수: [1, 6] }

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

/** 그레고리력 Y/M/D → 60갑자 일주 인덱스(0=갑자 … 59=계해). */
export function dayPillarIndex(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
  return ((jdn - 11) % 60 + 60) % 60
}

function relation(me: string, today: string): string {
  if (me === today) return '비화'
  if (SHENG[today] === me) return '생받음'
  if (SHENG[me] === today) return '생해줌'
  if (KE[today] === me) return '극받음'
  return '극해줌'
}

export interface Saju {
  iljuKo: string
  ilganKo: string
  ilganEl: string
  ilganYm: string
  zodiacKo: string
  zodiacEmoji: string
  birthFlower: BirthFlower
}

/** 생년월일 → 일주·일간 오행·띠·탄생화 (시각 불필요). */
export function sajuOf(y: number, m: number, d: number): Saju {
  const idx = dayPillarIndex(y, m, d)
  const stem = STEMS[idx % 10]
  const branch = BRANCHES[idx % 12]
  const zo = BRANCHES[(((y - 4) % 12) + 12) % 12]
  return {
    iljuKo: stem.ko + branch.ko,
    ilganKo: stem.ko,
    ilganEl: stem.el,
    ilganYm: stem.ym,
    zodiacKo: zo.zo,
    zodiacEmoji: zo.emoji,
    birthFlower: BIRTH_FLOWERS[clamp(m, 1, 12) - 1],
  }
}

const BASE: Record<string, number> = { 생받음: 85, 극해줌: 78, 비화: 70, 생해줌: 62, 극받음: 52 }

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
}

/** 출생 일간 오행 vs 오늘 일주 오행 → 오늘의 기운(결정론적: 같은 입력=같은 결과). */
export function fortuneOf(birth: { y: number; m: number; d: number }, today: { y: number; m: number; d: number }): DailyFortune {
  const birthIdx = dayPillarIndex(birth.y, birth.m, birth.d)
  const birthEl = STEMS[birthIdx % 10].el
  const todayIdx = dayPillarIndex(today.y, today.m, today.d)
  const todayStem = STEMS[todayIdx % 10]
  const todayEl = todayStem.el
  const rel = relation(birthEl, todayEl)
  const base = BASE[rel]
  const seed = birthIdx
  const sc = (a: number, b: number) => clamp(base + ((((todayIdx * a + seed * b) % 15) + 15) % 15 - 7), 1, 99)
  return {
    relation: rel,
    template: FORTUNE_TEMPLATES[rel],
    overall: clamp(base + ((((todayIdx * 7 + seed) % 15) + 15) % 15 - 7), 1, 99),
    love: sc(3, 2),
    money: sc(5, 4),
    health: sc(11, 8),
    todayIljuKo: todayStem.ko + BRANCHES[todayIdx % 12].ko,
    todayEl,
    luckyColorKo: COLOR_KO[todayEl],
    luckyColorHex: COLOR_HEX[todayEl],
    luckyNumber: NUMS[todayEl][todayIdx % 2],
    luckyDir: DIR_KO[todayEl],
    grad: GRAD[todayEl],
  }
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
export function weekOf(birth: { y: number; m: number; d: number }, today: { y: number; m: number; d: number }): WeekDay[] {
  const out: WeekDay[] = []
  for (let i = 0; i < 7; i++) {
    const dt = new Date(today.y, today.m - 1, today.d + i)
    const day = { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() }
    const f = fortuneOf(birth, day)
    out.push({ ...day, weekdayKo: WD[dt.getDay()], overall: f.overall, relation: f.relation, isToday: i === 0 })
  }
  return out
}

/** 올해의 운 — 출생 일간 오행 vs 올해 천간 오행. */
export function yearOf(birth: { y: number; m: number; d: number }, year: number): { relation: string; line: L; el: string } {
  const bi = dayPillarIndex(birth.y, birth.m, birth.d)
  const birthEl = STEMS[bi % 10].el
  const yearStemEl = STEMS[(((year - 4) % 10) + 10) % 10].el
  const rel = relation(birthEl, yearStemEl)
  return { relation: rel, line: YEAR_LINES[rel], el: yearStemEl }
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
