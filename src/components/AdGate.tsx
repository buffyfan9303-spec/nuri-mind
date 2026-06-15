import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdSlot from './AdSlot'
import Button from './Button'
import { useT } from '../i18n/useT'
import { showInterstitial } from '../lib/ads'

const WAIT_SEC = 5

/**
 * 전면 광고 게이트 — 검사 완료 → 결과 공개 사이의 수익화 지점.
 * 카운트다운 동안 통계 연산 연출로 이탈감을 줄이고, APK에서는 AdMob 전면광고로 대체.
 */
export default function AdGate({ onDone }: { onDone: () => void }) {
  const t = useT()
  const [left, setLeft] = useState(WAIT_SEC)

  useEffect(() => {
    showInterstitial()
    const iv = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F3F30]/95 px-5 backdrop-blur"
    >
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="mb-3 text-5xl"
          >
            🧠
          </motion.div>
          <h2 className="text-xl font-extrabold text-white">{t('gate.title')}</h2>
          <p className="mt-1 text-sm font-medium tracking-wide text-mind-200">{t('gate.sub')}</p>
        </div>

        <AdSlot variant="rect" />

        <p className="mt-3 text-center text-xs font-bold text-mind-300">{t('gate.adNote')}</p>

        <div className="mt-5">
          {left > 0 ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/10 py-3.5 font-extrabold text-white">
              <svg className="h-6 w-6 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#ffffff33" strokeWidth="4" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  animate={{ strokeDashoffset: [0, 2 * Math.PI * 15] }}
                  transition={{ duration: WAIT_SEC, ease: 'linear' }}
                />
              </svg>
              {left}s
            </div>
          ) : (
            <Button color="mind" size="lg" onClick={onDone}>
              {t('gate.continue')} →
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
