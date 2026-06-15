import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { loadAdSenseScript } from './lib/ads'

// AdSense 로더 — VITE_ADSENSE_CLIENT 설정 시에만 주입(미설정이면 no-op)
loadAdSenseScript()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
