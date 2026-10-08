import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { QUICK_TESTS } from '../src/data/quick'
import { STORE_KEY, premiumUntil, seedOnboarded, seedStore, waitForApp } from './helpers'
import { blockExternal, collectConsoleErrors } from './core-flows-helpers'

/**
 * 핵심 흐름 E2E — 지금까지 공백이던 5곳.
 *   ① /quick/:id 완주 → 결과 카드 → '다시 하기'
 *   ② 인지검사 상태 전이(속도·기억): 안내 → 본 측정 진입 → 측정 중 '중단' 시트
 *   ③ /fortune: 생일 입력 → 오늘의 운세, 서버 AI 실패 → 결정론 풀이 + '다시 시도'
 *   ④ 매거진 목록 → 글 → '다 읽었어요' 보상, 두 번째엔 포인트 불변
 *   ⑤ 404
 * (결과 화면 /result/:rid 와 없는 결과 id는 result-page.spec.ts)
 *
 * 타이밍(ms 단위 정확도)은 보지 않는다 — 화면 상태가 전이되는지만 본다.
 */

const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }

async function readState(page: Page): Promise<Record<string, any>> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').state ?? {}, STORE_KEY)
}

/* ───────────────────────── ① 빠른 검사 ───────────────────────── */

test('빠른 검사(lovestyle) — 4문항 완주 → 결과 카드 → 다시 하기로 처음부터', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  await seedOnboarded(page, { consent: CONSENT })

  const quiz = QUICK_TESTS.find((q) => q.id === 'lovestyle')!
  expect(quiz.questions.length).toBe(4)
  await page.goto('/quick/lovestyle')
  await waitForApp(page)

  // 매 문항: 제목이 보이는 것을 확인한 뒤 첫 보기를 고른다(= 모두 'rush' 투표 → 직진 로켓)
  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i]
    await expect(page.getByRole('heading', { level: 1, name: q.text.ko })).toBeVisible()
    await expect(page.getByText(`${i + 1} / ${quiz.questions.length}`, { exact: true })).toBeVisible()
    const opt = page.getByRole('button', { name: q.options[0].text.ko, exact: true })
    await expect(opt).toHaveCount(1)
    await opt.click()
  }

  // 결과 카드
  const winner = quiz.results.find((r) => r.key === 'rush')!
  await expect(page.getByRole('heading', { level: 1, name: winner.name.ko })).toBeVisible()
  await expect(page.getByText(winner.tag.ko)).toHaveCount(1)
  await expect(page.getByText(winner.desc.ko)).toHaveCount(1)
  await expect(page.getByRole('button', { name: '이미지 카드 저장' })).toHaveCount(1)
  await expect(page.getByRole('button', { name: '친구와 대결' })).toHaveCount(1)
  const again = page.getByRole('button', { name: '다시 하기', exact: true })
  await expect(again).toHaveCount(1)

  // 다시 하기 → 첫 문항으로, 결과 카드는 사라진다
  await again.click()
  await expect(page.getByRole('heading', { level: 1, name: quiz.questions[0].text.ko })).toBeVisible()
  await expect(page.getByText(`1 / ${quiz.questions.length}`, { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: winner.name.ko })).toHaveCount(0)

  // 두 번째 판은 다른 보기(마지막 보기)로 → 다른 결과가 나온다(이전 투표가 남아 있지 않다는 증거)
  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i]
    await expect(page.getByRole('heading', { level: 1, name: q.text.ko })).toBeVisible()
    await page.getByRole('button', { name: q.options[3].text.ko, exact: true }).click()
  }
  const winner2 = quiz.results.find((r) => r.key === 'careful')!
  await expect(page.getByRole('heading', { level: 1, name: winner2.name.ko })).toBeVisible()

  expect(errors.list(), errors.format()).toEqual([])
})

/* ───────────────────────── ② 인지검사 상태 전이 ───────────────────────── */

