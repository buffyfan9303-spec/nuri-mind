/**
 * Supabase Edge Function — 오늘의 '상세 운세' AI 개인화 (Claude haiku).
 *
 * 키는 서버(엣지)에만: 클라이언트에 ANTHROPIC_API_KEY가 절대 노출되지 않습니다.
 * 결과는 클라가 (생일+날짜) 기준 하루 1회만 호출·캐싱하고, 미배포/실패 시 결정론 템플릿으로 자동 폴백.
 *
 * 배포(유저 1회 작업):
 *   1) supabase functions deploy fortune-detail --project-ref xdcglyavndiwbbaryocx
 *   2) supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   (선택: FORTUNE_MODEL=claude-haiku-4-5-20251001)
 *   배포 전엔 앱이 기존 12종 템플릿(결정론)으로 그대로 동작합니다.
 */
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
    // @ts-ignore Deno
    const key = Deno.env.get('ANTHROPIC_API_KEY')
    if (!key) return json({ error: 'no_key' }, 500)
    // @ts-ignore Deno
    const model = Deno.env.get('FORTUNE_MODEL') ?? 'claude-haiku-4-5-20251001'

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

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 900, system, messages: [{ role: 'user', content: user }] }),
    })
    if (!resp.ok) return json({ error: 'upstream', status: resp.status }, 502)
    const data = await resp.json()
    const text = (data.content ?? []).map((c: { text?: string }) => c.text ?? '').join('').trim()

    let detail: Record<string, unknown>
    try {
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
      detail = JSON.parse(cleaned)
    } catch {
      return json({ error: 'parse' }, 502)
    }
    if (!detail || KEYS.some((k) => typeof detail[k] !== 'string' || !(detail[k] as string).trim())) {
      return json({ error: 'shape' }, 502)
    }
    return json({ detail })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
