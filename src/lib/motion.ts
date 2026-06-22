import { type Transition, type Variants } from 'framer-motion'

/**
 * 듀오링고식 '젤리(Jelly)' 모션 프리셋 — 전 앱이 같은 쫀득함을 공유하는 단일 출처.
 * transition={SPRING.jelly} / variants={popIn} 처럼 import 해서 사용.
 *
 * 튜닝 가이드:
 *  - stiffness ↑ = 빠르게, damping ↓ = 더 통통 튐(오버슈트 ↑), mass ↑ = 묵직.
 *  - "쫀득함"은 damping 14~20 + 약간의 mass(0.7~0.9)에서 가장 잘 나온다.
 */
export const SPRING = {
  /** 기본 젤리 — 통통 튀며 정착(카드/칩/페이지) */
  jelly: { type: 'spring', stiffness: 320, damping: 18, mass: 0.7 },
  /** 크게 바운스 — 모달·보상 등장 */
  bounce: { type: 'spring', stiffness: 260, damping: 14, mass: 0.85 },
  /** 짧고 빠른 팝 — 숫자/배지 갱신 */
  pop: { type: 'spring', stiffness: 500, damping: 24 },
  /** 부드러운 정착 — 진행바 등 과한 오버슈트 금지 영역 */
  soft: { type: 'spring', stiffness: 180, damping: 26, mass: 0.7 },
  /** 버튼 프레스 복귀 — 딱 떨어지게 */
  snappy: { type: 'spring', stiffness: 600, damping: 30 },
} satisfies Record<string, Transition>

/** 카드/페이지 등장 — 살짝 솟구쳐 정착하는 젤리 */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING.jelly },
  exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.18 } },
}

/** 모달(바텀시트) — 아래에서 젤리처럼 튀어오름 */
export const modalSheet: Variants = {
  hidden: { y: 90, opacity: 0, scale: 0.96 },
  show: { y: 0, opacity: 1, scale: 1, transition: SPRING.bounce },
  exit: { y: 90, opacity: 0, transition: { duration: 0.2 } },
}

/** 스태거 컨테이너 — 자식들이 순차로 통통 등장 */
export const stagger = (gap = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: 0.02 } },
})

/** whileTap 공통 값 */
export const tapJelly = { scale: 0.94 }
export const tapPress = { y: 3, scale: 0.98 }
