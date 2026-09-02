import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { DEEP_TEST_IDS, STORE_KEY, allDeepResults, premiumUntil, seedOnboarded, seedStore, waitForApp } from './helpers'

/**
 * 계정 경계 & 공개 라우트.
 *
 * 두 축을 본다:
 *  1) 지우라고 했을 때 "정말로" 지워지는가 — 유료 재화·검사기록뿐 아니라 economy.ts의 동기화 마커까지.
 *     마커가 남으면 다음 로그인이 syncAccount의 '마커 == uid' 값싼 경로로 빠져 서버 지갑을 영영 복원하지 않는다.
 *  2) 가입 게이트가 공개/비공개를 정확히 갈라주는가 — 넓으면 sitemap URL이 색인 불가,
 *     좁으면 남의 프로필이 열린다. 둘 다 배포 후에야 드러나는 종류의 사고다.
 *
 * ⚠️ 실제 카카오 로그인(swapAccount·leaveAccount·isAccountSwitchPending)은 실계정 세션이 필요해 E2E 불가.
 *    여기서는 로그인 없이도 도는 경로(resetAll → clearAccountSync)만 검증한다 —
 *    Supabase 미설정(anon 키 없음) 환경에서도 clearAccountSync는 무조건 실행되므로 CI에서 동일하게 돈다.
 */

/** economy.ts가 쓰는 실제 키 문자열 — 여기서 오타가 나면 "없는 키가 없다"를 확인하는 늘-통과 테스트가 된다 */
const LOCAL_UID_KEY = 'nuri-mind-econ-local-uid'
const SYNC_UID_KEY = 'nuri-mind-econ-sync-uid'
const OUTBOX_KEY = 'nuri-mind-econ-outbox-v1'
const PREV_UID = 'e2e-prev-account-uid'

/**
 * 이전 계정으로 한 번 동기화를 마친 기기를 재현한다.
 * seedStore와 별개인 이유: 이 세 키는 zustand persist 바깥(economy.ts가 직접 localStorage에 쓰는) 값이라
 * 스토어 스냅샷에 섞어 넣을 수 없다.
 */
async function seedAccountMarkers(page: Page): Promise<void> {
  await page.addInitScript(
    ([lk, sk, ok, uid]) => {
      localStorage.setItem(lk, uid)
      localStorage.setItem(sk, uid)
      localStorage.setItem(
        ok,
        JSON.stringify([{ id: 'e2e_out1', k: 'evt:e2e_out1', kind: 'earn', amount: 10, memo: 'e2e', uid }]),
      )
    },
    [LOCAL_UID_KEY, SYNC_UID_KEY, OUTBOX_KEY, PREV_UID] as const,
  )
}

