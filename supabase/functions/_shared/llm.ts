/**
 * LLM 제공자 어댑터 — Anthropic Claude / Google Gemini 중 설정된 쪽으로 호출한다.
 *
 * 왜 필요한가: 세 엣지 함수(deep-report·ai-report·fortune-detail)가 각자 fetch를 직접 짜고 있어서
 * 제공자를 바꾸려면 세 군데를 고쳐야 했다. 무료 티어(Gemini)로 운영하다가 품질이 필요할 때
 * Anthropic으로 되돌리는 전환이 시크릿 하나로 끝나야 한다.
 *
 * 시크릿(둘 중 하나만 있어도 동작):
 *   ANTHROPIC_API_KEY          → Claude 사용 (모델: AI_MODEL, 기본 claude-opus-5)
 *   GOOGLE_API_KEY 또는 GEMINI_API_KEY → Gemini 사용 (모델: GEMINI_MODEL, 기본 gemini-3.7-flash)
 *   LLM_PROVIDER=anthropic|google      → 둘 다 넣었을 때 강제 지정(미지정 시 Anthropic 우선)
 *
 * ⚠️ 이 파일은 supabase/functions/_shared/llm.ts 가 원본이다.
 *    각 함수 폴더의 llm.ts는 `npm run sync:fn` 이 만드는 사본 — 직접 고치지 말 것(스모크가 동일성을 검사한다).
 */

export type Provider = 'anthropic' | 'google'

export interface LlmOptions {
  /**
   * 출력 토큰 예산.
   * ⚠️ 두 제공자 모두 '생각(thinking)' 토큰이 이 예산에서 나간다 — Claude Opus 5는 thinking이 기본 ON,
   *    Gemini 3.x flash도 내부 추론을 쓴다. 원하는 본문 길이의 3~5배를 주지 않으면 조용히 잘린다.
   */
  maxTokens: number
  /** 응답을 JSON으로만 받고 싶을 때. Gemini는 responseMimeType으로 강제, Claude는 프롬프트 규약에 의존. */
  json?: boolean
  /** Anthropic 전용 추론 강도(Gemini에는 대응 파라미터가 없어 무시된다) */
  effort?: 'low' | 'medium' | 'high'
}

export interface LlmResult {
  ok: boolean
  text?: string
  /** no_key | upstream | truncated | refusal | empty — 원인마다 대응이 달라 뭉뚱그리지 않는다 */
  error?: string
  detail?: string
  provider?: Provider
  model?: string
}

function env(k: string): string {
  // @ts-ignore Deno 런타임 전역
  return (Deno.env.get(k) ?? '').trim()
}

/** 설정된 시크릿으로 제공자를 결정한다. 아무 키도 없으면 null. */
export function resolveProvider(): { provider: Provider; key: string; model: string } | null {
  const googleKey = env('GOOGLE_API_KEY') || env('GEMINI_API_KEY')
  const anthropicKey = env('ANTHROPIC_API_KEY')
  const forced = env('LLM_PROVIDER').toLowerCase()

  const wantGoogle = forced === 'google' || forced === 'gemini'
  const wantAnthropic = forced === 'anthropic' || forced === 'claude'

  if (wantGoogle && googleKey) return { provider: 'google', key: googleKey, model: env('GEMINI_MODEL') || 'gemini-3.7-flash' }
  if (wantAnthropic && anthropicKey) return { provider: 'anthropic', key: anthropicKey, model: env('AI_MODEL') || 'claude-opus-5' }
  // 명시 지정이 없으면: 둘 다 있을 때 Anthropic 우선(품질 기본값). 진단 화면이 실제 선택을 보여준다.
  if (anthropicKey) return { provider: 'anthropic', key: anthropicKey, model: env('AI_MODEL') || 'claude-opus-5' }
  if (googleKey) return { provider: 'google', key: googleKey, model: env('GEMINI_MODEL') || 'gemini-3.7-flash' }
  return null
}

async function callAnthropic(
  key: string,
  model: string,
  system: string,
  user: string,
  opt: LlmOptions,
): Promise<LlmResult> {
  const base = { provider: 'anthropic' as const, model }
  const body: Record<string, unknown> = {
    model,
    max_tokens: opt.maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  }
  // effort는 Claude 4.6+ 계열에만 있다. Haiku 4.5 등 구형 모델에 보내면 요청 자체가 거부되므로
  // 모델명으로 걸러 낸다("절대 넣지 말 것"을 주석이 아니라 코드로 강제).
  if (opt.effort && !/haiku|claude-3|sonnet-4-5/.test(model)) body.output_config = { effort: opt.effort }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    // 상류 오류 본문을 그대로 넘긴다 — 키 오타/크레딧 소진/모델명 오류를 구분할 유일한 단서.
    // (상류는 API 키를 에코하지 않으므로 이 본문에 키가 들어가지 않는다.)
    const why = await resp.text().catch(() => '')
    return { ...base, ok: false, error: 'upstream', detail: `${resp.status}: ${why.slice(0, 300)}` }
  }
  const data = await resp.json()
  // 안전 차단은 HTTP 200으로 온다 — content를 읽기 전에 stop_reason부터 본다
  if (data.stop_reason === 'refusal') return { ...base, ok: false, error: 'refusal' }
  // thinking 블록이 섞여 오므로 text 블록만 취한다(합치면 JSON 앞에 요약문이 붙어 파싱이 깨진다)
  const text = (data.content ?? [])
    .filter((c: { type?: string }) => c.type === 'text')
    .map((c: { text?: string }) => c.text ?? '')
    .join('')
    .trim()
  if (!text) return { ...base, ok: false, error: 'empty' }
  if (data.stop_reason === 'max_tokens') return { ...base, ok: false, error: 'truncated' }
  return { ...base, ok: true, text }
}

