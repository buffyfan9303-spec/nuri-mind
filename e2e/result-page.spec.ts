import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { ADHD_ITEMS } from '../src/data/adhd'
import { BURNOUT_ITEMS } from '../src/data/burnout'
import { LOVE_ITEMS } from '../src/data/love'
import { DARK_ITEMS } from '../src/data/dark'
import { IQ_ITEMS } from '../src/data/iq'
import ko from '../src/i18n/dict.ko'
import { PERSONAS } from '../src/i18n/animalTranslations'
import { scoreAdhd, scoreBurnout, scoreDark, scoreIq, scoreLove } from '../src/lib/scoring'
import { collectConsoleErrors, blockExternal } from './core-flows-helpers'
import { seedOnboarded, waitForApp } from './helpers'

/**
 * /result/:rid — 결과 화면 (E2E 공백이던 곳).
 *
 * 시드는 **앱이 실제로 만드는 결과 레코드**다: TestRun.finish가 부르는 점수 함수(lib/scoring)와 문항뱅크(data/*)를
 * 그대로 import해 만든 뒤 durationMs를 붙인다(TestRun.finish와 같은 순서). 손으로 만든 가짜 형태가 아니다.
 * 단언은 모두 '대상이 실제로 있다(count>0)'를 먼저 확인한 뒤 내용을 본다.
 */

const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }
const dict = ko as unknown as Record<string, string>

/** Likert 문항 전부 같은 값으로 답한 점수 — 실제 결과 레코드 모양 */
const allAnswers = (items: { id: string }[], v: number) => Object.fromEntries(items.map((it) => [it.id, v]))

interface Case {
  testId: string
  make: () => ReturnType<typeof scoreAdhd>
  /** 면책 문구가 나오는 검사 */
  disclaimer: boolean
}

const CASES: Case[] = [
  { testId: 'adhd', make: () => scoreAdhd(ADHD_ITEMS, allAnswers(ADHD_ITEMS, 2)), disclaimer: true },
  { testId: 'burnout', make: () => scoreBurnout(BURNOUT_ITEMS, allAnswers(BURNOUT_ITEMS, 3)), disclaimer: true },
  { testId: 'love', make: () => scoreLove(LOVE_ITEMS, allAnswers(LOVE_ITEMS, 3)), disclaimer: true },
  { testId: 'dark', make: () => scoreDark(DARK_ITEMS, allAnswers(DARK_ITEMS, 3)), disclaimer: true },
]

function withDuration<T extends { id: string }>(r: T): T & { durationMs: number; id: string } {
  return { ...r, id: `e2e_${r.id}`, durationMs: 123_000 }
}

async function openResult(page: Page, rid: string) {
  await page.goto(`/result/${rid}`)
  await waitForApp(page)
}

for (const c of CASES) {
  test(`결과 화면(${c.testId}) — 페르소나·영역별 점수·면책·다시/공유/대결 버튼, 콘솔 에러 0`, async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await blockExternal(page)
    const res = withDuration(c.make())
    // 레코드가 실제 점수 함수 산출물인지 못 박는다(시드가 비어 있어 거짓 통과하는 것 방지)
    expect(res.testId).toBe(c.testId)
    expect(res.subscales.length).toBeGreaterThan(0)
    expect(PERSONAS[res.persona], `persona ${res.persona}`).toBeTruthy()
    await seedOnboarded(page, { consent: CONSENT, results: [res] })

    await openResult(page, res.id)
    const persona = PERSONAS[res.persona]

    // 히어로: 페르소나 이름(h1)·타이틀
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText(persona.name.ko)
    await expect(page.getByText(persona.title.ko, { exact: true })).toHaveCount(1)

    // 영역별 점수 카드: 제목 + 모든 서브스케일 행이 번역된 이름·점수/만점으로
    const card = page.getByRole('heading', { name: dict['result.subscaleTitle'] })
    await expect(card).toHaveCount(1)
    for (const s of res.subscales) {
      const label = dict[`sub.${s.key}`]
      expect(label, `sub.${s.key} 번역이 사전에 있어야 한다(없으면 화면에 키 문자열이 그대로 보인다)`).toBeTruthy()
      const row = page.locator('div.mb-1\\.5', { hasText: label }).filter({ hasText: `${s.score}/${s.max}` })
      expect(await row.count(), `서브스케일 행 ${s.key}`).toBeGreaterThan(0)
    }
    // 번역 안 된 키가 화면에 새지 않는다
    await expect(page.getByText(/\b(sub|result|band|share|test)\.[a-zA-Z]+\b/)).toHaveCount(0)

    // 면책 문구
    if (c.disclaimer) {
      const disc = page.getByText(dict['result.medical'], { exact: false })
      await expect(disc).toHaveCount(1)
      await expect(disc).toContainText(dict['result.contInd'])
    }

    // 버튼: 이미지 카드 저장 / 텍스트 공유 / 친구와 결과 대결 / 다시 검사하기 / 홈으로
    await expect(page.getByRole('button', { name: dict['share.card'] })).toHaveCount(1)
    await expect(page.getByRole('button', { name: /텍스트 공유/ })).toHaveCount(1)
    await expect(page.getByRole('button', { name: '친구와 결과 대결' })).toHaveCount(1)
    const retake = page.getByRole('button', { name: dict['result.retake'] })
    await expect(retake).toHaveCount(1)
    await expect(page.getByRole('button', { name: dict['result.home'] })).toHaveCount(1)

    // 다시 검사하기는 같은 검사의 실행 화면으로 간다
    await retake.click()
    await expect(page).toHaveURL(new RegExp(`/test/${c.testId}/run`))
    // 실행 화면이 실제로 그려졌다(문항 진행 표시)
    await expect(page.locator('main').first()).toBeVisible()

    expect(errors.list(), errors.format()).toEqual([])
  })
}