test('처리속도 검사 — 안내(대응표) → 본 측정 진입 → 측정 중 중단 시트(계속/중단)', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  await seedOnboarded(page, { consent: CONSENT, results: [] })
  await page.goto('/speed/run')
  await waitForApp(page)

  // 안내 단계: 대응표 + 시작 버튼, 키패드는 아직 없다
  await expect(page.getByRole('heading', { name: '대응표를 외워두세요' })).toBeVisible()
  const start = page.getByRole('button', { name: /시작하기/ })
  await expect(start).toHaveCount(1)
  await expect(page.getByText('이 기호의 숫자는?')).toHaveCount(0)

  // 본 측정 진입
  await start.click()
  await expect(page.getByText('이 기호의 숫자는?')).toBeVisible()
  await expect(page.getByRole('heading', { name: '대응표를 외워두세요' })).toHaveCount(0)
  for (let d = 1; d <= 9; d++) await expect(page.getByRole('button', { name: String(d), exact: true })).toHaveCount(1)
  await expect(page.getByText('0/40', { exact: true })).toBeVisible()

  // 한 번 누르면 진행이 1칸 간다(정오와 무관)
  await page.getByRole('button', { name: '5', exact: true }).click()
  await expect(page.getByText('1/40', { exact: true })).toBeVisible()

  // 측정 중 ✕ → 중단 확인 시트
  const quit = page.getByRole('button', { name: '검사 중단' })
  await expect(quit).toHaveCount(1)
  await quit.click()
  await expect(page.getByRole('heading', { name: '검사를 중단할까요?' })).toBeVisible()
  await expect(page.getByText('지금까지의 기록은 저장되지 않아요.')).toBeVisible()

  // 계속하기 → 시트가 닫히고 측정 화면·진행 상태가 그대로
  await page.getByRole('button', { name: '계속하기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '검사를 중단할까요?' })).toHaveCount(0)
  await expect(page.getByText('이 기호의 숫자는?')).toBeVisible()
  await expect(page.getByText('1/40', { exact: true })).toBeVisible()

  // 다시 열어 중단하기 → 검사 소개로 나가고 결과는 저장되지 않는다
  await page.getByRole('button', { name: '검사 중단' }).click()
  await page.getByRole('button', { name: '중단하기', exact: true }).click()
  await expect(page).toHaveURL(/\/test\/speed$/)
  expect(((await readState(page)).results ?? []).length).toBe(0)

  expect(errors.list(), errors.format()).toEqual([])
})

test('기억 검사 — 준비 → 제시 → 회상 전이, 제시 중 중단 시트에서 계속하면 회상까지 간다, 중단하면 저장 없이 나간다', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  await seedOnboarded(page, { consent: CONSENT, results: [] })
  await page.goto('/memory/run')
  await waitForApp(page)

  // 준비 → 제시
  await expect(page.getByText(/자리 숫자를 기억하세요/)).toBeVisible()
  await expect(page.getByText('눈으로 따라가며 외우세요')).toBeVisible({ timeout: 10_000 })

  // 제시(측정) 중 ✕ → 시트
  const quit = page.getByRole('button', { name: '검사 중단' })
  await expect(quit).toHaveCount(1)
  await quit.click()
  await expect(page.getByRole('heading', { name: '검사를 중단할까요?' })).toBeVisible()
  // 계속하기 → 시트가 닫히고 수열을 처음부터 다시 보여 준 뒤 회상 단계로 간다
  await page.getByRole('button', { name: '계속하기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '검사를 중단할까요?' })).toHaveCount(0)
  await expect(page.getByText('본 순서대로 입력하세요')).toBeVisible({ timeout: 20_000 })

  // 회상: 키패드로 한 자리 입력하면 확인은 아직 잠겨 있다(자릿수가 모자란다)
  await expect(page.getByRole('button', { name: '확인', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: '1', exact: true }).click()
  await expect(page.getByRole('button', { name: '지우기' })).toBeEnabled()

  // 중단하기 → 검사 소개로, 결과 저장 없음
  await page.getByRole('button', { name: '검사 중단' }).click()
  await page.getByRole('button', { name: '중단하기', exact: true }).click()
  await expect(page).toHaveURL(/\/test\/memory$/)
  expect(((await readState(page)).results ?? []).length).toBe(0)

  expect(errors.list(), errors.format()).toEqual([])
})

/* ───────────────────────── ③ 오늘의 운세 ───────────────────────── */

const AI_OK = {
  detail: {
    morning: 'E2E-아침 풀이',
    noon: 'E2E-낮 풀이',
    evening: 'E2E-저녁 풀이',
    luckyTime: '오후 3시',
    place: 'E2E-장소',
    item: 'E2E-아이템',
    food: 'E2E-음식',
    caution: 'E2E-주의',
    advice: 'E2E-조언',
    relation: 'E2E-관계',
    work: 'E2E-일',
    wealth: 'E2E-재물',
    health: 'E2E-건강',
    summary: 'E2E-요약',
  },
}

test('운세 — 생일 입력 → 오늘의 운세, 서버 AI가 실패하면 결정론 풀이 + 다시 시도, 다시 시도로 AI 풀이가 붙는다', async ({ page }) => {
  // fortune-detail 호출 결과만 의도적으로 실패시킨다 — 그 줄의 'Failed to load resource'는 제외
  const errors = collectConsoleErrors(page, /fortune-detail/)
  await blockExternal(page)

  let mode: 'fail' | 'ok' = 'fail'
  let posts = 0
  const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' }
  await page.route('**/functions/v1/fortune-detail', async (route) => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    posts++
    if (mode === 'fail') return route.fulfill({ status: 500, headers: CORS, contentType: 'application/json', body: '{"error":"boom"}' })
    return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(AI_OK) })
  })

  // 프리미엄이면 상세 풀이가 열려 있어 AI 호출이 자동으로 나간다
  await seedOnboarded(page, { consent: CONSENT, premiumUntil: premiumUntil() })
  await page.goto('/fortune')
  const see = page.getByRole('button', { name: '오늘의 운세 보기', exact: true })
  await expect(see).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('fortune-result')).toHaveCount(0)

  // 생일 입력 (양력) + 성별
  await page.getByLabel('년', { exact: true }).selectOption('1990')
  await page.getByLabel('월', { exact: true }).selectOption('3')
  await page.getByLabel('일', { exact: true }).selectOption('15')
  await page.getByRole('button', { name: '여성', exact: true }).click()
  await see.click()

  // 오늘의 운세가 나온다
  const result = page.getByTestId('fortune-result')
  await expect(result).toBeVisible()
  await expect(result.getByText('총운').first()).toBeVisible()
  await expect(page.getByTestId('fortune-pillars')).toBeVisible()

  // 서버 AI 실패 → 실패 안내 + '다시 시도' (결정론 풀이는 그대로 읽힌다)
  const failed = page.getByTestId('fortune-ai-failed')
  await expect(failed).toBeVisible({ timeout: 15_000 })
  await expect(failed).toContainText('AI 풀이를 불러오지 못했어요')
  const retry = failed.getByRole('button', { name: '다시 시도', exact: true })
  await expect(retry).toHaveCount(1)
  expect(posts).toBe(1)
  const detailHeading = page.getByRole('heading', { name: '시간대별 운세' })
  await expect(detailHeading).toBeVisible()
  // 잠금(aria-hidden 블러) 안에 있지 않다 — 열려서 읽힌다
  expect(await page.locator('[aria-hidden="true"]').filter({ has: page.getByRole('heading', { name: '시간대별 운세' }) }).count()).toBe(0)
  await expect(page.getByText('E2E-아침 풀이')).toHaveCount(0) // 아직 AI 풀이는 없다

  // 서버가 살아난 뒤 다시 시도 → 다시 요청이 나가고 AI 맞춤 풀이로 바뀐다
  mode = 'ok'
  await retry.click()
  await expect(page.getByText('E2E-아침 풀이')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('fortune-ai-failed')).toHaveCount(0)
  await expect(page.getByText('AI 맞춤').first()).toBeVisible()
  expect(posts).toBe(2)

  expect(errors.list(), errors.format()).toEqual([])
})

