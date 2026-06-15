import type { L } from './types'

/**
 * 데일리 심리 상식 퀴즈 (토스 행운퀴즈 벤치마크)
 * - 하루 1문항, 날짜 기반 로테이션, 정답 시 +5P (일일 무료 적립 한도 내)
 * - 추후 브랜드 퀴즈(광고 상품)로 교체 가능한 구조
 */
export interface QuizItem {
  q: L
  options: L[]
  answer: number
  fact: L
}

export const QUIZ_BANK: QuizItem[] = [
  {
    q: { ko: 'ASRS v1.1은 무엇을 선별하는 표준 도구일까요?', en: 'What does ASRS v1.1 screen for?', ja: 'ASRS v1.1は何をスクリーニングする標準ツール？' },
    options: [
      { ko: '성인 ADHD', en: 'Adult ADHD', ja: '成人ADHD' },
      { ko: '우울증', en: 'Depression', ja: 'うつ病' },
      { ko: '수면 장애', en: 'Sleep disorders', ja: '睡眠障害' },
    ],
    answer: 0,
    fact: { ko: 'WHO와 하버드 의대가 공동 개발한 성인 ADHD 자가보고 척도예요.', en: 'Co-developed by WHO and Harvard Medical School.', ja: 'WHOとハーバード医科大学が共同開発しました。' },
  },
  {
    q: { ko: '도파민과 가장 관련 깊은 것은?', en: 'Dopamine is most associated with…', ja: 'ドーパミンと最も関係が深いのは？' },
    options: [
      { ko: '보상과 동기', en: 'Reward & motivation', ja: '報酬と動機' },
      { ko: '체온 조절', en: 'Body temperature', ja: '体温調節' },
      { ko: '뼈 성장', en: 'Bone growth', ja: '骨の成長' },
    ],
    answer: 0,
    fact: { ko: '도파민은 "보상 예측"의 신경전달물질로, 동기와 집중의 엔진이에요.', en: 'It signals reward prediction — the engine of motivation.', ja: '報酬予測の神経伝達物質で、やる気のエンジンです。' },
  },
  {
    q: { ko: '성공을 제 실력으로 믿지 못하는 심리는?', en: 'Doubting your success is deserved is called…', ja: '成功を実力と信じられない心理は？' },
    options: [
      { ko: '가면 증후군', en: 'Impostor syndrome', ja: 'インポスター症候群' },
      { ko: '번아웃', en: 'Burnout', ja: 'バーンアウト' },
      { ko: '스톡홀름 증후군', en: 'Stockholm syndrome', ja: 'ストックホルム症候群' },
    ],
    answer: 0,
    fact: { ko: '고성취자의 최대 70%가 한 번쯤 경험한다고 보고돼요.', en: 'Up to 70% of high achievers report it at least once.', ja: '高達成者の最大70%が一度は経験すると報告されています。' },
  },
  {
    q: { ko: 'IQ 척도의 평균값은?', en: 'The mean of the IQ scale is…', ja: 'IQ尺度の平均値は？' },
    options: [
      { ko: '100', en: '100', ja: '100' },
      { ko: '120', en: '120', ja: '120' },
      { ko: '85', en: '85', ja: '85' },
    ],
    answer: 0,
    fact: { ko: '평균 100, 표준편차 15 — 115면 상위 약 16%예요.', en: 'Mean 100, SD 15 — 115 is roughly top 16%.', ja: '平均100、標準偏差15。115なら上位約16%です。' },
  },
  {
    q: { ko: '유동 지능(Fluid IQ)의 대표 능력은?', en: 'Fluid intelligence is best shown by…', ja: '流動性知能を代表する能力は？' },
    options: [
      { ko: '처음 보는 규칙 추론', en: 'Reasoning with novel rules', ja: '初見の規則の推論' },
      { ko: '역사 연도 암기', en: 'Memorizing dates', ja: '歴史年号の暗記' },
      { ko: '어휘량', en: 'Vocabulary size', ja: '語彙量' },
    ],
    answer: 0,
    fact: { ko: '지식이 아니라 "낯선 문제를 푸는 연산력"이 유동 지능이에요.', en: 'It\'s raw reasoning power, not stored knowledge.', ja: '知識ではなく「未知の問題を解く演算力」です。' },
  },
  {
    q: { ko: '파블로프의 조건반사 실험에 쓰인 동물은?', en: 'Pavlov\'s conditioning used which animal?', ja: 'パブロフの条件反射実験の動物は？' },
    options: [
      { ko: '개', en: 'Dogs', ja: '犬' },
      { ko: '고양이', en: 'Cats', ja: '猫' },
      { ko: '비둘기', en: 'Pigeons', ja: 'ハト' },
    ],
    answer: 0,
    fact: { ko: '종소리만으로 침을 흘리게 한 고전적 조건형성의 시초예요.', en: 'The origin of classical conditioning — drooling at a bell.', ja: 'ベルの音だけで唾液を出させた古典的条件づけの始まりです。' },
  },
  {
    q: { ko: '"플라시보 효과"란?', en: 'The placebo effect is…', ja: '「プラシーボ効果」とは？' },
    options: [
      { ko: '가짜 약으로도 증상이 좋아지는 것', en: 'Improvement from a fake treatment', ja: '偽薬でも症状が良くなること' },
      { ko: '약효가 두 배가 되는 것', en: 'A drug doubling its effect', ja: '薬効が2倍になること' },
      { ko: '부작용만 나타나는 것', en: 'Only side effects appearing', ja: '副作用だけが出ること' },
    ],
    answer: 0,
    fact: { ko: '믿음만으로 뇌가 실제 생리 반응을 만들어내는 현상이에요.', en: 'Belief alone can trigger real physiological change.', ja: '信じるだけで脳が実際の生理反応を作り出します。' },
  },
  {
    q: { ko: '단기기억의 "매직 넘버"는?', en: 'The "magic number" of short-term memory?', ja: '短期記憶の「マジックナンバー」は？' },
    options: [
      { ko: '7 ± 2', en: '7 ± 2', ja: '7 ± 2' },
      { ko: '3 ± 1', en: '3 ± 1', ja: '3 ± 1' },
      { ko: '12 ± 4', en: '12 ± 4', ja: '12 ± 4' },
    ],
    answer: 0,
    fact: { ko: '밀러(1956)의 고전 연구 — 한 번에 담는 청크는 5~9개예요.', en: 'Miller (1956): we hold 5–9 chunks at once.', ja: 'ミラー(1956)の古典研究。一度に5~9チャンクです。' },
  },
  {
    q: { ko: '마시멜로 실험이 측정한 것은?', en: 'The marshmallow test measured…', ja: 'マシュマロ実験が測ったものは？' },
    options: [
      { ko: '만족 지연 능력', en: 'Delayed gratification', ja: '満足遅延能力' },
      { ko: '미각 발달', en: 'Taste development', ja: '味覚の発達' },
      { ko: '단어 암기력', en: 'Word memory', ja: '単語暗記力' },
    ],
    answer: 0,
    fact: { ko: '눈앞의 1개를 참으면 2개 — 자기조절의 상징적 실험이에요.', en: 'Resist one now, get two later — the icon of self-control.', ja: '目の前の1個を我慢すれば2個。自己制御の象徴的実験です。' },
  },
  {
    q: { ko: '기억 형성에 핵심인 뇌 부위는?', en: 'The brain region key to forming memories?', ja: '記憶形成に重要な脳部位は？' },
    options: [
      { ko: '해마', en: 'Hippocampus', ja: '海馬' },
      { ko: '소뇌', en: 'Cerebellum', ja: '小脳' },
      { ko: '뇌하수체', en: 'Pituitary gland', ja: '下垂体' },
    ],
    answer: 0,
    fact: { ko: '해마가 손상되면 새 기억을 장기 저장으로 옮기지 못해요.', en: 'Damage here blocks new long-term memories.', ja: '海馬が損傷すると新しい記憶を長期保存できません。' },
  },
  {
    q: { ko: '같은 크기의 손실은 이득보다 약 몇 배 크게 느껴질까요?', en: 'Losses feel about how many times bigger than gains?', ja: '同じ大きさの損失は利益の約何倍に感じる？' },
    options: [
      { ko: '약 2배', en: 'About 2×', ja: '約2倍' },
      { ko: '약 10배', en: 'About 10×', ja: '約10倍' },
      { ko: '똑같다', en: 'The same', ja: '同じ' },
    ],
    answer: 0,
    fact: { ko: '카너먼·트버스키의 손실 회피 — 스트릭이 무서운 이유죠 🔥', en: 'Kahneman & Tversky\'s loss aversion — why streaks work 🔥', ja: 'カーネマンらの損失回避。ストリークが怖い理由です🔥' },
  },
  {
    q: { ko: '거울 뉴런과 가장 관련 깊은 것은?', en: 'Mirror neurons relate most to…', ja: 'ミラーニューロンと最も関係深いのは？' },
    options: [
      { ko: '공감과 모방', en: 'Empathy & imitation', ja: '共感と模倣' },
      { ko: '시력 보정', en: 'Vision correction', ja: '視力補正' },
      { ko: '혈압 조절', en: 'Blood pressure', ja: '血圧調節' },
    ],
    answer: 0,
    fact: { ko: '남의 행동을 볼 때 내 뇌도 같은 회로가 켜져요.', en: 'Watching others fires the same circuits in your brain.', ja: '他人の行動を見ると自分の脳も同じ回路が点灯します。' },
  },
  {
    q: { ko: '번아웃의 3대 요소가 아닌 것은?', en: 'Which is NOT part of burnout\'s triad?', ja: 'バーンアウトの3要素でないものは？' },
    options: [
      { ko: '과몰입', en: 'Hyperfocus', ja: '過集中' },
      { ko: '정서적 소진', en: 'Emotional exhaustion', ja: '情緒的消耗' },
      { ko: '냉소주의', en: 'Cynicism', ja: 'シニシズム' },
    ],
    answer: 0,
    fact: { ko: '소진·냉소·효능감 저하가 3요소예요. 과몰입은 ADHD 쪽 개념!', en: 'The triad: exhaustion, cynicism, reduced efficacy.', ja: '消耗・冷笑・効力感低下が3要素。過集中はADHD側の概念！' },
  },
  {
    q: { ko: '"깨진 유리창 이론"의 핵심은?', en: 'The broken windows theory says…', ja: '「割れ窓理論」の核心は？' },
    options: [
      { ko: '작은 무질서 방치가 큰 문제를 부른다', en: 'Small neglect invites bigger disorder', ja: '小さな無秩序の放置が大問題を呼ぶ' },
      { ko: '유리는 두 번 깨진다', en: 'Glass breaks twice', ja: 'ガラスは二度割れる' },
      { ko: '창문이 많을수록 행복하다', en: 'More windows, more happiness', ja: '窓が多いほど幸せ' },
    ],
    answer: 0,
    fact: { ko: '책상 위 작은 어질러짐부터 잡으면 미루기도 줄어요.', en: 'Fixing tiny messes first reduces procrastination too.', ja: '机の小さな散らかりから整えると先延ばしも減ります。' },
  },
]

/** 날짜 기반 오늘의 퀴즈 인덱스 */
export function todayQuizIndex(d = new Date()): number {
  const days = Math.floor(d.getTime() / 86400000)
  return days % QUIZ_BANK.length
}
