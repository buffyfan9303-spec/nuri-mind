import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 다이얼로그 포커스 계약 — 홀덤 캘린더의 접근성 규약을 이식.
 *
 * 열리면 첫 포커스 가능 요소(없으면 컨테이너)로 포커스를 옮기고, Tab이 다이얼로그 밖으로 새지 않게 순환시키며,
 * 닫히면 **열기 전에 포커스가 있던 요소로 되돌린다**. 이게 없으면 키보드·스크린리더 사용자는 모달이 열려도
 * 포커스가 뒤 화면에 남아 '아무 일도 안 일어난' 것처럼 보이고, 닫힌 뒤엔 문서 맨 위로 튕긴다.
 *
 * 마우스·터치 사용자에게는 보이지 않는 변화다 — 그래서 빠뜨리기 쉽다.
 */
export function useDialogFocus(open: boolean, ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const root = ref.current
    if (!root) return

    // 첫 프레임에는 AnimatePresence 진입 애니메이션 중이라 요소가 아직 없을 수 있다 → rAF 뒤에
    const raf = requestAnimationFrame(() => {
      const first = root.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? root).focus({ preventScroll: true })
      if (!first && root.tabIndex < 0) root.tabIndex = -1
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      // 열기 전 요소가 아직 문서에 있을 때만 — 사라졌으면 억지로 옮기지 않는다
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true })
    }
  }, [open, ref])
}
