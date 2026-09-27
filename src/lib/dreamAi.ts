import { FUNCTIONS_URL, ANON_KEY } from './supabase'
import { hash32 } from './oracle'

/**
 * AI 꿈 해몽(회원 전용) — Edge Function `dream-reading` 호출.
 * 꿈 내용과 매칭된 키워드 제목만 보낸다(이름·생일 등은 보내지 않는다). 키는 엣지에만 있다.
 * 같은 (꿈 문장, 언어)는 메모리+sessionStorage 캐시로 재호출하지 않는다(하루 5회 한도 보호).
 */
export interface DreamReading {
  title: string
  summary: string
  symbols: { symbol: string; meaning: string }[]
  feeling: string
  advice: string
}

export type DreamAiResult = { ok: true; reading: DreamReading } | { ok: false; reason: 'quota' | 'error' }

export const DREAM_AI_MAX = 400

const mem = new Map<string, DreamReading>()
const keyOf = (dream: string, lang: string) => `nuri-dream-ai:${lang}:${hash32(dream.trim())}`

const str = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

/** 응답 모양 방어 검증 — 하나라도 어긋나면 null(호출부는 사전 결과만 보여 준다) */
export function parseReading(raw: unknown): DreamReading | null {
  const r = (raw as { reading?: Record<string, unknown> } | null)?.reading
  if (!r || !str(r.title) || !str(r.summary) || !str(r.feeling) || !str(r.advice) || !Array.isArray(r.symbols)) return null
  const symbols = r.symbols
    .filter((s): s is { symbol: string; meaning: string } => !!s && str((s as { symbol?: unknown }).symbol) && str((s as { meaning?: unknown }).meaning))
    .slice(0, 4)
    .map((s) => ({ symbol: String(s.symbol), meaning: String(s.meaning) }))
  if (symbols.length === 0) return null
  return { title: String(r.title), summary: String(r.summary), symbols, feeling: String(r.feeling), advice: String(r.advice) }
}

export function cachedDreamReading(dream: string, lang: string): DreamReading | null {
  const k = keyOf(dream, lang)
  const hit = mem.get(k)
  if (hit) return hit
  try {
    const raw = sessionStorage.getItem(k)
    const parsed = raw ? parseReading({ reading: JSON.parse(raw) }) : null
    if (parsed) mem.set(k, parsed)
    return parsed
  } catch {
    return null
  }
}

export async function fetchDreamReading(dream: string, keywords: string[], lang: 'ko' | 'en' | 'ja'): Promise<DreamAiResult> {
  const text = dream.trim().slice(0, DREAM_AI_MAX)
  const cached = cachedDreamReading(text, lang)
  if (cached) return { ok: true, reading: cached }
  if (!FUNCTIONS_URL) return { ok: false, reason: 'error' }
  try {
    const r = await fetch(`${FUNCTIONS_URL}/dream-reading`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
      body: JSON.stringify({ dream: text, keywords: keywords.slice(0, 8), lang }),
    })
    if (r.status === 429) return { ok: false, reason: 'quota' }
    if (!r.ok) return { ok: false, reason: 'error' }
    const reading = parseReading(await r.json())
    if (!reading) return { ok: false, reason: 'error' }
    const k = keyOf(text, lang)
    mem.set(k, reading)
    try {
      sessionStorage.setItem(k, JSON.stringify(reading))
    } catch {
      /* 메모리 캐시만으로도 이번 방문엔 충분 */
    }
    return { ok: true, reading }
  } catch {
    return { ok: false, reason: 'error' }
  }
}
