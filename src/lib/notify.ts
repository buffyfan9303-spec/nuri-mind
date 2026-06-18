/**
 * 푸시/로컬 알림 추상화 — "🔥 연속 출석이 오늘 끊겨요" 리텐션 알림.
 *
 * 웹: Notification API는 백그라운드 예약이 불가해 실효성이 낮음(브라우저 열려 있어야 함).
 * APK(권장): Capacitor LocalNotifications 플러그인으로 매일 밤 예약.
 *   npm i @capacitor/local-notifications
 *   아래 TODO 지점에 LocalNotifications.schedule({...}) 연결.
 */
export function isNativeNotifyAvailable(): boolean {
  // TODO(APK): return Capacitor.isPluginAvailable('LocalNotifications')
  return false
}

/** 취침 전(예: 21시) "스트릭 끊김 임박" 알림 예약 — APK에서 구현 */
export async function scheduleStreakReminder(_enabled: boolean): Promise<void> {
  if (!isNativeNotifyAvailable()) return
  // TODO(APK): _enabled ? LocalNotifications.schedule(...) : LocalNotifications.cancel(...)
}

/** 아침(예: 9시) "오늘의 운세 보기" 재방문 알림 예약 — APK에서 구현 */
export async function scheduleFortuneReminder(_enabled: boolean): Promise<void> {
  if (!isNativeNotifyAvailable()) return
  // TODO(APK): _enabled
  //   ? LocalNotifications.schedule({ notifications: [{ id: 7, title: '🔮 오늘의 운세', body: '오늘의 기운을 확인해 보세요', schedule: { on: { hour: 9, minute: 0 }, repeats: true } }] })
  //   : LocalNotifications.cancel({ notifications: [{ id: 7 }] })
}
