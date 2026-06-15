import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { loadAdSenseScript } from './lib/ads'
import { loadAnalytics } from './lib/analytics'
import { loadKakao } from './lib/kakao'

// AdSense 로더 — VITE_ADSENSE_CLIENT 설정 시에만 주입(미설정이면 no-op)
loadAdSenseScript()
// GA4 — VITE_GA_ID 설정 시에만 (미설정이면 no-op)
loadAnalytics()
// 카카오 공유 SDK — VITE_KAKAO_KEY 설정 시에만 (미설정이면 no-op)
loadKakao()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
