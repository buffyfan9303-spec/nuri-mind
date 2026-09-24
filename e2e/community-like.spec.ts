import { test, expect } from '@playwright/test'
import { seedOnboarded } from './helpers'
import { LEGAL_VERSION } from '../src/data/legal'

/**
 * 좋아요 — 서버(set_like)가 확정한 숫자로 화면을 맞추는가.
 * 서버는 같은 기기·IP의 중복을 거절하므로 낙관적 +1과 다른 값을 돌려줄 수 있다(supabase/post-likes-2026-09.sql).
 * 옛 bump_like(누가 눌렀는지 모르는 ±1)를 부르지 않는지도 함께 본다.
 */
const POST = {
  id: '11111111-1111-4111-8111-111111111111',
  nick: '테스트 수달',
  avatar: null,
  badge: null,
  body: '좋아요 테스트 글',
  likes: 4,
  created_at: new Date().toISOString(),
  owner_hash: null,
}

test('좋아요: 서버가 돌려준 숫자로 표시하고 bump_like는 부르지 않는다', async ({ page }) => {
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })
  const calls: { fn: string; body: Record<string, unknown> }[] = []
  await page.route('**/rest/v1/posts**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([POST]) }),
  )
  await page.route('**/rest/v1/comments**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/rpc/**', (r) => {
    const fn = new URL(r.request().url()).pathname.split('/').pop() ?? ''
    calls.push({ fn, body: r.request().postDataJSON() ?? {} })
    if (fn === 'set_like')
      // 이미 다른 기기에서 눌러 둔 상태라 서버 확정값이 낙관적 +1(5)이 아니라 7이라고 가정
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ liked: true, likes: 7 }) })
    return r.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })

  await page.goto('/community')
  const like = page.getByRole('button', { name: /좋아요 4/ })
  await expect(like).toBeVisible()
  await like.click()

  await expect(page.getByRole('button', { name: /좋아요 7/ })).toBeVisible()
  const setLike = calls.find((c) => c.fn === 'set_like')
  expect(setLike?.body).toMatchObject({ pid: POST.id, want: true })
  expect(String(setLike?.body.did ?? '')).toMatch(/^[0-9a-f]{64}$/)
  expect(calls.some((c) => c.fn === 'bump_like')).toBe(false)
})
