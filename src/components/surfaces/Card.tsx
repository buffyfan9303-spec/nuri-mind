import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { KeyboardEvent, ReactNode } from 'react'
import { SPRING, tapPop } from '../../lib/motion'

/** 누름: 곧장 줄고(pressIn) 떼면 살짝 튀며 복귀(press) — Button·칩과 같은 손맛 */
const CARD_TAP = tapPop
import { canHover } from '../../lib/device'

export function Card({
  children,
  className = '',
  onClick,
  ariaLabel,
  href,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** onClick이 있을 때 스크린리더용 이름(생략 시 내부 텍스트가 읽힘) */
  ariaLabel?: string
  /**
   * 주소로 가는 카드 — 버튼 대신 진짜 <a href>로 그린다. 크롤러는 onClick을 따라가지 않아
   * 목록에서 상세(매거진 아티클 등)로 가는 길이 버튼뿐이면 상세 페이지가 발견되지 않는다.
   */
  href?: string
}) {
  if (href) {
    return (
      <Link
        to={href}
        aria-label={ariaLabel}
        className="block rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mind-500"
      >
        <motion.div
          whileTap={CARD_TAP}
          whileHover={canHover ? { y: -3, boxShadow: '0 10px 26px -10px rgba(31, 61, 47, 0.38)' } : undefined}
          transition={SPRING.press}
          className={`cursor-pointer rounded-3xl bg-surface p-5 shadow-card ${className}`}
        >
          {children}
        </motion.div>
      </Link>
    )
  }
  // 클릭 가능한 카드는 버튼 시맨틱을 갖춰야 키보드(Tab/Enter/Space)·스크린리더로 쓸 수 있다.
  return (
    <motion.div
      whileTap={onClick ? CARD_TAP : undefined}
      // 누를 수 있는 카드만 떠오른다 — 장식 카드가 따라 뜨면 '누를 수 있음'의 신호가 희석된다
      whileHover={canHover && onClick ? { y: -3, boxShadow: '0 10px 26px -10px rgba(31, 61, 47, 0.38)' } : undefined}
      transition={SPRING.press}
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
