import type { Fig, IqItem, IqKind, L, Prim } from './types'

/**
 * 유동 지능 검사 — 20문항, 난이도 가중(1 / 1.5 / 2)
 *
 * 학술 기반: ICAR (International Cognitive Ability Resource, Condon & Revelle 2014,
 * Intelligence 43) 공개 표준의 4개 영역 구성을 따름:
 *  - 행렬 추론(Matrix Reasoning, Raven 1938 전통) 8문항
 *  - 수열/문자열 규칙(Letter-Number Series) 7문항
 *  - 언어 논리(Verbal Reasoning, 무의미 단어 삼단논법 — 결정성 지식 배제) 2문항
 *  - 공간 회전/종이접기(3D Rotation 변형) 3문항
 * 결정성 지능(상식·어휘)이 점수에 개입하지 않도록 모든 문항은 규칙 발견형으로 설계.
 * 문항·보기 순서는 세션마다 셔플(런타임), 정답률은 라플라스 평활화로 보정.
 */

/* ── 도형 DSL 헬퍼 ───────────────────────────────────────────── */
const C = (x: number, y: number, r: number, f = false): Prim => ({ k: 'c', x, y, r, f })
const R = (x: number, y: number, w: number, h: number, f = false): Prim => ({ k: 'r', x, y, w, h, f })
const T = (x: number, y: number, s: number, f = false, rot = 0): Prim => ({ k: 't', x, y, s, f, rot })
const Ln = (x1: number, y1: number, x2: number, y2: number, dash = false): Prim => ({ k: 'l', x1, y1, x2, y2, dash })
const D = (x: number, y: number): Prim => ({ k: 'd', x, y })

/** 시계바늘형 도형 (M2) — angle: 12시 기준 시계방향 각도 */
const hand = (angle: number): Fig => {
  const rad = (angle * Math.PI) / 180
  const tx = Math.round(36 + 22 * Math.sin(rad))
  const ty = Math.round(36 - 22 * Math.cos(rad))
  return [Ln(36, 36, tx, ty), D(tx, ty)]
}

/** 중심 스포크 (M8) — U/R/D/L */
const SPOKE: Record<string, Prim> = {
  U: Ln(36, 36, 36, 16),
  R: Ln(36, 36, 56, 36),
  D: Ln(36, 36, 36, 56),
  L: Ln(36, 36, 16, 36),
}
const spokes = (s: string): Fig => s.split('').map((c) => SPOKE[c])

/** 모서리 점 (M6) */
const DOT: Record<string, Prim> = {
  TL: D(24, 24),
  TR: D(48, 24),
  BL: D(24, 48),
  BR: D(48, 48),
}
const dots = (keys: string[]): Fig => keys.map((k) => DOT[k])

/** 구멍 뚫린 정사각형 종이 (fold 보기) */
const paper = (holes: [number, number][]): Fig => [
  R(10, 10, 52, 52),
  ...holes.map(([x, y]) => C(x, y, 4, true)),
]

export const IQ_PROMPTS: Record<IqKind, L> = {
  matrix: {
    ko: '규칙을 발견하고, 물음표에 들어갈 도형을 고르세요',
    en: 'Discover the rule and choose the figure that completes the grid',
    ja: '規則を発見し、？に入る図形を選んでください',
  },
  series: {
    ko: '수열의 숨은 규칙을 찾아, 다음에 올 수를 고르세요',
    en: 'Find the hidden rule of the series and pick the next number',
    ja: '数列の隠れた規則を見つけ、次に来る数を選んでください',
  },
  letter: {
    ko: '문자열의 규칙을 찾아, 물음표에 들어갈 것을 고르세요',
    en: 'Find the rule of the letter sequence and fill the blank',
    ja: '文字列の規則を見つけ、？に入るものを選んでください',
  },
  verbal: {
    ko: '주어진 조건만으로 반드시 참인 결론을 고르세요',
    en: 'Using only the given premises, choose the necessarily true conclusion',
    ja: '与えられた条件だけで必ず真になる結論を選んでください',
  },
  fold: {
    ko: '종이를 접고 구멍을 뚫었어요. 다시 펼치면 어떤 모양일까요?',
    en: 'The paper was folded and punched. How does it look unfolded?',
    ja: '紙を折って穴を開けました。広げるとどんな形になる？',
  },
}

