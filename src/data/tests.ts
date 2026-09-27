import type { TestId } from './types'

export interface TestMeta {
  id: TestId
  emoji: string
  count: number
  minutes: number
  /** Tailwind 클래스 (정적 문자열 — JIT 스캔 대상) */
  tint: string
  text: string
  gradFrom: string
  gradTo: string
  btn: 'adhd' | 'ego' | 'iq' | 'love' | 'burn' | 'dopa' | 'reso' | 'dk'
  /** 정밀검사(실측 인지과제) — 홈에서 별도 섹션으로 묶음 */
  precision?: boolean
  /** 인구 규준이 없는 프로필형 검사(진로 흥미) — 'percentile'은 자리 채움값(50)이라 '상위 %'를 어디에도 보이지 않는다 */
  noNorm?: boolean
}

export const TESTS: TestMeta[] = [
  {
    id: 'adhd',
    emoji: '🎯',
    count: 20,
    minutes: 5,
    tint: 'bg-adhd-light',
    text: 'text-adhd-deep',
    gradFrom: '#FFB020',
    gradTo: '#FF8A4C',
    btn: 'adhd',
  },
  {
    id: 'ego',
    emoji: '🎭',
    count: 20,
    minutes: 5,
    tint: 'bg-ego-light',
    text: 'text-ego-deep',
    gradFrom: '#FF6F61',
    gradTo: '#FF9A8C',
    btn: 'ego',
  },
  {
    id: 'iq',
    emoji: '🧩',
    count: 20,
    minutes: 12,
    tint: 'bg-iq-light',
    text: 'text-iq-deep',
    gradFrom: '#6E7BF2',
    gradTo: '#8FB8E8',
    btn: 'iq',
    precision: true,
  },
  {
    id: 'memory',
    emoji: '🧠',
    count: 11,
    minutes: 4,
    tint: 'bg-iq-light',
    text: 'text-iq-deep',
    gradFrom: '#5B6CF0',
    gradTo: '#34C9D6',
    btn: 'iq',
    precision: true,
  },
  {
    id: 'focus',
    emoji: '👁️',
    count: 36,
    minutes: 3,
    tint: 'bg-reso-light',
    text: 'text-reso-deep',
    gradFrom: '#14B8A6',
    gradTo: '#34D399',
    btn: 'reso',
    precision: true,
  },
  {
    id: 'speed',
    emoji: '⚡',
    count: 40,
    minutes: 2,
    tint: 'bg-iq-light',
    text: 'text-iq-deep',
    gradFrom: '#8B5CF6',
    gradTo: '#C4B5FD',
    btn: 'iq',
    precision: true,
  },
  {
    id: 'spatial',
    emoji: '🧭',
    count: 20,
    minutes: 3,
    tint: 'bg-iq-light',
    text: 'text-iq-deep',
    gradFrom: '#3B82F6',
    gradTo: '#60A5FA',
    btn: 'iq',
    precision: true,
  },
  {
    id: 'switch',
    // 🔀(섞기 버튼)은 Fluent에서 파란 네모 버튼이라 칩 안에서 '버튼 속 버튼'처럼 보였다 → 🤹(여러 규칙을 번갈아 다루기)
    emoji: '🤹',
    count: 32,
    minutes: 3,
    tint: 'bg-iq-light',
    text: 'text-iq-deep',
    gradFrom: '#0EA5E9',
    gradTo: '#7DD3FC',
    btn: 'iq',
    precision: true,
  },
  {
    id: 'love',
    emoji: '💘',
    count: 20,
    minutes: 5,
    tint: 'bg-love-light',
    text: 'text-love-deep',
    gradFrom: '#F25C8E',
    gradTo: '#F6A0C0',
    btn: 'love',
  },
  {
    id: 'burnout',
    emoji: '🔋',
    count: 20,
    minutes: 5,
    tint: 'bg-burn-light',
    text: 'text-burn-deep',
    gradFrom: '#8B7CF6',
    gradTo: '#B8AEFA',
    btn: 'burn',
  },
  {
    id: 'dopamine',
    emoji: '📵',
    count: 20,
    minutes: 5,
    tint: 'bg-dopa-light',
    text: 'text-dopa-deep',
    gradFrom: '#12A5C2',
    gradTo: '#6BD0E3',
    btn: 'dopa',
  },
  {
    id: 'resilience',
    emoji: '🎋',
    count: 20,
    minutes: 5,
    tint: 'bg-reso-light',
    text: 'text-reso-deep',
    gradFrom: '#10B981',
    gradTo: '#7DDFB6',
    btn: 'reso',
  },
  {
    id: 'dark',
    emoji: '😈',
    count: 20,
    minutes: 5,
    tint: 'bg-dk-light',
    text: 'text-dk-deep',
    gradFrom: '#A23E63',
    gradTo: '#D88BA6',
    btn: 'dk',
  },
  {
    id: 'selfesteem',
    emoji: '🪞',
    count: 10,
    minutes: 3,
    tint: 'bg-love-light',
    text: 'text-love-deep',
    gradFrom: '#FF7AA8',
    gradTo: '#FFB5CE',
    btn: 'love',
  },
  {
    id: 'perfect',
    emoji: '💯',
    count: 20,
    minutes: 5,
    tint: 'bg-dk-light',
    text: 'text-dk-deep',
    gradFrom: '#6E59D9',
    gradTo: '#A99BEA',
    btn: 'dk',
  },
  {
    id: 'efficacy',
    emoji: '💪',
    count: 10,
    minutes: 3,
    tint: 'bg-reso-light',
    text: 'text-reso-deep',
    gradFrom: '#16A34A',
    gradTo: '#5FD39A',
    btn: 'reso',
  },
  {
    id: 'socialanx',
    emoji: '😰',
    count: 15,
    minutes: 4,
    tint: 'bg-dopa-light',
    text: 'text-dopa-deep',
    gradFrom: '#4FB0C9',
    gradTo: '#9BD5E3',
    btn: 'dopa',
  },
  {
    id: 'career',
    emoji: '🧭',
    count: 30,
    minutes: 5,
    tint: 'bg-adhd-light',
    text: 'text-adhd-deep',
    gradFrom: '#E8912D',
    gradTo: '#F6C06B',
    btn: 'adhd',
    noNorm: true,
  },
]

export const testMeta = (id: TestId): TestMeta => TESTS.find((t) => t.id === id)!

/** '상위 %'를 보여도 되는 검사인가 — 규준 없는 프로필형(noNorm)은 false. 알 수 없는 id는 기존 동작(true) */
export const hasNorm = (id: string): boolean => !TESTS.find((t) => t.id === id)?.noNorm

/**
 * '심층검사를 모두 마침' 판정 묶음(AI 종합 리포트·나에 관하여 한눈에·홈 완료) — 기존 11종.
 * 진로 흥미(noNorm)는 추가 검사라 넣지 않는다(2026-09-27 사용자 결정: 새 검사로 기존 완주자를 다시 잠그지 않음).
 */
export const GATED_DEEP = TESTS.filter((t) => !t.precision && !t.noNorm)
