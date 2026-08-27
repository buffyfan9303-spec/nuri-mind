import { motion } from 'framer-motion'
import type { KeyboardEvent, ReactNode } from 'react'
import { SPRING } from '../../lib/motion'

export function Card({
  children,
  className = '',
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** onClick이 있을 때 스크린리더용 이름(생략 시 내부 텍스트가 읽힘) */
  ariaLabel?: string
}) {
  // 클릭 가능한 카드는 버튼 시맨틱을 갖춰야 키보드(Tab/Enter/Space)·스크린리더로 쓸 수 있다.
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={SPRING.snappy}
      onClick={onClick}
      {...(onClick
        ? {
            role: 'button' as const,
            tabIndex: 0,
            'aria-label': ariaLabel,
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            },
          }
        : {})}
      className={`rounded-3xl bg-surface p-5 shadow-card ${onClick ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mind-500' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
