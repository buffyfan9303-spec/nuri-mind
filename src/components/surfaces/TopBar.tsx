import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PointsPill } from '../primitives/Pill'

export function TopBar({
  title,
  back,
  right,
  transparent,
}: {
  title?: string
  back?: string | (() => void)
  right?: ReactNode
  transparent?: boolean
}) {
  const nav = useNavigate()
  return (
    <div
      className={`sticky top-0 z-30 flex h-14 items-center gap-2 px-3 ${
        transparent ? '' : 'bg-cream/90 backdrop-blur'
      }`}
    >
      {back !== undefined && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => (typeof back === 'function' ? back() : back ? nav(back) : nav(-1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-ink-sub"
          aria-label="back"
        >
          ←
        </motion.button>
      )}
      <div className="flex-1 truncate text-[19px] font-extrabold tracking-tight">{title}</div>
      {right ?? <PointsPill />}
    </div>
  )
}
