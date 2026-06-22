import { motion } from 'framer-motion'

/**
 * 진행바 — 듀오링고/Typeform 표준(전세계 best-practice).
 * 트랙(overflow-hidden)이 fill을, fill(overflow-hidden)이 상단 광택을 clip한다.
 * width는 0~100%로 clamp되고 시작점엔 둥근 nub(min-width=높이)로 끊김·이탈이 0이다.
 */
export function ProgressBar({ value, color = '#4FA882' }: { value: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (Number.isFinite(value) ? value : 0) * 100))
  return (
    <div className="h-3.5 w-full overflow-hidden rounded-full bg-line">
      <motion.div
        className="relative h-full overflow-hidden rounded-full"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 0.7 }}
        style={{ background: color, minWidth: pct > 0 ? '0.875rem' : 0 }}
      >
        <span className="pointer-events-none absolute inset-x-1.5 top-[3px] block h-1 rounded-full bg-surface/40" />
      </motion.div>
    </div>
  )
}
