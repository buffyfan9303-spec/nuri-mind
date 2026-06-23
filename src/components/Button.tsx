import { motion } from 'framer-motion'
import { useRef, useState, type ReactNode } from 'react'
import { haptic } from '../lib/haptic'

export type BtnColor = 'mind' | 'sky' | 'adhd' | 'ego' | 'iq' | 'love' | 'burn' | 'dopa' | 'reso' | 'dk' | 'white' | 'danger'

const COLORS: Record<BtnColor, { bg: string; sh: string; fg: string; border?: string }> = {
  mind: { bg: '#4FA882', sh: '#2F6B52', fg: '#FFFFFF' },
  sky: { bg: '#6E9FDC', sh: '#46699A', fg: '#FFFFFF' },
  adhd: { bg: '#FFB020', sh: '#C77F00', fg: '#FFFFFF' },
  ego: { bg: '#FF6F61', sh: '#C2453A', fg: '#FFFFFF' },
  iq: { bg: '#6E7BF2', sh: '#4350B8', fg: '#FFFFFF' },
  love: { bg: '#F25C8E', sh: '#B83863', fg: '#FFFFFF' },
  burn: { bg: '#8B7CF6', sh: '#5B49C4', fg: '#FFFFFF' },
  dopa: { bg: '#12A5C2', sh: '#0B7186', fg: '#FFFFFF' },
  reso: { bg: '#10B981', sh: '#0B7A55', fg: '#FFFFFF' },
  dk: { bg: '#A23E63', sh: '#722B47', fg: '#FFFFFF' },
  white: { bg: 'rgb(var(--surface))', sh: 'rgb(var(--line))', fg: 'rgb(var(--text))', border: '2px solid rgb(var(--line))' },
  danger: { bg: '#EF4444', sh: '#B91C1C', fg: '#FFFFFF' },
}

// 누르면 퍼지는 작은 반짝이(듀오링고식 보상감) — 버튼마다 자동
const SPARKS = [
  { x: -42, y: -18, e: '✨' },
  { x: 44, y: -20, e: '⭐' },
  { x: -26, y: 20, e: '💫' },
  { x: 30, y: 22, e: '✨' },
  { x: 0, y: -32, e: '⭐' },
]

interface Props {
  children: ReactNode
  onClick?: () => void
  color?: BtnColor
  size?: 'md' | 'sm' | 'lg'
  disabled?: boolean
  full?: boolean
  className?: string
}

/** 듀오링고식 3D 프레스 버튼 — 아랫면 그림자가 눌리며 들어가는 촉감 */
export default function Button({
  children,
  onClick,
  color = 'mind',
  size = 'md',
  disabled,
  full = true,
  className = '',
}: Props) {
  const c = COLORS[color]
  // 본문 100%(16px) 기준에 맞춘 버튼 스케일 — 듀오링고식 3D 프레스는 유지하되 두께만 슬림하게
  const pad =
    size === 'lg'
      ? 'px-6 py-3.5 text-[16px]'
      : size === 'sm'
        ? 'px-3.5 py-2 text-[13.5px]'
        : 'px-5 py-3 text-[15px]'
  const idRef = useRef(0)
  const [bursts, setBursts] = useState<number[]>([])
  const handleClick = () => {
    if (disabled) return
    haptic(7)
    const id = ++idRef.current
    setBursts((b) => [...b, id])
    setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 650)
    onClick?.()
  }
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      whileTap={disabled ? undefined : { y: 3, boxShadow: `0 0px 0 ${c.sh}` }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={`relative ${full ? 'w-full' : ''} ${pad} whitespace-nowrap rounded-2xl font-extrabold tracking-wide select-none outline-none disabled:opacity-40 disabled:saturate-50 ${className}`}
      style={{ background: c.bg, color: c.fg, boxShadow: `0 3px 0 ${c.sh}`, border: c.border ?? 'none' }}
    >
      {children}
      {bursts.map((id) => (
        <span key={id} className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          {SPARKS.map((sp, i) => (
            <motion.span
              key={i}
              className="absolute leading-none"
              style={{ fontSize: 13 }}
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.95 }}
              animate={{ x: sp.x, y: sp.y, scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {sp.e}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.button>
  )
}
