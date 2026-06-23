/**
 * 햅틱 — 지원 기기(주로 Android Chrome)에서 미세 진동으로 네이티브 촉감을 더한다.
 * iOS Safari·미지원 기기에서는 안전한 no-op(에러 없음). 짧게(6~16ms)만 써서 거슬리지 않게.
 */
export function haptic(pattern: number | number[] = 8): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    /* 무시 */
  }
}