export const IQ_ITEMS: IqItem[] = [
  /* ── 행렬 추론 ── */
  {
    id: 'm1',
    kind: 'matrix',
    difficulty: 1,
    cells: [
      [C(36, 36, 7)],
      [C(26, 36, 7), C(46, 36, 7)],
      [C(16, 36, 7), C(36, 36, 7), C(56, 36, 7)],
      [R(29, 29, 14, 14)],
      [R(19, 29, 14, 14), R(39, 29, 14, 14)],
      [R(9, 29, 14, 14), R(29, 29, 14, 14), R(49, 29, 14, 14)],
      [T(36, 38, 16)],
      [T(26, 38, 16), T(46, 38, 16)],
    ],
    options: [
      { id: 'a', fig: [T(16, 38, 16), T(36, 38, 16), T(56, 38, 16)] },
      { id: 'b', fig: [T(26, 38, 16), T(46, 38, 16)] },
      { id: 'c', fig: [R(9, 29, 14, 14), R(29, 29, 14, 14), R(49, 29, 14, 14)] },
      { id: 'd', fig: [C(16, 36, 7), C(36, 36, 7), C(56, 36, 7)] },
    ],
    answer: 'a',
  },
  {
    id: 'm2',
    kind: 'matrix',
    difficulty: 1,
    cells: [hand(0), hand(45), hand(90), hand(90), hand(135), hand(180), hand(180), hand(225)],
    options: [
      { id: 'a', fig: hand(270) },
      { id: 'b', fig: hand(315) },
      { id: 'c', fig: hand(90) },
      { id: 'd', fig: hand(180) },
    ],
    answer: 'a',
  },
  {
    id: 'm3',
    kind: 'matrix',
    difficulty: 1,
    cells: [
      [C(36, 36, 6)],
      [C(36, 36, 10)],
      [C(36, 36, 14)],
      [R(30, 30, 12, 12)],
      [R(26, 26, 20, 20)],
      [R(22, 22, 28, 28)],
      [T(36, 38, 12)],
      [T(36, 38, 20)],
    ],
    options: [
      { id: 'a', fig: [T(36, 38, 28)] },
      { id: 'b', fig: [T(36, 38, 20)] },
      { id: 'c', fig: [T(36, 38, 12)] },
      { id: 'd', fig: [C(36, 36, 14)] },
    ],
    answer: 'a',
  },
  {
    id: 'm4',
    kind: 'matrix',
    difficulty: 1.5,
    cells: [
      [C(36, 36, 11, true)],
      [R(26, 26, 20, 20)],
      [T(36, 38, 24)],
      [R(26, 26, 20, 20)],
      [T(36, 38, 24, true)],
      [C(36, 36, 11)],
      [T(36, 38, 24)],
      [C(36, 36, 11)],
    ],
    options: [
      { id: 'a', fig: [R(26, 26, 20, 20, true)] },
      { id: 'b', fig: [R(26, 26, 20, 20)] },
      { id: 'c', fig: [C(36, 36, 11, true)] },
      { id: 'd', fig: [T(36, 38, 24, true)] },
    ],
    answer: 'a',
  },
  {
    id: 'm5',
    kind: 'matrix',
    difficulty: 1.5,
    cells: [
      [Ln(16, 36, 56, 36)],
      [Ln(36, 16, 36, 56)],
      [Ln(16, 36, 56, 36), Ln(36, 16, 36, 56)],
      [Ln(16, 36, 56, 36), Ln(36, 16, 36, 56)],
      [Ln(36, 16, 36, 56)],
      [Ln(16, 36, 56, 36)],
      [Ln(36, 16, 36, 56)],
      [Ln(16, 36, 56, 36), Ln(36, 16, 36, 56)],
    ],
    options: [
      { id: 'a', fig: [Ln(16, 36, 56, 36)] },
      { id: 'b', fig: [Ln(36, 16, 36, 56)] },
      { id: 'c', fig: [Ln(16, 36, 56, 36), Ln(36, 16, 36, 56)] },
      { id: 'd', fig: [Ln(20, 20, 52, 52)] },
    ],
    answer: 'a',
  },
  {
    id: 'm6',
    kind: 'matrix',
    difficulty: 1.5,
    cells: [
      dots(['TL']),
      dots(['TR']),
      dots(['TL', 'TR']),
      dots(['BL']),
      dots(['TL', 'TR']),
      dots(['TL', 'TR', 'BL']),
      dots(['TR', 'BR']),
      dots(['TL']),
    ],
    options: [
      { id: 'a', fig: dots(['TL', 'TR', 'BR']) },
      { id: 'b', fig: dots(['TL', 'TR', 'BL']) },
      { id: 'c', fig: dots(['TR', 'BR']) },
      { id: 'd', fig: dots(['TL', 'TR', 'BL', 'BR']) },
    ],
    answer: 'a',
  },
  {
    id: 'm7',
    kind: 'matrix',
    difficulty: 2,
    cells: [
      [C(36, 36, 6)],
      [R(26, 26, 20, 20)],
      [T(36, 38, 28)],
      [T(36, 38, 20)],
      [C(36, 36, 14)],
      [R(30, 30, 12, 12)],
      [R(22, 22, 28, 28)],
      [T(36, 38, 12)],
    ],
    options: [
      { id: 'a', fig: [C(36, 36, 10)] },
      { id: 'b', fig: [C(36, 36, 14)] },
      { id: 'c', fig: [T(36, 38, 20)] },
      { id: 'd', fig: [R(26, 26, 20, 20)] },
    ],
    answer: 'a',
  },
  {
    id: 'm8',
    kind: 'matrix',
    difficulty: 2,
    cells: [
      spokes('UR'),
      spokes('RD'),
      spokes('UD'),
      spokes('L'),
      spokes('UL'),
      spokes('U'),
      spokes('URL'),
      spokes('RLD'),
    ],
    options: [
      { id: 'a', fig: spokes('UD') },
      { id: 'b', fig: spokes('URLD') },
      { id: 'c', fig: spokes('RL') },
      { id: 'd', fig: spokes('DL') },
    ],
    answer: 'a',
  },

  /* ── 수열 ── */
  {
    id: 'n1', kind: 'series', difficulty: 1, series: '3 · 7 · 11 · 15 · ?',
    options: [{ id: 'a', text: '19' }, { id: 'b', text: '18' }, { id: 'c', text: '21' }, { id: 'd', text: '23' }],
    answer: 'a',
  },
  {
    id: 'n2', kind: 'series', difficulty: 1, series: '2 · 6 · 18 · 54 · ?',
    options: [{ id: 'a', text: '162' }, { id: 'b', text: '108' }, { id: 'c', text: '148' }, { id: 'd', text: '216' }],
    answer: 'a',
  },
  {
    id: 'n3', kind: 'series', difficulty: 1.5, series: '1 · 1 · 2 · 3 · 5 · 8 · ?',
    options: [{ id: 'a', text: '13' }, { id: 'b', text: '11' }, { id: 'c', text: '12' }, { id: 'd', text: '16' }],
    answer: 'a',
  },
  {
    id: 'n4', kind: 'series', difficulty: 1.5, series: '2 · 3 · 5 · 8 · 12 · 17 · ?',
    options: [{ id: 'a', text: '23' }, { id: 'b', text: '21' }, { id: 'c', text: '22' }, { id: 'd', text: '25' }],
    answer: 'a',
  },
  {
    id: 'n5', kind: 'series', difficulty: 2, series: '5 · 10 · 8 · 16 · 14 · 28 · ?',
    options: [{ id: 'a', text: '26' }, { id: 'b', text: '24' }, { id: 'c', text: '30' }, { id: 'd', text: '56' }],
    answer: 'a',
  },

  /* ── 문자열 ── */
  {
    id: 'l1', kind: 'letter', difficulty: 1.5, series: 'B · C · E · H · L · ?',
    options: [{ id: 'a', text: 'Q' }, { id: 'b', text: 'O' }, { id: 'c', text: 'P' }, { id: 'd', text: 'R' }],
    answer: 'a',
  },
  {
    id: 'l2', kind: 'letter', difficulty: 1.5, series: 'AZ · CX · EV · ?',
    options: [{ id: 'a', text: 'GT' }, { id: 'b', text: 'FS' }, { id: 'c', text: 'GS' }, { id: 'd', text: 'HU' }],
    answer: 'a',
  },

  /* ── 언어 논리 (무의미 단어 — 지식 개입 차단) ── */
  {
    id: 'v1',
    kind: 'verbal',
    difficulty: 2,
    prompt: {
      ko: '모든 「브렘」은 「톨」이다.\n어떤 「솔」은 「브렘」이다.\n그렇다면 반드시 참인 것은?',
      en: 'All Brems are Tols.\nSome Sols are Brems.\nWhich must be true?',
      ja: 'すべての「ブレム」は「トル」である。\nある「ソル」は「ブレム」である。\n必ず真なのは？',
    },
    options: [
      { id: 'a', text: { ko: '어떤 「솔」은 「톨」이다', en: 'Some Sols are Tols', ja: 'ある「ソル」は「トル」である' } },
      { id: 'b', text: { ko: '모든 「톨」은 「브렘」이다', en: 'All Tols are Brems', ja: 'すべての「トル」は「ブレム」である' } },
      { id: 'c', text: { ko: '어떤 「솔」은 「톨」이 아니다', en: 'Some Sols are not Tols', ja: 'ある「ソル」は「トル」ではない' } },
      { id: 'd', text: { ko: '모든 「솔」은 「브렘」이다', en: 'All Sols are Brems', ja: 'すべての「ソル」は「ブレム」である' } },
    ],
    answer: 'a',
  },
  {
    id: 'v2',
    kind: 'verbal',
    difficulty: 1.5,
    prompt: {
      ko: 'A는 B보다 빠르고,\nC는 A보다 빠르다.\n셋 중 가장 느린 것은?',
      en: 'A is faster than B.\nC is faster than A.\nWhich is the slowest?',
      ja: 'AはBより速く、\nCはAより速い。\n最も遅いのは？',
    },
    options: [
      { id: 'a', text: 'B' },
      { id: 'b', text: 'A' },
      { id: 'c', text: 'C' },
      { id: 'd', text: { ko: '알 수 없다', en: 'Cannot be determined', ja: '判断できない' } },
    ],
    answer: 'a',
  },

  /* ── 종이접기 / 공간 회전 ── */
  {
    id: 'f1',
    kind: 'fold',
    difficulty: 1,
    cells: [
      [R(10, 10, 52, 52), Ln(36, 10, 36, 62, true), Ln(54, 20, 26, 20), T(24, 20, 8, true, 270)],
      [R(10, 10, 26, 52), C(24, 22, 4, true)],
    ],
    options: [
      { id: 'a', fig: paper([[24, 22], [48, 22]]) },
      { id: 'b', fig: paper([[24, 22]]) },
      { id: 'c', fig: paper([[24, 22], [24, 50]]) },
      { id: 'd', fig: paper([[48, 22], [48, 50]]) },
    ],
    answer: 'a',
  },
  {
    id: 'f2',
    kind: 'fold',
    difficulty: 1.5,
    cells: [
      [R(10, 10, 52, 52), Ln(10, 36, 62, 36, true), Ln(20, 54, 20, 26), T(20, 24, 8, true, 0)],
      [R(10, 10, 52, 26), C(22, 20, 4, true), C(50, 28, 4, true)],
    ],
    options: [
      { id: 'a', fig: paper([[22, 20], [50, 28], [22, 52], [50, 44]]) },
      { id: 'b', fig: paper([[22, 20], [50, 28]]) },
      { id: 'c', fig: paper([[22, 20], [50, 28], [50, 52], [22, 44]]) },
      { id: 'd', fig: paper([[22, 20], [50, 28], [50, 20], [22, 28]]) },
    ],
    answer: 'a',
  },
  {
    id: 'f3',
    kind: 'fold',
    difficulty: 2,
    cells: [
      [R(10, 10, 52, 52), Ln(36, 10, 36, 62, true), Ln(54, 20, 26, 20), T(24, 20, 8, true, 270)],
      [R(10, 10, 26, 52), Ln(10, 36, 36, 36, true), Ln(18, 54, 18, 26), T(18, 24, 7, true, 0)],
      [R(10, 10, 26, 26), C(20, 20, 4, true)],
    ],
    options: [
      { id: 'a', fig: paper([[20, 20], [52, 20], [20, 52], [52, 52]]) },
      { id: 'b', fig: paper([[20, 20], [20, 52]]) },
      { id: 'c', fig: paper([[28, 28], [44, 28], [28, 44], [44, 44]]) },
      { id: 'd', fig: paper([[20, 20], [52, 52]]) },
    ],
    answer: 'a',
  },
]