async function callGoogle(
  key: string,
  model: string,
  system: string,
  user: string,
  opt: LlmOptions,
): Promise<LlmResult> {
  const base = { provider: 'google' as const, model }
  const generationConfig: Record<string, unknown> = { maxOutputTokens: opt.maxTokens }
  // Gemini는 JSON 출력을 형식 수준에서 강제할 수 있다 — 코드펜스 방어 파싱이 아예 필요 없어진다
  if (opt.json) generationConfig.responseMimeType = 'application/json'

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    // 키는 헤더로 — ?key= 쿼리 파라미터는 접근 로그·리퍼러에 그대로 남는다
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig,
    }),
  })
  if (!resp.ok) {
    const why = await resp.text().catch(() => '')
    return { ...base, ok: false, error: 'upstream', detail: `${resp.status}: ${why.slice(0, 300)}` }
  }
  const data = await resp.json()
  // 프롬프트 단계 차단은 candidates 자체가 비어서 온다 — 아래 'empty'와 구분해 사유를 남긴다
  const blocked = data.promptFeedback?.blockReason
  if (blocked) return { ...base, ok: false, error: 'refusal', detail: `promptFeedback=${blocked}` }

  const cand = (data.candidates ?? [])[0]
  const finish = cand?.finishReason
  if (finish && ['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'RECITATION'].includes(finish)) {
    return { ...base, ok: false, error: 'refusal', detail: `finishReason=${finish}` }
  }
  const text = ((cand?.content?.parts ?? []) as { text?: string }[])
    .map((p) => p.text ?? '')
    .join('')
    .trim()
  if (!text) return { ...base, ok: false, error: 'empty', detail: finish ? `finishReason=${finish}` : undefined }
  // MAX_TOKENS는 본문이 일부 있어도 잘린 것 — parse 실패로 뭉뚱그리면 원인 추적이 불가능해진다
  if (finish === 'MAX_TOKENS') return { ...base, ok: false, error: 'truncated' }
  return { ...base, ok: true, text }
}

/** 설정된 제공자로 1회 호출. 실패 사유는 error 코드로 구조화해 돌려준다. */
export async function callLlm(system: string, user: string, opt: LlmOptions): Promise<LlmResult> {
  const r = resolveProvider()
  if (!r) return { ok: false, error: 'no_key' }
  try {
    return r.provider === 'google'
      ? await callGoogle(r.key, r.model, system, user, opt)
      : await callAnthropic(r.key, r.model, system, user, opt)
  } catch (e) {
    return { ok: false, error: 'network', detail: String(e).slice(0, 200), provider: r.provider, model: r.model }
  }
}

/** 모델이 코드펜스를 붙이거나 앞뒤에 설명을 덧대는 경우까지 방어적으로 JSON을 뽑는다. */
export function parseJson<T>(text: string): T | null {
  const raw = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(raw) as T
  } catch {
    const a = raw.indexOf('{')
    const z = raw.lastIndexOf('}')
    if (a < 0 || z <= a) return null
    try {
      return JSON.parse(raw.slice(a, z + 1)) as T
    } catch {
      return null
    }
  }
}

/* ────────────────────────── 쿼터 가드 ────────────────────────── */

/**
 * 호출 주체 식별 — 로그인 사용자는 uid, 비로그인은 IP 해시.
 *
 * ⚠️ 원문 IP는 저장하지 않는다. anon 키가 클라이언트 번들에 들어있는 이상
 * "인증 여부"만으로는 남용을 막을 수 없어 비로그인도 주체로 세야 하는데,
 * 그렇다고 방문자 IP를 DB에 남길 이유는 없다(개인정보 최소수집).
 */
async function callerSubject(req: Request): Promise<string> {
  const auth = req.headers.get('authorization') ?? ''
  const jwt = auth.replace(/^Bearer\s+/i, '')
  const parts = jwt.split('.')
  if (parts.length === 3) {
    try {
      const pad = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const claims = JSON.parse(atob(pad + '='.repeat((4 - (pad.length % 4)) % 4)))
      // role이 authenticated여야 진짜 로그인 사용자다 — anon 키의 sub는 신뢰할 수 없다
      if (claims.role === 'authenticated' && typeof claims.sub === 'string') return `u:${claims.sub}`
    } catch {
      /* 토큰이 아니면 아래 IP 경로로 */
    }
  }
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`nuri-mind:${ip}`))
  const hex = Array.from(new Uint8Array(buf))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `ip:${hex}`
}

/**
 * 일일 호출 한도 확인. 한도 내면 true(카운터 1 증가).
 *
 * 실패 시(테이블 미배포·네트워크 오류) true를 돌려준다 — 가드가 죽었다고 기능을 막지는 않는다.
 * 이건 남용 방지 장치지 인증 장치가 아니다. 인증은 verify_jwt가 담당한다.
 */
export async function withinQuota(req: Request, fn: string, limit: number): Promise<boolean> {
  const url = env('SUPABASE_URL')
  const svc = env('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !svc) return true
  try {
    const subject = await callerSubject(req)
    const r = await fetch(`${url}/rest/v1/rpc/bump_ai_usage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: svc, authorization: `Bearer ${svc}` },
      body: JSON.stringify({ p_subject: subject, p_fn: fn, p_limit: limit }),
    })
    if (!r.ok) return true
    return (await r.json()) !== false
  } catch {
    return true
  }
}
