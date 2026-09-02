import { expect, test, type Page } from '@playwright/test'
import { STORE_KEY, seedStore, waitForApp } from './helpers'
import { LEGAL_VERSION } from '../src/data/legal'

/**
 * 온보딩(가입) — 앱의 유일한 입구이자, 깨지면 신규 유입이 통째로 0이 되는 구간.
 *
 * 이 스펙의 존재 이유는 "약관 열람 → 폼 리셋" 회귀다. 과거 필수 동의 약관을
 * /legal/* 라우트로 열었더니 App의 온보딩 분기가 다른 트리로 교체되며 Onboarding이
 * 언마운트 → 닉네임·캐릭터·동의 체크가 통째로 날아갔다. LegalSheet(시트)로 바꿔 구조를
 * 없앴지만, 링크 한 줄만 nav()로 되돌려도 조용히 재발한다. 그래서 "URL이 안 바뀐다"를
 * 눈에 보이는 단언으로 박아둔다.
 *
 * 프로덕션 빌드(vite preview)라 window.__store가 없다 — 상태는 localStorage로만 심고 읽는다.
 */

/** 커뮤니티 시드 닉·전광판 닉('누리','민지','하늘')과 겹치지 않는 값 — getByText 오탐 방지 */
const NICK = '테스트누리'
const NICK_PH = '닉네임을 입력해 주세요'
const START = '시작하고 100P 받기'
/** 동의 체크박스의 접근명 = t('onboard.terms') + ' ' + t('onboard.agreeReq'). 본문 '이용약관' 링크와 반드시 exact로 구분한다 */
const AGREE = '이용약관 (필수)'

/** persist가 실제로 기록한 상태 — dev 뒷문이 없는 프로덕션에선 저장소가 유일한 관측점이다 */
async function persisted(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    return raw ? ((JSON.parse(raw).state ?? {}) as Record<string, unknown>) : {}
  }, STORE_KEY)
}

