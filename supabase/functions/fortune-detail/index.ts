/**
 * Supabase Edge Function — 오늘의 '상세 운세' AI 개인화.
 *
 * 키는 서버(엣지)에만: 클라이언트에 노출되지 않습니다.
 * 제공자·모델 선택은 ./llm.ts — ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY 중 설정된 쪽을 자동 사용.
 * 결과는 클라가 (생일+날짜) 기준 하루 1회만 호출·캐싱하고, 실패 시 결정론 템플릿으로 자동 폴백.
 *
 * ⚠️ 셋 중 호출량이 가장 많은 함수다 — 무료 티어(Gemini)나 저가 모델을 쓰고 싶다면 여기부터.
 *    GEMINI_MODEL / AI_MODEL 시크릿으로 이 함수만 따로 지정할 수는 없으니(공용 어댑터),
 *    비용이 문제라면 전체를 Gemini로 돌리는 편이 단순하다.
 */
import { callLlm, parseJson, withinQuota } from './llm.ts'

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'content-type': 'application/json' } })
}

const KEYS = ['morning', 'noon', 'evening', 'luckyTime', 'place', 'item', 'food', 'caution', 'advice', 'relation', 'work', 'wealth', 'health', 'summary']

// @ts-ignore Deno 런타임 전역
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  try {
    // 남용 차단 — anon 키가 번들에 있어 누구나 호출할 수 있다. 한 주체가 하루 할당량을
    // 독점하면 정상 사용자 전원이 그날 기능을 못 쓴다(운세는 하루 1회 캐시 — 언어 전환·재시도 여유까지 10회).
    if (!(await withinQuota(req, 'fortune-detail', 10))) return json({ error: 'quota' }, 429)
    const b = await req.json()
    const lang: string = b.lang ?? 'ko'
    const langName = lang === 'en' ? 'English' : lang === 'ja' ? 'Japanese' : 'Korean'

    const system =
      `You write a warm, playful Korean-style "today's fortune" (오늘의 운세) detail in ${langName}. ` +
      `Output STRICT JSON only (no markdown, no code fences) with EXACTLY these keys: ${KEYS.join(', ')}. ` +
      `Each value is a single natural sentence, EXCEPT: place/item/food are short noun phrases, luckyTime is a short time range, ` +
      `summary ends by stating a keyword in quotes. It is "just for fun" (재미로 보는 운세) — positive, specific, actionable. ` +
      `No fortune-telling certainty, no medical/financial advice, no scary predictions.`
    const user =
      `Person — day pillar(일주): ${b.ilju}, element(오행): ${b.element}, zodiac(띠): ${b.zodiac}. ` +
      `Today's lucky direction: ${b.luckyDir}. Lucky time hint: ${b.luckyTime}. Date: ${b.date}. ` +
      `Write this person's personalized detailed fortune for today as the JSON object.`

    const r = await callLlm(system, user, { maxTokens: 4000, json: true, effort: 'low' })
    if (!r.ok || !r.text) return json({ error: r.error ?? 'empty', detail: r.detail, provider: r.provider, model: r.model }, r.error === 'no_key' ? 500 : 502)

    const detail = parseJson<Record<string, unknown>>(r.text)
    if (!detail) return json({ error: 'parse', provider: r.provider, model: r.model }, 502)
    if (KEYS.some((k) => typeof detail[k] !== 'string' || !(detail[k] as string).trim())) {
      return json({ error: 'shape', provider: r.provider, model: r.model }, 502)
    }
    return json({ detail, provider: r.provider, model: r.model })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
