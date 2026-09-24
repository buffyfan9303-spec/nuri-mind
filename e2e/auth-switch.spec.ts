import { expect, test, type Page } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, waitForApp } from './helpers'

/**
 * 로그아웃 → 다른 계정으로 로그인.
 *
 * 우리 세션을 지워도 카카오 쪽 로그인 세션(kauth.kakao.com 쿠키)은 브라우저에 남는다.
 * 그래서 로그아웃 직후 '카카오로 로그인'을 누르면 카카오가 같은 계정으로 자동 로그인시켜
 * 다른 계정으로 들어갈 길이 없었다. 로그아웃 뒤 첫 로그인은 authorize에 prompt=login을 실어
 * 카카오 로그인 화면을 강제로 띄워야 한다 — 이 파일은 그 URL을 가로채 확인한다.
 *
 * 세션은 supabase-js가 읽는 localStorage 키에 가짜 세션을 심어 만든다(네트워크는 전부 가로챈다).
 */

/** auth.ts의 실제 키 문자열 — 오타가 나면 "표식 없음"을 확인하는 늘-통과 테스트가 된다 */
const REAUTH_KEY = 'nuri-mind-kakao-reauth'
const LOCAL_UID_KEY = 'nuri-mind-econ-local-uid'
const UID = 'e2e-kakao-user-a'

/** VITE_SUPABASE_URL의 첫 호스트 라벨로 supabase-js가 만드는 저장 키 — CI와 로컬 모두 같은 더미 URL을 쓴다 */
function sessionKey(): string {
  const url = process.env.VITE_SUPABASE_URL ?? 'https://ci-dummy-not-a-real-project.supabase.co'
  return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`
}

async function seedSession(page: Page): Promise<void> {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + 3600
  const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: UID, exp, role: 'authenticated', aud: 'authenticated' })}.sig`
  const session = {
    access_token: jwt,
    refresh_token: 'e2e-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: exp,
    user: { id: UID, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: { name: '카카오A' }, created_at: new Date().toISOString() },
  }
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [sessionKey(), JSON.stringify(session)] as const)
}

/** authorize로 떠나는 이동을 붙잡아 그 URL을 돌려준다(실제 카카오로는 나가지 않는다) */
async function captureAuthorize(page: Page): Promise<() => Promise<URL>> {
  let resolve!: (u: URL) => void
  const hit = new Promise<URL>((r) => (resolve = r))
  await page.route('**/auth/v1/authorize**', (route) => {
    resolve(new URL(route.request().url()))
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<main>kakao</main>' })
  })
  return () => hit
}

test.beforeEach(async ({ page }) => {
  // 서버 호출(동기화 RPC·getUser)은 전부 끊는다 — 세션 판정은 로컬 세션으로 하므로 로그인 상태는 유지된다
  await page.route('**/rest/v1/**', (r) => r.abort())
  await page.route('**/auth/v1/user**', (r) => r.abort())
  await page.route('**/auth/v1/logout**', (r) => r.fulfill({ status: 204, body: '' }))
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })
})

test('로그아웃 후 첫 카카오 로그인은 계정 선택(prompt=login)으로 가고, 계정 경계도 함께 적용된다', async ({ page }) => {
  await seedSession(page)
  await page.goto('/profile')
  await waitForApp(page)

  const logout = page.getByRole('button', { name: /로그아웃/ })
  await expect(logout).toBeVisible()
  await logout.click()

  // 로그인 버튼으로 바뀌고, 게스트 프로필로 경계가 세워지고, 재인증 표식이 남는다
  const login = page.getByRole('button', { name: /카카오로 로그인/ })
  await expect(login).toBeVisible()
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), LOCAL_UID_KEY)).toBe('guest')
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), REAUTH_KEY)).toBe('1')

  const authorize = await captureAuthorize(page)
  await login.click()
  const url = await authorize()
  expect(url.searchParams.get('provider')).toBe('kakao')
  expect(url.searchParams.get('prompt')).toBe('login')
})

test('로그아웃한 적 없으면 prompt 없이 간다 — 평소 로그인은 카카오 자동 로그인 그대로', async ({ page }) => {
  await page.goto('/profile')
  await waitForApp(page)
  // 표식이 정말 없는 상태에서 출발했는지 먼저 못 박는다
  expect(await page.evaluate((k) => localStorage.getItem(k), REAUTH_KEY)).toBeNull()

  const authorize = await captureAuthorize(page)
  await page.getByRole('button', { name: /카카오로 로그인/ }).click()
  const url = await authorize()
  expect(url.searchParams.get('provider')).toBe('kakao')
  expect(url.searchParams.has('prompt')).toBe(false)
})