test.describe('온보딩 · 약관 시트 · 초안 보존', () => {
  test.beforeEach(async ({ page }) => {
    // ⚠️ 광고를 끊지 않으면 저장소 단언이 통째로 무의미해진다.
    // 이 빌드는 AdSense가 실제로 붙어 있어 매거진/아티클에서 about:blank iframe이 생기는데,
    // seedStore의 addInitScript는 '새 문서'마다 실행되므로 그 프레임에서 한 번 더 돌며
    // localStorage를 시드 값으로 되돌린다. 실측상 클릭 ~250ms 뒤 points/readArticles가
    // {100, []}로 복구돼, 적립 게이트가 뚫려 있어도 persisted() 단언이 전부 초록이 된다.
    // (외부 광고망 왕복이 사라져 오프라인·CI에서도 안정적이라는 건 덤이다.)
    await page.route(/googlesyndication\.com|doubleclick\.net|googleads\.g\.|adtrafficquality\.google/, (r) => r.abort())
    // 미가입을 '명시적으로' 심는다. 저장소가 비어 우연히 통과하는 것과 구분돼야
    // points 단언(적립 우회 차단)이 기준선을 갖는다.
    await seedStore(page, { onboarded: false, points: 100, readArticles: [] })
  })

  test('미가입 진입 시 온보딩 · 닉네임이나 동의가 비면 시작 버튼이 잠긴다', async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)

    await expect(page.getByRole('heading', { name: '누리 마인드에 오신 걸 환영해요' })).toBeVisible()

    const start = page.getByRole('button', { name: START })
    await expect(start).toBeDisabled()

    // 닉네임만 채운 상태에서 풀리면 필수 동의를 우회한 가입이 생긴다(동의 기록 없는 계정 = 스토어 심사 리스크)
    await page.getByPlaceholder(NICK_PH).fill(NICK)
    await expect(start).toBeDisabled()

    await page.getByRole('button', { name: AGREE, exact: true }).click()
    await expect(start).toBeEnabled()

    // 공백만 남기면 다시 잠겨야 한다 — 게이트가 trim이 아닌 length로 새면 '   ' 닉네임이 통과한다
    await page.getByPlaceholder(NICK_PH).fill('   ')
    await expect(start).toBeDisabled()
  })

  test('닉네임+캐릭터+동의 → 시작하면 홈으로 들어가고 입력값이 그대로 저장된다', async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)

    await page.getByPlaceholder(NICK_PH).fill(NICK)
    await page.getByRole('button', { name: '🐧', exact: true }).click() // STARTERS의 penguin
    await page.getByRole('button', { name: AGREE, exact: true }).click()
    await page.getByRole('button', { name: START }).click()

    // 온보딩은 라우팅이 아니라 게이트 해제로 빠져나온다 — 주소는 그대로 '/'
    await expect(page).toHaveURL('/')

    // 홈 자산 카드의 프로필 버튼. 여기 '누리'(스토어 기본 닉)가 뜨면 completeOnboarding이 입력을 버린 것
    const profile = page.getByRole('button').filter({ hasText: '님 👋' })
    await expect(profile).toContainText(NICK)

    const st = await persisted(page)
    expect(st.onboarded).toBe(true)
    expect(st.nickname).toBe(NICK)
    // 캐릭터 선택이 아바타로 굳는지 — 고른 뒤 null로 저장되던 회귀가 있었다
    expect(st.avatar).toEqual({ kind: 'animal', persona: 'penguin' })
    // 동의 기록은 '현재 약관 버전'으로 남아야 재동의(ReConsent) 팝업이 가입 직후 뜨지 않는다
    expect((st.consent as { v?: string } | null)?.v).toBe(LEGAL_VERSION)
  })

  test('약관 시트는 라우트를 바꾸지 않고 열리고, 닫아도 입력이 살아있다', async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)

    const nick = page.getByPlaceholder(NICK_PH)
    await nick.fill(NICK)
    await page.getByRole('button', { name: '🐧', exact: true }).click()
    await page.getByRole('button', { name: AGREE, exact: true }).click()

    await page.getByRole('button', { name: '이용약관', exact: true }).click()

    // 회귀 ①: nav('/legal/terms')로 되돌아가면 여기서 죽는다. 라우트가 바뀌는 순간
    // App의 온보딩 분기가 교체되며 Onboarding이 언마운트되기 때문.
    await expect(page).toHaveURL('/')

    const sheet = page.getByRole('dialog', { name: '포인트 이용약관' })
    await expect(sheet).toBeVisible()

    // 회귀 ②: 본문(12KB대)은 열 때 동적 import. 청크 해시가 어긋나거나 import가 깨지면
    // 스켈레톤만 남은 '빈 약관'이 되는데, 존재 단언만으로는 그걸 못 잡는다 → 길이로 잡는다.
    const body = sheet.getByText('제1조(목적)')
    await expect(body).toBeVisible()
    expect((await body.innerText()).length).toBeGreaterThan(3000)

    // 닫기 버튼은 둘(헤더 ✕ / 하단 큰 버튼) — 실제로 누르는 하단 버튼으로 닫는다
    await sheet.getByRole('button', { name: '닫기' }).last().click()
    await expect(sheet).toBeHidden()

    // 회귀 ③: 필수 동의 약관을 읽고 왔더니 폼이 비어 있는 문제. 셋 다 살아있어야 한다.
    await expect(nick).toHaveValue(NICK)
    await expect(page.getByRole('button', { name: AGREE, exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: START })).toBeEnabled()
    await expect(page).toHaveURL('/')
  })

  /**
   * 위 ⭐ 테스트는 시트 방식이라 Onboarding이 언마운트되지 않는다 — 즉 입력은 React state로
   * 살아남고, 초안(sessionStorage) 코드는 한 줄도 실행되지 않는다. 실제로 언마운트가 나는 건
   * 카카오 OAuth(전체 페이지 리다이렉트)와 라우트 회귀 두 경우뿐이라, 초안을 검증하려면
   * 문서를 새로 띄워야 한다. reload가 그 조건(같은 탭 = sessionStorage 유지)을 그대로 만든다.
   */
  test('입력 초안은 문서가 새로 떠도 복원된다 (카카오 리다이렉트 대비)', async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)

    await page.getByPlaceholder(NICK_PH).fill(NICK)
    await page.getByRole('button', { name: '🐧', exact: true }).click()
    await page.getByRole('button', { name: AGREE, exact: true }).click()

    await page.reload()
    await waitForApp(page)

    await expect(page.getByPlaceholder(NICK_PH)).toHaveValue(NICK)
    await expect(page.getByRole('button', { name: AGREE, exact: true })).toHaveAttribute('aria-pressed', 'true')

    // 캐릭터는 선택 상태가 인라인 색으로만 표시돼 DOM 이름이 없다 — 가입까지 밀어
    // '저장된 아바타'로 확인한다(초안에서 picked만 빠지는 회귀를 이 단언만 잡는다).
    const start = page.getByRole('button', { name: START })
    await expect(start).toBeEnabled()
    await start.click()

    const st = await persisted(page)
    expect(st.nickname).toBe(NICK)
    expect(st.avatar).toEqual({ kind: 'animal', persona: 'penguin' })
  })

  test('금칙어 닉네임은 가입을 통과하지 못한다', async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)

    // moderation.ts BANNED 목록의 실제 단어. 닉네임도 커뮤니티 표시 문자열이라
    // 전광판·댓글과 같은 필터를 통과해야 우회 경로가 안 생긴다.
    await page.getByPlaceholder(NICK_PH).fill('병신')
    await page.getByRole('button', { name: AGREE, exact: true }).click()

    const start = page.getByRole('button', { name: START })
    // 형식 게이트(닉+동의)는 통과한다 — 실제 차단은 moderateText가 하므로 눌러봐야 검증된다
    await expect(start).toBeEnabled()
    await start.click()

    await expect(page.getByText('부적절한 표현이 있어요')).toBeVisible()
    // 온보딩에 그대로 머물러야 한다(홈이면 필터가 뚫린 것)
    await expect(page.getByRole('heading', { name: '누리 마인드에 오신 걸 환영해요' })).toBeVisible()
    expect((await persisted(page)).onboarded).toBe(false)
  })

  test('미가입 공개 라우트(/magazine)는 열리지만 정독 보상은 적립되지 않는다', async ({ page }) => {
    // 지갑 Pill은 스프링 카운트업(useCountUp)이라 100→108이 ~1초에 걸쳐 굴러간다.
    // 그 사이엔 여전히 '🪙 100'이 보여서, 적립이 뚫려도 지갑 단언이 그냥 통과해 버린다(실측).
    // reducedMotion을 켜면 spring.jump로 즉시 확정값이 찍혀 그 창이 사라진다.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/magazine')
    await waitForApp(page)

    // PUBLIC_ROUTES(/legal|zodiac|magazine|vs)가 깨지면 sitemap 등재 URL이 전부 온보딩으로 튕긴다
    await expect(page.getByText('심리 매거진')).toBeVisible()
    const card = page.getByRole('button').filter({ hasText: '집중력이 약한 게 아니라' })
    await expect(card).toBeVisible()
    await card.click()
    await expect(page).toHaveURL('/magazine/adhd-focus')

    await page.getByRole('button', { name: /다 읽었어요/ }).click()

    // 라벨은 낙관적으로(justClaimed) 무조건 바뀐다 → 라벨은 '클릭이 처리됐다'는 신호로만 쓰고
    // 판정은 지갑으로 한다. 미가입 적립이 열리면 약관 동의 없이 포인트를 쌓는 우회로가 된다.
    await expect(page.getByRole('button', { name: '읽기 완료 ✓' })).toBeVisible()

    // ⚠️ 판정은 반드시 저장소 먼저. '값이 안 변했다'를 UI로 먼저 물으면 폴링 첫 회차가
    // 변경 전 화면을 보고 그냥 통과한다(적립 게이트를 뚫어도 초록이 뜨는 걸 실측했다).
    // 적립은 클릭 핸들러 안에서 동기로 set→persist까지 끝나므로, 저장소는 이 시점에 확정값이다.
    const st = await persisted(page)
    expect(st.points).toBe(100)
    // '읽음' 기록조차 남으면 안 된다 — 남으면 정식 가입 후 같은 글이 수령 처리돼 보상을 영영 못 받는다
    expect(st.readArticles).toEqual([])
    expect(st.onboarded).toBe(false)

    // 저장소를 한 번 왕복하고 온 뒤라 카운트업 effect까지 끝났다 — 이제야 화면 값이 확정이다.
    // 로케이터는 '잔액이 얼마든' 잡고(🪙로 시작하는 Pill) 값은 단언으로 못박는다.
    await expect(page.getByText(/^🪙\s/)).toHaveText(/^🪙\s*100$/)
  })
})
