import type { L } from './types'

/** 커뮤니티 '오늘의 주제' — 매일 회전. 쓸거리를 제공해 빈 피드를 채운다. */
export const DAILY_THEMES: L[] = [
  { ko: '내 검사 결과 중 가장 소름 돋았던 것', en: 'The most "wow, that\'s me" test result', ja: '一番ゾッとした検査結果' },
  { ko: '내 심리 동물과 찰떡이었던 순간', en: 'A moment your animal nailed you', ja: '心理どうぶつがドンピシャだった瞬間' },
  { ko: '요즘 나를 가장 지치게 하는 것', en: 'What\'s draining you lately', ja: '最近一番疲れること' },
  { ko: '내가 찾은 작은 회복 루틴 하나', en: 'One small recovery routine you found', ja: '見つけた小さな回復ルーティン' },
  { ko: '검사 후 바뀐 습관 하나', en: 'One habit that changed after a test', ja: '検査後に変わった習慣' },
  { ko: '"나만 이런가?" 싶은 심리 습관', en: 'A quirk you thought only you had', ja: '「自分だけ？」な心理クセ' },
  { ko: '오늘 가장 뿌듯했던 순간', en: 'Your proudest moment today', ja: '今日一番誇らしかった瞬間' },
  { ko: '내 동물상에게 해주고 싶은 말', en: 'What you\'d tell your animal self', ja: '自分のどうぶつに言いたい言葉' },
  { ko: '오늘 가장 고마웠던 사람', en: 'Who you\'re grateful for today', ja: '今日一番ありがたかった人' },
  { ko: '나를 웃게 한 사소한 것', en: 'A little thing that made you smile', ja: '笑顔にしてくれた小さなこと' },
  { ko: '요즘 빠져있는 도파민 한 가지', en: 'Your current dopamine obsession', ja: '今ハマっているドーパミン一つ' },
  { ko: '스트레스 풀리는 나만의 방법', en: 'Your go-to way to de-stress', ja: 'ストレス解消の自分流' },
  { ko: '오늘의 기분을 한 단어로', en: 'Today\'s mood in one word', ja: '今日の気分を一言で' },
  { ko: '최근 깨달은 나에 대한 사실', en: 'Something you recently realized about yourself', ja: '最近気づいた自分のこと' },
  { ko: '잠들기 전 머릿속을 맴도는 생각', en: 'The thought that loops before sleep', ja: '寝る前に頭を巡る考え' },
  { ko: '내일의 나에게 한마디', en: 'A note to tomorrow-you', ja: '明日の自分へ一言' },
]

const dayIdx = () => Math.floor(Date.now() / 86400000)

/** 오늘의 주제 (매일 0시 회전, 결정론적) */
export function todayTheme(): L {
  return DAILY_THEMES[dayIdx() % DAILY_THEMES.length]
}

/** @deprecated todayTheme()로 대체 — 기존 호출 호환용 */
export function thisWeekTheme(): L {
  return todayTheme()
}
