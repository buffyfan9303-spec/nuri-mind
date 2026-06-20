import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Modal, ProgressBar } from '../components/ui'
import { testMeta } from '../data/tests'
import { scoreMemory, type SpanTrial } from '../lib/scoring'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

/** 숫자 폭 사다리 — 정방향(즉시 기억) / 역방향(작업기억) */
const FWD_LENS = [3, 4, 5, 6, 7, 8]
const BWD_LENS = [2, 3, 4, 5, 6]
const TOTAL = FWD_LENS.length + BWD_LENS.length

type Phase = 'ready' | 'show' | 'recall' | 'feedback'

/** 1~9 무작위 수열(직전 숫자 반복 회피) */
function genSeq(len: number): number[] {
  const out: number[] = []
  while (out.length < len) {
    const d = 1 + Math.floor(Math.random() * 9)
    if (out.length === 0 || out[out.length - 1] !== d) out.push(d)
  }
  return out
}

export default function MemoryRun() {
  const l = useL()
  const nav = useNavigate()
  const addResult = useStore((s) => s.addResult)
  const tm = testMeta('memory')
  const accent = tm.gradFrom

  const [block, setBlock] = useState(0) // 0=정방향, 1=역방향
  const [trialIdx, setTrialIdx] = useState(0)
  const [seq, setSeq] = useState<number[]>([])
  const [shown, setShown] = useState<number | null>(null)
  const [entered, setEntered] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>('ready')
  const [verdict, setVerdict] = useState<boolean | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)

  const fwdRef = useRef<SpanTrial[]>([])
  const bwdRef = useRef<SpanTrial[]>([])
  const startRef = useRef(Date.now())
  const finishedRef = useRef(false)

  const lensFor = (b: number) => (b === 0 ? FWD_LENS : BWD_LENS)
  const done = fwdRef.current.length + bwdRef.current.length
  const isBackward = block === 1

  /** 한 시행 시작 — 수열 생성 + 준비 화면 */
  const beginTrial = (b: number, ti: number) => {
    const len = lensFor(b)[ti]
    setBlock(b)
    setTrialIdx(ti)
    setSeq(genSeq(len))
    setShown(null)
    setEntered([])
    setVerdict(null)
    setPhase('ready')
  }

  // 최초 진입 — 정방향 1번부터
  useEffect(() => {
    beginTrial(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 준비(ready) → 제시(show). 역방향 첫 시행은 안내가 길도록 더 천천히.
  useEffect(() => {
    if (phase !== 'ready' || seq.length === 0) return
    const lead = block === 1 && trialIdx === 0 ? 1900 : 1100
    const t = setTimeout(() => setPhase('show'), lead)
    return () => clearTimeout(t)
  }, [phase, seq, block, trialIdx])

  // 제시(show) — 숫자를 하나씩 0.8s 간격으로 점멸, 끝나면 회상(recall)
  useEffect(() => {
    if (phase !== 'show' || seq.length === 0) return
    let i = 0
    setShown(seq[0])
    const blank0 = setTimeout(() => setShown(null), 600)
    const iv = setInterval(() => {
      i++
      if (i >= seq.length) {
        clearInterval(iv)
        setShown(null)
        setPhase('recall')
        return
      }
      setShown(seq[i])
      setTimeout(() => setShown(null), 600)
    }, 800)
    return () => {
      clearInterval(iv)
      clearTimeout(blank0)
    }
  }, [phase, seq])

  const tapKey = (d: number) => {
    if (phase !== 'recall' || entered.length >= seq.length) return
    sfx.tap()
    setEntered((e) => [...e, d])
  }
  const backspace = () => {
    if (phase !== 'recall') return
    setEntered((e) => e.slice(0, -1))
  }

  const submit = () => {
    if (phase !== 'recall' || entered.length !== seq.length) return
    const target = block === 0 ? seq : [...seq].slice().reverse()
    const correct = entered.every((d, i) => d === target[i])
    const trial: SpanTrial = { len: seq.length, correct }
    if (block === 0) fwdRef.current.push(trial)
    else bwdRef.current.push(trial)
    setVerdict(correct)
    if (correct) sfx.coin()
    else sfx.err()
    setPhase('feedback')
    setTimeout(() => {
      const lens = lensFor(block)
      if (trialIdx < lens.length - 1) beginTrial(block, trialIdx + 1)
      else if (block === 0) beginTrial(1, 0)
      else finish()
    }, 1050)
  }

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    const result = scoreMemory(fwdRef.current, bwdRef.current)
    result.durationMs = Date.now() - startRef.current
    const reward = addResult(result)
    nav(`/result/${result.id}`, { state: { fresh: true, reward }, replace: true })
  }

  const blockLabel = isBackward
    ? l({ ko: '역방향 · 거꾸로 입력', en: 'Backward · reversed', ja: '逆唱・逆向き入力' })
    : l({ ko: '정방향 · 본 순서대로', en: 'Forward · same order', ja: '順唱・見た順に' })

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 헤더: 중단 + 진행바 + 진행수 */}
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
          <ProgressBar value={done / TOTAL} color={accent} />
        </div>
        <span className="text-sm font-extrabold text-ink-faint">
          {done}/{TOTAL}
        </span>
      </div>

      {/* 블록 배지 */}
      <div className="mx-auto mt-3 w-full max-w-md px-5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-extrabold text-white"
          style={{ background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
        >
          {isBackward ? '🔄' : '➡️'} {blockLabel}
        </span>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        {/* 준비 */}
        <AnimatePresence mode="wait">
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-[64px] leading-none"
              >
                {isBackward ? '🔄' : '👀'}
              </motion.div>
              <p className="mt-5 text-[20px] font-extrabold">
                {l({ ko: `${seq.length}자리 숫자를 기억하세요`, en: `Memorize ${seq.length} digits`, ja: `${seq.length}桁の数字を覚えて` })}
              </p>
              <p className="mt-2 break-keep text-[14px] font-bold text-ink-sub">
                {isBackward
                  ? l({ ko: '이번엔 본 순서의 반대로 입력해요', en: 'This time, enter them in reverse', ja: '今回は逆の順で入力' })
                  : l({ ko: '곧 숫자가 하나씩 나타납니다', en: 'Digits will appear one by one', ja: 'まもなく数字が一つずつ表示' })}
              </p>
            </motion.div>
          )}

          {/* 제시 — 점멸 숫자 */}
          {phase === 'show' && (
            <motion.div
              key="show"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <div className="flex h-44 w-44 items-center justify-center rounded-3xl border-2 border-line bg-surface shadow-card">
                <AnimatePresence mode="wait">
                  {shown !== null ? (
                    <motion.span
                      key={`${shown}-${Math.random()}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-[92px] font-extrabold leading-none"
                      style={{ color: accent }}
                    >
                      {shown}
                    </motion.span>
                  ) : (
                    <motion.span key="dot" className="text-[40px] text-ink-faint">
                      •
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="mt-6 text-[14px] font-bold text-ink-faint">
                {l({ ko: '눈으로 따라가며 외우세요', en: 'Follow with your eyes', ja: '目で追って覚えて' })}
              </p>
            </motion.div>
          )}

          {/* 회상 — 입력 키패드 */}
          {(phase === 'recall' || phase === 'feedback') && (
            <motion.div
              key="recall"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              <p className="mt-4 text-center text-[14px] font-extrabold text-ink-sub">
                {isBackward
                  ? l({ ko: '거꾸로 입력하세요', en: 'Enter in reverse', ja: '逆向きに入力' })
                  : l({ ko: '본 순서대로 입력하세요', en: 'Enter in order', ja: '見た順に入力' })}
              </p>

              {/* 입력 표시 */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: seq.length }).map((_, i) => {
                  const d = entered[i]
                  const fb = phase === 'feedback'
                  return (
                    <div
                      key={i}
                      className="flex h-12 w-10 items-center justify-center rounded-xl border-2 text-[24px] font-extrabold"
                      style={{
                        borderColor: fb ? (verdict ? '#10B981' : '#EF4444') : d !== undefined ? accent : '#E3EAE5',
                        color: fb ? (verdict ? '#10B981' : '#EF4444') : accent,
                        background: 'rgb(var(--surface))',
                      }}
                    >
                      {d ?? ''}
                    </div>
                  )
                })}
              </div>

              {phase === 'feedback' ? (
                <div className="flex flex-1 items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-[56px] leading-none">{verdict ? '✅' : '❌'}</div>
                    <p className="mt-2 text-[16px] font-extrabold" style={{ color: verdict ? '#10B981' : '#EF4444' }}>
                      {verdict
                        ? l({ ko: '정확해요!', en: 'Correct!', ja: '正解！' })
                        : l({ ko: `정답: ${(block === 0 ? seq : [...seq].reverse()).join(' ')}`, en: `Answer: ${(block === 0 ? seq : [...seq].reverse()).join(' ')}`, ja: `正解: ${(block === 0 ? seq : [...seq].reverse()).join(' ')}` })}
                    </p>
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* 키패드 */}
                  <div className="mx-auto mt-6 grid w-full max-w-[300px] grid-cols-3 gap-2.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <motion.button
                        key={d}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => tapKey(d)}
                        className="flex h-16 items-center justify-center rounded-2xl border-2 border-line bg-surface text-[26px] font-extrabold shadow-card"
                      >
                        {d}
                      </motion.button>
                    ))}
                  </div>
                  <div className="mx-auto mt-2.5 flex w-full max-w-[300px] gap-2.5">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={backspace}
                      disabled={entered.length === 0}
                      className="flex h-14 flex-1 items-center justify-center rounded-2xl border-2 border-line bg-surface text-[20px] font-extrabold text-ink-sub disabled:opacity-40"
                    >
                      ⌫
                    </motion.button>
                    <button
                      onClick={submit}
                      disabled={entered.length !== seq.length}
                      className="flex h-14 flex-[2] items-center justify-center rounded-2xl text-[17px] font-extrabold text-white transition-opacity disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
                    >
                      {l({ ko: '확인', en: 'Submit', ja: '確認' })}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-6" />
      </main>

      {/* 중단 확인 */}
      <Modal open={quitOpen} onClose={() => setQuitOpen(false)}>
        <div className="text-center">
          <div className="text-4xl">🥺</div>
          <h3 className="mt-2 text-lg font-extrabold">{l({ ko: '검사를 그만둘까요?', en: 'Quit the test?', ja: '検査をやめますか？' })}</h3>
          <p className="mt-1 text-sm font-medium leading-relaxed text-ink-sub">
            {l({ ko: '지금까지의 기록은 저장되지 않아요.', en: 'Your progress will not be saved.', ja: 'これまでの記録は保存されません。' })}
          </p>
          <div className="mt-5 space-y-2.5">
            <Button color="iq" onClick={() => setQuitOpen(false)}>
              {l({ ko: '계속할게요', en: 'Keep going', ja: '続ける' })}
            </Button>
            <Button color="white" onClick={() => nav('/test/memory', { replace: true })}>
              {l({ ko: '그만두기', en: 'Quit', ja: 'やめる' })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
