import type { L } from './types'

/**
 * 테토 vs 에겐 바이브 테스트 — 바이럴 유입 펌프 (2025 '테토-에겐' 밈 포맷)
 * - 8문항 양자택일, 30초 완성, 결과 즉시 공개 (마찰 최소화)
 * - A 선택 = 테토(직진 본능) +1 / B = 에겐(세심 감성)
 * - 백분율은 라플라스 평활화 (+0.6/+1.2) — 0%/100% 극단 차단 (백서 §2-②)
 * - 결과 공유 카드 → 메인 정밀 검사로 퍼널 연결
 */

export interface VibeQ {
  q: L
  a: L // 테토
  b: L // 에겐
}

export const VIBE_QS: VibeQ[] = [
  {
    q: { ko: '단톡방에서 약속이 잡히려는 분위기. 나는?', en: 'A group chat starts planning a meetup. You?', ja: 'グループチャットで集まりの話が出たら？' },
    a: { ko: '"그래서 언제 어디서?" 내가 바로 정리한다', en: '"So when & where?" I sort it out instantly', ja: '「で、いつどこ？」即まとめる' },
    b: { ko: '분위기 보다가 다수 의견에 살포시 합류한다', en: 'I read the room and softly join the majority', ja: '空気を見て多数派にそっと合流' },
  },
  {
    q: { ko: '마음에 드는 사람이 생겼다. 나는?', en: 'You start liking someone. You?', ja: '気になる人ができたら？' },
    a: { ko: '일단 직진. 티가 다 난다', en: 'Full speed ahead — everyone can tell', ja: 'まず直進。バレバレになる' },
    b: { ko: '혼자 시뮬레이션 100번 돌리고 시작도 못 한다', en: 'Run 100 simulations alone, never launch', ja: '一人で100回シミュレーションして始められない' },
  },
  {
    q: { ko: '친구가 고민 상담을 시작했다. 내 반응은?', en: 'A friend shares a problem. Your reaction?', ja: '友達が悩み相談を始めたら？' },
    a: { ko: '"그래서 결론은 이거네" 3초 만에 해결책 제시', en: '"So here\'s the answer" — solution in 3 seconds', ja: '「つまり結論はこれ」3秒で解決策' },
    b: { ko: '"헐 진짜? 너무 힘들었겠다…" 일단 온몸으로 공감', en: '"Oh no, that must\'ve been so hard…" empathy first', ja: '「えっ本当？辛かったね…」全身で共感' },
  },
  {
    q: { ko: '여행 스타일은?', en: 'Your travel style?', ja: '旅行スタイルは？' },
    a: { ko: '큰 동선만 잡고 현장에서 부딪힌다', en: 'Rough route only — improvise on site', ja: '大まかなルートだけで現地で勝負' },
    b: { ko: '맛집·카페 저장 리스트 30개는 기본', en: '30+ saved cafés and restaurants minimum', ja: 'グルメ・カフェ保存リスト30件は基本' },
  },
  {
    q: { ko: '갈등이 생기면 나는?', en: 'When conflict happens, you?', ja: '揉め事が起きたら？' },
    a: { ko: '바로 "우리 얘기 좀 해" 정면 돌파', en: '"Let\'s talk now" — face it head-on', ja: 'すぐ「話そう」と正面突破' },
    b: { ko: '마음 정리할 시간이 필요해서 일단 거리를 둔다', en: 'I need time to process — distance first', ja: '心の整理に時間が要るのでまず距離を置く' },
  },
  {
    q: { ko: '쇼핑할 때 나는?', en: 'When shopping, you?', ja: '買い物のとき？' },
    a: { ko: '필요한 거 바로 결제. 3분 컷', en: 'See it, buy it — done in 3 minutes', ja: '必要な物は即決済。3分で完了' },
    b: { ko: '장바구니 숙성 + 리뷰 정독은 국룰', en: 'Cart-aging + deep review reading, always', ja: 'カート寝かせ＋レビュー熟読が鉄則' },
  },
  {
    q: { ko: '끌리는 취미는?', en: 'Which hobby pulls you?', ja: '惹かれる趣味は？' },
    a: { ko: '땀나고 승부 나는 것 (운동, 경쟁 게임)', en: 'Sweaty & competitive (sports, ranked games)', ja: '汗をかいて勝負がつくもの（運動・対戦）' },
    b: { ko: '감성 충전되는 것 (전시, 카페, 플레이리스트)', en: 'Mood-charging (exhibits, cafés, playlists)', ja: '感性が満ちるもの（展示・カフェ・プレイリスト）' },
  },
  {
    q: { ko: '내 카톡 말투는?', en: 'Your texting style?', ja: 'メッセージの文体は？' },
    a: { ko: '용건 위주. 짧고 굵게 끝', en: 'To the point — short and decisive', ja: '用件中心。短く太く' },
    b: { ko: '이모티콘과 ㅋㅋ로 온도 조절하는 편', en: 'Emojis and "lol" to tune the temperature', ja: '絵文字とwで温度調節する派' },
  },
]

export interface VibeType {
  min: number // 테토 % 하한
  key: string
  emoji: string
  grad: [string, string]
  name: L
  tagline: L
  desc: L
  pairKey: string
}

