/**
 * Supabase Edge Function — AI 종합 심층 리포트 (프리미엄 전용).
 *
 * 개별 검사 리포트(ai-report)와 다른 점: 검사 하나를 해석하는 게 아니라
 * **전 검사를 가로질러 "한 사람"으로 통합**한다. 이것이 프리미엄의 유일한 가치.
 *
 * 키는 서버(엣지)에만 — 클라이언트에 ANTHROPIC_API_KEY가 절대 노출되지 않습니다.
 * 배포: MCP deploy_edge_function 또는 supabase functions deploy deep-report
 * 시크릿: ANTHROPIC_API_KEY (선택: AI_MODEL)
 * 미배포/키 없음 → 클라가 정적 폴백(페르소나 조합)으로 동작하므로 앱은 그대로.
 *
 * ⚠️ 프리미엄 판정은 현재 클라이언트 attested(구독 상태를 클라가 보냄).
 *    서버측 검증(profiles.premium_until 조회)은 하드닝 항목 — PG 연동 시 함께 적용.
 */
const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'content-type': 'application/json' } })
}

/** 리포트 섹션 키 — 클라 렌더 순서·아이콘과 1:1 대응(고정) */
const SECTION_KEYS = [
  'core',       // 핵심 성격 요약 (비프리미엄 티저로 노출되는 유일 섹션)
  'strengths',  // 타고난 강점
  'shadow',     // 그림자·취약 지점
  'relations',  // 관계 속의 나
  'work',       // 일·성취 스타일
  'stress',     // 스트레스·회복
  'cognition',  // 인지 프로필 (정밀검사 완료 시에만)
  'roadmap',    // 90일 성장 로드맵
] as const

interface TestSummary {
  name: string
  band: string
  topPercent: number
  persona: string
  strengths: string[]
  risks: string[]
  axes?: Record<string, number>
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
    const tests: TestSummary[] = Array.isArray(b.tests) ? b.tests.slice(0, 20) : []
    if (tests.length < 3) return json({ error: 'not_enough_tests' }, 400)

    const nickname: string = String(b.nickname ?? '').slice(0, 20)
    const cog: Record<string, number> | null = b.cognition ?? null
    const hasCog = !!cog && Object.keys(cog).length > 0
    const keys = SECTION_KEYS.filter((k) => k !== 'cognition' || hasCog)

    const system =
      `You are a warm but honest psychology coach writing an integrated personal report in ${langName}. ` +
      `The reader completed MANY self-tests. Your ONE job: find the threads that run ACROSS tests and describe them as one whole person — ` +
      `never a test-by-test recap. Cite their actual numbers/bands as evidence when it helps. ` +
      `Rules: no medical diagnosis, no medication advice; describe tendencies, not fixed labels; ` +
      `warm and specific, never generic horoscope language; every section ends with one concrete, doable action. ` +
      `Output STRICT JSON only: {"sections":[{"key":"...","title":"...","body":"..."}]} with keys exactly [${keys.join(', ')}] in that order. ` +
      `title: short ${langName} heading. body: 2-3 paragraphs, plain text (no markdown). Total ~1800 characters across all sections.`

    const lines = tests
      .map(
        (t) =>
          `- ${t.name}: band=${t.band}, top ${t.topPercent}%, persona=${t.persona}` +
          (t.axes ? `, axes=${JSON.stringify(t.axes)}` : '') +
          (t.strengths?.length ? `, strengths=[${t.strengths.slice(0, 2).join(' / ')}]` : '') +
          (t.risks?.length ? `, watch=[${t.risks.slice(0, 2).join(' / ')}]` : ''),
      )
      .join('\n')

    const user =
      (nickname ? `Reader nickname: ${nickname}\n` : '') +
      `Completed tests (${tests.length}):\n${lines}\n` +
      (hasCog ? `Cognitive indices (100=avg, SD15): ${JSON.stringify(cog)}\n` : '') +
      `\nWrite the integrated report now. Remember: cross-test threads, not a per-test list.`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 4000, system, messages: [{ role: 'user', content: user }] }),
    })
    if (!resp.ok) return json({ error: 'upstream', status: resp.status }, 502)
    const data = await resp.json()
    const text = (data.content ?? []).map((c: { text?: string }) => c.text ?? '').join('').trim()
    if (!text) return json({ error: 'empty' }, 502)

    // 모델이 코드펜스를 붙이는 경우까지 방어적으로 파싱
    const raw = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    let parsed: { sections?: { key?: string; title?: string; body?: string }[] }
    try {
      parsed = JSON.parse(raw)
    } catch {
      const a = raw.indexOf('{')
      const z = raw.lastIndexOf('}')
      if (a < 0 || z <= a) return json({ error: 'parse' }, 502)
      parsed = JSON.parse(raw.slice(a, z + 1))
    }
    const sections = (parsed.sections ?? [])
      .filter((s) => s && typeof s.body === 'string' && s.body.trim().length > 0)
      .map((s) => ({ key: String(s.key ?? ''), title: String(s.title ?? ''), body: String(s.body) }))
    if (sections.length < 3) return json({ error: 'thin' }, 502)

    return json({ sections, at: Date.now() })
  } catch (e) {
    return json({ error: 'server', detail: String(e).slice(0, 200) }, 500)
  }
})
