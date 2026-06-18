import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
import { TopBar, Card } from '../components/ui'
import { testMeta } from '../data/tests'
import type { TestId } from '../data/types'
import { useT, useL } from '../i18n/useT'
import { useStore, IQ_DIA_COST } from '../store/useStore'

export default function TestIntro() {
  const { id } = useParams<{ id: TestId }>()
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const tm = testMeta(id as TestId)
  const iqUnlocked = useStore((s) => s.iqUnlocked)

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t(`test.${id}.name`)} />
      <main className="mx-auto max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="rounded-3xl p-6 text-center shadow-pop"
          style={{ background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="text-6xl"
          >
            {tm.emoji}
          </motion.div>
          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-white">{t(`test.${id}.name`)}</h1>
          <p className="mt-1.5 text-[15.5px] font-bold leading-relaxed tracking-wide text-white/90">{t(`test.${id}.desc`)}</p>
          <div className="mt-4 flex justify-center gap-2 text-[13px] font-extrabold">
            <span className="rounded-full bg-white/25 px-3 py-1.5 text-white">
              {tm.count} {t('intro.questions')}
            </span>
            <span className="rounded-full bg-white/25 px-3 py-1.5 text-white">
              ⏱ {tm.minutes}
              {t('common.min')}
            </span>
            {id === 'iq' && <span className="rounded-full bg-white/25 px-3 py-1.5 text-white">{t('intro.timed')}</span>}
          </div>
        </motion.div>

        <Card className="mt-4">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">📚 {t('intro.basis')}</h2>
          <p className="mt-2.5 text-[15px] font-medium leading-[1.8] tracking-wide text-[#6B756E]">
            {t(`intro.${id}.basis`)}
          </p>
        </Card>

        {/* 광고 — 본문 중단(고시선 영역) */}
        <div className="mt-4">
          <AdSlot variant="banner" />
        </div>

        <Card className="mt-4">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">🤙 {t('intro.caution')}</h2>
          <ul className="mt-3 space-y-2.5">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-start gap-2.5 text-[15.5px] font-bold leading-relaxed">
                <span className="mt-0.5 text-mind-600">✓</span>
                {t(`intro.${id}.c${n}`)}
              </li>
            ))}
          </ul>
        </Card>

        {id === 'adhd' && (
          <p className="mt-3 px-2 text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('result.medical')}</p>
        )}

        {id === 'iq' && (
          <Card className={`mt-4 ${iqUnlocked ? '!bg-[#EFFaf4]' : '!bg-[#F7F6FE]'}`}>
            <div className="flex items-start gap-3">
              <span className="text-[26px]">{iqUnlocked ? '✅' : '🔒'}</span>
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-extrabold">
                  {iqUnlocked
                    ? l({ ko: '정밀 IQ 해제됨', en: 'Precision IQ unlocked', ja: '精密IQ解除済み' })
                    : l({ ko: '검사는 무료 · 결과지 상세는 잠금', en: 'Test is free · detailed result locked', ja: '検査は無料・詳細結果はロック' })}
                </h3>
                <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
                  {iqUnlocked
                    ? l({ ko: '결과지 전체(IQ 점수·인지영역별 분석·강점/주의)를 볼 수 있어요.', en: 'You can see the full result — IQ score, cognitive breakdown, strengths.', ja: '結果全体（IQスコア・認知領域分析・強み）が見られます。' })
                    : l({ ko: `검사는 무료로 풀고 IQ 점수까지 바로 공개돼요. 인지영역별 정밀 분석·강점/주의는 💎${IQ_DIA_COST}로 한 번만 해제하면 영구 이용돼요.`, en: `Take it free and see your IQ score. The detailed cognitive analysis unlocks for 💎${IQ_DIA_COST} — once, forever.`, ja: `検査は無料でIQスコアまで公開。認知領域別の精密分析は💎${IQ_DIA_COST}で一度解除すれば永久利用。` })}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-5">
          <Button color={tm.btn} size="lg" onClick={() => nav(`/test/${id}/run`)}>
            {t('common.start')} →
          </Button>
        </div>
      </main>
    </div>
  )
}
