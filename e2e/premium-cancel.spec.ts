import { test, expect } from '@playwright/test'
import { seedOnboarded, waitForApp, premiumUntil } from './helpers'
import { LEGAL_VERSION } from '../src/data/legal'

/** 구독 해지 확인이 브라우저 기본 confirm(WebView에서 억제되면 해지 불가)이 아니라 앱 시트로 묻는다 */
test('구독 해지는 앱 확인 시트로 묻고, 취소하면 그대로·해지하면 프리미엄이 끝난다', async ({ page }) => {
  let nativeDialogs = 0
  page.on('dialog', (d) => {
    nativeDialogs++
    void d.dismiss()
  })
  await page.route('**/rest/v1/**', (r) => r.abort())
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() }, premiumUntil: premiumUntil() })
  await page.goto('/premium')
  await waitForApp(page)
  await page.getByRole('button', { name: '구독 해지 (베타)' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(sheet).toHaveCount(0)
  await expect(page.getByRole('button', { name: '구독 해지 (베타)' })).toBeVisible() // 아직 프리미엄

  await page.getByRole('button', { name: '구독 해지 (베타)' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '해지하기' }).click()
  await expect(page.getByRole('button', { name: '구독 해지 (베타)' })).toHaveCount(0)
  const until = await page.evaluate(() => JSON.parse(localStorage.getItem('nuri-mind-v1') || '{}').state?.premiumUntil ?? null)
  expect(until === 0 || until === null || until < Date.now()).toBe(true)
  expect(nativeDialogs).toBe(0)
})
