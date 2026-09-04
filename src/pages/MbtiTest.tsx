import { useMemo, useState } from 'react'
import { SPRING } from '../lib/motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, TopBar } from '../components/ui'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { sfx } from '../lib/sound'
import { track } from '../lib/analytics'
import { AXES, AXIS_LABEL, MBTI_DEEP, MBTI_QUICK, mbtiByKey, typeFromAxes } from '../data/mbti'

/**
 * 16가지 성격유형 — 일반(12문항 양자택일) · 심층(24문항 5점 척도) 공용 화면.
 *
 * ⚠️ 상표: 'MBTI®'는 등록상표라 앱 문구에서는 쓰지 않는다("16가지 성격유형").
 *    문항·해설 전부 자체 제작이며, 임상 척도(자존감·ADHD 등)와 달리 '탐색 도구'로 표시한다.
 */

const LIKERT: { v: number; label: { ko: string; en: string; ja: string } }[] = [
  { v: 1, label: { ko: '전혀 아니다', en: 'Not at all', ja: '全く違う' } },
  { v: 2, label: { ko: '아닌 편', en: 'Rather not', ja: 'やや違う' } },
  { v: 3, label: { ko: '보통', en: 'Neutral', ja: 'どちらとも' } },
  { v: 4, label: { ko: '그런 편', en: 'Rather yes', ja: 'やや近い' } },
  { v: 5, label: { ko: '매우 그렇다', en: 'Very much', ja: '非常に近い' } },
]

