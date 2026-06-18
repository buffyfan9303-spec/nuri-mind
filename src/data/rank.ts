import type { L, LedgerEntry } from './types'

/**
 * 랭크 등급 시스템 — "누적 적립 이력"을 등급으로 치환.
 * 포인트를 사용(교환)해도 등급은 절대 내려가지 않는다 (lifetime earned 기준).
 * 등급이 오를수록 권한이 열린다: 설문 등록 → 체험단 → VIP 체험단 → 수익 셰어.
 */
export interface Tier {
  id: string
  emoji: string
  /** 누적 적립 포인트 최소치 */
  min: number
  color: string
  grad: [string, string]
  name: L
  perks: L[]
}

export const TIERS: Tier[] = [
  {
    id: 'seed',
    emoji: '🌱',
    min: 0,
    color: '#7CA98F',
    grad: ['#9BC4B2', '#C8E3D5'],
    name: { ko: '새싹', en: 'Seed', ja: '芽生え' },
    perks: [
      { ko: '검사 3종 · 설문 참여 · 출석 적립', en: 'All tests · join surveys · daily check-in', ja: '検査3種・アンケート参加・出席' },
      { ko: '포인트 상점 교환 신청', en: 'Point shop redemption', ja: 'ポイントショップ交換' },
    ],
  },
  {
    id: 'bronze',
    emoji: '🥉',
    min: 300,
    color: '#C8824A',
    grad: ['#D99A62', '#C8824A'],
    name: { ko: '브론즈', en: 'Bronze', ja: 'ブロンズ' },
    perks: [
      { ko: '설문 등록 권한 해금 (내 설문 만들기)', en: 'Unlock survey creation', ja: 'アンケート作成権限を解禁' },
      { ko: '📊 등급 뱃지·랭킹 노출', en: 'Tier badge & ranking', ja: 'ティアバッジ・ランキング表示' },
    ],
  },
  {
    id: 'silver',
    emoji: '🥈',
    min: 1500,
    color: '#8C9BA8',
    grad: ['#AEBCC9', '#8C9BA8'],
    name: { ko: '실버', en: 'Silver', ja: 'シルバー' },
    perks: [
      { ko: '정규 체험단(실물 제품) 신청 가능', en: 'Apply to product tryout campaigns', ja: '正規体験団（実物）に応募可能' },
      { ko: '출석 보너스 +2P', en: 'Check-in bonus +2P', ja: '出席ボーナス +2P' },
    ],
  },
  {
    id: 'gold',
    emoji: '🥇',
    min: 5000,
    color: '#E0A52E',
    grad: ['#F2C14E', '#E0A52E'],
    name: { ko: '골드', en: 'Gold', ja: 'ゴールド' },
    perks: [
      { ko: '체험단 우선 선정 + 고보상 베타테스트', en: 'Priority selection + high-reward beta tests', ja: '体験団優先選定＋高報酬ベータ' },
      { ko: '교환 신청 우선 처리', en: 'Priority redemption processing', ja: '交換申請の優先処理' },
    ],
  },
  {
    id: 'platinum',
    emoji: '💎',
    min: 15000,
    color: '#5EA8D8',
    grad: ['#7FC0E8', '#5EA8D8'],
    name: { ko: '플래티넘', en: 'Platinum', ja: 'プラチナ' },
    perks: [
      { ko: 'VIP 체험단(고가 제품) 신청 가능', en: 'VIP tryouts for premium products', ja: 'VIP体験団（高額製品）応募可' },
      { ko: '신규 기능 얼리액세스', en: 'Early access to new features', ja: '新機能アーリーアクセス' },
    ],
  },
  {
    id: 'master',
    emoji: '👑',
    min: 40000,
    color: '#9B7BE8',
    grad: ['#B69BF2', '#9B7BE8'],
    name: { ko: '마스터', en: 'Master', ja: 'マスター' },
    perks: [
      { ko: '명예의 전당 + 오프라인 이벤트 초청', en: 'Hall of fame + offline event invites', ja: '殿堂入り＋オフラインイベント招待' },
      { ko: '파트너 수익 셰어 프로그램 (베타)', en: 'Partner revenue-share program (beta)', ja: 'パートナー収益シェア（β）' },
    ],
  },
]

/** 누적 적립 = 원장에서 +적립의 합 (사용해도 등급 유지) */
export const lifetimeOf = (ledger: LedgerEntry[]): number =>
  ledger.reduce((a, e) => (e.amount > 0 ? a + e.amount : a), 0)

