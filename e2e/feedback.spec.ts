import { expect, test } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { allDeepResults, premiumUntil, seedOnboarded, waitForApp } from './helpers'

/**
 * 피드백 계약 — '아무 일도 안 일어난 것처럼 보이는' 세 자리를 못 박는다.
 *
 *  ① 서버 실패 ≠ 빈 목록: 커뮤니티가 요청에 실패하면 '아직 글이 없어요'가 아니라 실패 카드 + 다시 시도.
 *     실패를 빈 목록으로 보여주면 사용자는 글이 없는 줄 알거나 자기 글이 사라졌다고 믿는다.
 *  ② 되돌리기: 체크 해제처럼 실수하기 쉬운 탭은 3초 안에 되돌릴 수 있어야 한다.
 *  ③ 토스트가 실제로 뜬다: 성공/실패 문구가 role=status로 읽히는가.
 */

const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }

test.describe('피드백 계약', () => {
  test('커뮤니티 서버 요청이 실패하면 빈 상태가 아니라 실패 카드와 다시 시도가 뜬다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    // Supabase로 나가는 모든 요청 차단 — 지하철·엘리베이터에서 흔한 상태
    await page.route('**/rest/v1/**', (r) => r.abort())
    await page.route('**/*supabase*/**', (r) => r.abort())

    await page.goto('/community')
    await waitForApp(page)

    const alert = page.getByRole('alert')
    await expect(alert).toContainText('불러오지 못했어요', { timeout: 15_000 })
    // 이 기기의 글이 '커뮤니티 전체'로 보이지 않도록 무엇을 보고 있는지 말해야 한다
    await expect(alert).toContainText('이 기기에 저장된 글')
    await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible()
  })

  test('성장 과제 체크를 해제하면 되돌리기 토스트가 뜨고, 누르면 다시 완료로 돌아온다', async ({ page }) => {
    await seedOnboarded(page, {
      consent: CONSENT,
      premiumUntil: premiumUntil(),
      results: allDeepResults(),
      growthPlanAt: Date.now(),
    })
    await page.goto('/growth')
    await waitForApp(page)

    // 플랜은 사용자가 직접 만든다(포커스가 시드에 없다) — 만들고 나야 과제가 생긴다
    const make = page.getByRole('button', { name: '내 성장 플랜 만들기' })
    if (await make.count()) await make.click()

    // 과제 항목은 aria-pressed를 가진 토글 버튼이다
    const box = page.locator('button[aria-pressed]').first()
    await expect(box).toBeVisible({ timeout: 10_000 })

    await box.click()
    await expect(page.getByRole('status')).toContainText('적립', { timeout: 5_000 })

    // 같은 자리를 한 번 더 = 해제 → 되돌리기 제안
    await box.click()
    const undo = page.getByRole('button', { name: '되돌리기' })
    await expect(undo).toBeVisible({ timeout: 5_000 })
    await undo.click()

    // 되돌린 뒤에는 해제 안내가 남아 있지 않다
    await expect(page.getByText('체크를 해제했어요')).toHaveCount(0)
  })
})
