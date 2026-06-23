import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import { Modal, ProgressBar } from '../components/ui'
import { FigCell, FoldStrip, MatrixGrid } from '../components/Fig'
import { ADHD_ITEMS } from '../data/adhd'
import { EGO_ITEMS } from '../data/ego'
import { LOVE_ITEMS } from '../data/love'
import { BURNOUT_ITEMS } from '../data/burnout'
import { DOPA_ITEMS } from '../data/dopamine'
import { RESILIENCE_ITEMS } from '../data/resilience'
import { DARK_ITEMS } from '../data/dark'
import { SELFESTEEM_ITEMS } from '../data/selfesteem'
import { PERFECTION_ITEMS } from '../data/perfection'
import { EFFICACY_ITEMS } from '../data/efficacy'
import { SOCIALANX_ITEMS } from '../data/socialanx'
import { IQ_ITEMS, IQ_PROMPTS } from '../data/iq'
import { testMeta } from '../data/tests'
import type { IqItem, LikertItem, TestId } from '../data/types'
import { mulberry32, shuffle } from '../lib/random'
import { scoreAdhd, scoreBurnout, scoreDark, scoreDopamine, scoreEgo, scoreIq, scoreLove, scoreResilience, scoreSelfEsteem, scorePerfection, scoreEfficacy, scoreSocialAnx } from '../lib/scoring'
import { LIKERT_AGREE, LIKERT_FREQ } from '../i18n/translations'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sfx, startAmbient, stopAmbient } from '../lib/sound'

const IQ_TIME = 45

/** 리커트형 검사 문항 뱅크 */
const BANKS: Partial<Record<TestId, LikertItem[]>> = {
  adhd: ADHD_ITEMS,
  ego: EGO_ITEMS,
  love: LOVE_ITEMS,
  burnout: BURNOUT_ITEMS,
  dopamine: DOPA_ITEMS,
  resilience: RESILIENCE_ITEMS,
  dark: DARK_ITEMS,
  selfesteem: SELFESTEEM_ITEMS,
  perfect: PERFECTION_ITEMS,
  efficacy: EFFICACY_ITEMS,
  socialanx: SOCIALANX_ITEMS,
}
/** 1~5 동의 척도를 쓰는 검사 (나머지 리커트는 0~4 빈도) */
const AGREE_TESTS: TestId[] = ['ego', 'love', 'resilience', 'dark', 'selfesteem', 'perfect', 'efficacy', 'socialanx']

