import { useMemo } from 'react'
import { SPRING } from '../lib/motion'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, TopBar } from '../components/ui'
import { PERSONAS } from '../i18n/animalTranslations'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'

const NEED = 3 // 종합 프로필 해금에 필요한 검사 수

export default function Insight() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const results = useStore((s) => s.results)

  // 검사별 최신 결과 1개씩 (중복 검사 제거)
  const latest = useMemo(() => {
    const byTest: Record<string, (typeof results)[number]> = {}
    for (const r of [...results].sort((a, b) => b.at - a.at)) {
      if (!byTest[r.testId]) byTest[r.testId] = r
    }
    return Object.values(byTest)
  }, [results])

  const personas = useMemo(() => latest.map((r) => r.persona).filter((k) => PERSONAS[k]), [latest])
  const count = latest.length

  const strengths = useMemo(() => {
    const out: typeof PERSONAS.meerkat.strengths = []
    personas.forEach((k) => PERSONAS[k].strengths.slice(0, 1).forEach((s) => out.push(s)))
    return out.slice(0, 4)
  }, [personas])

  const risks = useMemo(() => {
    const out: typeof PERSONAS.meerkat.risks = []
    personas.forEach((k) => PERSONAS[k].risks.slice(0, 1).forEach((s) => out.push(s)))
    return out.slice(0, 3)
  }, [personas])

  // ── 잠금 (검사 부족) ──
  if (count < NEED) {
    return (
      <div className="min-h-dvh pb-36">
        <TopBar back="/profile" title={t('insight.title')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center">
          <div className="text-6xl">🧬</div>
          <h1 className="mt-4 text-[20px] font-extrabold tracking-tight">{t('insight.locked')}</h1>
          <p className="mt-2 break-keep text-[14.5px] font-medium leading-relaxed text-ink-sub">
            {t('insight.lockedSub', { n: NEED - count })}
          </p>
          <div className="mx-auto mt-6 max-w-[240px]">
            <Button color="mind" onClick={() => nav('/')}>
              🧠 {t('insight.takeMore')}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/profile" title={t('insight.title')} />
      <main className="mx-auto max-w-md px-5">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING.ui}
          className="rounded-3xl bg-gradient-to-br from-[#6E7BF2] to-[#9AA6FF] p-6 text-center text-white shadow-pop"
        >
          <div className="text-[40px]">🧬</div>
          <h1 className="mt-2 text-[20px] font-extrabold tracking-tight">{t('insight.headline', { n: count })}</h1>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {personas.map((k) => (
              <span key={k} className="rounded-full bg-white/25 px-2.5 py-1 text-[12.5px] font-extrabold">
                {PERSONAS[k].emoji} {l(PERSONAS[k].name)}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 핵심 강점 */}
        <Card className="mt-4">
          <h2 className="text-[15.5px] font-extrabold text-sky2-600">💪 {t('insight.strengths')}</h2>
          <ul className="mt-2.5 space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 break-keep text-[14.5px] font-medium leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-sky2-500">★</span>
                {l(s)}
              </li>
            ))}
          </ul>
        </Card>

        {/* 주의할 점 */}
        <Card className="mt-4">
          <h2 className="text-[15.5px] font-extrabold text-red-500">⚠️ {t('insight.risks')}</h2>
          <ul className="mt-2.5 space-y-2">
            {risks.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 break-keep text-[14.5px] font-medium leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-red-400">•</span>
                {l(s)}
              </li>
            ))}
          </ul>
        </Card>

        {/* 종합 한마디 */}
        <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#27343A] to-[#1F2A2F] p-6 text-center shadow-pop">
          <h2 className="text-[14px] font-extrabold tracking-wide text-amber-300">🧠 {t('insight.summaryTitle')}</h2>
          <p className="mt-3 break-keep text-[15.5px] font-bold leading-[1.8] text-white/95">{t('insight.summary', { n: count })}</p>
        </div>

        <p className="mt-5 px-2 text-center text-[12px] font-medium leading-relaxed text-ink-faint">{t('insight.disclaimer')}</p>
      </main>
    </div>
  )
}
