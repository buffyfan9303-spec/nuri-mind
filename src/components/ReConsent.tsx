import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { sfx } from '../lib/sound'
import { LEGAL_VERSION, LEGAL_EFFECTIVE } from '../data/legal'

/**
 * 약관 개정 재동의 — 기존(가입완료) 이용자의 동의 버전이 현재와 다르면 표시.
 * 약관/처리방침을 읽는 동안(/legal)에는 숨겨서 열람을 막지 않음.
 */
export default function ReConsent() {
  const t = useT()
  const nav = useNavigate()
  const loc = useLocation()
  const onboarded = useStore((s) => s.onboarded)
  const consent = useStore((s) => s.consent)
  const acceptConsent = useStore((s) => s.acceptConsent)

  const needs = onboarded && consent?.v !== LEGAL_VERSION
  if (!needs) return null
  if (loc.pathname.startsWith('/legal')) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-pop"
      >
        <div className="text-center text-[34px]">📋</div>
        <h2 className="mt-2 break-keep text-center text-[19px] font-extrabold leading-tight">{t('reconsent.title')}</h2>
        <p className="mt-2 break-keep text-center text-[14px] font-medium leading-relaxed text-ink-sub">{t('reconsent.body')}</p>
        <div className="mt-3 flex items-center justify-center gap-2 text-[13px] font-extrabold">
          <button onClick={() => nav('/legal/terms')} className="text-mind-700 underline underline-offset-2">
            {t('onboard.terms')}
          </button>
          <span className="text-ink-faint">·</span>
          <button onClick={() => nav('/legal/privacy')} className="text-mind-700 underline underline-offset-2">
            {t('onboard.privacy')}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] font-medium text-ink-faint">{t('onboard.effective', { date: LEGAL_EFFECTIVE })}</p>
        <div className="mt-4">
          <Button
            color="mind"
            size="lg"
            onClick={() => {
              acceptConsent()
              sfx.coin()
            }}
          >
            {t('reconsent.agree')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
