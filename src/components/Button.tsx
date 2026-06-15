import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

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
  white: { bg: '#FFFFFF', sh: '#D8E0DA', fg: '#33413A', border: '2px solid #E3EAE5' },
  danger: { bg: '#EF4444', sh: '#B91C1C', fg: '#FFFFFF' },
}

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
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { y: 3, boxShadow: `0 0px 0 ${c.sh}` }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={`${full ? 'w-full' : ''} ${pad} whitespace-nowrap rounded-2xl font-extrabold tracking-wide select-none outline-none disabled:opacity-40 disabled:saturate-50 ${className}`}
      style={{ background: c.bg, color: c.fg, boxShadow: `0 3px 0 ${c.sh}`, border: c.border ?? 'none' }}
    >
      {children}
    </motion.button>
  )
}