export default function MbtiTest() {
  const { mode } = useParams<{ mode: string }>()
  const l = useL()
  const nav = useNavigate()
  const nickname = useStore((s) => s.nickname)
  const { fire } = useRewardAnimation()
  const deep = mode === 'deep'

  const [step, setStep] = useState(0)
  const [tally, setTally] = useState<Record<string, number>>({})
  const [done, setDone] = useState(false)

  const total = deep ? MBTI_DEEP.length : MBTI_QUICK.length

  /**
   * 축별 첫 극(E/S/T/J) 비율 0~100.
   * 심층은 문항당 4점을 두 극에 배분하므로 (a+b)는 축마다 상수 → 단순 비율로 공정하다.
   * 단 극별 문항 수가 3:3이어야 모순 응답에서 편향이 없다(data/mbti.ts 주석 참조).
   */
  const pct = useMemo(() => {
    const out: Record<string, number> = {}
    for (const [a, b] of AXES) {
      const va = tally[a] ?? 0
      const vb = tally[b] ?? 0
      const sum = va + vb
      out[a] = sum === 0 ? 50 : Math.round((va / sum) * 100)
      out[b] = 100 - out[a]
    }
    return out
  }, [tally])

  const type = useMemo(() => mbtiByKey(typeFromAxes(pct)), [pct])

  if (mode !== 'quick' && mode !== 'deep') return <Navigate to="/" replace />

  const advance = () => {
    if (step + 1 < total) setStep(step + 1)
    else {
      setDone(true)
      fire('win')
      track('mbti_complete', { mode })
    }
  }

  const pickQuick = (to: string) => {
    sfx.tap()
    setTally((p) => ({ ...p, [to]: (p[to] ?? 0) + 1 }))
    advance()
  }

  const pickDeep = (v: number) => {
    sfx.tap()
    const item = MBTI_DEEP[step]
    const other = AXES.flat().find((p) => {
      const pair = AXES.find((ax) => ax.includes(item.pole as never))
      return pair && p !== item.pole && pair.includes(p as never)
    })!
    // 5점 척도를 두 극에 배분 — 3(보통)은 양쪽 동일, 1~2는 반대 극으로
    setTally((p) => ({
      ...p,
      [item.pole]: (p[item.pole] ?? 0) + (v - 1),
      [other]: (p[other] ?? 0) + (5 - v),
    }))
    advance()
  }

  /* ── 결과 ── */
  if (done && type) {
    return (
      <div className="bg-dots min-h-dvh pb-36">
        <TopBar back="/" title={l({ ko: '16가지 성격유형', en: '16 Personality Types', ja: '16の性格タイプ' })} />
        <main className="mx-auto max-w-md px-5">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={SPRING.sheet}
            className="mt-4 rounded-3xl p-6 text-center text-white shadow-pop"
            style={{ background: `linear-gradient(135deg, ${type.grad[0]}, ${type.grad[1]})` }}
          >
            <div className="text-[28px] leading-none">{type.emoji}</div>
            <p className="mt-2 text-[13px] font-semibold tracking-[0.2em] text-white/85">{type.key}</p>
            <h1 className="mt-1 break-keep text-[20px] font-extrabold leading-tight">{l(type.name)}</h1>
            <p className="mt-2 break-keep text-[13px] font-medium leading-relaxed text-white/90">{l(type.tag)}</p>
          </motion.div>

          {/* 4축 게이지 */}
          <Card className="mt-3.5 !p-5">
            <h2 className="text-[15px] font-semibold">
              {l({ ko: '나를 이루는 네 가지', en: 'Your four axes', ja: '4つの軸' })}
            </h2>
            <div className="mt-3 space-y-3">
              {AXES.map(([a, b]) => (
                <div key={a}>
                  <div className="flex items-center justify-between text-[12px] font-semibold">
                    <span className={pct[a] >= 50 ? 'text-mind-700' : 'text-ink-faint'}>
                      {a} · {l(AXIS_LABEL[a])}
                    </span>
                    <span className={pct[b] > 50 ? 'text-mind-700' : 'text-ink-faint'}>
                      {l(AXIS_LABEL[b])} · {b}
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-surface2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct[a]}%` }}
                      transition={SPRING.ui}
                      className="h-full rounded-full bg-gradient-to-r from-mind-500 to-sky2-500"
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] font-medium text-ink-faint">
                    {pct[a]}% · {pct[b]}%
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-3.5 !p-5">
            <p className="break-keep text-[14px] font-medium leading-[1.85] text-ink-sub">{l(type.desc)}</p>
          </Card>

          <Card className="mt-3.5 !p-5">
            <h2 className="text-[15px] font-semibold">{l({ ko: '잘하는 것', en: 'Strengths', ja: '強み' })}</h2>
            <ul className="mt-2 space-y-1.5">
              {type.strengths.map((x, i) => (
                <li key={i} className="break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
                  · {l(x)}
                </li>
              ))}
            </ul>
            <h2 className="mt-4 text-[15px] font-semibold">
              {l({ ko: '조심할 점', en: 'Watch-outs', ja: '注意点' })}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {type.watch.map((x, i) => (
                <li key={i} className="break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
                  · {l(x)}
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-4 space-y-2.5">
            {!deep && (
              <Button color="mind" onClick={() => nav('/mbti/deep', { replace: true })}>
                🔬 {l({ ko: '24문항으로 더 정확하게', en: 'Go deeper — 24 items', ja: '24問の詳細版へ' })}
              </Button>
            )}
            <Button
              color="white"
              onClick={() => {
                setTally({})
                setStep(0)
                setDone(false)
              }}
            >
              🔄 {l({ ko: '다시 하기', en: 'Retake', ja: 'もう一度' })}
            </Button>
          </div>

          <p className="mt-5 break-keep px-2 text-center text-[11px] font-medium leading-relaxed text-ink-faint">
            ⓘ {l({
              ko: '나를 알아가는 재미있는 도구예요. 사람을 16칸에 가두는 진단은 아니고, 병원에서 쓰는 검사와도 달라요.',
              en: 'Type theory is a fun lens for self-exploration — not a diagnosis, and different from clinical scales.',
              ja: 'タイプ論は自己探索の楽しい道具です。診断ではなく、臨床尺度とは性質が異なります。',
            })}
          </p>
        </main>
      </div>
    )
  }

  /* ── 문항 ── */
  const progress = Math.round((step / total) * 100)
  return (
    <div className="bg-dots min-h-dvh pb-24">
      <TopBar
        back="/"
        title={deep ? l({ ko: '자세히 보는 유형검사', en: 'Deep type test', ja: '詳細タイプ検査' }) : l({ ko: '빠른 유형검사', en: 'Quick type test', ja: 'クイックタイプ' })}
      />
      <main className="mx-auto max-w-md px-5">
        <div className="mt-3 flex items-center gap-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface2">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={SPRING.ui}
              className="h-full rounded-full bg-gradient-to-r from-mind-500 to-sky2-500"
            />
          </div>
          <span className="shrink-0 text-[12px] font-semibold text-ink-faint">
            {step + 1}/{total}
          </span>
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={SPRING.ui}>
          <Card className="mt-4 !p-6">
            <p className="break-keep text-center text-[17px] font-semibold leading-tight">
              {deep ? l(MBTI_DEEP[step].text) : l(MBTI_QUICK[step].text)}
            </p>
          </Card>

          <div className="mt-4 space-y-2.5">
            {deep
              ? LIKERT.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => pickDeep(o.v)}
                    className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3.5 text-[15px] font-semibold transition-colors active:border-mind-400 active:bg-mind-50"
                  >
                    {l(o.label)}
                  </button>
                ))
              : MBTI_QUICK[step].options.map((o) => (
                  <button
                    key={o.to}
                    onClick={() => pickQuick(o.to)}
                    className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-4 text-[15px] font-semibold leading-relaxed transition-colors active:border-mind-400 active:bg-mind-50"
                  >
                    {l(o.text)}
                  </button>
                ))}
          </div>
        </motion.div>

        <p className="mt-5 text-center text-[12px] font-medium text-ink-faint">
          {nickname}
          {l({ ko: '님, 정답은 없어요. 지금의 나를 고르면 돼요', en: ', there are no right answers', ja: 'さん、正解はありません' })}
        </p>
      </main>
    </div>
  )
}
