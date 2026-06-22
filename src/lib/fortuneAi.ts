import { FUNCTIONS_URL, ANON_KEY } from './supabase'

/** AI 상세 운세 — 현지화 완료된 평문 문자열(결정론 L[]과 달리 단일 언어). */
export interface FortuneDetailText {
  morning: string
  noon: string
  evening: string
  luckyTime: string
  place: string
  item: string
  food: string
  caution: string
  advice: string
  relation: string
  work: string
  wealth: string
  health: string
  summary: string
}

const KEYS: (keyof FortuneDetailText)[] = [
  'morning', 'noon', 'evening', 'luckyTime', 'place', 'item', 'food', 'caution', 'advice', 'relation', 'work', 'wealth', 'health', 'summary',
]

export interface FortuneAiPayload {
  ilju: string
  element: string
  zodiac: string
  luckyDir: string
  luckyTime: string
  lang: string
  date: string
}

/**
 * 오늘의 상세 운세 AI 개인화 호출. Edge Function 미배포/실패/검증실패 시 null → 호출부가 결정론 템플릿으로 폴백.
 * 키는 엣지에만 있고, 클라는 anon 키로 함수만 호출한다.
 */
export async function fetchFortuneDetailAi(p: FortuneAiPayload): Promise<FortuneDetailText | null> {
  if (!FUNCTIONS_URL) return null
  try {
    const r = await fetch(`${FUNCTIONS_URL}/fortune-detail`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
      body: JSON.stringify(p),
    })
    if (!r.ok) return null
    const data = await r.json()
    const d = data?.detail
    if (!d || KEYS.some((k) => typeof d[k] !== 'string' || !d[k].trim())) return null
    // 검증된 키만 추려 안전하게 반환
    const out = {} as FortuneDetailText
    for (const k of KEYS) out[k] = String(d[k])
    return out
  } catch {
    return null
  }
}
