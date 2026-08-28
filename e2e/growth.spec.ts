import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { STORE_KEY, allDeepResults, premiumUntil, seedOnboarded, waitForApp } from './helpers'

/**
 * 🌱 성장 플래너(/growth) — 3상태 게이트(검사부족·페이월·플랜) + 과제 토글 경제 + 28일 히트맵.
 *
 * 핵심은 "포커스 3장 · 과제 6개"를 **숫자로** 못 박는 것. 페르소나가 겹치는 결과가 섞이면
 * buildFocuses의 중복제거(used)가 두 번째 카드의 과제를 전부 먹어 카드째 사라졌던 적이 있다
 * (pickFocusIds가 페르소나 중복을 건너뛰도록 고친 회귀). 카드 유무만 보면 그때도 초록이라
 * 개수 단언이 아니면 이 버그를 다시 놓친다.
 */

/** ReConsent는 z-100 전면 오버레이라 동의 버전이 어긋나면 이 화면의 모든 클릭이 가로막힌다 */
const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }
/** pickFocusIds가 needScore 랭킹 + 페르소나 중복 스킵으로 뽑는 결과 — (c)에서 실제로 검증한다 */
const FOCUS_IDS = ['adhd', 'burnout', 'selfesteem']
const HEAT_DAYS = 28

/**
 * 날짜 키는 **브라우저 타임존(playwright.config의 Asia/Seoul)** 으로 만들어야 한다.
 * 러너(Node)의 로컬 타임존으로 만들면 KST가 아닌 머신(CI=UTC)에서 하루가 통째로 어긋나
 * 히트맵·완료 판정 단언이 매일 9시간씩 깨진다. helpers.todayKey는 러너 로컬이라 여기선 안 쓴다.
 */
function kstDay(offsetDays = 0): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
    new Date(Date.now() - offsetDays * 86_400_000),
  )
}

/**
 * 같은 주(월요일 시작) 안의 '오늘이 아닌' 하루 — 오늘이 월요일이면 화요일.
 * 주간 과제를 오늘 날짜로 심으면 isTaskDone이 daily로 퇴화해도 통과한다(주 단위 판정을 못 본다).
 */
function otherDayInSameWeek(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const dow = (dt.getUTCDay() + 6) % 7 // 월=0
  dt.setUTCDate(dt.getUTCDate() + (dow === 0 ? 1 : -dow))
  return dt.toISOString().slice(0, 10)
}

async function seedGrowth(page: Page, extra: Record<string, unknown>): Promise<void> {
  await seedOnboarded(page, { consent: CONSENT, ...extra })
}

/** 프로덕션 빌드엔 window.__store가 없다 — persist가 쓴 localStorage를 직접 읽어 잔액을 본다 */
async function readPoints(page: Page): Promise<number> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as { state: { points: number } }).state.points : NaN
  }, STORE_KEY)
}

async function openGrowth(page: Page) {
  await page.goto('/growth')
  await waitForApp(page)
  return page.locator('main')
}

