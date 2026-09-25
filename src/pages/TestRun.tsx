import { useEffect, useMemo, useRef, useState } from 'react'
import { SPRING } from '../lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import { AnswerCard, LessonHeader, Modal } from '../components/ui'
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
import { haptic } from '../lib/haptic'
import Emoji from '../components/Emoji'

/**
 * IQ 문항별 제한시간 — 난이도 차등(문헌 기반).
 *  · 표준 관행: Raven SPM 60문항/40분 ≈ 40s/문항, Mensa Norway 35문항/25분 ≈ 43s, APM은 문항당 60~100s.
 *  · 시간 압박 연구: 짧은 제한은 첫 문항부터 과속을 유발하고 검사 구조를 "능력+속도" 2차원으로
 *    오염시켜 순수 추론능력(g) 측정력을 떨어뜨림 → 파워테스트 성격 보존엔 '관대한 제한'이 권고.
 *  · 난이도-소요시간은 양의 상관: 쉬운 행렬 중앙값 ~11s vs 어려운 행렬 >23s(2배+)
 *    → 어려운 문항에 더 긴 시간을 배정해야 능력이 아닌 속도로 변별되는 것을 막음.
 *  · 적용: 쉬움(d=1)=45s · 중간(d=1.5)=60s · 어려움(d=2)=75s — 각 난이도 중앙 소요시간의 3~4배 여유.
 */
