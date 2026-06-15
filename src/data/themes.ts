import type { L } from './types'

/** 커뮤니티 주간 주제 — 매주 회전. 쓸거리를 제공해 빈 피드를 채운다. */
export const WEEKLY_THEMES: L[] = [
  { ko: '내 검사 결과 중 가장 소름 돋았던 것', en: 'The most "wow, that\'s me" test result', ja: '一番ゾッとした検査結果' },
  { ko: '내 심리 동물과 찰떡이었던 순간', en: 'A moment your animal nailed you', ja: '心理どうぶつがドンピシャだった瞬間' },
  { ko: '요즘 나를 가장 지치게 하는 것', en: 'What\'s draining you lately', ja: '最近一番疲れること' },
  { ko: '내가 찾은 작은 회복 루틴 하나', en: 'One small recovery routine you found', ja: '見つけた小さな回復ルーティン' },
  { ko: '검사 후 바뀐 습관 하나', en: 'One habit that changed after a test', ja: '検査後に変わった習慣' },
  { ko: '"나만 이런가?" 싶은 심리 습관', en: 'A quirk you thought only you had', ja: '「自分だけ？」な心理クセ' },
  { ko: '이번 주 가장 뿌듯했던 순간', en: 'Your proudest moment this week', ja: '今週一番誇らしかった瞬間' },
  { ko: '내 동물상에게 해주고 싶은 말', en: 'What you\'d tell your animal self', ja: '自分のどうぶつに言いたい言葉' },
]

export function thisWeekTheme(): L {
  const week = Math.floor(Date.now() / (7 * 86400000))
  return WEEKLY_THEMES[week % WEEKLY_THEMES.length]
}
