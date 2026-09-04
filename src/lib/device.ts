/**
 * 기기 입력 특성 — 호버 상태를 붙일지 판단한다.
 *
 * 터치 기기에서 :hover / whileHover를 붙이면 탭한 뒤 그 상태가 **손을 떼도 남는다**(sticky hover).
 * 누른 버튼만 계속 떠 있고 밝게 빛나 '눌린 채 멈춘' 것처럼 보인다. 그래서 마우스가 있는 기기에서만 켠다.
 *
 * matchMedia 결과를 모듈 로드 시 한 번만 읽는다 — 마우스를 세션 중에 꽂는 경우는 드물고,
 * 버튼 하나하나가 리스너를 다는 비용이 더 크다.
 */
export const canHover =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false
