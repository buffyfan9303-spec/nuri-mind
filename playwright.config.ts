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
    /**
     * ⚠️ 절대 true로 되돌리지 말 것.
     *
     * true이면 4173에 뭔가 떠 있을 때 빌드를 건너뛰고 그걸 재사용한다. Windows에서는
     * `npm run build && vite preview`가 셸을 거쳐 실행돼 Playwright가 셸을 죽여도 vite가
     * 고아로 남는데, 그 고아가 **옛 dist를 계속 서빙한다**. 그러면 테스트는 방금 고친 코드가
     * 아니라 몇 판 전 빌드를 검사한다 — 실제로 그래서 30/30이 통째로 거짓 실패했고,
     * 반대 방향이었다면 깨진 코드가 초록불로 통과했을 것이다.
     *
     * false면 매번 새로 빌드하고, 포트가 잡혀 있으면 --strictPort가 요란하게 실패한다.
     * 느리지만 "조용히 틀린 것"보다 "시끄럽게 멈추는 것"이 낫다.
     */
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
