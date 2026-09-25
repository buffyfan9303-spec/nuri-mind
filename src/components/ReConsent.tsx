import { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SPRING } from '../lib/motion'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { sfx } from '../lib/sound'
import { LEGAL_VERSION, LEGAL_EFFECTIVE } from '../data/legal'
import { lockScroll, unlockScroll } from '../lib/scrollLock'
import { useDialogFocus } from '../hooks/useDialogFocus'
import Emoji from './Emoji'

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
  const show = needs && !loc.pathname.startsWith('/legal')
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // 전면 게이트인데 예전엔 모달 계약이 하나도 없었다 — 뒤 화면이 스크롤되고, Tab이 뒤 화면 버튼으로 새고,
  // 스크린리더는 이게 대화상자인 줄 몰랐다. Modal과 같은 잠금·포커스 계약을 건다.
  useEffect(() => {
    if (!show) return
    lockScroll()
    return unlockScroll
  }, [show])
  useDialogFocus(show, panelRef)

  return (
    // 조기 return 대신 AnimatePresence — 동의를 누르면 오버레이가 한 프레임에 증발하지 않고 걷힌다
    <AnimatePresence>
    {show && (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-scroll-lock
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 28, opacity: 0, transition: SPRING.exit }}
        transition={SPRING.ui}
        className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-pop"
      >
        <div className="text-center leading-none"><Emoji e="📋" size={28} className="align-top" /></div>
        <h2 id={titleId} className="mt-2 break-keep text-center text-[20px] font-extrabold leading-tight">{t('reconsent.title')}</h2>
        <p className="mt-2 break-keep text-center text-[14px] font-bold leading-relaxed text-ink-sub">{t('reconsent.body')}</p>
        <div className="mt-3 flex items-center justify-center gap-2 text-[13px] font-extrabold">
          <button onClick={() => nav('/legal/terms')} className="text-mind-700 underline underline-offset-2">
            {t('onboard.terms')}
          </button>
          <span className="text-ink-faint">·</span>
          <button onClick={() => nav('/legal/privacy')} className="text-mind-700 underline underline-offset-2">
            {t('onboard.privacy')}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] font-bold text-ink-faint">{t('onboard.effective', { date: LEGAL_EFFECTIVE })}</p>
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
    )}
    </AnimatePresence>
  )
}