/* ───────────────────────── ④ 매거진 ───────────────────────── */

const ARTICLE = 'adhd-focus'
const claimBtn = (page: Page) => page.getByRole('button', { name: /다 읽었어요/ })

test('매거진 — 목록 → 글 → 다 읽었어요 보상 +8, 다시 열어도 포인트 불변(중복 지급 없음)', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedOnboarded(page, { consent: CONSENT, points: 500, readArticles: [], paidKeys: [], ledger: [] })

  await page.goto('/magazine')
  await waitForApp(page)
  const link = page.locator(`a[href="/magazine/${ARTICLE}"]`)
  expect(await link.count(), '매거진 목록에 대상 글 링크가 있어야 한다').toBe(1)
  await link.click()
  await expect(page).toHaveURL(new RegExp(`/magazine/${ARTICLE}$`))
  await expect(page.getByRole('heading', { level: 1, name: '집중력이 약한 게 아니라, 뇌가 다른 거예요' })).toBeVisible()

  // 읽기 전: 보상 버튼 활성
  const btn = claimBtn(page)
  await expect(btn).toHaveCount(1)
  await expect(btn).toBeEnabled()
  expect((await readState(page)).points).toBe(500)

  await btn.click()
  // 상태 단언(토스트·애니메이션이 아니라 저장된 값)
  await expect.poll(async () => (await readState(page)).points).toBe(508)
  const s1 = await readState(page)
  expect(s1.readArticles).toEqual([ARTICLE])
  expect(s1.paidKeys).toContain(`read:${ARTICLE}`)
  expect((s1.ledger as any[]).filter((e) => e.memo.includes('매거진 정독')).length).toBe(1)
  await expect(page.getByRole('button', { name: '읽기 완료 ✓' })).toBeDisabled()

  // 같은 글을 다시 연다. page.reload()는 시드를 다시 심으므로 시드 없는 새 탭으로 확인한다.
  const page2 = await page.context().newPage()
  await blockExternal(page2)
  await page2.goto(`/magazine/${ARTICLE}`)
  await waitForApp(page2)
  const again = page2.getByRole('button', { name: '읽기 완료 ✓' })
  await expect(again).toHaveCount(1)
  await expect(again).toBeDisabled()
  await expect(claimBtn(page2)).toHaveCount(0)
  // 강제로 눌러도 지급되지 않는다
  await again.click({ force: true, trial: false }).catch(() => undefined)
  const s2 = await readState(page2)
  expect(s2.points).toBe(508)
  expect((s2.ledger as any[]).filter((e) => e.memo.includes('매거진 정독')).length).toBe(1)
  expect(s2.readArticles).toEqual([ARTICLE])

  // 목록에서는 읽은 글에 ✓ 배지
  await page2.goto('/magazine')
  await expect(page2.locator(`a[href="/magazine/${ARTICLE}"]`)).toContainText('✓')
  await page2.close()

  expect(errors.list(), errors.format()).toEqual([])
})

