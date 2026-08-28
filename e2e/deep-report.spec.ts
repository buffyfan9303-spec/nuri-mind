import { expect, test } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { allDeepResults, premiumUntil, seedOnboarded, waitForApp } from './helpers'

/**
 * FLOW 2 — /deep-report 3상태 게이트(①미완주 ②완주+무료 ③완주+프리미엄) + 엣지 실패 착지.
 *
 * 프로덕션 빌드가 대상이라 window.__store 같은 dev 뒷문이 없다 — 상태는 helpers의
 * localStorage 시드(addInitScript)로만 만든다. 실제 사용자와 같은 하이드레이션 경로다.
 *
 * 이 파일이 지키는 두 가지:
 *  ① 페이월 — 잠긴 섹션 '개수'를 센다. 자물쇠 존재만 보면 목록이 절반 새도 초록불이 뜬다.
 *  ② 착지 — 엣지가 죽어도(현재 배포엔 ANTHROPIC_API_KEY가 없어 500) 로딩 카드에 갇히지 않는다.
 */

/** ReConsent는 fixed inset-0으로 화면을 덮는다 — 동의 버전을 맞춰두지 않으면 리포트가 모달 뒤에 깔린다 */
const CONSENT = { v: LEGAL_VERSION, at: '2026-01-01T00:00:00.000Z' }

/** PREMIUM_KRW = 5900(src/store/useStore.ts) · toLocaleString + ko-KR 로케일 → '5,900' */
const PRICE = '월 ₩5,900'

/** 로딩 카드 문구 — 무한 로딩 회귀의 유일한 육안 신호라 상수로 고정 */
const LOADING = '검사들을 하나로 엮는 중…'

/** store.aiReportText.deep 캐시 픽스처. ORDER를 일부러 어긋나게 넣어 정렬까지 함께 검증한다 */
const cachedReport = (at = Date.now()) =>
  JSON.stringify({
    at,
    sections: [
      { key: 'roadmap', title: '90일 로드맵', body: 'E2E 캐시 본문 roadmap' },
      { key: 'core', title: '핵심 프로필', body: 'E2E 캐시 본문 core' },
      { key: 'work', title: '일과 성취', body: 'E2E 캐시 본문 work' },
    ],
  })

