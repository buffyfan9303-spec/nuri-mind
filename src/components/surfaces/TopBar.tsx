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
  historyBack,
}: {
  title?: string
  back?: string | (() => void)
  right?: ReactNode
  transparent?: boolean
  /** 진입점이 여러 곳인 화면 — 앱 안 이전 화면이 있으면 그리로(react-router history.state.idx), 없으면 back 경로 */
  historyBack?: boolean
}) {
  const nav = useNavigate()
  const t = useT()
  return (
    <div
      className={`sticky top-[env(safe-area-inset-top)] z-30 flex h-14 items-center gap-2 px-3 ${
        transparent ? '' : 'bg-cream'
      }`}
    >
      {back !== undefined && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            typeof back === 'function'
              ? back()
              : historyBack && ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0
                ? nav(-1)
                : back
                  ? nav(back)
                  : nav(-1)
          }
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
