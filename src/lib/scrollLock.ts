/**
 * 오버레이가 열린 동안 배경 스크롤을 잠근다 — 참조 카운트 방식(홀덤 캘린더에서 이식).
 *
 * 왜 카운트인가: 시트 위에 모달이 겹칠 때(약관 시트 → 확인 모달) 안쪽이 닫히며 잠금을 풀면
 * 바깥이 아직 열려 있는데 배경이 스크롤된다. 각자 body.style.overflow를 직접 쓰면 반드시 이렇게
 * 깨진다 — 소유자가 몇 명인지 세는 쪽이 유일하게 맞는 구조다.
 *
 * html과 body를 함께 잠근다: 뷰포트 스크롤러가 어느 쪽인지 브라우저·CSS에 따라 달라서
 * body만 잠그면 iOS Safari 등에서 그대로 스크롤된다.
 */
let locks = 0

function paint() {
  const on = locks > 0
  document.documentElement.style.overflow = on ? 'hidden' : ''
  document.body.style.overflow = on ? 'hidden' : ''
}

export function lockScroll(): void {
  locks += 1
  if (locks === 1) paint()
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1)
  if (locks === 0) paint()
}

/**
 * 잠겨 있는데 화면에 보이는 잠금 소유자([data-scroll-lock])가 하나도 없으면 되돌린다.
 * 정리 함수가 돌지 않은 채 오버레이가 사라진 경우(라우트 급전환 등)의 자가복구.
 * 정상 상태에선 보이는 소유자가 있어 아무 일도 하지 않는다 — 오작동해도 손해가 없는 방향.
 */
export function sweepScrollLocks(): void {
  if (locks === 0) return
  const visible = [...document.querySelectorAll<HTMLElement>('[data-scroll-lock]')].some((el) => el.getClientRects().length > 0)
  if (visible) return
  locks = 0
  paint()
}