test('전체 초기화 — 2차 확인 전에는 버튼이 잠기고, 확인 후엔 유료 재화·기록·동기화 마커가 함께 사라진다', async ({
  page,
}) => {
  await seedOnboarded(page, {
    diamonds: 12,
    premiumUntil: premiumUntil(),
    results: allDeepResults(),
    // 현행 약관에 동의한 상태 — 없으면 ReConsent 전면 오버레이(z-100)가 설정 화면을 통째로 덮어
    // 초기화 버튼이 영영 안 눌린다. 버전은 앱 상수를 그대로 가져와 약관 개정 때 같이 따라간다.
    consent: { v: LEGAL_VERSION, at: new Date().toISOString() },
  })
  await seedAccountMarkers(page)
  await page.goto('/profile')
  await waitForApp(page)

  // 시드가 실제로 하이드레이트됐는지 먼저 못 박는다. 무과금 상태면 2차 확인 자체가 렌더되지 않아
  // 아래 disabled 검증이 "없는 버튼은 늘 통과"로 무력화된다.
  await expect(page.getByText(`🧪 ${DEEP_TEST_IDS.length}`)).toBeVisible()
  // 마커도 같은 이유로 '있었음'을 먼저 못 박는다 — 키 이름이 바뀌면 아래 "지워졌다"가 공허하게 통과한다
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), SYNC_UID_KEY)).toBe(PREV_UID)

  await page.getByRole('button', { name: '데이터 초기화' }).click()

  const dialog = page.getByRole('dialog')
  const confirm = dialog.getByRole('button', { name: '데이터 초기화', exact: true })
  const ack = dialog.getByRole('button', { name: /복구할 수 없다는 데 동의해요/ })

  // 문구에 보유량이 실제 값으로 박혀야 한다 — 하드코딩/0 표시로 퇴화하면 사용자가 뭘 잃는지 모른 채 누른다
  await expect(dialog.getByText('다이아 12개 · 프리미엄 구독 전부 사라지고 복구할 수 없다는 데 동의해요')).toBeVisible()
  // ⭐ 오탭 방지: 모달이 뜨자마자 '초기화' 자리를 한 번 더 눌러 결제분이 날아가던 사고의 회귀 가드
  await expect(confirm).toBeDisabled()

  await ack.click()
  await expect(dialog.getByText('☑')).toBeVisible() // 체크 상태가 시각적으로도 바뀌는지(빈칸 그대로면 사용자는 왜 눌리는지 모른다)
  await expect(confirm).toBeEnabled()

  await confirm.click()
  // onboarded:false로 돌아가 App이 온보딩을 렌더 — 초기화가 스토어까지 닿았다는 UI 증거
  await expect(page.getByRole('heading', { level: 1, name: '누리 마인드에 오신 걸 환영해요' })).toBeVisible()

  // ⭐ 본체: 저장소를 직접 읽는다. 화면은 온보딩으로 바뀌어도 마커가 남아 있던 것이 실제 버그였다
  //    (재로그인 시 syncAccount가 '마커 == uid' 경로로 빠져 서버 지갑 복원이 영영 안 됨).
  await expect
    .poll(() =>
      page.evaluate((k) => {
        const raw = localStorage.getItem(k.store)
        const st = raw ? ((JSON.parse(raw) as { state?: Record<string, unknown> }).state ?? null) : null
        return {
          diamonds: st ? st.diamonds : null,
          premiumUntil: st ? st.premiumUntil : null,
          results: st && Array.isArray(st.results) ? (st.results as unknown[]).length : null,
          onboarded: st ? st.onboarded : null,
          localUid: localStorage.getItem(k.localUid),
          syncUid: localStorage.getItem(k.syncUid),
          outbox: localStorage.getItem(k.outbox),
        }
      }, { store: STORE_KEY, localUid: LOCAL_UID_KEY, syncUid: SYNC_UID_KEY, outbox: OUTBOX_KEY }),
    )
    .toEqual({
      diamonds: 0,
      premiumUntil: 0,
      results: 0,
      onboarded: false,
      localUid: null,
      syncUid: null,
      outbox: null,
    })
})

test('공개 라우트 /zodiac/:slug — 미가입자에게도 렌더되고 title·canonical이 그 페이지 것으로 바뀐다', async ({ page }) => {
  await seedStore(page, { onboarded: false, lang: 'ko' })
  await page.goto('/zodiac/rat')
  await waitForApp(page)

  // 가입 게이트에 막히면 이 h1 대신 온보딩이 뜬다 — 크롤러가 보는 화면이 곧 이 화면이다
  await expect(page.getByRole('heading', { level: 1, name: '오늘의 쥐띠 운세' })).toBeVisible()

  // 정적 index.html의 홈 제목/캐노니컬이 그대로 남으면 12개 띠 페이지가 전부 홈 중복으로 취급된다.
  // 날짜는 매일 바뀌므로 형태만 고정 — 날짜가 통째로 빠지는 회귀도 함께 잡힌다.
  await expect(page).toHaveTitle(/^오늘의 쥐띠 운세 \(\d{4}년 \d{1,2}월 \d{1,2}일\) \| 누리 마인드$/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.nurimind.co.kr/zodiac/rat',
  )
})

