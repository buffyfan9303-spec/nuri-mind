import { motion } from 'framer-motion'
import { SPRING } from '../lib/motion'
import { useRef, useState, type ReactNode } from 'react'
import { haptic } from '../lib/haptic'
import { canHover } from '../lib/device'

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
  /** 서버 응답을 기다리는 중 — 눌리지 않고, 글자 자리에 스피너가 돈다(폭은 그대로) */
  busy?: boolean
  /** 방금 실패함 — 한 번 흔들어 '아무 일도 없었다'와 구분한다 */
  error?: boolean
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
  busy = false,
  error = false,
}: Props) {
  const c = COLORS[color]
  // 본문 100%(16px) 기준에 맞춘 버튼 스케일 — 듀오링고식 3D 프레스는 유지하되 두께만 슬림하게
  const pad =
    size === 'lg'
      ? 'px-6 py-3.5 text-[16px]'
      : size === 'sm'
        ? 'px-3.5 py-2 text-[13px]'
        : 'px-5 py-3 text-[15px]'
  const idRef = useRef(0)
  const [bursts, setBursts] = useState<number[]>([])
  const handleClick = () => {
    if (disabled || busy) return
    haptic(7)
    const id = ++idRef.current
    setBursts((b) => [...b, id])
    setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 650)
    onClick?.()
  }
  return (
    <motion.button
      type="button"
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      onClick={handleClick}
      whileTap={disabled || busy ? undefined : { y: 3, boxShadow: `0 0px 0 ${c.sh}` }}
      /**
       * 호버: 2px 들리고 아랫면 그림자가 3→5px로 자란다(들린 만큼 바닥과 멀어진 것) + 자기 색 글로우.
       * 물체가 커지는 게 아니라 '떠오르는' 것으로 읽혀야 눌렀을 때의 내려앉음과 짝이 맞는다.
       * 터치 기기에서는 끈다 — 탭 뒤 호버가 눌어붙어 버튼 하나만 계속 떠 있는 것처럼 보인다.
       */
      whileHover={canHover && !disabled && !busy ? { y: -2, boxShadow: `0 5px 0 ${c.sh}, 0 10px 22px -8px ${c.sh}` } : undefined}
      transition={SPRING.flick}
      className={`relative ${full ? 'w-full' : ''} ${pad} ${error ? 'shake' : ''} whitespace-nowrap rounded-2xl font-extrabold tracking-wide select-none outline-none disabled:opacity-40 disabled:saturate-50 ${className}`}
      style={{ background: c.bg, color: c.fg, boxShadow: `0 3px 0 ${c.sh}`, border: c.border ?? 'none' }}
    >
      {/* 글자를 지우지 않고 투명하게만 둔다 — 지우면 버튼 폭이 줄어 옆 버튼까지 밀린다 */}
      <span className={busy ? 'invisible' : undefined}>{children}</span>
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        </span>
      )}
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
