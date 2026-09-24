import { motion } from 'framer-motion'
import { press3d } from '../lib/motion'
import { useRef, useState, type ReactNode } from 'react'
import { haptic } from '../lib/haptic'
import { canHover } from '../lib/device'
import Emoji from './Emoji'

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
  /**
   * 버튼 스케일 — 높이를 min-h로 고정하고 글자는 leading-none + flex 가운데 정렬.
   * 줄높이(1.65)에 기대던 예전 방식은 글꼴이 바뀌면(나눔스퀘어라운드는 위아래 여백 비율이 다르다)
   * 글자가 위로 뜬다. 높이는 예전 값(sm 36 · md 48 · lg 54)을 그대로 지켜 레이아웃은 움직이지 않는다.
   * 아랫면 깊이(depth)도 크기별로 — 누르면 정확히 그만큼 내려앉는다(듀오링고식).
   */
  const pad =
    size === 'lg'
      ? 'min-h-[54px] px-6 text-[16px]'
      : size === 'sm'
        ? 'min-h-[36px] px-3.5 text-[13px]'
        : 'min-h-[48px] px-5 text-[15px]'
  const depth = size === 'sm' ? 3 : 4
  // 두 번째 그림자(글로우)는 평소 투명으로 자리만 잡아 둔다 — 그림자 개수가 같아야 framer가 호버↔평소를 보간한다
  const p = press3d(depth, c.sh, '0 0 0 transparent')
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
      whileTap={disabled || busy ? undefined : p.whileTap}
      /**
       * 호버: 2px 들리고 아랫면이 깊이+2px로 자란다(들린 만큼 바닥과 멀어진 것) + 자기 색 글로우.
       * 물체가 커지는 게 아니라 '떠오르는' 것으로 읽혀야 눌렀을 때의 내려앉음과 짝이 맞는다.
       * 터치 기기에서는 끈다 — 탭 뒤 호버가 눌어붙어 버튼 하나만 계속 떠 있는 것처럼 보인다.
       */
      whileHover={canHover && !disabled && !busy ? { y: -2, boxShadow: `0 ${depth + 2}px 0 ${c.sh}, 0 10px 22px -8px ${c.sh}` } : undefined}
      // 누를 땐 pressIn(곧장 바닥까지), 떼면 press(살짝 튀며 복귀) — lib/motion.press3d
      transition={p.transition}
      className={`relative inline-flex items-center justify-center ${full ? 'w-full' : ''} ${pad} ${error ? 'shake' : ''} whitespace-nowrap rounded-2xl font-extrabold leading-none select-none outline-none disabled:opacity-40 disabled:saturate-50 ${className}`}
      style={{ background: c.bg, color: c.fg, boxShadow: p.rest, border: c.border ?? 'none' }}
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
              className="absolute flex leading-none"
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.95 }}
              animate={{ x: sp.x, y: sp.y, scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Emoji e={sp.e} size={14} />
            </motion.span>
          ))}
        </span>
      ))}
    </motion.button>
  )
}