test('공개 라우트 이탈 시 SEO 메타가 원복된다 — 띠 페이지 canonical이 다음 화면으로 새지 않는다', async ({ page }) => {
  await seedStore(page, { onboarded: false, lang: 'ko' })
  await page.goto('/zodiac/rat')
  await waitForApp(page)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/zodiac\/rat$/)

  // 퍼널 카드 → '/'(비공개) 이동. 언마운트 cleanup이 빠지면 이후 모든 화면이 /zodiac/rat을 자기 canonical로 주장한다.
  await page.getByRole('button', { name: /성격이 궁금하면 심리검사로/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: '누리 마인드에 오신 걸 환영해요' })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.nurimind.co.kr/')
})

/** sitemap에 실려 있고 PUBLIC_ROUTES 정규식에 걸려야 하는 경로 — 마커는 그 페이지 본문에만 있는 문자열 */
const PUBLIC_ROUTES = [
  { path: '/magazine', marker: '검사보다 한 걸음 더, 짧게 읽는 심리 인사이트' },
  // 아티클 상세는 sitemap URL의 최대 묶음(10건)이면서 지연 로딩 청크가 따로다 —
  // 목록만 보면 `/magazine`은 열리는데 본문 URL은 전부 막히는 회귀를 놓친다.
  { path: '/magazine/adhd-focus', marker: '집중력이 약한 게 아니라, 뇌가 다른 거예요' },
  { path: '/legal/terms', marker: '시행 · 엔에이치홀딩스' },
] as const

for (const { path, marker } of PUBLIC_ROUTES) {
  test(`공개 라우트 ${path} — 미가입 상태에서 온보딩이 아니라 본문이 렌더된다`, async ({ page }) => {
    await seedStore(page, { onboarded: false, lang: 'ko' })
    await page.goto(path)
    await waitForApp(page)

    // 본문 고유 문구로 확인 — TopBar만 보면 껍데기만 그려진 회귀를 놓친다
    await expect(page.getByText(marker)).toBeVisible()
    // 게이트가 넓어지면 여기서 온보딩 h1이 잡힌다(검색 유입·약관 링크가 전부 가입 화면으로 막히던 상태)
    await expect(page.getByRole('heading', { level: 1, name: '누리 마인드에 오신 걸 환영해요' })).toHaveCount(0)
  })
}

/** 가입자 전용 화면 — 마커는 온보딩 화면에는 없고 해당 페이지에만 있는 문자열이어야 한다 */
const PRIVATE_ROUTES = [
  { path: '/profile', marker: '데이터 초기화' },
  { path: '/growth', marker: '성장 플랜' },
] as const

for (const { path, marker } of PRIVATE_ROUTES) {
  test(`비공개 라우트 ${path} — 미가입이면 온보딩으로 막고 딥링크 URL은 유지한다`, async ({ page }) => {
    await seedStore(page, { onboarded: false, lang: 'ko' })
    await page.goto(path)
    await waitForApp(page)

    await expect(page.getByRole('heading', { level: 1, name: '누리 마인드에 오신 걸 환영해요' })).toBeVisible()
    // 페이지 고유 문구가 하나라도 보이면 게이트가 뚫린 것(PUBLIC_ROUTES 정규식이 넓어진 경우)
    await expect(page.getByText(marker)).toHaveCount(0)
    // 게이트는 리다이렉트가 아니라 렌더 교체여야 한다 — 주소를 갈아치우면 가입 직후 원래 목적지로 돌아갈 수 없다
    await expect(page).toHaveURL(new RegExp(`${path}$`))

    // ⭐ 양성 대조군: 같은 마커가 '가입 상태에서는' 실제로 렌더돼야 한다.
    //    이게 없으면 마커 문자열이 낡거나 오타가 나는 순간 위 toHaveCount(0)이 "없는 걸 없다고" 확인하는
    //    영구 초록 테스트로 퇴화해, 게이트가 뚫려도 아무도 모른다.
    //    (addInitScript는 누적·순서대로 실행 → 뒤에 심은 onboarded:true가 최종값)
    await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })
    await page.reload()
    await waitForApp(page)
    await expect(page.getByText(marker).first()).toBeVisible()
  })
}
