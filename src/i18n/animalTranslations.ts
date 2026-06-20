import type { L, TestId } from '../data/types'

/**
 * 동물 페르소나 딕셔너리 (백서 §5)
 * 칭찬 일색의 상업용 피드백을 거절하고, 학술적 관점의 '팩트 폭행'으로
 * 스스로를 깨우치게 한다. 비속어는 배제하고 문예 격식을 지킨다.
 */
export interface Persona {
  emoji: string
  /** 결과 카드 배경 그라데이션용 */
  grad: [string, string]
  name: L
  title: L
  tagline: L
  desc: L
  slap: L
  risks: L[]
  solutions: L[]
  strengths: L[]
}

export const PERSONAS: Record<string, Persona> = {
  meerkat: {
    emoji: '🐿️',
    grad: ['#FFB020', '#FF8A4C'],
    name: { ko: '미어캣', en: 'Meerkat', ja: 'ミーアキャット' },
    title: { ko: '수행형 파수꾼', en: 'The Vigilant Performer', ja: '遂行型の見張り番' },
    tagline: {
      ko: '온 세상의 알림을 다 받아보는 뇌',
      en: 'A brain subscribed to every notification on earth',
      ja: '世界中の通知を全部受信してしまう脳',
    },
    desc: {
      ko: '당신의 주의력은 망가진 게 아니라, 사방을 동시에 경계하도록 세팅되어 있습니다. 문제는 현대 사회가 한 구멍만 깊게 파는 사람에게 보상을 준다는 것. 시작은 누구보다 빠르지만 마무리 직전에 흥미 회로가 먼저 꺼집니다.',
      en: 'Your attention isn\'t broken — it\'s wired to scan every direction at once. The problem: modern life rewards those who dig one hole deep. You start faster than anyone, but your interest circuit powers off right before the finish line.',
      ja: 'あなたの注意力は壊れているのではなく、四方を同時に警戒するよう設定されています。問題は、現代社会が一つの穴を深く掘る人に報酬を与えること。誰よりも速く始めるのに、仕上げの直前で興味回路が先に落ちます。',
    },
    slap: {
      ko: '"이따 하자"의 이따는 영원히 오지 않습니다. 당신의 마감은 의지가 아니라 시스템이 지켜야 합니다. 의지를 믿는 건 이미 19번 실패한 전략입니다.',
      en: '"I\'ll do it later" — that later never arrives. Your deadlines must be guarded by systems, not willpower. Trusting willpower is the strategy that has already failed you 19 times.',
      ja: '「後でやる」の“後で”は永遠に来ません。あなたの締切は意志ではなくシステムが守るべきです。意志を信じるのは、既に19回失敗した戦略です。',
    },
    risks: [
      { ko: '마감 직전 벼락치기가 기본값이 되어 결과물의 상한선이 낮아짐', en: 'Last-minute cramming becomes default, capping the quality ceiling', ja: '締切直前の一夜漬けがデフォルト化し、成果物の上限が下がる' },
      { ko: '동시에 벌인 일들이 미완성 탭처럼 쌓여 자기효능감을 갉아먹음', en: 'Half-finished projects pile up like browser tabs, eroding self-efficacy', ja: '同時に広げた物事が未完了タブのように積もり、自己効力感を削る' },
      { ko: '충동적 결정(지출·발언)이 관계와 잔고에 반복 청구서를 보냄', en: 'Impulsive decisions keep sending invoices to your wallet and relationships', ja: '衝動的な決定（支出・発言）が人間関係と残高に請求書を送り続ける' },
    ],
    solutions: [
      { ko: '25분 타이머 + 휴대폰 다른 방 — 환경이 의지를 대신하게 하세요', en: '25-min timer + phone in another room — let environment replace willpower', ja: '25分タイマー＋スマホは別室へ。環境に意志を代行させましょう' },
      { ko: '할 일은 3개까지만 적기. 4번째는 내일의 당신에게 양도', en: 'Cap your to-do list at 3. Item #4 belongs to tomorrow-you', ja: 'やることは3つまで。4つ目は明日の自分へ譲渡' },
      { ko: '증상이 일·관계를 실제로 무너뜨린다면 전문의 상담이 가장 빠른 지름길', en: 'If symptoms truly disrupt work or relationships, a specialist is the fastest shortcut', ja: '症状が仕事や関係を実際に壊しているなら、専門医への相談が最速の近道' },
    ],
    strengths: [
      { ko: '위기 상황에서의 초인적 순발력과 멀티 센서', en: 'Superhuman reflexes and multi-sensors in a crisis', ja: '危機状況での超人的な瞬発力とマルチセンサー' },
      { ko: '흥미가 꽂힌 분야에선 누구보다 깊은 과몰입 엔진', en: 'A hyperfocus engine deeper than anyone\'s — once hooked', ja: '興味が刺さった分野では誰よりも深い過集中エンジン' },
    ],
  },

  collie: {
    emoji: '🐶',
    grad: ['#4FA882', '#8FB8E8'],
    name: { ko: '보더콜리', en: 'Border Collie', ja: 'ボーダーコリー' },
    title: { ko: '조율형 지휘자', en: 'The Orchestrating Conductor', ja: '調律型の指揮者' },
    tagline: {
      ko: '흩어진 양 떼도 줄 세우는 실행 회로',
      en: 'An execution circuit that lines up even scattered sheep',
      ja: '散らばった羊の群れも整列させる実行回路',
    },
    desc: {
      ko: '주의 자원의 배분과 회수가 안정적입니다. 시작-유지-마무리의 3박자가 고르게 작동하고, 방해 자극이 들어와도 복귀 시간이 짧습니다. 다만 이 안정성은 종종 "지루함을 견디는 능력"과 교환된 것입니다.',
      en: 'Your attention allocation and retrieval run stable. Start–sustain–finish beat evenly, and you bounce back fast from interruptions. But note: this stability was often purchased with "tolerance for boredom."',
      ja: '注意資源の配分と回収が安定しています。開始-維持-仕上げの3拍子が均等に作動し、妨害刺激が入っても復帰が速い。ただしこの安定は、しばしば「退屈に耐える能力」と引き換えです。',
    },
    slap: {
      ko: '당신의 성실함은 무기지만, 통제 가능한 일만 골라 담는 습관이 있진 않습니까? 예측 불가능한 도전을 피하는 안정은 성장이 아니라 관리일 뿐입니다.',
      en: 'Your diligence is a weapon — but haven\'t you been curating only controllable tasks? Stability that dodges unpredictable challenges is management, not growth.',
      ja: 'あなたの誠実さは武器ですが、コントロール可能な仕事だけを選んで詰める癖はありませんか？予測不能な挑戦を避ける安定は、成長ではなくただの管理です。',
    },
    risks: [
      { ko: '낯설고 구조 없는 과제 앞에서 시동이 늦게 걸릴 수 있음', en: 'Slow ignition when a task is novel and unstructured', ja: '構造のない未知の課題の前ではエンジンの掛かりが遅いことも' },
      { ko: '계획이 무너지는 변수에 필요 이상의 스트레스를 받음', en: 'Plan-breaking surprises cost you more stress than they should', ja: '計画を崩す変数に必要以上のストレスを受ける' },
    ],
    solutions: [
      { ko: '분기마다 하나는 "성공 확률 50%짜리 일"에 베팅해 보세요', en: 'Each quarter, bet on one task with only a 50% success rate', ja: '四半期に一つは「成功率50%の仕事」に賭けてみましょう' },
      { ko: '계획 B를 미리 적어 두면 변수 스트레스가 절반으로 줄어요', en: 'Writing Plan B in advance halves your surprise-stress', ja: 'プランBを先に書いておけば、変数ストレスは半分に' },
    ],
    strengths: [
      { ko: '복잡한 일정·자원을 줄 세우는 타고난 오케스트레이션', en: 'Born orchestration of complex schedules and resources', ja: '複雑な日程・資源を整列させる生まれつきのオーケストレーション' },
      { ko: '루틴을 무기로 바꾸는 꾸준함의 복리 효과', en: 'Compound interest of consistency — routines become weapons', ja: 'ルーティンを武器に変える継続の複利効果' },
    ],
  },

  sheep: {
    emoji: '🐑',
    grad: ['#F4B08C', '#F6C39F'],
    name: { ko: '양', en: 'Sheep', ja: '羊' },
    title: { ko: '배려형 온기 발전소', en: 'The Warm-hearted Giver', ja: '配慮型の温もり発電所' },
    tagline: {
      ko: '계산기 없이 내어주는 진성 이타 회로',
      en: 'A true-altruism circuit that gives without a calculator',
      ja: '計算機なしで差し出す真の利他回路',
    },
    desc: {
      ko: '당신의 배려는 거절이 무서워서가 아니라 선택입니다. 이것이 통계적으로 희귀한 "진성 이타"의 신호입니다. 타인의 감정을 자기 일처럼 처리하는 공감 회로가 활성화되어 있고, 그 온기는 주변 사람들의 안전기지가 됩니다.',
      en: 'Your care is a choice, not a fear of rejection — the statistically rare signature of true altruism. Your empathy circuit processes others\' feelings as your own, making you a safe base for everyone around.',
      ja: 'あなたの配慮は拒絶が怖いからではなく、選択です。これが統計的に希少な「真の利他」のシグナル。他人の感情を自分事として処理する共感回路が活性化しており、その温もりは周囲の安全基地になります。',
    },
    slap: {
      ko: '다만 기억하십시오. 호의가 계속되면 권리인 줄 아는 사람들이 반드시 나타납니다. 경계선 없는 이타성은 미덕이 아니라, 착취자를 위한 무료 구독권입니다.',
      en: 'But remember: keep the favors coming and some will mistake them for entitlements. Boundary-less altruism is not a virtue — it\'s a free subscription for exploiters.',
      ja: 'ただし覚えておいてください。好意が続くと権利だと勘違いする人が必ず現れます。境界線のない利他性は美徳ではなく、搾取者への無料サブスクです。',
    },
    risks: [
      { ko: '에너지 총량을 초과해 내어주다 번아웃으로 직행할 수 있음', en: 'Giving beyond your energy budget is a direct route to burnout', ja: 'エネルギー総量を超えて与え続けるとバーンアウトへ直行' },
      { ko: '"착한 사람" 역할에 갇혀 정당한 몫을 요구하지 못함', en: 'Trapped in the "nice person" role, you under-claim your fair share', ja: '「いい人」役に閉じ込められ、正当な取り分を要求できない' },
    ],
    solutions: [
      { ko: '부탁을 받으면 즉답 금지 — "내일 알려줄게"로 24시간 벌기', en: 'Never answer requests on the spot — "I\'ll tell you tomorrow" buys 24h', ja: '頼みごとに即答禁止。「明日返事するね」で24時間稼ぐ' },
      { ko: '한 달에 한 번, 죄책감 없이 거절하는 연습을 처방합니다', en: 'Prescription: practice one guilt-free "no" per month', ja: '月に一度、罪悪感なしで断る練習を処方します' },
    ],
    strengths: [
      { ko: '집단의 심리적 안전감을 끌어올리는 희귀 자원', en: 'A rare resource that raises a group\'s psychological safety', ja: '集団の心理的安全性を引き上げる希少資源' },
      { ko: '신뢰 자본이 복리로 쌓이는 장기전 최강 캐릭터', en: 'Trust capital compounds — the strongest character in the long game', ja: '信頼資本が複利で積み上がる長期戦最強キャラ' },
    ],
  },

  deer: {
    emoji: '🦌',
    grad: ['#C9A77C', '#E8C9A0'],
    name: { ko: '사슴', en: 'Deer', ja: '鹿' },
    title: { ko: '피해회피형 평화주의자', en: 'The Harm-avoidant Peacekeeper', ja: '被害回避型の平和主義者' },
    tagline: {
      ko: '착해서가 아니라, 무서워서 양보하는 중',
      en: 'Yielding not from kindness — from fear',
      ja: '優しいからではなく、怖いから譲っている',
    },
    desc: {
      ko: '겉으로는 이타적으로 보이지만, 데이터는 다른 이야기를 합니다. 당신의 양보는 상대를 위한 것이 아니라 갈등이라는 통증을 피하기 위한 진통제에 가깝습니다. 거절 공포가 의사결정의 운전대를 잡고 있습니다.',
      en: 'You look altruistic on the surface, but the data tells another story. Your yielding is less a gift to others, more a painkiller against the ache called conflict. Fear of rejection is holding your steering wheel.',
      ja: '表向きは利他的に見えますが、データは別の物語を語ります。あなたの譲歩は相手のためではなく、葛藤という痛みを避けるための鎮痛剤に近い。拒絶恐怖が意思決定のハンドルを握っています。',
    },
    slap: {
      ko: '갈등이 무서워 도망치는 것은 평화가 아니라 미루는 게으름입니다. 당신이 삼킨 말들은 사라지지 않고 이자가 붙어 어느 날 한꺼번에 청구됩니다.',
      en: 'Fleeing conflict isn\'t peace — it\'s procrastination in disguise. The words you swallow don\'t vanish; they accrue interest and one day arrive as a single, crushing invoice.',
      ja: '葛藤が怖くて逃げるのは平和ではなく、先送りの怠惰です。あなたが呑み込んだ言葉は消えず、利子がついてある日一括請求されます。',
    },
    risks: [
      { ko: '억눌린 불만이 한계점에서 관계 자체를 폭파시킬 수 있음', en: 'Suppressed grievances can detonate the whole relationship at the limit', ja: '抑え込んだ不満が限界点で関係そのものを爆破しかねない' },
      { ko: '"순한 사람" 포지션이 협상 테이블에서 만성 저평가를 부름', en: 'The "easygoing" position invites chronic undervaluation at every negotiation', ja: '「大人しい人」ポジションが交渉の場で慢性的な過小評価を招く' },
    ],
    solutions: [
      { ko: '"싫다" 대신 "나는 이게 더 좋아"부터 — 표현 난이도를 낮추세요', en: 'Start with "I prefer this" instead of "no" — lower the difficulty of expression', ja: '「嫌だ」の代わりに「私はこっちがいい」から。表現の難易度を下げて' },
      { ko: '회식 메뉴 정하기처럼 위험이 0인 곳에서 의견 내기를 연습', en: 'Practice voicing opinions where stakes are zero — like choosing the team lunch', ja: 'ランチ選びのようなリスクゼロの場で意見出しの練習を' },
      { ko: '갈등 1회 생존 경험이 회피 회로를 재배선합니다 — 작게 한 번 부딪혀 보기', en: 'Surviving one small conflict rewires the avoidance circuit — collide gently, once', ja: '葛藤を1回生き延びる経験が回避回路を再配線します。小さく一度ぶつかってみて' },
    ],
    strengths: [
      { ko: '갈등의 온도를 낮추는 타고난 완충 능력', en: 'A born buffer that cools the temperature of any conflict', ja: '葛藤の温度を下げる生まれつきの緩衝能力' },
      { ko: '상대의 미세한 감정 변화를 읽는 고감도 센서', en: 'High-sensitivity sensors for micro-shifts in others\' emotions', ja: '相手の微細な感情変化を読む高感度センサー' },
    ],
  },

  tiger: {
    emoji: '🐯',
    grad: ['#FF6F61', '#FFB020'],
    name: { ko: '호랑이', en: 'Tiger', ja: '虎' },
    title: { ko: '독과점 전략가', en: 'The Monopoly Strategist', ja: '独占型ストラテジスト' },
    tagline: {
      ko: '판을 설계해서라도 정상에 서는 야망 회로',
      en: 'An ambition circuit that will redesign the board to take the throne',
      ja: '盤面を設計してでも頂点に立つ野心回路',
    },
    desc: {
      ko: '경쟁 지배 욕구와 세력권 본능이 강하게 활성화되어 있습니다. 칭찬과 정보를 "카드"처럼 운용하고, 양보조차 다음 판을 위한 포석으로 씁니다. 이 전략 지능은 조직에서 당신을 빠르게 위로 밀어 올립니다.',
      en: 'Your dominance drive and territorial instinct run hot. You deal praise and information like cards, and even concessions are openings for the next game. This strategic intelligence rockets you upward in any hierarchy.',
      ja: '競争支配欲と縄張り本能が強く活性化しています。称賛と情報を「カード」のように運用し、譲歩さえ次の局面への布石に使う。この戦略知能は組織であなたを素早く押し上げます。',
    },
    slap: {
      ko: '그러나 모든 관계를 토너먼트로 치르는 사람의 결승전은 늘 무관중 경기입니다. 이용 가치로 사람을 줄 세우는 동안, 당신의 이름 옆에서 진심은 한 칸씩 비워지고 있습니다.',
      en: 'But for those who play every relationship as a tournament, the final match is always held in an empty stadium. While you rank people by utility, the seats beside your name are quietly emptying of sincerity.',
      ja: 'しかし、すべての関係をトーナメントで戦う人の決勝戦は、いつも無観客試合です。利用価値で人を並べている間に、あなたの名前の隣から本心は一つずつ空席になっていきます。',
    },
    risks: [
      { ko: '단기 승리를 위한 신뢰 소모가 장기 평판 부채로 전환됨', en: 'Trust burned for short-term wins converts into long-term reputation debt', ja: '短期勝利のための信頼消耗が長期的な評判負債に転換される' },
      { ko: '협력 게임을 제로섬으로 오판해 더 큰 파이를 놓침', en: 'Misreading cooperative games as zero-sum costs you the bigger pie', ja: '協力ゲームをゼロサムと誤判し、より大きなパイを逃す' },
    ],
    solutions: [
      { ko: '대가 없는 호의를 분기 1회 실험해 보세요 — 평판 복리의 시작점', en: 'Run one no-strings favor per quarter — the seed of reputation compounding', ja: '見返りなしの好意を四半期に1回実験。評判複利の出発点です' },
      { ko: '이기는 판보다 "같이 커지는 판"을 설계하면 당신의 천장이 사라집니다', en: 'Design games where everyone grows, and your ceiling disappears', ja: '勝つ盤面より「共に大きくなる盤面」を設計すれば、あなたの天井は消えます' },
    ],
    strengths: [
      { ko: '목표-자원-사람을 꿰는 구조적 설계 능력', en: 'Structural design skill threading goals, resources, and people', ja: '目標・資源・人を貫く構造的設計能力' },
      { ko: '위기에서 결단을 내리는 강철 심장', en: 'A steel heart that decides under fire', ja: '危機で決断を下す鋼の心臓' },
    ],
  },

  wolf: {
    emoji: '🐺',
    grad: ['#6B7A8F', '#9AA8B8'],
    name: { ko: '늑대', en: 'Wolf', ja: '狼' },
    title: { ko: '독고독립 생존가', en: 'The Lone Survivor', ja: '孤高独立のサバイバー' },
    tagline: {
      ko: '내 몫은 내가 지킨다, 조용하고 단단하게',
      en: 'I guard what\'s mine — quietly, solidly',
      ja: '自分の取り分は自分で守る、静かに堅く',
    },
    desc: {
      ko: '자기 보존 본능이 또렷하고, 손해 보는 착함을 경계합니다. 감정 소모가 큰 관계 대신 명확한 거래와 실리를 선호합니다. 이 독립성은 당신을 흔들리지 않게 하지만, 동시에 도움을 청하는 회로를 퇴화시켰습니다.',
      en: 'Your self-preservation instinct is sharp, and you\'re wary of kindness that costs you. You prefer clear deals over emotionally expensive bonds. This independence keeps you unshakable — and has atrophied your ask-for-help circuit.',
      ja: '自己保存本能が明確で、損する優しさを警戒します。感情消耗の大きい関係より明確な取引と実利を好む。この独立性はあなたを揺るがなくしますが、同時に助けを求める回路を退化させました。',
    },
    slap: {
      ko: '혼자서도 잘한다는 말은 절반만 진실입니다. 나머지 절반은, 같이 했으면 두 배가 됐을 성과의 영수증입니다. 고립을 독립이라 부르는 순간 성장은 거기서 멈춥니다.',
      en: '"I do fine alone" is only half true. The other half is a receipt for results that would have doubled with allies. The moment you rename isolation as independence, growth stops there.',
      ja: '「一人でも上手くやれる」は半分だけ真実。残り半分は、共にやれば2倍になった成果の領収書です。孤立を独立と呼んだ瞬間、成長はそこで止まります。',
    },
    risks: [
      { ko: '신뢰 네트워크 부재가 위기 때 안전망 부재로 직결됨', en: 'No trust network means no safety net when crisis hits', ja: '信頼ネットワークの不在が、危機の際のセーフティネット不在に直結' },
      { ko: '"계산적"이라는 평판이 기회의 문을 먼저 닫아버림', en: 'A "transactional" reputation closes doors before you knock', ja: '「打算的」という評判が、ノックする前に機会の扉を閉める' },
    ],
    solutions: [
      { ko: '받기 전에 먼저 주는 실험 — 소액의 선의가 네트워크의 첫 노드가 됩니다', en: 'Give before you receive — a small kindness becomes your network\'s first node', ja: '受け取る前にまず与える実験。少額の善意がネットワーク最初のノードに' },
      { ko: '한 달에 한 번, 사소한 도움을 일부러 요청해 보세요', en: 'Once a month, deliberately ask for a small favor', ja: '月に一度、些細な助けをあえて頼んでみましょう' },
    ],
    strengths: [
      { ko: '감정에 휩쓸리지 않는 냉정한 손익 판단', en: 'Cold, clear cost-benefit judgment immune to emotional currents', ja: '感情に流されない冷静な損益判断' },
      { ko: '홀로 버티는 압도적 맷집과 자기 관리', en: 'Overwhelming resilience and self-management in solitude', ja: '独りで耐え抜く圧倒的な打たれ強さと自己管理' },
    ],
  },

  owl: {
    emoji: '🦉',
    grad: ['#4F5CD4', '#6E7BF2'],
    name: { ko: '흑올빼미', en: 'Black Owl', ja: '黒フクロウ' },
    title: { ko: '연역의 마에스트로', en: 'The Maestro of Deduction', ja: '演繹のマエストロ' },
    tagline: {
      ko: '처음 보는 규칙도 세 수 안에 해부하는 뇌',
      en: 'A brain that dissects unseen rules within three moves',
      ja: '初見のルールも三手以内に解剖する脳',
    },
    desc: {
      ko: '미지의 조건에서 패턴을 추출하고 규칙을 역설계하는 유동 지능이 상위 구간입니다. 학력·지식과 무관하게, 낯선 문제 앞에서 뇌의 연산 코어가 빠르게 점화됩니다. 복잡함을 단순한 구조로 환원하는 능력이 당신의 본체입니다.',
      en: 'Your fluid intelligence — extracting patterns and reverse-engineering rules in novel conditions — sits in the upper band. Regardless of schooling, your reasoning core ignites fast before unfamiliar problems. Reducing complexity to simple structure is your true form.',
      ja: '未知の条件からパターンを抽出しルールを逆設計する流動性知能が上位ゾーンです。学歴・知識と無関係に、初見の問題の前で脳の演算コアが素早く点火する。複雑さを単純な構造に還元する能力があなたの本体です。',
    },
    slap: {
      ko: '다만 머리 좋은 사람의 최악의 함정은 "이해했으니 다 했다"는 착각입니다. 실행 없는 통찰은 세상에서 가장 비싼 낙서입니다. 당신의 서랍에 잠든 계획이 몇 장입니까?',
      en: 'But the smartest people\'s deadliest trap is mistaking "I understood it" for "I did it." Insight without execution is the world\'s most expensive doodle. How many plans are sleeping in your drawer?',
      ja: 'ただし頭の良い人の最悪の罠は「理解したからやり終えた」という錯覚です。実行なき洞察は世界で最も高価な落書き。あなたの引き出しに眠る計画は何枚ですか？',
    },
    risks: [
      { ko: '과정이 뻔해 보이는 일을 지루해하다 기본기를 놓침', en: 'Boredom with "obvious" processes makes you skip fundamentals', ja: '過程が見え透いた仕事に退屈し、基本を取りこぼす' },
      { ko: '말로 이긴 토론이 관계에서는 진 게임일 수 있음', en: 'Debates won with logic can be losses in relationships', ja: '論理で勝った議論が、関係では負けゲームのことも' },
    ],
    solutions: [
      { ko: '통찰 1개당 실행 1개 — "오늘 옮긴 한 수"를 기록하세요', en: 'One execution per insight — log "today\'s one move"', ja: '洞察1つにつき実行1つ。「今日動かした一手」を記録して' },
      { ko: '설명할 때 상대의 속도에 변속기를 맞추면 영향력이 배가됩니다', en: 'Shift gears to your listener\'s speed and your influence doubles', ja: '説明の速度を相手に合わせれば影響力は倍増します' },
    ],
    strengths: [
      { ko: '초면의 문제를 구조로 환원하는 추상화 엔진', en: 'An abstraction engine that turns first-contact problems into structure', ja: '初見の問題を構造に還元する抽象化エンジン' },
      { ko: '변화한 환경에 빠르게 재적응하는 학습 가속도', en: 'Learning acceleration that re-adapts fast to changed environments', ja: '変化した環境に素早く再適応する学習加速度' },
    ],
  },

  penguin: {
    emoji: '🐧',
    grad: ['#5EA8D8', '#A3CFB9'],
    name: { ko: '황제펭귄', en: 'Emperor Penguin', ja: 'コウテイペンギン' },
    title: { ko: '안정 애착 항해사', en: 'The Secure Navigator', ja: '安定愛着の航海士' },
    tagline: { ko: '폭풍이 와도 손을 놓지 않는 타입', en: 'Never lets go, even in a storm', ja: '嵐が来ても手を離さないタイプ' },
    desc: {
      ko: '불안과 회피 모두 낮은, 통계적으로 부러운 안정 애착입니다. 가까워져도 숨 막히지 않고, 멀어져도 무너지지 않습니다. 갈등을 "관계의 끝"이 아니라 "대화의 시작"으로 읽는 능력이 당신의 초능력입니다.',
      en: 'Low anxiety, low avoidance — the statistically enviable secure base. Closeness doesn\'t choke you; distance doesn\'t break you.',
      ja: '不安も回避も低い、統計的に羨ましい安定型。近づいても息苦しくなく、離れても崩れない。葛藤を「対話の始まり」と読む力が超能力です。',
    },
    slap: {
      ko: '단, 안정형의 함정은 "상대도 나 같겠지"라는 착각입니다. 코알라의 불안과 고양이의 도망을 "왜 저래?"로 읽는 순간, 당신의 안정은 둔감함으로 강등됩니다.',
      en: 'But the secure trap is assuming everyone works like you. Read a koala\'s anxiety as "drama" and your stability demotes to insensitivity.',
      ja: 'ただし安定型の罠は「相手も自分と同じはず」という錯覚。コアラの不安や猫の逃避を「なぜ？」と読んだ瞬間、安定は鈍感に格下げされます。',
    },
    risks: [
      { ko: '상대의 불안 신호를 "별일 아님"으로 과소평가할 수 있음', en: 'May underrate a partner\'s anxiety signals as "no big deal"', ja: '相手の不安シグナルを「大したことない」と過小評価しがち' },
      { ko: '갈등 내성이 높아 문제를 너무 늦게 심각하게 받아들임', en: 'High conflict tolerance can delay taking issues seriously', ja: '葛藤耐性が高く問題を深刻に受け止めるのが遅れる' },
    ],
    solutions: [
      { ko: '상대의 애착 유형을 물어보세요 — 안정형의 언어가 만능은 아닙니다', en: 'Ask your partner\'s attachment style — secure language isn\'t universal', ja: '相手の愛着タイプを聞いてみて。安定型の言語は万能ではない' },
      { ko: '"괜찮아?"보다 "어떻게 해주면 좋을까?"가 한 수 위입니다', en: '"What would help?" beats "are you okay?"', ja: '「大丈夫？」より「どうしてほしい？」が一枚上手' },
    ],
    strengths: [
      { ko: '관계의 안전기지 — 모든 유형을 치유하는 치트키', en: 'A safe base that heals every other type', ja: '関係の安全基地。全タイプを癒すチートキー' },
      { ko: '갈등 후 회복 탄력이 빠름', en: 'Fast bounce-back after conflict', ja: '葛藤後の回復が速い' },
    ],
  },

  koala: {
    emoji: '🐨',
    grad: ['#F46BA8', '#F6C39F'],
    name: { ko: '벨크로 코알라', en: 'Velcro Koala', ja: 'ベルクロコアラ' },
    title: { ko: '불안 애착 — 확인 중독', en: 'Anxious — Reassurance Addict', ja: '不安愛着 — 確認中毒' },
    tagline: { ko: '읽씹 1시간이면 소설 3부작이 완성된다', en: 'One hour on read = a finished trilogy in my head', ja: '既読1時間で小説3部作が完成する' },
    desc: {
      ko: '사랑이 클수록 불안도 커지는 불안 애착 우세형입니다. 상대의 온도 변화를 0.1도 단위로 감지하는 레이더는 축복이자 저주 — 그 레이더가 없는 신호까지 만들어내기 시작하면 관계가 흔들립니다.',
      en: 'Anxious-dominant: the more you love, the louder the alarm. Your 0.1-degree radar is a gift — until it starts inventing signals.',
      ja: '愛が大きいほど不安も大きくなる不安優勢型。0.1度単位のレーダーは祝福であり呪い。存在しない信号まで作り出すと関係が揺らぎます。',
    },
    slap: {
      ko: '확인은 안심을 1시간 주고, 상대의 피로를 1주일 쌓습니다. "나 사랑해?"의 정답은 이미 알고 있죠 — 당신이 원하는 건 답이 아니라 불안의 진통제입니다. 진통제는 내성이 생깁니다.',
      en: 'Reassurance buys you an hour of calm and costs them a week of fatigue. You already know the answer to "do you love me?" — you\'re after a painkiller, and painkillers build tolerance.',
      ja: '確認は1時間の安心をくれ、相手の疲労を1週間積み上げる。「愛してる？」の答えはもう知っているはず。欲しいのは答えではなく不安の鎮痛剤。鎮痛剤には耐性がつきます。',
    },
    risks: [
      { ko: '시험하기(일부러 연락 끊기 등)가 관계를 실제로 끝낼 수 있음', en: 'Testing behaviors can actually end the relationship', ja: '試し行動が本当に関係を終わらせかねない' },
      { ko: '상대가 회피형이면 추격-도망 루프에 갇힘', en: 'With an avoidant partner, you enter the chase-flee loop', ja: '相手が回避型だと追跡-逃走ループに陥る' },
    ],
    solutions: [
      { ko: '불안이 올라오면 연락 전 10분 타이머 — 감정의 첫 파도는 9분이면 지나갑니다', en: '10-minute timer before texting — the first wave passes in 9', ja: '不安が来たら連絡前に10分タイマー。感情の最初の波は9分で過ぎる' },
      { ko: '확인 욕구를 상대가 아닌 기록으로 — "받은 사랑 로그"를 쓰면 레이더가 교정됩니다', en: 'Log the love you receive — the radar recalibrates', ja: '確認欲求は相手ではなく記録へ。「もらった愛ログ」でレーダーが矯正される' },
      { ko: '안정형(펭귄)과의 관계에서 애착이 실제로 치유된다는 연구가 많습니다', en: 'Research shows secure partners genuinely heal anxious attachment', ja: '安定型との関係で愛着が実際に治癒する研究が多数' },
    ],
    strengths: [
      { ko: '관계의 미세 신호를 가장 먼저 읽는 초고감도 센서', en: 'First to read micro-signals in any relationship', ja: '関係の微細信号を最初に読む超高感度センサー' },
      { ko: '사랑을 표현하는 데 인색하지 않음 — 받는 사람은 압니다', en: 'Generous with affection — and partners feel it', ja: '愛情表現を惜しまない。受け取る人には分かる' },
    ],
  },

  cat: {
    emoji: '🐈',
    grad: ['#8C9BA8', '#C9A77C'],
    name: { ko: '독립 고양이', en: 'Independent Cat', ja: '独立ネコ' },
    title: { ko: '회피 애착 — 거리 조절 장인', en: 'Avoidant — Distance Artisan', ja: '回避愛着 — 距離調節の職人' },
    tagline: { ko: '좋아해. 근데 오지는 마', en: 'I like you. Just… don\'t come closer', ja: '好きだよ。でも来ないで' },
    desc: {
      ko: '친밀함이 일정 수위를 넘으면 자동으로 거리를 버는 회피 애착 우세형입니다. 혼자가 편한 게 아니라, 가까움이 불편한 것 — 이 둘은 다릅니다. 당신의 잠수는 상대에게 거절로 번역된다는 게 문제죠.',
      en: 'Avoidant-dominant: when closeness crosses a line, you auto-create distance. You\'re not comfortable alone — you\'re uncomfortable close. Your silence translates as rejection.',
      ja: '親密さが一定水位を超えると自動で距離を取る回避優勢型。一人が楽なのではなく、近さが苦手なだけ。あなたの沈黙は相手には拒絶と翻訳されます。',
    },
    slap: {
      ko: '"부담 주기 싫어서"는 절반만 진실입니다. 나머지 절반은 "내가 흔들리기 싫어서"죠. 떠나고 나서야 그리워하는 패턴이 3회 이상 반복됐다면, 그건 성향이 아니라 비용입니다.',
      en: '"I don\'t want to burden you" is half-true. The other half: "I don\'t want to be shaken." If miss-them-after-leaving has repeated 3+ times, that\'s not a trait — it\'s a cost.',
      ja: '「負担をかけたくない」は半分だけ真実。残り半分は「自分が揺らぎたくない」。去ってから恋しくなるパターンが3回以上なら、それは性向ではなくコストです。',
    },
    risks: [
      { ko: '잠수·회피가 상대에겐 "마음 없음"으로 확정 해석됨', en: 'Ghosting reads as "doesn\'t care" — verdict final', ja: '音信不通は相手に「気がない」と確定解釈される' },
      { ko: '불안형(코알라)과 만나면 서로의 최악을 끌어냄', en: 'With an anxious partner, you trigger each other\'s worst', ja: '不安型と付き合うと互いの最悪を引き出す' },
    ],
    solutions: [
      { ko: '도망치고 싶을 때 한 문장만: "지금 혼자 정리할 시간이 필요해, 도망가는 거 아니야"', en: 'One sentence before retreating: "I need space to process — I\'m not leaving"', ja: '逃げたい時に一文だけ：「今は一人で整理する時間が必要。逃げてるんじゃない」' },
      { ko: '주 1회, 사소한 속마음 1개 공유 — 친밀감 근육은 저중량 고반복으로 큽니다', en: 'Share one small feeling weekly — intimacy grows with low weight, high reps', ja: '週1回、些細な本音を1つ共有。親密筋は低重量・高回数で育つ' },
    ],
    strengths: [
      { ko: '상대를 소유하려 들지 않는 건강한 독립성', en: 'Healthy independence that never possesses', ja: '相手を所有しようとしない健全な独立性' },
      { ko: '감정에 휩쓸리지 않는 침착한 위기 대응', en: 'Calm crisis handling, unswayed by emotion', ja: '感情に流されない冷静な危機対応' },
    ],
  },

  hedgehog: {
    emoji: '🦔',
    grad: ['#8B7CF6', '#F4B08C'],
    name: { ko: '고슴도치', en: 'Hedgehog', ja: 'ハリネズミ' },
    title: { ko: '혼란 애착 — 안아줘, 만지지 마', en: 'Fearful — Hold Me, Don\'t Touch Me', ja: '混乱愛着 — 抱きしめて、触らないで' },
    tagline: { ko: '다가오면 가시, 멀어지면 눈물', en: 'Spikes when you approach, tears when you leave', ja: '近づけばトゲ、離れれば涙' },
    desc: {
      ko: '불안과 회피가 동시에 높은 가장 복잡한 유형입니다. 사랑을 갈망하면서 사랑이 두렵습니다. 끌어당기고 밀어내는 시소가 본인도 예측 불가라, 정작 가장 지치는 사람은 당신 자신입니다.',
      en: 'High anxiety AND high avoidance — the most complex type. You crave love and fear it. The push-pull seesaw exhausts no one more than you.',
      ja: '不安と回避が同時に高い最も複雑なタイプ。愛を渇望しながら愛が怖い。引き寄せて押し返すシーソーに一番疲れているのはあなた自身です。',
    },
    slap: {
      ko: '"어차피 떠날 거잖아"라며 먼저 밀어내고, 떠나면 "역시 떠나네"라고 확인하는 것 — 그건 예언이 아니라 제작입니다. 당신의 가시는 방어가 아니라 자기실현 장치가 됐습니다.',
      en: 'Pushing first with "you\'ll leave anyway," then confirming "see, they left" — that\'s not prophecy, that\'s production. Your spikes became a self-fulfilling machine.',
      ja: '「どうせ去るんでしょ」と先に押しのけ、去ったら「やっぱり」と確認する — それは予言ではなく製作。トゲは防御ではなく自己実現装置になっています。',
    },
    risks: [
      { ko: '밀당이 아니라 진심의 시소라서 상대가 해석 불능에 빠짐', en: 'It\'s not playing games — it\'s a sincerity seesaw partners can\'t decode', ja: '駆け引きではなく本心のシーソーで、相手が解読不能に陥る' },
      { ko: '관계 초반의 강렬함 후 급랭 패턴이 반복되기 쉬움', en: 'Intense starts followed by sudden freezes tend to repeat', ja: '序盤の強烈さの後の急冷パターンが繰り返されやすい' },
    ],
    solutions: [
      { ko: '밀어내고 싶은 순간, 행동 대신 중계: "지금 도망가고 싶은 마음이 올라왔어"', en: 'Narrate instead of acting: "the urge to run just showed up"', ja: '押しのけたい瞬間、行動の代わりに実況：「今逃げたい気持ちが上がってきた」' },
      { ko: '이 유형은 자가 교정이 가장 어렵습니다 — 상담은 사치가 아니라 지름길', en: 'This type is hardest to self-correct — counseling is a shortcut, not a luxury', ja: 'このタイプは自己矯正が最難関。カウンセリングは贅沢ではなく近道' },
      { ko: '안전한 관계 1개의 경험이 애착 지도를 다시 그립니다', en: 'One safe relationship redraws the attachment map', ja: '安全な関係1つの経験が愛着地図を描き直す' },
    ],
    strengths: [
      { ko: '양쪽 유형의 마음을 모두 이해하는 유일한 통역사', en: 'The only type fluent in both anxious and avoidant', ja: '両タイプの心を理解できる唯一の通訳者' },
      { ko: '감정의 스펙트럼이 넓어 공감 깊이가 남다름', en: 'A wide emotional spectrum gives rare depth of empathy', ja: '感情のスペクトラムが広く共感の深さが別格' },
    ],
  },

  dolphin: {
    emoji: '🐬',
    grad: ['#4FA882', '#8FB8E8'],
    name: { ko: '풀충전 돌고래', en: 'Full-Charge Dolphin', ja: 'フル充電イルカ' },
    title: { ko: '에너지 순환 정상', en: 'Energy Cycle: Healthy', ja: 'エネルギー循環正常' },
    tagline: { ko: '일하고, 끄고, 충전하는 3박자가 산다', en: 'Work, switch off, recharge — the rhythm lives', ja: '働く・切る・充電する3拍子が生きている' },
    desc: {
      ko: '소진·냉소·효능감 모두 건강 범위입니다. 일과 자신 사이의 거리 조절이 되고 있고, 에너지가 쓰는 만큼 다시 차오릅니다. 지금의 페이스 배분이 당신의 자산입니다.',
      en: 'Exhaustion, cynicism, efficacy — all in healthy range. You spend energy and it refills. Your pacing is the asset.',
      ja: '消耗・冷笑・効力感すべて健康範囲。仕事と自分の距離調節ができ、使った分だけエネルギーが戻る。今のペース配分が資産です。',
    },
    slap: {
      ko: '단, 건강한 사람의 함정은 "나는 안 무너져"라는 과신입니다. 번아웃은 약해서 오는 게 아니라, 잘 버티는 사람이 한계 신호를 무시할 때 옵니다. 지금 옆자리의 낙타를 보세요 — 6개월 전엔 돌고래였습니다.',
      en: 'The healthy person\'s trap is "I don\'t break." Burnout doesn\'t come from weakness — it comes from strong people ignoring limit signals. That camel next to you? Was a dolphin six months ago.',
      ja: 'ただし健康な人の罠は「自分は壊れない」という過信。バーンアウトは弱さからではなく、よく耐える人が限界信号を無視した時に来ます。隣のラクダも半年前はイルカでした。',
    },
    risks: [
      { ko: '여유가 있을 때 일을 더 받아 과적재의 씨앗을 심기 쉬움', en: 'Spare capacity tempts you to take on more — seeding overload', ja: '余裕がある時に仕事を引き受けすぎ、過積載の種を蒔きやすい' },
      { ko: '주변의 소진 신호를 "엄살"로 읽으면 팀 전체가 무너짐', en: 'Reading others\' burnout as whining sinks the whole team', ja: '周囲の消耗信号を「大げさ」と読むとチーム全体が沈む' },
    ],
    solutions: [
      { ko: '월 1회 에너지 결산 — 이번 달 "거절한 일"이 0개면 경고등입니다', en: 'Monthly energy audit — zero declined requests is a warning light', ja: '月1回エネルギー決算。今月「断った仕事」が0なら警告灯' },
      { ko: '루틴에 의도적 공백 1칸 — 회복은 스케줄에 적어야 일어납니다', en: 'Schedule one intentional blank — recovery only happens if it\'s written down', ja: 'ルーティンに意図的な空白1枠。回復は予定に書いてこそ起きる' },
    ],
    strengths: [
      { ko: '꺼짐 스위치를 가진 희귀종 — 지속 가능한 고성과', en: 'Owns an off-switch — sustainably high output', ja: 'オフスイッチを持つ希少種。持続可能な高成果' },
      { ko: '팀의 에너지 페이스메이커 역할', en: 'The team\'s energy pacemaker', ja: 'チームのエネルギーペースメーカー' },
    ],
  },

  camel: {
    emoji: '🐫',
    grad: ['#E0A52E', '#C8824A'],
    name: { ko: '과적재 낙타', en: 'Overloaded Camel', ja: '過積載ラクダ' },
    title: { ko: '버티기 모드 가동 중', en: 'Endurance Mode: ON', ja: '我慢モード稼働中' },
    tagline: { ko: '"할 만해"가 입에 붙었지만 등이 휘는 중', en: 'Says "I\'m managing" while the back bends', ja: '「いける」が口癖だが背中は曲がり中' },
    desc: {
      ko: '소진 경계 구간입니다. 아직 굴러가지만, 회복 속도가 소모 속도를 따라잡지 못하기 시작했습니다. 낙타의 비극은 무너지는 날까지 멀쩡해 보인다는 것 — 마지막 지푸라기는 늘 사소합니다.',
      en: 'You\'re in the caution zone: still running, but recovery no longer keeps pace with spending. A camel\'s tragedy: it looks fine until the day it doesn\'t. The last straw is always trivial.',
      ja: '消耗警戒ゾーン。まだ回っているが、回復速度が消費速度に追いつかなくなり始めた。ラクダの悲劇は崩れる日まで平気に見えること。最後の藁はいつも些細です。',
    },
    slap: {
      ko: '"이것만 끝나면 쉴 거야"를 올해 몇 번째 말하고 있습니까? 그 문장은 휴식 계획이 아니라 소진의 진행 알림입니다. 낙타는 자기 등의 짐을 셀 수 없습니다 — 그래서 측정이 필요한 겁니다.',
      en: 'How many times this year have you said "I\'ll rest after this one"? That sentence isn\'t a rest plan — it\'s a burnout progress notification. A camel can\'t count its own load; that\'s why measurement exists.',
      ja: '「これさえ終われば休む」を今年何回言いましたか？その文は休息計画ではなく消耗の進行通知。ラクダは自分の荷を数えられない — だから測定が要るのです。',
    },
    risks: [
      { ko: '수면·식사 루틴 붕괴가 먼저 오고, 감정 붕괴가 따라옴', en: 'Sleep and meal routines collapse first; emotions follow', ja: '睡眠・食事ルーティンが先に崩れ、感情が後に続く' },
      { ko: '"나만 힘든 게 아니니까"가 도움 요청을 막는 가장 흔한 벽', en: '"Everyone\'s struggling" is the most common wall against asking for help', ja: '「みんな大変だから」が助けを求める最大の壁' },
    ],
    solutions: [
      { ko: '이번 주 안에 일 하나를 거절하거나 위임 — 줄이는 연습은 작게 시작', en: 'Decline or delegate one task this week — start shrinking small', ja: '今週中に仕事を1つ断るか委任。減らす練習は小さく始める' },
      { ko: '회복은 "남는 시간"이 아니라 "선약"으로 — 캘린더에 휴식을 먼저 적기', en: 'Recovery is an appointment, not leftovers — book rest first', ja: '回復は「余り時間」ではなく「先約」。カレンダーに休息を先に書く' },
      { ko: '2주 후 재검사로 방향(악화/회복) 확인 — 추세가 점수보다 중요', en: 'Retest in 2 weeks — the trend matters more than the score', ja: '2週間後に再検査して方向（悪化/回復）を確認。傾向がスコアより重要' },
    ],
    strengths: [
      { ko: '책임감과 지구력은 조직에서 대체 불가', en: 'Irreplaceable responsibility and stamina', ja: '責任感と持久力は組織で代替不可' },
      { ko: '아직 회복 탄력이 살아 있는 골든타임', en: 'Resilience is still alive — this is the golden hour', ja: '回復弾力がまだ生きているゴールデンタイム' },
    ],
  },

  sloth: {
    emoji: '🦥',
    grad: ['#6B7A8F', '#8B7CF6'],
    name: { ko: '방전된 나무늘보', en: 'Drained Sloth', ja: '放電ナマケモノ' },
    title: { ko: '배터리 1% 경고등', en: 'Battery 1% Warning', ja: 'バッテリー1%警告' },
    tagline: { ko: '게으른 게 아니라, 꺼진 겁니다', en: 'Not lazy — powered off', ja: '怠けてるのではなく、電源が落ちている' },
    desc: {
      ko: '소진 고위험 구간입니다. 의욕 문제가 아니라 에너지 시스템의 문제이며, 정신력으로 미는 단계는 이미 지났습니다. 지금 필요한 것은 자기계발이 아니라 회복 — 가능하다면 전문가의 동행입니다.',
      en: 'High-risk burnout zone. This isn\'t a motivation problem — it\'s an energy-system problem, past the willpower stage. You need recovery, not self-improvement; ideally with professional support.',
      ja: '消耗ハイリスクゾーン。意欲ではなくエネルギーシステムの問題で、精神力で押す段階はもう過ぎました。必要なのは自己啓発ではなく回復。できれば専門家の同行を。',
    },
    slap: {
      ko: '"조금만 더 버티면"은 이 구간에서 가장 위험한 거짓말입니다. 번아웃은 버틴 순서대로 무너집니다. 지금 멈추는 것은 패배가 아니라, 시스템이 보내는 마지막 정중한 요청을 수락하는 것입니다.',
      en: '"Just hold on a bit longer" is the most dangerous lie in this zone. Burnout collapses people in the order they endured. Stopping now isn\'t defeat — it\'s accepting the system\'s last polite request.',
      ja: '「もう少しだけ耐えれば」はこのゾーンで最も危険な嘘。バーンアウトは耐えた順に崩れます。今止まるのは敗北ではなく、システムの最後の丁寧な要請を受け入れることです。',
    },
    risks: [
      { ko: '소진은 우울로 전이될 수 있음 — 2주 이상 지속 시 전문 상담 필요', en: 'Burnout can transition into depression — seek help if it persists 2+ weeks', ja: '消耗はうつに移行し得る。2週間以上続くなら専門相談を' },
      { ko: '"퇴사만이 답"식 충동 결정은 방전 상태에선 오판이 많음', en: 'Drained brains make poor "quit everything" decisions', ja: '放電状態での「退職だけが答え」式の衝動決定は誤判が多い' },
    ],
    solutions: [
      { ko: '이번 주 목표는 단 하나 — 수면 7시간 사수. 회복은 잠에서 시작합니다', en: 'One goal this week: defend 7 hours of sleep. Recovery starts there', ja: '今週の目標はただ一つ、睡眠7時間死守。回復は眠りから始まる' },
      { ko: '업무량 조정 대화는 미루지 마세요 — 무너진 뒤엔 협상력도 없습니다', en: 'Don\'t postpone the workload talk — after collapse there\'s no leverage', ja: '業務量調整の話は先送りしない。倒れた後は交渉力もない' },
      { ko: '직장인 심리지원(EAP)·정신건강복지센터 등 무료 창구부터 두드리기', en: 'Knock on free doors first: EAP, community mental-health centers', ja: 'EAPや精神保健福祉センターなど無料窓口からノックを' },
    ],
    strengths: [
      { ko: '여기까지 버틴 책임감 — 방향만 회복으로 돌리면 됩니다', en: 'The grit that got you here — now aim it at recovery', ja: 'ここまで耐えた責任感。方向を回復に向けるだけ' },
      { ko: '바닥을 아는 사람의 공감력은 회복 후 최고의 자산', en: 'Knowing the bottom becomes your greatest empathy asset after recovery', ja: 'どん底を知る人の共感力は回復後最高の資産' },
    ],
  },

  bear: {
    emoji: '🐻',
    grad: ['#2F6B52', '#A3CFB9'],
    name: { ko: '디지털 동면 곰', en: 'Digital-Hibernation Bear', ja: 'デジタル冬眠グマ' },
    title: { ko: '도파민 청정구역', en: 'Dopamine Clean Zone', ja: 'ドーパミン清浄区域' },
    tagline: { ko: '알림이 울려도 영혼은 평온', en: 'Notifications ring; the soul stays still', ja: '通知が鳴っても魂は平穏' },
    desc: {
      ko: '디지털 자극에 대한 절제력이 상위권입니다. 폰을 도구로 쓰는 사람과 폰에 쓰이는 사람이 있다면, 당신은 확실히 전자입니다. 긴 글, 긴 영상, 긴 생각이 아직 가능한 희귀 뇌입니다.',
      en: 'Top-tier digital restraint. Some use the phone; some are used by it — you\'re clearly the former. Long reads, long films, long thoughts: still possible. Rare brain.',
      ja: 'デジタル刺激への節制力が上位圏。スマホを使う人と使われる人がいるなら、あなたは確実に前者。長文・長編・長考がまだ可能な希少な脳です。',
    },
    slap: {
      ko: '단, 절제가 "흥미 없음"의 다른 이름은 아닌지 한 번만 점검하세요. 세상과 트렌드를 너무 멀리하면 절제는 어느새 고립의 명분이 됩니다. 곰도 봄에는 동면에서 나옵니다.',
      en: 'Just check once: is your restraint actually disinterest? Stray too far from the world and discipline becomes an alibi for isolation. Even bears leave the den in spring.',
      ja: 'ただし節制が「興味のなさ」の別名でないか一度だけ点検を。世界から離れすぎると節制は孤立の名分になります。クマも春には冬眠から出ます。',
    },
    risks: [
      { ko: '밈·트렌드 문해력이 떨어지면 또래 대화에서 소외감을 느낄 수 있음', en: 'Low meme literacy can mean feeling left out of peer talk', ja: 'ミーム・トレンドリテラシーが落ちると同世代の会話で疎外感も' },
      { ko: '절제력 과신은 새 플랫폼의 설계된 중독 앞에서 깨질 수 있음', en: 'Overconfidence can crack against newly engineered addictions', ja: '節制への過信は新たに設計された中毒の前で崩れ得る' },
    ],
    solutions: [
      { ko: '주 1회 "의도적 탐험" 30분 — 절제는 차단이 아니라 선택일 때 완성됩니다', en: '30 minutes of intentional exploring weekly — restraint matures from blocking into choosing', ja: '週1回「意図的探検」30分。節制は遮断ではなく選択で完成する' },
      { ko: '당신의 사용 루틴을 주변에 공유하세요 — 누군가에겐 처방전입니다', en: 'Share your usage routine — it\'s a prescription for someone', ja: '自分の使用ルーティンを周りに共有を。誰かには処方箋です' },
    ],
    strengths: [
      { ko: '깊은 몰입(딥워크)이 가능한 황금 집중력', en: 'Deep-work-grade golden attention', ja: 'ディープワーク級の黄金集中力' },
      { ko: '지루함을 견디는 힘 = 창의력의 원료 보유', en: 'Tolerance for boredom — the raw material of creativity', ja: '退屈に耐える力＝創造性の原料を保有' },
    ],
  },

  hamster: {
    emoji: '🐹',
    grad: ['#FFB020', '#F25CA2'],
    name: { ko: '쳇바퀴 햄스터', en: 'Wheel-Running Hamster', ja: '回し車ハムスター' },
    title: { ko: '새로고침 반사신경 보유자', en: 'Refresh-Reflex Owner', ja: '更新反射神経の持ち主' },
    tagline: { ko: '"딱 5분만"이 인생 최대의 거짓말', en: '"Just 5 minutes" — my life\'s biggest lie', ja: '「あと5分だけ」が人生最大の嘘' },
    desc: {
      ko: '도파민 루프 주의 구간입니다. 자극을 쫓는 게 아니라, 자극이 끊기는 순간의 허전함을 피하는 단계로 넘어가는 중 — 쳇바퀴는 달리는 동안엔 즐겁지만, 내려서 보면 제자리입니다.',
      en: 'Dopamine-loop caution zone. You\'re shifting from chasing stimulation to fleeing the emptiness when it stops. The wheel feels fun while running — step off, and you haven\'t moved.',
      ja: 'ドーパミンループ注意ゾーン。刺激を追うのではなく、刺激が切れた瞬間の虚しさを避ける段階へ移行中。回し車は走っている間は楽しいが、降りてみれば同じ場所。',
    },
    slap: {
      ko: '스크린타임을 보고 놀라는 건 매주 반복되는 의식일 뿐, 행동이 아닙니다. 당신의 집중력은 사라진 게 아니라 15초 단위로 조각났습니다 — 조각은 다시 붙일 수 있습니다. 단, 오늘부터요.',
      en: 'Gasping at your screen-time report is a weekly ritual, not an action. Your focus didn\'t vanish — it got diced into 15-second cuts. The pieces can be rejoined. Starting today.',
      ja: 'スクリーンタイムに驚くのは毎週の儀式であって行動ではない。集中力は消えたのではなく15秒単位に刻まれただけ。欠片はまた繋げられます。ただし今日から。',
    },
    risks: [
      { ko: '수면 직전 숏폼이 수면의 질을 갉아 다음 날 집중력까지 연쇄 침식', en: 'Pre-sleep shorts erode sleep quality, then tomorrow\'s focus', ja: '就寝前のショート動画が睡眠の質を削り、翌日の集中まで連鎖侵食' },
      { ko: '"심심함 = 비상사태" 회로가 굳으면 깊은 몰입이 영구 손상', en: 'If "bored = emergency" hardens, deep focus takes permanent damage', ja: '「退屈＝非常事態」回路が固まると深い没入が永久損傷' },
    ],
    solutions: [
      { ko: '홈 화면에서 숏폼 앱만 2페이지 뒤로 — 마찰 3초가 사용량을 20% 줄입니다', en: 'Move short-form apps two pages back — 3 seconds of friction cuts usage ~20%', ja: 'ショート動画アプリをホームから2ページ奥へ。摩擦3秒で使用量約20%減' },
      { ko: '하루 1회 "지루함 10분" 처방 — 폰 없이 걷기. 뇌의 기본모드가 복구됩니다', en: 'Prescribe 10 minutes of boredom daily — a phoneless walk reboots the brain\'s default mode', ja: '1日1回「退屈10分」処方。スマホなし散歩で脳のデフォルトモードが回復' },
      { ko: '누리 마인드의 스트릭·데일리 퀴즈로 "절제 보상 루프"를 역설계해 보세요', en: 'Reverse-engineer the loop: use Nuri Mind\'s streak & daily quiz as restraint rewards', ja: 'ヌリマインドのストリークとクイズで「節制報酬ループ」を逆設計してみて' },
    ],
    strengths: [
      { ko: '트렌드 감지 속도는 동세대 최상위', en: 'Trend-detection speed: top of your generation', ja: 'トレンド感知速度は同世代最上位' },
      { ko: '루프를 자각했다는 것 자체가 회복의 첫 단계 통과', en: 'Noticing the loop means stage one of recovery is already done', ja: 'ループを自覚した時点で回復の第一段階は通過済み' },
    ],
  },

  raccoon: {
    emoji: '🦝',
    grad: ['#F25CA2', '#6E7BF2'],
    name: { ko: '도파민 라쿤', en: 'Dopamine Raccoon', ja: 'ドーパミンアライグマ' },
    title: { ko: '반짝이면 일단 줍는다', en: 'If It Sparkles, I Grab It', ja: '光ったらとりあえず拾う' },
    tagline: { ko: '뇌가 숏폼에 완전 절임 — 새로고침이 호흡', en: 'Brain fully pickled in shorts — refreshing is breathing', ja: '脳がショート動画に完全漬け込み。更新が呼吸' },
    desc: {
      ko: '갈망·조절 실패·일상 침식·내성 4박자가 모두 높은 고위험 구간입니다. 이것은 의지박약이 아니라, 세계 최고 연봉의 엔지니어들이 설계한 알고리즘과의 비대칭 전쟁에서 밀리고 있는 것뿐입니다. 전략을 바꾸면 됩니다.',
      en: 'Craving, control-failure, life-erosion, tolerance — all four high. This isn\'t weak will; you\'re losing an asymmetric war against algorithms built by the world\'s best-paid engineers. Change the strategy, not the self-blame.',
      ja: '渇望・制御失敗・日常侵食・耐性の4拍子が全て高いハイリスクゾーン。意志薄弱ではなく、世界最高給のエンジニアが設計したアルゴリズムとの非対称戦争に押されているだけ。戦略を変えればいい。',
    },
    slap: {
      ko: '당신의 시간은 사라진 게 아니라 판매됐습니다 — 구매자는 광고주, 판매자는 알고리즘, 그리고 상품이 당신입니다. 무료로 보고 있다고 믿는 동안, 계산서는 집중력과 수면으로 결제되고 있었습니다.',
      en: 'Your time didn\'t disappear — it was sold. Buyer: advertisers. Seller: the algorithm. Product: you. While you thought you were watching for free, the bill was being paid in focus and sleep.',
      ja: 'あなたの時間は消えたのではなく売られた。買い手は広告主、売り手はアルゴリズム、商品はあなた。無料で見ていると信じる間、請求書は集中力と睡眠で決済されていました。',
    },
    risks: [
      { ko: '수면 부족 → 충동성 증가 → 더 많은 사용의 악순환 고리가 이미 가동 중', en: 'The sleep-loss → impulsivity → more-usage loop is already spinning', ja: '睡眠不足→衝動性増加→さらなる使用の悪循環がすでに稼働中' },
      { ko: '장시간 집중이 필요한 학습·업무 능력이 실측으로 저하될 수 있음', en: 'Long-focus capacity for study and work can measurably decline', ja: '長時間集中が必要な学習・業務能力が実測で低下し得る' },
    ],
    solutions: [
      { ko: '의지가 아닌 환경: 침실에 폰 반입 금지 + 회색조 모드 + 앱 타이머 강제', en: 'Environment over willpower: no phone in bedroom, grayscale mode, hard app timers', ja: '意志ではなく環境：寝室持ち込み禁止＋グレースケール＋アプリタイマー強制' },
      { ko: '"디톡스 7일"보다 "취침 1시간 전 차단"이 성공률이 압도적으로 높습니다', en: '"No screens 1h before bed" beats "7-day detox" by a mile in success rate', ja: '「デトックス7日」より「就寝1時間前遮断」の方が成功率は圧倒的' },
      { ko: '절제력 훈련은 보상이 필요합니다 — 누리 마인드 스트릭·퀴즈·랜덤박스를 대체 루프로', en: 'Restraint needs rewards — make Nuri Mind\'s streak, quiz and box your substitute loop', ja: '節制には報酬が必要。ヌリマインドのストリーク・クイズ・ボックスを代替ループに' },
    ],
    strengths: [
      { ko: '정보 수집력과 밈 감각은 무기 — 방향만 생산으로 돌리면 콘텐츠 크리에이터 재능', en: 'Your info-gathering and meme sense are weapons — aimed at creation, that\'s creator talent', ja: '情報収集力とミーム感覚は武器。生産に向ければクリエイターの才能' },
      { ko: '도파민 감수성이 높다는 건 몰입 잠재력도 높다는 뜻', en: 'High dopamine sensitivity also means high flow potential', ja: 'ドーパミン感受性が高い＝没入の潜在力も高い' },
    ],
  },

  bamboo: {
    emoji: '🎋',
    grad: ['#10B981', '#7DDFB6'],
    name: { ko: '대나무', en: 'Bamboo', ja: '竹' },
    title: { ko: '강풍에도 부러지지 않는 탄력', en: 'Bends in the gale, never breaks', ja: '強風でも折れないしなやかさ' },
    tagline: { ko: '휘어질 뿐, 부러지지 않는다', en: 'I bend, I don\'t break', ja: 'しなるだけ、折れない' },
    desc: {
      ko: '넘어져도 다시 일어서는 반등력, 내 삶을 끌고 가는 통제감, 변화에 휘어지는 유연함, 기댈 곳이 있는 관계까지 — 회복탄력성의 네 기둥이 모두 단단합니다. 폭풍이 지나가면 가장 먼저 허리를 펴는 쪽이에요.',
      en: 'Bounce-back, control, flexibility, and people to lean on — all four pillars of resilience stand firm. When the storm passes, you straighten up first.',
      ja: '反発力・コントロール・柔軟さ・支え合う関係——回復力の4本柱すべてが堅い。嵐が過ぎれば真っ先に背筋を伸ばす方です。',
    },
    slap: {
      ko: '단, 잘 버틴다는 이유로 모든 짐을 혼자 지려 하진 않습니까? 대나무도 숲을 이뤄야 강풍을 견딥니다. 강함의 다음 단계는 "도와달라"는 한마디예요.',
      en: 'But do you shoulder everything alone because you cope well? Even bamboo needs a grove to survive a gale. Strength\'s next level is saying "help me."',
      ja: 'ただ、よく耐えるからと全ての荷を一人で背負っていませんか？竹も林をなして強風に耐えます。強さの次の段階は「助けて」の一言です。',
    },
    risks: [
      { ko: '"난 괜찮아"가 습관이 되어 한계 신호를 놓칠 수 있음', en: '"I\'m fine" as a habit can hide your limit signals', ja: '「大丈夫」が癖になり限界信号を見逃しがち' },
      { ko: '타인의 약함을 과소평가해 무심하게 보일 수 있음', en: 'You may underrate others\' fragility and seem cold', ja: '他人の弱さを過小評価し冷淡に見えることも' },
    ],
    solutions: [
      { ko: '한 달에 한 번은 약한 모습을 의도적으로 보여주세요', en: 'Once a month, deliberately show vulnerability', ja: '月に一度はあえて弱さを見せて' },
      { ko: '회복의 비결을 주변에 나누면 당신은 누군가의 안전기지가 됩니다', en: 'Share your recovery tricks — you become someone\'s safe base', ja: '回復のコツを共有すれば、誰かの安全基地になれる' },
    ],
    strengths: [
      { ko: '위기에서 가장 빨리 평정을 되찾는 회복 엔진', en: 'A recovery engine that regains calm fastest in crisis', ja: '危機で最も早く平静を取り戻す回復エンジン' },
      { ko: '주변을 안심시키는 단단한 중심', en: 'A solid core that steadies everyone around', ja: '周囲を安心させる堅い軸' },
    ],
  },

  willow: {
    emoji: '🌿',
    grad: ['#5BC99A', '#A3CFB9'],
    name: { ko: '버드나무', en: 'Willow', ja: '柳' },
    title: { ko: '흔들리되 뿌리는 지킨다', en: 'Sways, but keeps its roots', ja: '揺れても根は守る' },
    tagline: { ko: '흔들려도 결국 제자리로', en: 'I sway, but return to center', ja: '揺れても結局元の場所へ' },
    desc: {
      ko: '회복탄력성이 보통 수준이에요. 평소엔 잘 버티지만, 큰 파도가 연달아 오면 잠깐 휘청입니다. 네 기둥(반등·통제·유연·관계) 중 어느 한 곳이 약하면 거기서 물이 새요 — 결과의 세부 막대를 보면 내 약한 기둥이 보입니다.',
      en: 'Mid-range resilience. You usually hold, but back-to-back big waves can rock you. If one of the four pillars is weak, that\'s where water leaks — check your subscale bars.',
      ja: '回復力は普通レベル。普段は耐えるが、大波が続くと一瞬ぐらつく。4本柱のどこかが弱いとそこから水が漏れる——詳細バーで弱い柱が分かります。',
    },
    slap: {
      ko: '"보통은 괜찮다"는 평균의 함정입니다. 평소가 아니라 최악의 날에 나를 지탱하는 게 회복탄력성이에요. 약한 기둥 하나를 정해 이번 달에 보강해 보세요.',
      en: '"Usually fine" is the average trap. Resilience is what holds you on your worst day, not your normal one. Pick one weak pillar to reinforce this month.',
      ja: '「普段は平気」は平均の罠。回復力は普段ではなく最悪の日に自分を支えるもの。弱い柱を一つ決めて今月補強を。',
    },
    risks: [
      { ko: '연속된 스트레스에 회복 속도가 못 따라갈 수 있음', en: 'Recovery may lag behind back-to-back stress', ja: '連続するストレスに回復が追いつかないことも' },
      { ko: '평소의 안정감이 위기 대비를 미루게 만들 수 있음', en: 'Everyday calm can make you postpone crisis-proofing', ja: '普段の安定が危機への備えを後回しにさせる' },
    ],
    solutions: [
      { ko: '세부 막대에서 가장 낮은 기둥 1개를 이번 달 목표로', en: 'Make your lowest pillar this month\'s goal', ja: '詳細バーで最も低い柱を今月の目標に' },
      { ko: '회복 루틴(수면·산책·대화)을 미리 "선약"으로 잡아두기', en: 'Pre-book recovery routines (sleep, walks, talks) as appointments', ja: '回復ルーティン（睡眠・散歩・対話）を先約として確保' },
    ],
    strengths: [
      { ko: '극단으로 치우치지 않는 균형 감각', en: 'Balance that avoids extremes', ja: '極端に偏らないバランス感覚' },
      { ko: '조금만 보강하면 빠르게 단단해지는 성장 여력', en: 'A little reinforcement and you harden fast', ja: '少し補強すれば素早く固まる成長余力' },
    ],
  },

  glass: {
    emoji: '🫧',
    grad: ['#9CB4C9', '#C9D6E0'],
    name: { ko: '유리', en: 'Glass', ja: 'ガラス' },
    title: { ko: '맑지만 쉽게 금이 가는', en: 'Clear, but cracks easily', ja: '澄んでいるが割れやすい' },
    tagline: { ko: '작은 충격도 오래 남는다', en: 'Small shocks linger long', ja: '小さな衝撃も長く残る' },
    desc: {
      ko: '지금은 회복탄력성이 낮은 구간이에요. 약해서가 아니라, 최근에 너무 많은 충격을 받았거나 기댈 곳이 부족했을 가능성이 커요. 유리는 깨지기 쉽지만, 그래서 가장 맑게 빛나는 재료이기도 합니다.',
      en: 'Your resilience is low right now. Not because you\'re weak — likely too many recent shocks or too little support. Glass cracks easily, but it\'s also what shines clearest.',
      ja: '今は回復力が低いゾーン。弱いからではなく、最近衝撃が多すぎたか支えが足りなかった可能性が高い。ガラスは割れやすいが、だからこそ最も澄んで輝く素材です。',
    },
    slap: {
      ko: '"나는 원래 멘탈이 약해"라는 말은 사실이 아니라 습관입니다. 회복탄력성은 타고나는 게 아니라 근육처럼 길러지는 능력이에요. 단, 지금 혼자 버티기 힘들다면 그건 약함이 아니라 신호입니다.',
      en: '"I just have a weak mind" isn\'t a fact, it\'s a habit. Resilience is grown like a muscle, not born. But if holding on alone feels impossible now, that\'s a signal, not weakness.',
      ja: '「自分はメンタルが弱い」は事実ではなく癖です。回復力は生まれつきでなく筋肉のように育つ能力。ただ今一人で耐えるのが辛いなら、それは弱さでなく信号です。',
    },
    risks: [
      { ko: '작은 스트레스가 오래 남아 일상까지 번질 수 있음', en: 'Small stress lingers and can spill into daily life', ja: '小さなストレスが長く残り日常まで広がる' },
      { ko: '"나만 약하다"는 고립감이 회복을 더 늦춤', en: 'Feeling uniquely fragile isolates you and slows recovery', ja: '「自分だけ弱い」という孤立感が回復をさらに遅らせる' },
    ],
    solutions: [
      { ko: '가장 작은 한 걸음부터 — 오늘 수면 7시간 사수', en: 'Start with the smallest step — defend 7 hours of sleep today', ja: '最小の一歩から——今日睡眠7時間死守' },
      { ko: '믿을 만한 한 사람에게 지금 상태를 솔직히 말해보기', en: 'Tell one trusted person honestly how you\'re doing', ja: '信頼できる一人に今の状態を正直に話す' },
      { ko: '2주 이상 무너진 느낌이 지속되면 전문 상담의 도움을 받으세요', en: 'If the sunk feeling lasts 2+ weeks, seek professional counseling', ja: '2週間以上沈んだ感覚が続くなら専門相談を' },
    ],
    strengths: [
      { ko: '섬세한 감수성 — 타인의 아픔을 깊이 이해하는 자산', en: 'Delicate sensitivity — deep understanding of others\' pain', ja: '繊細な感受性——他人の痛みを深く理解する資産' },
      { ko: '바닥을 경험한 사람만의 회복 후 공감력', en: 'Post-recovery empathy only those who hit bottom can offer', ja: 'どん底を知る人だけの回復後の共感力' },
    ],
  },

  fox: {
    emoji: '🦊',
    grad: ['#A23E63', '#D88BA6'],
    name: { ko: '여우', en: 'Fox', ja: 'キツネ' },
    title: { ko: '판을 읽는 전략가 (마키아벨리형)', en: 'The Board-reading Strategist', ja: '盤を読む戦略家' },
    tagline: { ko: '감정보다 계산이 먼저 움직인다', en: 'Calculation moves before emotion', ja: '感情より計算が先に動く' },
    desc: {
      ko: '다크 트라이어드 중 마키아벨리즘(전략·조종)이 우세해요. 사람과 상황을 체스판처럼 읽고, 내 패는 끝까지 감춥니다. 이 전략 지능은 협상·정치·생존에서 강력한 무기예요. 차갑다기보다, 늘 두 수 앞을 보는 거죠.',
      en: 'Machiavellianism (strategy, manipulation) leads your dark triad. You read people like a chessboard and keep your cards hidden. This strategic mind is a weapon in negotiation, politics, survival — not cold, just two moves ahead.',
      ja: 'ダークトライアドの中でマキャベリズム（戦略・操作）が優勢。人と状況をチェス盤のように読み、自分の手は最後まで隠す。この戦略知能は交渉・政治・生存で強力な武器。冷たいというより常に二手先を見ている。',
    },
    slap: {
      ko: '모두를 체스 말로 보는 사람의 외로움은, 정작 자기 편이 누구인지 끝까지 모른다는 데 있습니다. 모든 관계를 거래로 환산하면, 대가 없이 곁에 남는 사람의 가치를 영영 모르게 돼요.',
      en: 'The loneliness of seeing everyone as a chess piece is never knowing who\'s truly on your side. Convert every bond into a transaction, and you\'ll never learn the worth of those who stay for free.',
      ja: '皆をチェスの駒と見る人の孤独は、自分の味方が誰か最後まで分からないこと。全ての関係を取引に換算すれば、見返りなく残る人の価値を永遠に知れない。',
    },
    risks: [
      { ko: '단기 이득을 위한 조종이 장기 신뢰를 무너뜨림', en: 'Manipulation for short-term gain erodes long-term trust', ja: '短期利得のための操作が長期信頼を崩す' },
      { ko: '"이용당하기 전에 이용"하는 전제가 진짜 우군을 밀어냄', en: 'The "use before being used" premise pushes real allies away', ja: '「利用される前に利用」の前提が真の味方を遠ざける' },
    ],
    solutions: [
      { ko: '대가 없는 호의를 분기 1회 실험 — 신뢰는 가장 비싼 자산', en: 'Try one no-strings favor a quarter — trust is the priciest asset', ja: '見返りなしの好意を四半期に1回。信頼は最も高価な資産' },
      { ko: '전략을 "이기는 판"이 아니라 "같이 커지는 판"에 쓰면 천장이 사라짐', en: 'Aim strategy at win-win, not just winning — your ceiling vanishes', ja: '戦略を「勝つ盤」でなく「共に育つ盤」に使えば天井が消える' },
    ],
    strengths: [
      { ko: '복잡한 이해관계를 꿰뚫는 전략적 통찰', en: 'Strategic insight that cuts through tangled interests', ja: '複雑な利害を見抜く戦略的洞察' },
      { ko: '위기에서 흔들리지 않는 냉정한 판단력', en: 'Cool judgment that holds steady in crisis', ja: '危機で揺らがない冷静な判断力' },
    ],
  },

  peacock: {
    emoji: '🦚',
    grad: ['#C04E7C', '#E6A3C0'],
    name: { ko: '공작', en: 'Peacock', ja: '孔雀' },
    title: { ko: '무대를 지배하는 주인공 (나르시시즘형)', en: 'The Spotlight Protagonist', ja: '舞台を支配する主役' },
    tagline: { ko: '시선이 모일 때 가장 살아난다', en: 'I come alive when all eyes turn', ja: '視線が集まる時に最も輝く' },
    desc: {
      ko: '다크 트라이어드 중 나르시시즘(자기과시·특권의식)이 우세해요. 존재감과 자신감이 강하고, 사람들의 인정이 당신을 움직이는 연료입니다. 이 자기확신은 리더십과 매력으로 작동해 무대 위에서 가장 빛나게 만들죠.',
      en: 'Narcissism (self-display, entitlement) leads your dark triad. Strong presence and confidence; admiration is your fuel. This self-belief works as leadership and charisma — you shine brightest on stage.',
      ja: 'ダークトライアドの中でナルシシズム（自己誇示・特権意識）が優勢。存在感と自信が強く、人の承認が動力。この自己確信はリーダーシップと魅力として働き、舞台で最も輝く。',
    },
    slap: {
      ko: '박수가 멈추는 순간 불안해진다면, 당신은 무대를 가진 게 아니라 무대에 갇힌 겁니다. 인정을 연료로 쓰는 엔진은 연료가 끊기면 멈춰요. 박수 없이도 나를 지탱하는 내적 가치를 한 개는 가지세요.',
      en: 'If the silence after applause makes you anxious, you don\'t own the stage — you\'re trapped on it. An engine fueled by admiration stalls when the fuel stops. Keep one inner value that holds you without applause.',
      ja: '拍手が止まった瞬間に不安になるなら、舞台を持つのでなく舞台に閉じ込められている。承認を燃料にするエンジンは燃料が切れれば止まる。拍手なしでも自分を支える内的価値を一つ持って。',
    },
    risks: [
      { ko: '비판에 과민 반응해 관계가 쉽게 틀어질 수 있음', en: 'Over-reacting to criticism can break relationships easily', ja: '批判に過敏反応し関係が崩れやすい' },
      { ko: '인정 욕구가 무리한 과시·소비로 새어 나갈 수 있음', en: 'The need for admiration can leak into overspending or showing off', ja: '承認欲求が無理な誇示・消費に漏れ出る' },
    ],
    solutions: [
      { ko: '하루 1개, 아무도 모르게 한 선행을 기록해 보세요', en: 'Log one good deed a day that nobody sees', ja: '1日1つ、誰にも知られない善行を記録' },
      { ko: '비판을 들으면 3초 멈춤 — 반박 대신 "한 가지는 맞다" 찾기', en: 'Pause 3 seconds on criticism — find the "one part that\'s true"', ja: '批判には3秒停止——反論より「一つは正しい」を探す' },
    ],
    strengths: [
      { ko: '사람을 끌어당기는 카리스마와 추진력', en: 'Magnetic charisma and drive', ja: '人を惹きつけるカリスマと推進力' },
      { ko: '높은 자기확신에서 나오는 도전 정신', en: 'Bold ambition born of high self-belief', ja: '高い自己確信から生まれる挑戦精神' },
    ],
  },

  shark: {
    emoji: '🦈',
    grad: ['#7C2D49', '#B86A85'],
    name: { ko: '상어', en: 'Shark', ja: 'サメ' },
    title: { ko: '멈추지 않는 직진 본능 (사이코패시형)', en: 'The Unstoppable Charge', ja: '止まらない直進本能' },
    tagline: { ko: '두려움보다 충동이 앞선다', en: 'Impulse outruns fear', ja: '恐れより衝動が先に立つ' },
    desc: {
      ko: '다크 트라이어드 중 사이코패시 경향(냉정·충동·대담)이 우세해요. 위험 앞에서 남들이 얼어붙을 때 당신은 움직입니다. 죄책감과 두려움이 적어 결단이 빠르고, 이 대담함은 위기 대응이나 개척 분야에서 강력한 자산이 됩니다.',
      en: 'Psychopathy traits (cool, impulsive, bold) lead your dark triad. When others freeze before danger, you move. Low guilt and fear make you decisive — this boldness is a real asset in crisis and frontier work.',
      ja: 'ダークトライアドの中でサイコパシー傾向（冷静・衝動・大胆）が優勢。危険の前で皆が固まる時、あなたは動く。罪悪感と恐れが少なく決断が速い。この大胆さは危機対応や開拓分野で強力な資産。',
    },
    slap: {
      ko: '두려움이 없는 게 아니라, 브레이크가 약한 겁니다. 충동이 앞설 때 가장 먼저 다치는 건 종종 당신 자신이에요. 직진 본능에 0.5초의 멈춤만 더해도, 당신의 대담함은 무모함에서 용기로 승급합니다.',
      en: 'It\'s not that you have no fear — your brakes are weak. When impulse leads, the first casualty is often you. Add just half a second of pause, and your boldness upgrades from reckless to brave.',
      ja: '恐れがないのではなく、ブレーキが弱いのです。衝動が先に立つ時、最初に傷つくのはしばしば自分。直進本能に0.5秒の停止を足すだけで、大胆さは無謀から勇気へ昇格する。',
    },
    risks: [
      { ko: '충동적 결정(지출·발언·관계)이 반복 청구서를 보냄', en: 'Impulsive decisions keep sending you invoices', ja: '衝動的決定が繰り返し請求書を送る' },
      { ko: '타인의 감정을 가볍게 봐 관계에 균열이 생김', en: 'Underweighting others\' feelings cracks relationships', ja: '他人の感情を軽視し関係にひびが入る' },
    ],
    solutions: [
      { ko: '큰 결정 전 "하루 자고 결정" 규칙 하나만 만들기', en: 'One rule: sleep on every big decision', ja: '大きな決定の前に「一晩寝てから」ルールを一つ' },
      { ko: '내 말이 상대에게 어떻게 들릴지 1초만 시뮬레이션하기', en: 'Simulate for one second how your words will land', ja: '自分の言葉が相手にどう響くか1秒だけ想像' },
    ],
    strengths: [
      { ko: '위기에서 얼지 않는 압도적 행동력', en: 'Overwhelming drive that never freezes in crisis', ja: '危機で固まらない圧倒的な行動力' },
      { ko: '두려움에 발목 잡히지 않는 개척자 기질', en: 'A pioneer\'s spirit unchained by fear', ja: '恐れに足を取られない開拓者気質' },
    ],
  },

  dove: {
    emoji: '🕊️',
    grad: ['#7FB5A0', '#CDE8DD'],
    name: { ko: '흰비둘기', en: 'White Dove', ja: '白いハト' },
    title: { ko: '맑고 투명한 관계형', en: 'The Clear-hearted', ja: '澄んだ関係型' },
    tagline: { ko: '계산보다 진심이 먼저', en: 'Sincerity before strategy', ja: '計算より本心が先' },
    desc: {
      ko: '어두운 3요인(전략·과시·냉담)이 모두 낮아요. 사람을 도구로 보지 않고, 인정에 휘둘리지 않으며, 타인의 아픔에 공감합니다. 통계적으로 보기 드문 "맑은" 프로필이에요. 신뢰가 복리로 쌓이는 장기전의 강자죠.',
      en: 'All three dark factors (strategy, display, coldness) run low. You don\'t use people, aren\'t swayed by admiration, and feel others\' pain. A statistically rare "clear" profile — the strong one in the long game where trust compounds.',
      ja: '暗い3要因（戦略・誇示・冷淡）すべてが低い。人を道具と見ず、承認に振り回されず、他人の痛みに共感する。統計的に珍しい「澄んだ」プロファイル。信頼が複利で積もる長期戦の強者です。',
    },
    slap: {
      ko: '다만 맑은 사람의 약점은, 어두운 패를 쥔 사람을 너무 늦게 알아챈다는 거예요. 선함이 호구가 되지 않으려면, 가끔은 여우의 눈으로 상대를 읽는 연습도 필요합니다.',
      en: 'The clear-hearted\'s weakness: spotting those holding dark cards far too late. So your kindness isn\'t exploited, practice reading people with a fox\'s eye now and then.',
      ja: '澄んだ人の弱点は、暗い手を握る人に気づくのが遅すぎること。善良さがカモにならないために、時にはキツネの目で相手を読む練習も必要です。',
    },
    risks: [
      { ko: '조종적인 사람에게 이용당해도 늦게 알아챔', en: 'You notice manipulators only late', ja: '操作的な人に利用されても気づくのが遅い' },
      { ko: '갈등을 피하려다 정당한 몫을 놓칠 수 있음', en: 'Avoiding conflict can cost you your fair share', ja: '葛藤を避けて正当な取り分を逃すことも' },
    ],
    solutions: [
      { ko: '"이 사람은 무엇을 얻으려 하지?"를 가끔 자문해 보기', en: 'Occasionally ask: "what does this person want from me?"', ja: '時々「この人は何を得ようとしている？」と自問' },
      { ko: '거절도 친절의 일부 — 한 달에 한 번 거절 연습', en: 'Saying no is part of kindness — practice once a month', ja: '断ることも親切の一部——月に一度の練習' },
    ],
    strengths: [
      { ko: '신뢰가 복리로 쌓이는 장기전 최강 캐릭터', en: 'Trust compounds — the strongest in the long game', ja: '信頼が複利で積もる長期戦最強キャラ' },
      { ko: '집단의 심리적 안전감을 끌어올리는 희귀 자원', en: 'A rare resource that raises a group\'s safety', ja: '集団の心理的安全性を高める希少資源' },
    ],
  },

  tit: {
    emoji: '🐦',
    grad: ['#8FB8E8', '#A3CFB9'],
    name: { ko: '박새', en: 'Great Tit', ja: 'シジュウカラ' },
    title: { ko: '정서 지능의 항해사', en: 'The Navigator of Emotional Wits', ja: '情緒知能の航海士' },
    tagline: {
      ko: '퍼즐보다 사람과 맥락을 읽는 뇌',
      en: 'A brain tuned to people and context over puzzles',
      ja: 'パズルより人と文脈を読む脳',
    },
    desc: {
      ko: '이번 측정에서 유동 연산 점수는 평균 부근이지만, 기억하십시오 — 이 검사는 당신의 가치가 아니라 "추상 퍼즐 처리 속도" 한 단면만 잘라 본 것입니다. 박새는 도구를 쓰고 사회적 학습을 하는, 실전형 지능의 상징입니다.',
      en: 'Your fluid-reasoning score lands near average this time — but remember, this test sliced only one facet: abstract puzzle speed, not your worth. The great tit is famous for tool use and social learning: the emblem of practical intelligence.',
      ja: '今回の測定では流動演算スコアは平均付近ですが、覚えておいてください — この検査はあなたの価値ではなく「抽象パズル処理速度」という一断面を切り取っただけ。シジュウカラは道具を使い社会的学習をする、実戦型知能の象徴です。',
    },
    slap: {
      ko: '단, "나는 머리 쓰는 건 안 맞아"라는 셀프 낙인은 지금 폐기하십시오. 유동 지능은 근육입니다. 측정을 피하는 사람은 늘 그대로지만, 다시 도전하는 사람의 그래프는 우상향합니다.',
      en: 'But discard the self-label "thinking isn\'t my thing" — today. Fluid intelligence is a muscle. Those who avoid measurement stay flat; those who retry draw an upward curve.',
      ja: 'ただし「頭を使うのは向いてない」というセルフ烙印は今すぐ廃棄を。流動性知能は筋肉です。測定を避ける人は現状維持のまま、再挑戦する人のグラフは右肩上がりです。',
    },
    risks: [
      { ko: '시간 압박 상황에서 실력보다 낮은 퍼포먼스가 나옴', en: 'Time pressure pushes your output below your real ability', ja: '時間圧の状況で実力より低いパフォーマンスが出る' },
      { ko: '익숙한 풀이에 안주하면 추론 근육이 그대로 굳어버림', en: 'Settling into familiar methods lets the reasoning muscle stiffen', ja: '慣れた解き方に安住すると推論筋がそのまま固まる' },
    ],
    solutions: [
      { ko: '하루 5분 퍼즐(수열·블록·로직)을 90일 — 그래프가 움직입니다', en: '5 minutes of puzzles daily for 90 days — the graph will move', ja: '1日5分のパズルを90日。グラフは動きます' },
      { ko: '문제를 소리 내어 구조화하는 습관이 처리 속도를 끌어올립니다', en: 'Structuring problems out loud raises your processing speed', ja: '問題を声に出して構造化する習慣が処理速度を引き上げます' },
      { ko: '컨디션 좋은 시간대에 재검사해 진짜 기저선을 확인하세요', en: 'Retest at your peak hours to find your true baseline', ja: 'コンディションの良い時間帯に再検査し、本当のベースラインを確認' },
    ],
    strengths: [
      { ko: '사람·분위기·맥락을 읽는 실전 감각', en: 'Field-tested sense for people, mood, and context', ja: '人・空気・文脈を読む実戦感覚' },
      { ko: '꾸준한 반복으로 어떤 도구든 끝내 길들이는 적응력', en: 'Adaptability that eventually tames any tool through repetition', ja: '地道な反復でどんな道具も最後には乗りこなす適応力' },
    ],
  },

  /* ── 정밀 기억력 검사 페르소나 ── */
  elephant: {
    emoji: '🐘',
    grad: ['#5B6CF0', '#34C9D6'],
    name: { ko: '코끼리', en: 'Elephant', ja: 'ゾウ' },
    title: { ko: '기억의 도서관', en: 'The Living Library', ja: '記憶の図書館' },
    tagline: {
      ko: '한 번 입력된 정보는 좀처럼 새지 않는 뇌',
      en: 'A brain where stored data rarely leaks',
      ja: '一度入った情報がなかなか漏れない脳',
    },
    desc: {
      ko: '작업기억 용량이 상위권입니다. 여러 정보를 머릿속에 동시에 띄워 두고 굴리는 힘이 좋아, 복잡한 지시도 한 번에 담아냅니다. 다만 잘 외운다고 이해와 통찰까지 자동으로 따라오는 건 아니라는 점을 기억하세요.',
      en: 'Your working-memory capacity sits in the top tier. You can hold and juggle several streams of information at once, capturing complex instructions in one pass. But remember — remembering well does not automatically bring understanding.',
      ja: 'ワーキングメモリ容量は上位圏。複数の情報を同時に頭の中に浮かべて操る力が強く、複雑な指示も一度で取り込めます。ただ、よく覚えることと深く理解することは別だと忘れずに。',
    },
    slap: {
      ko: '잘 외우는 것과 잘 생각하는 것은 다릅니다. 머리에 쌓아둔 정보를 꺼내 연결하지 않으면, 당신의 뛰어난 기억은 그저 문 닫힌 창고일 뿐입니다.',
      en: 'Remembering and thinking are not the same. If you never pull stored data out and connect it, your remarkable memory is just a warehouse with the doors shut.',
      ja: 'よく覚えることと、よく考えることは違います。蓄えた情報を取り出して繋げなければ、その優れた記憶もただの閉ざされた倉庫です。',
    },
    risks: [
      { ko: '정보를 너무 잘 붙잡아 불필요한 걱정·후회까지 오래 곱씹게 됨', en: 'You hold on so well that needless worries and regrets also linger', ja: '情報をよく掴むぶん、不要な心配や後悔まで長く反芻してしまう' },
      { ko: '암기에 의존해 메모·기록 습관을 소홀히 하면 결정적 순간에 빈다', en: 'Leaning on memory and skipping notes leaves gaps at the worst moment', ja: '暗記に頼ってメモの習慣を怠ると、肝心な時に抜ける' },
    ],
    solutions: [
      { ko: '외운 것을 남에게 설명·요약해 "인출"로 굳히면 장기기억으로 넘어가요', en: 'Explain or summarize what you learned — retrieval cements it into long-term memory', ja: '覚えたことを誰かに説明・要約し「想起」で固めると長期記憶へ移る' },
      { ko: '큰 정보는 의미 단위(청킹)로 묶으면 같은 용량으로 더 많이 담아요', en: 'Chunk big data into meaningful units to fit more into the same capacity', ja: '大きな情報を意味のかたまり（チャンク）にまとめると、同じ容量でより多く入る' },
    ],
    strengths: [
      { ko: '복잡한 지시·숫자·이름을 한 번에 담는 높은 작업기억', en: 'High working memory that captures complex instructions, numbers, and names at once', ja: '複雑な指示・数字・名前を一度に収める高いワーキングメモリ' },
      { ko: '여러 갈래의 정보를 동시에 굴리는 멀티 처리력', en: 'Multi-processing that runs several threads of information in parallel', ja: '複数の情報を同時に回すマルチ処理力' },
    ],
  },

  octopus: {
    emoji: '🐙',
    grad: ['#4F86E0', '#48C4B0'],
    name: { ko: '문어', en: 'Octopus', ja: 'タコ' },
    title: { ko: '분산 저장가', en: 'The Distributed Mind', ja: '分散ストレージ' },
    tagline: {
      ko: '필요한 만큼은 정확히 붙잡는 균형형 기억',
      en: 'Holds exactly as much as it needs',
      ja: '必要な分はきちんと掴む均衡型の記憶',
    },
    desc: {
      ko: '평균에서 평균 상단의 안정적인 기억폭입니다. 일상 대부분의 과제엔 충분한 용량이고, 정보가 한꺼번에 몰리거나 피곤할 때만 살짝 흔들립니다. 도구와 협업할 줄 아는 현실적인 머리예요.',
      en: 'Your span runs from average to upper-average and stays stable. It is plenty for most daily tasks and only wobbles when information floods in at once or when you are tired. A pragmatic mind that knows how to work with tools.',
      ja: '平均から平均上位の安定した記憶幅です。日常のほとんどの課題には十分な容量で、情報が一度に押し寄せたり疲れている時だけ少し揺れます。道具と協働できる現実的な頭です。',
    },
    slap: {
      ko: '"평소엔 충분하다"는 말은, 결정적 순간엔 모자랄 수 있다는 뜻이기도 합니다. 용량을 믿고 메모를 버리는 순간, 하필 가장 중요한 한 개가 빠져나갑니다.',
      en: '"Enough for now" also means it can fall short when it matters most. The moment you trust capacity and drop your notes, the single most important item slips out.',
      ja: '「普段は十分」とは、肝心な時には足りないこともあるという意味でもあります。容量を信じてメモを捨てた瞬間、よりによって一番大事な一つが抜け落ちます。',
    },
    risks: [
      { ko: '정보량이 한계를 넘으면 가장 최근·중요한 항목부터 흘림', en: 'Past your limit, the most recent and important items drop first', ja: '情報量が限界を超えると、最も新しく重要な項目から漏れる' },
      { ko: '피곤하거나 멀티태스킹할 때 기억폭이 눈에 띄게 줄어듦', en: 'Your span shrinks noticeably when tired or multitasking', ja: '疲れている時やマルチタスク時に記憶幅が目に見えて縮む' },
    ],
    solutions: [
      { ko: '중요한 건 즉시 한 줄 메모로 머리 밖에 내려놓으세요', en: 'Offload anything important into a one-line note right away', ja: '大事なことはすぐ一行メモにして頭の外へ下ろす' },
      { ko: '한 번에 하나씩 — 작업을 직렬화하면 실수율이 급감해요', en: 'One thing at a time — serializing tasks slashes your error rate', ja: '一度に一つずつ—作業を直列化するとミス率が激減' },
    ],
    strengths: [
      { ko: '상황에 맞게 용량을 배분하는 유연한 기억 운용', en: 'Flexible memory use that allocates capacity to the situation', ja: '状況に応じて容量を配分する柔軟な記憶運用' },
      { ko: '메모·캘린더 같은 외부 도구와 잘 협업하는 현실 감각', en: 'Real-world sense for teaming up with notes and calendars', ja: 'メモやカレンダーなど外部ツールとうまく協働する現実感覚' },
    ],
  },

  goldfish: {
    emoji: '🐠',
    grad: ['#56B0E8', '#5ED6C0'],
    name: { ko: '금붕어', en: 'Goldfish', ja: '金魚' },
    title: { ko: '지금 이 순간형', en: 'The Here-and-Now', ja: '今この瞬間型' },
    tagline: {
      ko: '과거에 얽매이지 않는 가벼운 기억',
      en: 'A light memory unchained from the past',
      ja: '過去に縛られない軽い記憶',
    },
    desc: {
      ko: '순간적으로 붙잡는 기억폭이 평균 아래로 측정됐어요. 이건 머리가 나쁘다는 뜻이 아니라, 정보를 "머리 밖"에 두고 사는 방식이 더 잘 맞는다는 신호입니다. 시스템만 갖추면 약점은 거의 사라져요.',
      en: 'Your momentary span measured below average. This is not about being unintelligent — it is a signal that storing information "outside your head" suits you better. With the right system, the weakness all but disappears.',
      ja: '瞬間的に掴む記憶幅が平均以下と測定されました。これは頭が悪いという意味ではなく、情報を「頭の外」に置いて生きる方式が合っているという合図です。仕組みさえ整えば弱点はほぼ消えます。',
    },
    slap: {
      ko: '"금붕어는 3초밖에 기억 못 한다"는 건 사실 낭설입니다. 문제는 기억력이 아니라, 안 적어두고 머리만 믿는 습관이에요. 시스템을 만들면 약점은 그냥 사라집니다.',
      en: 'The "goldfish forgets in 3 seconds" line is a myth. Your problem isn\'t memory — it\'s the habit of trusting your head instead of writing things down. Build a system and the weakness simply vanishes.',
      ja: '「金魚は3秒しか覚えられない」は実は俗説です。問題は記憶力ではなく、書かずに頭だけ信じる習慣です。仕組みを作れば弱点はただ消えます。',
    },
    risks: [
      { ko: '들은 지시·약속을 자주 놓쳐 신뢰에 금이 갈 수 있음', en: 'Missing spoken instructions and promises can crack others\' trust', ja: '聞いた指示・約束をよく取りこぼし、信頼にひびが入りかねない' },
      { ko: '머리로만 처리하려다 같은 실수를 반복하기 쉬움', en: 'Trying to handle it all in your head invites the same mistake twice', ja: '頭だけで処理しようとして、同じミスを繰り返しやすい' },
    ],
    solutions: [
      { ko: '모든 약속·할 일은 즉시 메모로 — 머리는 생각용, 기억은 도구에게 맡기세요', en: 'Capture every task the instant it appears — heads are for thinking, let tools remember', ja: 'すべての約束・タスクは即メモへ。頭は考える用、記憶は道具に任せる' },
      { ko: '정보를 소리 내 반복하거나 덩어리로 묶어 짧은 폭을 보완하세요', en: 'Say it aloud or chunk it to stretch a short span', ja: '情報を声に出して反復したり、かたまりにまとめて短い幅を補う' },
    ],
    strengths: [
      { ko: '과거에 매이지 않아 회복·전환이 빠른 가벼움', en: 'Lightness that recovers and switches gears fast, unchained from the past', ja: '過去に縛られず、回復・切り替えが速い軽やかさ' },
      { ko: '지금 눈앞의 일에 강하게 몰입하는 현재 집중력', en: 'Present-focus that dives hard into what is right in front of you', ja: '今目の前のことに強く没入する現在集中力' },
    ],
  },

  /* ── 정밀 집중력 검사 페르소나 ── */
  hawk: {
    emoji: '🦅',
    grad: ['#14B8A6', '#34D399'],
    name: { ko: '매', en: 'Hawk', ja: 'タカ' },
    title: { ko: '정밀 조준형', en: 'The Precision Striker', ja: '精密照準型' },
    tagline: {
      ko: '한번 잠그면 놓치지 않는 레이저 집중',
      en: 'Laser focus that locks on and never lets go',
      ja: '一度ロックしたら逃さないレーザー集中',
    },
    desc: {
      ko: '반응이 빠르면서도 정확합니다. 목표가 또렷할 때 주의를 한 점에 모아 오래 유지하고, 불필요한 자극에 잘 휘둘리지 않아요. 다만 그 강한 몰입이 주변과 휴식을 놓치게 만들 수 있다는 점은 기억하세요.',
      en: 'You react fast and accurately. When the target is clear, you gather attention to a single point and hold it, rarely swayed by noise. Just remember that intense focus can make you miss the people and the rest around you.',
      ja: '反応が速く、しかも正確です。目標が明確な時、注意を一点に集めて長く保ち、不要な刺激に振り回されにくい。ただ、その強い没入が周囲や休息を見落とさせることは忘れずに。',
    },
    slap: {
      ko: '집중력이 무기인 사람일수록, 무엇에 집중할지를 틀리면 가장 빨리 엉뚱한 곳에 도착합니다. 속도보다 방향을 먼저 점검하세요.',
      en: 'The sharper your focus, the faster you arrive at the wrong place if you aim it wrong. Check the direction before the speed.',
      ja: '集中力が武器な人ほど、何に集中するかを間違えると最速で見当違いの場所に着きます。速度より先に方向を点検しましょう。',
    },
    risks: [
      { ko: '한 가지에 과몰입해 주변·시간·휴식을 놓치기 쉬움', en: 'Hyperfocus on one thing makes you lose track of people, time, and rest', ja: '一つに過集中して周囲・時間・休息を見落としやすい' },
      { ko: '자극이 약한 단순반복 과제에선 금세 지루해 실수가 늘 수 있음', en: 'On dull, repetitive tasks you bore quickly and errors creep up', ja: '刺激の弱い単純反復課題ではすぐ退屈しミスが増える' },
    ],
    solutions: [
      { ko: '몰입 전에 "지금 이게 가장 중요한가" 한 번만 확인하세요', en: 'Before diving in, ask once: "is this the most important thing right now?"', ja: '没入の前に「今これが一番大事か」を一度だけ確認' },
      { ko: '50분 집중–10분 환기로 과열된 주의를 식혀 주세요', en: '50 min focus, 10 min break — cool the overheated attention', ja: '50分集中–10分換気で過熱した注意を冷ます' },
    ],
    strengths: [
      { ko: '목표에 주의를 모아 오래 유지하는 지속 집중력', en: 'Sustained focus that gathers attention on a goal and holds it', ja: '目標に注意を集めて長く保つ持続集中力' },
      { ko: '빠르면서 정확한 반응 — 처리속도와 정밀도의 균형', en: 'Fast yet accurate responses — balance of speed and precision', ja: '速くて正確な反応—処理速度と精度のバランス' },
    ],
  },

  bee: {
    emoji: '🐝',
    grad: ['#10B981', '#6EE7B7'],
    name: { ko: '벌', en: 'Bee', ja: 'ハチ' },
    title: { ko: '성실한 일꾼형', en: 'The Steady Worker', ja: '勤勉な働き者' },
    tagline: {
      ko: '꾸준히, 빠지지 않고 해내는 집중',
      en: 'Focus that shows up and gets it done, steadily',
      ja: 'こつこつ、抜けずにやり切る集中',
    },
    desc: {
      ko: '평균에서 평균 상단의 안정적인 집중·반응입니다. 폭발적이진 않아도 꾸준히 유지되고, 대부분의 일상 과제엔 충분해요. 컨디션이 떨어지면 살짝 느려지거나 깜빡할 수 있습니다.',
      en: 'Your focus and reaction sit from average to upper-average and stay stable. Not explosive, but steady — plenty for most daily tasks. When your condition dips, you may slow a touch or blank out.',
      ja: '平均から平均上位の安定した集中・反応です。爆発的ではないが着実に保たれ、日常の課題には十分。コンディションが落ちると少し遅くなったり、うっかりすることも。',
    },
    slap: {
      ko: '평범한 집중이라고 얕보지 마세요. 천재의 한 번보다, 당신의 꾸준한 백 번이 더 멀리 갑니다. 다만 "대충 익숙해서" 자동조종으로 흘릴 때 실수가 납니다.',
      en: 'Don\'t underrate ordinary focus. Your steady hundred reps go farther than a genius\'s single shot. The mistakes come when you coast on autopilot because it feels familiar.',
      ja: '平凡な集中だと侮らないで。天才の一回より、あなたの地道な百回の方が遠くまで行きます。ただ「慣れて適当に」オートパイロットで流す時にミスが出ます。',
    },
    risks: [
      { ko: '피곤하거나 지루할 때 반응이 느려지고 가끔 놓침', en: 'When tired or bored, reactions slow and you occasionally miss', ja: '疲れや退屈の時、反応が遅れ、時々取りこぼす' },
      { ko: '익숙한 일을 자동조종으로 처리하다 작은 실수가 남', en: 'Handling familiar work on autopilot lets small errors slip in', ja: '慣れた仕事をオートパイロットで処理し、小さなミスが残る' },
    ],
    solutions: [
      { ko: '중요한 구간엔 알람·체크리스트로 자동조종을 막으세요', en: 'On critical stretches, use alarms and checklists to break autopilot', ja: '重要な区間はアラーム・チェックリストでオートパイロットを防ぐ' },
      { ko: '충분한 수면이 곧 집중력 — 컨디션 관리가 실력이에요', en: 'Enough sleep is focus itself — managing your condition is skill', ja: '十分な睡眠こそ集中力—コンディション管理が実力' },
    ],
    strengths: [
      { ko: '기복이 적은 안정적인 집중 유지력', en: 'Stable focus with little fluctuation', ja: '起伏の少ない安定した集中維持力' },
      { ko: '무리 없이 오래 끌고 가는 지구력', en: 'Endurance that carries tasks far without burning out', ja: '無理なく長く引っ張る持久力' },
    ],
  },

  otter: {
    emoji: '🦦',
    grad: ['#34D399', '#5EEAD4'],
    name: { ko: '수달', en: 'Otter', ja: 'カワウソ' },
    title: { ko: '호기심 천국형', en: 'The Curious Wanderer', ja: '好奇心いっぱい型' },
    tagline: {
      ko: '온 세상이 다 재미있어 한 곳에 못 있는 뇌',
      en: 'A brain that finds everything too interesting to sit still',
      ja: '世界中が面白くて一か所にいられない脳',
    },
    desc: {
      ko: '한 자극에 주의를 오래 묶어두는 점수가 평균 아래로 측정됐어요. 머리가 나쁜 게 아니라, 호기심이 많고 자극에 민감한 뇌입니다. 환경만 정리하면 약점은 크게 줄어요.',
      en: 'Your score for tying attention to one stimulus measured below average. This is not about intelligence — it is a curious, stimulus-sensitive brain. Tidy the environment and the weakness shrinks a lot.',
      ja: '一つの刺激に注意を長く縛る点数が平均以下と測定されました。頭が悪いのではなく、好奇心が強く刺激に敏感な脳です。環境を整えるだけで弱点は大きく減ります。',
    },
    slap: {
      ko: '"산만하다"는 건 곧 "여러 곳에 안테나가 켜져 있다"는 뜻이기도 합니다. 문제는 주의력이 아니라, 방해물을 치우지 않고 의지로만 버티려는 습관이에요.',
      en: '"Distractible" also means "antennae switched on in many directions." The problem isn\'t your attention — it\'s the habit of grinding on willpower instead of removing the distractions.',
      ja: '「散漫」とは「あちこちにアンテナが立っている」という意味でもあります。問題は注意力ではなく、邪魔を片付けず意志だけで耐えようとする習慣です。',
    },
    risks: [
      { ko: '지루하거나 자극이 약하면 금세 딴 데로 새어 놓치고 실수함', en: 'When bored or under-stimulated, you drift off, miss, and err', ja: '退屈や刺激不足だとすぐ脇に逸れ、取りこぼしミスをする' },
      { ko: '충동적으로 먼저 반응했다가 되돌리는 일이 잦음', en: 'You often respond impulsively first, then have to walk it back', ja: '衝動的に先に反応してから取り消すことが多い' },
    ],
    solutions: [
      { ko: '방해물(알림·탭·소음)을 물리적으로 제거 — 의지보다 환경이에요', en: 'Physically remove distractions (alerts, tabs, noise) — environment over willpower', ja: '邪魔（通知・タブ・騒音）を物理的に除去—意志より環境' },
      { ko: '짧게 끊어 몰입(25분)하고 자주 쉬어 흥미를 리셋하세요', en: 'Focus in short blocks (25 min) and rest often to reset interest', ja: '短く区切って没入（25分）し、頻繁に休んで興味をリセット' },
    ],
    strengths: [
      { ko: '여러 곳을 동시에 살피는 넓은 주의 — 위기·변화 감지에 강함', en: 'Wide attention that scans many places at once — great at sensing change and danger', ja: '複数を同時に見渡す広い注意—危機・変化の察知に強い' },
      { ko: '호기심이 만든 빠른 전환과 아이디어', en: 'Fast switching and ideas, born of curiosity', ja: '好奇心が生む素早い切り替えとアイデア' },
    ],
  },

  /* ── 정밀 처리속도 검사 페르소나 ── */
  cheetah: {
    emoji: '🐆',
    grad: ['#8B5CF6', '#C4B5FD'],
    name: { ko: '치타', en: 'Cheetah', ja: 'チーター' },
    title: { ko: '초고속 처리형', en: 'The Lightning Processor', ja: '超高速処理型' },
    tagline: {
      ko: '눈으로 보는 즉시 손이 먼저 움직이는 뇌',
      en: 'A brain whose hands move before the eyes finish',
      ja: '見た瞬間に手が先に動く脳',
    },
    desc: {
      ko: '정보를 받아 처리해 반응하는 속도가 최상위권입니다. 단순·반복 과제를 빠르고 정확하게 쳐내고, 마감과 실전에서 강해요. 다만 너무 빨라서 깊이 들여다봐야 할 일도 후딱 넘길 위험이 있습니다.',
      en: 'Your speed from input to processing to response sits at the top. You blow through simple, repetitive tasks fast and accurately, and you shine under deadlines. Just beware: so fast that you may skim past things that needed a deeper look.',
      ja: '情報を受け取り処理して反応する速度が最上位圏です。単純・反復課題を速く正確に片付け、締切や実戦に強い。ただ速すぎて、深く見るべきこともさっと流す危険があります。',
    },
    slap: {
      ko: '빠른 게 늘 옳은 건 아닙니다. 속도가 무기인 사람은, 멈춰서 곱씹어야 할 순간조차 빠르게 지나쳐 같은 실수를 빠르게 반복합니다.',
      en: 'Fast isn\'t always right. When speed is your weapon, you blow past even the moments that needed a pause — and repeat the same mistake, fast.',
      ja: '速いことが常に正しいわけではありません。速度が武器の人は、立ち止まって考えるべき瞬間さえ速く通り過ぎ、同じミスを速く繰り返します。',
    },
    risks: [
      { ko: '너무 빨리 처리하려다 꼼꼼함이 필요한 일에서 실수', en: 'Rushing makes you slip on tasks that needed care', ja: '速く処理しようとして、丁寧さが要る仕事でミス' },
      { ko: '속도가 안 나는 깊은 사고 과제에선 답답해하며 대충 넘김', en: 'On slow, deep-thinking tasks you get impatient and cut corners', ja: '速度が出ない深い思考課題では、もどかしくて雑に流す' },
    ],
    solutions: [
      { ko: '중요한 결정엔 일부러 "한 박자 늦추기" 규칙을 두세요', en: 'For big decisions, set a deliberate "wait one beat" rule', ja: '重要な決定には、わざと「一拍置く」ルールを設ける' },
      { ko: '속도 자랑보다 정확도 더블체크 한 번이 신뢰를 만듭니다', en: 'One accuracy double-check beats showing off speed — it builds trust', ja: '速度自慢より、正確度の再確認一回が信頼を作る' },
    ],
    strengths: [
      { ko: '정보 입력→반응까지의 압도적인 처리속도', en: 'Overwhelming processing speed from input to response', ja: '情報入力→反応までの圧倒的な処理速度' },
      { ko: '반복·실시간 과제에서의 정확하고 빠른 손', en: 'Accurate, fast hands on repetitive, real-time tasks', ja: '反復・リアルタイム課題での正確で速い手' },
    ],
  },

  rabbit: {
    emoji: '🐇',
    grad: ['#A78BFA', '#DDD6FE'],
    name: { ko: '토끼', en: 'Rabbit', ja: 'ウサギ' },
    title: { ko: '경쾌한 속도형', en: 'The Nimble Mover', ja: '軽快なスピード型' },
    tagline: {
      ko: '필요할 땐 빠르게, 무리 없이 경쾌하게',
      en: 'Quick when needed, light without strain',
      ja: '必要な時は素早く、無理なく軽快に',
    },
    desc: {
      ko: '평균에서 평균 상단의 경쾌한 처리속도입니다. 대부분의 일상·업무 과제를 무리 없는 속도로 처리하고, 컨디션이 좋으면 더 빨라져요. 피곤하면 속도가 떨어질 수 있습니다.',
      en: 'Your processing speed runs from average to upper-average and stays nimble. You handle most daily and work tasks at a comfortable pace, and you speed up when your condition is good. Fatigue can slow you down.',
      ja: '平均から平均上位の軽快な処理速度です。日常・仕事の課題を無理のない速度で処理し、コンディションが良いとさらに速くなる。疲れると速度が落ちることも。',
    },
    slap: {
      ko: '"적당히 빠른" 게 가장 오래갑니다. 다만 늘 적당히에 머물면, 진짜 속도가 필요한 순간 한 끗이 부족할 수 있어요. 가끔은 한계 속도도 시험해 보세요.',
      en: '"Comfortably quick" lasts the longest. But staying always at comfortable can leave you a hair short when real speed is needed. Test your top speed now and then.',
      ja: '「ほどよく速い」が一番長続きします。ただ常にほどほどに留まると、本当に速さが要る瞬間に一歩足りないことも。たまには限界速度も試して。',
    },
    risks: [
      { ko: '피곤하거나 지루하면 처리속도가 눈에 띄게 떨어짐', en: 'When tired or bored, your speed drops noticeably', ja: '疲れや退屈で処理速度が目に見えて落ちる' },
      { ko: '익숙함에 안주해 더 빠른 방법을 안 찾기도 함', en: 'Settling into the familiar, you skip finding faster ways', ja: '慣れに安住し、より速い方法を探さないことも' },
    ],
    solutions: [
      { ko: '타이머로 "내 최고기록 깨기" 게임 — 속도 상한을 끌어올리세요', en: 'Play "beat my record" with a timer — raise your speed ceiling', ja: 'タイマーで「自己ベスト更新」ゲーム—速度の上限を引き上げる' },
      { ko: '반복 작업은 단축키·템플릿으로 손을 줄이세요', en: 'Cut keystrokes on repetitive work with shortcuts and templates', ja: '反復作業はショートカット・テンプレで手数を減らす' },
    ],
    strengths: [
      { ko: '무리 없이 꾸준한 경쾌한 속도', en: 'Nimble, steady speed without strain', ja: '無理なく着実な軽快さ' },
      { ko: '상황에 맞춰 속도를 조절하는 균형감', en: 'Balanced sense for adjusting speed to the situation', ja: '状況に合わせて速度を調整するバランス感' },
    ],
  },

  tortoise: {
    emoji: '🐢',
    grad: ['#C4B5FD', '#EDE9FE'],
    name: { ko: '거북', en: 'Tortoise', ja: 'カメ' },
    title: { ko: '신중한 마이페이스형', en: 'The Careful Pacer', ja: '慎重マイペース型' },
    tagline: {
      ko: '빠르진 않아도 끝내 정확히 도착하는 뇌',
      en: 'Not fast, but arrives accurate in the end',
      ja: '速くはないが最後は正確に着く脳',
    },
    desc: {
      ko: '빠르게 쳐내는 처리속도 점수는 평균 아래로 측정됐어요. 머리가 느린 게 아니라, 하나하나 확인하며 가는 신중한 스타일입니다. 속도보다 정확도가 중요한 일에서 강점이 됩니다.',
      en: 'Your raw processing-speed score measured below average. This isn\'t slow thinking — it\'s a careful style that checks each step. It becomes a strength where accuracy matters more than speed.',
      ja: '速く片付ける処理速度の点数は平均以下と測定されました。頭が遅いのではなく、一つ一つ確認して進む慎重なスタイルです。速度より正確さが大事な仕事で強みになります。',
    },
    slap: {
      ko: '느린 게 문제가 아니라, 느린 걸 부끄러워하다 서두르며 실수하는 게 문제입니다. 당신의 무기는 속도가 아니라 정확도예요. 잘하는 걸로 승부하세요.',
      en: 'Being slow isn\'t the problem — rushing out of shame and making errors is. Your weapon is accuracy, not speed. Compete on what you\'re good at.',
      ja: '遅いことが問題ではなく、遅さを恥じて焦りミスするのが問題です。あなたの武器は速度ではなく正確さ。得意で勝負しましょう。',
    },
    risks: [
      { ko: '시간 압박·실시간 과제에서 밀리거나 스트레스를 크게 받음', en: 'You fall behind or stress hard under time pressure and real-time tasks', ja: '時間的プレッシャー・リアルタイム課題で遅れたり強くストレスを受ける' },
      { ko: '빨라야 한다는 압박에 서두르다 오히려 실수함', en: 'Pressure to be fast makes you rush and err instead', ja: '速くという圧力で焦り、かえってミスする' },
    ],
    solutions: [
      { ko: '속도가 필요한 일은 미리 충분한 시간을 확보해 압박을 없애세요', en: 'For speed-critical work, secure ample time in advance to remove the pressure', ja: '速さが要る仕事は前もって十分な時間を確保し、圧力をなくす' },
      { ko: '단순반복은 도구·자동화로 손을 덜고 본인은 검토에 집중하세요', en: 'Offload repetitive work to tools/automation and focus your effort on review', ja: '単純反復は道具・自動化に任せ、自分は確認に集中' },
    ],
    strengths: [
      { ko: '서두르지 않아 만드는 높은 정확도와 꼼꼼함', en: 'High accuracy and thoroughness born of not rushing', ja: '焦らないことで生む高い正確さと丁寧さ' },
      { ko: '끝까지 확인하는 신중함 — 큰 실수를 막음', en: 'Careful checking to the end — it prevents big mistakes', ja: '最後まで確認する慎重さ—大きなミスを防ぐ' },
    ],
  },
}

/** 페르소나 → 검사 매핑 (커뮤니티 주제 필터용) */
export const PERSONA_TEST: Record<string, TestId> = {
  meerkat: 'adhd', collie: 'adhd',
  sheep: 'ego', deer: 'ego', tiger: 'ego', wolf: 'ego',
  owl: 'iq', tit: 'iq',
  penguin: 'love', koala: 'love', cat: 'love', hedgehog: 'love',
  dolphin: 'burnout', camel: 'burnout', sloth: 'burnout',
  bear: 'dopamine', hamster: 'dopamine', raccoon: 'dopamine',
  bamboo: 'resilience', willow: 'resilience', glass: 'resilience',
  fox: 'dark', peacock: 'dark', shark: 'dark', dove: 'dark',
  elephant: 'memory', octopus: 'memory', goldfish: 'memory',
  hawk: 'focus', bee: 'focus', otter: 'focus',
  cheetah: 'speed', rabbit: 'speed', tortoise: 'speed',
}

/** 이모지(글 뱃지) → 검사 매핑 */
export const EMOJI_TEST: Record<string, TestId> = Object.fromEntries(
  Object.entries(PERSONA_TEST).map(([key, tid]) => [PERSONAS[key].emoji, tid]),
) as Record<string, TestId>
