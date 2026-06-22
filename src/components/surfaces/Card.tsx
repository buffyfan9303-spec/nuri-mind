import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { SPRING } from '../../lib/motion'

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={SPRING.snappy}
      onClick={onClick}
      className={`rounded-3xl bg-surface p-5 shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
