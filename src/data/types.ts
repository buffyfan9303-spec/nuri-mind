export type Lang = 'ko' | 'en' | 'ja'
export type L = Record<Lang, string>

export type TestId = 'adhd' | 'ego' | 'iq' | 'love' | 'burnout' | 'dopamine' | 'resilience' | 'dark' | 'selfesteem' | 'perfect' | 'efficacy' | 'socialanx' | 'memory' | 'focus' | 'speed' | 'spatial' | 'switch'

/** 프로필 아바타 — 업로드 사진 또는 동물 페르소나 */
export type Avatar =
  | { kind: 'animal'; persona: string }
  | { kind: 'photo'; dataUrl: string }
  | null

/** 커뮤니티 글 */
export interface CommunityPost {
  id: string
  nick: string
  avatar: Avatar
  badge?: string // 작성자 대표 동물 이모지
  text: string
  likes: number
  liked: boolean
  mine?: boolean
  at: number
}

/** 커뮤니티 댓글 */
export interface CommunityComment {
  id: string
  postId: string
  nick: string
  avatar: Avatar
  badge?: string
  text: string
  at: number
  mine?: boolean
}

/** 신고 (운영자 모더레이션) */
export interface Report {
  id: string
  postId: string
  nick: string
  excerpt: string
  reason: string
  at: number
  resolved: boolean
}

/** 리커트형 문항 (ADHD / EGO) */
export interface LikertItem {
  id: string
  text: L
  /** 하위 척도 키 — ADHD: IN/OR/TM/IM, EGO: SELF/STR/EMP/AVD/VAL */
  sub: string
  /** 역채점 문항 여부 */
  reverse?: boolean
  /** ASRS Part A 스타일 핵심 스크리너 문항 */
  core?: boolean
  /** 스크리너 음영 임계값 (이 값 이상 응답 시 신호 1) */
  coreThreshold?: number
  /** 타당도(위장 응답 탐지) 문항 */
  validity?: boolean
}

/** 도형 프리미티브 (IQ 문항 SVG 렌더링 DSL) */
export type Prim =
  | { k: 'c'; x: number; y: number; r: number; f?: boolean }
  | { k: 'r'; x: number; y: number; w: number; h: number; f?: boolean; rot?: number }
  | { k: 't'; x: number; y: number; s: number; f?: boolean; rot?: number }
  | { k: 'l'; x1: number; y1: number; x2: number; y2: number; dash?: boolean }
  | { k: 'd'; x: number; y: number }
export type Fig = Prim[]

export type IqKind = 'matrix' | 'series' | 'letter' | 'verbal' | 'fold'

export interface IqOption {
  id: string
  text?: string | L
  fig?: Fig
}

export interface IqItem {
  id: string
  kind: IqKind
  difficulty: 1 | 1.5 | 2
  prompt?: L
  /** 수열/문자열 문제의 본문 (언어 중립) */
  series?: string
  /** matrix: 8개 셀(9번째 = ?) / fold: 단계별 그림 스트립 */
  cells?: Fig[]
  options: IqOption[]
  answer: string
}

export interface SubscaleScore {
  key: string
  score: number
  max: number
  /** 라플라스 평활화 적용 비율 (0~1) */
  ratio: number
}

export interface TestResult {
  id: string
  testId: TestId
  at: number
  raw: number
  percentile: number
  band: string
  persona: string
  iq?: number
  /** IQ 검사 모드 — 'fast'(빠른·전체무료) / 'pro'(정밀·상세결과 유료) */
  iqMode?: 'fast' | 'pro'
  /** 기억력 지수 (정밀 기억력 검사 — 작업기억 100±15 척도) */
  mq?: number
  /** 집중 지수 (정밀 집중력 검사 — 처리속도·집중지속 100±15 척도) */
  fq?: number
  /** 처리속도 지수 (정밀 처리속도 검사 — 기호-숫자 매칭 100±15 척도) */
  sq?: number
  /** 공간 지수 (정밀 공간지각 검사 — 심적 회전 100±15 척도) */
  xq?: number
  /** 전환 지수 (정밀 주의전환 검사 — 과제 전환·인지 유연성 100±15 척도) */
  wq?: number
  screener?: number
  maskFlag?: boolean
  axes?: Record<string, number>
  subscales: SubscaleScore[]
  durationMs: number
}

export type SurveyQType = 'single' | 'multi' | 'scale' | 'text'

export interface SurveyQ {
  id: string
  type: SurveyQType
  text: string
  options?: string[]
  required: boolean
}

export type SurveyStatus = 'pending' | 'approved' | 'rejected'

export interface Survey {
  id: string
  emoji: string
  title: string
  desc: string
  questions: SurveyQ[]
  reward: number
  target: number
  responses: number
  status: SurveyStatus
  rejectReason?: string
  mine?: boolean
  createdAt: number
}

export interface LedgerEntry {
  id: string
  amount: number
  memo: string
  at: number
}

export type RedemptionStatus = 'pending' | 'approved' | 'rejected'

export interface Redemption {
  id: string
  itemName: string
  emoji: string
  cost: number
  status: RedemptionStatus
  at: number
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface ExperienceApplication {
  id: string
  expId: string
  status: ApplicationStatus
  at: number
}

export interface ShopItem {
  id: string
  emoji: string
  name: L
  desc: L
  cost: number
}

export interface Offer {
  id: string
  emoji: string
  title: L
  desc: L
  reward: number
  ready: boolean
}
