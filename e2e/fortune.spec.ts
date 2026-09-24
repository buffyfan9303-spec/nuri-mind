import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { STORE_KEY } from './helpers'

/**
 * 오늘의 운세 — 입력 폼이 항상 먼저, 결과는 버튼을 눌러야.
 *
 * 가족·친구 운세를 번갈아 보는 사용자를 위해, 재방문 시 지난 결과로 곧장 건너뛰지 않고
 * **지난 입력이 채워진 폼**을 보여 준다. 여기서 못 박는 것:
 *  ① v3(생일 문자열 하나) 사용자의 birthDate가 v4 운세 프로필로 옮겨져 폼에 채워진다
 *  ② 결과는 '오늘의 운세 보기'를 누르기 전엔 나오지 않는다 — 새로고침·다른 화면 다녀와도 마찬가지
 *  ③ 다른 사람(음력 입력)을 봐도 내 계정 생일(홈·궁합이 쓰는 값)은 그대로, 최근 목록 칩으로 전환된다
 *  ④ 사람을 바꿔 봐도 종합 운세 무료 횟수는 하루 한 번만 차감된다(보상·과금은 계정·날짜 단위)
 */

const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }

/**
 * helpers.seedStore는 addInitScript라 **매 페이지 로드마다** 다시 심는다 — 재방문 검증에서 저장값이 지워진다.
 * 탭 세션당 한 번만 심어, 이후 이동은 실제 persist 값으로 하이드레이트되게 한다.
 */
async function seedOnce(page: Page, state: Record<string, unknown>, version: number) {
  await page.addInitScript(
    ([key, st, v]) => {
      if (sessionStorage.getItem('__fx_seeded')) return
      localStorage.setItem(key as string, JSON.stringify({ state: st, version: v }))
      sessionStorage.setItem('__fx_seeded', '1')
    },
    [STORE_KEY, state, version] as const,
  )
}

async function readState(page: Page): Promise<Record<string, any>> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').state ?? {}, STORE_KEY)
}

const seeBtn = (page: Page) => page.getByRole('button', { name: '오늘의 운세 보기', exact: true })
const result = (page: Page) => page.getByTestId('fortune-result')

async function openFortune(page: Page) {
  await page.goto('/fortune')
  await expect(seeBtn(page)).toBeVisible({ timeout: 15_000 })
}

