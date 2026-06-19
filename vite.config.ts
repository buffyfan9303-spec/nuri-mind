import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5179 },
  // ⚠️ manualChunks는 프로덕션에서 청크 초기화 순서 크래시(흰 화면)를 유발해 제거함(2026-06-19).
  build: { chunkSizeWarningLimit: 700 },
})