test.describe('성장 플래너', () => {
  test('검사가 3개 미만이면 프리미엄이어도 플랜을 만들 수 없다', async ({ page }) => {
    await seedGrowth(page, { results: allDeepResults().slice(0, 2), premiumUntil: premiumUntil() })
    const main = await openGrowth(page)

    // 게이트를 "안내 문구가 떴다"로만 보면 카운터가 고장나도 통과한다 — 실제로 센 (2/3)을 단언
    await expect(main).toContainText('(2/3)')
    await expect(main).toContainText('검사를 조금만 더 해주세요')
    // 프리미엄이어도 결과가 모자라면 생성 진입점 자체가 없어야 한다(게이트 순서 역전 방지)
    await expect(main.getByRole('button', { name: '내 성장 플랜 만들기' })).toHaveCount(0)
    await expect(main.getByRole('button', { name: '검사하러 가기' })).toBeVisible()
  })

  test('검사가 모자라면 비프리미엄이어도 페이월이 아니라 검사 유도 화면이 뜬다', async ({ page }) => {
    // 게이트 순서를 못 박는다: '검사 부족'이 '프리미엄 여부'보다 먼저다.
    // 순서가 뒤집히면 아직 아무것도 안 해본 사람에게 결제부터 들이밀게 되고,
    // 페이월 노출 계측의 분모도 그만큼 부풀어 전환율이 실제보다 나빠 보인다.
    // (계측 자체는 브라우저에서 관측할 수 없다 — track()이 localhost에서 analyticsEnabled()로
    //  먼저 빠져나가기 때문. 그래서 계측과 렌더가 같은 showPaywall 값을 쓰도록 코드에서 묶었고,
    //  여기서는 그 값이 좌우하는 '화면'을 검증한다.)
    await seedGrowth(page, { results: allDeepResults().slice(0, 2), premiumUntil: 0 })
    const main = await openGrowth(page)

    await expect(main).toContainText('(2/3)')
    await expect(main.getByText('프리미엄에서 열려요')).toHaveCount(0)
    await expect(main.getByRole('button', { name: '내 성장 플랜 만들기' })).toHaveCount(0)
  })

  test('프리미엄이 아니면 생성 버튼 대신 페이월이 뜬다', async ({ page }) => {
    await seedGrowth(page, { results: allDeepResults(), premiumUntil: 0 })
    const main = await openGrowth(page)

    await expect(main).toContainText('프리미엄에서 열려요')
    // 버튼이 남아 있으면 무료 사용자가 유료 기능을 그대로 만들 수 있다 — 존재 자체가 회귀
    await expect(main.getByRole('button', { name: '내 성장 플랜 만들기' })).toHaveCount(0)
    await expect(page).toHaveURL(/\/growth$/)

    // 페이월 카드가 죽으면 결제 유입이 통째로 끊긴다 — 이동까지 확인
    await main.getByRole('button', { name: '프리미엄 시작' }).click()
    await expect(page).toHaveURL(/\/premium$/)
    // URL만 보면 라우트가 죽어 빈 화면이 떠도 통과한다 — 결제 화면이 실제로 그려졌는지까지
    // (Premium 페이지엔 <main>이 없어 main 스코프로 보면 안 된다)
    await expect(page.getByRole('heading', { name: '누리 마인드 프리미엄' })).toBeVisible()
  })

  test('페르소나가 겹친 결과 11건이어도 포커스 3장 · 과제 6개가 살아남는다', async ({ page }) => {
    await seedGrowth(page, { results: allDeepResults(), premiumUntil: premiumUntil() })
    const main = await openGrowth(page)

    await main.getByRole('button', { name: '내 성장 플랜 만들기' }).click()

    // ⭐ 회귀 본체: 11건 중 penguin(adhd·dark)·koala·cat·dolphin·owl이 중복되는데도 6개가 나와야 한다.
    //    aria-pressed는 이 화면에서 과제 체크박스 버튼에만 붙는다.
    const tasks = main.locator('button[aria-pressed]')
    await expect(tasks).toHaveCount(6)
    // 카드 하나가 통째로 날아가면 총수(6)는 4가 되고, 매일/주간 비율(3:3)도 함께 깨진다
    await expect(main.getByText('매일', { exact: true })).toHaveCount(3)
    await expect(main.getByText('주 1회', { exact: true })).toHaveCount(3)
    // 진행 헤더의 분모는 allTasks.length를 그대로 쓴다 — 카드 손실이 여기서도 드러나는 2차 방어선
    await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('0 / 6')

    // needScore(위험형 high / 강점형 low = 3점) 랭킹 결과. dark는 adhd와 penguin이 겹쳐 탈락한다
    await expect(main).toContainText('산만함')
    await expect(main).toContainText('번아웃')
    await expect(main).toContainText('자존감')

    // 처방 문구는 페르소나 단위라 tasksFor의 used 중복제거가 풀리면 같은 문장이 두 카드에 걸린다.
    // 위 단언들이 모두 정착한 뒤라 DOM은 이미 안정 상태다.
    const titles = await tasks.allInnerTexts()
    expect(new Set(titles).size).toBe(6)
  })

  test('과제 체크는 +5P, 다시 눌러 해제해도 재지급·환불이 없다', async ({ page }) => {
    // 생성 경로는 위 테스트가 지킨다 — 여기선 토글 경제만 보려고 플랜을 직접 심는다
    await seedGrowth(page, {
      results: allDeepResults(),
      premiumUntil: premiumUntil(),
      growthPlanAt: Date.now() - 1000,
      growthFocusIds: FOCUS_IDS,
    })
    const main = await openGrowth(page)
    const today = kstDay()

    const first = main.locator('button[aria-pressed]').first()
    await expect(first).toHaveAttribute('aria-pressed', 'false')
    const before = await readPoints(page)

    await first.click()
    await expect(first).toHaveAttribute('aria-pressed', 'true')
    await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('1 / 6')
    // 히트맵은 growthDone을 날짜별로 합산한다 — 오늘 칸이 안 오르면 완료 기록이 KST 키로 안 들어간 것
    await expect(main.locator(`div[title="${today} · 1"]`)).toBeVisible()
    await expect.poll(() => readPoints(page)).toBe(before + 5)

    await first.click()
    await expect(first).toHaveAttribute('aria-pressed', 'false')
    await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('0 / 6')
    await expect(main.locator(`div[title="${today} · 0"]`)).toBeVisible()
    // 해제는 무보상·무환불이 규칙. +10이면 매 클릭 지급(무한 적립), +0이면 체크가 되돌려진 것
    await expect.poll(() => readPoints(page)).toBe(before + 5)
  })

  test('28일 히트맵은 칸 28개로 합산되고, 주간 과제는 주 단위로 판정된다', async ({ page }) => {
    const today = kstDay()
    const sameWeek = otherDayInSameWeek(today) // 이번 주 · 오늘 아닌 날
    const lastWeek = kstDay(7) // 항상 지난주
    await seedGrowth(page, {
      results: allDeepResults(),
      premiumUntil: premiumUntil(),
      growthPlanAt: Date.now() - 1000,
      growthFocusIds: FOCUS_IDS,
      // 매일 3건은 오늘(히트맵 합산용). 주간 2건은 날짜를 갈라 weekKeyOfDay를 실제로 가른다 —
      // 예전처럼 주간 과제까지 '오늘'로 심으면 daily로 퇴화한 구현도 그대로 통과했다.
      growthDone: {
        'adhd:0': [today],
        'burnout:0': [today],
        'selfesteem:0': [today],
        'adhd:1': [sameWeek],
        'burnout:1': [lastWeek],
      },
    })
    const main = await openGrowth(page)

    await expect(main).toContainText('최근 4주 실천 기록')
    // title이 붙는 건 히트맵 칸뿐 — DAYS 상수가 흔들리면(4주≠28칸) 여기서 잡힌다
    await expect(main.locator('div[title]')).toHaveCount(HEAT_DAYS)
    // 세 과제가 한 칸으로 합산돼야 3 — 과제별로 칸이 갈라지거나 중복 카운트되면 값이 어긋난다
    await expect(main.locator(`div[title="${today} · 3"]`)).toBeVisible()
    // 매일 3 + 이번 주 주간 1 = 4. 주간이 '오늘'로 좁아지면 3, 날짜를 아예 무시하면 5가 된다
    await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('4 / 6')
    // 지난주 완료는 이번 주 체크를 켜면 안 된다(burnout 카드의 주간 과제 = 6개 중 4번째)
    await expect(main.locator('button[aria-pressed]').nth(3)).toHaveAttribute('aria-pressed', 'false')
  })
})
