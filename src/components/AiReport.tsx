import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AdGate from './AdGate'
import Button from './Button'
import type { Persona } from '../i18n/animalTranslations'
import type { TestResult } from '../data/types'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'

/**
 * 정밀 분석 리포트(유료 잠금) — 표준 결과보다 깊은 전체 해석.
 * 검사 결과 데이터를 종합해 보여주며, 보상형 광고 시청으로 무료 해금(수익화 지점).
 * 해금 상태는 결과별로 저장.
 */
export default function AiReport({ result, persona }: { result: TestResult; persona: Persona }) {
  const t = useT()
  const l = useL()
  const aiReports = useStore((s) => s.aiReports)
  const unlockAi = useStore((s) => s.unlockAi)
  const [gate, setGate] = useState(false)

  const unlocked = aiReports.includes(result.id)
  const topPercent = Math.max(0.5, Math.round((100 - result.percentile) * 10) / 10)

  if (!unlocked) {
    return (
      <>
        <div className="relative mt-4 overflow-hidden rounded-3xl border-2 border-[#E7D9E0] bg-gradient-to-br from-[#FBF4F8] to-[#F3EEFC] p-5">
          <h2 className="text-[16px] font-extrabold tracking-tight text-dk-deep">{t('ai.title')}</h2>
          <p className="mt-1 text-[13.5px] font-bold text-ink-sub">{t('ai.sub')}</p>
          {/* 블러 처리된 미리보기 3줄 */}
          <p className="mt-3 select-none text-[14px] font-medium leading-[1.7] text-ink/80 blur-[5px]">
            {l(persona.desc).slice(0, 120)}…
          </p>
          <div className="mt-4">
            <Button color="dk" onClick={() => setGate(true)}>
              {t('ai.unlock')}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {gate && <AdGate onDone={() => { setGate(false); unlockAi(result.id) }} />}
        </AnimatePresence>
      </>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-3xl border-2 border-[#E7D9E0] bg-gradient-to-br from-[#FBF4F8] to-[#F3EEFC] p-5"
    >
      <h2 className="text-[16px] font-extrabold tracking-tight text-dk-deep">{t('ai.full')}</h2>
      <p className="mt-2 text-[13px] font-bold text-ink-sub">
        {t('ai.intro', { p: topPercent, band: t(`band.${result.testId}.${result.band}`) })}
      </p>
      <p className="mt-3 text-[14.5px] font-medium leading-[1.8] text-ink">{l(persona.desc)}</p>

      <div className="mt-4 space-y-3.5">
        <Section title={`⚠️ ${t('result.riskTitle')}`} items={persona.risks.map(l)} mark="•" color="#EF4444" />
        <Section title={`💊 ${t('result.solutionTitle')}`} items={persona.solutions.map(l)} mark="✓" color="#10B981" />
        <Section title={`💪 ${t('result.strengthTitle')}`} items={persona.strengths.map(l)} mark="★" color="#6E9FDC" />
      </div>
    </motion.div>
  )
}

function Section({ title, items, mark, color }: { title: string; items: string[]; mark: string; color: string }) {
  return (
    <div>
      <h3 className="text-[14px] font-extrabold" style={{ color }}>
        {title}
      </h3>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-[14px] font-medium leading-[1.7] text-ink">
            <span className="mt-0.5 shrink-0" style={{ color }}>
              {mark}
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}
