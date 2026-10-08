import { test, expect, type Page } from '@playwright/test'
import { seedOnboarded } from './helpers'
import { LEGAL_VERSION } from '../src/data/legal'

/**
 * 실패를 조용히 삼키던 자리들(2026-10-08 오류 처리 감사):
 * 댓글 조회 실패를 '첫 댓글을 남겨보세요'로 보이던 것, 신고 전송 실패를 '접수됐어요'로 확정하던 것,
 * 이미지가 아닌 파일을 프로필 사진으로 고르면 아무 반응이 없던 것, 투명 PNG가 검정 배경으로 저장되던 것.
 */
const POST = {
  id: '22222222-2222-4222-8222-222222222222',
  nick: '다른 수달',
  avatar: null,
  badge: null,
  body: '댓글·신고 테스트 글',
  likes: 1,
  created_at: new Date().toISOString(),
  owner_hash: null,
}
const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })

async function community(page: Page, opts: { commentsFail?: boolean; reportFail?: boolean }) {
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })
  await page.route('**/rest/v1/posts**', (r) => r.fulfill(json([POST])))
  await page.route('**/rest/v1/comments**', (r) => (opts.commentsFail ? r.fulfill(json({ message: 'boom' }, 500)) : r.fulfill(json([]))))
  await page.route('**/rest/v1/reports**', (r) => (opts.reportFail ? r.fulfill(json({ message: 'boom' }, 500)) : r.fulfill({ status: 201, body: '' })))
  await page.route('**/rest/v1/rpc/**', (r) => r.fulfill(json(null)))
  await page.goto('/community')
  await expect(page.getByText('댓글·신고 테스트 글')).toBeVisible()
}

test('댓글을 못 불러오면 빈 상태가 아니라 실패 + 다시 시도', async ({ page }) => {
  await community(page, { commentsFail: true })
  await page.getByRole('button', { name: /^댓글 0$/ }).click()
  await expect(page.getByRole('alert').filter({ hasText: '댓글을 불러오지 못했어요' })).toBeVisible()
  await expect(page.getByText('첫 댓글을 남겨보세요')).toHaveCount(0)
})

test('댓글이 정말 없으면 빈 상태(실패 문구 없음)', async ({ page }) => {
  await community(page, {})
  await page.getByRole('button', { name: /^댓글 0$/ }).click()
  await expect(page.getByText('첫 댓글을 남겨보세요')).toBeVisible()
  await expect(page.getByText('댓글을 불러오지 못했어요')).toHaveCount(0)
})

test('신고 전송이 실패하면 "접수됐어요"라고 말하지 않는다', async ({ page }) => {
  await community(page, { reportFail: true })
  await page.getByRole('button', { name: /신고/ }).click()
  await expect(page.getByText('신고를 보내지 못했어요')).toBeVisible()
  await expect(page.getByText('신고가 접수됐어요')).toHaveCount(0)
})

test('신고가 서버에 가면 접수 안내', async ({ page }) => {
  await community(page, {})
  await page.getByRole('button', { name: /신고/ }).click()
  await expect(page.getByText('신고가 접수됐어요').first()).toBeVisible()
})

async function openPhotoPicker(page: Page) {
  await seedOnboarded(page, { consent: { v: LEGAL_VERSION, at: new Date().toISOString() } })
  await page.route('**/rest/v1/**', (r) => r.abort())
  await page.goto('/profile')
  await expect(page.locator('input[type="file"][accept="image/*"]')).toHaveCount(1)
}

test('이미지가 아닌 파일을 프로필 사진으로 고르면 안내가 뜬다', async ({ page }) => {
  await openPhotoPicker(page)
  await page.locator('input[type="file"]').setInputFiles({ name: 'notimage.png', mimeType: 'image/png', buffer: Buffer.from('this is not an image') })
  await expect(page.getByText('이 사진은 쓸 수 없어요')).toBeVisible()
})

test('투명 PNG 프로필 사진은 투명한 곳이 검정이 아니라 흰색으로 저장된다', async ({ page }) => {
  await openPhotoPicker(page)
  // 8x8 완전 투명 PNG를 브라우저에서 만든다
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = 8
    c.height = 8
    return c.toDataURL('image/png').split(',')[1]
  })
  await page.locator('input[type="file"]').setInputFiles({ name: 'clear.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') })
  // 저장된 dataURL의 가운데 픽셀이 흰색에 가까운지
  const px = await page.waitForFunction(async () => {
    const raw = localStorage.getItem('nuri-mind-v1')
    const url: string | undefined = raw ? JSON.parse(raw).state?.avatar?.dataUrl : undefined
    if (!url) return null
    const img = new Image()
    img.src = url
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    return Array.from(ctx.getImageData(img.width >> 1, img.height >> 1, 1, 1).data)
  })
  const [r, g, b] = (await px.jsonValue()) as number[]
  expect(Math.min(r, g, b)).toBeGreaterThan(240)
})
