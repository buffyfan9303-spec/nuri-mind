import { expect, test, type Page, type Route } from '@playwright/test'
import { LEGAL_VERSION } from '../src/data/legal'
import { seedOnboarded, waitForApp } from './helpers'

/**
 * 아이디·비밀번호 로그인/회원가입. Supabase 응답은 가로챈다(실제 계정을 만들지 않는다).
 * 아이디는 내부 주소(<id>@id.nurimind.co.kr)로 바뀌어 password grant / signup 으로 간다.
 */
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
function session(uid: string) {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const user = { id: uid, aud: 'authenticated', role: 'authenticated', email: 'tester01@id.nurimind.co.kr', app_metadata: {}, user_metadata: { nickname: 'tester01' }, created_at: new Date().toISOString() }
  return {
    access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: uid, exp, role: 'authenticated', aud: 'authenticated' })}.sig`,
    refresh_token: 'e2e-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user,
  }
}
// 실제 GoTrue 오류 형식 — supabase-js는 이 헤더가 있을 때 error_code를 error.code로 읽는다
const json = (r: Route, status: number, body: object) =>
  r.fulfill({ status, contentType: 'application/json', headers: { 'x-supabase-api-version': '2024-01-01' }, body: JSON.stringify(body) })

async function open(page: Page) {
  await page.goto('/login')
  await waitForApp(page)
  await expect(page.getByRole('tab', { name: '로그인' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.route('**/rest/v1/**', (r) => r.abort())
  await page.route('**/auth/v1/settings**', (r) => json(r, 200, { external: { kakao: true, google: false, email: true } }))
  await page.route('**/auth/v1/user**', (r) => r.abort())
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })
})

test('로그인 성공 — 내부 주소로 password grant, 프로필로 가서 로그아웃이 보인다', async ({ page }) => {
  let body: Record<string, string> = {}
  await page.route('**/auth/v1/token?grant_type=password', (r) => {
    body = r.request().postDataJSON()
    return json(r, 200, session('e2e-id-user'))
  })
  await open(page)
  await page.getByLabel('아이디').fill(' Tester01 ')
  await page.getByLabel('비밀번호', { exact: true }).fill('password123')
  await page.getByRole('button', { name: '로그인', exact: true }).click()
  await expect(page).toHaveURL(/\/profile$/)
  expect(body.email).toBe('tester01@id.nurimind.co.kr')
  await expect(page.getByRole('button', { name: /로그아웃/ })).toBeVisible()
})

test('로그인 실패 — 틀린 비밀번호는 안내 문구, 화면에 남는다', async ({ page }) => {
  await page.route('**/auth/v1/token?grant_type=password', (r) => json(r, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }))
  await open(page)
  await page.getByLabel('아이디').fill('tester01')
  await page.getByLabel('비밀번호', { exact: true }).fill('wrongpass')
  await page.getByRole('button', { name: '로그인', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('아이디나 비밀번호가 맞지 않아요.')
  await expect(page).toHaveURL(/\/login$/)
})

test('회원가입 — 규칙 검사는 서버에 보내기 전에, 이미 있는 아이디는 안내', async ({ page }) => {
  let calls = 0
  await page.route('**/auth/v1/signup**', (r) => {
    calls++
    return json(r, 422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' })
  })
  await open(page)
  await page.getByRole('tab', { name: '회원가입' }).click()
  const submit = page.getByRole('button', { name: '가입하고 시작하기' })

  await page.getByLabel('아이디').fill('ab')
  await page.getByLabel('비밀번호', { exact: true }).fill('password123')
  await page.getByLabel('비밀번호 확인').fill('password123')
  await submit.click()
  await expect(page.getByRole('alert')).toContainText('4~20자')

  await page.getByLabel('아이디').fill('tester01')
  await page.getByLabel('비밀번호 확인').fill('different1')
  await submit.click()
  await expect(page.getByRole('alert')).toHaveText('비밀번호 확인이 달라요.')

  await page.getByLabel('비밀번호', { exact: true }).fill('short')
  await page.getByLabel('비밀번호 확인').fill('short')
  await submit.click()
  await expect(page.getByRole('alert')).toContainText('8자 이상')
  expect(calls).toBe(0)

  await page.getByLabel('비밀번호', { exact: true }).fill('password123')
  await page.getByLabel('비밀번호 확인').fill('password123')
  await submit.click()
  await expect(page.getByRole('alert')).toHaveText('이미 쓰고 있는 아이디예요.')
  expect(calls).toBe(1)
})

test('회원가입 성공 — 세션이 오면 프로필로', async ({ page }) => {
  await page.route('**/auth/v1/signup**', (r) => json(r, 200, session('e2e-id-new')))
  await open(page)
  await page.getByRole('tab', { name: '회원가입' }).click()
  await page.getByLabel('아이디').fill('newuser_1')
  await page.getByLabel('비밀번호', { exact: true }).fill('password123')
  await page.getByLabel('비밀번호 확인').fill('password123')
  await page.getByRole('button', { name: '가입하고 시작하기' }).click()
  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('button', { name: /로그아웃/ })).toBeVisible()
})
