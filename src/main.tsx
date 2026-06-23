import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { loadAdSenseScript } from './lib/ads'
import { loadAnalytics } from './lib/analytics'
import { loadKakao } from './lib/kakao'
import { initSentry, SentryErrorBoundary } from './lib/sentry'

// 에러 모니터링 — VITE_SENTRY_DSN 설정 시에만 (미설정이면 no-op)
initSentry()
// AdSense 로더 — VITE_ADSENSE_CLIENT 설정 시에만 주입(미설정이면 no-op)
loadAdSenseScript()
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
