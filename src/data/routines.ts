import type { L, TestId } from './types'

/** 맞춤 7일 루틴 — 검사 결과의 솔루션을 매일 한 가지 행동으로 액션화 */
export interface Routine {
  emoji: string
  title: L
  days: L[] // 7개
}

export const ROUTINES: Partial<Record<TestId, Routine>> = {
  adhd: {
    emoji: '🎯',
    title: { ko: '7일 집중 회복 루틴', en: '7-Day Focus Routine', ja: '7日集中リセット' },
    days: [
      { ko: '휴대폰 다른 방에 두고 25분 집중하기', en: 'Phone in another room, focus 25 min', ja: 'スマホは別室、25分集中' },
      { ko: '오늘 할 일을 딱 3개만 적기', en: 'Write only 3 to-dos today', ja: 'やる事は3つだけ書く' },
      { ko: '알림 5개 꺼보기', en: 'Turn off 5 notifications', ja: '通知を5つオフ' },
      { ko: '한 번에 브라우저 탭 하나만 열기', en: 'One browser tab at a time', ja: 'タブは一つずつ' },
      { ko: '25분 집중 + 5분 휴식 2세트', en: '2 sets of 25-min focus + 5-min break', ja: '25分集中＋5分休憩×2' },
      { ko: '시작 전 "딱 5분만" 규칙 써보기', en: 'Use the "just 5 minutes" rule', ja: '「まず5分」ルール' },
      { ko: '한 주 돌아보고 가장 잘된 날 기록하기', en: 'Review the week, note your best day', ja: '週を振り返り最良の日を記録' },
    ],
  },
  burnout: {
    emoji: '🌱',
    title: { ko: '7일 번아웃 회복 루틴', en: '7-Day Recovery Routine', ja: '7日燃え尽き回復' },
    days: [
      { ko: '오늘 한 가지 부탁 거절하기', en: 'Say no to one request today', ja: '今日一つ断る' },
      { ko: '점심에 10분 산책하기', en: 'Take a 10-min walk at lunch', ja: '昼に10分散歩' },
      { ko: '자기 전 화면 30분 일찍 끄기', en: 'Screens off 30 min earlier', ja: '就寝30分前に画面オフ' },
      { ko: '"해야 할 일" 하나 내일로 미루기', en: 'Defer one task to tomorrow', ja: 'やる事を一つ明日へ' },
      { ko: '고마운 일 3가지 적기', en: 'Write 3 things you\'re grateful for', ja: '感謝を3つ書く' },
      { ko: '아무것도 안 하는 20분 갖기', en: 'Take 20 min doing nothing', ja: '何もしない20分' },
      { ko: '이번 주 에너지가 찼던 순간 기록하기', en: 'Note when you felt recharged', ja: '充電できた瞬間を記録' },
    ],
  },
  dopamine: {
    emoji: '🧘',
    title: { ko: '7일 도파민 디톡스', en: '7-Day Dopamine Detox', ja: '7日ドーパミンデトックス' },
    days: [
      { ko: '아침 첫 30분 폰 안 보기', en: 'No phone for first 30 min of the day', ja: '起床後30分スマホ無し' },
      { ko: 'SNS 앱 1개 알림 끄기', en: 'Turn off one social app\'s alerts', ja: 'SNS一つの通知オフ' },
      { ko: '식사 중에는 폰 안 보기', en: 'No phone during meals', ja: '食事中スマホ無し' },
      { ko: '숏폼 대신 10분 산책하기', en: '10-min walk instead of short videos', ja: 'ショート動画の代わりに散歩' },
      { ko: '자기 전 폰 거실에 두기', en: 'Leave phone outside the bedroom', ja: '寝室にスマホを持ち込まない' },
      { ko: '무료한 순간을 폰 없이 견뎌보기', en: 'Sit with boredom, no phone', ja: '退屈をスマホ無しで耐える' },
      { ko: '가장 길게 폰 안 본 시간 기록하기', en: 'Record your longest phone-free stretch', ja: '最長のスマホ無し時間を記録' },
    ],
  },
  resilience: {
    emoji: '🎋',
    title: { ko: '7일 마음 단단 루틴', en: '7-Day Resilience Routine', ja: '7日メンタル強化' },
    days: [
      { ko: '오늘 잘 넘긴 일 1가지 적기', en: 'Note one thing you handled well', ja: 'うまく乗り越えた事を1つ' },
      { ko: '힘든 감정에 이름 붙이기', en: 'Name a hard emotion', ja: '辛い感情に名前を' },
      { ko: '믿는 사람에게 안부 보내기', en: 'Reach out to someone you trust', ja: '信頼する人に連絡' },
      { ko: '통제 가능/불가능을 나눠 적기', en: 'List what you can vs can\'t control', ja: '制御可/不可を分けて書く' },
      { ko: '작은 성취 1개 만들기', en: 'Create one small win', ja: '小さな達成を一つ' },
      { ko: '5분 깊은 호흡하기', en: 'Do 5 min of deep breathing', ja: '5分の深呼吸' },
      { ko: '이번 주 가장 단단했던 순간 기록하기', en: 'Note your strongest moment this week', ja: '今週最も強かった瞬間を記録' },
    ],
  },
}
