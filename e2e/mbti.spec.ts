import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, waitForApp } from './helpers'

/**
 * FLOW 4 — 16가지 성격유형 2종(/mbti/quick 12문항 · /mbti/deep 24문항 5점척도).
 *
 * 이 화면의 진짜 위험은 "결과가 뜬다"가 아니라 **채점**이다. tally→pct→typeFromAxes는
 * 화면에 4글자 키 하나로만 요약돼서, 배점이 틀려도 눈으로는 정상처럼 보인다.
 * 그래서 여기서는 전부 '소스에서 미리 계산한 값'을 단언한다 — 유형 키·게이지 퍼센트까지.
 *
 * 애니메이션 감속(reducedMotion)을 켠 이유: 문항마다 motion.div(key=step)가 재마운트되며
 * 스프링 진입 애니메이션이 도는데, 24문항 × 안정화 대기가 30초 타임아웃을 위협한다.
 * 덤으로 MotionConfig reducedMotion="user" 경로(접근성 분기)도 같이 밟게 된다.
 */
test.use({ reducedMotion: 'reduce' })

/**
 * MBTI_QUICK 12문항의 **첫 번째** 선택지 문구 — src/data/mbti.ts 정의 순서 그대로.
 * 각 to는 E,E,E,S,S,S,T,T,T,J,J,J라 전부 첫 선택지면 축마다 3:0 → 4축 전부 100%,
 * 즉 정답은 ESTJ 하나뿐이다. 배열 순서가 곧 문항 순서 단언이기도 하다:
 * step이 안 넘어가면 다음 문구의 버튼이 없어 클릭 자체가 실패한다.
 */
const QUICK_FIRST = [
  '사람들과 어울릴 때',
  '먼저 말을 건다',
  '말하면서 정리된다',
  '구체적인 절차와 사실',
  '예시와 경험',
  '검증된 코스를 확인',
  '원인과 해결책을 짚어준다',
  '무엇이 맞는가',
  '솔직하게 정확히',
  '계획대로 굴러간다',
  '미리 끝내야 편하다',
  '불편하고 다시 정리한다',
] as const

/**
 * 온보딩 + 약관 동의를 함께 심는다.
 * consent 기본값이 null이라 seedOnboarded만 쓰면 ReConsent가 `fixed inset-0 z-[100]`
 * 전면 오버레이로 떠서 문항 버튼 클릭을 전부 가로챈다(원인 못 찾으면 전 케이스 타임아웃).
 */
async function open(page: Page, path: string): Promise<void> {
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: '2026-06-23T00:00:00.000Z' } })
  await page.goto(path)
  await waitForApp(page)
}

/** 등록상표 노출 검사 — 화면에 실제로 보이는 텍스트만(innerText). URL의 /mbti/는 대상 아님. */
async function expectNoTrademark(page: Page): Promise<void> {
  const shown = await page.locator('body').innerText()
  expect(shown.toUpperCase()).not.toContain('MBTI')
  expect(shown).not.toContain('Myers')
}

