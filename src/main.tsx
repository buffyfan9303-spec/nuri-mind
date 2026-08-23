import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { loadAnalytics } from './lib/analytics'
import { loadKakao } from './lib/kakao'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import { registerSW, initInstallPrompt } from './lib/pwa'

// 에러 모니터링 — VITE_SENTRY_DSN 설정 시에만 (미설정이면 no-op)
initSentry()
// PWA — 서비스워커(라이브 도메인만) + 홈화면 설치 프롬프트 후킹
registerSW()
initInstallPrompt()
// ⚠️ AdSense 로더는 전역 주입 금지 — AdSlot 마운트 시에만(src/lib/ads.ts 참고, 정책 방어)
// GA4 — VITE_GA_ID 설정 시에만 (미설정이면 no-op)
loadAnalytics()
// 카카오 공유 SDK — VITE_KAKAO_KEY 설정 시에만 (미설정이면 no-op)
loadKakao()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="text-5xl">😵</div>
          <p className="text-[15px] font-extrabold">앗, 문제가 생겼어요.</p>
          <button onClick={() => window.location.reload()} className="rounded-2xl bg-mind-500 px-5 py-2.5 text-[14px] font-extrabold text-white">
            새로고침
          </button>
        </div>
      }
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>,
)
