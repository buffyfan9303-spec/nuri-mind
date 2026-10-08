/**
 * 네트워크 제한 시간 — 느리거나 끊긴 망에서 fetch가 영원히 안 끝나 로딩이 멈추던 문제의 공용 장치.
 *
 * 브라우저 fetch에는 기본 제한 시간이 없다. 연결이 반쯤 살아 있으면(지하철·약한 와이파이) 응답도 오류도 안 와서
 * 호출부의 실패 경로(정적 폴백·다시 시도)가 영영 실행되지 않았다. 시간이 지나면 AbortError로 끊어
 * 기존 catch로 흘려보낸다. 본문 읽기(r.json())까지 같은 시간 안에 들어간다.
 *
 * 이 파일은 import가 없어야 한다 — scripts/net-check.mjs가 Node에서 그대로 불러 행동을 검사한다.
 */

export const TIMEOUT = {
  /** Supabase REST·RPC·인증·엣지(비 AI) — 평소 1초 안팎, 콜드 스타트 몇 초 */
  api: 15_000,
  /** AI 생성(ai-report·fortune-detail·dream-reading) — effort low, maxTokens 3000~4000 (각 엣지 index.ts) */
  ai: 60_000,
  /**
   * AI 종합 심층 리포트(deep-report) — effort medium, maxTokens 12000. 화면은 '20초 정도'를 약속하지만,
   * 엣지의 상류 제한이 110초(_shared/llm.ts LLM_TIMEOUT_MS)라 그보다 먼저 끊으면 서버는 유료 생성을 끝내고
   * 결과는 버려진다(하루 한도도 소모). 상류 제한 + 5초.
   */
  deepAi: 115_000,
} as const

export function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms: number = TIMEOUT.api): Promise<Response> {
  const ctl = new AbortController()
  // 호출부가 넘긴 신호(supabase .abortSignal 등)도 그대로 존중한다
  const outer = init.signal
  if (outer) {
    if (outer.aborted) ctl.abort(outer.reason)
    else outer.addEventListener('abort', () => ctl.abort(outer.reason), { once: true })
  }
  // ponytail: 타이머를 지우지 않는다 — 응답·본문을 다 읽은 뒤의 abort는 아무 일도 안 한다(본문 읽기 중 멈춤까지 덮으려는 것)
  setTimeout(() => ctl.abort(new DOMException('timeout', 'AbortError')), ms)
  return fetch(input, { ...init, signal: ctl.signal })
}
