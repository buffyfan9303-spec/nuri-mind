import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PointsPill } from '../primitives/Pill'
import { useT } from '../../i18n/useT'

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
  const t = useT()
  return (
    <div
      className={`sticky top-0 z-30 flex h-14 items-center gap-2 px-3 ${
        transparent ? '' : 'bg-cream/90 backdrop-blur'
      }`}
    >
      {back !== undefined && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => (typeof back === 'function' ? back() : back ? nav(back) : nav(-1))}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-ink-sub"
          // 영어 'back'을 그대로 읽으면 한국어 스크린리더가 '백'으로 읽는다
          aria-label={t('common.back')}
        >
          <span aria-hidden="true">←</span>
        </motion.button>
      )}
      <div className="flex-1 truncate text-[20px] font-extrabold tracking-tight">{title}</div>
      {right ?? <PointsPill />}
    </div>
  )
}
