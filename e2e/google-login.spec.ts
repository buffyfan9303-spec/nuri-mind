import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, waitForApp } from './helpers'

/**
 * Google 로그인 버튼은 서버(Supabase /auth/v1/settings)에서 Google provider가 켜졌을 때만 보이고,
 * 누르면 provider=google로 authorize에 간다. 꺼져 있으면 오류 화면으로 보내지 않게 아예 숨는다.
 */
async function serveSettings(page: Page, google: boolean): Promise<void> {
  await page.route('**/auth/v1/settings**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ external: { kakao: true, google } }) }),
  )
}

const GOOGLE_ROW = { name: /Google로 로그인/ }

test.beforeEach(async ({ page }) => {
  await page.route('**/rest/v1/**', (r) => r.abort())
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })
})

test('Google provider가 켜져 있으면 프로필에 버튼이 보이고, 누르면 provider=google로 간다', async ({ page }) => {
  await serveSettings(page, true)
  let resolve!: (u: URL) => void
  const hit = new Promise<URL>((r) => (resolve = r))
  await page.route('**/auth/v1/authorize**', (route) => {
    resolve(new URL(route.request().url()))
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<main>google</main>' })
  })

  await page.goto('/profile')
  await waitForApp(page)
  // 카카오 행이 보여야 '로그인 안 된 상태의 계정 영역'을 실제로 본 것이다(빈 화면에서 0개 = 거짓 통과 방지)
  await expect(page.getByRole('button', { name: /카카오로 로그인/ })).toBeVisible()
  const row = page.getByRole('button', GOOGLE_ROW)
  await expect(row).toBeVisible()
  await row.click()
  const url = await hit
  expect(url.searchParams.get('provider')).toBe('google')
})

test('Google provider가 꺼져 있으면 버튼이 없다', async ({ page }) => {
  await serveSettings(page, false)
  await page.goto('/profile')
  await waitForApp(page)
  await expect(page.getByRole('button', { name: /카카오로 로그인/ })).toBeVisible()
  await expect(page.getByRole('button', GOOGLE_ROW)).toHaveCount(0)
})
