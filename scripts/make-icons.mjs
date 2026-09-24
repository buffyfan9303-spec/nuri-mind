/**
 * 앱 아이콘 PNG 생성 — public/icon.svg 하나가 원본이다. `node scripts/make-icons.mjs`
 *
 * 스토어 아이콘은 모서리 투명이 없는 꽉 찬 정사각형이어야 한다(iOS 1024는 알파 금지, 모서리는 OS가 깎는다).
 * 그래서 SVG의 둥근 모서리(rx)를 0으로 바꿔 렌더한다. 이미 설치된 Playwright(Chromium)로 그린다 — 새 의존성 없음.
 *   public/icons/icon-192.png, icon-512.png   웹 매니페스트(maskable 겸용)
 *   resources/icon.png (1024)                 스토어 등록·네이티브 아이콘 원본(@capacitor/assets 입력)
 */
import { readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(ROOT, 'public/icon.svg'), 'utf8').replace(/(<rect[^>]*?)\s+rx="[^"]*"/, '$1')

const out = [
  [192, 'public/icons/icon-192.png'],
  [512, 'public/icons/icon-512.png'],
  [1024, 'resources/icon.png'],
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const [size, rel] of out) {
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true })
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<html><body style="margin:0;background:#fff">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`,
  )
  await page.screenshot({ path: join(ROOT, rel), omitBackground: false })
  console.log(`✅ ${rel} (${size}px)`)
}
await browser.close()
