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
    emoji: '🃏',
    count: 20,
    minutes: 5,
    tint: 'bg-dk-light',
    text: 'text-dk-deep',
    gradFrom: '#A23E63',
    gradTo: '#D88BA6',
    btn: 'dk',
  },
]

export const testMeta = (id: TestId): TestMeta => TESTS.find((t) => t.id === id)!
