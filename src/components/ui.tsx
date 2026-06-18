import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export function PointsPill() {
  const points = useStore((s) => s.points)
  const streak = useStore((s) => s.streak)
  return (
    <div className="flex items-center gap-1.5">
      {streak > 0 && (
        <span className="flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-sm font-extrabold text-orange-500 shadow-card">
          🔥{streak}
        </span>
      )}
      <motion.span
        key={points}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-mind-700 shadow-card"
      >
        💎 {points.toLocaleString()}
      </motion.span>
    </div>
  )
}

export function TopBar({
  title,
  back,
  right,
  transparent,
}: {
  title?: string
  back?: string | (() => void)
  right?: ReactNode
  transparent?: boolean
}) {
  const nav = useNavigate()
  return (
    <div
      className={`sticky top-0 z-30 flex h-14 items-center gap-2 px-3 ${
        transparent ? '' : 'bg-cream/90 backdrop-blur'
      }`}
    >
      {back !== undefined && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => (typeof back === 'function' ? back() : back ? nav(back) : nav(-1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-ink-sub"
          aria-label="back"
        >
          ←
        </motion.button>
      )}
      <div className="flex-1 truncate text-[19px] font-extrabold tracking-tight">{title}</div>
      {right ?? <PointsPill />}
    </div>
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`rounded-3xl bg-white p-5 shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[18px] font-extrabold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Chip({ children, tone = 'mind' }: { children: ReactNode; tone?: 'mind' | 'amber' | 'red' | 'gray' | 'blue' }) {
  const map = {
    mind: 'bg-mind-100 text-mind-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-500',
    blue: 'bg-sky2-100 text-sky2-600',
  }
  return <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-bold leading-none ${map[tone]}`}>{children}</span>
}

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose?: () => void
  children: ReactNode
}) {
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
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-pop sm:rounded-3xl sm:pb-6"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * 진행바 — 듀오링고/Typeform 표준(전세계 best-practice).
 * 트랙(overflow-hidden)이 fill을, fill(overflow-hidden)이 상단 광택을 clip한다.
 * width는 0~100%로 clamp되고 시작점엔 둥근 nub(min-width=높이)로 끊김·이탈이 0이다.
 */
export function ProgressBar({ value, color = '#4FA882' }: { value: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (Number.isFinite(value) ? value : 0) * 100))
  return (
    <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#E3E9E5]">
      <motion.div
        className="relative h-full overflow-hidden rounded-full"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 0.7 }}
        style={{ background: color, minWidth: pct > 0 ? '0.875rem' : 0 }}
      >
        <span className="pointer-events-none absolute inset-x-1.5 top-[3px] block h-1 rounded-full bg-white/40" />
      </motion.div>
    </div>
  )
}
