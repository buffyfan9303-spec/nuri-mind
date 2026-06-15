import type { Survey, ShopItem, Offer, CommunityPost } from './types'

/** 데모 시드 설문 — 실서비스 전 백엔드(Supabase) 연동 시 교체 지점 */
export const SEED_SURVEYS: Survey[] = [
  {
    id: 'sv_morning',
    emoji: '☕',
    title: '아침 루틴 & 카페인 습관 조사',
    desc: '직장인·학생의 아침 시간 사용 패턴을 연구하는 설문이에요. 3분이면 충분해요!',
    reward: 40,
    target: 200,
    responses: 137,
    status: 'approved',
    createdAt: Date.now() - 86400000 * 6,
    questions: [
      { id: 'q1', type: 'single', text: '보통 몇 시에 일어나시나요?', options: ['6시 이전', '6~7시', '7~8시', '8~9시', '9시 이후'], required: true },
      { id: 'q2', type: 'single', text: '하루 카페인 음료 섭취량은?', options: ['안 마심', '1잔', '2잔', '3잔 이상'], required: true },
      { id: 'q3', type: 'multi', text: '아침에 하는 일을 모두 골라주세요', options: ['운동', 'SNS 확인', '아침 식사', '독서/공부', '아무것도 안 함'], required: true },
      { id: 'q4', type: 'scale', text: '아침 시간이 만족스럽다', required: true },
      { id: 'q5', type: 'text', text: '아침 루틴에서 가장 바꾸고 싶은 한 가지는?', required: false },
    ],
  },
  {
    id: 'sv_game',
    emoji: '🎮',
    title: '모바일 게임 과금 경험 설문',
    desc: '게임 과금 패턴과 만족도를 조사합니다. 솔직한 답변이 큰 도움이 돼요.',
    reward: 60,
    target: 150,
    responses: 89,
    status: 'approved',
    createdAt: Date.now() - 86400000 * 4,
    questions: [
      { id: 'q1', type: 'single', text: '최근 6개월 내 모바일 게임 과금 경험이 있나요?', options: ['있다', '없다'], required: true },
      { id: 'q2', type: 'single', text: '월 평균 과금 금액대는?', options: ['0원', '1만원 미만', '1~5만원', '5~10만원', '10만원 이상'], required: true },
      { id: 'q3', type: 'multi', text: '주로 과금하는 항목은?', options: ['뽑기/가챠', '배틀패스', '스킨/치장', '편의 기능', '기타'], required: false },
      { id: 'q4', type: 'scale', text: '과금 후 만족도가 높은 편이다', required: true },
    ],
  },
  {
    id: 'sv_store',
    emoji: '🛒',
    title: '편의점 신상품 선호도 조사',
    desc: '이번 분기 편의점 신상 디저트 라인업에 대한 의견을 들려주세요!',
    reward: 30,
    target: 300,
    responses: 211,
    status: 'approved',
    createdAt: Date.now() - 86400000 * 2,
    questions: [
      { id: 'q1', type: 'single', text: '편의점 방문 빈도는?', options: ['매일', '주 3~4회', '주 1~2회', '월 1~2회 이하'], required: true },
      { id: 'q2', type: 'multi', text: '신상 디저트 중 끌리는 키워드를 골라주세요', options: ['두바이 초콜릿', '말차', '솔티드 카라멜', '흑임자', '제로슈가'], required: true },
      { id: 'q3', type: 'scale', text: '신상품이 나오면 일단 사보는 편이다', required: true },
      { id: 'q4', type: 'text', text: '출시되길 바라는 조합이 있다면?', required: false },
    ],
  },
  {
    id: 'sv_pending_demo',
    emoji: '🧋',
    title: '신규 음료 브랜드 네이밍 투표',
    desc: '출시 예정 음료 브랜드의 이름 후보 4개 중 최고를 골라주세요.',
    reward: 80,
    target: 100,
    responses: 0,
    status: 'pending',
    createdAt: Date.now() - 3600000 * 5,
    questions: [
      { id: 'q1', type: 'single', text: '가장 마음에 드는 이름은?', options: ['모구모구레', '틸틸', '브리지', '소르르'], required: true },
      { id: 'q2', type: 'text', text: '그 이름을 고른 이유는?', required: false },
    ],
  },
]

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'item_freeze',
    emoji: '❄️',
    name: { ko: '스트릭 프리즈', en: 'Streak Freeze', ja: 'ストリークフリーズ' },
    desc: { ko: '하루 놓쳐도 스트릭 유지 · 즉시 지급', en: 'Miss a day, keep streak · instant', ja: '1日逃してもストリーク維持・即時付与' },
    cost: 300,
  },
  {
    id: 'gift_culture',
    emoji: '🎫',
    name: { ko: '문화상품권 5,000원', en: 'Culture Gift Card ₩5,000', ja: '文化商品券 5,000W' },
    desc: { ko: '온라인 사용 가능한 핀번호 발송', en: 'PIN code sent for online use', ja: 'オンライン利用可能なPIN送付' },
    cost: 5500,
  },
  {
    id: 'gift_coffee',
    emoji: '☕',
    name: { ko: '아메리카노 기프티콘', en: 'Americano e-Gift', ja: 'アメリカーノギフト券' },
    desc: { ko: '주요 프랜차이즈 교환권', en: 'Major franchise voucher', ja: '主要チェーン交換券' },
    cost: 4800,
  },
  {
    id: 'gift_convenience',
    emoji: '🏪',
    name: { ko: '편의점 3,000원권', en: 'Convenience Store ₩3,000', ja: 'コンビニ3,000W券' },
    desc: { ko: '전국 주요 편의점 사용 가능', en: 'Usable at major chains', ja: '主要コンビニで利用可' },
    cost: 3400,
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

/** 커뮤니티 시드 글 — 실서비스 전 Supabase 연동 시 교체 */
export const SEED_POSTS: CommunityPost[] = [
  {
    id: 'po_seed1',
    nick: '집중하는 수달',
    avatar: { kind: 'animal', persona: 'meerkat' },
    badge: '🐿️',
    text: 'ADHD 검사 미어캣 나왔는데 "이따 하자"의 이따는 영원히 안 온다는 말에 정통으로 맞았어요 😭 다들 마감 어떻게 지키세요?',
    likes: 42,
    liked: false,
    at: Date.now() - 3600_000 * 5,
  },
  {
    id: 'po_seed2',
    nick: '명상 고슴도치',
    avatar: { kind: 'animal', persona: 'hedgehog' },
    badge: '🦔',
    text: '애착 검사 혼란형(고슴도치) 떴어요… 다가오면 가시 멀어지면 눈물 ㅋㅋㅋ 너무 맞아서 소름. 같은 유형 있나요?',
    likes: 31,
    liked: false,
    at: Date.now() - 3600_000 * 12,
  },
  {
    id: 'po_seed3',
    nick: '풀충전 돌고래',
    avatar: { kind: 'animal', persona: 'dolphin' },
    badge: '🐬',
    text: '오늘 설문 3개 + 출석 + 퀴즈로 95P 모음! 이번 달 치킨 기프티콘이 목표 🍗 같이 달리실 분',
    likes: 58,
    liked: false,
    at: Date.now() - 3600_000 * 26,
  },
  {
    id: 'po_seed4',
    nick: '디지털 동면 곰',
    avatar: { kind: 'animal', persona: 'bear' },
    badge: '🐻',
    text: '도파민 검사 청정구역 나옴 ㅎㅎ 숏폼 끊은 지 한 달째인데 책이 다시 읽혀요. 절제력 훈련 탭 강추',
    likes: 24,
    liked: false,
    at: Date.now() - 3600_000 * 40,
  },
]
