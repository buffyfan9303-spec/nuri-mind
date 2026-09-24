import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { seedOnboarded } from './helpers'

/**
 * 접근성 자동 검사(axe-core) — 화면 낭독기·키보드 사용자가 막히는 '치명(critical)·심각(serious)' 위반만 게이트로 건다.
 *
 * 색 대비(color-contrast)는 제외한다: 그라데이션·반투명 배경 위 글자를 axe가 판정하지 못해
 * '확인 필요'와 오탐이 섞인다. 대비는 디자인 검증(실제 캡처 측정)으로 따로 본다.
 * 새 위반이 생기면 이 테스트가 막는다 — 기준을 낮추지 말고 화면을 고칠 것.
 */
const ROUTES = ['/', '/tests', '/profile', '/about', '/magazine', '/fortune', '/legal/privacy', '/account-deletion']

for (const route of ROUTES) {
  test(`접근성: ${route} — 치명·심각 위반 없음`, async ({ page }) => {
    await seedOnboarded(page)
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze()
    const blocking = violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes[0]?.target.join(' ')}`)
    expect(blocking, blocking.join('\n')).toEqual([])
  })
}