const iqTimeFor = (d: number): number => (d >= 2 ? 75 : d >= 1.5 ? 60 : 45)

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
  const [timeLeft, setTimeLeft] = useState(() => (iqItems[0] ? iqTimeFor(iqItems[0].difficulty) : 45))
  const startRef = useRef(Date.now())
  const finishedRef = useRef(false)
  const advancingRef = useRef(false)
  /** 현재 문항 번호 — 나가는 중인 이전 카드(AnimatePresence exit)의 낡은 onClick이 새 문항에 답을 넣지 못하게 대조한다 */
  const idxRef = useRef(idx)
  idxRef.current = idx
  /** 중단 확인 창이 열려 있으면 IQ 타이머를 멈춘다(창을 읽는 동안 시간이 깎이지 않게) */
  const quitOpenRef = useRef(quitOpen)
  quitOpenRef.current = quitOpen
  /** 자동 진행 타이머 — 언마운트(중단) 후에 finish()가 돌아 결과가 저장·이동되는 것을 막는다 */
  const timersRef = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => timersRef.current.forEach((h) => window.clearTimeout(h)), [])

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
    later(() => setBubble((b) => (b === msg ? null : b)), 1500)
  }

  /* 리커트: 선택 즉시 팝 → 자동 진행 (듀오링고 플로우) */
  const pickLikert = (v: number) => {
    if (idx !== idxRef.current || advancingRef.current || finishedRef.current) return
    advancingRef.current = true
    setSel(v)
    sfx.tap()
    haptic(7)
    const item = likertItems[idx]
    const map = { ...answers, [item.id]: v }
    setAnswers(map)
    later(() => advance(map), 280)
  }

  /* IQ: 선택 → 확인 버튼으로 확정 (오답 방지) */
  const pickIq = (optId: string) => {
    // 보기 id(a~d)는 문항마다 겹친다 — 나가는 카드를 누르면 다음 문항에 같은 보기가 미리 골라져 있었다
    if (idx !== idxRef.current || finishedRef.current) return
    setSel(optId)
    sfx.tap()
    haptic(7)
  }
  const confirmIq = () => {
    if (sel === null || advancingRef.current) return
    advancingRef.current = true
    const item = iqItems[idx]
    const map = { ...answers, [item.id]: sel }
    setAnswers(map)
    advance(map)
  }

  /* IQ 문항당 타이머 — 난이도 차등(45/60/75s) */
  const timeoutRef = useRef<() => void>(() => {})
  timeoutRef.current = () => {
    if (finishedRef.current || advancingRef.current) return
    advancingRef.current = true
    const item = iqItems[idx]
    const map = { ...answers, [item.id]: null }
    setAnswers(map)
    flash(t('run.timeover'))
    later(() => advance(map), 350)
  }
  useEffect(() => {
    if (!isIq) return
    setTimeLeft(iqItems[idx] ? iqTimeFor(iqItems[idx].difficulty) : 45)
    const myIdx = idx // 이 인터벌이 담당하는 문항 — cleanup 직전 마지막 틱이 다음 문항을 오폭하는 레이스 방지
    const iv = setInterval(() => {
      setTimeLeft((prev) => {
        if (idxRef.current !== myIdx) {
          clearInterval(iv)
          return prev
        }
        if (quitOpenRef.current) return prev
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
  // 문항뱅크가 없는 id(오타·구링크·정밀검사 id)면 빈 화면 대신 소개 화면으로 — 소개가 알 수 없는 id는 홈으로 보낸다
  if (!item) return <Navigate to={tm ? `/test/${testId}` : '/'} replace />

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 헤더: 중단 X + 진행바 + (IQ) 타이머 — 듀오링고 레슨 머리(LessonHeader) */}
      <LessonHeader
        value={ratio}
        color={tm.gradFrom}
        onClose={() => setQuitOpen(true)}
        closeLabel={t('run.quitYes')}
        right={
          isIq ? (
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
                  strokeDashoffset={2 * Math.PI * 16 * (1 - timeLeft / iqTimeFor((item as IqItem).difficulty))}
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
          )
        }
      />

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
      {/* IQ는 중단 창이 떠 있는 동안 타이머가 멈춘다 — 그동안 문제를 볼 수 있으면 시간 제한이 무의미해져 가린다 */}
      <main
        className={`mx-auto w-full max-w-md flex-1 px-5 pb-6 transition-[filter] ${isIq && quitOpen ? 'blur-md' : ''}`}
        aria-hidden={isIq && quitOpen ? true : undefined}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: 70, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            // 나갈 때는 짧게(popIn과 같은 규칙) — mode="wait"라 exit 시간이 그대로 문항 사이 빈 시간이 된다
            exit={{ x: -70, opacity: 0, transition: SPRING.exit }}
            transition={SPRING.ui}
          >
            {!isIq ? (
              <>
                <p className="mt-5 text-[13px] font-extrabold" style={{ color: tm.gradFrom }}>
                  Q{idx + 1}
                </p>
                <h1 className="mt-2.5 text-[20px] font-extrabold leading-[1.6] tracking-tight">
                  {l((item as LikertItem).text)}
                </h1>
                <div className="mt-8 space-y-3">
                  {likertLabels.map((label, i) => {
                    const v = likertBase + i
                    const active = sel === v
                    return (
                      <AnswerCard
                        key={i}
                        onClick={() => pickLikert(v)}
                        selected={active}
                        accent={tm.gradFrom}
                        className="flex items-center justify-between px-5 py-4 text-left text-[17px] font-bold leading-tight"
                      >
                        {label}
                        <span className="ml-3 flex shrink-0 gap-1" aria-hidden="true">
                          {Array.from({ length: 5 }).map((_, d) => (
                            <span
                              key={d}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: d <= i ? tm.gradFrom : 'rgb(var(--line))' }}
                            />
                          ))}
                        </span>
                      </AnswerCard>
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
          <div className="leading-none"><Emoji e="🥺" size={36} className="align-top" /></div>
          <h3 className="mt-2 text-lg font-extrabold">{t('run.quitTitle')}</h3>
          <p className="mt-1 text-sm font-bold leading-relaxed text-ink-sub">{t('run.quitDesc')}</p>
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
      <p className="mt-6 text-center text-[15px] font-bold leading-relaxed text-ink-sub">
        {l(item.prompt ?? IQ_PROMPTS[item.kind])}
      </p>

      <div className="mt-5">
        {item.kind === 'matrix' && item.cells && <MatrixGrid cells={item.cells} />}
        {item.kind === 'fold' && item.cells && <FoldStrip cells={item.cells} />}
        {(item.kind === 'series' || item.kind === 'letter') && (
          <div className="rounded-2xl border-2 border-line bg-surface px-4 py-8 text-center text-[28px] font-extrabold">
            {item.series}
          </div>
        )}
        {item.kind === 'verbal' && (
          <div className="whitespace-pre-line rounded-2xl border-2 border-line bg-surface px-5 py-6 text-[17px] font-extrabold leading-tight">
            {l(item.prompt)}
          </div>
        )}
      </div>

      <div className={`mt-5 grid gap-3 ${isFig ? 'grid-cols-2' : item.kind === 'verbal' ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {item.options.map((o, i) => {
          const active = sel === o.id
          return (
            <AnswerCard
              key={o.id}
              onClick={() => onPick(o.id)}
              selected={active}
              accent={accent}
              className={`${o.fig ? 'aspect-square p-2' : 'px-4 py-4'} font-extrabold`}
            >
              <span className="sr-only">{l({ ko: `보기 ${i + 1}`, en: `Option ${i + 1}`, ja: `選択肢 ${i + 1}` })}</span>
              {o.fig ? (
                <FigCell fig={o.fig} className="h-full w-full" />
              ) : (
                <span className={item.kind === 'verbal' ? 'block text-left text-[16px] leading-relaxed' : 'text-[24px]'}>
                  {l(o.text)}
                </span>
              )}
            </AnswerCard>
          )
        })}
      </div>
    </>
  )
}
