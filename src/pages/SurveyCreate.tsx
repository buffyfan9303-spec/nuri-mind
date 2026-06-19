import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Card, Chip, Modal, ProgressBar, TopBar } from '../components/ui'
import type { SurveyQ, SurveyQType } from '../data/types'
import { uid } from '../lib/random'
import { TIERS, lifetimeOf, tierAtLeast } from '../data/rank'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { celebrate } from '../lib/confetti'
import { sfx } from '../lib/sound'

const EMOJIS = ['📋', '☕', '🎮', '🛒', '💪', '🎬', '💄', '🍔', '✈️', '🐶', '📚', '💸']
const TYPES: { type: SurveyQType; icon: string }[] = [
  { type: 'single', icon: '🔘' },
  { type: 'multi', icon: '☑️' },
  { type: 'scale', icon: '📊' },
  { type: 'text', icon: '✍️' },
]

export default function SurveyCreate() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const submitSurvey = useStore((s) => s.submitSurvey)
  const ledger = useStore((s) => s.ledger)
  const canCreate = tierAtLeast(lifetimeOf(ledger), 'bronze')
  const bronze = TIERS.find((x) => x.id === 'bronze')!

  const [step, setStep] = useState(0)
  const [emoji, setEmoji] = useState('📋')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [questions, setQuestions] = useState<SurveyQ[]>([])
  const [reward, setReward] = useState(50)
  const [target, setTarget] = useState(100)
  const [doneOpen, setDoneOpen] = useState(false)

  const addQ = (type: SurveyQType) => {
    sfx.tap()
    setQuestions((p) => [
      ...p,
      {
        id: uid('q_'),
        type,
        text: '',
        options: type === 'single' || type === 'multi' ? ['', ''] : undefined,
        required: true,
      },
    ])
  }
  const patchQ = (qid: string, patch: Partial<SurveyQ>) =>
    setQuestions((p) => p.map((q) => (q.id === qid ? { ...q, ...patch } : q)))
  const delQ = (qid: string) => setQuestions((p) => p.filter((q) => q.id !== qid))

  const step1Ok = title.trim().length >= 2
  const step2Ok =
    questions.length >= 1 &&
    questions.every(
      (q) =>
        q.text.trim().length > 0 &&
        (q.type === 'scale' || q.type === 'text' || (q.options && q.options.filter((o) => o.trim()).length >= 2)),
    )

  const submit = () => {
    submitSurvey({
      emoji,
      title: title.trim(),
      desc: desc.trim(),
      questions: questions.map((q) => ({ ...q, options: q.options?.filter((o) => o.trim()) })),
      reward,
      target,
    })
    celebrate()
    sfx.coin()
    setDoneOpen(true)
  }

  const stepTitles = [t('create.step1'), t('create.step2'), t('create.step3')]

  /* 등급 게이트 — 설문 등록은 브론즈부터 (어뷰징 방지 + 등급 동기 부여) */
  if (!canCreate) {
    return (
      <div className="min-h-dvh pb-12">
        <TopBar back="/rewards" title={t('create.title')} />
        <div className="mx-auto max-w-md px-5 pt-14 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -8, 6, 0] }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="text-6xl"
          >
            🔒
          </motion.div>
          <h1 className="mt-5 text-[21px] font-extrabold leading-relaxed tracking-tight">
            {t('create.lock', { tier: `${bronze.emoji} ${l(bronze.name)}` })}
          </h1>
          <p className="mt-3 text-[15px] font-medium leading-relaxed tracking-wide text-ink-sub">
            {t('create.lockDesc')}
          </p>
          <div className="mx-auto mt-7 max-w-[280px] space-y-3">
            <Button color="mind" size="lg" onClick={() => nav('/rank')}>
              🏅 {t('create.lockGo')}
            </Button>
            <Button color="white" onClick={() => nav('/rewards')}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-12">
      <TopBar back={step === 0 ? '/rewards' : () => setStep(step - 1)} title={t('create.title')} />
      <main className="mx-auto max-w-md px-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={(step + 1) / 3} />
          </div>
          <span className="text-xs font-extrabold text-ink-faint">
            {step + 1}/3 · {stepTitles[step]}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {step === 0 && (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="px-1 text-sm font-extrabold">{t('create.emoji')}</label>
                  <div className="mt-2 grid grid-cols-6 gap-2">
                    {EMOJIS.map((e) => (
                      <motion.button
                        key={e}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          setEmoji(e)
                          sfx.tap()
                        }}
                        className="flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl"
                        style={{
                          borderColor: emoji === e ? '#4FA882' : '#E3EAE5',
                          background: emoji === e ? '#4FA8821A' : '#fff',
                        }}
                      >
                        {e}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="px-1 text-sm font-extrabold">{t('create.name')}</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('create.namePh')}
                    maxLength={40}
                    className="mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3.5 text-[15px] font-bold outline-none focus:border-mind-400"
                  />
                </div>
                <div>
                  <label className="px-1 text-sm font-extrabold">{t('create.desc')}</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={t('create.descPh')}
                    rows={3}
                    maxLength={120}
                    className="mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[14px] font-medium leading-relaxed outline-none focus:border-mind-400"
                  />
                </div>
                <Button color="mind" size="lg" disabled={!step1Ok} onClick={() => setStep(1)}>
                  {t('common.next')} →
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="mt-6">
                <div className="grid grid-cols-4 gap-2">
                  {TYPES.map(({ type, icon }) => (
                    <motion.button
                      key={type}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => addQ(type)}
                      className="rounded-2xl border-2 border-line bg-surface px-1 py-3 text-center"
                    >
                      <div className="text-xl">{icon}</div>
                      <div className="mt-1 text-[10px] font-extrabold text-ink-sub">{t(`create.type.${type}`)}</div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 space-y-3.5">
                  {questions.length === 0 && (
                    <Card className="py-10 text-center text-sm font-bold text-ink-faint">⬆️ {t('create.addQ')}</Card>
                  )}
                  {questions.map((q, qi) => (
                    <Card key={q.id} className="!p-4">
                      <div className="flex items-center justify-between">
                        <Chip tone="blue">
                          Q{qi + 1} · {t(`create.type.${q.type}`)}
                        </Chip>
                        <button onClick={() => delQ(q.id)} className="text-sm font-bold text-red-400">
                          ✕ {t('common.delete')}
                        </button>
                      </div>
                      <textarea
                        value={q.text}
                        onChange={(e) => patchQ(q.id, { text: e.target.value })}
                        placeholder={t('create.qPh')}
                        rows={2}
                        className="mt-3 w-full rounded-xl border-2 border-line bg-surface px-3.5 py-2.5 text-[14px] font-bold leading-relaxed outline-none focus:border-mind-400"
                      />
                      {(q.type === 'single' || q.type === 'multi') && (
                        <div className="mt-2 space-y-2">
                          {q.options?.map((op, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-ink-faint">{oi + 1}.</span>
                              <input
                                value={op}
                                onChange={(e) =>
                                  patchQ(q.id, { options: q.options!.map((x, i) => (i === oi ? e.target.value : x)) })
                                }
                                placeholder={t('create.optPh')}
                                className="flex-1 rounded-xl border-2 border-line bg-surface px-3 py-2 text-[13px] font-bold outline-none focus:border-mind-400"
                              />
                              {q.options!.length > 2 && (
                                <button
                                  onClick={() => patchQ(q.id, { options: q.options!.filter((_, i) => i !== oi) })}
                                  className="text-ink-faint"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          {q.options!.length < 8 && (
                            <button
                              onClick={() => patchQ(q.id, { options: [...q.options!, ''] })}
                              className="text-xs font-extrabold text-mind-600"
                            >
                              {t('create.addOpt')}
                            </button>
                          )}
                        </div>
                      )}
                      <label className="mt-3 flex items-center justify-between">
                        <span className="text-[13px] font-bold text-ink-sub">{t('create.required')}</span>
                        <button
                          onClick={() => patchQ(q.id, { required: !q.required })}
                          className="relative h-7 w-12 rounded-full transition-colors"
                          style={{ background: q.required ? '#4FA882' : '#D9E2DC' }}
                        >
                          <motion.span
                            animate={{ x: q.required ? 22 : 3 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                            className="absolute top-1 h-5 w-5 rounded-full bg-surface shadow"
                          />
                        </button>
                      </label>
                    </Card>
                  ))}
                </div>

                <div className="mt-5">
                  <Button color="mind" size="lg" disabled={!step2Ok} onClick={() => setStep(2)}>
                    {t('common.next')} →
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-6 space-y-5">
                <Card>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-extrabold">{t('create.reward')}</label>
                    <span className="rounded-full bg-mind-100 px-3 py-1 text-sm font-extrabold text-mind-700">
                      {reward}P
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    step={10}
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value))}
                    className="mt-3 w-full accent-mind-500"
                  />
                </Card>
                <Card>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-extrabold">{t('create.target')}</label>
                    <span className="rounded-full bg-sky2-100 px-3 py-1 text-sm font-extrabold text-sky2-600">
                      🎯 {target}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="mt-3 w-full accent-sky2-500"
                  />
                </Card>
                <Card className="!bg-gradient-to-r from-mind-500 to-sky2-500 text-center">
                  <p className="text-xs font-extrabold text-white/85">{t('create.budget')}</p>
                  <p className="mt-1 text-3xl font-extrabold text-white">🪙 {(reward * target).toLocaleString()}P</p>
                </Card>
                <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[12px] font-bold leading-relaxed text-amber-700">
                  ⚠️ {t('create.policy')}
                </p>
                <Button color="mind" size="lg" onClick={submit}>
                  🚀 {t('create.review')}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Modal open={doneOpen}>
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">
            📨
          </motion.div>
          <h3 className="mt-3 text-xl font-extrabold">{t('create.submitted')}</h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink-sub">{t('create.submittedDesc')}</p>
          <div className="mt-5">
            <Button color="mind" onClick={() => nav('/rewards', { replace: true })}>
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
