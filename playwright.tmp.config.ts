// 임시 검증용 — 4173은 다른 프로젝트(HOLDEM) preview가 점유 중이라 포트만 바꿔 돌린다. 검증 후 삭제.
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4199',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4199 --strictPort',
    url: 'http://localhost:4199',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
