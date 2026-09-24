/**
 * 로컬(기기) 기준 날짜 키 — 일일/월간 리셋이 사용자 자정·월초에 맞도록.
 * ⚠️ toISOString()은 UTC라 KST에서는 하루 경계가 오전 9시로 밀린다(출석·퀴즈·운세 무료횟수·
 *    상세운세 해제가 자정~09시 사이에 어긋나는 버그의 근원) — 날짜 키는 반드시 이 헬퍼로.
 */
const pad = (n: number) => String(n).padStart(2, '0')

/** 오늘(또는 offsetDays일 전)의 YYYY-MM-DD — 로컬 기준 */
export function localDay(offsetDays = 0): string {
  // ⚠️ 24h(ms) 빼기가 아니라 달력 날짜로 뺀다 — 서머타임 지역(en/ja 사용자 해외 거주)에서는
  //    전환 다음 날 자정~01시에 'now − 24h'가 이틀 전으로 떨어져 어제 출석이 끊긴 것으로 판정됐다.
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetDays)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 이번 달 YYYY-MM — 로컬 기준 */
export const localMonth = (): string => localDay().slice(0, 7)

/** 타임스탬프(ms)의 YYYY-MM-DD — 로컬 기준 */
export function localDayOf(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
