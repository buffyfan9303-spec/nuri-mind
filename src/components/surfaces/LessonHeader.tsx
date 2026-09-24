import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ProgressBar } from '../primitives/ProgressBar'
import { tapPop, SPRING } from '../../lib/motion'

/**
 * 문항 화면 머리 — 듀오링고 레슨 패턴: 왼쪽 닫기(X) · 가운데 굵은 진행바 · 오른쪽 보조(번호/타이머).
 * 포인트·다이아 알약은 두지 않는다 — 문항을 푸는 동안엔 '지금 몇 번째인가'만 보이면 된다.
 */
export function LessonHeader({
  value,
  color,
  onClose,
  closeLabel,
  right,
}: {
  /** 0~1 진행률 */
  value: number
  color?: string
  onClose: () => void
  /** 닫기 버튼의 스크린리더 이름(i18n 문구) */
  closeLabel: string
  right?: ReactNode
}) {
  return (
    <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-md items-center gap-3 px-3">
        <motion.button
          type="button"
          whileTap={tapPop}
          transition={SPRING.press}
          onClick={onClose}
          aria-label={closeLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-faint"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </motion.button>
        <div className="flex-1">
          <ProgressBar value={value} color={color} />
        </div>
        {right && <div className="flex min-w-[40px] shrink-0 items-center justify-end pr-1">{right}</div>}
      </div>
    </div>
  )
}
