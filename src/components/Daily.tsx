import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'
import { Card, Modal } from './ui'
import { QUIZ_BANK, todayQuizIndex } from '../data/quiz'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'
import { localDay } from '../lib/date'

// 스토어의 lastSpinDate/lastQuizDate와 같은 로컬 기준 키 — UTC(toISOString)면 KST 00~09시에 하루 어긋남
const todayStr = () => localDay()

/** 오늘 무료 적립 — 제한 없음(무제한). 오늘 적립량만 가볍게 표시. */
export function DailyCapMeter() {
  const t = useT()
  const freeDate = useStore((s) => s.freeDate)
  const freeAmount = useStore((s) => s.freeAmount)
  const used = freeDate === todayStr() ? freeAmount : 0
  return (
    <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3 text-[13px] font-extrabold text-white">
      <span>⚡ {t('daily.cap')}</span>
      <span className="rounded-full bg-white/25 px-2.5 py-0.5">
        {t('daily.unlimited')} · {used}P
      </span>
    </div>
  )
}

/** 랜덤박스 — 무료 1회 (광고 보너스 박스는 당분간 비활성) */
export function DailySpin() {
  const t = useT()
  const lastSpinDate = useStore((s) => s.lastSpinDate)
  const spin = useStore((s) => s.spin)
  const freeRemaining = useStore((s) => s.freeRemaining)

  const [opening, setOpening] = useState(false)
  const [reward, setReward] = useState<{ rolled: number; granted: number } | null>(null)

  const freeUsed = lastSpinDate === todayStr()
  const allDone = freeUsed
  const capLeft = freeRemaining()

  const doSpin = (viaAd: boolean) => {
    const res = spin(viaAd)
    if (!res) return
    setOpening(true)
    setReward(null)
    sfx.tap()
    setTimeout(() => {
      setOpening(false)
      setReward(res)
      burst()
      sfx.coin()
    }, 1100)
  }

  return (
    <Card className="!p-5">
      <div className="flex items-center gap-3.5">
        <motion.div
          animate={allDone ? {} : { rotate: [0, -6, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, repeatDelay: 1.2 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-adhd-light text-3xl"
        >
          🎁
        </motion.div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16.5px] font-extrabold tracking-tight">{t('spin.title')}</h3>
          <p className="mt-0.5 text-[13.5px] font-bold text-ink-faint">{t('spin.sub')}</p>
        </div>
      </div>

      <div className="mt-3.5 space-y-2.5">
        {capLeft <= 0 && !allDone ? (
          <p className="rounded-2xl bg-surface2 py-3.5 text-center text-[14px] font-bold text-ink-sub">
            {t('daily.capFull')}
          </p>
        ) : allDone ? (
          <p className="rounded-2xl bg-mind-50 py-3.5 text-center text-[14.5px] font-extrabold text-mind-700">
            {t('spin.done')}
          </p>
        ) : (
          <Button color="adhd" onClick={() => doSpin(false)}>
            {t('spin.open')}
          </Button>
        )}
      </div>

      {/* 박스 오픈 연출 */}
      <Modal open={opening || reward !== null} onClose={reward ? () => setReward(null) : undefined}>
        <div className="py-2 text-center">
          {opening ? (
            <motion.div
              animate={{ rotate: [0, -14, 14, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.05 }}
              className="text-7xl"
            >
              🎁
            </motion.div>
          ) : (
            reward && (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -8, 6, 0] }} className="text-7xl">
                  🪙
                </motion.div>
                <h3 className="mt-3 text-[24px] font-extrabold text-mind-700">
                  {t('spin.win', { p: reward.rolled })}
                </h3>
                {reward.granted < reward.rolled && (
                  <p className="mt-1 text-[13.5px] font-bold text-amber-600">
                    {t('spin.capped', { p: reward.granted })}
                  </p>
                )}
                <div className="mt-5">
                  <Button color="mind" onClick={() => setReward(null)}>
                    {t('common.confirm')}
                  </Button>
                </div>
              </>
            )
          )}
        </div>
      </Modal>
    </Card>
  )
}

/** 데일리 심리 퀴즈 — 정답 +5P */
export function DailyQuiz() {
  const t = useT()
  const l = useL()
  const lastQuizDate = useStore((s) => s.lastQuizDate)
  const answerQuiz = useStore((s) => s.answerQuiz)

  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [granted, setGranted] = useState(0)

  const done = lastQuizDate === todayStr()
  const item = QUIZ_BANK[todayQuizIndex()]
  const answered = picked !== null

  const pick = (i: number) => {
    if (answered || done) return
    setPicked(i)
    const correct = i === item.answer
    const g = answerQuiz(correct)
    setGranted(g)
    if (correct) {
      burst()
      sfx.coin()
    } else {
      sfx.err()
    }
  }

  return (
    <Card className="!p-5">
      <div className="flex items-center gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-iq-light text-3xl">🧠</div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16.5px] font-extrabold tracking-tight">{t('quiz.title')}</h3>
          <p className="mt-0.5 text-[13.5px] font-bold text-ink-faint">{t('quiz.sub')}</p>
        </div>
      </div>
      <div className="mt-3.5">
        {done && !open ? (
          <p className="rounded-2xl bg-mind-50 py-3.5 text-center text-[14.5px] font-extrabold text-mind-700">
            {t('quiz.done')}
          </p>
        ) : (
          <Button color="iq" onClick={() => setOpen(true)}>
            {t('quiz.open')}
          </Button>
        )}
      </div>

      <Modal open={open} onClose={answered ? () => setOpen(false) : undefined}>
        <div>
          <h3 className="text-[18px] font-extrabold leading-[1.6] tracking-tight">{l(item.q)}</h3>
          <div className="mt-4 space-y-2.5">
            {item.options.map((op, i) => {
              const isAnswer = i === item.answer
              const isPicked = picked === i
              const show = answered
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className="w-full rounded-2xl border-2 px-4 py-3.5 text-left text-[15.5px] font-bold leading-relaxed"
                  style={{
                    borderColor: show ? (isAnswer ? '#4FA882' : isPicked ? '#EF4444' : '#E3EAE5') : '#E3EAE5',
                    background: show ? (isAnswer ? '#4FA8821A' : isPicked ? '#EF44441A' : 'rgb(var(--surface))') : 'rgb(var(--surface))',
                  }}
                >
                  {show && isAnswer ? '✅ ' : show && isPicked ? '❌ ' : ''}
                  {l(op)}
                </button>
              )
            })}
          </div>

          {answered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <p className="text-center text-[16px] font-extrabold">
                {picked === item.answer
                  ? granted > 0
                    ? t('quiz.correct', { p: granted })
                    : t('quiz.correctCap')
                  : t('quiz.wrong', { a: l(item.options[item.answer]) })}
              </p>
              <p className="mt-2 rounded-2xl bg-surface2 px-4 py-3 text-[14px] font-medium leading-relaxed text-ink-sub">
                💡 {l(item.fact)}
              </p>
              <div className="mt-4">
                <Button color="mind" onClick={() => setOpen(false)}>
                  {t('common.confirm')}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>
    </Card>
  )
}