test('예전 생일이 폼에 채워지고, 결과는 버튼을 눌러야 — 재방문해도 폼부터', async ({ page }) => {
  // v3 저장본 — 운세 입력은 양력 birthDate 하나뿐이던 시절
  await seedOnce(page, { onboarded: true, nickname: '테스터', lang: 'ko', consent: CONSENT, birthDate: '1990-03-15' }, 3)
  await openFortune(page)

  // ① 이관: 폼이 지난 생일로 채워져 있고 결과는 아직 없다
  await expect(result(page)).toHaveCount(0)
  await expect(page.getByLabel('년', { exact: true })).toHaveValue('1990')
  await expect(page.getByLabel('월', { exact: true })).toHaveValue('3')
  await expect(page.getByLabel('일', { exact: true })).toHaveValue('15')
  await expect(page.getByTestId('fortune-age')).toContainText('만 ')
  const migrated = await readState(page)
  expect(migrated.fortuneProfile).toMatchObject({ date: '1990-03-15', calendar: 'solar', self: true })

  // 성별을 안 고르면 결과로 넘어가지 않는다
  await seeBtn(page).click()
  await expect(page.getByRole('alert')).toContainText('성별')
  await expect(result(page)).toHaveCount(0)

  await page.getByRole('button', { name: '여성', exact: true }).click()
  await page.locator('#fx-time').selectOption('b:6') // 오시
  await seeBtn(page).click()

  // ② 결과 — 사주팔자 표(시주까지)
  await expect(result(page)).toBeVisible()
  await expect(page.getByTestId('fortune-pillars')).toContainText('시주')
  await expect(page.getByTestId('fortune-pillars')).not.toContainText('?')
  expect((await readState(page)).fortuneSeenDate).toBeTruthy()

  // 다른 화면에 갔다가(전체 새로 불러오기) 돌아오면 — 결과가 아니라 채워진 폼
  await page.goto('/')
  await page.goto('/fortune')
  await expect(seeBtn(page)).toBeVisible({ timeout: 15_000 })
  await expect(result(page)).toHaveCount(0)
  await expect(page.getByLabel('년', { exact: true })).toHaveValue('1990')
  await expect(page.getByRole('button', { name: '여성', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#fx-time')).toHaveValue('b:6')

  // 버튼을 누르면 그때 결과
  await seeBtn(page).click()
  await expect(result(page)).toBeVisible()
})

test('가족 운세(음력)를 봐도 내 생일은 그대로, 최근 칩으로 전환 · 무료 횟수는 하루 1번', async ({ page }) => {
  await seedOnce(
    page,
    {
      onboarded: true, nickname: '테스터', lang: 'ko', consent: CONSENT, birthDate: '1990-03-15',
      fortuneProfile: { name: '', gender: 'm', calendar: 'solar', date: '1990-03-15', leap: false, time: '', self: true },
      fortuneRecent: [{ name: '', gender: 'm', calendar: 'solar', date: '1990-03-15', leap: false, time: '', self: true }],
    },
    4,
  )
  await openFortune(page)
  await seeBtn(page).click()
  await expect(result(page)).toBeVisible()

  // 종합 운세 — 이번 달 무료 1회 사용
  await page.getByRole('button', { name: /^무료로 보기 · 이번 달/ }).click()
  await expect(page.getByText('종합 운세', { exact: true })).toBeVisible()
  expect((await readState(page)).fortuneFreeUses).toBe(1)

  // 결과 화면에서 '다른 사람 운세 보기' → 빈 폼
  await page.getByRole('button', { name: '다른 사람 운세 보기' }).first().click()
  await expect(seeBtn(page)).toBeVisible()
  await expect(page.getByLabel('년', { exact: true })).toHaveValue('')

  // 없는 음력 날짜는 막는다(2024년엔 윤1월이 없다)
  await page.locator('#fx-name').fill('엄마')
  await page.getByRole('button', { name: '여성', exact: true }).click()
  await page.getByRole('button', { name: '음력', exact: true }).click()
  await page.getByLabel('년', { exact: true }).selectOption('2024')
  await page.getByLabel('월', { exact: true }).selectOption('1')
  await page.getByLabel('일', { exact: true }).selectOption('1')
  await page.getByLabel('윤달').check()
  await seeBtn(page).click()
  await expect(page.getByRole('alert')).toContainText('음력에 없는 날짜')

  // 음력 2000-01-01 = 양력 2000-02-05(설날, KASI)
  await page.getByLabel('윤달').uncheck()
  await page.getByLabel('년', { exact: true }).selectOption('2000')
  await expect(page.getByTestId('fortune-age')).toContainText('양력 2000-02-05')
  await seeBtn(page).click()
  await expect(result(page)).toBeVisible()
  await expect(result(page)).toContainText('엄마님')

  // 다른 사람을 봐도 종합 운세는 이미 열려 있고, 무료 횟수는 그대로
  await expect(page.getByText('종합 운세', { exact: true })).toBeVisible()
  const st = await readState(page)
  expect(st.fortuneFreeUses).toBe(1)
  expect(st.birthDate).toBe('1990-03-15') // 내 생일은 안 바뀐다
  expect(st.fortuneRecent).toHaveLength(2)

  // 재방문 — 마지막 입력(엄마)이 채워진 폼, 최근 칩 '나'로 바로 전환
  await page.goto('/')
  await page.goto('/fortune')
  await expect(seeBtn(page)).toBeVisible({ timeout: 15_000 })
  await expect(result(page)).toHaveCount(0)
  await expect(page.locator('#fx-name')).toHaveValue('엄마')
  await expect(page.getByRole('button', { name: '음력', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: '나', exact: true }).click()
  await expect(page.getByLabel('년', { exact: true })).toHaveValue('1990')
  await expect(page.getByRole('button', { name: '양력', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await seeBtn(page).click()
  await expect(result(page)).toBeVisible()
  expect((await readState(page)).fortuneFreeUses).toBe(1)
})
