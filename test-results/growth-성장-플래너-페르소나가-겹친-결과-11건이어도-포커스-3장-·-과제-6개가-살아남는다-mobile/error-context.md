# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: growth.spec.ts >> 성장 플래너 >> 페르소나가 겹친 결과 11건이어도 포커스 3장 · 과제 6개가 살아남는다
- Location: e2e\growth.spec.ts:65:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('main').locator('button[aria-pressed]')
Expected: 6
Received: 4
Timeout:  7000ms

Call log:
  - Expect "toHaveCount" with timeout 7000ms
  - waiting for locator('main').locator('button[aria-pressed]')
    18 × locator resolved to 4 elements
       - unexpected value "4"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - button "back" [ref=e7] [cursor=pointer]: ←
      - generic [ref=e8]: 성장 플랜
      - generic [ref=e9]:
        - button "💎 0 +" [ref=e10] [cursor=pointer]:
          - text: 💎
          - generic [ref=e11]: "0"
          - generic [ref=e12]: +
        - generic [ref=e13]:
          - text: 🪙
          - generic [ref=e14]: "500"
    - main [ref=e15]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - paragraph [ref=e19]: 🌱 성장 1일차
          - paragraph [ref=e20]:
            - text: "0"
            - generic [ref=e21]: / 4
        - paragraph [ref=e22]: 오늘의 실천
      - generic [ref=e25]:
        - heading "🎯 산만함" [level=2] [ref=e26]:
          - generic [ref=e27]: 🎯
          - text: 산만함
        - generic [ref=e28]:
          - button "✓ 상대의 애착 유형을 물어보세요 — 안정형의 언어가 만능은 아닙니다 매일" [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: ✓
            - generic [ref=e31]:
              - generic [ref=e32]: 상대의 애착 유형을 물어보세요 — 안정형의 언어가 만능은 아닙니다
              - generic [ref=e33]: 매일
          - button "✓ \"괜찮아?\"보다 \"어떻게 해주면 좋을까?\"가 한 수 위입니다 주 1회" [ref=e34] [cursor=pointer]:
            - generic [ref=e35]: ✓
            - generic [ref=e36]:
              - generic [ref=e37]: "\"괜찮아?\"보다 \"어떻게 해주면 좋을까?\"가 한 수 위입니다"
              - generic [ref=e38]: 주 1회
      - generic [ref=e40]:
        - heading "🔋 번아웃" [level=2] [ref=e41]:
          - generic [ref=e42]: 🔋
          - text: 번아웃
        - generic [ref=e43]:
          - button "✓ 월 1회 에너지 결산 — 이번 달 \"거절한 일\"이 0개면 경고등입니다 매일" [ref=e44] [cursor=pointer]:
            - generic [ref=e45]: ✓
            - generic [ref=e46]:
              - generic [ref=e47]: 월 1회 에너지 결산 — 이번 달 "거절한 일"이 0개면 경고등입니다
              - generic [ref=e48]: 매일
          - button "✓ 루틴에 의도적 공백 1칸 — 회복은 스케줄에 적어야 일어납니다 주 1회" [ref=e49] [cursor=pointer]:
            - generic [ref=e50]: ✓
            - generic [ref=e51]:
              - generic [ref=e52]: 루틴에 의도적 공백 1칸 — 회복은 스케줄에 적어야 일어납니다
              - generic [ref=e53]: 주 1회
      - generic [ref=e54]:
        - heading "📅 최근 4주 실천 기록" [level=2] [ref=e55]
        - generic [ref=e56]:
          - generic "2026-08-02 · 0" [ref=e57]
          - generic "2026-08-03 · 0" [ref=e58]
          - generic "2026-08-04 · 0" [ref=e59]
          - generic "2026-08-05 · 0" [ref=e60]
          - generic "2026-08-06 · 0" [ref=e61]
          - generic "2026-08-07 · 0" [ref=e62]
          - generic "2026-08-08 · 0" [ref=e63]
          - generic "2026-08-09 · 0" [ref=e64]
          - generic "2026-08-10 · 0" [ref=e65]
          - generic "2026-08-11 · 0" [ref=e66]
          - generic "2026-08-12 · 0" [ref=e67]
          - generic "2026-08-13 · 0" [ref=e68]
          - generic "2026-08-14 · 0" [ref=e69]
          - generic "2026-08-15 · 0" [ref=e70]
          - generic "2026-08-16 · 0" [ref=e71]
          - generic "2026-08-17 · 0" [ref=e72]
          - generic "2026-08-18 · 0" [ref=e73]
          - generic "2026-08-19 · 0" [ref=e74]
          - generic "2026-08-20 · 0" [ref=e75]
          - generic "2026-08-21 · 0" [ref=e76]
          - generic "2026-08-22 · 0" [ref=e77]
          - generic "2026-08-23 · 0" [ref=e78]
          - generic "2026-08-24 · 0" [ref=e79]
          - generic "2026-08-25 · 0" [ref=e80]
          - generic "2026-08-26 · 0" [ref=e81]
          - generic "2026-08-27 · 0" [ref=e82]
          - generic "2026-08-28 · 0" [ref=e83]
          - generic "2026-08-29 · 0" [ref=e84]
        - paragraph [ref=e85]: 진할수록 그날 실천이 많았어요
      - button "🔄 플랜 다시 만들기" [ref=e86] [cursor=pointer]
  - navigation:
    - generic [ref=e87]:
      - link "🏠 홈" [ref=e88] [cursor=pointer]:
        - /url: /
        - generic [ref=e89]: 🏠
        - generic [ref=e90]: 홈
      - link "🪙 리워드" [ref=e91] [cursor=pointer]:
        - /url: /rewards
        - generic [ref=e92]: 🪙
        - generic [ref=e93]: 리워드
      - link "💬 커뮤니티" [ref=e94] [cursor=pointer]:
        - /url: /community
        - generic [ref=e95]: 💬
        - generic [ref=e96]: 커뮤니티
      - link "🎁 상점" [ref=e97] [cursor=pointer]:
        - /url: /shop
        - generic [ref=e98]: 🎁
        - generic [ref=e99]: 상점
      - link "👤 프로필" [ref=e100] [cursor=pointer]:
        - /url: /profile
        - generic [ref=e101]: 👤
        - generic [ref=e102]: 프로필
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test'
  2   | import { LEGAL_VERSION } from '../src/data/legal'
  3   | import { STORE_KEY, allDeepResults, premiumUntil, seedOnboarded, todayKey, waitForApp } from './helpers'
  4   | 
  5   | /**
  6   |  * 🌱 성장 플래너(/growth) — 3상태 게이트(검사부족·페이월·플랜) + 과제 토글 경제 + 28일 히트맵.
  7   |  *
  8   |  * 핵심은 "포커스 3장 · 과제 6개"를 **숫자로** 못 박는 것. 페르소나가 겹치는 결과가 섞이면
  9   |  * buildFocuses의 중복제거(used)가 두 번째 카드의 과제를 전부 먹어 카드째 사라졌던 적이 있다
  10  |  * (pickFocusIds가 페르소나 중복을 건너뛰도록 고친 회귀). 카드 유무만 보면 그때도 초록이라
  11  |  * 개수 단언이 아니면 이 버그를 다시 놓친다.
  12  |  */
  13  | 
  14  | /** ReConsent는 z-100 전면 오버레이라 동의 버전이 어긋나면 이 화면의 모든 클릭이 가로막힌다 */
  15  | const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }
  16  | /** pickFocusIds가 needScore 랭킹 + 페르소나 중복 스킵으로 뽑는 결과 — (c)에서 실제로 검증한다 */
  17  | const FOCUS_IDS = ['adhd', 'burnout', 'selfesteem']
  18  | const HEAT_DAYS = 28
  19  | 
  20  | async function seedGrowth(page: Page, extra: Record<string, unknown>): Promise<void> {
  21  |   await seedOnboarded(page, { consent: CONSENT, ...extra })
  22  | }
  23  | 
  24  | /** 프로덕션 빌드엔 window.__store가 없다 — persist가 쓴 localStorage를 직접 읽어 잔액을 본다 */
  25  | async function readPoints(page: Page): Promise<number> {
  26  |   return page.evaluate((key) => {
  27  |     const raw = localStorage.getItem(key)
  28  |     return raw ? (JSON.parse(raw) as { state: { points: number } }).state.points : NaN
  29  |   }, STORE_KEY)
  30  | }
  31  | 
  32  | async function openGrowth(page: Page) {
  33  |   await page.goto('/growth')
  34  |   await waitForApp(page)
  35  |   return page.locator('main')
  36  | }
  37  | 
  38  | test.describe('성장 플래너', () => {
  39  |   test('검사가 3개 미만이면 프리미엄이어도 플랜을 만들 수 없다', async ({ page }) => {
  40  |     await seedGrowth(page, { results: allDeepResults().slice(0, 2), premiumUntil: premiumUntil() })
  41  |     const main = await openGrowth(page)
  42  | 
  43  |     // 게이트를 "안내 문구가 떴다"로만 보면 카운터가 고장나도 통과한다 — 실제로 센 (2/3)을 단언
  44  |     await expect(main).toContainText('(2/3)')
  45  |     await expect(main).toContainText('검사를 조금만 더 해주세요')
  46  |     // 프리미엄이어도 결과가 모자라면 생성 진입점 자체가 없어야 한다(게이트 순서 역전 방지)
  47  |     await expect(main.getByRole('button', { name: '내 성장 플랜 만들기' })).toHaveCount(0)
  48  |     await expect(main.getByRole('button', { name: '검사하러 가기' })).toBeVisible()
  49  |   })
  50  | 
  51  |   test('프리미엄이 아니면 생성 버튼 대신 페이월이 뜬다', async ({ page }) => {
  52  |     await seedGrowth(page, { results: allDeepResults(), premiumUntil: 0 })
  53  |     const main = await openGrowth(page)
  54  | 
  55  |     await expect(main).toContainText('프리미엄에서 열려요')
  56  |     // 버튼이 남아 있으면 무료 사용자가 유료 기능을 그대로 만들 수 있다 — 존재 자체가 회귀
  57  |     await expect(main.getByRole('button', { name: '내 성장 플랜 만들기' })).toHaveCount(0)
  58  |     await expect(page).toHaveURL(/\/growth$/)
  59  | 
  60  |     // 페이월 카드가 죽으면 결제 유입이 통째로 끊긴다 — 이동까지 확인
  61  |     await main.getByRole('button', { name: '프리미엄 시작' }).click()
  62  |     await expect(page).toHaveURL(/\/premium$/)
  63  |   })
  64  | 
  65  |   test('페르소나가 겹친 결과 11건이어도 포커스 3장 · 과제 6개가 살아남는다', async ({ page }) => {
  66  |     await seedGrowth(page, { results: allDeepResults(), premiumUntil: premiumUntil() })
  67  |     const main = await openGrowth(page)
  68  | 
  69  |     await main.getByRole('button', { name: '내 성장 플랜 만들기' }).click()
  70  | 
  71  |     // ⭐ 회귀 본체: 11건 중 penguin(adhd·dark)·koala·cat·dolphin·owl이 중복되는데도 6개가 나와야 한다.
  72  |     //    aria-pressed는 이 화면에서 과제 체크박스 버튼에만 붙는다.
  73  |     const tasks = main.locator('button[aria-pressed]')
> 74  |     await expect(tasks).toHaveCount(6)
      |                         ^ Error: expect(locator).toHaveCount(expected) failed
  75  |     // 카드 하나가 통째로 날아가면 총수(6)는 4가 되고, 매일/주간 비율(3:3)도 함께 깨진다
  76  |     await expect(main.getByText('매일', { exact: true })).toHaveCount(3)
  77  |     await expect(main.getByText('주 1회', { exact: true })).toHaveCount(3)
  78  |     // 진행 헤더의 분모는 allTasks.length를 그대로 쓴다 — 카드 손실이 여기서도 드러나는 2차 방어선
  79  |     await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('0 / 6')
  80  | 
  81  |     // needScore(위험형 high / 강점형 low = 3점) 랭킹 결과. dark는 adhd와 penguin이 겹쳐 탈락한다
  82  |     await expect(main).toContainText('산만함')
  83  |     await expect(main).toContainText('번아웃')
  84  |     await expect(main).toContainText('자존감')
  85  | 
  86  |     // 처방 문구는 페르소나 단위라 tasksFor의 used 중복제거가 풀리면 같은 문장이 두 카드에 걸린다.
  87  |     // 위 단언들이 모두 정착한 뒤라 DOM은 이미 안정 상태다.
  88  |     const titles = await tasks.allInnerTexts()
  89  |     expect(new Set(titles).size).toBe(6)
  90  |   })
  91  | 
  92  |   test('과제 체크는 +5P, 다시 눌러 해제해도 재지급·환불이 없다', async ({ page }) => {
  93  |     // 생성 경로는 위 테스트가 지킨다 — 여기선 토글 경제만 보려고 플랜을 직접 심는다
  94  |     await seedGrowth(page, {
  95  |       results: allDeepResults(),
  96  |       premiumUntil: premiumUntil(),
  97  |       growthPlanAt: Date.now() - 1000,
  98  |       growthFocusIds: FOCUS_IDS,
  99  |     })
  100 |     const main = await openGrowth(page)
  101 |     const today = todayKey()
  102 | 
  103 |     const first = main.locator('button[aria-pressed]').first()
  104 |     await expect(first).toHaveAttribute('aria-pressed', 'false')
  105 |     const before = await readPoints(page)
  106 | 
  107 |     await first.click()
  108 |     await expect(first).toHaveAttribute('aria-pressed', 'true')
  109 |     await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('1 / 6')
  110 |     // 히트맵은 growthDone을 날짜별로 합산한다 — 오늘 칸이 안 오르면 완료 기록이 KST 키로 안 들어간 것
  111 |     await expect(main.locator(`div[title="${today} · 1"]`)).toBeVisible()
  112 |     await expect.poll(() => readPoints(page)).toBe(before + 5)
  113 | 
  114 |     await first.click()
  115 |     await expect(first).toHaveAttribute('aria-pressed', 'false')
  116 |     await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('0 / 6')
  117 |     await expect(main.locator(`div[title="${today} · 0"]`)).toBeVisible()
  118 |     // 해제는 무보상·무환불이 규칙. +10이면 매 클릭 지급(무한 적립), +0이면 체크가 되돌려진 것
  119 |     await expect.poll(() => readPoints(page)).toBe(before + 5)
  120 |   })
  121 | 
  122 |   test('28일 히트맵은 칸 28개이고 하루 완료 개수를 합산해 보여준다', async ({ page }) => {
  123 |     const today = todayKey()
  124 |     await seedGrowth(page, {
  125 |       results: allDeepResults(),
  126 |       premiumUntil: premiumUntil(),
  127 |       growthPlanAt: Date.now() - 1000,
  128 |       growthFocusIds: FOCUS_IDS,
  129 |       // 매일 2 + 주간 1 — 주간 과제도 이번 주면 완료로 세어야 한다(weekKeyOfDay)
  130 |       growthDone: { 'adhd:0': [today], 'adhd:1': [today], 'burnout:0': [today] },
  131 |     })
  132 |     const main = await openGrowth(page)
  133 | 
  134 |     await expect(main).toContainText('최근 4주 실천 기록')
  135 |     // title이 붙는 건 히트맵 칸뿐 — DAYS 상수가 흔들리면(4주≠28칸) 여기서 잡힌다
  136 |     await expect(main.locator('div[title]')).toHaveCount(HEAT_DAYS)
  137 |     // 세 과제가 한 칸으로 합산돼야 3 — 과제별로 칸이 갈라지거나 중복 카운트되면 값이 어긋난다
  138 |     await expect(main.locator(`div[title="${today} · 3"]`)).toBeVisible()
  139 |     await expect(main.locator('p').filter({ hasText: /^\d+ \/ \d+$/ })).toHaveText('3 / 6')
  140 |   })
  141 | })
  142 | 
```