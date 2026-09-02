import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { lockScroll, unlockScroll } from '../../lib/scrollLock'
import { useBackClose } from '../../lib/backstack'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { haptic } from '../../lib/haptic'
import type { ReactNode } from 'react'
import { SPRING } from '../../lib/motion'

/**
 * 바텀시트 모달 — 홀덤 캘린더의 시트 동작(끌어내려 닫기·뒤로가기 닫기·포커스 계약)을 이식.
 *
 * 끌어내려 닫기는 framer의 drag로 구현한다(홀덤의 터치 이벤트 머신을 옮기지 않는다):
 *  · dragListener={false} + 손잡이에서만 dragControls.start — 본문 스크롤과 충돌하지 않는다(스크롤 양보)
 *  · dragElastic 위 0.04·아래 0.7 — 위로는 거의 안 움직이고(러버밴드) 아래로는 손을 따라온다(1:1 추종)
 *  · 놓는 순간 offset>120 또는 속도>600px/s 면 닫힘 — 위치가 아니라 **운동량**으로 판단(Apple §6)
 *  · 아니면 SPRING.sheet로 제자리 복귀 — 스프링이라 도중에 다시 잡아 되돌릴 수 있다(중단 가능)
 * 닫을 수 없는 모달(onClose 없음)은 손잡이도, 뒤로가기 등록도 없다 — 게이트는 게이트여야 한다.
 */
export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose?: () => void
  children: ReactNode
}) {
  const controls = useDragControls()
  const panelRef = useRef<HTMLDivElement>(null)
  const closable = !!onClose

  // ESC로 닫기 — 키보드 사용자가 모달에 갇히지 않게(열려 있을 때만 구독)
  useEffect(() => {
    if (!open || !onClose) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // 열린 동안 배경 스크롤 잠금 — onClose가 없어도(닫기 불가 모달) 잠겨야 하므로 위 이펙트와 분리
  useEffect(() => {
    if (!open) return
    lockScroll()
    return unlockScroll
  }, [open])

  // 뒤로가기(Android·브라우저)로 이 모달만 닫힌다 — 닫을 수 없는 모달은 등록하지 않는다
  useBackClose(open && closable, onClose ?? (() => {}))
  // 포커스: 열리면 안으로, Tab은 순환, 닫히면 열었던 요소로 복귀
  useDialogFocus(open, panelRef)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!onClose) return
    if (info.offset.y > 120 || info.velocity.y > 600) {
      haptic(6)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            initial={{ y: 90, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={SPRING.sheet}
            drag={closable ? 'y' : false}
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            data-scroll-lock
            aria-modal="true"
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl bg-surface p-6 pb-8 shadow-pop sm:rounded-3xl sm:pb-6"
          >
            {closable && (
              // 손잡이 — 여기서 시작한 손짓만 드래그가 된다(본문 스크롤과 분리). 44px 히트영역, 표시는 4px.
              <div
                onPointerDown={(e) => controls.start(e)}
                className="-mt-3 mb-2 flex h-6 cursor-grab touch-none items-center justify-center active:cursor-grabbing sm:hidden"
                aria-hidden="true"
              >
                <span className="h-1 w-9 rounded-full bg-line" />
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
