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
  /** 사주팔자 — 예: '갑진년 병인월 갑진일 갑자시'(시각 모르면 시주 생략) */
  pillars?: string
  /** 'm' | 'f' | '' */
  gender?: string
  /** 만 나이 */
  age?: number
  /** 일간 강약: strong | balanced | weak */
  strength?: string
  /** 도움 되는 오행(억부) — 예: '수,목' */
  favorable?: string
  /** 오늘 일진의 십신(내 일간 기준) — 예: '정재' */
  todayTenGod?: string
  /** 오늘 일진 — 예: '임술' */
  todayIlju?: string
  // 이름은 보내지 않는다 — 풀이에 필요 없고, 가족·친구 이름을 외부 LLM에 넘길 이유가 없다
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
