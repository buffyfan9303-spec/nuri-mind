import { useEffect, useState } from 'react'
import { useSkeletonGate } from '../hooks/useSkeletonGate'
import { motion } from 'framer-motion'
import Button from './Button'
import type { Persona } from '../i18n/animalTranslations'
import type { TestResult } from '../data/types'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { FUNCTIONS_URL, ANON_KEY } from '../lib/supabase'
import { fetchWithTimeout, TIMEOUT } from '../lib/net'
import Emoji from './Emoji'
import { topPercentOf } from '../lib/format'

/**
 * 정밀 분석 리포트 — 버튼 한 번으로 펼친다(예전엔 5초 대기 게이트를 거쳤으나 광고 없는 강제 대기라 없앰).
 * 해금 후 Supabase Edge Function(ai-report)이 배포돼 있으면 Claude가 쓴 맞춤 종합 해석을
 * 1회 생성해 캐싱(결과별). 미배포/실패 시 기존 정적 페르소나 해석으로 자동 폴백.
 */
export default function AiReport({ result, persona }: { result: TestResult; persona: Persona }) {
  const t = useT()
  const l = useL()
  const lang = useStore((s) => s.lang)
  const aiReports = useStore((s) => s.aiReports)
  const unlockAi = useStore((s) => s.unlockAi)
  const aiReportText = useStore((s) => s.aiReportText)
  const setAiReportText = useStore((s) => s.setAiReportText)
  const [loading, setLoading] = useState(false)

  const unlocked = aiReports.includes(result.id)
  const cached = aiReportText[result.id]
  // 응답이 200ms 안에 오면 스켈레톤을 그리지 않는다 — 캐시 히트 직후의 번쩍임 방지
  const showLoading = useSkeletonGate(loading && !cached)
  const topPercent = topPercentOf(result.percentile)

  // 해금됐고 캐시가 없으면 Edge Function으로 1회 생성(키 미설정/실패 시 정적 폴백)
  useEffect(() => {
    if (!unlocked || cached || loading) return
    if (!FUNCTIONS_URL || !ANON_KEY) return
    let cancel = false
    setLoading(true)
    // 제한 시간이 지나면 catch → finally로 로딩이 풀리고 정적 페르소나 해석이 남는다
    fetchWithTimeout(`${FUNCTIONS_URL}/ai-report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
      body: JSON.stringify({
        testName: t(`test.${result.testId}.name`),
        band: t(`band.${result.testId}.${result.band}`),
        topPercent,
        persona: l(persona.name),
        strengths: persona.strengths.map(l),
        risks: persona.risks.map(l),
        solutions: persona.solutions.map(l),
        lang,
      }),
    }, TIMEOUT.ai)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancel && d && typeof d.text === 'string') setAiReportText(result.id, d.text) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, cached])

  if (!unlocked) {
    return (
        <div className="relative mt-4 overflow-hidden rounded-3xl border-2 border-[#E7D9E0] bg-gradient-to-br from-[#FBF4F8] to-[#F3EEFC] dark:from-surface dark:to-surface p-5">
          <h2 className="text-[16px] font-extrabold text-dk-deep">{t('ai.title')}</h2>
          <p className="mt-1 text-[13px] font-bold text-ink-sub">{t('ai.sub')}</p>
          <p className="mt-3 select-none text-[14px] font-bold leading-[1.7] text-ink/80 blur-[5px]">
            {l(persona.desc).slice(0, 120)}…
          </p>
          <div className="mt-4">
            <Button color="dk" onClick={() => unlockAi(result.id)}>
              {/* dict의 'ai.unlock'은 '광고 보고 무료로 열기' — 광고가 없어졌으니 인라인 문구로 대체 */}
              {l({ ko: '무료로 열기', en: 'Open for free', ja: '無料で開く' })}
            </Button>
            {/* 전송 고지 — 누르기 전에 무엇이 어디로 가는지(legalDocs 개인정보처리방침의 'AI 해석' 수집 항목·국외 이전 항목과 같은 내용) */}
            <p className="mt-2 break-keep text-[11px] font-bold leading-relaxed text-ink-faint">
              {l({
                ko: 'ⓘ 열면 검사 이름·결과 구간·백분위·성향 요약이 해석 생성을 위해 외부 AI 서비스로 전송돼요. 이름은 보내지 않아요.',
                en: 'ⓘ Opening sends the test name, result band, percentile and trait summary to an external AI service to write the interpretation. Your name is not sent.',
                ja: 'ⓘ 開くと、検査名・結果区分・パーセンタイル・傾向の要約が解釈生成のため外部AIサービスへ送信されます。名前は送信しません。',
              })}
            </p>
          </div>
        </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-3xl border-2 border-[#E7D9E0] bg-gradient-to-br from-[#FBF4F8] to-[#F3EEFC] dark:from-surface dark:to-surface p-5"
    >
      <h2 className="text-[16px] font-extrabold text-dk-deep">{t('ai.full')}</h2>
      <p className="mt-2 text-[13px] font-bold text-ink-sub">
        {t('ai.intro', { p: topPercent, band: t(`band.${result.testId}.${result.band}`) })}
      </p>

      {loading && !cached ? (
        showLoading && (
          <div className="mt-3 space-y-2">
            <div className="h-3.5 w-full motion-safe:animate-pulse rounded bg-surface2" />
            <div className="h-3.5 w-11/12 motion-safe:animate-pulse rounded bg-surface2" />
            <div className="h-3.5 w-4/6 motion-safe:animate-pulse rounded bg-surface2" />
            <p className="pt-1 text-[12px] font-bold text-ink-faint">{t('ai.loading')}</p>
          </div>
        )
      ) : (
        <>
          {cached && (
            <span className="mt-3 inline-block rounded-full bg-dk/10 px-2.5 py-0.5 text-[11px] font-extrabold text-dk-deep"><Emoji e="✨" inline />AI</span>
          )}
          <p className="mt-2 whitespace-pre-line text-[14px] font-bold leading-[1.8] text-ink">{cached || l(persona.desc)}</p>
        </>
      )}

      <div className="mt-4 space-y-3.5">
        <Section title={`${t('result.riskTitle')}`} items={persona.risks.map(l)} mark="•" color="#EF4444" />
        <Section title={`${t('result.solutionTitle')}`} items={persona.solutions.map(l)} mark="✓" color="#10B981" />
        <Section title={`${t('result.strengthTitle')}`} items={persona.strengths.map(l)} mark="★" color="#6E9FDC" />
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
          <li key={i} className="flex items-start gap-2 text-[14px] font-bold leading-[1.7] text-ink">
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
