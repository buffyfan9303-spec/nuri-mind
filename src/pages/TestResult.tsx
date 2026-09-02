import { useEffect, useRef, useState } from 'react'
import { SPRING } from '../lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import AdGate from '../components/AdGate'
import AdSlot from '../components/AdSlot'
import Gauge from '../components/Gauge'
import AiReport from '../components/AiReport'
import Trend from '../components/Trend'
import { ROUTINES } from '../data/routines'
import type { TestId } from '../data/types'
import { Card, Chip, TopBar, Modal } from '../components/ui'
import { PERSONAS } from '../i18n/animalTranslations'
import { testMeta } from '../data/tests'
import { LOVE_CHEMI } from '../data/love'
import { useStore, IQ_DIA_COST } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { celebrate, burst } from '../lib/confetti'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { makeResultCard, shareCardBlob } from '../lib/shareCard'
import { kakaoEnabled, shareKakao } from '../lib/kakao'
import { track } from '../lib/analytics'
import { sfx } from '../lib/sound'
import { encodeDuel } from '../lib/duel'

/** 정밀검사 전용 실행 라우트 — 문항뱅크(/test/:id/run)가 아니라 인지과제 화면으로 보내야 한다 */
const PRECISION_RUN: Partial<Record<TestId, string>> = {
  memory: '/memory/run',
  focus: '/focus/run',
  speed: '/speed/run',
  spatial: '/spatial/run',
  switch: '/switch/run',
}

