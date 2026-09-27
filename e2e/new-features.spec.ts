import { expect, test } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, seedStore, waitForApp } from './helpers'

/**
 * 2026-09-27 추가 기능 — 진로 흥미 검사(규준 없음: 상위 % 대신 흥미 코드), 별자리·타로·꿈 해몽(오락).
 */
const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }
const seed = (page: Parameters<typeof seedOnboarded>[0]) => seedOnboarded(page, { consent: CONSENT, deviceId: 'dev_e2e_fixed' })

test('진로 흥미 검사: 끝까지 하면 흥미 코드가 나오고 상위 %는 어디에도 없다', async ({ page }) => {
  test.setTimeout(90_000) // 30문항 × 문항 전환 애니메이션 — 기본 30초로는 모자란다
  await seed(page)
  await page.goto('/test/career')
  await waitForApp(page)
  await page.getByText('시작하기 →').click()
  for (let i = 1; i <= 30; i++) {
    await expect(page.getByText(`${i}/30`)).toBeVisible()
    await expect(page.getByText(`Q${i}`, { exact: true })).toBeVisible() // 이전 문항 카드가 다 빠진 뒤에 누른다
    // 앞 문항일수록 좋다고 답해 점수가 한쪽으로 모이게(동점 안내 대신 코드가 확정되는 경로)
    await page.getByRole('button', { name: i % 2 ? '아주 좋다' : '싫은 편이다' }).click()
  }
  await expect(page).toHaveURL(/\/result\//)
  await expect(page.getByText(/^[RIASEC]{3}$/).first()).toBeVisible()
  await expect(page.locator('main')).not.toContainText('상위')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('별자리 운세: 별자리를 고르면 오늘 운세가 보인다', async ({ page }) => {
  await seed(page)
  await page.goto('/star')
  await waitForApp(page)
  await expect(page.getByText('오락 목적').first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('오늘의 타로: 뒤집으면 카드가 보이고 새로 들어와도 같은 카드다', async ({ page }) => {
  await seed(page)
  await page.goto('/tarot')
  await waitForApp(page)
  await page.getByRole('button', { name: '카드 뒤집기' }).click({ force: true })
  const card = page.getByRole('button', { name: /·/ }).first()
  await expect(card).toBeVisible()
  const name = await card.getAttribute('aria-label')
  await page.reload()
  await waitForApp(page)
  await expect(page.getByRole('button', { name: name! })).toBeVisible()
})

test('꿈 해몽: 문장 속 여러 키워드를 찾고, 없으면 인기 키워드를 권한다', async ({ page }) => {
  await seed(page)
  await page.goto('/dream')
  await waitForApp(page)
  const input = page.getByRole('searchbox', { name: '꿈 내용 검색' }).or(page.getByRole('textbox', { name: '꿈 내용 검색' }))
  await input.fill('뱀이 집에 들어오고 이빨이 빠지는 꿈')
  await expect(page.getByText('뱀 꿈').first()).toBeVisible()
  await expect(page.getByText('이빨 빠지는 꿈').first()).toBeVisible()
  await input.fill('ㅁㄴㅇㄹ')
  await expect(page.getByText('아직 사전에 없는 꿈이에요')).toBeVisible()
  await expect(page.getByText('이빨 빠지는 꿈')).toHaveCount(1) // 결과 카드는 사라지고 인기 키워드 칩만 남는다
})

// 비회원: 이름+생년월일만으로 맛보기, 나머지는 가입 유도 — 잠긴 본문은 DOM에도 없어야 한다
test.describe('비회원 맛보기', () => {
  test.beforeEach(async ({ page }) => {
    await seedStore(page, { onboarded: false, lang: 'ko' })
  })

  test('별자리: 이름·생일을 넣으면 오늘 한 줄만, 나머지는 가입 카드', async ({ page }) => {
    await page.goto('/star')
    await waitForApp(page)
    await page.getByTestId('guest-name').fill('민지')
    await page.getByTestId('guest-birth').fill('1998-04-02')
    await page.getByRole('button', { name: '운세 보기' }).click()
    await expect(page.getByRole('button', { name: '가입하고 전체 보기 (+100P)' })).toBeVisible()
    await page.getByRole('button', { name: '가입하고 전체 보기 (+100P)' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByPlaceholder('닉네임')).toHaveValue('민지')
    // 이름은 저장되지 않는다
    expect(await page.evaluate(() => localStorage.getItem('nuri-mind-v1') ?? '')).not.toContain('민지')
  })

  test('꿈 해몽: 검색은 되지만 AI 해몽 버튼은 없다', async ({ page }) => {
    await page.goto('/dream')
    await waitForApp(page)
    await page.getByRole('textbox', { name: '꿈 내용 검색' }).or(page.getByRole('searchbox', { name: '꿈 내용 검색' })).fill('뱀이 집에 들어오고 이빨이 빠지는 꿈')
    await expect(page.getByText('뱀 꿈').first()).toBeVisible()
    await expect(page.getByText('AI로 자세히 풀어 보기')).toHaveCount(0)
    await expect(page.getByRole('button', { name: '가입하고 전체 보기 (+100P)' })).toBeVisible()
  })
})
