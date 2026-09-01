import { type Transition, type Variants } from 'framer-motion'

/**
 * 모션 프리셋 — 전 앱이 같은 물성을 공유하는 단일 출처.
 *
 * Apple 방식(WWDC 'Designing Fluid Interfaces')을 따른다. 핵심 두 가지:
 *
 *  1) **stiffness/damping/mass가 아니라 bounce + duration으로 생각한다.**
 *     framer의 bounce ≈ 1 − 감쇠비. bounce 0 = 오버슈트 없음(임계감쇠),
 *     0.2 = 살짝 넘어갔다 돌아옴. duration은 '정착까지 대략 걸리는 시간'이지
 *     고정 재생시간이 아니다 — 스프링은 도중에 목표가 바뀌어도 이어서 움직인다.
 *
 *  2) **기본은 오버슈트 0.** 바운스는 사용자의 제스처가 실제로 운동량을 실었을 때만
 *     쓴다(플릭, 드래그 놓기, 보상 획득). 그냥 나타나는 카드가 통통 튀면
 *     '부드럽다'가 아니라 '장난감 같다'로 읽힌다 — 이전 프리셋의 문제가 정확히 이거였다.
 *
 * ⚠️ 새 모션을 넣을 때 stiffness/damping을 손으로 적지 말 것. 여기 없는 느낌이 필요하면
 *    프리셋을 추가해서 전 앱이 같이 쓰게 한다(하드코딩 97개가 제각각 튀던 상태로 돌아간다).
 */
export const SPRING = {
  /** 기본값. 화면 요소의 이동·등장·정착 대부분(Apple 'move/reposition': 감쇠 1.0 · 응답 0.4) */
  ui: { type: 'spring', bounce: 0, duration: 0.4 },
  /** 짧고 단정한 반응 — 토글·프레스 복귀·숫자 갱신처럼 즉답이 중요한 것 */
  snap: { type: 'spring', bounce: 0, duration: 0.22 },
  /** 바텀시트·모달(Apple 'drawer/sheet': 감쇠 0.8 · 응답 0.3). 손으로 끌어올린 느낌이라 살짝 넘어간다 */
  sheet: { type: 'spring', bounce: 0.18, duration: 0.34 },
  /** 운동량이 실린 순간에만 — 보상 획득, 플릭 착지, 성취 배지 */
  flick: { type: 'spring', bounce: 0.3, duration: 0.45 },
  /** 오버슈트가 의미를 왜곡하는 곳 — 진행바·게이지·퍼센트(102%로 튀면 안 된다) */
  gauge: { type: 'spring', bounce: 0, duration: 0.55 },
} satisfies Record<string, Transition>

/** 카드·섹션 등장. 위로 살짝 올라오며 정착 — 오버슈트 없음이 기본이다 */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING.ui },
  // 나갈 때는 들어온 길로 되돌아간다(공간 일관성) — 아래로 사라지지 않는다
  exit: { opacity: 0, y: 14, scale: 0.98, transition: SPRING.snap },
}

/** 바텀시트 — 아래에서 올라오고 아래로 내려간다(같은 경로) */
export const modalSheet: Variants = {
  hidden: { y: '100%', opacity: 0 },
  show: { y: 0, opacity: 1, transition: SPRING.sheet },
  exit: { y: '100%', opacity: 0, transition: SPRING.snap },
}

/** 목록 자식들이 순차 등장 — 간격이 넓으면 느려 보인다 */
export const stagger = (gap = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: 0.02 } },
})

/**
 * 누름 피드백. Apple은 릴리스가 아니라 **누르는 순간** 반응한다.
 * 0.94는 6% 수축이라 과하다 — 0.97이면 눌린 게 보이면서 요소가 흔들리지 않는다.
 */
export const tapScale = { scale: 0.97 }
/** 물리 버튼처럼 눌러 들어가는 것(주 CTA) */
export const tapPress = { y: 2, scale: 0.98 }
