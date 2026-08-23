import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

/** 숫자 스프링 카운트업 — 잔액이 점프하지 않고 촤르륵 굴러가는 네이티브 감. 동작 줄이기 설정 시 즉시 표시 */
function useCountUp(value: number) {
  const reduced = useReducedMotion()
  const spring = useSpring(value, { stiffness: 110, damping: 22 })
  useEffect(() => {
    if (reduced) spring.jump(value)
    else spring.set(value)
  }, [value, reduced, spring])
  return useTransform(spring, (v) => Math.round(v).toLocaleString())
}

/** 다이아(유료 재화) Pill — 탭하면 충전 화면으로. 포인트와 구분(💎 하드 / 🪙 소프트) */
export function DiamondPill() {
  const diamonds = useStore((s) => s.diamonds)
  const diaText = useCountUp(diamonds)
  const nav = useNavigate()
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => nav('/charge')}
      className="flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-sm font-extrabold text-[#6E7BF2] shadow-card"
    >
      💎 <motion.span>{diaText}</motion.span>
      <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6E7BF2] text-[11px] leading-none text-white">+</span>
    </motion.button>
  )
}

export function PointsPill({ showStreak = true }: { showStreak?: boolean } = {}) {
  const points = useStore((s) => s.points)
  const pointsText = useCountUp(points)
  const streak = useStore((s) => s.streak)
  return (
    <div className="flex items-center gap-1">
      {showStreak && streak > 0 && (
        <span className="flex items-center gap-0.5 rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold text-orange-500 shadow-card">
          🔥{streak}
        </span>
      )}
      <DiamondPill />
      <span className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold text-mind-700 shadow-card">
        🪙 <motion.span>{pointsText}</motion.span>
      </span>
    </div>
  )
}
