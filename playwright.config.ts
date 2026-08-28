import { defineConfig, devices } from '@playwright/test'

/**
 * E2E — 정적 스모크(scripts/smoke.mjs)가 못 잡는 "실제로 눌렀을 때 동작하는가"를 검증한다.
 *
 * dev 서버가 아니라 **프로덕션 빌드(vite preview)** 를 띄우는 이유:
 *  · dev는 HMR·소스맵 때문에 프로덕션과 코드 경로가 다르다(과거 manualChunks 백지화 사고가 여기서 났다)
 *  · import.meta.env.DEV 분기(window.__store 노출 등)가 프로덕션엔 없다 —
 *    테스트가 그런 뒷문에 의존하지 못하게 강제해, 실제 사용자와 같은 경로만 검증하게 된다
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul', // ⚠️ 날짜 키가 KST 기준이라 타임존을 고정하지 않으면 자정 경계 테스트가 흔들린다
  },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
