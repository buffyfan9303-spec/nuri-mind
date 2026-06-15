import type { L } from './types'

/** 업적 평가에 쓰는 현재 상태 스냅샷 */
export interface AchCtx {
  resultCount: number // 검사 완료 횟수
  testCount: number // 서로 다른 검사 종류 수
  dexCount: number // 수집한 동물 수
  streak: number // 연속 출석
  shares: number // 결과 공유 횟수
  surveys: number // 설문 참여 수
  firstPost: boolean // 커뮤니티 첫 글
  lifetime: number // 누적 적립 포인트
  invited: number // 초대한 친구 수
}

export interface Achievement {
  id: string
  emoji: string
  title: L
  desc: L
  check: (c: AchCtx) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_test',
    emoji: '🌱',
    title: { ko: '첫 발걸음', en: 'First Step', ja: '最初の一歩' },
    desc: { ko: '첫 검사를 완료했어요', en: 'Completed your first test', ja: '初めての検査を完了' },
    check: (c) => c.resultCount >= 1,
  },
  {
    id: 'explorer',
    emoji: '🧭',
    title: { ko: '탐험가', en: 'Explorer', ja: '探検家' },
    desc: { ko: '검사 4종을 완료했어요', en: 'Completed 4 different tests', ja: '4種類の検査を完了' },
    check: (c) => c.testCount >= 4,
  },
  {
    id: 'master',
    emoji: '👑',
    title: { ko: '검사 마스터', en: 'Test Master', ja: '検査マスター' },
    desc: { ko: '8종 검사를 전부 완료했어요', en: 'Completed all 8 tests', ja: '8種類すべて完了' },
    check: (c) => c.testCount >= 8,
  },
  {
    id: 'collector',
    emoji: '🗂️',
    title: { ko: '수집가', en: 'Collector', ja: 'コレクター' },
    desc: { ko: '동물 10마리를 모았어요', en: 'Collected 10 animals', ja: 'どうぶつ10匹を収集' },
    check: (c) => c.dexCount >= 10,
  },
  {
    id: 'dex_done',
    emoji: '🏆',
    title: { ko: '도감 완성', en: 'Dex Complete', ja: '図鑑コンプ' },
    desc: { ko: '동물 25마리를 전부 모았어요', en: 'Collected all 25 animals', ja: '25匹すべて収集' },
    check: (c) => c.dexCount >= 25,
  },
  {
    id: 'streak3',
    emoji: '🔥',
    title: { ko: '불씨', en: 'Spark', ja: '火種' },
    desc: { ko: '3일 연속 출석했어요', en: '3-day streak', ja: '3日連続出席' },
    check: (c) => c.streak >= 3,
  },
  {
    id: 'streak7',
    emoji: '⚡',
    title: { ko: '열정', en: 'On Fire', ja: '情熱' },
    desc: { ko: '7일 연속 출석했어요', en: '7-day streak', ja: '7日連続出席' },
    check: (c) => c.streak >= 7,
  },
  {
    id: 'evangelist',
    emoji: '📤',
    title: { ko: '전도사', en: 'Evangelist', ja: '伝道師' },
    desc: { ko: '결과를 처음 공유했어요', en: 'Shared a result', ja: '結果を初シェア' },
    check: (c) => c.shares >= 1,
  },
  {
    id: 'social',
    emoji: '💬',
    title: { ko: '수다쟁이', en: 'Chatterbox', ja: 'おしゃべり' },
    desc: { ko: '커뮤니티에 첫 글을 썼어요', en: 'Posted in the community', ja: 'コミュニティに初投稿' },
    check: (c) => c.firstPost,
  },
  {
    id: 'survey',
    emoji: '📋',
    title: { ko: '참여왕', en: 'Participant', ja: '参加王' },
    desc: { ko: '설문에 처음 참여했어요', en: 'Took a survey', ja: 'アンケートに初参加' },
    check: (c) => c.surveys >= 1,
  },
  {
    id: 'rich',
    emoji: '💎',
    title: { ko: '부자', en: 'Rich', ja: 'お金持ち' },
    desc: { ko: '누적 1,000P를 모았어요', en: 'Earned 1,000P total', ja: '累計1,000P達成' },
    check: (c) => c.lifetime >= 1000,
  },
  {
    id: 'inviter',
    emoji: '🤝',
    title: { ko: '인싸', en: 'Connector', ja: '人気者' },
    desc: { ko: '친구를 초대했어요', en: 'Invited a friend', ja: '友達を招待' },
    check: (c) => c.invited >= 1,
  },
]