export const tierOf = (lifetime: number): Tier =>
  [...TIERS].reverse().find((t) => lifetime >= t.min) ?? TIERS[0]

export const nextTierOf = (lifetime: number): Tier | null => {
  const cur = tierOf(lifetime)
  const idx = TIERS.findIndex((t) => t.id === cur.id)
  return TIERS[idx + 1] ?? null
}

export const tierAtLeast = (lifetime: number, tierId: string): boolean => {
  const need = TIERS.find((t) => t.id === tierId)
  return need ? lifetime >= need.min : true
}

/* ── 체험단 캠페인 시드 (실서비스: 운영자가 등록 → Supabase) ── */
export interface Experience {
  id: string
  emoji: string
  minTier: string
  slots: number
  applied: number
  reward: L
  title: L
  desc: L
  closesInDays: number
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'ex_drink',
    emoji: '🧋',
    minTier: 'gold',
    slots: 30,
    applied: 18,
    reward: { ko: '신메뉴 무료 쿠폰 2매 + 100P', en: '2 free coupons + 100P', ja: '新メニュー無料券2枚＋100P' },
    title: { ko: '신메뉴 음료 시음단', en: 'New Drink Tasting Crew', ja: '新作ドリンク試飲団' },
    desc: { ko: '출시 전 신메뉴 2종을 맛보고 간단 설문에 참여해요', en: 'Taste 2 pre-launch drinks and fill a short survey', ja: '発売前の新作2種を試飲し簡単なアンケートに回答' },
    closesInDays: 5,
  },
  {
    id: 'ex_serum',
    emoji: '🧴',
    minTier: 'gold',
    slots: 10,
    applied: 7,
    reward: { ko: '정품 제공 + 리뷰 작성 시 300P', en: 'Full product + 300P for review', ja: '本品提供＋レビューで300P' },
    title: { ko: '비건 세럼 체험단', en: 'Vegan Serum Tryout', ja: 'ヴィーガン美容液体験団' },
    desc: { ko: '2주 사용 후 비포·애프터 솔직 리뷰를 남겨주세요', en: 'Use for 2 weeks, then post an honest before/after review', ja: '2週間使用後、正直なレビューを投稿' },
    closesInDays: 7,
  },
  {
    id: 'ex_ramen',
    emoji: '🍜',
    minTier: 'gold',
    slots: 20,
    applied: 14,
    reward: { ko: '신제품 1박스 + 150P', en: '1 box + 150P', ja: '新商品1箱＋150P' },
    title: { ko: '신상 라면 시식단', en: 'New Ramen Tasting Crew', ja: '新作ラーメン試食団' },
    desc: { ko: '출시 전 라면 시식 후 맛 평가 설문 참여', en: 'Taste pre-launch ramen and rate it', ja: '発売前ラーメンを試食し味評価に参加' },
    closesInDays: 10,
  },
  {
    id: 'ex_beta',
    emoji: '📱',
    minTier: 'gold',
    slots: 5,
    applied: 3,
    reward: { ko: '베타 수당 500P + 정식판 1년 이용권', en: '500P + 1-year license', ja: '500P＋正式版1年ライセンス' },
    title: { ko: '신규 앱 베타테스터', en: 'New App Beta Tester', ja: '新アプリβテスター' },
    desc: { ko: '비공개 베타 2주 참여, 버그 리포트 3건 이상 제출', en: '2-week closed beta with 3+ bug reports', ja: '非公開β2週間、バグ報告3件以上' },
    closesInDays: 14,
  },
  {
    id: 'ex_earbuds',
    emoji: '🎧',
    minTier: 'platinum',
    slots: 3,
    applied: 1,
    reward: { ko: '무선 이어폰 정품 제공', en: 'Keep the wireless earbuds', ja: 'ワイヤレスイヤホン進呈' },
    title: { ko: '무선 이어폰 VIP 리뷰단', en: 'Wireless Earbuds VIP Review', ja: 'ワイヤレスイヤホンVIPレビュー' },
    desc: { ko: '상세 사용기 1편 작성 (사진 5장 이상)', en: 'One detailed review with 5+ photos', ja: '詳細レビュー1本（写真5枚以上）' },
    closesInDays: 12,
  },
]

export const expById = (id: string): Experience | undefined => EXPERIENCES.find((e) => e.id === id)
