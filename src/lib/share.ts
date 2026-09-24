/**
 * 공유 — 스토어 앱은 네이티브 공유 시트, 웹은 Web Share, 둘 다 없으면 클립보드 복사.
 *
 * 왜 따로 두나: 안드로이드 앱(WebView)에는 navigator.share가 없다. 그래서 앱에서는 공유 버튼이
 * 전부 '복사'로만 동작했다. @capacitor/share는 네이티브일 때만 동적 import 한다 —
 * 웹 방문자의 메인 번들에 네이티브 브리지가 실리지 않게(platform.ts와 같은 원칙).
 *
 * 결과로 무엇이 일어났는지 돌려준다. 화면은 'copied'일 때만 '복사됐어요'를 보여 주고,
 * 'cancelled'(사용자가 시트를 닫음)는 실패가 아니므로 클립보드를 덮어쓰지 않는다.
 */
import { isNativeApp } from './platform'

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

export interface SharePayload {
  title?: string
  text: string
  url?: string
  /** 복사로 떨어질 때 쓸 문자열(기본: text + ' ' + url) */
  copyText?: string
}

function isCancel(e: unknown): boolean {
  if (e instanceof DOMException && e.name === 'AbortError') return true
  // @capacitor/share: 안드로이드·iOS 모두 사용자가 시트를 닫으면 'Share canceled'로 reject
  const msg = e instanceof Error ? e.message : String(e ?? '')
  return /cancel/i.test(msg)
}

async function copy(p: SharePayload): Promise<ShareOutcome> {
  try {
    await navigator.clipboard.writeText(p.copyText ?? (p.url ? `${p.text} ${p.url}` : p.text))
    return 'copied'
  } catch {
    return 'failed'
  }
}

export async function shareOrCopy(p: SharePayload): Promise<ShareOutcome> {
  if (isNativeApp()) {
    try {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title: p.title, text: p.text, url: p.url })
      return 'shared'
    } catch (e) {
      if (isCancel(e)) return 'cancelled'
      return copy(p)
    }
  }
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: p.title, text: p.text, url: p.url })
      return 'shared'
    } catch (e) {
      if (isCancel(e)) return 'cancelled'
      // 권한·형식 오류 등 — 복사로라도 전달한다
    }
  }
  return copy(p)
}
