/**
 * Supabase Edge Function — AI 정밀 분석 리포트 생성.
 *
 * 키는 서버(엣지)에만: 클라이언트에 노출되지 않습니다.
 * 제공자·모델 선택은 ./llm.ts — ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY 중 설정된 쪽을 자동 사용.
 * 키 미설정 시 클라이언트가 기존 정적 리포트로 폴백하므로 앱은 그대로 동작합니다.
 */
import { callLlm } from './llm.ts'

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

    const r = await callLlm(system, user, {
      // ⚠️ 생각 토큰이 이 예산에서 나간다 — 250단어 글에 800을 주면 생각하다 본문이 잘린다
      maxTokens: 4000,
      // 짧은 단일 검사 해설이라 낮은 추론 강도로 충분 — 지연·비용을 줄인다
      effort: 'low',
    })
    if (!r.ok || !r.text) return json({ error: r.error ?? 'empty', detail: r.detail, provider: r.provider, model: r.model }, r.error === 'no_key' ? 500 : 502)
    return json({ text: r.text, provider: r.provider, model: r.model })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
