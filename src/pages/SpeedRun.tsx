import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Modal, ProgressBar } from '../components/ui'
import { testMeta } from '../data/tests'
import { scoreSpeed } from '../lib/scoring'
import { mulberry32 } from '../lib/random'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

/** 기호 9종 → 숫자 1~9 대응 (index 0 → 1) */
const SYMBOLS = ['🔺', '🟢', '🟦', '🔶', '⭐', '❤️', '➕', '🟣', '🌙']
const TOTAL = 40

function buildItems(): number[] {
  const rnd = mulberry32(Date.now() & 0xffffffff)
  const out: number[] = []
  for (let i = 0; i < TOTAL; i++) out.push(Math.floor(rnd() * 9)) // 0~8
  return out
}

export default function SpeedRun() {
  const l = useL()
  const nav = useNavigate()
  const addResult = useStore((s) => s.addResult)
  const tm = testMeta('speed')
  const accent = tm.gradFrom

  const [items] = useState<number[]>(() => buildItems())
  const [phase, setPhase] = useState<'ready' | 'run'>('ready')
  const [idx, setIdx] = useState(0)
  const [flash, setFlash] = useState<{ ok: boolean; n: number } | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)

  const idxRef = useRef(0)
  const correctRef = useRef(0)
  const startRef = useRef(0)
  const finishedRef = useRef(false)

  const start = () => {
    startRef.current = Date.now()
    setPhase('run')
  }

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    const result = scoreSpeed(correctRef.current, TOTAL, Date.now() - startRef.current)
    result.durationMs = Date.now() - startRef.current
    const reward = addResult(result)
    nav(`/result/${result.id}`, { state: { fresh: true, reward }, replace: true })
  }

  const tap = (d: number) => {
    if (phase !== 'run' || finishedRef.current) return
    const i = idxRef.current
    if (i >= TOTAL) return
    const correct = d === items[i] + 1
    if (correct) {
      correctRef.current++
      sfx.tap()
    } else {
      sfx.err()
    }
    setFlash({ ok: correct, n: i })
    const next = i + 1
    idxRef.current = next
    if (next >= TOTAL) {
      finish()
      return
    }
    setIdx(next)
  }

  /* 대응표 칩 */
  const Legend = ({ compact }: { compact?: boolean }) => (
    <div className={`grid grid-cols-9 gap-1 ${compact ? '' : 'gap-1.5'}`}>
      {SYMBOLS.map((s, i) => (
        <div
          key={i}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-line bg-surface ${compact ? 'py-1' : 'py-2'}`}
        >
          <span className={compact ? 'text-[16px] leading-none' : 'text-[20px] leading-none'}>{s}</span>
          <span className={`font-extrabold text-ink-sub ${compact ? 'text-[11px]' : 'mt-0.5 text-[13px]'}`}>{i + 1}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 헤더 */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pt-4">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setQuitOpen(true)} className="text-2xl font-bold text-ink-faint" aria-label="quit">
          ✕
        </motion.button>
        <div className="flex-1">
          <ProgressBar value={idx / TOTAL} color={accent} />
        </div>
        <span className="text-sm font-extrabold text-ink-faint">
          {idx}/{TOTAL}
        </span>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        {phase === 'ready' ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} className="text-[56px] leading-none">
              ⚡
            </motion.div>
            <h2 className="mt-4 text-[19px] font-extrabold">{l({ ko: '대응표를 외워두세요', en: 'Learn the key', ja: '対応表を覚えて' })}</h2>
            <p className="mt-1.5 break-keep text-[13.5px] font-bold text-ink-sub">
              {l({ ko: '기호에 맞는 숫자를 최대한 빠르고 정확하게 누르면 돼요. 표는 계속 위에 보여요.', en: 'Press the digit matching each symbol, fast and accurate. The key stays at the top.', ja: '記号に合う数字を最速・正確に。表はずっと上に表示されます。' })}
            </p>
            <div className="mt-5 w-full">
              <Legend />
            </div>
            <div className="mt-7 w-full">
              <Button color={tm.btn} size="lg" onClick={start}>
                {l({ ko: '시작하기', en: 'Start', ja: 'スタート' })} →
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 상단 고정 대응표 */}
            <div className="mt-3">
              <Legend compact />
            </div>

            {/* 현재 기호 */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="text-[13px] font-extrabold text-ink-faint">{l({ ko: '이 기호의 숫자는?', en: 'Which digit?', ja: 'この記号の数字は？' })}</p>
              <div className="relative mt-3 flex h-32 w-32 items-center justify-center rounded-3xl border-2 shadow-card" style={{ borderColor: accent, background: 'rgb(var(--surface))' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={idx}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="text-[68px] leading-none"
                  >
                    {SYMBOLS[items[idx]]}
                  </motion.span>
                </AnimatePresence>
                {flash && flash.n === idx - 1 && (
                  <motion.span
                    key={`f-${flash.n}`}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.4 }}
                    className="absolute -top-2 text-[20px]"
                  >
                    {flash.ok ? '✅' : '❌'}
                  </motion.span>
                )}
              </div>
            </div>

            {/* 키패드 */}
            <div className="mx-auto mb-6 grid w-full max-w-[300px] grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => tap(d)}
                  className="flex h-16 items-center justify-center rounded-2xl border-2 border-line bg-surface text-[26px] font-extrabold shadow-card"
                >
                  {d}
                </motion.button>
              ))}
            </div>
          </>
        )}
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
            <Button color="white" onClick={() => nav('/test/speed', { replace: true })}>
              {l({ ko: '그만두기', en: 'Quit', ja: 'やめる' })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
