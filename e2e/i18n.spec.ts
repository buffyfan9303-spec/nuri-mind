import { expect, test } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, waitForApp } from './helpers'

/**
 * 언어 전환 — 사전을 언어별 청크로 쪼갠 뒤의 회귀 방어.
 *
 * ko만 메인 번들에 남기고 en/ja는 별도 청크로 분리했다(i18n/translations.ts). 그래서 전환은
 * "동기 렌더 → 사전 도착 → 다시 그리기"라는 2단계가 됐다. 구독(useSyncExternalStore)이
 * 끊기면 언어를 눌러도 화면이 한국어에 머무는데, 스토어의 lang 값은 바뀌므로
 * **저장소만 검사하면 초록불이 뜬다.** 반드시 화면에 그려진 글자로 확인한다.
 */

/** ReConsent는 z-100 전면 오버레이라 동의 버전이 어긋나면 이 화면의 클릭이 전부 막힌다 */
const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01' }

/**
 * 세 언어 모두 값이 다르고 **단독 텍스트 노드로** 렌더되는 키를 쓴다.
 * profile.settings는 `⚙️ ${t(...)}` 형태라 exact 매칭이 안 걸린다(실제로 이걸로 한 번 헛짚었다).
 */
const LANGUAGE = { ko: '언어', en: 'Language', ja: '言語' }

test.describe('언어 전환', () => {
  test('en·ja 사전이 지연 도착해도 화면이 실제로 그 언어로 바뀐다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT })
    await page.goto('/profile')
    await waitForApp(page)

    const main = page.locator('main')
    await expect(main.getByText(LANGUAGE.ko, { exact: true })).toBeVisible()

    // 영어 — 사전이 별도 청크라 클릭 직후엔 아직 없다. toBeVisible이 도착까지 기다린다.
    await main.getByRole('button', { name: 'English' }).click()
    await expect(main.getByText(LANGUAGE.en, { exact: true })).toBeVisible()
    // 한국어가 남아 있으면 폴백에 갇힌 것 — 전환이 절반만 된 상태를 잡는다
    await expect(main.getByText(LANGUAGE.ko, { exact: true })).toHaveCount(0)

    // 일본어 — 다른 청크로 한 번 더. 첫 전환만 되고 두 번째가 막히는 경우가 있다.
    await main.getByRole('button', { name: '日本語' }).click()
    await expect(main.getByText(LANGUAGE.ja, { exact: true })).toBeVisible()

    // 한국어로 복귀 — ko는 메인 번들이라 항상 즉시 가능해야 한다
    await main.getByRole('button', { name: '한국어' }).click()
    await expect(main.getByText(LANGUAGE.ko, { exact: true })).toBeVisible()
  })

  test('ja로 저장된 사용자는 새로 열어도 일본어로 착지한다', async ({ page }) => {
    // 하이드레이션 경로 — 전환이 아니라 '처음부터 그 언어'인 경우다.
    // ko 폴백으로 첫 프레임이 그려진 뒤 사전이 도착해 교체되는데, 그 교체가 안 되면
    // 일본어 사용자는 앱을 열 때마다 한국어를 본다.
    await seedOnboarded(page, { consent: CONSENT, lang: 'ja' })
    await page.goto('/profile')
    await waitForApp(page)

    await expect(page.locator('main').getByText(LANGUAGE.ja, { exact: true })).toBeVisible()
  })

  test('사전 청크를 못 받아도 한국어로 계속 동작한다', async ({ page }) => {
    // 네트워크 실패·배포 중 청크 404에서 화면이 비면 안 된다. ko 폴백이 그걸 막는다.
    await page.route('**/dict.en-*.js', (r) => r.abort())
    await seedOnboarded(page, { consent: CONSENT })
    await page.goto('/profile')
    await waitForApp(page)

    const main = page.locator('main')
    await main.getByRole('button', { name: 'English' }).click()
    // 영어로는 못 바뀌지만 화면은 살아 있어야 한다
    await expect(main.getByText(LANGUAGE.ko, { exact: true })).toBeVisible()
  })
})
