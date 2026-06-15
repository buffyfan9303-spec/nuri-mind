import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import AdGate from '../components/AdGate'
import AdSlot from '../components/AdSlot'
import Gauge from '../components/Gauge'
import AiReport from '../components/AiReport'
import Trend from '../components/Trend'
import { ROUTINES } from '../data/routines'
import { Card, Chip, TopBar } from '../components/ui'
import { PERSONAS } from '../i18n/animalTranslations'
import { testMeta } from '../data/tests'
import { LOVE_CHEMI } from '../data/love'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { celebrate, burst } from '../lib/confetti'
import { makeResultCard, shareCardBlob } from '../lib/shareCard'
import { kakaoEnabled, shareKakao } from '../lib/kakao'
import { track } from '../lib/analytics'
import { sfx } from '../lib/sound'

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
  const shareReward = useStore((s) => s.shareReward)
  const setAvatar = useStore((s) => s.setAvatar)
  const celebrated = useRef(false)

  useEffect(() => {
    if (!gate && state.fresh && !celebrated.current) {
      celebrated.current = true
      celebrate()
      sfx.fanfare()
    }
  }, [gate, state.fresh])

  if (!result) return <Navigate to="/" replace />
  const persona = PERSONAS[result.persona]
  const tm = testMeta(result.testId)

  /* 카드 배경 테마 — 기본(페르소나)/다크/파스텔 */
  const CARD_THEMES: { label: string; grad?: [string, string]; swatch: [string, string] }[] = [
    { label: '기본', swatch: persona.grad },
    { label: '다크', grad: ['#27343A', '#46607A'], swatch: ['#27343A', '#46607A'] },
    { label: '파스텔', grad: ['#FBD3E9', '#A9C9EE'], swatch: ['#FBD3E9', '#A9C9EE'] },
  ]
  const topPercent = Math.max(0.5, Math.round((100 - result.percentile) * 10) / 10)
  const reward = state.reward ?? 0

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

  return (
    <div className="min-h-dvh pb-36">
      <AnimatePresence>{gate && <AdGate onDone={() => setGate(false)} />}</AnimatePresence>

      <TopBar back="/" title={t('result.title')} />

      <main className="mx-auto max-w-md px-5">
        {/* 페르소나 히어로 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={gate ? {} : { opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.05 }}
          className="rounded-3xl p-7 text-center shadow-pop"
          style={{ background: `linear-gradient(140deg, ${persona.grad[0]}, ${persona.grad[1]})` }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={gate ? {} : { scale: 1, rotate: [0, -8, 6, 0] }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.25 }}
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/90 text-6xl shadow-pop"
          >
            {persona.emoji}
          </motion.div>
          <p className="mt-4 text-[15px] font-extrabold tracking-wide text-white/85">{l(persona.title)}</p>
          <h1 className="mt-1 text-[32px] font-extrabold tracking-tight text-white">{l(persona.name)}</h1>
          <p className="mt-2.5 text-[15px] font-bold leading-relaxed tracking-wide text-white/90">
            “{l(persona.tagline)}”
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13.5px] font-extrabold text-white">
              {t(`band.${result.testId}.${result.band}`)}
            </span>
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13.5px] font-extrabold text-white">
              {t('result.topPercent', { p: topPercent })}
            </span>
            {result.testId === 'adhd' && result.screener !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13.5px] font-extrabold text-white">
                {t('result.screener', { n: result.screener })}
              </span>
            )}
            {result.testId === 'iq' && result.iq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13.5px] font-extrabold text-white">
                {t('result.iqLabel')} {result.iq}
              </span>
            )}
          </div>
        </motion.div>

        {/* 보상 배너 */}
        {reward > 0 && !gate && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-mind-100 py-3.5 text-[15.5px] font-extrabold text-mind-700"
          >
            💎 {t('result.reward', { p: reward })}
          </motion.div>
        )}

        {/* 가면 지수 경고 (EGO) */}
        {result.maskFlag && (
          <Card className="mt-4 !bg-amber-50">
            <h3 className="text-[16px] font-extrabold text-amber-700">{t('result.maskTitle')}</h3>
            <p className="mt-1.5 text-[14.5px] font-medium leading-[1.75] text-amber-700/90">{t('result.maskDesc')}</p>
          </Card>
        )}

        {/* 백분위 게이지 */}
        <Card className="mt-4 text-center">
          <h2 className="text-[16px] font-extrabold tracking-tight">{gaugeTitle}</h2>
          <div className="mt-3">
            {result.testId === 'iq' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-iq-deep">{result.iq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.iqLabel')}</p>
                <div className="mt-4">
                  <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
                </div>
              </>
            ) : (
              <Gauge value={result.percentile} color={tm.gradFrom} label={t('result.percentileUnit')} />
            )}
          </div>
        </Card>

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
                <div className="text-[22px] font-extrabold" style={{ color }}>
                  {Math.round(result.axes![key])}
                </div>
                <div className="mt-0.5 text-[11.5px] font-bold tracking-wide text-ink-sub">{t(label)}</div>
              </Card>
            ))}
          </div>
        )}

        {/* 연애 케미 매칭 — 공유 트리거 */}
        {chemi && (
          <Card className="mt-4">
            <h2 className="text-[16px] font-extrabold tracking-tight">{t('love.chemi')}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-mind-50 px-3 py-3.5 text-center">
                <p className="text-[12px] font-extrabold tracking-wide text-mind-600">💖 {t('love.best')}</p>
                <p className="mt-1.5 text-[15px] font-extrabold">
                  {PERSONAS[chemi.best].emoji} {l(PERSONAS[chemi.best].name)}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 px-3 py-3.5 text-center">
                <p className="text-[12px] font-extrabold tracking-wide text-red-400">💥 {t('love.worst')}</p>
                <p className="mt-1.5 text-[15px] font-extrabold">
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
            <h2 className="text-[15.5px] font-extrabold tracking-tight text-burn-deep">{t('cross.title')}</h2>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.8] text-ink">{t(crossKey)}</p>
          </Card>
        )}

        {/* 세부 회로 */}
        <Card className="mt-4">
          <h2 className="text-[16px] font-extrabold tracking-tight">{t('result.subscaleTitle')}</h2>
          <div className="mt-4 space-y-4">
            {result.subscales.map((s) => (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between text-[14.5px] font-bold">
                  <span>{t(`sub.${s.key}`)}</span>
                  <span className="text-ink-faint">
                    {s.score}/{s.max}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#E7EDE9]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.round(s.ratio * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.1 }}
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
          <h2 className="flex items-center gap-1.5 text-[15.5px] font-extrabold text-amber-300">⚡ {t('result.slapTitle')}</h2>
          <p className="mt-3 text-[16.5px] font-bold leading-[1.8] tracking-wide text-white/95">
            {l(persona.slap)}
          </p>
        </motion.div>

        {/* 정밀 분석 리포트 (광고 시청 잠금 해제) */}
        <AiReport result={result} persona={persona} />

        {/* 위험 신호 + 솔루션 (압축: 한 카드 2섹션) */}
        <Card className="mt-4">
          <h2 className="text-[15.5px] font-extrabold text-red-500">⚠️ {t('result.riskTitle')}</h2>
          <ul className="mt-2.5 space-y-2">
            {persona.risks.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14.5px] font-medium leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-red-400">•</span>
                {l(r)}
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-[#EEF2EF]" />
          <h2 className="text-[15.5px] font-extrabold text-mind-700">💊 {t('result.solutionTitle')}</h2>
          <ul className="mt-2.5 space-y-2">
            {persona.solutions.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14.5px] font-medium leading-[1.7] text-ink">
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
          <h2 className="text-[15.5px] font-extrabold text-sky2-600">💪 {t('result.strengthTitle')}</h2>
          <ul className="mt-2.5 space-y-2">
            {persona.strengths.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14.5px] font-medium leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-sky2-500">★</span>
                {l(r)}
              </li>
            ))}
          </ul>
        </Card>

        {/* 전문가 상담 권유 — 심각 구간에서만 강조 표시 */}
        {needsDoctor && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 rounded-3xl border-2 border-red-200 bg-red-50 p-5"
          >
            <h2 className="text-[16px] font-extrabold text-red-600">{t('result.seeDoctor.title')}</h2>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.8] text-red-700/90">
              {t(`result.seeDoctor.${result.testId}`)}
            </p>
          </motion.div>
        )}

        {/* 공통 면책 (정신건강 관련 검사) */}
        {['adhd', 'burnout', 'dopamine', 'love', 'resilience', 'dark'].includes(result.testId) && (
          <p className="mt-3 px-2 text-center text-[12px] font-medium leading-relaxed text-ink-faint">
            {t('result.medical')}
          </p>
        )}

        {/* 공유 보상 섹션 — 바이럴 루프 */}
        <Card className="mt-4 text-center">
          <h2 className="text-[16px] font-extrabold tracking-tight">💎 {t('share.title')}</h2>
          {shareMsg && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 text-[14.5px] font-extrabold text-mind-700"
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
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] py-3.5 text-[15px] font-extrabold text-[#3A1D1D]"
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
        </Card>

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

        <div className="mt-3 space-y-2.5">
          <Button color={tm.btn} onClick={() => nav(`/test/${result.testId}/run`, { replace: true })}>
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
      </main>
    </div>
  )
}
