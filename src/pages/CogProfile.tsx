import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import type { TestResult } from '../data/types'

/** 정밀검사 5종 → 인지 영역 5축 */
const METRICS: {
  id: string
  label: { ko: string; en: string; ja: string }
  emoji: string
  color: string
  route: string
  get: (r: TestResult) => number | undefined
}[] = [
  { id: 'iq', label: { ko: '추론(IQ)', en: 'Reasoning', ja: '推論(IQ)' }, emoji: '🧩', color: '#6E7BF2', route: '/test/iq', get: (r) => r.iq },
  { id: 'memory', label: { ko: '작업기억', en: 'Memory', ja: '作業記憶' }, emoji: '🧠', color: '#5B6CF0', route: '/test/memory', get: (r) => r.mq },
  { id: 'focus', label: { ko: '집중력', en: 'Focus', ja: '集中力' }, emoji: '👁️', color: '#14B8A6', route: '/test/focus', get: (r) => r.fq },
  { id: 'speed', label: { ko: '처리속도', en: 'Speed', ja: '処理速度' }, emoji: '⚡', color: '#8B5CF6', route: '/test/speed', get: (r) => r.sq },
  { id: 'spatial', label: { ko: '공간지각', en: 'Spatial', ja: '空間知覚' }, emoji: '🧭', color: '#3B82F6', route: '/test/spatial', get: (r) => r.xq },
]

const CX = 150
const CY = 150
const R = 110
const angle = (i: number) => ((-90 + 72 * i) * Math.PI) / 180
const pt = (i: number, r: number): [number, number] => [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))]
const poly = (rs: number[]) => rs.map((r, i) => pt(i, r).join(',')).join(' ')
/** 지수(60~145) → 레이더 반경 비율(0.05~1) */
const norm = (v: number | null) => (v == null ? 0 : Math.max(0.05, Math.min(1, (v - 60) / 85)))

export default function CogProfile() {
  const l = useL()
  const nav = useNavigate()
  const results = useStore((s) => s.results)

  /* 영역별 최신 점수 */
  const scores = useMemo(
    () =>
      METRICS.map((m) => {
        const latest = results
          .filter((r) => r.testId === m.id)
          .sort((a, b) => b.at - a.at)
          .map((r) => m.get(r))
          .find((v) => v != null)
        return latest ?? null
      }),
    [results],
  )

  const doneCount = scores.filter((s) => s != null).length
  const avg = doneCount > 0 ? Math.round(scores.filter((s): s is number => s != null).reduce((a, b) => a + b, 0) / doneCount) : null
  const strongest = useMemo(() => {
    let bi = -1
    let bv = -1
    scores.forEach((s, i) => {
      if (s != null && s > bv) {
        bv = s
        bi = i
      }
    })
    return bi
  }, [scores])

  const dataRs = scores.map((s) => R * norm(s))

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '인지 프로필', en: 'Cognitive Profile', ja: '認知プロフィール' })} />
      <main className="mx-auto max-w-md px-5">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="rounded-3xl bg-gradient-to-br from-[#5B6CF0] to-[#3B82F6] p-6 text-center text-white shadow-pop"
        >
          <div className="text-[40px] leading-none">🧩</div>
          <h1 className="mt-2 text-[22px] font-extrabold tracking-tight">{l({ ko: '종합 인지 프로필', en: 'Cognitive Profile', ja: '総合認知プロフィール' })}</h1>
          <p className="mt-1.5 text-[13.5px] font-bold text-white/85">
            {avg != null
              ? l({ ko: `정밀검사 ${doneCount}/5 · 종합 ${avg}`, en: `${doneCount}/5 tests · avg ${avg}`, ja: `精密検査 ${doneCount}/5・総合 ${avg}` })
              : l({ ko: '정밀검사를 풀면 인지 지도가 그려져요', en: 'Take precision tests to map your mind', ja: '精密検査を解くと認知地図が描かれます' })}
          </p>
        </motion.div>

        {/* 레이더 차트 */}
        <Card className="mt-4">
          <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[320px]">
            {/* 그리드 링 */}
            {[0.25, 0.5, 0.75, 1].map((k) => (
              <polygon key={k} points={poly([k, k, k, k, k].map((v) => v * R))} fill="none" stroke="rgb(var(--line))" strokeWidth={1} />
            ))}
            {/* 스포크 + 라벨 */}
            {METRICS.map((m, i) => {
              const [lx, ly] = pt(i, R)
              const [tx, ty] = pt(i, R + 24)
              const anchor = Math.abs(tx - CX) < 6 ? 'middle' : tx > CX ? 'start' : 'end'
              return (
                <g key={m.id}>
                  <line x1={CX} y1={CY} x2={lx} y2={ly} stroke="rgb(var(--line))" strokeWidth={1} />
                  <text x={tx} y={ty + 4} textAnchor={anchor} className="fill-ink-sub" fontSize={12.5} fontWeight={800}>
                    {m.emoji}
                  </text>
                  <text x={tx} y={ty + 19} textAnchor={anchor} className="fill-ink-faint" fontSize={10.5} fontWeight={700}>
                    {l(m.label)}
                  </text>
                </g>
              )
            })}
            {/* 데이터 폴리곤 */}
            {doneCount > 0 && (
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                points={poly(dataRs)}
                fill="rgba(91,108,240,0.22)"
                stroke="#5B6CF0"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
            )}
            {/* 데이터 점 */}
            {scores.map((s, i) => {
              if (s == null) return null
              const [x, y] = pt(i, R * norm(s))
              return <circle key={i} cx={x} cy={y} r={4} fill={METRICS[i].color} stroke="#fff" strokeWidth={1.5} />
            })}
          </svg>
        </Card>

        {/* 영역별 점수 리스트 */}
        <div className="mt-4 space-y-2.5">
          {METRICS.map((m, i) => {
            const s = scores[i]
            const isStrong = i === strongest && s != null && doneCount >= 2
            return (
              <Card key={m.id} className="flex items-center gap-3 !p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[20px]" style={{ background: `${m.color}1A` }}>
                  {m.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-extrabold leading-tight">
                    {l(m.label)}
                    {isStrong && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-extrabold text-amber-600">{l({ ko: '최강', en: 'Top', ja: '最強' })}</span>}
                  </p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.round(norm(s) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </div>
                {s != null ? (
                  <span className="shrink-0 text-[18px] font-extrabold" style={{ color: m.color }}>
                    {s}
                  </span>
                ) : (
                  <button onClick={() => nav(m.route)} className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold text-white" style={{ background: m.color }}>
                    {l({ ko: '검사', en: 'Take', ja: '検査' })}
                  </button>
                )}
              </Card>
            )
          })}
        </div>

        {doneCount < 5 && (
          <p className="mt-3 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">
            {l({ ko: `정밀검사 ${5 - doneCount}종을 더 풀면 인지 지도가 완성돼요.`, en: `Take ${5 - doneCount} more precision tests to complete your map.`, ja: `あと${5 - doneCount}種でマップが完成します。` })}
          </p>
        )}

        <div className="mt-5">
          <AdSlot variant="rect" />
        </div>
      </main>
    </div>
  )
}
