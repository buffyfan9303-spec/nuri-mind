import { FUNCTIONS_URL, ANON_KEY } from './supabase'

/**
 * AI 엣지 함수 헬스체크 — 운영자 콘솔 전용.
 *
 * 왜 필요한가: ANTHROPIC_API_KEY가 없으면 앱은 조용히 정적 폴백으로 착지한다. 사용자 입장에선
 * "AI 리포트"가 그냥 밋밋한 요약으로 보일 뿐, 키가 없는 건지·오타인지·크레딧이 없는 건지 알 길이 없다.
 * 키를 넣은 뒤 "제대로 들어갔나"를 확인할 수단이 이 화면 하나뿐이라 진단을 명시적으로 만든다.
 *
 * 각 함수는 실패 사유를 구조화된 error 코드로 돌려준다(no_key / upstream+detail / truncated / refusal / parse).
 */

export type AiFnName = 'deep-report' | 'ai-report' | 'fortune-detail'

export interface AiHealth {
  fn: AiFnName
  /** 사람이 읽는 한 줄 판정 */
  verdict: string
  ok: boolean
  /** 원인 코드 — 대응이 서로 다르므로 뭉뚱그리지 않는다 */
  code: string
  /** 상류(Anthropic) 오류 본문 일부 — 키 오타/크레딧 소진 구분용 */
  detail?: string
}

/** 각 함수를 최소 유효 페이로드로 한 번 호출한다(과금은 실제 1회분). */
const PROBE: Record<AiFnName, unknown> = {
  'deep-report': {
    lang: 'ko',
    nickname: '진단',
    // 서버가 tests.length < 3 을 400으로 막으므로 최소 3건
    tests: [1, 2, 3].map((i) => ({
      name: `진단검사${i}`,
      band: 'mid',
      topPercent: 50,
      persona: 'penguin',
      strengths: ['진단용'],
      risks: ['진단용'],
    })),
  },
  'ai-report': {
    lang: 'ko',
    testName: '진단검사',
    band: 'mid',
    topPercent: 50,
    persona: 'penguin',
    strengths: ['진단용'],
    risks: ['진단용'],
    solutions: ['진단용'],
  },
  'fortune-detail': {
    lang: 'ko',
    ilju: '갑자',
    element: '목',
    zodiac: '쥐',
    luckyDir: '동',
    luckyTime: '오전',
    date: '2026-01-01',
  },
}

const VERDICT: Record<string, string> = {
  no_key: '❌ ANTHROPIC_API_KEY 미설정 — 정적 폴백으로만 동작',
  upstream: '❌ 키는 있으나 Anthropic 호출 실패(아래 상세 확인)',
  truncated: '⚠️ 응답이 잘림 — max_tokens 부족',
  refusal: '⚠️ 안전 정책으로 거절됨',
  parse: '⚠️ 응답 JSON 파싱 실패',
  thin: '⚠️ 섹션이 너무 적게 생성됨',
  shape: '⚠️ 응답 형식 불일치',
  not_configured: '❌ Supabase 미설정(VITE_SUPABASE_URL/ANON_KEY)',
  network: '❌ 네트워크 오류 — 함수에 도달하지 못함',
  http: '❌ 함수 호출 자체가 거부됨(인증/배포 확인)',
}

export async function probeAi(fn: AiFnName): Promise<AiHealth> {
  if (!FUNCTIONS_URL) return { fn, ok: false, code: 'not_configured', verdict: VERDICT.not_configured }
  try {
    const r = await fetch(`${FUNCTIONS_URL}/${fn}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
      body: JSON.stringify(PROBE[fn]),
    })
    const body = (await r.json().catch(() => ({}))) as { error?: string; detail?: string; status?: number }
    if (r.ok) return { fn, ok: true, code: 'ok', verdict: '✅ 정상 — AI 생성이 실제로 동작합니다' }
    const code = body.error ?? 'http'
    return {
      fn,
      ok: false,
      code,
      verdict: VERDICT[code] ?? `❌ ${code} (HTTP ${r.status})`,
      detail: body.detail ? `${body.status ?? r.status}: ${body.detail}` : undefined,
    }
  } catch {
    return { fn, ok: false, code: 'network', verdict: VERDICT.network }
  }
}
