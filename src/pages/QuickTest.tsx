import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../components/Button'
import { ProgressBar, TopBar } from '../components/ui'
import { quickById } from '../data/quick'
import { useT, useL } from '../i18n/useT'
import { track } from '../lib/analytics'
import { sfx } from '../lib/sound'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { makeResultCard, shareCardBlob } from '../lib/shareCard'
import { kakaoEnabled, shareKakao } from '../lib/kakao'
import { shiftGrad } from '../lib/color'
import { CHARACTERS } from '../lib/characters'
import { encodeQuickDuel } from '../lib/duel'
import { useStore } from '../store/useStore'

export default function QuickTest() {
  const { id } = useParams<{ id: string }>()
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const test = quickById(id || '')
  const { fire } = useRewardAnimation()
  const nickname = useStore((s) => s.nickname)

  const [step, setStep] = useState(0)
  const [tally, setTally] = useState<Record<string, number>>({})
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const winner = useMemo(() => {
    if (!test) return null
    let best = test.results[0]
    let bestN = -1
    for (const r of test.results) {
      const n = tally[r.key] || 0
      if (n > bestN) {
        bestN = n
        best = r
      }
    }
    return best
  }, [tally, test])

  // 결과별 그라데이션 변주 — 같은 검사라도 결과마다 색조를 회전(idx 0=홈카드와 동일)
  const accent = useMemo<[string, string]>(() => {
    if (!test || !winner) return ['#9AA6FF', '#C7B8FF']
    const i = test.results.findIndex((r) => r.key === winner.key)
    return winner.grad ?? shiftGrad(test.grad, i * 32)
  }, [test, winner])

  if (!test) return <Navigate to="/" replace />

  const pick = (to: string) => {
    sfx.tap()
    setTally((prev) => ({ ...prev, [to]: (prev[to] || 0) + 1 }))
    if (step + 1 < test.questions.length) setStep(step + 1)
    else {
      setDone(true)
      fire('win')
      track('quick_complete', { id: test.id })
    }
  }

  const share = async () => {
    if (!winner) return
    track('share', { channel: 'quick', id: test.id })
    const url = `${location.origin}/quick/${test.id}`
    const txt = `[누리 마인드] 나의 ${l(test.title)}: ${winner.emoji} ${l(winner.name)} — ${l(winner.tag)}`
    try {
      if (navigator.share) await navigator.share({ text: txt, url })
      else {
        await navigator.clipboard.writeText(`${txt} ${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      /* 취소 */
    }
  }

  // 결과 카드 PNG 생성 → 공유/저장 (메인 결과와 동일 경로 재사용)
  const shareCard = async () => {
    if (!winner) return
    track('share', { channel: 'quick_card', id: test.id })
    try {
      const blob = await makeResultCard({
        emoji: winner.emoji,
        name: l(winner.name),
        title: l(winner.tag),
        topPercent: 0,
        testName: l(test.title),
        grad: accent,
        appName: t('app.name'),
        charSvg: CHARACTERS[winner.emoji],
        heroLabel: '나의 결과',
        ctaTop: '너도 1분 테스트 해볼래? 👀',
        ctaSub: '지금 누리 마인드에서 무료로 →',
      })
      const how = await shareCardBlob(
        blob,
        `[누리 마인드] 나의 ${l(test.title)}: ${winner.emoji} ${l(winner.name)} — ${l(winner.tag)}`,
        `nurimind-${test.id}.png`,
      )
      if (how === 'downloaded') {
        setSaved(true)
        setTimeout(() => setSaved(false), 2200)
      }
    } catch {
      sfx.err()
    }
  }

  // 카카오톡 공유 — 메인 결과와 동일. SDK 미준비면 텍스트 공유로 폴백.
  const shareKakaoQuick = () => {
    if (!winner) return
    const ok = shareKakao({
      title: `나는 "${l(winner.name)}" ${winner.emoji} | 누리 마인드`,
      description: l(winner.tag),
      link: `${location.origin}/quick/${test.id}`,
    })
    track('share', { channel: 'kakao', id: test.id })
    if (!ok) share()
  }

  const shareDuelQuick = async () => {
    if (!winner || !test) return
    const enc = encodeQuickDuel({ qid: test.id, key: winner.key, nm: l(winner.name), e: winner.emoji, n: nickname })
    const url = `${location.origin}/api/duel?r=${enc}` // 크롤러=동적 OG, 사람=/vs로 리다이렉트
    const text = l({
      ko: `나는 ${l(test.title)}에서 "${winner.emoji} ${l(winner.name)}"! 너도 해볼래? 🆚`,
      en: `I got "${winner.emoji} ${l(winner.name)}" on ${l(test.title)}! Your turn 🆚`,
      ja: `${l(test.title)}で「${winner.emoji} ${l(winner.name)}」だった！君もやる？🆚`,
    })
    try {
      track('share', { channel: 'quick_duel', id: test.id })
      if (navigator.share) await navigator.share({ title: '누리 마인드 결과 대결', text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      /* 사용자 취소 — 무시 */
    }
  }

  const reset = () => {
    setTally({})
    setStep(0)
    setDone(false)
  }

  // ── 결과 ──
  if (done && winner) {
    return (
      <div className="min-h-dvh pb-36">
        <TopBar back="/quick" title={l(test.title)} />
        <main className="mx-auto max-w-md px-5">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="mt-3 rounded-3xl p-7 text-center text-white shadow-pop"
            style={{ background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})` }}
          >
            {/* 동물 일러스트(자체 아트) — 없으면 이모지 폴백, 광배+그림자로 매력↑ */}
            <div className="relative mx-auto flex h-[120px] w-[120px] items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/25 blur-xl" />
              <motion.div
                initial={{ scale: 0.5, y: 8 }}
                animate={{ scale: 1, y: 0, rotate: [0, -8, 6, 0] }}
                transition={{ type: 'spring', stiffness: 170, damping: 11 }}
                className="relative drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
              >
                <span className="floaty block">
                  {CHARACTERS[winner.emoji] ? (
                    <img
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(CHARACTERS[winner.emoji])}`}
                      alt=""
                      className="h-[108px] w-[108px]"
                    />
                  ) : (
                    <span className="block text-[80px] leading-none">{winner.emoji}</span>
                  )}
                </span>
              </motion.div>
            </div>
            <h1 className="mt-3 text-[28px] font-extrabold tracking-tight">{l(winner.name)}</h1>
            <p className="mt-2 text-[15px] font-extrabold text-white/90">“{l(winner.tag)}”</p>
            <p className="mt-3 break-keep text-[14.5px] font-medium leading-relaxed text-white/95">{l(winner.desc)}</p>
          </motion.div>

          {(copied || saved) && (
            <p className="mt-3 rounded-xl bg-mind-100 py-2 text-center text-[13px] font-extrabold text-mind-700">
              ✅ {saved ? t('share.saved') : t('common.copied')}
            </p>
          )}

          <div className="mt-4 space-y-2.5">
            {kakaoEnabled() && (
              <button
                onClick={shareKakaoQuick}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] py-3.5 text-[15px] font-extrabold text-[#3A1D1D]"
              >
                💬 {t('quick.shareKakao')}
              </button>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <Button color="sky" onClick={shareCard}>
                {t('quick.shareCard')}
              </Button>
              <Button color="mind" onClick={share}>
                📤 {t('quick.share')}
              </Button>
            </div>
            <button
              onClick={shareDuelQuick}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-extrabold text-white"
              style={{ background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})` }}
            >
              🆚 {l({ ko: '친구와 대결', en: 'Challenge a friend', ja: '友達とバトル' })}
            </button>
            {test.funnel && (
              <Button color="white" onClick={() => nav(`/test/${test.funnel}`)}>
                🔬 {t('quick.deeper', { name: t(`test.${test.funnel}.name`) })}
              </Button>
            )}
            <button onClick={reset} className="w-full py-2 text-[13.5px] font-extrabold text-ink-faint">
              🔄 {t('quick.again')}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── 문항 ──
  const q = test.questions[step]
  return (
    <div className="min-h-dvh pb-10">
      <TopBar back="/quick" title={l(test.title)} />
      <main className="mx-auto max-w-md px-5">
        <div className="mt-1">
          <ProgressBar value={(step + 1) / test.questions.length} />
          <p className="mt-1.5 text-right text-[12px] font-extrabold text-ink-faint">
            {step + 1} / {test.questions.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <h1 className="mt-6 break-keep text-[21px] font-extrabold leading-snug tracking-tight">{l(q.text)}</h1>
            <div className="mt-5 space-y-2.5">
              {q.options.map((op, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  onClick={() => pick(op.to)}
                  className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-4 text-left text-[15.5px] font-bold leading-snug transition-colors active:border-mind-400 active:bg-mind-50"
                >
                  {l(op.text)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
