import type { Lang } from '../data/types'

/**
 * 화면에 보이는 숫자·날짜의 공통 모양.
 *
 * 왜 한곳에: '상위 %'를 화면마다 따로 계산해서 같은 결과가 '상위 1%'(나에 관하여)와 '상위 0.5%'(결과 화면)로
 * 다르게 보였고, 반올림을 빠뜨린 곳은 부동소수점 오차가 그대로 나왔다(예: 100 − 83.7 → 16.299999999999997).
 */

/** 소수 첫째 자리까지 반올림. 끝이 .0이면 정수로(12.0 → 12) */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** 백분위(0~100, 높을수록 상위) → '상위 몇 %'. 0.5 미만은 0.5로 — '상위 0%'는 말이 안 되니까 */
export function topPercentOf(percentile: number): number {
  return Math.max(0.5, round1(100 - percentile))
}

/**
 * 결과 날짜 — '9월 24일'처럼 짧게. 올해가 아니면 연도를 붙인다.
 * toLocaleDateString 기본값('2026. 9. 24.')은 문장 가운데서 끝의 마침표가 어색하다.
 */
export function shortDate(ms: number, lang: Lang): string {
  const d = new Date(ms)
  const locale = lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR'
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString(locale, sameYear ? { month: 'long', day: 'numeric' } : { year: 'numeric', month: 'long', day: 'numeric' })
}
