import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from './Button'
import Avatar from './Avatar'
import { PERSONAS } from '../i18n/animalTranslations'
import type { Avatar as AvatarT } from '../data/types'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { celebrate } from '../lib/confetti'
import { sfx } from '../lib/sound'
import { LEGAL_EFFECTIVE } from '../data/legal'
import { authReady, signInWithKakao, getAuthUser, onAuthChange } from '../lib/auth'

// 시작 캐릭터 후보(귀여운 페르소나) — 검사로 더 모을 수 있음
const STARTERS = ['penguin', 'koala', 'cat', 'dolphin', 'hamster', 'owl', 'meerkat', 'collie']

export default function Onboarding() {
  const t = useT()
  const nav = useNavigate()
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const [nick, setNick] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [kakaoNick, setKakaoNick] = useState<string | null>(null)

  // 카카오 로그인 복귀 시(또는 APK 자동로그인) 닉네임 자동 프리필
  useEffect(() => {
    if (!authReady()) return
    const apply = () =>
      getAuthUser().then((u) => {
        if (u) {
          setKakaoNick(u.nickname || '친구')
          if (u.nickname) setNick((prev) => prev || u.nickname!)
        }
      })
    apply()
    return onAuthChange(apply)
  }, [])

  const doKakao = async () => {
    sfx.tap()
    const r = await signInWithKakao()
    if (!r.ok) alert(t('auth.needSetup'))
  }

  const start = () => {
    if (!nick.trim() || !agreed) return
    const avatar: AvatarT = picked ? { kind: 'animal', persona: picked } : null
    completeOnboarding(nick, avatar)
    celebrate()
    sfx.coin()
  }

  return (
    <div className="bg-dots min-h-dvh">
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-12">
        {/* 환영 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} className="text-center">
          <motion.img src="/icon.svg" alt="" className="mx-auto h-20 w-20 rounded-3xl shadow-pop" animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 3 }} />
          <h1 className="mt-5 break-keep text-[24px] font-extrabold leading-tight tracking-tight">{t('onboard.welcome')}</h1>
          <p className="mt-2.5 break-keep text-[14.5px] font-medium leading-relaxed text-ink-sub">{t('onboard.sub')}</p>
        </motion.div>

        {/* 카카오 간편가입 (주 경로) */}
        {authReady() && (
          <div className="mt-7">
            {kakaoNick ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#FEE500]/90 py-3.5 text-[14px] font-extrabold text-[#3A1D1D]">
                💬 {t('onboard.kakaoReady', { nick: kakaoNick })}
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={doKakao}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] py-4 text-[16px] font-extrabold text-[#3A1D1D] shadow-card"
              >
                💬 {t('onboard.kakao')}
              </motion.button>
            )}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E3EAE5]" />
              <span className="shrink-0 text-[12px] font-bold text-ink-faint">{t('onboard.or')}</span>
              <div className="h-px flex-1 bg-[#E3EAE5]" />
            </div>
          </div>
        )}

        {/* 닉네임 */}
        <div className={authReady() ? '' : 'mt-8'}>
          <label className="px-1 text-[14px] font-extrabold">{t('onboard.nickLabel')}</label>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder={t('onboard.nickPh')}
            maxLength={12}
            autoFocus
            className="mt-2 w-full rounded-2xl border-2 border-[#E3EAE5] bg-white px-4 py-3.5 text-[16px] font-extrabold outline-none focus:border-mind-400"
          />
        </div>

        {/* 시작 캐릭터 */}
        <div className="mt-6">
          <p className="px-1 text-[14px] font-extrabold">{t('onboard.pickLabel')}</p>
          <div className="mt-2.5 grid grid-cols-4 gap-2.5">
            {STARTERS.map((key) => {
              const p = PERSONAS[key]
              const sel = picked === key
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setPicked(sel ? null : key)
                    sfx.tap()
                  }}
                  className="flex aspect-square items-center justify-center rounded-2xl border-2 text-[28px]"
                  style={{ borderColor: sel ? '#4FA882' : '#E9EEEB', background: sel ? '#4FA88216' : '#fff' }}
                >
                  {p.emoji}
                </motion.button>
              )
            })}
          </div>
          <p className="mt-2 px-1 text-[12px] font-medium text-ink-faint">{t('onboard.pickHint')}</p>
        </div>

        <div className="flex-1" />

        {/* 가입 선물 + 시작 */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-mind-50 py-2.5 text-[14px] font-extrabold text-mind-700">
            🎁 {t('onboard.bonus')}
          </div>
          {/* 필수 약관 동의 체크 (실서비스/스토어 심사 대비) */}
          <div className="mb-3 flex items-start gap-2.5 rounded-2xl border-2 border-[#E9EEEB] bg-white px-3.5 py-3">
            <button
              type="button"
              onClick={() => {
                setAgreed((v) => !v)
                sfx.tap()
              }}
              aria-pressed={agreed}
              aria-label={t('onboard.terms') + ' ' + t('onboard.agreeReq')}
              className="mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border-2 transition-colors"
              style={{ borderColor: agreed ? '#4FA882' : '#CBD5D0', background: agreed ? '#4FA882' : '#fff' }}
            >
              {agreed && <span className="text-[13px] font-black leading-none text-white">✓</span>}
            </button>
            <p className="break-keep text-left text-[12.5px] font-medium leading-relaxed text-ink-sub">
              {t('onboard.agreePre')}
              <button type="button" onClick={() => nav('/legal/terms')} className="font-extrabold text-mind-700 underline underline-offset-2">
                {t('onboard.terms')}
              </button>
              <span className="mx-1 text-ink-faint">·</span>
              <button type="button" onClick={() => nav('/legal/privacy')} className="font-extrabold text-mind-700 underline underline-offset-2">
                {t('onboard.privacy')}
              </button>
              {t('onboard.agreeSuf')} <span className="font-extrabold text-mind-600">{t('onboard.agreeReq')}</span>
            </p>
          </div>
          <Button color="mind" size="lg" disabled={!nick.trim() || !agreed} onClick={start}>
            {t('onboard.start')}
          </Button>
          <p className="mt-2.5 px-2 text-center text-[11px] font-medium leading-relaxed text-ink-faint">
            {t('onboard.effective', { date: LEGAL_EFFECTIVE })} · {t('onboard.note')}
          </p>
        </div>
      </main>

      {/* 미리보기 아바타(우상단 작은 표시) */}
      {(picked || nick) && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="pointer-events-none fixed right-5 top-5 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-card">
          <Avatar avatar={picked ? { kind: 'animal', persona: picked } : null} size={26} emojiScale={0.5} />
          <span className="max-w-[90px] truncate text-[13px] font-extrabold">{nick || '친구'}</span>
        </motion.div>
      )}
    </div>
  )
}
