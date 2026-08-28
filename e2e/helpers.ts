import type { Page } from '@playwright/test'

/**
 * 테스트 공용 헬퍼.
 *
 * 원칙: 프로덕션 빌드를 상대로 돌기 때문에 window.__store 같은 dev 뒷문은 쓸 수 없다.
 * 상태는 zustand persist가 읽는 localStorage 키를 **페이지 로드 전에** 심어서 만든다
 * (addInitScript — 앱 부팅보다 먼저 실행돼야 스토어가 그 값으로 하이드레이트된다).
 */

export const STORE_KEY = 'nuri-mind-v1'
/** useStore의 persist version — 불일치 시 zustand가 마이그레이션/폐기하므로 반드시 맞춘다 */
export const STORE_VERSION = 2

/** KST 기준 오늘 날짜 키(YYYY-MM-DD) — 앱의 lib/date.localDay와 같은 규칙 */
export function todayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** 앱 부팅 전에 스토어 상태를 심는다. 부분 지정 — 나머지는 앱 기본값이 채운다. */
export async function seedStore(page: Page, state: Record<string, unknown>): Promise<void> {
  await page.addInitScript(
    ([key, version, st]) => {
      localStorage.setItem(key as string, JSON.stringify({ state: st, version }))
    },
    [STORE_KEY, STORE_VERSION, state] as const,
  )
}

/** 온보딩을 마친 일반 사용자 */
export async function seedOnboarded(page: Page, extra: Record<string, unknown> = {}): Promise<void> {
  await seedStore(page, { onboarded: true, nickname: '테스터', lang: 'ko', points: 500, ...extra })
}

/** 심층검사 11종을 완주한 상태 — 리포트·성장플랜 게이트를 여는 최소 조건 */
export const DEEP_TEST_IDS = [
  'adhd',
  'ego',
  'love',
  'burnout',
  'dopamine',
  'resilience',
  'dark',
  'selfesteem',
  'perfect',
  'efficacy',
  'socialanx',
] as const

/** 페르소나를 섞어 넣는다 — 전부 같은 페르소나면 성장플랜 포커스가 1개로 접힌다(실제로 났던 버그) */
const PERSONAS = ['penguin', 'koala', 'cat', 'dolphin', 'owl', 'hamster']

export function allDeepResults(now = Date.now()) {
  return DEEP_TEST_IDS.map((testId, i) => ({
    id: `e2e_${testId}`,
    testId,
    at: now - i * 1000,
    raw: 50 + i,
    percentile: 30 + i * 5,
    band: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'low' : 'mid',
    persona: PERSONAS[i % PERSONAS.length],
  }))
}

/** 프리미엄 만료 시각(30일 뒤) */
export const premiumUntil = (): number => Date.now() + 30 * 86_400_000

/** 앱이 실제로 그려졌는지 — 라우트 지연 로딩 때문에 networkidle만으로는 부족하다 */
export async function waitForApp(page: Page): Promise<void> {
  await page.waitForSelector('main', { state: 'attached', timeout: 15_000 })
}
