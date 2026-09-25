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
 * 2026-09 듀오링고식 보정: 위 원칙(bounce + duration, 의미 없는 튐 금지)은 그대로 두고,
 * '손에 닿는 것'에만 탄성을 조금 준다 —
 *  · 3D 버튼·칩은 **누르는 순간 바닥까지 곧장**(pressIn, 튐 0) 내려가고, 손을 떼면 살짝 튀어 올라온다(press).
 *  · 칩·카드는 처음 나타날 때 한 번 작게 '톡' 넘친다(pop, bounce 0.3 · 짧게). 스크롤·재렌더 때는 반복하지 않는다.
 *  · 진행바·게이지·페이지·시트는 그대로 — 숫자를 넘치게 그리거나 화면 전환이 출렁이면 뜻이 틀어진다.
 *
 * ⚠️ 새 모션을 넣을 때 stiffness/damping을 손으로 적지 말 것. 여기 없는 느낌이 필요하면
 *    프리셋을 추가해서 전 앱이 같이 쓰게 한다(하드코딩 97개가 제각각 튀던 상태로 돌아간다).
 */
export const SPRING = {
  /** 기본값. 화면 요소의 이동·등장·정착 대부분(Apple 'move/reposition': 감쇠 1.0). 0.4→0.46 — 끝이 더 길게 녹아든다 */
  ui: { type: 'spring', bounce: 0, duration: 0.46 },
  /** 짧고 단정한 반응 — 토글·프레스 복귀·숫자 갱신처럼 즉답이 중요한 것 */
  snap: { type: 'spring', bounce: 0, duration: 0.26 },
  /** 바텀시트·모달(Apple 'drawer/sheet'). 넘침을 줄이고 조금 길게 — 출렁임 대신 미끄러져 앉는다 */
  sheet: { type: 'spring', bounce: 0.1, duration: 0.42 },
  /** 운동량이 실린 순간에만 — 보상 획득, 플릭 착지, 성취 배지 */
  flick: { type: 'spring', bounce: 0.24, duration: 0.5 },
  /** 오버슈트가 의미를 왜곡하는 곳 — 진행바·게이지·퍼센트(102%로 튀면 안 된다) */
  gauge: { type: 'spring', bounce: 0, duration: 0.6 },
  /** 칩·카드의 첫 등장 — 작게 한 번 넘쳤다 앉는다(듀오링고식 '톡'). 0.3→0.18로 낮춰 '톡'보다 '폭신'에 가깝게 */
  pop: { type: 'spring', bounce: 0.18, duration: 0.48 },
  /** 3D 버튼을 누르는 순간 — 바닥(그림자 깊이)까지 곧장. 누름에 튐이 있으면 '덜 눌렸다'로 읽힌다 */
  pressIn: { type: 'spring', bounce: 0, duration: 0.12 },
  /** 3D 버튼에서 손을 뗄 때 — 바닥에서 올라와 살짝 넘쳤다 제자리. 0.4는 딱딱하게 튕겨 0.25로 */
  press: { type: 'spring', bounce: 0.25, duration: 0.36 },
  /**
   * 사라질 때. 스프링은 끝 속도가 남은 채 opacity 0에 닿아 '뚝' 끊겨 보인다 —
   * 나가는 건 목표가 바뀔 일이 없으니 ease-in-out 트윈으로 속도를 0까지 줄이며 흐려지게 한다.
   * (문항 전환처럼 mode="wait"인 곳은 이 시간이 그대로 빈 시간이 되므로 0.2초를 넘기지 않는다)
   */
  exit: { type: 'tween', duration: 0.2, ease: [0.4, 0, 0.2, 1] },
} satisfies Record<string, Transition>

/** 카드·칩 등장. 조금 작은 상태에서 '톡' 커지며 정착(pop) — 위치 이동은 작게 둬서 출렁임이 아니라 탄력으로 읽힌다 */
export const popIn: Variants = {
  // 0.94→0.965: 크기 변화가 작을수록 '튀어나온다'가 아니라 '떠오른다'로 읽힌다
  hidden: { opacity: 0, y: 10, scale: 0.965 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING.pop },
  // 나갈 때는 들어온 길로 되돌아간다(공간 일관성) — 아래로 사라지지 않는다
  exit: { opacity: 0, y: 8, scale: 0.965, transition: SPRING.exit },
}

/** 바텀시트 — 아래에서 올라오고 아래로 내려간다(같은 경로) */
export const modalSheet: Variants = {
  hidden: { y: '100%', opacity: 0 },
  show: { y: 0, opacity: 1, transition: SPRING.sheet },
  exit: { y: '100%', opacity: 0, transition: SPRING.exit },
}

/** 목록 자식들이 순차 등장 — 간격이 넓으면 느려 보인다 */
export const stagger = (gap = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: 0.03 } },
})

/**
 * 누름 피드백. Apple은 릴리스가 아니라 **누르는 순간** 반응한다.
 * 0.94는 6% 수축이라 과하다 — 0.97이면 눌린 게 보이면서 요소가 흔들리지 않는다.
 */
export const tapScale = { scale: 0.97 }
/** 누르면 곧장 줄고(pressIn) — 컴포넌트 transition을 SPRING.press로 두면 뗄 때 살짝 튀며 복귀한다 */
export const tapPop = { ...tapScale, transition: SPRING.pressIn }
/** 물리 버튼처럼 눌러 들어가는 것(주 CTA) */
export const tapPress = { y: 2, scale: 0.98 }

/**
 * 듀오링고식 3D 누름 — 아랫면(단색 그림자) 깊이만큼 **그대로 내려앉고** 그림자는 0으로 접힌다.
 * 크기는 줄이지 않는다(눌린 게 아니라 작아진 것처럼 보인다). 누를 땐 pressIn, 뗄 땐 press(살짝 튐).
 *
 *   const p = press3d(4, '#2F6B52')
 *   <motion.button whileTap={p.whileTap} transition={p.transition} style={{ boxShadow: p.rest }} />
 */
export function press3d(depth: number, edge: string, extra = '') {
  const tail = extra ? `, ${extra}` : ''
  return {
    rest: `0 ${depth}px 0 ${edge}${tail}`,
    whileTap: { y: depth, boxShadow: `0 0px 0 ${edge}${tail}`, transition: SPRING.pressIn },
    transition: SPRING.press,
  }
}
