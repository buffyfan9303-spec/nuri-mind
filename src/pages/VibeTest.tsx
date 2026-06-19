import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
import { Card, ProgressBar, TopBar } from '../components/ui'
import { VIBE_QS, tetoPercent, vibeTypeOf, vibeTypeByKey } from '../data/vibe'
import { makeResultCard, shareCardBlob } from '../lib/shareCard'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { celebrate, burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

type Step = 'intro' | 'run' | 'result'

/** 테토 vs 에겐 — 30초 바이럴 테스트 (유입 펌프 → 정밀 검사 퍼널) */
export default function VibeTest() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const completeVibe = useStore((s) => s.completeVibe)
  const shareRewardAct = useStore((s) => s.shareReward)

  const [step, setStep] = useState<Step>('intro')
  const [idx, setIdx] = useState(0)
  const [teto, setTeto] = useState(0)
  const [pct, setPct] = useState(0)
  const [firstReward, setFirstReward] = useState(0)
  const [shareMsg, setShareMsg] = useState('')

  const start = () => {
    setIdx(0)
    setTeto(0)
    setStep('run')
    sfx.next()
  }

  const pick = (isTeto: boolean) => {
    sfx.tap()
    const nextTeto = teto + (isTeto ? 1 : 0)
    if (idx >= VIBE_QS.length - 1) {
      const p = tetoPercent(nextTeto)
      setPct(p)
      setFirstReward(completeVibe(p))
      setStep('result')
      celebrate()
      sfx.fanfare()
    } else {
      setTeto(nextTeto)
      setIdx(idx + 1)
    }
  }

  const vt = vibeTypeOf(pct)
  const pair = vibeTypeByKey(vt.pairKey)

  const shareCard = async () => {
    try {
      const blob = await makeResultCard({
        emoji: vt.emoji,
        name: l(vt.name),
        title: l(vt.tagline),
        topPercent: pct,
        testName: t('vibe.title'),
        grad: vt.grad,
        appName: t('app.name'),
        chipText: `${t('vibe.teto')} ${pct}% : ${t('vibe.egen')} ${100 - pct}%`,
      })
      const how = await shareCardBlob(blob, `[${t('app.name')}] ${t('vibe.homeDone', { p: pct })} — ${l(vt.name)}! ${window.location.origin}/vibe`)
      const g = shareRewardAct('vibe-card')
      setShareMsg(how === 'downloaded' ? t('share.saved') : '✅')
      if (g > 0) {
        burst()
        sfx.coin()
        setShareMsg(t('share.earned', { p: g }))
      }
      setTimeout(() => setShareMsg(''), 2200)
    } catch {
      sfx.err()
    }
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t('vibe.title')} />
      <main className="mx-auto max-w-md px-5">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div
                className="rounded-3xl p-7 text-center shadow-pop"
                style={{ background: 'linear-gradient(135deg, #FF6F61, #FFB020)' }}
              >
                <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">
                  🔥🫧
                </motion.div>
                <span className="mt-3 inline-block rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                  {t('vibe.badge')}
                </span>
                <h1 className="mt-2 text-[27px] font-extrabold tracking-tight text-white">{t('vibe.title')}</h1>
                <p className="mt-2 text-[15px] font-bold leading-relaxed text-white/90">{t('vibe.desc')}</p>
                <p className="mt-3 text-[13px] font-extrabold text-white/85">{t('vibe.meta')}</p>
              </div>

              <div className="mt-5">
                <Button color="ego" size="lg" onClick={start}>
                  {t('common.start')} →
                </Button>
              </div>
              <p className="mt-3 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('vibe.fun')}</p>
            </motion.div>
          )}

          {step === 'run' && (
            <motion.div key={`q${idx}`} initial={{ x: 70, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -70, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar value={idx / VIBE_QS.length} color="#FF6F61" />
                </div>
                <span className="text-[13.5px] font-extrabold text-ink-faint">
                  {idx + 1}/{VIBE_QS.length}
                </span>
              </div>
              <h1 className="mt-8 text-center text-[21px] font-extrabold leading-[1.6] tracking-tight">
                {l(VIBE_QS[idx].q)}
              </h1>
              <div className="mt-8 space-y-3.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pick(true)}
                  className="w-full rounded-2xl border-2 border-[#FFD2B0] bg-adhd-light dark:bg-surface2 px-5 py-5 text-left text-[16.5px] font-extrabold leading-relaxed"
                  style={{ boxShadow: '0 3px 0 #F2C9A4' }}
                >
                  🔥 {l(VIBE_QS[idx].a)}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pick(false)}
                  className="w-full rounded-2xl border-2 border-[#BFD9F2] bg-sky2-100 dark:bg-surface2 px-5 py-5 text-left text-[16.5px] font-extrabold leading-relaxed"
                  style={{ boxShadow: '0 3px 0 #A9C9EE' }}
                >
                  🫧 {l(VIBE_QS[idx].b)}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
              <div
                className="rounded-3xl p-7 text-center shadow-pop"
                style={{ background: `linear-gradient(140deg, ${vt.grad[0]}, ${vt.grad[1]})` }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 8, 0] }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-5xl shadow-pop"
                >
                  {vt.emoji}
                </motion.div>
                <p className="mt-3 text-[14px] font-extrabold tracking-wide text-white/85">{t('vibe.myVibe')}</p>
                <h1 className="mt-0.5 text-[30px] font-extrabold tracking-tight text-white">{l(vt.name)}</h1>
                <p className="mt-2 text-[15px] font-bold leading-relaxed text-white/95">“{l(vt.tagline)}”</p>
                {firstReward > 0 && (
                  <span className="mt-3 inline-block rounded-full bg-white/25 px-3.5 py-1.5 text-[13.5px] font-extrabold text-white">
                    🪙 {t('vibe.first')}
                  </span>
                )}
              </div>

              {/* 테토:에겐 게이지 */}
              <Card className="mt-4">
                <div className="flex items-center justify-between text-[14.5px] font-extrabold">
                  <span style={{ color: '#FF6F61' }}>🔥 {t('vibe.teto')} {pct}%</span>
                  <span style={{ color: '#5E97D6' }}>{100 - pct}% {t('vibe.egen')} 🫧</span>
                </div>
                <div className="mt-2 flex h-5 overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 110, damping: 20, delay: 0.3 }}
                    className="h-full"
                    style={{ background: 'linear-gradient(90deg, #FF6F61, #FFB020)' }}
                  />
                  <div className="h-full flex-1" style={{ background: 'linear-gradient(90deg, #A9C9EE, #8FB8E8)' }} />
                </div>
                <p className="mt-4 text-[15px] font-medium leading-[1.8] tracking-wide text-ink">{l(vt.desc)}</p>
                <p className="mt-3 rounded-2xl bg-surface2 px-4 py-3 text-center text-[14.5px] font-extrabold text-ink-sub">
                  💘 {t('vibe.pair')}: {pair.emoji} {l(pair.name)}
                </p>
              </Card>

              {/* 공유 + 퍼널 */}
              <Card className="mt-4 text-center">
                <h2 className="text-[16px] font-extrabold tracking-tight">💎 {t('share.title')}</h2>
                {shareMsg && (
                  <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[14.5px] font-extrabold text-mind-700">
                    ✅ {shareMsg}
                  </motion.p>
                )}
                <div className="mt-3.5">
                  <Button color="sky" onClick={shareCard}>
                    {t('share.card')}
                  </Button>
                </div>
              </Card>

              <div className="mt-4">
                <AdSlot variant="banner" />
              </div>

              <div className="mt-4 space-y-2.5">
                <Button color="mind" size="lg" onClick={() => nav('/test/ego')}>
                  {t('vibe.go')}
                </Button>
                <Button color="white" onClick={start}>
                  🔄 {t('vibe.retry')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
