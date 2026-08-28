import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { SPRING } from '../../lib/motion'

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose?: () => void
  children: ReactNode
}) {
  // ESC로 닫기 — 키보드 사용자가 모달에 갇히지 않게(열려 있을 때만 구독)
  useEffect(() => {
    if (!open || !onClose) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
            initial={{ y: 90, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={SPRING.bounce}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl bg-surface p-6 pb-8 shadow-pop sm:rounded-3xl sm:pb-6"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
