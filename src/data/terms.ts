import type { L, TestId } from './types'

/**
 * 용어 단일 출처(SSOT) — 하드코딩된 라벨을 한곳에서 통제.
 *
 * 원칙:
 *  1) 검사 '표시명'의 단일 출처는 i18n(`test.<id>.name`)이다.
 *     컴포넌트는 문자열을 직접 쓰지 말고 t(TEST_NAME_KEY(id)) 만 사용한다.
 *     → 'ADHD 검사' vs '주의산만 검사' 같은 혼용을 구조적으로 차단.
 *  2) 여러 화면에서 반복되는 공통 라벨(섹션 제목·배지·단위)은 TERMS로 정의해
 *     l(TERMS.xxx) 로 쓴다(중복 정의/오타/불일치 제거).
 */

/** 검사명 i18n 키 — 표시명은 항상 이 키로만 접근 */
export const TEST_NAME_KEY = (id: TestId): string => `test.${id}.name`
export const TEST_SHORT_KEY = (id: TestId): string => `test.${id}.short`
export const TEST_DESC_KEY = (id: TestId): string => `test.${id}.desc`

/** 화면 공통 라벨(L) — l(TERMS.xxx) 으로 사용 */
export const TERMS = {
  sectionQuick: { ko: '1분 테스트', en: '1-min tests', ja: '1分テスト' },
  sectionDeep: { ko: '심층 심리검사', en: 'In-depth tests', ja: '深層心理検査' },
  sectionPrecision: { ko: '두뇌 능력 측정', en: 'Precision tests', ja: '精密検査' },
  badgeMeasured: { ko: '직접 측정', en: 'Measured', ja: '実測' },
  badgeFreeToday: { ko: '오늘 무료', en: 'Free today', ja: '今日無料' },
  badgePremium: { ko: '프리미엄', en: 'Premium', ja: 'プレミアム' },
  viewAll: { ko: '전체', en: 'All', ja: '全て' },
  unitTests: { ko: '종', en: ' tests', ja: '種' },
} satisfies Record<string, L>

export type TermKey = keyof typeof TERMS