test.describe('16가지 성격유형', () => {
  test('빠른검사 — 진행 표시가 1/12에서 매 선택마다 오르고 12번째에야 결과가 뜬다', async ({ page }) => {
    await open(page, '/mbti/quick')

    for (let i = 0; i < QUICK_FIRST.length; i++) {
      // '1/12' 자체가 MBTI_QUICK.length 단언 — 문항을 빼거나 더하면 여기서 바로 깨진다
      await expect(page.getByText(`${i + 1}/12`, { exact: true })).toBeVisible()
      // advance()의 `step + 1 < total` 경계가 밀리면 11문항에서 조기 종료된다 → 마지막 클릭 전엔 결과가 없어야 한다
      await expect(page.getByRole('heading', { name: '네 가지 축' })).toHaveCount(0)
      await page.getByRole('button', { name: QUICK_FIRST[i], exact: true }).click()
    }

    await expect(page.getByRole('heading', { name: '네 가지 축' })).toBeVisible()
    // 결과 화면으로 완전히 교체됐는지 — 문항 UI가 남아 있으면 done 분기가 안 탄 것
    await expect(page.getByText('12/12', { exact: true })).toHaveCount(0)
  })

  test('빠른검사 채점 — 1번 선택지만 12번이면 정확히 ESTJ, 4축 모두 100:0', async ({ page }) => {
    await open(page, '/mbti/quick')

    for (const label of QUICK_FIRST) {
      await page.getByRole('button', { name: label, exact: true }).click()
    }

    // E3·S3·T3·J3 → 반대극 0 → typeFromAxes가 ESTJ를 내야 한다. '뭔가 떴다'가 아니라 이 4글자여야 채점 회귀가 잡힌다
    await expect(page.getByText('ESTJ', { exact: true })).toBeVisible()
    // 키→해설 매핑(mbtiByKey)이 어긋나면 키만 맞고 본문이 다른 유형이 나온다
    await expect(page.getByRole('heading', { name: '굴리는 관리자' })).toBeVisible()
    // 게이지 4줄이 전부 100:0 — pct 계산이 반대로 뒤집히면 '0% · 100%'가 되어 여기서 걸린다
    await expect(page.getByText('100% · 0%', { exact: true })).toHaveCount(4)
  })

  test('심층검사 채점 — 1번만 보통이면 E축이 42:58로 기울어 ISTJ, 나머지 세 축은 50:50', async ({ page }) => {
    await open(page, '/mbti/deep')

    for (let i = 0; i < 24; i++) {
      // '1/24'~'24/24' — MBTI_DEEP.length가 24가 아니면 즉시 깨진다
      await expect(page.getByText(`${i + 1}/24`, { exact: true })).toBeVisible()
      /*
       * 1번(E극)만 '보통'으로 흘려 대칭을 깬다. 전 문항을 '매우 그렇다'로 밀면 축마다 12:12라
       * 화면 숫자가 tally가 비었을 때의 기본값(sum===0 → 50)과 완전히 같아져서,
       * pickDeep의 setTally를 통째로 지워도 네 축 50:50 · ESTJ가 그대로 통과한다(과거의 오답 초록).
       */
      await page.getByRole('button', { name: i === 0 ? '보통' : '매우 그렇다', exact: true }).click()
    }

    /*
     * E/I축: 1번 v=3 → E+2·I+2, 2~3번(E극) v=5 → E+8, 4~6번(I극) v=5 → I+12  →  E 10 : I 14 = 42:58.
     * 나머지 세 축은 전 문항 v=5 → pole += 4, other += 0. 극별 문항 3개씩이라 12:12 = 50:50.
     * 극별 문항 수가 3:3에서 어긋나는 순간(예: 4:2) 그 축은 67:33으로 기울고 E축은 58:42로 뒤집히므로,
     * 이 세 줄이 data/mbti.ts 주석이 경고한 "모순 응답 체계적 편향"의 감시자다.
     */
    await expect(page.getByText('42% · 58%', { exact: true })).toBeVisible()
    await expect(page.getByText('50% · 50%', { exact: true })).toHaveCount(3)
    await expect(page.getByText('100% · 0%', { exact: true })).toHaveCount(0)
    // 42<50이라 typeFromAxes가 두 번째 극(I)을 고르는 분기 — 이 파일에서 유일하게 ESTJ가 아닌 결과다.
    // 동시에 42가 하필 E/I축 값이라는 증거이기도 하다(S/N축에 붙었다면 ENTJ가 나온다)
    await expect(page.getByText('ISTJ', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: '기록하는 성실가' })).toBeVisible()
  })

  test('심층검사 배점 — E문항 3개만 매우 그렇다면 E축만 75:25, 나머지는 50:50', async ({ page }) => {
    await open(page, '/mbti/deep')

    for (let i = 0; i < 24; i++) {
      await expect(page.getByText(`${i + 1}/24`, { exact: true })).toBeVisible()
      // MBTI_DEEP 0~2가 E극 문항, 3~5가 I극. 앞 3개만 5점 주고 나머지 21문항은 '보통'(3점)
      await page.getByRole('button', { name: i < 3 ? '매우 그렇다' : '보통', exact: true }).click()
    }

    /*
     * 비대칭 응답이라야 pole/other 두 갈래가 분리돼 보인다(균일 응답은 3:3 대칭이라 뭘 고쳐도 50:50).
     *   E문항 v=5 → E+4 ×3 = 12,  I문항 v=3 → I+2·E+2 ×3 = I 6 / E 6  →  E 18 : I 6 = 75:25
     * `other += 5 - v`가 빠지면 12:6=67, `pole += v-1`이 v로 바뀌면 21:9=70 —
     * 어느 쪽으로 틀어져도 75가 아니게 되므로 배점식 회귀를 직격한다.
     */
    // 75:25가 하필 **E/I 줄**에 붙었는지까지 본다 — 게이지가 엉뚱한 축에 붙어도
    // ESTJ와 '50% · 50%' 3개는 그대로라, 축 매핑 뒤바뀜은 이 스코프에서만 잡힌다
    const eAxisRow = page.getByText('E · 외향', { exact: true }).locator('xpath=../..')
    await expect(eAxisRow.getByText('75% · 25%', { exact: true })).toBeVisible()
    // 나머지 3축은 전 문항 '보통'이라 정확히 반반
    await expect(page.getByText('50% · 50%', { exact: true })).toHaveCount(3)
    await expect(page.getByText('ESTJ', { exact: true })).toBeVisible()
  })

  test('잘못된 mode는 홈으로 리다이렉트 — 빠른검사로 흘러내리면 안 된다', async ({ page }) => {
    await open(page, '/mbti/foo')

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: '빠른 12문항' })).toBeVisible()
    // 가드가 빠지면 deep=false로 떨어져 MBTI_QUICK 1번 문항이 그대로 렌더된다 — URL만 봐서는 못 잡는 케이스
    await expect(page.getByText('주말에 에너지가 채워지는 쪽은?')).toHaveCount(0)
  })

  test('상표 회피 — 문항·결과 화면 어디에도 MBTI 문자열이 없다', async ({ page }) => {
    await open(page, '/mbti/deep')
    await expect(page.getByText('1/24', { exact: true })).toBeVisible()
    await expectNoTrademark(page)

    await open(page, '/mbti/quick')
    await expect(page.getByText('1/12', { exact: true })).toBeVisible()
    await expectNoTrademark(page)

    // 결과 화면은 유형 해설·면책 문구가 통째로 새로 붙는 구간이라 상표가 새기 가장 쉽다
    for (const label of QUICK_FIRST) {
      await page.getByRole('button', { name: label, exact: true }).click()
    }
    await expect(page.getByRole('heading', { name: '네 가지 축' })).toBeVisible()
    await expectNoTrademark(page)
  })
})