export const VIBE_TYPES: VibeType[] = [
  {
    min: 75,
    key: 'tetoMax',
    emoji: '🔥',
    grad: ['#FF6F61', '#FFB020'],
    name: { ko: '찐테토', en: 'Pure Teto', ja: 'ガチテト' },
    tagline: { ko: '생각? 그건 달리면서 하는 것', en: 'Thinking? That happens while running', ja: '考える？それは走りながらやるもの' },
    desc: {
      ko: '결정 3초, 후회 0초의 직진 불도저. 당신이 입을 열면 회의가 끝나고, 당신이 움직이면 일이 시작됩니다. 단, 섬세함 게이지는 가끔 점검 요망 — 주변인의 "잠깐만…"이 들리지 않는 날이 있어요.',
      en: 'A 3-second-decision bulldozer. When you speak, meetings end; when you move, things start. Just check your delicacy gauge sometimes.',
      ja: '決断3秒・後悔0秒の直進ブルドーザー。あなたが口を開けば会議が終わり、動けば物事が始まる。ただし繊細さゲージは時々点検を。',
    },
    pairKey: 'egenMax',
  },
  {
    min: 55,
    key: 'tetoSoft',
    emoji: '⚡',
    grad: ['#FFB020', '#F6C39F'],
    name: { ko: '소프트테토', en: 'Soft Teto', ja: 'ソフトテト' },
    tagline: { ko: '직진하는데 깜빡이는 켜는 타입', en: 'Goes straight — but uses turn signals', ja: '直進するけどウインカーは出すタイプ' },
    desc: {
      ko: '추진력은 테토, 매너는 장착 완료. 밀어붙일 때와 한 박자 쉴 때를 구분할 줄 아는 실전형입니다. 다만 "내가 참는 게 빠르지"가 누적되면 어느 날 한 번에 터져요.',
      en: 'Teto drive with manners installed. You know when to push and when to pause — just don\'t let "I\'ll just endure it" pile up.',
      ja: '推進力はテト、マナーは装備済み。押す時と休む時を分かる実戦型。ただ「我慢が早い」が溜まるといつか爆発。',
    },
    pairKey: 'egenSoft',
  },
  {
    min: 45,
    key: 'hybrid',
    emoji: '🌗',
    grad: ['#6E7BF2', '#8FB8E8'],
    name: { ko: '하이브리드 테겐', en: 'Hybrid Te-gen', ja: 'ハイブリッド・テゲン' },
    tagline: { ko: '상황 따라 모드 전환되는 변신형', en: 'Mode-switching shapeshifter', ja: '状況でモード切替する変身型' },
    desc: {
      ko: '회사에선 테토, 연애에선 에겐 — 상대와 상황에 맞춰 모드가 자동 전환되는 희귀 밸런스형. 적응력 만렙이지만, 정작 "진짜 내 모드"가 뭔지 본인도 가끔 헷갈립니다.',
      en: 'Teto at work, Egen in love — a rare auto-switching balance type. Max adaptability, but sometimes even you forget your default mode.',
      ja: '仕事ではテト、恋愛ではエゲン。状況で自動切替する希少バランス型。適応力MAXだが「本当の自分のモード」を時々見失う。',
    },
    pairKey: 'hybrid',
  },
  {
    min: 25,
    key: 'egenSoft',
    emoji: '🌸',
    grad: ['#F4B08C', '#FF9A8C'],
    name: { ko: '소프트에겐', en: 'Soft Egen', ja: 'ソフトエゲン' },
    tagline: { ko: '부드럽지만 마지노선은 확실한 타입', en: 'Gentle, but the red line is real', ja: '柔らかいけど最終ラインは確実なタイプ' },
    desc: {
      ko: '공감 능력과 분위기 센서가 기본 탑재된 모두의 힐러. 다만 거절을 미루다 혼자 끙끙대는 순간이 잦다면, 그건 배려가 아니라 적자 경영입니다.',
      en: 'Everyone\'s healer with built-in empathy sensors. But delaying every "no" until you suffer alone isn\'t kindness — it\'s deficit management.',
      ja: '共感力と空気センサーを標準搭載した皆のヒーラー。ただ断りを先延ばして一人で抱えるなら、それは配慮ではなく赤字経営。',
    },
    pairKey: 'tetoSoft',
  },
  {
    min: 0,
    key: 'egenMax',
    emoji: '🫧',
    grad: ['#8FB8E8', '#A3CFB9'],
    name: { ko: '찐에겐', en: 'Pure Egen', ja: 'ガチエゲン' },
    tagline: { ko: '세상 모든 온도 변화를 감지하는 센서', en: 'A sensor for every temperature shift on earth', ja: '世界のあらゆる温度変化を感知するセンサー' },
    desc: {
      ko: '말투 0.5도 차이도 감지하는 초고감도 감성 센서. 당신의 섬세함은 관계의 윤활유지만, 카톡 답장 하나에 소설 3권 쓰는 밤은 이제 줄여도 됩니다. 상대는 그냥 잠든 거예요.',
      en: 'An ultra-sensitive sensor that catches a 0.5° tone shift. Your delicacy lubricates relationships — but stop writing trilogies over one unanswered text. They just fell asleep.',
      ja: '語調0.5度の差も感知する超高感度センサー。その繊細さは関係の潤滑油。でも返信1件で小説3巻書く夜はもう減らしていい。相手はただ寝ただけ。',
    },
    pairKey: 'tetoMax',
  },
]

/** 라플라스 평활화 테토 % */
export function tetoPercent(aCount: number, total = VIBE_QS.length): number {
  return Math.round(((aCount + 0.6) / (total + 1.2)) * 100)
}

export function vibeTypeOf(pct: number): VibeType {
  return VIBE_TYPES.find((v) => pct >= v.min) ?? VIBE_TYPES[VIBE_TYPES.length - 1]
}

export const vibeTypeByKey = (key: string): VibeType => VIBE_TYPES.find((v) => v.key === key) ?? VIBE_TYPES[2]
