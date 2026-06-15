import type { L } from './types'

/** 날짜 기반 회전 인덱스 (매일 바뀜, 결정론) */
export function dayIndex(len: number): number {
  const d = new Date()
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
  return doy % len
}

/** 오늘의 심리 한 줄 */
export const DAILY_LINES: L[] = [
  { ko: '“완벽하게”라는 말은 보통 “시작하지 않겠다”의 가면입니다.', en: '"Perfectly" is usually a mask for "I won\'t start."', ja: '「完璧に」は大抵「始めない」の仮面です。' },
  { ko: '기분은 사실이 아니라 날씨입니다. 지나갑니다.', en: 'Moods are weather, not facts. They pass.', ja: '気分は事実ではなく天気。過ぎていきます。' },
  { ko: '비교는 행복의 도둑입니다. 어제의 나하고만 겨루세요.', en: 'Comparison is the thief of joy. Only race yesterday-you.', ja: '比較は幸福の泥棒。昨日の自分とだけ競って。' },
  { ko: '쉬는 것은 게으름이 아니라 다음을 위한 충전입니다.', en: 'Rest isn\'t laziness — it\'s charging for what\'s next.', ja: '休むのは怠けではなく次への充電。' },
  { ko: '작은 습관 하나가 결심 백 개보다 강합니다.', en: 'One small habit beats a hundred resolutions.', ja: '小さな習慣一つが決意百個より強い。' },
  { ko: '감정에 이름을 붙이면, 감정이 당신을 덜 휘두릅니다.', en: 'Name an emotion and it loses some grip on you.', ja: '感情に名前をつけると、振り回されにくくなる。' },
  { ko: '거절은 당신을 지키는 가장 짧은 문장입니다.', en: '"No" is the shortest sentence that protects you.', ja: '断りはあなたを守る最短の一文。' },
  { ko: '집중은 무엇을 더하느냐가 아니라 무엇을 빼느냐입니다.', en: 'Focus is subtraction, not addition.', ja: '集中は足し算ではなく引き算。' },
]

/** 오늘의 챌린지 */
export const DAILY_CHALLENGES: L[] = [
  { ko: '오늘 알림 3개를 꺼보기', en: 'Turn off 3 notifications today', ja: '今日、通知を3つオフに' },
  { ko: '물 한 잔 마시고 3번 깊게 숨쉬기', en: 'Drink water, breathe deep 3 times', ja: '水を一杯、深呼吸3回' },
  { ko: '고마운 사람에게 한 줄 보내기', en: 'Text one line to someone you appreciate', ja: '感謝する人へ一言送る' },
  { ko: '할 일 딱 1개만 끝까지 마치기', en: 'Finish exactly one task to the end', ja: 'やること1つだけ最後まで' },
  { ko: '10분 산책하며 휴대폰 안 보기', en: '10-min walk, no phone', ja: '10分散歩、スマホは見ない' },
  { ko: '오늘 잘한 일 1가지 적어보기', en: 'Write one thing you did well today', ja: '今日うまくできた事を1つ書く' },
  { ko: '자기 전 스크린 30분 일찍 끄기', en: 'Turn off screens 30 min earlier tonight', ja: '寝る前、画面を30分早く消す' },
  { ko: '거절하고 싶었던 것 하나 거절하기', en: 'Say no to one thing you wanted to decline', ja: '断りたかった事を一つ断る' },
]

/** 기분 체크 5단계 */
export const MOODS: { emoji: string; label: L }[] = [
  { emoji: '😣', label: { ko: '힘듦', en: 'Rough', ja: 'つらい' } },
  { emoji: '😟', label: { ko: '울적', en: 'Low', ja: '沈む' } },
  { emoji: '😐', label: { ko: '그냥', en: 'Meh', ja: 'ふつう' } },
  { emoji: '🙂', label: { ko: '괜찮', en: 'Okay', ja: 'いい' } },
  { emoji: '😄', label: { ko: '최고', en: 'Great', ja: '最高' } },
]
