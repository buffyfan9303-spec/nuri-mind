/**
 * 과제 주기(매일/주 1회) 판정 — **의존성이 없어야 하는** 모듈.
 *
 * 왜 growth.ts에서 떼어냈나: 스토어(useStore)가 완료 판정을 쓰려고 growth.ts를 import 하는 순간
 * 그 파일이 정적으로 끌고 있는 페르소나 처방 전문(animalTranslations, gzip 184KB)이 통째로
 * 메인 번들에 들어왔다. 번들 가드가 289KB로 잡아냈다(예산 225KB).
 *
 * 판정 규칙은 화면(GrowthPlan)과 스토어가 **같은 것**을 써야 한다. 각자 구현하면
 * '화면은 완료로 보이는데 저장은 미완료'가 되어 체크 해제가 재지급으로 둔갑한다 — 실제로 그랬다.
 * 그래서 지우지 않고 여기로 옮겨 둘 다 이걸 보게 한다(growth.ts는 재수출).
 */
export type Cadence = 'daily' | 'weekly'

/** 주간 과제의 기준 주(월요일 시작) 키 — 주 1회 완료 판정용 */
export function weekKeyOfDay(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  const dow = (dt.getDay() + 6) % 7 // 월=0
  dt.setDate(dt.getDate() - dow)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

/** 오늘(또는 이번 주) 기준으로 이 과제가 완료됐는지 */
export function isTaskDone(done: string[] | undefined, cadence: Cadence, todayKey: string): boolean {
  if (!done?.length) return false
  if (cadence === 'daily') return done.includes(todayKey)
  const wk = weekKeyOfDay(todayKey)
  return done.some((d) => weekKeyOfDay(d) === wk)
}
