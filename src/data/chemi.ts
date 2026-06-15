import type { L } from './types'

/** 친구 궁합 — 애착(LOVE) 4종 동물 pairwise 케미 매트릭스 (LOVE_CHEMI 확장) */

/** 애착 동물 4종 (페르소나 key ↔ 애착 밴드) */
export const LOVE_ANIMALS: { key: string; band: string }[] = [
  { key: 'penguin', band: 'secure' }, // 안정형
  { key: 'koala', band: 'anxious' }, // 불안형
  { key: 'cat', band: 'avoidant' }, // 회피형
  { key: 'hedgehog', band: 'fearful' }, // 혼란형
]

export interface Chemi {
  score: number // 0~100
  title: L
  desc: L
}

const pk = (a: string, b: string) => [a, b].sort().join('-')

const TABLE: Record<string, Chemi> = {
  [pk('penguin', 'penguin')]: {
    score: 85,
    title: { ko: '안정 콤비', en: 'Steady Duo', ja: '安定コンビ' },
    desc: {
      ko: '둘 다 안정형. 편하고 든든하지만 가끔은 너무 잔잔해 심심할 수도. 새로운 자극을 함께 찾아보세요.',
      en: 'Both secure. Calm and reliable — just add some spark so it never gets too quiet.',
      ja: '二人とも安定型。穏やかで頼れるが、たまに静かすぎるかも。新しい刺激を一緒に。',
    },
  },
  [pk('penguin', 'koala')]: {
    score: 90,
    title: { ko: '치유 케미', en: 'Healing Match', ja: '癒やしケミ' },
    desc: {
      ko: '안정형이 불안형의 불안을 다독여 주는 환상의 조합. 코알라가 매달려도 펭귄은 흔들리지 않아요.',
      en: 'Secure soothes anxious — a dreamy fit. The koala clings, the penguin stays steady.',
      ja: '安定型が不安型を包む理想の組合せ。コアラがしがみついてもペンギンは揺れない。',
    },
  },
  [pk('penguin', 'cat')]: {
    score: 88,
    title: { ko: '해빙 케미', en: 'Thaw Match', ja: '雪解けケミ' },
    desc: {
      ko: '안정형의 일관된 온기가 회피형의 빙벽을 천천히 녹입니다. 고양이가 마음 열 시간을 주세요.',
      en: "Secure warmth slowly thaws the avoidant's ice wall. Give the cat time to open up.",
      ja: '安定型の温かさが回避型の氷壁を溶かす。猫が心を開く時間を。',
    },
  },
  [pk('penguin', 'hedgehog')]: {
    score: 92,
    title: { ko: '구원 케미', en: 'Rescue Match', ja: '救済ケミ' },
    desc: {
      ko: '다가오고 싶지만 두려운 혼란형에게, 안정형은 가장 안전한 항구. 가시를 세워도 곁을 지켜요.',
      en: 'For the fearful who want closeness but flinch, secure is the safest harbor.',
      ja: '近づきたいけど怖い混乱型に、安定型は最も安全な港。',
    },
  },
  [pk('koala', 'koala')]: {
    score: 55,
    title: { ko: '과열 케미', en: 'Overheat', ja: '過熱ケミ' },
    desc: {
      ko: '둘 다 불안형이라 서로에게 끝없이 확인받고 싶어해요. 사랑은 뜨겁지만 쉽게 타버릴 수 있어요.',
      en: 'Two anxious hearts crave endless reassurance. Hot love — but it can burn out.',
      ja: '二人とも不安型で確認を求め合う。熱いけど燃え尽きやすい。',
    },
  },
  [pk('koala', 'cat')]: {
    score: 32,
    title: { ko: '불안-회피 트랩', en: 'Push-Pull Trap', ja: '不安-回避トラップ' },
    desc: {
      ko: '쫓는 코알라, 도망가는 고양이. 연애 심리의 가장 유명한 환장 케미예요. 거리 조절이 생명.',
      en: 'Koala chases, cat flees — the famous anxious-avoidant trap. Pacing is everything.',
      ja: '追うコアラ、逃げる猫。最も有名なすれ違いケミ。距離感が命。',
    },
  },
  [pk('koala', 'hedgehog')]: {
    score: 48,
    title: { ko: '롤러코스터', en: 'Rollercoaster', ja: 'ジェットコースター' },
    desc: {
      ko: '둘 다 감정 기복이 커서 하루에도 천국과 지옥을 오가요. 솔직한 대화만이 안전벨트입니다.',
      en: 'Both ride big emotional waves — heaven and hell in a day. Honest talk is the seatbelt.',
      ja: '二人とも感情の起伏が大きい。正直な対話だけがシートベルト。',
    },
  },
  [pk('cat', 'cat')]: {
    score: 60,
    title: { ko: '쿨내 콤비', en: 'Cool Duo', ja: 'クールコンビ' },
    desc: {
      ko: '서로의 거리를 존중하는 편한 관계. 다만 너무 안 다가가서 깊어지질 않을 수 있어요.',
      en: 'Mutual space, very comfortable — but it may never deepen if neither leans in.',
      ja: '互いの距離を尊重。ただ近づかなすぎて深まらないかも。',
    },
  },
  [pk('cat', 'hedgehog')]: {
    score: 42,
    title: { ko: '밀당 미로', en: 'Maze of Mixed Signals', ja: '駆け引きの迷路' },
    desc: {
      ko: '둘 다 가까워지면 도망치고 싶어져요. 신호가 엇갈리는 미로 같은 관계. 인내가 필요해요.',
      en: 'Both bolt when it gets close. A maze of mixed signals — patience required.',
      ja: '二人とも近づくと逃げたくなる。信号が交錯する迷路。忍耐が必要。',
    },
  },
  [pk('hedgehog', 'hedgehog')]: {
    score: 50,
    title: { ko: '가시 콤비', en: 'Quill Duo', ja: 'トゲコンビ' },
    desc: {
      ko: '다가가고 싶지만 둘 다 찔릴까 봐 멈칫. 서로의 가시를 이해하면 누구보다 깊어질 수 있어요.',
      en: 'Both want closeness but fear the prick. Understand each other’s quills and it goes deep.',
      ja: '近づきたいけど刺さるのが怖い。互いのトゲを理解すれば誰より深くなれる。',
    },
  },
}

export function getChemi(a: string, b: string): Chemi | null {
  return TABLE[pk(a, b)] ?? null
}