test('결과 화면(IQ 빠른판) — 추정 IQ·어림값 안내·영역별 점수·다시/공유/대결, 콘솔 에러 0', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  // TestRun: 빠른판은 셔플한 10문항 — 여기선 앞 10문항 중 앞 6개만 정답으로 답해 중간 점수를 만든다
  const items = IQ_ITEMS.slice(0, 10)
  const answers: Record<string, string | null> = {}
  items.forEach((it, i) => {
    answers[it.id] = i < 6 ? it.answer : null
  })
  const res = withDuration({ ...scoreIq(items, answers), iqMode: 'fast' as const })
  expect(res.iq).toBeDefined()
  expect(res.subscales.length).toBeGreaterThan(0)
  await seedOnboarded(page, { consent: CONSENT, results: [res] })

  await openResult(page, res.id)
  const persona = PERSONAS[res.persona]
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(persona.name.ko)
  await expect(page.getByText(persona.title.ko, { exact: true })).toHaveCount(1)
  // 히어로 칩: 'IQ 추정 점수 {iq}'
  await expect(page.getByText(`${dict['result.iqLabel']} ${res.iq}`, { exact: true }).first()).toBeVisible()
  // 빠른판 안내 — 오차가 더 크다는 것을 숨기지 않는다
  await expect(page.getByText('10문항으로 낸 어림값이라 오차가 더 커요')).toHaveCount(1)
  // 빠른판은 잠기지 않는다(블러 없음)
  expect(await page.locator('.blur-\\[7px\\]').count()).toBe(0)

  await expect(page.getByRole('heading', { name: dict['result.subscaleTitle'] })).toHaveCount(1)
  for (const s of res.subscales) {
    const label = dict[`sub.${s.key}`]
    expect(label, `sub.${s.key} 번역`).toBeTruthy()
    const row = page.locator('div.mb-1\\.5', { hasText: label }).filter({ hasText: `${s.score}/${s.max}` })
    expect(await row.count(), `서브스케일 행 ${s.key}`).toBeGreaterThan(0)
  }

  await expect(page.getByRole('button', { name: dict['share.card'] })).toHaveCount(1)
  await expect(page.getByRole('button', { name: /텍스트 공유/ })).toHaveCount(1)
  await expect(page.getByRole('button', { name: '친구와 결과 대결' })).toHaveCount(1)
  const retake = page.getByRole('button', { name: dict['result.retake'] })
  await expect(retake).toHaveCount(1)
  await retake.click()
  // 빠른판 재검사는 mode=pro 없이 빠른판으로
  await expect(page).toHaveURL(/\/test\/iq\/run$/)

  expect(errors.list(), errors.format()).toEqual([])
})

test('없는 결과 id(/result/없는id)는 흰 화면·크래시 없이 앱 안(홈)으로 돌아온다', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  await seedOnboarded(page, { consent: CONSENT, results: [] })
  await page.goto('/result/' + encodeURIComponent('없는id'))
  await waitForApp(page)

  // 흰 화면이 아니다: 홈이 그려졌고(하단 내비 존재) 결과 화면 요소는 없다
  expect(await page.getByRole('navigation').count(), '내비게이션 랜드마크가 있어야 한다').toBeGreaterThan(0)
  await expect(page.getByRole('navigation').first()).toBeVisible()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('button', { name: dict['result.retake'] })).toHaveCount(0)
  // 에러 경계 폴백이 아니다
  await expect(page.getByRole('alert').filter({ hasText: '불러오지 못했어요' })).toHaveCount(0)

  expect(errors.list(), errors.format()).toEqual([])
})

test('없는 결과 id — 안내 문구가 있어야 한다(조용한 리다이렉트는 사용자가 이유를 모른다)', async ({ page }) => {
  // TestResult.tsx: `if (!result) return <Navigate to="/" replace />` — 안내 없이 홈으로 보낸다.
  // 이 테스트는 '안내가 보이는가'를 그대로 묻는다. 앱이 안내를 안 주면 실패가 정상 — 앱 버그 의심으로 보고한다.
  await blockExternal(page)
  await seedOnboarded(page, { consent: CONSENT, results: [] })
  await page.goto('/result/' + encodeURIComponent('없는id'))
  await waitForApp(page)
  await expect(page.getByText(/결과를 찾을 수 없|없는 결과|찾지 못했|삭제된 결과|이 결과/).first()).toBeVisible({ timeout: 3_000 })
})
