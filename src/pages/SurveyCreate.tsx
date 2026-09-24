import { useState } from 'react'
import { SPRING, popIn } from '../lib/motion'
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
  /** 보기 중복 검사 — 같은 글자의 보기가 둘이면 응답 화면에서 하나를 누르면 둘 다 선택됐다(답이 글자로 저장된다) */
  const optionsOk = (opts: string[] | undefined) => {
    const filled = (opts ?? []).map((o) => o.trim()).filter(Boolean)
    return filled.length >= 2 && new Set(filled).size === filled.length
  }
  const step2Ok =
    questions.length >= 1 &&
    questions.every(
      (q) => q.text.trim().length > 0 && (q.type === 'scale' || q.type === 'text' || optionsOk(q.options)),
    )

  const submit = () => {
    // 완료 시트가 올라오는 사이 한 번 더 눌리면 같은 설문이 두 개 등록됐다
    if (doneOpen) return
    submitSurvey({
      emoji,
      title: title.trim(),
      desc: desc.trim(),
      questions: questions.map((q) => ({
        ...q,
        text: q.text.trim(),
        options: q.options?.map((o) => o.trim()).filter(Boolean),
      })),
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
            // 스프링은 첫·끝 키프레임만 써서 흔들림이 0→0으로 뭉개졌다 — rotate만 트윈으로 분리
            transition={{ ...SPRING.sheet, rotate: { duration: 0.5, ease: 'easeInOut' } }}
            className="text-6xl"
          >
            🔒
          </motion.div>
          <h1 className="mt-5 text-[20px] font-extrabold leading-tight tracking-tight">
            {t('create.lock', { tier: `${bronze.emoji} ${l(bronze.name)}` })}
          </h1>
          <p className="mt-3 text-[15px] font-bold leading-relaxed text-ink-sub">
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
            transition={SPRING.ui}
          >
            {step === 0 && (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="px-1 text-sm font-extrabold">{t('create.emoji')}</label>
                  <div className="mt-2 grid grid-cols-6 gap-2">
                    {EMOJIS.map((e) => (
                      <motion.button
                        key={e}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setEmoji(e)
                          sfx.tap()
                        }}
                        className="flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl"
                        style={{
                          borderColor: emoji === e ? '#4FA882' : '#E3EAE5',
                          background: emoji === e ? '#4FA8821A' : 'rgb(var(--surface))',
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
                    className="mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[14px] font-bold leading-relaxed outline-none focus:border-mind-400"
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
                      whileTap={{ scale: 0.97 }}
                      onClick={() => addQ(type)}
                      className="rounded-2xl border-2 border-line bg-surface px-1 py-3 text-center"
                    >
                      <div className="text-xl">{icon}</div>
                      <div className="mt-1 text-[11px] font-extrabold text-ink-sub">{t(`create.type.${type}`)}</div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 space-y-3.5">
                  {questions.length === 0 && (
                    <Card className="py-10 text-center text-sm font-bold text-ink-faint">⬆️ {t('create.addQ')}</Card>
                  )}
                  {/* 문항 추가·삭제 — 뚝 생기고 사라지면 아래 문항이 순간이동한다 */}
                  <AnimatePresence initial={false}>
                  {questions.map((q, qi) => (
                    <motion.div key={q.id} layout="position" variants={popIn} initial="hidden" animate="show" exit="exit">
                    <Card className="!p-4">
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
                        maxLength={120}
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
                                maxLength={40}
                                className="flex-1 rounded-xl border-2 border-line bg-surface px-3 py-2 text-[13px] font-bold outline-none focus:border-mind-400"
                              />
                              {q.options!.length > 2 && (
                                <button
                                  onClick={() => patchQ(q.id, { options: q.options!.filter((_, i) => i !== oi) })}
                                  aria-label={l({ ko: `보기 ${oi + 1} 삭제`, en: `Remove option ${oi + 1}`, ja: `選択肢${oi + 1}を削除` })}
                                  className="text-ink-faint"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          {/* 다음 버튼이 이유 없이 잠겨 보이지 않게 — 중복 보기는 여기서 바로 알려 준다 */}
                          {!optionsOk(q.options) && q.options!.filter((o) => o.trim()).length >= 2 && (
                            <p className="text-[12px] font-bold text-red-400">
                              {l({ ko: '같은 보기가 두 번 있어요', en: 'Two options are the same', ja: '同じ選択肢が2つあります' })}
                            </p>
                          )}
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
                          role="switch"
                          aria-checked={q.required}
                          aria-label={t('create.required')}
                          className="relative h-7 w-12 rounded-full transition-colors"
                          style={{ background: q.required ? '#4FA882' : '#D9E2DC' }}
                        >
                          <motion.span
                            animate={{ x: q.required ? 22 : 3 }}
                            transition={SPRING.snap}
                            className="absolute top-1 h-5 w-5 rounded-full bg-surface shadow"
                          />
                        </button>
                      </label>
                    </Card>
                    </motion.div>
                  ))}
                  </AnimatePresence>
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
                  {t('create.review')}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Modal open={doneOpen}>
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING.flick} className="text-5xl">
            📨
          </motion.div>
          <h3 className="mt-3 text-xl font-extrabold">{t('create.submitted')}</h3>
          <p className="mt-1.5 text-sm font-bold leading-relaxed text-ink-sub">{t('create.submittedDesc')}</p>
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
