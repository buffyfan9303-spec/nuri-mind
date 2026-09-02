import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Modal, ProgressBar } from '../components/ui'
import { testMeta } from '../data/tests'
import { scoreSwitch, type SwitchTrial } from '../lib/scoring'
import { mulberry32 } from '../lib/random'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

const TOTAL = 32
const FB_MS = 320
type Task = 'size' | 'parity'
interface Item {
  task: Task
  num: number
  isSwitch: boolean
}

function buildItems(): Item[] {
  const rnd = mulberry32(Date.now() & 0xffffffff)
  const out: Item[] = []
  let prev: Task | null = null
  const sizePool = [1, 2, 3, 4, 6, 7, 8, 9]
  for (let i = 0; i < TOTAL; i++) {
    const task: Task = rnd() < 0.5 ? 'size' : 'parity'
    const num = task === 'size' ? sizePool[Math.floor(rnd() * sizePool.length)] : 1 + Math.floor(rnd() * 9)
    out.push({ task, num, isSwitch: prev !== null && task !== prev })
    prev = task
  }
  return out
}

export default function SwitchRun() {
  const l = useL()
  const nav = useNavigate()
  const addResult = useStore((s) => s.addResult)
  const tm = testMeta('switch')
  const accent = tm.gradFrom

  const [items] = useState<Item[]>(() => buildItems())
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'stim' | 'feedback'>('stim')
  const [verdict, setVerdict] = useState<boolean | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)

  const trialsRef = useRef<SwitchTrial[]>([])
  const onsetRef = useRef(Date.now())
  const lockRef = useRef(false)
  const startRef = useRef(Date.now())
  const finishedRef = useRef(false)

  const it = items[idx]
  const cueColor = it.task === 'size' ? '#F59E0B' : '#0EA5E9'

  useEffect(() => {
    if (phase === 'stim') {
      lockRef.current = false
      setVerdict(null)
      onsetRef.current = Date.now()
    }
    if (phase === 'feedback') {
      const t = setTimeout(() => {
        if (idx >= TOTAL - 1) finish()
        else {
          setIdx((i) => i + 1)
          setPhase('stim')
        }
      }, FB_MS)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx])

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    const result = scoreSwitch(trialsRef.current)
    result.durationMs = Date.now() - startRef.current
    const reward = addResult(result)
    nav(`/result/${result.id}`, { state: { fresh: true, reward }, replace: true })
  }

  const answer = (side: 'L' | 'R') => {
    if (phase !== 'stim' || lockRef.current) return
    lockRef.current = true
    // size: R=큼(>5)  ·  parity: L=홀
    const correct = it.task === 'size' ? (side === 'R') === it.num > 5 : (side === 'L') === (it.num % 2 === 1)
    trialsRef.current.push({ correct, rt: Date.now() - onsetRef.current, isSwitch: it.isSwitch })
    setVerdict(correct)
    if (correct) sfx.tap()
    else sfx.err()
    setPhase('feedback')
  }

  const labelL = it.task === 'size' ? l({ ko: '5보다 작다', en: '< 5', ja: '5より小' }) : l({ ko: '홀수', en: 'Odd', ja: '奇数' })
  const labelR = it.task === 'size' ? l({ ko: '5보다 크다', en: '> 5', ja: '5より大' }) : l({ ko: '짝수', en: 'Even', ja: '偶数' })

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pt-4">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setQuitOpen(true)} className="text-2xl font-bold text-ink-faint" aria-label="quit">
          ✕
        </motion.button>
        <div className="flex-1">
          <ProgressBar value={idx / TOTAL} color={accent} />
        </div>
        <span className="text-sm font-extrabold text-ink-faint">
          {idx + 1}/{TOTAL}
        </span>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        {/* 규칙 신호 */}
        <div className="mt-5 flex justify-center">
          <motion.span
            key={`cue-${idx}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-semibold text-white"
            style={{ background: cueColor }}
          >
            {it.task === 'size' ? `🔢 ${l({ ko: '5보다 클까?', en: 'Size — vs 5?', ja: '大きさ — 5より？' })}` : `⚖️ ${l({ ko: '홀짝?', en: 'Odd / Even?', ja: '偶奇？' })}`}
          </motion.span>
        </div>

        {/* 숫자 */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-3xl border-2 shadow-card" style={{ borderColor: accent, background: 'rgb(var(--surface))' }}>
            <AnimatePresence mode="wait">
              {phase === 'stim' ? (
                <motion.span key={`n-${idx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="text-[28px] font-extrabold leading-none" style={{ color: accent }}>
                  {it.num}
                </motion.span>
              ) : (
                <motion.span key={`fb-${idx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[28px] leading-none">
                  {verdict ? '✅' : '❌'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 답 버튼 (규칙에 따라 라벨 변경) */}
        <div className="mb-7 grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => answer('L')}
            disabled={phase !== 'stim'}
            aria-label="ans-L"
            className="flex h-16 items-center justify-center rounded-2xl border-2 border-line bg-surface text-[17px] font-semibold shadow-card disabled:opacity-50"
          >
            {labelL}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => answer('R')}
            disabled={phase !== 'stim'}
            aria-label="ans-R"
            className="flex h-16 items-center justify-center rounded-2xl border-2 text-[17px] font-semibold text-white shadow-card disabled:opacity-50"
            style={{ borderColor: accent, background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
          >
            {labelR}
          </motion.button>
        </div>
      </main>

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
            <Button color="white" onClick={() => nav('/test/switch', { replace: true })}>
              {l({ ko: '그만두기', en: 'Quit', ja: 'やめる' })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
