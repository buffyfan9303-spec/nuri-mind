import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { press3d } from '../../lib/motion'
import { darken } from '../../lib/color'

/**
 * 답안 카드 — 듀오링고 문항 화면의 보기 버튼 패턴.
 *  · 평소: 흰 면 + 2px 테두리 + 아랫면(ledge) 4px → '누를 수 있는 물체'로 읽힌다
 *  · 누름: 아랫면 깊이만큼 곧장 내려앉는다(press3d — Button과 같은 손맛)
 *  · 선택: 검사 색으로 테두리·옅은 면·짙은 아랫면(같은 색조) — 무엇을 골랐는지 색만으로도 읽힌다
 *
 * 정답/오답 색은 쓰지 않는다 — 심리검사엔 정답이 없고, IQ도 진행 중엔 정오를 보여 주지 않는다.
 * aria-pressed로 선택 상태를 보조기기에도 알린다.
 */
export function AnswerCard({
  children,
  onClick,
  selected = false,
  accent = '#4FA882',
  className = '',
  depth = 4,
}: {
  children: ReactNode
  onClick: () => void
  selected?: boolean
  /** 검사 색(hex) — 선택 테두리·면·아랫면에 쓴다 */
  accent?: string
  className?: string
  depth?: number
}) {
  const edge = selected ? darken(accent, 0.18) : 'rgb(var(--ledge))'
  const p = press3d(depth, edge)
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileTap={p.whileTap}
      // 고르는 순간 한 번 '톡' — 선택이 손끝에서 확정됐다는 신호(pop 프리셋과 같은 크기감)
      animate={selected ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ ...p.transition, scale: { duration: 0.26, ease: 'easeOut' } }}
      className={`relative w-full rounded-2xl border-2 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mind-500 ${className}`}
      style={{
        borderColor: selected ? accent : 'rgb(var(--line))',
        background: selected ? `${accent}1A` : 'rgb(var(--surface))',
        boxShadow: p.rest,
      }}
    >
      {children}
    </motion.button>
  )
}
