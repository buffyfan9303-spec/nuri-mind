import { expect, test } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, seedStore, waitForApp } from './helpers'

/**
 * 리워드 설문 '준비 중' 계약 (data/features.ts SURVEYS_ENABLED = false).
 *
 * 운영 중인 설문이 없어 모든 설문 진입점을 '준비 중'으로 바꿨다. 예전 커버리지(설문 목록·참여 링크)를
 * 지우는 대신, 진입점마다 '준비 중'이 보이고 없는 설문으로 보내는 링크가 남아 있지 않은지를 못 박는다.
 * 설문을 다시 켜면(SURVEYS_ENABLED = true) 이 파일은 참여·만들기 흐름 테스트로 바꿔야 한다.
 *
 * + 애드센스 정책 방어: 준비 중 화면·홈(탐색 화면)엔 광고 스크립트조차 실리지 않아야 한다.
 */
const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }
const AD_SCRIPT = '#adsbygoogle-js'

test.describe('리워드 설문 — 준비 중', () => {
  test.beforeEach(async ({ page }) => {
    // 외부 광고망 왕복 차단(오프라인·CI 안정) — 스크립트 '태그 주입' 여부는 그대로 관측된다
    await page.route(/googlesyndication\.com|doubleclick\.net|googleads\.g\.|adtrafficquality\.google/, (r) => r.abort())
    await seedOnboarded(page, { consent: CONSENT })
  })

  test('홈: 설문으로 가는 진입점이 없다 · 광고 슬롯·스크립트 없음', async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
    // 홈 레이아웃(띠·카드 구성)은 따로 바뀔 수 있어 '준비 중' 문구 존재가 아니라 '설문 링크 부재'를 본다
    await expect(page.getByRole('heading', { level: 1, name: '누리 마인드에 오신 걸 환영해요' })).toHaveCount(0)
    await expect(page.locator('a[href^="/rewards/survey"], a[href="/rewards/create"]')).toHaveCount(0)
    // 예전 띠 문구('설문 참여하고 nP 받기 · 참여하기')가 남으면 없는 설문으로 보낸다
    await expect(page.getByRole('button', { name: '설문 참여하러 가기' })).toHaveCount(0)
    await expect(page.getByText(/설문 참여하고 \d+P 받기/)).toHaveCount(0)
    // 홈은 탐색 화면 — 광고 슬롯도, 로더 스크립트도 없어야 한다(자동 광고가 붙을 발판 자체를 없앤다)
    await expect(page.locator('ins.adsbygoogle')).toHaveCount(0)
    await expect(page.locator(AD_SCRIPT)).toHaveCount(0)
  })

  test('리워드: 설문 목록·설문 만들기 대신 준비 중 카드', async ({ page }) => {
    await page.goto('/rewards')
    await waitForApp(page)
    await expect(page.getByText('준비 중이에요')).toBeVisible()
    await expect(page.getByRole('button', { name: /설문 만들기/ })).toHaveCount(0)
    // 시드 설문(데모 데이터)이 목록으로 새어 나오면 안 된다
    await expect(page.getByText('모바일 게임 과금 경험 설문')).toHaveCount(0)
  })

  for (const path of ['/rewards/survey/sv_morning', '/rewards/create']) {
    test(`옛 링크 ${path} → 준비 중 화면(광고 없음), 돌아가기로 리워드`, async ({ page }) => {
      await page.goto(path)
      await waitForApp(page)
      await expect(page.getByRole('heading', { level: 1, name: '준비 중이에요' })).toBeVisible()
      await expect(page.locator('ins.adsbygoogle')).toHaveCount(0)
      await expect(page.locator(AD_SCRIPT)).toHaveCount(0)
      await page.getByRole('button', { name: '돌아가기' }).click()
      await expect(page).toHaveURL(/\/rewards$/)
    })
  }
})

test('광고는 콘텐츠 아래에만 — 매거진 아티클엔 본문 뒤 한 자리, 소개 페이지엔 없음', async ({ page }) => {
  await page.route(/googlesyndication\.com|doubleclick\.net|googleads\.g\.|adtrafficquality\.google/, (r) => r.abort())
  await seedStore(page, { onboarded: false, lang: 'ko' })

  await page.goto('/about')
  await waitForApp(page)
  await expect(page.getByRole('heading', { level: 1, name: '누리 마인드를 소개합니다' })).toBeVisible()
  await expect(page.locator('ins.adsbygoogle')).toHaveCount(0)

  await page.goto('/magazine/adhd-focus')
  await waitForApp(page)
  await expect(page.getByRole('heading', { level: 1, name: '집중력이 약한 게 아니라, 뇌가 다른 거예요' })).toBeVisible()
  // 본문 중간 광고는 뺐다 — 슬롯은 정확히 하나(하단)
  await expect(page.locator('ins.adsbygoogle')).toHaveCount(1)
})
