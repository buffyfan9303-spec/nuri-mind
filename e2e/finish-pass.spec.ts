import { test, expect, type Page } from '@playwright/test'
import { seedOnboarded, waitForApp } from './helpers'
import { LEGAL_VERSION } from '../src/data/legal'

/**
 * 2026-10-08 전수 점검(화면 감사·버튼 연결 감사)에서 실측으로 나온 결함의 재발 방지.
 * 각 테스트는 '잴 대상이 실제로 있었다'(개수>0)를 먼저 단언한다.
 */
const consent = () => ({ consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })

async function noHorizontalOverflow(page: Page) {
  const [doc, vw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  expect(doc, `가로 넘침 ${doc}/${vw}`).toBeLessThanOrEqual(vw)
}

test.beforeEach(async ({ page }) => {
  await page.route('**/rest/v1/**', (r) => r.abort())
  await page.route(/googlesyndication\.com|doubleclick\.net|googleads\.g\.|adtrafficquality\.google/, (r) => r.abort())
})

test('IQ 종이접기(3단계) 문항이 360px에서 가로로 넘치지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await seedOnboarded(page, consent())
  await page.goto('/test/iq/run?mode=pro')
  await waitForApp(page)
  const fold = page.locator('div[class*="aspect-[2/3]"]')
  let seen = 0
  for (let i = 0; i < 40 && seen === 0; i++) {
    seen = await fold.count()
    if (seen) break
    const opts = page.locator('main').getByRole('button', { name: /^보기 \d/ })
    if ((await opts.count()) === 0) break
    await opts.first().click()
    const next = page.getByRole('button', { name: /다음/ })
    if (await next.count()) await next.first().click().catch(() => {})
    await page.waitForTimeout(600)
  }
  expect(seen, '종이접기 문항에 도달하지 못함').toBeGreaterThan(0)
  await noHorizontalOverflow(page)
  const box = await fold.first().boundingBox()
  expect(box!.x + box!.width).toBeLessThanOrEqual(360)
})

test('일본어 하단 탭 라벨은 모두 한 줄(탭 높이가 같다)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await seedOnboarded(page, { ...consent(), lang: 'ja' })
  await page.goto('/')
  await waitForApp(page)
  const tabs = page.locator('nav a[href]').filter({ has: page.locator('span') })
  const n = await tabs.count()
  expect(n).toBeGreaterThanOrEqual(5)
  const hs = new Set<number>()
  for (let i = 0; i < n; i++) {
    const b = await tabs.nth(i).boundingBox()
    if (b && b.y > 600) hs.add(Math.round(b.height))
  }
  expect(hs.size, `탭 높이가 제각각: ${[...hs]}`).toBe(1)
})

test('초대 코드는 360px에서 한 줄', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await seedOnboarded(page, { ...consent(), referralCode: 'NURI-CHUM' })
  await page.goto('/rewards')
  await waitForApp(page)
  const code = page.getByText('NURI-CHUM', { exact: true })
  await expect(code).toBeVisible()
  const lh = await code.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3)
  const b = await code.boundingBox()
  expect(b!.height).toBeLessThan(lh * 1.6)
})

test('일일 퀴즈는 답하기 전에도 ESC로 닫히고 스크롤 잠금이 풀린다', async ({ page }) => {
  await seedOnboarded(page, consent())
  await page.goto('/rewards')
  await waitForApp(page)
  await page.getByRole('button', { name: /퀴즈 풀기/ }).click()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

test('충전 화면 뒤로가기: 앱 안에서 왔으면 원래 화면, 바로 열었으면 상점', async ({ page }) => {
  await seedOnboarded(page, consent())
  await page.goto('/magazine')
  await waitForApp(page)
  await page.getByRole('button', { name: /충전하기/ }).first().click() // 상단 💎 알약 — 45개 화면 공통 진입점
  await expect(page).toHaveURL(/\/charge$/)
  await page.getByRole('button', { name: /뒤로/ }).first().click()
  await expect(page).toHaveURL(/\/magazine$/)

  await page.goto('/charge')
  await waitForApp(page)
  await page.getByRole('button', { name: /뒤로/ }).first().click()
  await expect(page).toHaveURL(/\/shop$/)
})

test('공유도 복사도 안 되는 환경에서 공유를 누르면 안내가 뜬다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) }, configurable: true })
  })
  await seedOnboarded(page, consent())
  await page.goto('/quick/lovestyle')
  await waitForApp(page)
  for (let i = 0; i < 12; i++) {
    const share = page.getByRole('button', { name: /대결/ })
    if (await share.count()) break
    const opts = page.locator('main button')
    if ((await opts.count()) === 0) break
    await opts.first().click()
    await page.waitForTimeout(200)
  }
  // 카카오 공유가 아니라 링크 공유(대결 링크) — shareOrCopy 경로
  const share = page.getByRole('button', { name: /대결/ }).first()
  await expect(share).toBeVisible()
  await share.click()
  await expect(page.getByText(/공유하지 못했어요|공유 카드를 만들지 못했어요/).first()).toBeVisible()
})

test('인지검사 중단(✕) 버튼의 실효 터치 영역이 44px 이상', async ({ page }) => {
  await seedOnboarded(page, consent())
  await page.goto('/memory/run')
  await waitForApp(page)
  const quit = page.getByRole('button', { name: '검사 중단' })
  await expect(quit).toHaveCount(1)
  const size = await quit.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el, '::before')
    const inset = -parseFloat(s.left || '0')
    return { w: r.width + 2 * inset, h: r.height + 2 * inset }
  })
  expect(size.w).toBeGreaterThanOrEqual(44)
  expect(size.h).toBeGreaterThanOrEqual(44)
})
