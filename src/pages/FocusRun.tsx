import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Modal, ProgressBar } from '../components/ui'
import { testMeta } from '../data/tests'
import { scoreFocus, type GoTrial } from '../lib/scoring'
import { mulberry32, shuffle } from '../lib/random'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

const N_GO = 27
const N_NOGO = 9
const STIM_MS = 1000 // 반응 제한시간
const FIX_MS = 450 // 응시점
const FB_MS = 320 // 피드백
const GO_COLOR = '#22C55E'
const NOGO_COLOR = '#EF4444'

type Phase = 'fixation' | 'stim' | 'feedback'
type Verdict = 'hit' | 'miss' | 'correctStop' | 'falseGo'

/** Go(초록=탭) 27 + No-Go(빨강=참기) 9 를 섞은 시퀀스 */
function buildTrials(): boolean[] {
  const arr = [...Array(N_GO).fill(true), ...Array(N_NOGO).fill(false)]
  const rnd = mulberry32(Date.now() & 0xffffffff)
  return shuffle(arr, rnd)
}

export default function FocusRun() {
  const l = useL()
  const nav = useNavigate()
  const addResult = useStore((s) => s.addResult)
  const tm = testMeta('focus')

  const [trials] = useState<boolean[]>(() => buildTrials())
  const total = trials.length
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('fixation')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)

  const resultsRef = useRef<GoTrial[]>([])
  const onsetRef = useRef(0)
  const lockRef = useRef(false)
  const startRef = useRef(Date.now())
  const finishedRef = useRef(false)

  const isGo = trials[idx]

  // 응답 처리 (탭 또는 시간초과) — 시행당 1회만
  const resolve = (responded: boolean, rt: number | null) => {
    if (lockRef.current) return
    lockRef.current = true
    resultsRef.current.push({ go: isGo, responded, rt })
    const v: Verdict = isGo ? (responded ? 'hit' : 'miss') : responded ? 'falseGo' : 'correctStop'
    setVerdict(v)
    if (v === 'hit') sfx.tap()
    else if (v === 'miss' || v === 'falseGo') sfx.err()
    setPhase('feedback')
  }

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    const result = scoreFocus(resultsRef.current)
    result.durationMs = Date.now() - startRef.current
    const reward = addResult(result)
    nav(`/result/${result.id}`, { state: { fresh: true, reward }, replace: true })
  }

  // 시행 흐름: 응시점 → 자극 → 피드백 → 다음
  useEffect(() => {
    // 중단 확인 창이 떠 있는 동안은 시행을 멈춘다 — 안 그러면 창 뒤에서 초록불이 지나가 '놓침'이 쌓이고,
    // 마지막 시행이면 창을 연 채로 결과가 저장·이동됐다
    if (quitOpen) return
    if (phase === 'fixation') {
      lockRef.current = false
      setVerdict(null)
      const t = setTimeout(() => {
        onsetRef.current = Date.now()
        setPhase('stim')
      }, FIX_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'stim') {
      const t = setTimeout(() => resolve(false, null), STIM_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'feedback') {
      const t = setTimeout(() => {
        if (idx >= total - 1) finish()
        else {
          setIdx((i) => i + 1)
          setPhase('fixation')
        }
      }, FB_MS)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, quitOpen])

  const openQuit = () => {
    // 자극이 떠 있던 시행은 응답 전이면 무효 — 재개하면 같은 시행을 응시점부터 다시 보여 준다
    if (phase === 'stim' && !lockRef.current) setPhase('fixation')
    setQuitOpen(true)
  }

  const tap = () => {
    if (phase !== 'stim') return
    resolve(true, Date.now() - onsetRef.current)
  }

  const done = resultsRef.current.length

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 헤더 */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pt-4">
        <motion.button whileTap={{ scale: 0.97 }} onClick={openQuit} className="text-2xl font-bold text-ink-faint" aria-label={l({ ko: '검사 중단', en: 'Quit test', ja: '検査を中断' })}>
          ✕
        </motion.button>
        <div className="flex-1">
          <ProgressBar value={done / total} color={tm.gradFrom} />
        </div>
        <span className="text-sm font-extrabold text-ink-faint">
          {done}/{total}
        </span>
      </div>

      {/* 규칙 안내 */}
      <div className="mx-auto mt-3 flex w-full max-w-md items-center justify-center gap-3 px-5 text-[12px] font-extrabold">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-3 py-1.5 text-ink-sub">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: GO_COLOR }} /> {l({ ko: '초록 = 탭', en: 'Green = tap!', ja: '緑 = タップ！' })}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-3 py-1.5 text-ink-sub">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: NOGO_COLOR }} /> {l({ ko: '빨강 = 참기', en: 'Red = hold', ja: '赤 = 我慢' })}
        </span>
      </div>

      {/* 자극/탭 영역 */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        <button
          onClick={tap}
          className="relative my-4 flex flex-1 items-center justify-center rounded-3xl border-2 border-line bg-surface"
          aria-label={l({ ko: '반응 영역', en: 'Response area', ja: '反応エリア' })}
        >
          <AnimatePresence mode="wait">
            {phase === 'fixation' && (
              // 응시점은 즉시 사라져야 한다 — mode="wait"라 기본 0.3초 페이드가 끝날 때까지 자극이 안 보이는데,
              // 반응시간은 자극 상태로 바뀐 순간부터 재서 RT가 ~300ms 부풀고 1초 제한도 0.7초로 줄어 있었다
              <motion.span key="fix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0 } }} className="text-[28px] font-extrabold text-ink-faint">
                +
              </motion.span>
            )}
            {phase === 'stim' && (
              <motion.span
                key={`stim-${idx}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="h-40 w-40 rounded-full shadow-pop"
                style={{ background: isGo ? GO_COLOR : NOGO_COLOR }}
              />
            )}
            {phase === 'feedback' && (
              <motion.div key={`fb-${idx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <div className="text-[28px] leading-none">{verdict === 'hit' || verdict === 'correctStop' ? '✅' : '❌'}</div>
                <p className="mt-1.5 text-[14px] font-extrabold" style={{ color: verdict === 'hit' || verdict === 'correctStop' ? '#10B981' : '#EF4444' }}>
                  {verdict === 'hit'
                    ? l({ ko: '좋아요!', en: 'Nice!', ja: 'いいね！' })
                    : verdict === 'correctStop'
                      ? l({ ko: '잘 참았어요', en: 'Held it!', ja: 'よく我慢！' })
                      : verdict === 'miss'
                        ? l({ ko: '놓쳤어요', en: 'Missed', ja: '見逃し' })
                        : l({ ko: '빨강엔 참기!', en: 'Hold on red!', ja: '赤は我慢！' })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'stim' && isGo && (
            <span className="pointer-events-none absolute bottom-5 text-[13px] font-extrabold text-white/90">{l({ ko: '탭!', en: 'TAP!', ja: 'タップ！' })}</span>
          )}
        </button>

        <p className="mb-4 text-center text-[13px] font-bold text-ink-faint">
          {l({ ko: '초록이 뜨면 최대한 빠르게, 빨강이면 누르지 마세요', en: 'Tap as fast as you can on green; do nothing on red', ja: '緑は最速でタップ、赤は押さないで' })}
        </p>
      </main>

      {/* 중단 확인 */}
      <Modal open={quitOpen} onClose={() => setQuitOpen(false)}>
        <div className="text-center">
          <div className="text-4xl">🥺</div>
          <h3 className="mt-2 text-lg font-extrabold">{l({ ko: '검사를 중단할까요?', en: 'Quit the test?', ja: '検査をやめますか？' })}</h3>
          <p className="mt-1 text-sm font-bold leading-relaxed text-ink-sub">
            {l({ ko: '지금까지의 기록은 저장되지 않아요.', en: 'Your progress will not be saved.', ja: 'これまでの記録は保存されません。' })}
          </p>
          <div className="mt-5 space-y-2.5">
            <Button color="reso" onClick={() => setQuitOpen(false)}>
              {l({ ko: '계속하기', en: 'Keep going', ja: '続ける' })}
            </Button>
            <Button color="white" onClick={() => nav('/test/focus', { replace: true })}>
              {l({ ko: '중단하기', en: 'Quit', ja: 'やめる' })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
