import type { ConsoleMessage, Page } from '@playwright/test'

/**
 * 핵심 흐름 스펙 공용 — 콘솔 에러 수집 + 외부 네트워크 차단.
 *
 * 의도적으로 막은 요청(광고·더미 Supabase)이 만드는 'Failed to load resource' 줄만 제외한다.
 * 앱 코드가 던진 에러(pageerror, 번들 안의 console.error)는 제외하지 않는다.
 */

/** 의도적으로 막거나 실패시키는 요청의 URL */
export const BLOCKED_URL = /googlesyndication\.com|doubleclick\.net|googleads\.g\.|adtrafficquality\.google|ci-dummy-not-a-real-project\.supabase\.co|googletagmanager|google-analytics/

export async function blockExternal(page: Page): Promise<void> {
  await page.route(BLOCKED_URL, (r) => r.abort())
}

export function collectConsoleErrors(page: Page, extraIgnoreUrl?: RegExp) {
  const errors: string[] = []
  const ignored = (m: ConsoleMessage) => {
    const url = m.location().url ?? ''
    const text = m.text()
    const isNetNoise = /Failed to load resource|net::ERR_/.test(text)
    return isNetNoise && (BLOCKED_URL.test(url) || BLOCKED_URL.test(text) || (extraIgnoreUrl?.test(url) ?? false))
  }
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    if (ignored(m)) return
    errors.push(`console.error: ${m.text()} @ ${m.location().url}`)
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  return {
    list: () => errors,
    format: () => `콘솔 에러 ${errors.length}건:\n${errors.join('\n')}`,
  }
}
