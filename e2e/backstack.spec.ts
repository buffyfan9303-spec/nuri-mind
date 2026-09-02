import { expect, test } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, seedStore, waitForApp } from './helpers'

/**
 * 뒤로가기 스택(lib/backstack) — 모바일에서 뒤로가기는 '닫기'의 동의어다.
 *
 * 이식 전엔 history 처리가 하나도 없어 시트·모달이 열린 채 뒤로가기를 누르면 **페이지가 빠져나갔다**
 * ("약관 읽다 뒤로가기 → 온보딩이 사라짐"). 세 가지를 못 박는다:
 *  ① 오버레이가 열려 있으면 뒤로가기는 그 한 겹만 닫고 URL은 그대로
 *  ② 닫은 뒤 화면 상태(입력값)가 살아 있다 — 닫기가 '언마운트'가 아니라 '닫기'인가
 *  ③ 오버레이가 없을 때의 뒤로가기는 평소처럼 이전 페이지로 간다 — 스택이 뒤로가기를 삼키지 않는가
 *     (홀덤이 겪은 '유령 항목' 회귀: 프로그램적으로 닫은 겹의 history 칸이 남으면 뒤로가기가 죽은 입력이 된다)
 */

const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }

test.describe('뒤로가기 스택', () => {
  test('약관 시트가 열린 채 뒤로가기 → 시트만 닫히고 온보딩·입력값은 그대로', async ({ page }) => {
    await seedStore(page, { onboarded: false, lang: 'ko' })
    await page.goto('/')
    await waitForApp(page)

    await page.getByPlaceholder('닉네임').fill('뒤로가기')
    await page.getByRole('button', { name: '이용약관', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await page.goBack()

    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/$/)
    // 시트가 '닫힌' 게 아니라 온보딩이 '언마운트'됐다면 입력값이 사라진다
    await expect(page.getByPlaceholder('닉네임')).toHaveValue('뒤로가기')
  })

  test('X로 닫은 뒤의 뒤로가기는 이전 페이지로 간다 — 유령 history 칸이 남지 않는다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    await page.goto('/')
    await waitForApp(page)
    await page.goto('/profile')
    await waitForApp(page)

    // 설정 카드의 초기화 → 모달 열기 → X(배경 탭)로 닫기
    await page.getByRole('button', { name: '데이터 초기화' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)

    // 프로그램적 닫기가 history 칸을 되감았으면, 이 뒤로가기는 /profile 이전인 / 로 간다.
    // 칸이 남아 있었다면(회귀) 뒤로가기가 그 칸만 소비해 URL이 /profile 그대로다.
    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
  })

  test('오버레이가 없을 때 뒤로가기는 스택에 삼켜지지 않는다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    await page.goto('/')
    await waitForApp(page)
    await page.goto('/rewards')
    await waitForApp(page)

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
  })
})
