import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card } from './ui'
import type { TestId } from '../data/types'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'

/** 심리 날씨 — 같은 검사를 다시 받을수록 상위% 추이를 보여줘 변화를 체감하게 함 */
export default function Trend({ testId }: { testId: TestId }) {
  const t = useT()
  const results = useStore((s) => s.results)

  const series = useMemo(
    () =>
      results
        .filter((r) => r.testId === testId)
        .sort((a, b) => a.at - b.at)
        .slice(-8), // 최근 8회
    [results, testId],
  )

  if (series.length < 2) return null // 재검사 2회 이상부터 표시

  const W = 300
  const H = 80
  const PAD = 10
  const vals = series.map((r) => Math.round((100 - r.percentile) * 10) / 10) // 상위% (낮을수록 상위)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = Math.max(1, max - min)
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (series.length - 1)
  const y = (v: number) => PAD + (1 - (v - min) / span) * (H - 2 * PAD)
  const line = vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  const last = vals[vals.length - 1]
  const prev = vals[vals.length - 2]
  const delta = Math.round((last - prev) * 10) / 10 // 상위% 변화 (음수=상위권으로 이동)
  const up = delta < 0 // 상위%가 낮아짐 = 순위 상승

  return (
    <Card className="mt-4 !p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold">{t('trend.title')}</h2>
        <span className="text-[12px] font-semibold text-ink-faint">{t('trend.count', { n: series.length })}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" preserveAspectRatio="none" style={{ height: 80 }}>
        <motion.path
          d={line}
          fill="none"
          stroke="#4FA882"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {vals.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === vals.length - 1 ? 5 : 3.5} fill={i === vals.length - 1 ? '#2F6B52' : '#4FA882'} />
        ))}
      </svg>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-faint">
          {new Date(series[0].at).toLocaleDateString()} → {new Date(series[series.length - 1].at).toLocaleDateString()}
        </span>
        <span className={`text-[13px] font-semibold ${delta === 0 ? 'text-ink-faint' : up ? 'text-mind-700' : 'text-amber-600'}`}>
          {delta === 0 ? t('trend.same') : t(up ? 'trend.up' : 'trend.down', { p: Math.abs(delta) })}
        </span>
      </div>
    </Card>
  )
}
