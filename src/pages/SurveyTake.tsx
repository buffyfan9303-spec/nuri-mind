import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import { Card, Modal, ProgressBar, TopBar } from '../components/ui'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { celebrate } from '../lib/confetti'
import { sfx } from '../lib/sound'

type Ans = string | string[] | number | undefined

export default function SurveyTake() {
  const { id } = useParams<{ id: string }>()
  const t = useT()
  const nav = useNavigate()
  const survey = useStore((s) => s.surveys.find((x) => x.id === id))
  const taken = useStore((s) => s.takenSurveys)
  const takeSurvey = useStore((s) => s.takeSurvey)

  const [answers, setAnswers] = useState<Record<string, Ans>>({})
  const [err, setErr] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)
  const [earned, setEarned] = useState(0)

  if (!survey || survey.status !== 'approved' || taken.includes(survey.id)) {
    return <Navigate to="/rewards" replace />
  }

  const setAns = (qid: string, v: Ans) => {
    setErr(false)
    setAnswers((p) => ({ ...p, [qid]: v }))
  }

  const answeredCount = survey.questions.filter((q) => {
    const a = answers[q.id]
    if (a === undefined) return false
    if (Array.isArray(a)) return a.length > 0
    if (typeof a === 'string') return a.trim().length > 0
    return true
  }).length

  const submit = () => {
    const missing = survey.questions.some((q) => {
      if (!q.required) return false
      const a = answers[q.id]
      if (a === undefined) return true
      if (Array.isArray(a)) return a.length === 0
      if (typeof a === 'string') return a.trim().length === 0
      return false
    })
    if (missing) {
      setErr(true)
      sfx.err()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const reward = takeSurvey(survey.id)
    setEarned(reward)
    celebrate()
    sfx.coin()
    setDoneOpen(true)
  }

  return (
    <div className="min-h-dvh pb-12">
      <TopBar back="/rewards" title={`${survey.emoji} ${survey.title}`} />
      <div className="mx-auto max-w-md px-5">
        <ProgressBar value={answeredCount / survey.questions.length} />
        {err && (
          <p className="shake mt-3 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-extrabold text-red-500">
            {t('take.needRequired')}
          </p>
        )}
        <p className="mt-3 text-[15px] font-medium leading-relaxed tracking-wide text-ink-sub">{survey.desc}</p>

        <div className="mt-4 space-y-4">
          {survey.questions.map((q, qi) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            >
              <Card>
                <p className="text-[16.5px] font-extrabold leading-[1.65]">
                  <span className="mr-1.5 text-mind-600">Q{qi + 1}.</span>
                  {q.text}
                  {q.required && <span className="ml-1 text-xs font-bold text-red-400">*</span>}
                </p>

                {q.type === 'single' && (
                  <div className="mt-3 space-y-2">
                    {q.options?.map((op) => {
                      const active = answers[q.id] === op
                      return (
                        <button
                          key={op}
                          onClick={() => {
                            setAns(q.id, op)
                            sfx.tap()
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-left text-[15.5px] font-bold leading-relaxed"
                          style={{
                            borderColor: active ? '#4FA882' : '#E3EAE5',
                            background: active ? '#4FA8821A' : 'rgb(var(--surface))',
                          }}
                        >
                          <span
                            className="flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded-full border-2"
                            style={{ borderColor: active ? '#4FA882' : 'rgb(var(--line))' }}
                          >
                            {active && <span className="h-2 w-2 rounded-full bg-mind-500" />}
                          </span>
                          {op}
                        </button>
                      )
                    })}
                  </div>
                )}

                {q.type === 'multi' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options?.map((op) => {
                      const arr = (answers[q.id] as string[]) ?? []
                      const active = arr.includes(op)
                      return (
                        <button
                          key={op}
                          onClick={() => {
                            setAns(q.id, active ? arr.filter((x) => x !== op) : [...arr, op])
                            sfx.tap()
                          }}
                          className="rounded-full border-2 px-4 py-2.5 text-[14.5px] font-bold"
                          style={{
                            borderColor: active ? '#4FA882' : '#E3EAE5',
                            background: active ? '#4FA882' : 'rgb(var(--surface))',
                            color: active ? '#fff' : 'rgb(var(--text))',
                          }}
                        >
                          {active ? '✓ ' : ''}
                          {op}
                        </button>
                      )
                    })}
                  </div>
                )}

                {q.type === 'scale' && (
                  <div className="mt-3">
                    <div className="flex justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const active = answers[q.id] === n
                        return (
                          <motion.button
                            key={n}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setAns(q.id, n)
                              sfx.tap()
                            }}
                            className="flex h-12 flex-1 items-center justify-center rounded-xl border-2 text-base font-extrabold"
                            style={{
                              borderColor: active ? '#4FA882' : '#E3EAE5',
                              background: active ? '#4FA882' : 'rgb(var(--surface))',
                              color: active ? '#fff' : 'rgb(var(--text-sub))',
                            }}
                          >
                            {n}
                          </motion.button>
                        )
                      })}
                    </div>
                    <div className="mt-2 flex justify-between text-[12.5px] font-bold text-ink-faint">
                      <span>{t('take.scaleLow')}</span>
                      <span>{t('take.scaleHigh')}</span>
                    </div>
                  </div>
                )}

                {q.type === 'text' && (
                  <textarea
                    value={(answers[q.id] as string) ?? ''}
                    onChange={(e) => setAns(q.id, e.target.value)}
                    placeholder={t('take.textPh')}
                    rows={3}
                    className="mt-3 w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-[15px] font-medium leading-relaxed outline-none focus:border-mind-400"
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <Button color="mind" size="lg" onClick={submit}>
            {t('take.submit')} · +{survey.reward}P
          </Button>
        </div>
      </div>

      <Modal open={doneOpen}>
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 8, 0] }} className="text-5xl">
            🎉
          </motion.div>
          <h3 className="mt-3 text-xl font-extrabold">{t('take.thanks', { p: earned })}</h3>
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
