import type { L, LedgerEntry } from '../data/types'
import { mulberry32, shuffle } from './random'

/**
 * 주간 리그 (Duolingo 리그 벤치마크)
 * - 월요일 00:00 리셋, 이번 주 적립 포인트로 10인 그룹 경쟁
 * - TOP3 승급 / 하위 3명 강등
 * - 봇 9명은 (주차키+시드)로 결정론 생성 — 같은 주엔 항상 동일, 시간이 지나며 점수 상승
 */

export interface LeagueTier {
  emoji: string
  color: string
  name: L
}

export const LEAGUE_TIERS: LeagueTier[] = [
  { emoji: '🥉', color: '#C8824A', name: { ko: '브론즈 리그', en: 'Bronze League', ja: 'ブロンズリーグ' } },
  { emoji: '🥈', color: '#8C9BA8', name: { ko: '실버 리그', en: 'Silver League', ja: 'シルバーリーグ' } },
  { emoji: '🥇', color: '#E0A52E', name: { ko: '골드 리그', en: 'Gold League', ja: 'ゴールドリーグ' } },
  { emoji: '💎', color: '#5EA8D8', name: { ko: '다이아 리그', en: 'Diamond League', ja: 'ダイヤリーグ' } },
]

const BOT_NAMES: Record<'ko' | 'en' | 'ja', string[]> = {
  ko: ['집중하는 수달', '명상하는 고슴도치', '퀴즈왕 펭귄', '계획적인 비버', '새벽형 부엉이', '긍정 햄스터', '전략가 여우', '꾸준한 거북이', '열정 다람쥐', '분석가 돌고래', '차분한 알파카', '도전자 캥거루'],
  en: ['Focused Otter', 'Zen Hedgehog', 'Quiz Penguin', 'Planner Beaver', 'Dawn Owl', 'Sunny Hamster', 'Tactic Fox', 'Steady Turtle', 'Spark Squirrel', 'Analyst Dolphin', 'Calm Alpaca', 'Daring Kangaroo'],
  ja: ['集中するカワウソ', '瞑想ハリネズミ', 'クイズ王ペンギン', '計画的ビーバー', '早朝フクロウ', 'ポジティブハムスター', '戦略家キツネ', '地道なカメ', '情熱リス', '分析イルカ', '穏やかアルパカ', '挑戦者カンガルー'],
}
const BOT_EMOJIS = ['🦦', '🦔', '🐧', '🦫', '🦉', '🐹', '🦊', '🐢', '🐿️', '🐬', '🦙', '🦘']

/** 월요일 기준 주차 키 (로컬 시간) */
export function weekKeyOf(d = new Date()): string {
  const day = (d.getDay() + 6) % 7 // 월=0
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

export function weekStartMs(weekKey = weekKeyOf()): number {
  const [y, m, dd] = weekKey.split('-').map(Number)
  return new Date(y, m - 1, dd).getTime()
}

export function nextResetMs(): number {
  return weekStartMs() + 7 * 86400000
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export interface Bot {
  name: string
  emoji: string
  points: number
}

/** 주차+시드 결정론 봇 9명 — 하루 단위로 점수가 누적 상승 */
export function botsFor(weekKey: string, seed: number, tier: number, lang: 'ko' | 'en' | 'ja', now = Date.now()): Bot[] {
  const rnd = mulberry32(hashStr(weekKey) ^ seed)
  const idxs = shuffle(Array.from({ length: BOT_NAMES.ko.length }, (_, i) => i), rnd).slice(0, 9)
  const start = weekStartMs(weekKey)
  const elapsedDays = Math.max(0, Math.min(7, (now - start) / 86400000))
  const fullDays = Math.floor(elapsedDays)
  const frac = elapsedDays - fullDays

  return idxs.map((nameIdx) => {
    const base = 8 + rnd() * 45 // 봇별 일일 기본 적립
    const tierBoost = 1 + tier * 0.35
    let pts = 0
    const dayRnd = mulberry32(hashStr(weekKey + ':' + nameIdx) ^ seed)
    for (let d = 0; d <= fullDays; d++) {
      const dayEarn = base * (0.5 + dayRnd()) * tierBoost
      pts += d === fullDays ? dayEarn * frac : dayEarn
    }
    return { name: BOT_NAMES[lang][nameIdx], emoji: BOT_EMOJIS[nameIdx], points: Math.floor(pts) }
  })
}

/** 이번 주(또는 특정 주)의 내 적립 합계 — 양수 원장만 */
export function myWeekPoints(ledger: LedgerEntry[], weekKey = weekKeyOf()): number {
  const start = weekStartMs(weekKey)
  const end = start + 7 * 86400000
  return ledger.reduce((a, e) => (e.amount > 0 && e.at >= start && e.at < end ? a + e.amount : a), 0)
}

/** 1위=1. 동점이면 내가 위 */
export function myRank(my: number, bots: Bot[]): number {
  return 1 + bots.filter((b) => b.points > my).length
}
