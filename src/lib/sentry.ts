import * as Sentry from '@sentry/react'

/**
 * 에러 모니터링(Sentry) — VITE_SENTRY_DSN 설정 시에만 활성. 미설정이면 init은 no-op.
 *   Sentry.io → 프로젝트 생성(React) → DSN 복사 → .env(또는 Vercel env)에 VITE_SENTRY_DSN=https://...@...ingest.../...
 * ErrorBoundary는 DSN 없어도 동작(크래시 시 폴백 UI 표시) — 리포트만 DSN 있을 때.
 */
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

export function initSentry(): void {
  if (!DSN || /[Xx]{4,}/.test(DSN)) return
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    sendDefaultPii: false, // 개인정보 미전송
  })
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
