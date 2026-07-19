import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { haptic } from '../lib/haptic'

/**
 * 풀스크린 축하 오버레이 — 리그 승급·등급 상승 등 큰 성취의 순간(듀오링고식 테이크오버).
 * 파티클 링 + 대형 이모지 바운스 + 텍스트 스태거. 탭하거나 3.6초 후 자동 닫힘.
 * confetti/sfx는 호출부에서 fire('levelup')로 함께 터뜨린다(연출 단일출처 유지).
 */
export default function Celebration({
  open,
  emoji,
  title,
  subtitle,
  grad = ['#6E7BF2', '#A88BF2'],
  onClose,
}: {
  open: boolean
  emoji: string
  title: string
  subtitle?: string
  grad?: [string, string]
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    haptic([12, 40, 18])
    const tm = setTimeout(onClose, 3600)
    return () => clearTimeout(tm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-8 backdrop-blur-[2px]"
          role="dialog"
          aria-label={title}
        >
          <motion.div
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 17 }}
            className="w-full max-w-[320px] rounded-[28px] p-8 text-center text-white shadow-pop"
            style={{ background: `linear-gradient(150deg, ${grad[0]}, ${grad[1]})` }}
          >
            <div className="relative mx-auto h-28 w-28">
              {[
                { e: '✨', a: -90 }, { e: '⭐', a: -45 }, { e: '💫', a: 0 }, { e: '✨', a: 45 },
                { e: '⭐', a: 90 }, { e: '💫', a: 135 }, { e: '✨', a: 180 }, { e: '⭐', a: 225 },
              ].map((s, i) => {
                const rad = (s.a * Math.PI) / 180
                return (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 text-[20px] leading-none"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ x: Math.cos(rad) * 88, y: Math.sin(rad) * 88, scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.05, delay: 0.3 + i * 0.03, ease: 'easeOut' }}
                  >
                    {s.e}
                  </motion.span>
                )
              })}
              <motion.div
                initial={{ scale: 0, rotate: -18 }}
                animate={{ scale: 1, rotate: [0, -10, 8, 0] }}
                transition={{ type: 'spring', stiffness: 240, damping: 11, delay: 0.16 }}
                className="flex h-28 w-28 items-center justify-center rounded-full bg-white/90 text-6xl shadow-pop"
              >
                {emoji}
              </motion.div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 320, damping: 18 }}
              className="mt-5 break-keep text-[24px] font-extrabold tracking-tight"
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52, duration: 0.3 }}
                className="mt-2 break-keep text-[14px] font-bold text-white/90"
              >
                {subtitle}
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-5 text-[12px] font-bold text-white/70"
            >
              👆
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
