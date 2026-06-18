/**
 * 커뮤니티 1차 방어 (클라이언트) — 금칙어 필터 + 작성 rate limit.
 * 서버 2차 방어(rate limit RPC·신고 자동숨김)는 supabase/schema.sql 참고.
 */

// 기본 금칙어(정규화 후 부분일치). 운영하며 보강 권장.
const BANNED = [
  '시발', '씨발', '시바', '씨바', '병신', '븅신', '개새', '개색', '새끼', '쌍놈', '좆', '존나', '졸라',
  '지랄', '니애미', '느금', '엠창', '창녀', '걸레', '꺼져', '닥쳐', '강간', '섹스', '야동', '도박',
  'fuck', 'shit', 'bitch', 'asshole', 'porn',
]

/** 공백·반복·특수문자 제거 후 소문자화 (우회 차단) */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s​._\-*~^]/g, '')
    .replace(/(.)\1{2,}/g, '$1$1')
}

export function hasProfanity(text: string): boolean {
  const n = normalize(text)
  return BANNED.some((w) => n.includes(w))
}

/* ── 강화 필터 (전광판/게시물): 19금·성인 · 외부유도/연락처 · 도박/스팸 ── */
const ADULT = [
  '섹스', '야동', '자위', '음란', '19금', '성인물', '조건만남', '애무', '폰섹', '야사',
  '노모', '몰카', '불법촬영', '성매매', '원나잇', 'sex', 'porn', 'nude', 'xxx', 'av',
]
const CONTACT = [
  '오픈카톡', '오픈채팅', '카톡아이디', '카톡id', '텔레그램', '텔레', '라인아이디', 'wechat', '디엠주세요', '디엠줘',
]
const SPAM = [
  '토토', '카지노', '바카라', '베팅', '코인리딩', '리딩방', '작업대출', '릴게임', '슬롯머신', '환전',
  '먹튀', '꽁머니', '배당', '하이로우',
]

export type ModReason = 'profanity' | 'adult' | 'contact' | 'spam'

/**
 * 통합 콘텐츠 모더레이션 (클라이언트 휴리스틱 "AI 필터" 1차).
 * 욕설·19금/성인·외부유도(연락처)·도박/스팸을 정규화 후 부분일치 + 전화번호 패턴으로 차단.
 * 서버 2차(LLM 모더레이션 Edge Function)로 확장 가능 — 여기선 즉시·무료·오프라인 가능한 1차 방어.
 */
export function moderateText(text: string): { ok: boolean; reason?: ModReason } {
  const n = normalize(text)
  if (BANNED.some((w) => n.includes(w))) return { ok: false, reason: 'profanity' }
  if (ADULT.some((w) => n.includes(w))) return { ok: false, reason: 'adult' }
  if (CONTACT.some((w) => n.includes(w)) || /01[016789]\d{7,8}/.test(n)) return { ok: false, reason: 'contact' }
  if (SPAM.some((w) => n.includes(w))) return { ok: false, reason: 'spam' }
  return { ok: true }
}

/** 표시용 마스킹 (서버 글에도 적용 가능) */
export function maskProfanity(text: string): string {
  let out = text
  for (const w of BANNED) {
    if (!w) continue
    const re = new RegExp(w.split('').join('[\\s._\\-*~^]*'), 'gi')
    out = out.replace(re, (m) => m[0] + '*'.repeat(Math.max(1, m.replace(/\s/g, '').length - 1)))
  }
  return out
}

// ── 작성 rate limit (기기 로컬) ──
const LIMITS = { post: { max: 5, windowMs: 60_000 }, comment: { max: 10, windowMs: 60_000 } }
const RL_KEY = 'nuri-action-times'

type Kind = keyof typeof LIMITS

function load(): Record<string, number[]> {
  try {
    return JSON.parse(localStorage.getItem(RL_KEY) || '{}')
  } catch {
    return {}
  }
}

/** 허용 여부 + 다음 허용까지 남은 초 */
export function checkRate(kind: Kind): { ok: boolean; waitSec: number } {
  const { max, windowMs } = LIMITS[kind]
  const now = Date.now()
  const all = load()
  const recent = (all[kind] || []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    const waitSec = Math.ceil((windowMs - (now - recent[0])) / 1000)
    return { ok: false, waitSec: Math.max(1, waitSec) }
  }
  return { ok: true, waitSec: 0 }
}

export function recordAction(kind: Kind): void {
  const now = Date.now()
  const all = load()
  all[kind] = [...(all[kind] || []).filter((t) => now - t < LIMITS[kind].windowMs), now]
  try {
    localStorage.setItem(RL_KEY, JSON.stringify(all))
  } catch {
    /* noop */
  }
}