export default function TestResult() {
  const { rid } = useParams<{ rid: string }>()
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const location = useLocation()
  const results = useStore((s) => s.results)
  const result = results.find((r) => r.id === rid)

  const state = (location.state ?? {}) as { fresh?: boolean; reward?: number }
  const [gate, setGate] = useState(Boolean(state.fresh))
  const [copied, setCopied] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const [avatarSet, setAvatarSet] = useState(false)
  const [cardTheme, setCardTheme] = useState(0)
  const [needCharge, setNeedCharge] = useState(false)
  const shareReward = useStore((s) => s.shareReward)
  const setAvatar = useStore((s) => s.setAvatar)
  const iqUnlocked = useStore((s) => s.iqUnlocked)
  const unlockIq = useStore((s) => s.unlockIq)
  const precisionGate = useStore((s) => s.precisionGate)
  const precisionUnlocked = useStore((s) => s.precisionUnlocked)
  const unlockPrecision = useStore((s) => s.unlockPrecision)
  const diamonds = useStore((s) => s.diamonds)
  const nickname = useStore((s) => s.nickname)
  const { fire } = useRewardAnimation()
  const celebrated = useRef(false)

  useEffect(() => {
    if (!gate && state.fresh && !celebrated.current) {
      celebrated.current = true
      fire('win')
    }
  }, [gate, state.fresh])

  if (!result) return <Navigate to="/" replace />
  const persona = PERSONAS[result.persona]
  // 이 결과로 '처음 얻은' 동물인지 — 획득 순간에 수집 쾌감을 주는 축하 배지(도감은 갤러리 역할)
  const isNewAnimal = !results.some((r) => r.id !== result.id && r.persona === result.persona)
  const tm = testMeta(result.testId)

  /* 카드 배경 테마 — 기본(페르소나)/다크/파스텔 */
  const CARD_THEMES: { label: string; grad?: [string, string]; swatch: [string, string] }[] = [
    { label: '기본', swatch: persona.grad },
    { label: '다크', grad: ['#27343A', '#46607A'], swatch: ['#27343A', '#46607A'] },
    { label: '파스텔', grad: ['#FBD3E9', '#A9C9EE'], swatch: ['#FBD3E9', '#A9C9EE'] },
  ]
  const topPercent = Math.max(0.5, Math.round((100 - result.percentile) * 10) / 10)
  const reward = state.reward ?? 0

  /* 정밀검사 결과지 게이팅 — 앞(히어로·점수·게이지)은 무료, 상세 분석은 블러 → 10다이아 영구해제.
     · IQ 정밀(pro): iqUnlocked  · 기억/집중/처리속도/공간: precisionGate(운영자 토글) ON일 때 precisionUnlocked */
  const PRECISION_GATED = ['memory', 'focus', 'speed', 'spatial', 'switch']
  const lockedIq = result.testId === 'iq' && result.iqMode === 'pro' && !iqUnlocked
  const lockedPrecision = precisionGate && PRECISION_GATED.includes(result.testId) && !precisionUnlocked
  const locked = lockedIq || lockedPrecision
  const tryUnlockIqResult = () => {
    const ok = lockedIq ? unlockIq() : unlockPrecision()
    if (!ok) {
      setNeedCharge(true)
      return
    }
    fire('coin')
  }

  /* 검사별 게이지 제목 (키 없으면 기본 제목) */
  const gaugeKey = `result.gauge.${result.testId}`
  const gaugeTitle = t(gaugeKey) === gaugeKey ? t('result.percentileTitle') : t(gaugeKey)

  /* 검사별 3축 정의 */
  const AXIS_DEFS: Record<string, ReadonlyArray<readonly [string, string, string]>> = {
    ego: [
      ['alt', 'result.axisAlt', '#4FA882'],
      ['self', 'result.axisSelf', '#FF6F61'],
      ['str', 'result.axisStr', '#6E7BF2'],
    ],
    love: [
      ['anx', 'result.axisAnx', '#F25C8E'],
      ['avo', 'result.axisAvo', '#8C9BA8'],
      ['sec', 'result.axisSec', '#4FA882'],
    ],
    dark: [
      ['ma', 'result.axisMa', '#A23E63'],
      ['na', 'result.axisNa', '#C04E7C'],
      ['ps', 'result.axisPs', '#7C2D49'],
    ],
  }
  const axisDefs = AXIS_DEFS[result.testId]

  /* 전문가(의사·상담) 권유가 필요한 심각 구간 */
  const doctorBands: Partial<Record<string, string[]>> = {
    adhd: ['high'],
    burnout: ['high'],
    dopamine: ['high'],
    love: ['fearful'],
    selfesteem: ['low'],
    perfect: ['strain'],
    socialanx: ['high'],
  }
  const needsDoctor = doctorBands[result.testId]?.includes(result.band) ?? false

  /* 연애 케미 / ADHD×번아웃 교차 분석 */
  const chemi = result.testId === 'love' ? LOVE_CHEMI[result.band] : null
  const adhdRes = result.testId === 'burnout' ? results.find((r) => r.testId === 'adhd') : undefined
  const crossKey = adhdRes
    ? (() => {
        const a = adhdRes.band === 'high' || adhdRes.band === 'caution'
        const b = result.band === 'high' || result.band === 'caution'
        return a && b ? 'cross.both' : a ? 'cross.adhdOnly' : b ? 'cross.burnOnly' : 'cross.none'
      })()
    : null

  const afterShare = () => {
    const g = shareReward(result.id)
    if (g > 0) {
      burst()
      sfx.coin()
      setShareMsg(t('share.earned', { p: g }))
      setTimeout(() => setShareMsg(''), 2200)
    }
  }

  const share = async () => {
    const text = t('result.shareText', {
      test: t(`test.${result.testId}.name`),
      persona: l(persona.name),
      p: topPercent,
    })
    try {
      if (navigator.share) await navigator.share({ text, url: window.location.origin })
      else throw new Error()
    } catch {
      try {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      } catch {
        /* noop */
      }
    }
    afterShare()
  }

  /** 결과 카드 PNG 생성 → 공유/저장 (바이럴 루프) */
  const shareCard = async () => {
    try {
      const grad = CARD_THEMES[cardTheme].grad ?? persona.grad
      const blob = await makeResultCard({
        emoji: persona.emoji,
        name: l(persona.name),
        title: l(persona.title),
        subtitle: l(persona.tagline),
        bandLabel: t(`band.${result.testId}.${result.band}`),
        topPercent,
        testName: t(`test.${result.testId}.name`),
        grad,
        iq: result.iq,
        scoreChip:
          result.mq != null
            ? `MQ ${result.mq}`
            : result.fq != null
              ? `FQ ${result.fq}`
              : result.sq != null
                ? `SQ ${result.sq}`
                : result.xq != null
                  ? `XQ ${result.xq}`
                  : undefined,
        appName: t('app.name'),
      })
      const how = await shareCardBlob(
        blob,
        t('result.shareText', { test: t(`test.${result.testId}.name`), persona: l(persona.name), p: topPercent }),
      )
      if (how === 'downloaded') {
        setShareMsg(t('share.saved'))
        setTimeout(() => setShareMsg(''), 2200)
      }
      afterShare()
    } catch {
      sfx.err()
    }
  }

  const shareDuel = async () => {
    const enc = encodeDuel({ t: result.testId, p: result.percentile, b: result.band, n: nickname, a: result.persona })
    const url = `${window.location.origin}/api/duel?r=${enc}` // 크롤러=동적 OG, 사람=/vs로 리다이렉트
    const text = l({
      ko: `나랑 ${t(`test.${result.testId}.name`)} 대결할래? 누가 이기나 보자! 🆚`,
      en: `Beat my ${t(`test.${result.testId}.name`)} result? 🆚`,
      ja: `${t(`test.${result.testId}.name`)}で勝負しよう！🆚`,
    })
    try {
      if (navigator.share) await navigator.share({ title: '누리 마인드 결과 대결', text, url })
      else {
        await navigator.clipboard.writeText(url)
        setShareMsg(l({ ko: '🆚 대결 링크가 복사됐어요!', en: '🆚 Duel link copied!', ja: '🆚 リンクをコピー！' }))
        setTimeout(() => setShareMsg(''), 2400)
      }
      track('share', { channel: 'duel' })
    } catch {
      /* 사용자 취소 — 무시 */
    }
  }

  return (
    <div className="min-h-dvh pb-36">
      <AnimatePresence>{gate && <AdGate onDone={() => setGate(false)} />}</AnimatePresence>

      <TopBar back="/" title={t('result.title')} />

      <main className="mx-auto max-w-md px-5">
        {/* 페르소나 히어로 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={gate ? {} : { opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING.ui, delay: 0.05 }}
          className="rounded-3xl p-7 text-center shadow-pop"
          style={{ background: `linear-gradient(140deg, ${persona.grad[0]}, ${persona.grad[1]})` }}
        >
          <div className="relative mx-auto h-28 w-28">
            {/* 파티클 링 — 이모지 팝과 함께 사방으로 퍼짐 */}
            {!gate &&
              [
                { e: '✨', a: -90 }, { e: '⭐', a: -45 }, { e: '💫', a: 0 }, { e: '✨', a: 45 },
                { e: '⭐', a: 90 }, { e: '💫', a: 135 }, { e: '✨', a: 180 }, { e: '⭐', a: 225 },
              ].map((s, i) => {
                const rad = (s.a * Math.PI) / 180
                return (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 text-[17px] leading-none"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ x: Math.cos(rad) * 82, y: Math.sin(rad) * 82, scale: [0, 1.1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.95, delay: 0.34 + i * 0.025, ease: 'easeOut' }}
                  >
                    {s.e}
                  </motion.span>
                )
              })}
            <motion.div
              initial={{ scale: 0 }}
              animate={gate ? {} : { scale: 1, rotate: [0, -8, 6, 0] }}
              transition={{ ...SPRING.sheet, delay: 0.25 }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-white/90 text-6xl shadow-pop"
            >
              {persona.emoji}
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={gate ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.3 }}
            className="mt-4 text-[15px] font-semibold text-white/85"
          >
            {l(persona.title)}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={gate ? {} : { opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING.flick, delay: 0.5 }}
            className="mt-1 text-[28px] font-extrabold tracking-tight text-white"
          >
            {l(persona.name)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={gate ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.3 }}
            className="mt-2.5 text-[15px] font-bold leading-relaxed text-white/90"
          >
            “{l(persona.tagline)}”
          </motion.p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
              {t(`band.${result.testId}.${result.band}`)}
            </span>
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
              {t('result.topPercent', { p: topPercent })}
            </span>
            {result.testId === 'adhd' && result.screener !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                {t('result.screener', { n: result.screener })}
              </span>
            )}
            {result.testId === 'iq' && result.iq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                {t('result.iqLabel')} {result.iq}
              </span>
            )}
            {result.testId === 'memory' && result.mq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                MQ {result.mq}
              </span>
            )}
            {result.testId === 'focus' && result.fq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                FQ {result.fq}
              </span>
            )}
            {result.testId === 'speed' && result.sq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                SQ {result.sq}
              </span>
            )}
            {result.testId === 'spatial' && result.xq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                XQ {result.xq}
              </span>
            )}
            {result.testId === 'switch' && result.wq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                WQ {result.wq}
              </span>
            )}
          </div>
        </motion.div>

        {/* 보상 배너 */}
        {reward > 0 && !gate && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.flick, delay: 0.5 }}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-mind-100 py-3.5 text-[15px] font-semibold text-mind-700"
          >
            🪙 {t('result.reward', { p: reward })}
          </motion.div>
        )}

        {/* 가면 지수 경고 (EGO) */}
        {result.maskFlag && (
          <Card className="mt-4 !bg-amber-50">
            <h3 className="text-[16px] font-semibold text-amber-700">{t('result.maskTitle')}</h3>
            <p className="mt-1.5 text-[14px] font-medium leading-[1.75] text-amber-700/90">{t('result.maskDesc')}</p>
          </Card>
        )}

        {/* 백분위 게이지 */}
        <Card className="mt-4 text-center">
          <h2 className="text-[16px] font-semibold">{gaugeTitle}</h2>
          <div className="mt-3">
            {result.testId === 'iq' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-iq-deep">{result.iq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.iqLabel')}</p>
                <div className="mt-4">
                  <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
                </div>
              </>
            ) : result.testId === 'memory' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-iq-deep">{result.mq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.mqLabel')}</p>
                <div className="mt-4">
                  <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
                </div>
              </>
            ) : result.testId === 'focus' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-reso-deep">{result.fq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.fqLabel')}</p>
                {result.axes && (
                  <p className="mt-1 text-[12px] font-medium text-ink-faint">
                    {l({
                      ko: `평균 반응 ${result.axes.rt}ms · 정확도 ${result.axes.acc}%`,
                      en: `avg ${result.axes.rt}ms · ${result.axes.acc}% accuracy`,
                      ja: `平均反応 ${result.axes.rt}ms・正確度 ${result.axes.acc}%`,
                    })}
                  </p>
                )}
                <div className="mt-4">
                  <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
                </div>
              </>
            ) : result.testId === 'switch' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-iq-deep">{result.wq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.wqLabel')}</p>
                {result.axes && (
                  <p className="mt-1 text-[12px] font-medium text-ink-faint">
                    {l({
                      ko: `평균 ${(result.axes.rt / 1000).toFixed(1)}초 · 정확도 ${result.axes.acc}% · 전환비용 ${result.axes.cost}ms`,
                      en: `avg ${(result.axes.rt / 1000).toFixed(1)}s · ${result.axes.acc}% · switch cost ${result.axes.cost}ms`,
                      ja: `平均 ${(result.axes.rt / 1000).toFixed(1)}秒・正確度 ${result.axes.acc}%・切替コスト ${result.axes.cost}ms`,
                    })}
                  </p>
                )}
                <div className="mt-4">
                  <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
                </div>
              </>
            ) : result.testId === 'spatial' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-iq-deep">{result.xq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.xqLabel')}</p>
                {result.axes && (
                  <p className="mt-1 text-[12px] font-medium text-ink-faint">
                    {l({
                      ko: `평균 ${(result.axes.rt / 1000).toFixed(1)}초 · 정확도 ${result.axes.acc}%`,
                      en: `avg ${(result.axes.rt / 1000).toFixed(1)}s · ${result.axes.acc}% accuracy`,
                      ja: `平均 ${(result.axes.rt / 1000).toFixed(1)}秒・正確度 ${result.axes.acc}%`,
                    })}
                  </p>
                )}
                <div className="mt-4">
                  <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
                </div>
              </>
            ) : result.testId === 'speed' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-iq-deep">{result.sq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.sqLabel')}</p>
                {result.axes && (
                  <p className="mt-1 text-[12px] font-medium text-ink-faint">
                    {l({
                      ko: `${result.axes.count}개 정답 · 개당 ${result.axes.ms}ms · 정확도 ${result.axes.acc}%`,
                      en: `${result.axes.count} correct · ${result.axes.ms}ms each · ${result.axes.acc}% accuracy`,
                      ja: `${result.axes.count}問正解・1問${result.axes.ms}ms・正確度 ${result.axes.acc}%`,
                    })}
                  </p>
                )}
                <div className="mt-4">
                  <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
                </div>
              </>
            ) : (
              <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
            )}
          </div>
        </Card>

        {/* 빠른 IQ → 정밀 IQ 업셀 (더 정확한 측정으로 유도) */}
        {result.testId === 'iq' && result.iqMode === 'fast' && !gate && (
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.ui, delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => nav('/test/iq/run?mode=pro')}
            className="mt-4 flex w-full items-center gap-3 rounded-3xl p-4 text-left text-white shadow-pop"
            style={{ background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
          >
            <motion.span animate={{ rotate: [0, -10, 8, 0] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 1.5 }} className="text-[28px]">
              🔬
            </motion.span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-tight">
                {l({ ko: '정밀 IQ로 더 정확하게 측정', en: 'Measure more precisely', ja: '精密IQでもっと正確に' })}
              </h3>
              <p className="mt-0.5 break-keep text-[12px] font-medium text-white/90">
                {l({
                  ko: '20문항 · 인지영역별 분석 · 정밀 점수로 다시 보기 →',
                  en: '20 Qs · cognitive breakdown · precise score →',
                  ja: '20問・認知領域分析・精密スコアで →',
                })}
              </p>
            </div>
            <span className="shrink-0 text-lg text-white/80">›</span>
          </motion.button>
        )}

        {/* 심리 날씨 — 재검사 추이 (2회 이상부터) */}
        <Trend testId={result.testId} />

        {/* 광고 — 게이지 직하단(고시선 영역) */}
        <div className="mt-4">
          <AdSlot variant="banner" />
        </div>

        {/* 검사별 3축 카드 */}
        {result.axes && axisDefs && (
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {axisDefs.map(([key, label, color]) => (
              <Card key={key} className="!p-3.5 text-center">
                <div className="text-[20px] font-extrabold" style={{ color }}>
                  {Math.round(result.axes![key])}
                </div>
                <div className="mt-0.5 text-[11px] font-medium tracking-wide text-ink-sub">{t(label)}</div>
              </Card>
            ))}
          </div>
        )}

        {/* 연애 케미 매칭 — 공유 트리거 */}
        {chemi && (
          <Card className="mt-4">
            <h2 className="text-[16px] font-semibold">{t('love.chemi')}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-mind-50 px-3 py-3.5 text-center">
                <p className="text-[12px] font-semibold tracking-wide text-mind-600">💖 {t('love.best')}</p>
                <p className="mt-1.5 text-[15px] font-semibold">
                  {PERSONAS[chemi.best].emoji} {l(PERSONAS[chemi.best].name)}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 px-3 py-3.5 text-center">
                <p className="text-[12px] font-semibold tracking-wide text-red-400">💥 {t('love.worst')}</p>
                <p className="mt-1.5 text-[15px] font-semibold">
                  {PERSONAS[chemi.worst].emoji} {l(PERSONAS[chemi.worst].name)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Button color="love" onClick={() => nav('/chemi')}>
                💌 {t('chemi.cta')}
              </Button>
            </div>
          </Card>
        )}

        {/* ADHD × 번아웃 교차 분석 */}
        {crossKey && (
          <Card className="mt-4 !bg-burn-light">
            <h2 className="text-[15px] font-semibold text-burn-deep">{t('cross.title')}</h2>
            <p className="mt-2 text-[14px] font-medium leading-[1.8] text-ink">{t(crossKey)}</p>
          </Card>
        )}

        {/* ── IQ 결과지 게이팅: 앞(히어로·점수)은 무료, 상세 분석은 블러 → 10다이아 ── */}
        <div className="relative">
          <div className={locked ? 'pointer-events-none select-none blur-[7px]' : ''} aria-hidden={locked || undefined}>
        {/* 세부 회로 */}
        <Card className="mt-4">
          <h2 className="text-[16px] font-semibold">{t('result.subscaleTitle')}</h2>
          <div className="mt-4 space-y-4">
            {result.subscales.map((s) => (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between text-[14px] font-bold">
                  <span>{t(`sub.${s.key}`)}</span>
                  <span className="text-ink-faint">
                    {s.score}/{s.max}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-line">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.round(s.ratio * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING.gauge, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${tm.gradFrom}, ${tm.gradTo})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 뼈 때리는 한마디 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 rounded-3xl bg-gradient-to-br from-[#27343A] to-[#1F2A2F] p-5 shadow-pop"
        >
          <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-amber-300">⚡ {t('result.slapTitle')}</h2>
          <p className="mt-3 text-[16px] font-bold leading-[1.8] text-white/95">
            {l(persona.slap)}
          </p>
        </motion.div>

        {/* 정밀 분석 리포트 (광고 시청 잠금 해제) */}
        <AiReport result={result} persona={persona} />

        {/* 위험 신호 + 솔루션 (압축: 한 카드 2섹션) */}
        <Card className="mt-4">
          <h2 className="text-[15px] font-semibold text-red-500">⚠️ {t('result.riskTitle')}</h2>
          <ul className="mt-2.5 space-y-2">
            {persona.risks.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] font-medium leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-red-400">•</span>
                {l(r)}
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-line" />
          <h2 className="text-[15px] font-semibold text-mind-700">💊 {t('result.solutionTitle')}</h2>
          <ul className="mt-2.5 space-y-2">
            {persona.solutions.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] font-medium leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-mind-500">✓</span>
                {l(r)}
              </li>
            ))}
          </ul>
        </Card>

        {/* 맞춤 7일 루틴 처방 */}
        {ROUTINES[result.testId] && (
          <div className="mt-4">
            <Button color="mind" onClick={() => nav(`/routine/${result.testId}`)}>
              🗓 {t('routine.cta')}
            </Button>
          </div>
        )}

        {/* 도파민 → 절제력 훈련 퍼널 */}
        {result.testId === 'dopamine' && (
          <div className="mt-4">
            <Button color="dopa" onClick={() => nav('/rewards')}>
              {t('dopa.funnel')}
            </Button>
          </div>
        )}

        <Card className="mt-4">
          <h2 className="text-[15px] font-semibold text-sky2-600">💪 {t('result.strengthTitle')}</h2>
          <ul className="mt-2.5 space-y-2">
            {persona.strengths.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] font-medium leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-sky2-500">★</span>
                {l(r)}
              </li>
            ))}
          </ul>
        </Card>

        {/* 이 검사의 과학 — 척도 근거·백분위 읽는 법·결과 활용법 (결과지 읽을거리 심화) */}
        <Card className="mt-4 !p-5">
          <h2 className="text-[15px] font-semibold">📖 {l({ ko: '이 검사의 과학', en: 'The science behind this test', ja: 'この検査の科学' })}</h2>
          {t(`intro.${result.testId}.basis`) !== `intro.${result.testId}.basis` && (
            <div className="mt-3">
              <p className="text-[12px] font-semibold text-mind-600">🧪 {l({ ko: '무엇을 재나요?', en: 'What does it measure?', ja: '何を測る？' })}</p>
              <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">{t(`intro.${result.testId}.basis`)}</p>
            </div>
          )}
          <div className="mt-3">
            <p className="text-[12px] font-semibold text-mind-600">📊 {l({ ko: '상위 %는 어떻게 읽나요?', en: 'How to read the top %', ja: '上位%の読み方' })}</p>
            <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
              {l({
                ko: `"상위 ${topPercent}%"는 같은 검사를 본 사람 100명을 한 줄로 세웠을 때 당신의 위치예요. 점수는 정규분포(종 모양 곡선) 기반 추정치라, 응답 컨디션에 따라 몇 % 정도는 자연스럽게 오르내릴 수 있어요. 숫자 하나보다 "어느 구간에 있는가"를 보는 게 정확한 해석이에요.`,
                en: `"Top ${topPercent}%" is your position if 100 test-takers stood in one line. Scores are estimates based on the normal (bell-curve) distribution, so a few percentage points of natural variation is expected. Reading your band matters more than any single number.`,
                ja: `「上位${topPercent}%」は同じ検査を受けた100人を一列に並べた時のあなたの位置。スコアは正規分布に基づく推定値で、コンディションにより数%は自然に変動します。数字一つより「どの区間か」を見るのが正確な解釈です。`,
              })}
            </p>
          </div>
          <div className="mt-3">
            <p className="text-[12px] font-semibold text-mind-600">🌱 {l({ ko: '결과, 이렇게 쓰세요', en: 'How to use your result', ja: '結果の活かし方' })}</p>
            <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
              {l({
                ko: '심리 상태는 계절처럼 변해요. 결과는 "지금의 나"를 비추는 거울이지 낙인이 아니에요. 위의 솔루션 중 하나를 골라 2~3주 실천해 보고, 4~6주 뒤 재검사로 변화를 확인해 보세요 — 같은 검사를 2회 이상 하면 결과지에 추이 그래프가 생겨요.',
                en: "Your mind shifts like seasons. This result mirrors the present you — it isn't a label. Pick one solution above, practice it for 2–3 weeks, then retest in 4–6 weeks; take the same test twice or more and a trend graph appears here.",
                ja: '心の状態は季節のように変わります。結果は「今の自分」を映す鏡でありレッテルではありません。上のソリューションを一つ選び2〜3週間実践し、4〜6週間後に再検査を。同じ検査を2回以上受けると推移グラフが表示されます。',
              })}
            </p>
          </div>
        </Card>

        {/* 전문가 상담 권유 — 심각 구간에서만 강조 표시 */}
        {needsDoctor && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 rounded-3xl border-2 border-red-200 bg-red-50 p-5"
          >
            <h2 className="text-[16px] font-semibold text-red-600">{t('result.seeDoctor.title')}</h2>
            <p className="mt-2 text-[14px] font-medium leading-[1.8] text-red-700/90">
              {t(`result.seeDoctor.${result.testId}`)}
            </p>
          </motion.div>
        )}

        {/* 참고 절단점 (임상 척도, 정밀화 2차) */}
        {['adhd', 'burnout', 'dopamine'].includes(result.testId) && (
          <div className="mt-3 rounded-2xl bg-surface2 p-3.5">
            <p className="text-[12px] font-semibold text-ink-sub">📋 {t('result.cutoffTitle')}</p>
            <p className="mt-1 break-keep text-[12px] font-medium leading-relaxed text-ink-faint">{t(`result.cutoff.${result.testId}`)}</p>
          </div>
        )}

        {/* IQ 추정 지표 안내 (정밀화 3차) */}
        {result.testId === 'iq' && (
          <div className="mt-3 rounded-2xl bg-surface2 p-3.5">
            <p className="text-[12px] font-semibold text-ink-sub">📋 {t('result.estTitle')}</p>
            <p className="mt-1 break-keep text-[12px] font-medium leading-relaxed text-ink-faint">{t('result.iqEstimate')}</p>
          </div>
        )}
          </div>
          {locked && (
            <div className="absolute inset-x-0 top-4 flex justify-center px-3">
              <div className="w-full max-w-sm rounded-3xl border-2 border-[#D7DAF7] bg-surface/95 p-6 text-center shadow-pop">
                <div className="text-[28px] leading-none">🔒</div>
                <h3 className="mt-2 text-[17px] font-semibold">{lockedIq ? l({ ko: '정밀 IQ 결과 해제', en: 'Unlock full IQ result', ja: '精密IQ結果を解除' }) : l({ ko: '상세 분석 해제', en: 'Unlock full analysis', ja: '詳細分析を解除' })}</h3>
                <p className="mx-auto mt-1.5 max-w-[280px] break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
                  {l({ ko: '인지영역별 분석 · 정밀 해석 · 강점/주의까지 결과지 전체를 한 번만 해제하면 계속 볼 수 있어요.', en: 'Cognitive breakdown, deep interpretation, strengths — unlock the full result once, kept forever.', ja: '認知領域分析・精密解釈・強み/注意まで結果全体を一度解除すればずっと見られます。' })}
                </p>
                <div className="mx-auto mt-4 max-w-[260px]">
                  <Button color="iq" size="lg" onClick={tryUnlockIqResult}>
                    💎 {l({ ko: `${IQ_DIA_COST}개로 전체 결과 보기`, en: `Unlock for ${IQ_DIA_COST}`, ja: `${IQ_DIA_COST}個で全結果` })}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] font-medium text-ink-faint">
                  {l({ ko: `보유 💎 ${diamonds} · 1회 해제 후 영구`, en: `You have 💎${diamonds} · one-time, permanent`, ja: `保有💎${diamonds}・一度で永久` })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 공통 면책 (정신건강 관련 검사) — 연속 지표 고지 강화 */}
        {['adhd', 'burnout', 'dopamine', 'love', 'resilience', 'dark'].includes(result.testId) && (
          <p className="mt-3 px-2 text-center text-[12px] font-medium leading-relaxed text-ink-faint">
            {t('result.medical')} {t('result.contInd')}
          </p>
        )}

        {/* 공유 보상 섹션 — 바이럴 루프 */}
        <Card className="mt-4 text-center">
          <h2 className="text-[16px] font-semibold">💎 {t('share.title')}</h2>
          {shareMsg && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 text-[14px] font-semibold text-mind-700"
            >
              ✅ {shareMsg}
            </motion.p>
          )}
          {/* 카드 배경 테마 선택 */}
          <div className="mt-3 flex items-center justify-center gap-2.5">
            {CARD_THEMES.map((th, i) => (
              <button
                key={i}
                onClick={() => setCardTheme(i)}
                className="h-9 w-9 rounded-full border-2 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${th.swatch[0]}, ${th.swatch[1]})`,
                  borderColor: cardTheme === i ? '#33413A' : 'transparent',
                  transform: cardTheme === i ? 'scale(1.12)' : 'scale(1)',
                }}
                aria-label={th.label}
              />
            ))}
          </div>
          {kakaoEnabled() && (
            <button
              onClick={() => {
                const ok = shareKakao({
                  title: `나는 "${l(persona.name)}" 🐾 | 누리 마인드`,
                  description: l(persona.slap),
                  link: `https://www.nurimind.co.kr/test/${result.testId}`,
                })
                track('share', { channel: 'kakao' })
                if (!ok) share()
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] py-3.5 text-[15px] font-semibold text-[#3A1D1D]"
            >
              💬 카카오톡으로 공유
            </button>
          )}
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <Button color="sky" onClick={shareCard}>
              {t('share.card')}
            </Button>
            <Button color="white" onClick={share}>
              {copied ? t('common.copied') : t('share.text')}
            </Button>
          </div>
          <button
            onClick={shareDuel}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${persona.grad[0]}, ${persona.grad[1]})` }}
          >
            🆚 {l({ ko: '친구와 결과 대결', en: 'Challenge a friend', ja: '友達と結果バトル' })}
          </button>
        </Card>

        {/* 친구 초대 CTA — 결과 공유 직후 바이럴 (둘 다 +100P) */}
        <button
          onClick={() => nav('/rewards')}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl p-3.5 text-left shadow-card"
          style={{ background: 'linear-gradient(135deg,#4FA882,#6E9FDC)' }}
        >
          <span className="text-[24px]">🎁</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-tight text-white">{l({ ko: '친구 초대하면 둘 다 +100P', en: 'Invite a friend — you both get +100P', ja: '友達招待で二人とも+100P' })}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-white/85">{l({ ko: '코드 공유하고 보너스 받기', en: 'Share your code & earn', ja: 'コードを共有してボーナス' })}</p>
          </div>
          <span className="text-lg text-white/80">›</span>
        </button>

        {/* 이 동물을 프로필 아바타로 */}
        <div className="mt-4">
          <Button
            color="white"
            onClick={() => {
              setAvatar({ kind: 'animal', persona: result.persona })
              setAvatarSet(true)
              sfx.coin()
              setTimeout(() => setAvatarSet(false), 2200)
            }}
          >
            {avatarSet ? `✅ ${t('result.avatarSet')}` : t('result.setAvatar')}
          </Button>
        </div>


        {/* 새 동물 획득 축하 — 도감 수집 동기를 '획득 순간'에 (검증: /dex 내부보다 여기가 효과) */}
        {isNewAnimal && state.fresh && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING.sheet, delay: 0.25 }}
            className="mt-3 flex items-center gap-2.5 rounded-3xl bg-gradient-to-r from-[#F2B01E] to-[#FF7E5F] px-4 py-3 text-white shadow-pop"
          >
            <span className="text-[20px] leading-none">🎉</span>
            <p className="min-w-0 flex-1 break-keep text-[13px] font-semibold leading-snug">
              {t('result.newAnimal')}
            </p>
            <button onClick={() => nav('/dex')} className="shrink-0 rounded-full bg-white/25 px-3 py-1.5 text-[12px] font-semibold">
              {t('result.openDex')}
            </button>
          </motion.div>
        )}
        <div className="mt-3 space-y-2.5">
          <Button
            color={tm.btn}
            onClick={() =>
              nav(
                // 정밀검사(인지과제)는 전용 런 라우트를 쓴다 — /test/:id/run 은 문항뱅크 전용이라 백지가 됨.
                // IQ 정밀(pro) 결과의 재검사는 같은 모드로(mode 누락 시 빠른 10문항으로 떨어지는 버그 방지)
                PRECISION_RUN[result.testId] ??
                  `/test/${result.testId}/run${result.testId === 'iq' && result.iqMode === 'pro' ? '?mode=pro' : ''}`,
                { replace: true },
              )
            }
          >
            🔄 {t('result.retake')}
          </Button>
          <Button color="mind" onClick={() => nav('/')}>
            🏠 {t('result.home')}
          </Button>
        </div>

        {/* 정사각형 광고 — 페이지 맨 아래 */}
        <div className="mt-5">
          <AdSlot variant="rect" />
        </div>

        {/* 다이아 부족 → 충전 안내 (IQ 결과 해제) */}
        <Modal open={needCharge} onClose={() => setNeedCharge(false)}>
          <div className="text-center">
            <p className="text-[28px] leading-none">💎</p>
            <h3 className="mt-2 text-[20px] font-extrabold">{l({ ko: '다이아가 부족해요', en: 'Not enough diamonds', ja: 'ダイヤが足りません' })}</h3>
            <p className="mt-1 break-keep text-[13px] font-medium text-ink-faint">
              {l({ ko: `상세 결과 해제에 ${IQ_DIA_COST}다이아가 필요해요 · 보유 ${diamonds}`, en: `Unlock needs 💎${IQ_DIA_COST} · you have ${diamonds}`, ja: `解除に💎${IQ_DIA_COST}必要・保有${diamonds}` })}
            </p>
            <div className="mt-5">
              <Button color="iq" onClick={() => nav('/charge')}>💎 {l({ ko: '충전하러 가기', en: 'Go charge', ja: 'チャージへ' })}</Button>
              <button onClick={() => setNeedCharge(false)} className="mt-2 w-full py-2 text-[13px] font-medium text-ink-faint">{l({ ko: '닫기', en: 'Close', ja: '閉じる' })}</button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}
