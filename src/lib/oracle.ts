/**
 * 재미 운세(별자리·타로·꿈해몽)의 결정론 도구.
 *
 * 같은 키 → 같은 결과. 키에 날짜(localDay)를 넣으면 '오늘 하루는 같은 결과, 자정에 바뀜'이 된다.
 * 서버·난수 상태 없이 기기 안에서만 계산한다(새로고침·재방문해도 같은 카드/문구).
 */
import { mulberry32 } from './random'
import { localDay } from './date'
import { STAR_SIGNS, STAR_TODAY, STAR_WEEK, LUCKY_COLORS, ELEMENT_MATCH, type StarSign } from '../data/star'
import { TAROT } from '../data/tarot'
import { DREAMS, type DreamEntry } from '../data/dream'

/** 문자열 → 32비트 해시(FNV-1a). 짧은 키에서도 비트가 고르게 섞인다 */
export function hash32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** 키로 시드된 난수열 */
export const rngOf = (key: string) => mulberry32(hash32(key))

/** 이번 주 월요일 YYYY-MM-DD(로컬) — 주간 문구의 키 */
export function weekKey(): string {
  const now = new Date()
  const back = (now.getDay() + 6) % 7
  const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${mon.getFullYear()}-${p(mon.getMonth() + 1)}-${p(mon.getDate())}`
}

/* ── 별자리 ── */

/** 'YYYY-MM-DD' 생일 → 별자리(열대 황도 기준 날짜 경계). 형식이 틀리면 null */
export function signOfBirth(birth: string): StarSign | null {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(birth)
  if (!m) return null
  const md = Number(m[1]) * 100 + Number(m[2])
  // 시작일(MMDD)이 md 이하인 것 중 가장 늦은 별자리. 1/1~1/19는 전년 12/22에 시작한 염소자리
  const byStart = [...STAR_SIGNS].sort((a, b) => b.from - a.from)
  return byStart.find((s) => s.from <= md) ?? byStart[0]
}

export function starReading(sign: StarSign, day = localDay()) {
  const r = rngOf(`star:${sign.id}:${day}`)
  const wk = rngOf(`starw:${sign.id}:${weekKey()}`)
  const mates = STAR_SIGNS.filter((s) => s.id !== sign.id && ELEMENT_MATCH[sign.element].includes(s.element))
  return {
    today: STAR_TODAY[Math.floor(r() * STAR_TODAY.length)],
    week: STAR_WEEK[Math.floor(wk() * STAR_WEEK.length)],
    color: LUCKY_COLORS[Math.floor(r() * LUCKY_COLORS.length)],
    number: 1 + Math.floor(r() * 45),
    mate: mates[Math.floor(r() * mates.length)],
  }
}

/* ── 타로 ── */

/**
 * 오늘의 한 장 — (기기, 날짜)로 고정. 같은 기기면 하루 종일 같은 카드·같은 방향.
 * ponytail: 기기 단위라 로그인해 다른 기기로 보면 카드가 다르다 — 계정 단위가 필요하면 키를 userId로.
 */
export function tarotOfDay(deviceId: string, day = localDay()) {
  const r = rngOf(`tarot:${deviceId}:${day}`)
  const card = TAROT[Math.floor(r() * TAROT.length)]
  // 역방향은 1/3 — 오락 콘텐츠라 하루 기분이 너무 자주 가라앉지 않게
  const reversed = r() < 1 / 3
  return { card, reversed }
}

/* ── 꿈 해몽 ── */

const LATIN = /^[a-z][a-z\s'-]*$/
const squash = (s: string) => s.toLowerCase().replace(/\s+/g, '')
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** 자유 문장에서 사전 키워드를 여러 개 찾는다(언어 무관 — 한국어 문장에 'snake'가 섞여도 잡힌다) */
export function matchDreams(text: string): DreamEntry[] {
  const lower = text.toLowerCase()
  if (!lower.trim()) return []
  const hits: DreamEntry[] = []
  for (const d of DREAMS) {
    // '동물'의 '물', '불안'의 '불'처럼 다른 낱말 속 글자를 먼저 지운다
    let body = lower
    for (const x of d.ex ?? []) body = body.split(x.toLowerCase()).join(' ')
    const flat = squash(body)
    // 제목('불 꿈'·'Fire')도 찾는 말에 넣는다 — 인기 칩을 누르면 제목이 입력되기 때문
    const found = [...d.words.ko, ...d.words.en, ...d.words.ja, d.title.ko, d.title.en, d.title.ja].some((w) => {
      const lw = w.toLowerCase()
      return LATIN.test(lw) ? new RegExp(`\\b${escapeRe(lw)}\\b`).test(body) : flat.includes(squash(lw))
    })
    if (found) hits.push(d)
  }
  return hits
}

// 개발 중 자기 점검 — 경계일·오탐 방지가 깨지면 콘솔에 바로 보인다(프로덕션 번들에서는 제거)
if (import.meta.env.DEV) {
  const s = (b: string) => signOfBirth(b)?.id
  console.assert(s('2000-01-19') === 'capricorn' && s('2000-01-20') === 'aquarius', 'star boundary jan')
  console.assert(s('2000-12-22') === 'capricorn' && s('2000-12-21') === 'sagittarius', 'star boundary dec')
  console.assert(s('2000-03-21') === 'aries' && s('2000-08-23') === 'virgo', 'star boundary mid')
  const ids = (t: string) => matchDreams(t).map((d) => d.id)
  console.assert(!ids('동물원에서 불안했던 꿈').includes('water') && !ids('동물원에서 불안했던 꿈').includes('fire'), 'dream ex')
  console.assert(ids('뱀이 집에 들어오는 꿈').includes('snake'), 'dream ko')
  console.assert(ids('I dreamed my teeth fell out').includes('teeth'), 'dream en')
  const a = tarotOfDay('dev_x', '2026-01-01')
  const b = tarotOfDay('dev_x', '2026-01-01')
  console.assert(a.card.id === b.card.id && a.reversed === b.reversed, 'tarot deterministic')
}
