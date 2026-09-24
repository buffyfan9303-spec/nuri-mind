/**
 * 실행 환경 판별 — 웹(브라우저·PWA)인가, 스토어 앱(Capacitor 네이티브 셸)인가.
 *
 * ⚠️ @capacitor/core를 여기서 정적 import하지 않는다. 웹 방문자 전원의 메인 번들에 네이티브 브리지가
 *    실리게 되기 때문(번들 예산 225KB). Capacitor 네이티브 셸은 페이지 스크립트보다 먼저
 *    window.Capacitor 전역을 주입하므로, 그 전역만 읽어도 판별이 정확하다.
 *    네이티브 플러그인은 lib/native.ts가 네이티브일 때만 동적 import 한다.
 */

interface CapacitorGlobal {
  isNativePlatform?: () => boolean
  getPlatform?: () => string
}

function cap(): CapacitorGlobal | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor
}

/** 스토어 앱(안드로이드·iOS 네이티브 셸) 안에서 도는가 */
export function isNativeApp(): boolean {
  try {
    return cap()?.isNativePlatform?.() === true
  } catch {
    return false
  }
}

export type AppPlatform = 'android' | 'ios' | 'web'

export function appPlatform(): AppPlatform {
  if (!isNativeApp()) return 'web'
  const p = cap()?.getPlatform?.()
  return p === 'ios' ? 'ios' : p === 'android' ? 'android' : 'web'
}

/**
 * 네이티브 앱의 OAuth 복귀 주소(커스텀 스킴). capacitor.config.ts의 appId와 같아야 하고,
 * Supabase → Authentication → URL Configuration → Redirect URLs 에 그대로 등록해야 한다(docs/STORE.md).
 */
export const NATIVE_APP_ID = 'kr.nuri.mind'
export const NATIVE_AUTH_CALLBACK = `${NATIVE_APP_ID}://auth-callback`

/** 웹 공개 주소 — 스토어 등록 정보·계정 삭제 안내에 쓰는 절대 URL의 기준 */
export const WEB_ORIGIN = 'https://www.nurimind.co.kr'
