// 스토어 스크린샷 원본 캡처 — `npm run build` 뒤 `node scripts/store-shots.mjs`.
// 프로덕션 빌드(dist)를 vite preview로 띄우고 Chromium 1개로 찍는다. 끝나면 브라우저·서버를 닫는다.
// 앱(WebView)과 같은 화면이 되도록 window.Capacitor를 흉내 내 isNativeApp()=true로 만든다(광고 자리·가격 띠·랜덤박스 교환 숨김 반영).
// 외부 요청은 전부 막는다(광고·분석·Supabase 쓰기 없음). 결과 화면은 실제로 검사에 답해서 만든다(가짜 결과 주입 없음).
import { preview } from 'vite'
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'docs/store-assets')
const PORT = 4317
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
const state = { onboarded: true, nickname: '누리', lang: 'ko', points: 1280, consent: { v: '2026-10-05', at: today } }

const SHOTS = [
  ['01-home', '/'],
  ['02-test-intro', '/test/burnout'],
  ['03-test-question', '/test/burnout/run'], // 찍은 뒤 끝까지 답해 04-result를 찍는다
  ['05-cognitive', '/cog'],
  ['06-magazine', '/magazine'],
  ['07-fortune', '/fortune'],
  ['08-profile', '/profile'],
]
const SETS = [
  ['raw-390x844', { width: 390, height: 844 }], // 원본(1170×2532, 비율 2.16 — Play 업로드 불가)
  ['play-1080x1920', { width: 360, height: 640 }], // Play 업로드용(1080×1920, 비율 1.78)
]

const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'error' })
const browser = await chromium.launch()
const errors = []
let count = 0
try {
  for (const [dir, viewport] of SETS) {
    mkdirSync(join(OUT, dir), { recursive: true })
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce' })
    await ctx.addInitScript(([key, st]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ state: st, version: 5 }))
      window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', isPluginAvailable: () => false, Plugins: {} }
    }, ['nuri-mind-v1', state])
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === 'localhost' ? r.continue() : r.abort()))
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(`${dir} ${page.url()} ${e.message}`))
    const shot = async (name) => {
      await page.waitForTimeout(1200)
      await page.screenshot({ path: join(OUT, dir, `${name}.png`) })
      count++
    }
    for (const [name, path] of SHOTS) {
      await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'load' })
      await page.waitForSelector('main', { state: 'attached', timeout: 15_000 })
      await shot(name)
      if (name === '03-test-question') {
        for (let i = 0; i < 60 && !page.url().includes('/result/'); i++) {
          await page.locator('main button').nth(2).click({ timeout: 5_000 }).catch(() => {})
          await page.waitForTimeout(500)
        }
        if (!page.url().includes('/result/')) throw new Error('검사를 끝까지 진행하지 못함: ' + page.url())
        await shot('04-result')
      }
    }
    await ctx.close()
  }
} finally {
  await browser.close()
  await new Promise((res) => server.httpServer.close(res))
}
console.log('screenshots', count)
if (errors.length) console.log('page errors:\n' + errors.join('\n'))
if (count !== (SHOTS.length + 1) * SETS.length) process.exit(1)