test.describe('/deep-report 게이트', () => {
  test('미완주(7/11)면 잠금 화면 — 남은 개수·진행률이 계산되고 리포트 본문은 없다', async ({ page }) => {
    await seedOnboarded(page, { consent: CONSENT, results: allDeepResults().slice(0, 7) })
    await page.goto('/deep-report')
    await waitForApp(page)

    await expect(page.getByText('심층검사를 모두 마치면 열려요')).toBeVisible()
    // 고정 문구('11종')만 확인하면 게이트 산수가 깨져도 통과한다. 남은 개수(11-7)와 진행 표시는
    // doneDeep에서 매번 계산되는 값이라, 완주 판정이 어긋나면 여기서 먼저 틀어진다.
    await expect(page.getByText('4개 남았어요')).toBeVisible()
    const progress = page.getByText('7/11', { exact: true })
    await progress.scrollIntoViewIfNeeded()
    await expect(progress).toBeVisible()

    // 미완주에 티저·페이월이 뜨면 완주 조건(complete)이 사실상 사라진 것
    await expect(page.getByText('핵심 성격 요약')).toHaveCount(0)
    await expect(page.getByText('프리미엄으로 전체 해금')).toHaveCount(0)
  })

  test('완주 + 비프리미엄 — 첫 섹션만 열리고 나머지 6개는 잠긴 채 실제 가격이 붙는다', async ({ page }) => {
    // 캐시를 일부러 심는다: premium 가드를 잃으면 이 본문이 무료 사용자 화면에 그대로 새므로 누수 탐지기가 된다
    await seedOnboarded(page, {
      consent: CONSENT,
      results: allDeepResults(),
      aiReportText: { deep: cachedReport() },
    })
    await page.goto('/deep-report')
    await waitForApp(page)

    await expect(page.getByText('심층검사 11종 완주')).toBeVisible()
    // 티저는 페르소나 집계로 만들어지는 문장 — 집계가 죽으면 staticCore가 ''이 되어 빈 카드만 남는다
    await expect(page.getByText('11개 검사가 공통으로 가리키는 건')).toBeVisible()

    // ⭐ 개수로 못 박는다: ORDER 8개 - core(무료 공개) - cognition(정밀검사 없음) = 6
    await expect(page.getByText('🔒', { exact: true })).toHaveCount(6)
    await expect(page.getByText('인지 프로필')).toHaveCount(0)
    // 유료 본문이 무료 화면에 렌더되면 구독 이유 자체가 없어진다
    await expect(page.getByText('E2E 캐시 본문 core')).toHaveCount(0)

    // 가격은 PREMIUM_KRW에서 렌더 — 하드코딩으로 되돌아가거나 통화 포맷이 깨지면 잡힌다
    const cta = page.getByText(PRICE)
    await cta.scrollIntoViewIfNeeded()
    await expect(cta).toBeVisible()
  })

  test('정밀검사 결과가 있으면 잠긴 섹션이 7개 — 인지 프로필이 목록에 합류한다', async ({ page }) => {
    await seedOnboarded(page, {
      consent: CONSENT,
      results: [
        ...allDeepResults(),
        // hasCognition은 iq/mq/fq/sq/xq/wq 존재로만 판정 — 이 한 건이 잠금 목록 길이를 6→7로 바꾼다
        { id: 'e2e_iq', testId: 'iq', at: Date.now(), raw: 128, percentile: 96, band: 'high', persona: 'owl', iq: 128 },
      ],
    })
    await page.goto('/deep-report')
    await waitForApp(page)

    await expect(page.getByText('인지 프로필')).toBeVisible()
    await expect(page.getByText('🔒', { exact: true })).toHaveCount(7)
    // 정밀검사는 DEEP_IDS(비정밀 11종) 밖 — 완주 판정 분모에 섞이면 영원히 안 열린다
    await expect(page.getByText('심층검사 11종 완주')).toBeVisible()
  })

  test('완주 + 프리미엄 — 잠금이 사라지고 캐시 섹션이 ORDER 순서로 펼쳐진다', async ({ page }) => {
    await seedOnboarded(page, {
      consent: CONSENT,
      results: allDeepResults(),
      premiumUntil: premiumUntil(),
      aiReportText: { deep: cachedReport() },
    })
    await page.goto('/deep-report')
    await waitForApp(page)

    // 시드는 roadmap→core→work 순. 화면은 ORDER(core→work→roadmap)로 재정렬돼야 한다
    await expect(page.locator('main h2')).toHaveText([/핵심 프로필/, /일과 성취/, /90일 로드맵/])
    await expect(page.getByText('E2E 캐시 본문 core')).toBeVisible()
    // 캐시가 있으면 엣지를 다시 부르지 않는다 — 로딩 카드가 뜨면 JSON 캐시 판정이 깨진 것(매 진입마다 과금)
    await expect(page.getByText(LOADING)).toHaveCount(0)

    // 잠금 흔적이 남으면 결제한 사용자가 계속 페이월을 본다
    await expect(page.getByText('🔒', { exact: true })).toHaveCount(0)
    await expect(page.getByText('프리미엄으로 전체 해금')).toHaveCount(0)

    // 방금 만든 리포트라 재생성 쿨다운(24h) 안 — 버튼이 열려 있으면 엣지 호출이 무제한으로 샌다
    await expect(page.getByText('재생성은 하루 1회예요')).toBeVisible()
  })

  test('엣지가 500이어도 무한 로딩 대신 정적 폴백으로 착지한다', async ({ page }) => {
    // 키 없는 현재 배포와 같은 조건(엣지가 {"error":"no_key"} 500).
    // 과거 이펙트 deps/cleanup 때문에 응답이 통째로 버려져 로딩 카드에 영구히 갇히는 버그가 났다.
    // 앱 라우트(/deep-report)까지 가로채지 않도록 엣지 경로 전체(functions/v1)로만 좁힌다.
    await page.route('**/functions/v1/deep-report', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"no_key"}' }),
    )
    await seedOnboarded(page, { consent: CONSENT, results: allDeepResults(), premiumUntil: premiumUntil() })
    await page.goto('/deep-report')
    await waitForApp(page)

    // '착지'는 로딩이 사라지는 것만으로는 부족하다 — 폴백 안내와 계산된 요약이 실제로 그려져야 빈 화면과 구분된다
    await expect(page.getByText('AI 생성이 일시적으로 어려워 기본 요약을 보여드렸어요')).toBeVisible()
    await expect(page.getByText('11개 검사가 공통으로 가리키는 건')).toBeVisible()
    await expect(page.getByText(LOADING)).toHaveCount(0)

    // 생성 실패해도 재시도 경로와 실행 동선(성장 플랜)은 남아야 한다 — 이 아래가 통째로 사라지던 회귀
    // 안내 문구에도 '다시 시도'가 들어 있어 텍스트로 잡으면 strict 위반 — 버튼 롤로 좁힌다
    await expect(page.getByRole('button', { name: '🔄 다시 시도' })).toBeVisible()
    await expect(page.getByRole('button', { name: '성장 플랜 열기' })).toBeVisible()
  })
})
