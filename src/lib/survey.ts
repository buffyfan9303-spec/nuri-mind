import type { Survey } from '../data/types'

/**
 * 지금 참여 가능한 최고 보상 설문 — 홈 카드와 상단 띠가 **같은 것**을 가리켜야 한다.
 * 두 곳이 각자 고르면 띠는 A로, 카드는 B로 보내 사용자가 "방금 그 설문 어디 갔지"를 겪는다.
 *
 * 조건: 승인됨 · 내가 만든 게 아님 · 아직 참여 안 함.
 */
export function bestSurveyOf(surveys: Survey[], taken: string[]): Survey | undefined {
  return surveys
    .filter((sv) => sv.status === 'approved' && !sv.mine && !taken.includes(sv.id))
    .sort((a, b) => b.reward - a.reward)[0]
}
