import { test, expect } from '@playwright/test'
import { seedOnboarded } from './helpers'
import { LEGAL_VERSION } from '../src/data/legal'

/** 나에 관하여 — 심리검사를 모두 마치면 종합 설명이 열리고, 그 전엔 진행률만 보인다 */
const DEEP: [string, string, string][] = [
  ['adhd', 'caution', 'meerkat'],
  ['ego', 'balanced', 'owl'],
  ['love', 'anxious', 'hedgehog'],
  ['burnout', 'high', 'sloth'],
  ['dopamine', 'mild', 'fox'],
  ['resilience', 'mid', 'bamboo'],
  ['dark', 'low', 'dove'],
  ['selfesteem', 'moderate', 'deer'],
  ['perfect', 'strain', 'beaver'],
  ['efficacy', 'secure', 'eagle'],
  ['socialanx', 'mild', 'cat'],
]
const results = (n: number) =>
  DEEP.slice(0, n).map(([testId, band, persona], i) => ({
    id: `r_${testId}`, testId, band, persona, percentile: 50 + i, at: Date.now() - 3600_000, score: 10, max: 20, subscales: [],
  }))
const consent = { v: LEGAL_VERSION, at: new Date().toISOString() }

test('나에 관하여: 모두 마치기 전엔 진행률', async ({ page }) => {
  await seedOnboarded(page, { consent, results: results(4) })
  await page.goto('/me')
  await expect(page.getByText(`4/${DEEP.length}`)).toBeVisible()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4')
  await expect(page.getByText('영역별로 보면')).toHaveCount(0)
})

test('나에 관하여: 모두 마치면 종합 설명·전문가 권유·진단 아님 안내', async ({ page }) => {
  await seedOnboarded(page, { consent, results: results(DEEP.length) })
  await page.goto('/me')
  await expect(page.getByRole('heading', { name: /나에 대하여 한눈에/ })).toBeVisible()
  await expect(page.getByText('나의 강점')).toBeVisible()
  await expect(page.getByText('영역별로 보면')).toBeVisible()
  // 번아웃 high·완벽주의 strain은 결과 화면과 같은 기준(data/care.ts)으로 권유 대상
  await expect(page.getByText(/번아웃·완벽주의 결과는 혼자 견디기보다/)).toBeVisible()
  await expect(page.getByText('의학적 진단이 아니에요', { exact: false })).toBeVisible()
})
