import { defineConfig, devices } from '@playwright/test'

const REPO = 'C:/Users/buffy/OneDrive/바탕 화면/NURI MIND'
const PORT = 4188

export default defineConfig({
  testDir: `${REPO}/e2e`,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    screenshot: 'off',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    cwd: REPO,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
