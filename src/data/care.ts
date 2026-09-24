/**
 * 전문가(정신건강의학과·상담)와 이야기해 보길 권하는 결과 구간 — 결과 화면과 '나에 관하여'가 같은 기준을 쓴다.
 * 진단 기준이 아니다. 자기보고 선별 척도에서 '혼자 견디기보다 도움을 받아 보면 좋은' 높은 구간만 고른다.
 */
import type { TestId } from './types'

export const CARE_BANDS: Partial<Record<TestId, string[]>> = {
  adhd: ['high'],
  burnout: ['high'],
  dopamine: ['high'],
  love: ['fearful'],
  selfesteem: ['low'],
  perfect: ['strain'],
  socialanx: ['high'],
}

export function needsCare(testId: TestId, band: string): boolean {
  return CARE_BANDS[testId]?.includes(band) ?? false
}
