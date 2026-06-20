import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Modal, ProgressBar } from '../components/ui'
import { testMeta } from '../data/tests'
import { scoreSpatial } from '../lib/scoring'
import { mulberry32 } from '../lib/random'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

/** 회전·반전 식별이 명확한 글자(회전 대칭 없음, 거울상 구분 가능) */
const LETTERS = ['F', 'G', 'J', 'L', 'P', 'R', 'E', 'K']
const DEGS = [45, 90, 135, 180, 225, 270, 315]
const TOTAL = 20
const FB_MS = 360

interface Item {
  letter: string
  deg: number
  mirror: boolean
}

function buildItems(): Item[] {
  const rnd = mulberry32(Date.now() & 0xffffffff)
  const out: Item[] = []
  for (let i = 0; i < TOTAL; i++) {
    out.push({
      letter: LETTERS[Math.floor(rnd() * LETTERS.length)],
      deg: DEGS[Math.floor(rnd() * DEGS.length)],
      mirror: rnd() < 0.5,
    })
  }
  return out
}

export default function SpatialRun() {
  const l = useL()
  const nav = useNavigate()
  const addResult = useStore((s) => s.addResult)
  const tm = testMeta('spatial')
  const accent = tm.gradFrom

  const [items] = useState<Item[]>(() => buildItems())
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'stim' | 'feedback'>('stim')
  const [verdict, setVerdict] = useState<boolean | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)

  const correctRef = useRef(0)
  const rtSumRef = useRef(0)
  const onsetRef = useRef(Date.now())
  const startRef = useRef(Date.now())
  const lockRef = useRef(false)
  const finishedRef = useRef(false)

  const it = items[idx]

  // 새 자극 진입 — 잠금 해제 + 반응 시작시각 기록
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
    const result = scoreSpatial(correctRef.current, TOTAL, rtSumRef.current)
    result.durationMs = Date.now() - startRef.current
    const reward = addResult(result)
    nav(`/result/${result.id}`, { state: { fresh: true, reward }, replace: true })
  }

  const answer = (saysMirror: boolean) => {
    if (phase !== 'stim' || lockRef.current) return
    lockRef.current = true
    const correct = saysMirror === it.mirror
    if (correct) correctRef.current++
    rtSumRef.current += Date.now() - onsetRef.current
    setVerdict(correct)
    if (correct) sfx.tap()
    else sfx.err()
    setPhase('feedback')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 헤더 */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pt-4">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQuitOpen(true)} className="text-2xl font-bold text-ink-faint" aria-label="quit">
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
        <p className="mt-5 text-center text-[14px] font-extrabold text-ink-sub">
          {l({ ko: '이 글자, 정상일까요 거울상일까요?', en: 'Normal or mirror-image?', ja: 'この文字、正常？鏡像？' })}
        </p>

        {/* 자극 글자 */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex h-44 w-44 items-center justify-center rounded-3xl border-2 shadow-card" style={{ borderColor: accent, background: 'rgb(var(--surface))' }}>
            <AnimatePresence mode="wait">
              {phase === 'stim' ? (
                /* 회전/반전은 정적 inner span에 — framer가 transform을 덮어쓰지 않도록 entrance 애니는 outer div */
                <motion.div key={`g-${idx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  <span
                    className="rot-glyph text-[100px] font-black leading-none"
                    style={{ display: 'inline-block', color: accent, transform: `rotate(${it.deg}deg) scaleX(${it.mirror ? -1 : 1})` }}
                  >
                    {it.letter}
                  </span>
                </motion.div>
              ) : (
                <motion.span key={`fb-${idx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[64px] leading-none">
                  {verdict ? '✅' : '❌'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 정상 / 거울 버튼 */}
        <div className="mb-7 grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => answer(false)}
            disabled={phase !== 'stim'}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface text-[18px] font-extrabold shadow-card disabled:opacity-50"
          >
            🔤 {l({ ko: '정상', en: 'Normal', ja: '正常' })}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => answer(true)}
            disabled={phase !== 'stim'}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 text-[18px] font-extrabold text-white shadow-card disabled:opacity-50"
            style={{ borderColor: accent, background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
          >
            🪞 {l({ ko: '거울상', en: 'Mirror', ja: '鏡像' })}
          </motion.button>
        </div>
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
            <Button color="white" onClick={() => nav('/test/spatial', { replace: true })}>
              {l({ ko: '그만두기', en: 'Quit', ja: 'やめる' })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
