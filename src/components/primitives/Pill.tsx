import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

/** 다이아(유료 재화) Pill — 탭하면 충전 화면으로. 포인트와 구분(💎 하드 / 🪙 소프트) */
export function DiamondPill() {
  const diamonds = useStore((s) => s.diamonds)
  const nav = useNavigate()
  return (
    <motion.button
      key={diamonds}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 1.25 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      onClick={() => nav('/charge')}
      className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold text-[#6E7BF2] shadow-card"
    >
      💎 {diamonds.toLocaleString()}
      <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6E7BF2] text-[11px] leading-none text-white">+</span>
    </motion.button>
  )
}

export function PointsPill() {
  const points = useStore((s) => s.points)
  const streak = useStore((s) => s.streak)
  return (
    <div className="flex items-center gap-1.5">
      {streak > 0 && (
        <span className="flex items-center gap-0.5 rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold text-orange-500 shadow-card">
          🔥{streak}
        </span>
      )}
      <DiamondPill />
      <motion.span
        key={points}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-sm font-extrabold text-mind-700 shadow-card"
      >
        🪙 {points.toLocaleString()}
      </motion.span>
    </div>
  )
}