export default function TestRun() {
  const { id } = useParams<{ id: TestId }>()
  const testId = id as TestId
  const isIq = testId === 'iq'
  const [searchParams] = useSearchParams()
  // IQ 모드: 'fast'(빠른 10문항·전체 무료) / 'pro'(정밀 20문항·상세결과 유료). 기본 빠른.
  const iqMode: 'fast' | 'pro' = searchParams.get('mode') === 'pro' ? 'pro' : 'fast'
  const tm = testMeta(testId)
  const t = useT()
  const l = useL()
  const lang = useStore((s) => s.lang)
  const ambient = useStore((s) => s.ambient)
  const addResult = useStore((s) => s.addResult)
  const nav = useNavigate()

  /* 차분한 배경음 (설정 ON 시 검사 동안 재생) */
  useEffect(() => {
    if (ambient) startAmbient()
    return () => stopAmbient()
  }, [ambient])

  /** 세션 셔플 — 문항 순서 + (IQ) 보기 순서 무작위화 (백서: 회차 간 정답 암기 차단) */
  const [likertItems] = useState<LikertItem[]>(() => {
    if (isIq) return []
    const rnd = mulberry32(Date.now() & 0xffffffff)
    return shuffle(BANKS[testId] ?? [], rnd)
  })
  const [iqItems] = useState<IqItem[]>(() => {
    if (!isIq) return []
    const rnd = mulberry32(Date.now() & 0xffffffff)
    const shuffled = shuffle(IQ_ITEMS, rnd).map((it) => ({ ...it, options: shuffle(it.options, rnd) }))
    return iqMode === 'fast' ? shuffled.slice(0, 10) : shuffled
  })

  const total = isIq ? iqItems.length : likertItems.length
  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState<number | string | null>(null)
  const [answers, setAnswers] = useState<Record<string, number | string | null>>({})
  const [quitOpen, setQuitOpen] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(IQ_TIME)
  const startRef = useRef(Date.now())
  const finishedRef = useRef(false)
  const advancingRef = useRef(false)

  const isAgree = AGREE_TESTS.includes(testId)
  const likertBase = isAgree ? 1 : 0
  const likertLabels = isAgree ? LIKERT_AGREE[lang] : LIKERT_FREQ[lang]

  const finish = (map: Record<string, number | string | null>) => {
    if (finishedRef.current) return
    finishedRef.current = true
    const likertMap = map as Record<string, number>
    const result = isIq
      ? scoreIq(iqItems, map as Record<string, string | null>)
      : testId === 'adhd'
        ? scoreAdhd(ADHD_ITEMS, likertMap)
        : testId === 'ego'
          ? scoreEgo(EGO_ITEMS, likertMap)
          : testId === 'love'
            ? scoreLove(LOVE_ITEMS, likertMap)
            : testId === 'burnout'
              ? scoreBurnout(BURNOUT_ITEMS, likertMap)
              : testId === 'dopamine'
                ? scoreDopamine(DOPA_ITEMS, likertMap)
                : testId === 'resilience'
                  ? scoreResilience(RESILIENCE_ITEMS, likertMap)
                  : testId === 'dark'
                    ? scoreDark(DARK_ITEMS, likertMap)
                    : testId === 'selfesteem'
                      ? scoreSelfEsteem(SELFESTEEM_ITEMS, likertMap)
                      : testId === 'perfect'
                        ? scorePerfection(PERFECTION_ITEMS, likertMap)
                        : testId === 'efficacy'
                          ? scoreEfficacy(EFFICACY_ITEMS, likertMap)
                          : scoreSocialAnx(SOCIALANX_ITEMS, likertMap)
    result.durationMs = Date.now() - startRef.current
    if (isIq) result.iqMode = iqMode
    const reward = addResult(result)
    nav(`/result/${result.id}`, { state: { fresh: true, reward }, replace: true })
  }

  const advance = (map: Record<string, number | string | null>) => {
    if (idx >= total - 1) {
      finish(map)
      return
    }
    const next = idx + 1
    setIdx(next)
    setSel(null)
    advancingRef.current = false
    // 넘김/시간초과엔 소리 없음(조급함 방지). 사운드는 답변 선택 시에만.
    if (next === Math.floor(total / 2)) flash(t('run.halfway'))
    else if (next === total - 2) flash(t('run.almost'))
  }

  const flash = (msg: string) => {
    setBubble(msg)
    setTimeout(() => setBubble(null), 1500)
  }

  /* 리커트: 선택 즉시 팝 → 자동 진행 (듀오링고 플로우) */
  const pickLikert = (v: number) => {
    if (advancingRef.current || finishedRef.current) return
    advancingRef.current = true
    setSel(v)
    sfx.tap()
    const item = likertItems[idx]
    const map = { ...answers, [item.id]: v }
    setAnswers(map)
    setTimeout(() => advance(map), 280)
  }

  /* IQ: 선택 → 확인 버튼으로 확정 (오답 방지) */
  const pickIq = (optId: string) => {
    if (finishedRef.current) return
    setSel(optId)
    sfx.tap()
  }
  const confirmIq = () => {
    if (sel === null || advancingRef.current) return
    advancingRef.current = true
    const item = iqItems[idx]
    const map = { ...answers, [item.id]: sel }
    setAnswers(map)
    advance(map)
  }

  /* IQ 문항당 45초 타이머 */
  const timeoutRef = useRef<() => void>(() => {})
  timeoutRef.current = () => {
    if (finishedRef.current || advancingRef.current) return
    advancingRef.current = true
    const item = iqItems[idx]
    const map = { ...answers, [item.id]: null }
    setAnswers(map)
    flash(t('run.timeover'))
    setTimeout(() => advance(map), 350)
  }
  useEffect(() => {
    if (!isIq) return
    setTimeLeft(IQ_TIME)
    const iv = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(iv)
          timeoutRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, isIq])

  const item: LikertItem | IqItem | undefined = isIq ? iqItems[idx] : likertItems[idx]
  const ratio = useMemo(() => idx / total, [idx, total])
  if (!item) return null

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 헤더: 중단 X + 진행바 + (IQ) 타이머 */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setQuitOpen(true)}
          className="text-2xl font-bold text-ink-faint"
          aria-label="quit"
        >
          ✕
        </motion.button>
        <div className="flex-1">
          <ProgressBar value={ratio} color={tm.gradFrom} />
        </div>
        {isIq ? (
          <div className="relative h-10 w-10">
            <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#E7EDE9" strokeWidth="5" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke={timeLeft <= 10 ? '#EF4444' : tm.gradFrom}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 * (1 - timeLeft / IQ_TIME)}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-xs font-extrabold ${
                timeLeft <= 10 ? 'text-red-500' : 'text-ink-sub'
              }`}
            >
              {timeLeft}
            </span>
          </div>
        ) : (
          <span className="text-sm font-extrabold text-ink-faint">
            {idx + 1}/{total}
          </span>
        )}
      </div>

      {/* 응원 버블 */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-none fixed left-1/2 top-16 z-40 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm font-extrabold text-white shadow-pop"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 문항 카드 */}
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: 70, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -70, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {!isIq ? (
              <>
                <p className="mt-8 text-[13px] font-extrabold tracking-widest" style={{ color: tm.gradFrom }}>
                  Q{idx + 1}
                </p>
                <h1 className="mt-2.5 text-[21px] font-extrabold leading-[1.6] tracking-tight">
                  {l((item as LikertItem).text)}
                </h1>
                <div className="mt-8 space-y-3">
                  {likertLabels.map((label, i) => {
                    const v = likertBase + i
                    const active = sel === v
                    return (
                      <motion.button
                        key={i}
                        onClick={() => pickLikert(v)}
                        animate={active ? { scale: [1, 1.045, 1] } : { scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="flex w-full items-center justify-between rounded-2xl border-2 bg-surface px-5 py-4 text-left text-[17px] font-bold leading-relaxed"
                        style={{
                          borderColor: active ? tm.gradFrom : '#E3EAE5',
                          background: active ? `${tm.gradFrom}1A` : 'rgb(var(--surface))',
                          boxShadow: active ? 'none' : '0 2px 0 #EDF1EE',
                        }}
                      >
                        {label}
                        <span className="ml-3 flex shrink-0 gap-1">
                          {Array.from({ length: 5 }).map((_, d) => (
                            <span
                              key={d}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: d <= i ? tm.gradFrom : '#E3EAE5' }}
                            />
                          ))}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </>
            ) : (
              <IqQuestion item={item as IqItem} sel={sel as string | null} onPick={pickIq} accent={tm.gradFrom} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* IQ 확인 버튼 */}
      {isIq && (
        <div className="sticky bottom-0 border-t border-line bg-cream/95 px-5 pb-7 pt-3 backdrop-blur">
          <div className="mx-auto max-w-md">
            <Button color="iq" size="lg" disabled={sel === null} onClick={confirmIq}>
              {t('common.next')} →
            </Button>
          </div>
        </div>
      )}

      {/* 중단 확인 */}
      <Modal open={quitOpen} onClose={() => setQuitOpen(false)}>
        <div className="text-center">
          <div className="text-4xl">🥺</div>
          <h3 className="mt-2 text-lg font-extrabold">{t('run.quitTitle')}</h3>
          <p className="mt-1 text-sm font-medium leading-relaxed text-ink-sub">{t('run.quitDesc')}</p>
          <div className="mt-5 space-y-2.5">
            <Button color="mind" onClick={() => setQuitOpen(false)}>
              {t('run.quitNo')}
            </Button>
            <Button color="white" onClick={() => nav(`/test/${testId}`, { replace: true })}>
              {t('run.quitYes')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function IqQuestion({
  item,
  sel,
  onPick,
  accent,
}: {
  item: IqItem
  sel: string | null
  onPick: (id: string) => void
  accent: string
}) {
  const l = useL()
  const isFig = item.options.some((o) => o.fig)
  return (
    <>
      <p className="mt-6 text-center text-[15px] font-bold leading-relaxed tracking-wide text-ink-sub">
        {l(item.prompt ?? IQ_PROMPTS[item.kind])}
      </p>

      <div className="mt-5">
        {item.kind === 'matrix' && item.cells && <MatrixGrid cells={item.cells} />}
        {item.kind === 'fold' && item.cells && <FoldStrip cells={item.cells} />}
        {(item.kind === 'series' || item.kind === 'letter') && (
          <div className="rounded-2xl border-2 border-line bg-surface px-4 py-8 text-center text-[28px] font-extrabold tracking-widest">
            {item.series}
          </div>
        )}
        {item.kind === 'verbal' && (
          <div className="whitespace-pre-line rounded-2xl border-2 border-line bg-surface px-5 py-6 text-[18px] font-extrabold leading-[1.75]">
            {l(item.prompt)}
          </div>
        )}
      </div>

      <div className={`mt-5 grid gap-3 ${isFig ? 'grid-cols-2' : item.kind === 'verbal' ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {item.options.map((o, i) => {
          const active = sel === o.id
          return (
            <motion.button
              key={o.id}
              onClick={() => onPick(o.id)}
              whileTap={{ scale: 0.96 }}
              animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              className={`rounded-2xl border-2 bg-surface ${
                o.fig ? 'aspect-square p-2' : 'px-4 py-4'
              } font-extrabold`}
              style={{
                borderColor: active ? accent : '#E3EAE5',
                background: active ? `${accent}14` : 'rgb(var(--surface))',
                boxShadow: active ? 'none' : '0 2px 0 #EDF1EE',
              }}
            >
              <span className="sr-only">option {i + 1}</span>
              {o.fig ? (
                <FigCell fig={o.fig} className="h-full w-full" />
              ) : (
                <span className={item.kind === 'verbal' ? 'block text-left text-[16px] leading-relaxed' : 'text-[22px]'}>
                  {l(o.text)}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </>
  )
}
