/**
 * 깊이 보는 심리검사 묶음 — 홈과 전체 검사 화면(/tests)이 같은 정의를 쓴다.
 * 순서는 많이 찾는 쪽부터: 연애·관계 → 요즘 내 마음 → 나를 알기 (두뇌 측정은 별도 섹션)
 */
export const DEEP_CATS = [
  { key: 'relation', emoji: '💞', label: { ko: '연애 · 관계', en: 'Love & relationships', ja: '恋愛・関係' }, ids: ['love', 'dark', 'ego'] },
  { key: 'mind', emoji: '🌿', label: { ko: '요즘 내 마음', en: 'How I feel lately', ja: '最近の心' }, ids: ['burnout', 'adhd', 'socialanx', 'dopamine', 'resilience'] },
  { key: 'self', emoji: '🪞', label: { ko: '나를 알기', en: 'Know yourself', ja: '自分を知る' }, ids: ['selfesteem', 'perfect', 'efficacy'] },
] as const
