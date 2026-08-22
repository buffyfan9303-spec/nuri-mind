import { localDay } from './date'

/**
 * 운세 관련 경량 로컬 상태 — 퀘스트 판정·홈 띠 맛보기 기억용.
 * 포인트 경제와 무관한 UI 편의 값이라 zustand persist 대신 localStorage 직접 사용
 * (스토어 스키마·서버 경제 미러에 영향 없음).
 */
const SEEN_KEY = 'nuri-fortune-seen'
const ZODIAC_KEY = 'nuri-zodiac-pick'

/** 오늘 운세 화면을 열람했다고 기록 — /fortune 진입 시 호출 */
export function markFortuneSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, localDay())
  } catch {
    /* noop — 프라이빗 모드 등 */
  }
}

/** 오늘 운세를 열람했는지 — 오늘의 퀘스트 판정 */
export function fortuneSeenToday(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === localDay()
  } catch {
    return false
  }
}

/** 홈 띠 맛보기에서 고른 띠(쥐·소·… 한글). 미선택 시 '' */
export function getZodiacPick(): string {
  try {
    return localStorage.getItem(ZODIAC_KEY) || ''
  } catch {
    return ''
  }
}

export function setZodiacPick(z: string): void {
  try {
    localStorage.setItem(ZODIAC_KEY, z)
  } catch {
    /* noop */
  }
}