test('매거진 — 가입(동의) 전에는 글을 읽어도 포인트·원장이 생기지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  await seedStore(page, { onboarded: false, lang: 'ko', points: 300, readArticles: [], paidKeys: [], ledger: [] })
  await page.goto(`/magazine/${ARTICLE}`)
  await waitForApp(page)
  const btn = claimBtn(page)
  await expect(btn).toHaveCount(1)
  await btn.click()
  // 클릭이 처리됐다는 신호는 가입 안내(받은 것처럼 보이는 '읽기 완료'로 바뀌지 않는다) — 그런 뒤에도 원장은 비어 있어야 한다
  await expect(page.getByText('시작하기를 마치면 정독 보상').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '읽기 완료 ✓' })).toHaveCount(0)
  const s = await readState(page)
  expect(s.points).toBe(300)
  expect(s.ledger ?? []).toEqual([])
  expect(s.paidKeys ?? []).toEqual([])
  expect(errors.list(), errors.format()).toEqual([])
})

/* ───────────────────────── ⑤ 404 ───────────────────────── */

test('404 — 없는 주소는 안내 페이지(콘솔 에러 0), 뒤로 가기·홈으로 버튼이 앱 안으로 돌려보낸다', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await blockExternal(page)
  await seedOnboarded(page, { consent: CONSENT })
  await page.goto('/no/such/page/' + encodeURIComponent('한글경로'))
  await waitForApp(page)

  await expect(page.getByRole('heading', { name: '이 주소엔 아무것도 없어요' })).toBeVisible()
  await expect(page.getByText('주소가 바뀌었거나 잘못 입력됐을 수 있어요.')).toHaveCount(1)
  const back = page.getByRole('button', { name: '뒤로 가기' })
  const home = page.getByRole('button', { name: '홈으로' })
  await expect(back).toHaveCount(1)
  await expect(home).toHaveCount(1)

  // 공유 링크로 바로 들어온 경우 — 앱 안에 돌아갈 곳이 없어 홈으로 간다(앱을 떠나지 않는다)
  await back.click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '이 주소엔 아무것도 없어요' })).toHaveCount(0)

  expect(errors.list(), errors.format()).toEqual([])
})
