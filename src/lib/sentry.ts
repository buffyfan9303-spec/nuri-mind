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
    // MODE는 preview 배포도 'production'이라 운영 오류와 섞였다 — Vercel이 주는 환경 이름을 우선
    environment: (import.meta.env.VITE_VERCEL_ENV as string | undefined) || import.meta.env.MODE,
    release: (import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA as string | undefined) || undefined,
    tracesSampleRate: 0.1,
    sendDefaultPii: false, // 개인정보 미전송
    // 우리 도메인 스크립트의 오류만 — 브라우저 확장·광고 스크립트 노이즈 제외
    allowUrls: [/nurimind\.co\.kr/, /localhost/],
    denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari(-web)?-extension:\/\//, /googlesyndication\.com/, /kakaocdn\.net/],
  })
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
