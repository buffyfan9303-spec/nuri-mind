/**
 * Supabase Edge Function — AI 정밀 분석 리포트 생성 (Claude).
 *
 * 키는 서버(엣지)에만: 클라이언트에 ANTHROPIC_API_KEY가 절대 노출되지 않습니다.
 *
 * 배포(유저 1회 작업):
 *   1) Supabase 대시보드 > Edge Functions, 또는 CLI:
 *        supabase functions deploy ai-report --project-ref xdcglyavndiwbbaryocx
 *   2) 시크릿 설정:
 *        supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   (선택: AI_MODEL — 미지정 시 claude-opus-5)
 *   배포 전엔 클라이언트가 자동으로 기존 정적 리포트로 폴백하므로 앱은 그대로 동작합니다.
 */
const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'content-type': 'application/json' } })
}

// @ts-ignore Deno 런타임 전역
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  try {
    // @ts-ignore Deno
    const key = Deno.env.get('ANTHROPIC_API_KEY')
    if (!key) return json({ error: 'no_key' }, 500)
    // @ts-ignore Deno
    const model = Deno.env.get('AI_MODEL') ?? 'claude-opus-5'

    const b = await req.json()
    const lang: string = b.lang ?? 'ko'
    const langName = lang === 'en' ? 'English' : lang === 'ja' ? 'Japanese' : 'Korean'
    const join = (a: unknown): string => (Array.isArray(a) ? a.filter(Boolean).join(', ') : '')

    const system =
      `You are a warm but honest psychology coach. Write a 3-paragraph integrated interpretation in ${langName} based on a self-test result. ` +
      `No medical diagnosis or medication advice. Express tendencies, not fixed labels. Include empathy and ONE concrete small action. Keep it ~250 words.`
    const user =
      `Test: ${b.testName}\nBand: ${b.band} (top ${b.topPercent}%)\nPersona: ${b.persona}\n` +
      `Strengths: ${join(b.strengths)}\nWatch-outs: ${join(b.risks)}\nHelps: ${join(b.solutions)}\n\n` +
      `Write the warm, integrated 3-paragraph interpretation for this person.`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model,
        // ⚠️ Opus 5는 thinking이 기본 ON이고 그 토큰도 max_tokens에서 나간다.
        //    250단어짜리 글에 800을 주면 생각하다 예산을 다 써 본문이 잘린다(= 앱은 정적 폴백으로 착지).
        max_tokens: 4000,
        // 짧은 단일 검사 해설이라 낮은 추론 강도로 충분 — 지연·비용을 줄인다
        output_config: { effort: 'low' },
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!resp.ok) {
      // 상류 오류 메시지를 그대로 넘긴다 — 키 오타·크레딧 소진·모델명 오류를 구분하려면 이게 필요하다.
      // (응답 본문에 API 키가 들어가지 않는다 — 상류는 키를 에코하지 않는다.)
      const why = await resp.text().catch(() => '')
      return json({ error: 'upstream', status: resp.status, detail: why.slice(0, 300) }, 502)
    }
    const data = await resp.json()
    // 안전 차단은 200으로 온다 — content를 읽기 전에 stop_reason을 먼저 본다
    if (data.stop_reason === 'refusal') return json({ error: 'refusal' }, 502)
    const text = (data.content ?? [])
      .filter((c: { type?: string }) => c.type === 'text')
      .map((c: { text?: string }) => c.text ?? '')
      .join('')
      .trim()
    if (!text) return json({ error: 'empty' }, 502)
    if (data.stop_reason === 'max_tokens') return json({ error: 'truncated' }, 502)
    return json({ text })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
