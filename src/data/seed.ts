import type { Survey, ShopItem, Offer, CommunityPost } from './types'

/**
 * 시드 설문 — 비어 있다. 예전 데모 설문(가짜 응답 수 포함)은 실제 사용자 데이터처럼 보여 애드센스 '가치 낮은 콘텐츠'
 * 판정과 신뢰에 불리해 삭제했다. 실제 설문은 사용자 등록 → 운영자 승인 경로로만 들어온다.
 */
export const SEED_SURVEYS: Survey[] = []

/** 예전에 시드로 심었던 데모 설문 id — persist v5 이관에서 기존 사용자 기기의 사본을 지우는 데 쓴다 */
export const LEGACY_SEED_SURVEY_IDS = ['sv_morning', 'sv_game', 'sv_store', 'sv_pending_demo']

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'item_freeze',
    emoji: '❄️',
    name: { ko: '연속 출석 복구권', en: 'Streak Recovery', ja: 'ストリーク復活' },
    desc: { ko: '하루 빠져도 연속 출석 유지 · 즉시 지급', en: 'Miss a day, keep your streak · instant', ja: '1日休んでも連続出席を維持・即時付与' },
    cost: 300,
  },
  {
    id: 'gift_culture',
    emoji: '🎫',
    name: { ko: '문화상품권 5,000원', en: 'Culture Gift Card ₩5,000', ja: '文化商品券 5,000W' },
    desc: { ko: '온라인 사용 가능한 핀번호 발송', en: 'PIN code sent for online use', ja: 'オンライン利用可能なPIN送付' },
    cost: 5000,
  },
  {
    id: 'gift_coffee',
    emoji: '☕',
    name: { ko: '아메리카노 기프티콘', en: 'Americano e-Gift', ja: 'アメリカーノギフト券' },
    desc: { ko: '주요 프랜차이즈 교환권', en: 'Major franchise voucher', ja: '主要チェーン交換券' },
    cost: 4500,
  },
  {
    id: 'gift_convenience',
    emoji: '🏪',
    name: { ko: '편의점 3,000원권', en: 'Convenience Store ₩3,000', ja: 'コンビニ3,000W券' },
    desc: { ko: '전국 주요 편의점 사용 가능', en: 'Usable at major chains', ja: '主要コンビニで利用可' },
    cost: 3000,
  },
  {
    id: 'donate',
    emoji: '💝',
    name: { ko: '아동센터 학용품 후원', en: 'Donate School Supplies', ja: '子どもセンターへ文具寄付' },
    desc: { ko: '내 이름으로 후원 물품 전달', en: 'Goods donated in your name', ja: 'あなたの名前で物品支援' },
    cost: 1000,
  },
  {
    id: 'randombox',
    emoji: '🎁',
    name: { ko: '포인트 랜덤박스', en: 'Point Random Box', ja: 'ポイントランダムボックス' },
    desc: { ko: '500P~5,000P 랜덤 지급 이벤트', en: 'Random 500–5,000P event', ja: '500~5,000Pランダム支給' },
    cost: 1500,
  },
]

/**
 * 오퍼월 미션 — 고보상 적립의 핵심 재원.
 * 실서비스: 애디슨(NBT)·애드팝콘(IGAWorks) 등 오퍼월 SDK 연동 시 이 목록이 실시간 미션으로 대체됨.
 * reward는 매체 수익의 일부를 유저에게 환원하는 예시값(실제는 광고주 단가에 따름).
 */
export const OFFERS: Offer[] = [
  {
    id: 'of_card',
    emoji: '💳',
    title: { ko: '카드 발급 (무료 연회비)', en: 'Get a free-fee credit card', ja: 'カード発行（年会費無料）' },
    desc: { ko: '발급 완료 시 — 오퍼월 최고 보상', en: 'On approval — top offerwall reward', ja: '発行完了で — オファーウォール最高報酬' },
    reward: 8000,
    ready: false,
  },
  {
    id: 'of_fin',
    emoji: '🏦',
    title: { ko: '증권/핀테크 앱 계좌 개설', en: 'Open a brokerage/fintech account', ja: '証券・フィンテック口座開設' },
    desc: { ko: '본인 인증 + 계좌 연동 시 적립', en: 'Credited after ID + account link', ja: '本人認証＋口座連携で付与' },
    reward: 5000,
    ready: false,
  },
  {
    id: 'of_sub',
    emoji: '🎬',
    title: { ko: 'OTT 무료 체험 구독', en: 'Free-trial an OTT subscription', ja: 'OTT無料体験登録' },
    desc: { ko: '체험 등록 완료 시 적립', en: 'Credited on trial sign-up', ja: '体験登録完了で付与' },
    reward: 1500,
    ready: false,
  },
  {
    id: 'of_game',
    emoji: '🎮',
    title: { ko: '게임 설치 + 7일 플레이', en: 'Install a game + play 7 days', ja: 'ゲーム導入＋7日プレイ' },
    desc: { ko: '레벨/일수 미션 달성 시 적립', en: 'Credited on level/day milestones', ja: 'レベル・日数達成で付与' },
    reward: 900,
    ready: false,
  },
  {
    id: 'of_walk',
    emoji: '🏃',
    title: { ko: '만보기 앱 설치 + 회원가입', en: 'Install pedometer app + sign up', ja: '歩数計アプリ導入＋会員登録' },
    desc: { ko: '첫 1,000보 기록 시 적립', en: 'Credited at your first 1,000 steps', ja: '最初の1,000歩記録で付与' },
    reward: 250,
    ready: false,
  },
]

/**
 * 커뮤니티 시드 글 — 비어 있다. 예전 시드는 지어낸 닉네임·좋아요 수의 가짜 사용자 글이라 삭제했다
 * (실제 이용자 글처럼 보이는 조작 콘텐츠 = 신뢰·애드센스 심사 모두에 불리). id가 'po_seed'로 시작하던 글은 v5 이관에서 지운다.
 */
export const SEED_POSTS: CommunityPost[] = []
