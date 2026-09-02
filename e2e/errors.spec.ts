import { expect, test } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, seedStore, waitForApp } from './helpers'

/**
 * 에러 경로 — '흰 화면으로 끝나는 구멍' 두 개를 못 박는다.
 *
 *  ① 잘못된 주소: 예전엔 홈으로 조용히 리다이렉트. 지금은 404 페이지가 뜨고 URL은 그대로, 내비는 살아 있다.
 *  ② 청크 로드 실패(재배포 뒤 옛 index.html이 없는 해시를 요청): lazyWithReload가 1회 새로고침으로 복구를 시도하고,
 *     그래도 실패하면 **라우트 경계**가 받아 폴백을 그린다 — 앱 전체가 아니라 그 화면만. 하단 내비로 빠져나갈 수 있어야 한다.
 *     네트워크가 돌아온 뒤 '다시 시도'(새로고침)로 원래 화면이 그려진다.
 */

const CHUNK = /\/assets\/Profile-[^/]+\.js$/
/** 약관 동의가 없으면 재동의 오버레이(z-100)가 버튼을 가린다 — 이 스펙의 관심사가 아니다 */
const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }

test.describe('에러 경로', () => {
  test('모르는 주소는 홈으로 튕기지 않고 404 페이지를 그린다 — URL·내비 유지, 홈으로 버튼 동작', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    await page.goto('/this-page-does-not-exist')
    await waitForApp(page)

    await expect(page.getByRole('heading', { name: '이 주소엔 아무것도 없어요' })).toBeVisible()
    await expect(page).toHaveURL(/\/this-page-does-not-exist$/)
    await expect(page.getByText('/this-page-does-not-exist')).toBeVisible()
    // 라우트 폴백이지 앱 폴백이 아니다 — 하단 내비가 살아 있다
    await expect(page.getByRole('navigation')).toBeVisible()

    await page.getByRole('button', { name: '홈으로' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('가입 전 사용자가 모르는 주소로 오면 홈에서 가입을 시작한다 — 가입 직후 첫 화면이 404가 되지 않게', async ({ page }) => {
    await seedStore(page, { onboarded: false, lang: 'ko' })
    await page.goto('/old-shared-link')
    await waitForApp(page)

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByPlaceholder('닉네임')).toBeVisible()
    await expect(page.getByRole('heading', { name: '이 주소엔 아무것도 없어요' })).toHaveCount(0)
  })

  test('검사 화면처럼 보이는 모르는 주소(/anything/run)에서도 404엔 내비가 남는다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    await page.goto('/anything/run')
    await waitForApp(page)

    await expect(page.getByRole('heading', { name: '이 주소엔 아무것도 없어요' })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('청크 로드가 계속 실패하면 그 화면만 폴백으로 바뀌고, 복구 뒤 다시 시도로 원래 화면이 뜬다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    await page.route(CHUNK, (r) => r.abort())

    await page.goto('/profile')
    // 1회 자동 새로고침 → 10초 창 안에 재실패 → throw → 라우트 경계
    await expect(page.getByRole('alert')).toContainText('이 화면을 불러오지 못했어요', { timeout: 20_000 })
    // 내비가 살아 있어야 다른 탭으로 빠져나갈 수 있다
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page).toHaveURL(/\/profile$/)

    // 네트워크 복구 → 다시 시도(새로고침) → 프로필이 실제로 그려진다
    await page.unroute(CHUNK)
    await page.getByRole('button', { name: '다시 시도' }).click()
    await waitForApp(page)
    await expect(page.getByRole('button', { name: '데이터 초기화' }).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('폴백의 홈으로는 새로고침 없이 홈을 그린다 — 홈은 정적 import라 청크가 필요 없다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    await page.route(CHUNK, (r) => r.abort())
    await page.goto('/profile')
    await expect(page.getByRole('alert')).toContainText('이 화면을 불러오지 못했어요', { timeout: 20_000 })

    await page.getByRole('button', { name: '홈으로' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('alert')).toHaveCount(0)
    await waitForApp(page)
  })
})
