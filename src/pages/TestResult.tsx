import { toast } from '../lib/toast'
import { isNativeApp, shareOrigin } from '../lib/platform'
import { useEffect, useRef, useState } from 'react'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
import Gauge from '../components/Gauge'
import AiReport from '../components/AiReport'
import Trend from '../components/Trend'
import { ROUTINES } from '../data/routines'
import type { TestId } from '../data/types'
import { Card, Chip, TopBar, Modal } from '../components/ui'
import { PERSONAS } from '../i18n/animalTranslations'
import { hasNorm, testMeta } from '../data/tests'
import { HOLLAND_CAREERS, type HollandType } from '../data/career'
import { LOVE_CHEMI } from '../data/love'
import { useStore, IQ_DIA_COST } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { celebrate, burst } from '../lib/confetti'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { makeResultCard, shareCardBlob, SHARE_FAIL } from '../lib/shareCard'
import { kakaoEnabled, shareKakao } from '../lib/kakao'
import { track } from '../lib/analytics'
import { sfx } from '../lib/sound'
import { encodeDuel } from '../lib/duel'
import { StatTile } from '../components/StatTile'
import Emoji, { EmojiText } from '../components/Emoji'
import { shareOrCopy } from '../lib/share'
import { needsCare } from '../data/care'
import { hollandCode, topPercentOf } from '../lib/format'

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

  // '방금 끝낸 검사' 표시는 첫 진입에서 한 번만 읽고 히스토리에선 지운다 —
  // 남겨 두면 새로고침·도감 갔다가 뒤로가기마다 축하·'+P 받았어요'가 다시 떴다
  const [state] = useState(() => (location.state ?? {}) as { fresh?: boolean; reward?: number })
  useEffect(() => {
    if (location.state) nav(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // 결과 준비 게이트(5초 대기 전면 화면)는 없앴다 — 애드센스 '행동 목적 화면' 정책과 무관하게도
  // 광고 없는 강제 대기는 사용자에게 가치가 없다. 결과는 곧바로 보여 준다.
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
  const streak = useStore((s) => s.streak)
  const { fire } = useRewardAnimation()
  const celebrated = useRef(false)

  useEffect(() => {
    if (state.fresh && !celebrated.current) {
      celebrated.current = true
      fire('win')
    }
  }, [state.fresh])

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
  const topPercent = topPercentOf(result.percentile)
  /* 규준 없는 프로필형(진로 흥미) — percentile은 자리 채움값이라 '상위 %'·게이지·대결을 숨기고 흥미 코드를 보인다 */
  const norm = hasNorm(result.testId)
  const code = norm ? '' : hollandCode(result)
  const subs = result.subscales
  // 1·2순위나 3·4순위가 동점이거나 유형 간 차이가 작으면(최고−최저 ≤ 3점) 코드가 흔들린다 — 코드만 믿지 않게 알린다
  // ponytail: 3점·15점은 20점 범위의 경험적 임계값(규준 연구 없음). 차별도(differentiation) 연구가 생기면 그 기준으로 교체
  const flatProfile =
    !norm &&
    subs.length >= 4 &&
    (subs[0].score === subs[1].score || subs[2].score === subs[3].score || subs[0].score - subs[subs.length - 1].score <= 3)
  // 1순위 합이 15점(문항 평균 3 '잘 모르겠다') 이하 — 좋아하는 활동 자체가 아직 적다
  const lowInterest = !norm && subs.length > 0 && subs[0].score <= 15
  const shareText = norm
    ? t('result.shareText', { test: t(`test.${result.testId}.name`), persona: l(persona.name), p: topPercent })
    : l({
        ko: `[누리 마인드] ${t(`test.${result.testId}.name`)} 결과: 나는 ${l(persona.name)}, 흥미 코드 ${code}! 너는 어떤 일에 끌려? 👉`,
        en: `[Nuri Mind] ${t(`test.${result.testId}.name`)}: I'm ${l(persona.name)}, interest code ${code}! What draws you? 👉`,
        ja: `[ヌリマインド] ${t(`test.${result.testId}.name`)}の結果：私は${l(persona.name)}、興味コード${code}！あなたは？ 👉`,
      })
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

  /* 전문가(의사·상담) 권유가 필요한 구간 — data/care.ts(나에 관하여와 같은 기준) */
  const needsDoctor = needsCare(result.testId, result.band)

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
    const text = shareText
    const outcome = await shareOrCopy({ text, url: shareOrigin() })
    // 공유 시트를 닫은 것(취소)은 실패가 아니다 — 클립보드를 덮어쓰거나 공유 보상을 주지 않는다
    if (outcome === 'cancelled') return
    if (outcome === 'copied') {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
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
            ? `${t('result.mqLabel')} ${result.mq}`
            : result.fq != null
              ? `${t('result.fqLabel')} ${result.fq}`
              : result.sq != null
                ? `${t('result.sqLabel')} ${result.sq}`
                : result.xq != null
                  ? `${t('result.xqLabel')} ${result.xq}`
                  : result.wq != null
                    ? `${t('result.wqLabel')} ${result.wq}`
                    : undefined,
        chipText: norm ? undefined : `${t('result.gauge.career')} ${code}`,
        appName: t('app.name'),
      })
      const how = await shareCardBlob(blob, shareText)
      if (how === 'cancelled') return // 취소는 공유가 아니다 — 보상 없음
      if (how === 'downloaded') {
        setShareMsg(t('share.saved'))
        setTimeout(() => setShareMsg(''), 2200)
      }
      afterShare()
    } catch {
      sfx.err()
      toast.err(l(SHARE_FAIL))
    }
  }

  const shareDuel = async () => {
    const enc = encodeDuel({ t: result.testId, p: result.percentile, b: result.band, n: nickname, a: result.persona })
    const url = `${shareOrigin()}/api/duel?r=${enc}` // 크롤러=동적 OG, 사람=/vs로 리다이렉트
    const text = l({
      ko: `나랑 ${t(`test.${result.testId}.name`)} 대결할래? 누가 이기나 보자! 🆚`,
      en: `Beat my ${t(`test.${result.testId}.name`)} result? 🆚`,
      ja: `${t(`test.${result.testId}.name`)}で勝負しよう！🆚`,
    })
    const outcome = await shareOrCopy({ title: '누리 마인드 결과 대결', text, url, copyText: url })
    if (outcome === 'copied') {
      setShareMsg(l({ ko: '대결 링크가 복사됐어요', en: '🆚 Duel link copied!', ja: '🆚 リンクをコピー！' }))
      setTimeout(() => setShareMsg(''), 2400)
    }
    if (outcome === 'shared' || outcome === 'copied') track('share', { channel: 'duel' })
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t('result.title')} />

      <main className="mx-auto max-w-md px-5">
        {/* 페르소나 히어로 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING.ui, delay: 0.05 }}
          className="rounded-3xl p-7 text-center shadow-pop"
          style={{ background: `linear-gradient(140deg, ${persona.grad[0]}, ${persona.grad[1]})` }}
        >
          <div className="relative mx-auto h-28 w-28">
            {/* 파티클 링 — 이모지 팝과 함께 사방으로 퍼짐 */}
            {[
                { e: '✨', a: -90 }, { e: '⭐', a: -45 }, { e: '💫', a: 0 }, { e: '✨', a: 45 },
                { e: '⭐', a: 90 }, { e: '💫', a: 135 }, { e: '✨', a: 180 }, { e: '⭐', a: 225 },
              ].map((s, i) => {
                const rad = (s.a * Math.PI) / 180
                return (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 flex leading-none"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ x: Math.cos(rad) * 82, y: Math.sin(rad) * 82, scale: [0, 1.1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.95, delay: 0.34 + i * 0.025, ease: 'easeOut' }}
                  >
                    <Emoji e={s.e} size={18} />
                  </motion.span>
                )
              })}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -8, 6, 0] }}
              // 스프링은 첫·끝 키프레임만 보간한다(0→0) — 흔들기는 키프레임 트윈으로 따로 줘야 실제로 움직인다
              transition={{ ...SPRING.sheet, delay: 0.25, rotate: { duration: 0.5, delay: 0.25, ease: 'easeOut' } }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-white/90 shadow-pop"
            >
              <Emoji e={persona.emoji} size={64} />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.3 }}
            className="mt-4 text-[15px] font-extrabold text-white/85"
          >
            {l(persona.title)}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING.flick, delay: 0.5 }}
            className="mt-1 text-[28px] font-extrabold tracking-tight text-white"
          >
            {l(persona.name)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.3 }}
            className="mt-2.5 text-[15px] font-bold leading-relaxed text-white/90"
          >
            “{l(persona.tagline)}”
          </motion.p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
              {t(`band.${result.testId}.${result.band}`)}
            </span>
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
              {norm ? t('result.topPercent', { p: topPercent }) : `${t('result.gauge.career')} ${code}`}
            </span>
            {result.testId === 'adhd' && result.screener !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                {t('result.screener', { n: result.screener })}
              </span>
            )}
            {result.testId === 'iq' && result.iq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                {t('result.iqLabel')} {result.iq}
              </span>
            )}
            {result.testId === 'memory' && result.mq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                {t('result.mqLabel')} {result.mq}
              </span>
            )}
            {result.testId === 'focus' && result.fq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                {t('result.fqLabel')} {result.fq}
              </span>
            )}
            {result.testId === 'speed' && result.sq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                {t('result.sqLabel')} {result.sq}
              </span>
            )}
            {result.testId === 'spatial' && result.xq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                {t('result.xqLabel')} {result.xq}
              </span>
            )}
            {result.testId === 'switch' && result.wq !== undefined && (
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
                {t('result.wqLabel')} {result.wq}
              </span>
            )}
          </div>
        </motion.div>

        {/* 방금 끝낸 검사 — 듀오링고 '레슨 완료' 스탯 타일(보상·소요 시간·연속 출석). 다시 열어 볼 땐 없다 */}
        {state.fresh && (() => {
          const secs = Math.round((result.durationMs || 0) / 1000)
          const tiles = [
            reward > 0 && { label: t('result.tileReward'), value: `+${reward}P`, icon: '🪙', color: '#FFB020' },
            secs > 0 && {
              label: t('result.tileTime'),
              value: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`,
              icon: '⏱️',
              color: '#6E9FDC',
            },
            streak > 0 && { label: t('result.tileStreak'), value: t('result.tileDays', { n: streak }), icon: '🔥', color: '#FF8A3D' },
          ].filter(Boolean) as { label: string; value: string; icon: string; color: string }[]
          return tiles.length > 0 ? (
            <div className="mt-3 flex gap-2.5">
              {tiles.map((x, i) => (
                <StatTile key={x.label} index={i} {...x} />
              ))}
            </div>
          ) : null
        })()}

        {/* 가면 지수 경고 (EGO) */}
        {result.maskFlag && (
          <Card className="mt-4 !bg-amber-50">
            <h3 className="text-[16px] font-extrabold text-amber-700"><EmojiText text={t('result.maskTitle')} /></h3>
            <p className="mt-1.5 text-[14px] font-bold leading-[1.75] text-amber-700/90">{t('result.maskDesc')}</p>
          </Card>
        )}

        {/* 흥미 코드 — 규준 없는 프로필형(진로 흥미)은 백분위 게이지 대신 상위 3유형과 직업 예시 */}
        {!norm && (
          <Card className="mt-4 text-center">
            <h2 className="text-[17px] font-extrabold leading-tight">{gaugeTitle}</h2>
            <div className="mt-3 text-5xl font-extrabold tracking-tight" style={{ color: tm.gradFrom }}>{code}</div>
            <p className="mt-1 break-keep text-[13px] font-bold text-ink-sub">
              {code.split('').map((k) => t(`band.career.${k}`)).join(' · ')}
            </p>
            {flatProfile && (
              <p className="mt-2 break-keep text-[12px] font-bold leading-relaxed text-ink-faint">
                {l({
                  ko: '유형 사이 점수 차이가 작아요. 흥미가 아직 한쪽으로 뚜렷하지 않을 수 있으니, 코드보다 아래 막대 전체를 함께 보세요.',
                  en: 'Your type scores are close together. Your interests may not have settled yet — look at all the bars below, not just the code.',
                  ja: 'タイプ間の点差が小さめです。興味がまだはっきりしていない可能性があるので、コードより下の棒グラフ全体を見てください。',
                })}
              </p>
            )}
            {lowInterest && (
              <p className="mt-2 break-keep text-[12px] font-bold leading-relaxed text-ink-faint">
                {l({
                  ko: '뚜렷하게 좋아하는 활동이 아직 적어요. 여러 경험을 해 본 뒤 다시 해 보세요.',
                  en: 'There are not many activities you clearly enjoy yet. Try a range of experiences, then take this again.',
                  ja: 'はっきり好きと言える活動がまだ少なめです。いろいろ経験してから、もう一度試してみてください。',
                })}
              </p>
            )}
            <div className="mt-4 space-y-2.5 text-left">
              {code.split('').map((k) => (
                <div key={k} className="rounded-2xl bg-surface2 p-3.5">
                  <p className="text-[13px] font-extrabold">{t(`sub.${k}`)}</p>
                  <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">
                    {l(HOLLAND_CAREERS[k as HollandType])}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 break-keep text-[12px] font-bold leading-relaxed text-ink-faint">
              {l({
                ko: '직업 예시는 이 흥미를 가진 사람이 많이 찾는 분야일 뿐이에요. 성별과 상관없이 누구나 고를 수 있고, 적성·능력·합격을 뜻하지 않으며, 진단 도구도 아니에요.',
                en: 'Job examples are simply fields people with this interest often choose. They are open to anyone regardless of gender, say nothing about aptitude, ability, or getting hired, and this is not a diagnostic tool.',
                ja: '職業例はこの興味を持つ人がよく選ぶ分野にすぎません。性別に関係なく誰でも選べ、適性・能力・合格を意味せず、診断ツールでもありません。',
              })}
            </p>
          </Card>
        )}

        {/* 백분위 게이지 */}
        {norm && (
        <Card className="mt-4 text-center">
          <h2 className="text-[17px] font-extrabold leading-tight">{gaugeTitle}</h2>
          <div className="mt-3">
            {result.testId === 'iq' ? (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-iq-deep">{result.iq}</div>
                <p className="mt-0.5 text-xs font-bold text-ink-sub">{t('result.iqLabel')}</p>
                {result.iqMode === 'fast' && (
                  <p className="mt-1 break-keep text-[12px] font-bold text-ink-faint">
                    {l({
                      ko: '10문항으로 낸 어림값이라 오차가 더 커요',
                      en: 'A rough estimate from 10 questions — wider margin of error',
                      ja: '10問からの概算なので誤差が大きめです',
                    })}
                  </p>
                )}
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
                {result.axes?.rt != null && result.axes.acc != null && (
                  <p className="mt-1 text-[12px] font-bold text-ink-faint">
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
                {result.axes?.rt != null && result.axes.acc != null && result.axes.cost != null && (
                  <p className="mt-1 text-[12px] font-bold text-ink-faint">
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
                {result.axes?.rt != null && result.axes.acc != null && (
                  <p className="mt-1 text-[12px] font-bold text-ink-faint">
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
                {result.axes?.count != null && result.axes.ms != null && result.axes.acc != null && (
                  <p className="mt-1 text-[12px] font-bold text-ink-faint">
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
        )}

        {/* 빠른 IQ → 정밀 IQ 업셀 (더 정확한 측정으로 유도) */}
        {result.testId === 'iq' && result.iqMode === 'fast' && (
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.ui, delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => nav('/test/iq/run?mode=pro')}
            className="mt-4 flex w-full items-center gap-3 rounded-3xl p-4 text-left text-white shadow-pop"
            style={{ background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
          >
            <motion.span animate={{ rotate: [0, -10, 8, 0] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 1.5 }} className="leading-none">
              <Emoji e="🔬" size={28} className="align-top" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-extrabold leading-tight">
                {l({ ko: '정밀 IQ로 더 정확하게 측정', en: 'Measure more precisely', ja: '精密IQでもっと正確に' })}
              </h3>
              <p className="mt-0.5 break-keep text-[12px] font-bold text-white/90">
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

        {/* 검사별 3축 카드 */}
        {result.axes && axisDefs && (
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {axisDefs.map(([key, label, color]) => (
              <Card key={key} className="!p-3.5 text-center">
                <div className="text-[20px] font-extrabold" style={{ color }}>
                  {Math.round(result.axes![key])}
                </div>
                <div className="mt-0.5 text-[11px] font-bold tracking-wide text-ink-sub">{t(label)}</div>
              </Card>
            ))}
          </div>
        )}

        {/* 연애 케미 매칭 — 공유 트리거 */}
        {chemi && (
          <Card className="mt-4">
            <h2 className="text-[17px] font-extrabold leading-tight"><EmojiText text={t('love.chemi')} /></h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-mind-50 px-3 py-3.5 text-center">
                <p className="text-[12px] font-extrabold tracking-wide text-mind-600"><Emoji e="💖" inline />{t('love.best')}</p>
                <p className="mt-1.5 text-[15px] font-extrabold">
                  {PERSONAS[chemi.best].emoji} {l(PERSONAS[chemi.best].name)}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 px-3 py-3.5 text-center">
                <p className="text-[12px] font-extrabold tracking-wide text-red-400"><Emoji e="💥" inline />{t('love.worst')}</p>
                <p className="mt-1.5 text-[15px] font-extrabold">
                  {PERSONAS[chemi.worst].emoji} {l(PERSONAS[chemi.worst].name)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Button color="love" onClick={() => nav('/chemi')}>
                <Emoji e="💌" inline />{t('chemi.cta')}
              </Button>
            </div>
          </Card>
        )}

        {/* ADHD × 번아웃 교차 분석 */}
        {crossKey && (
          <Card className="mt-4 !bg-burn-light">
            <h2 className="text-[17px] font-extrabold leading-tight text-burn-deep">{t('cross.title')}</h2>
            <p className="mt-2 text-[14px] font-bold leading-[1.8] text-ink">{t(crossKey)}</p>
          </Card>
        )}

        {/* ── IQ 결과지 게이팅: 앞(히어로·점수)은 무료, 상세 분석은 블러 → 10다이아 ── */}
        <div className="relative">
          <div className={locked ? 'pointer-events-none select-none blur-[7px]' : ''} aria-hidden={locked || undefined}>
        {/* 세부 회로 */}
        <Card className="mt-4">
          <h2 className="text-[17px] font-extrabold leading-tight">{t('result.subscaleTitle')}</h2>
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
          <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold leading-tight text-amber-300">{t('result.slapTitle')}</h2>
          <p className="mt-3 text-[16px] font-bold leading-[1.8] text-white/95">
            {l(persona.slap)}
          </p>
        </motion.div>

        {/* 정밀 분석 리포트 (광고 시청 잠금 해제) */}
        {/* AI 리포트 서버 프롬프트는 '상위 %'를 전제한다 — 규준 없는 검사엔 붙이지 않는다 */}
        {norm && <AiReport result={result} persona={persona} />}

        {/* 위험 신호 + 솔루션 (압축: 한 카드 2섹션) */}
        <Card className="mt-4">
          {/* 규준 없는 흥미 검사는 '위험'이 아니라 환경 적합도 — 중립색 */}
          <h2 className={`text-[17px] font-extrabold leading-tight ${norm ? 'text-red-500' : 'text-ink'}`}>
            {norm ? t('result.riskTitle') : l({ ko: '잘 안 맞을 수 있는 환경', en: 'Settings that may not fit', ja: '合わないかもしれない環境' })}
          </h2>
          <ul className="mt-2.5 space-y-2">
            {persona.risks.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] font-bold leading-[1.7] text-ink">
                <span className={`mt-0.5 shrink-0 ${norm ? 'text-red-400' : 'text-ink-faint'}`}>•</span>
                {l(r)}
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-line" />
          <h2 className="text-[17px] font-extrabold leading-tight text-mind-700">
            {norm ? t('result.solutionTitle') : l({ ko: '이렇게 알아보세요', en: 'Ways to explore', ja: '確かめ方' })}
          </h2>
          <ul className="mt-2.5 space-y-2">
            {persona.solutions.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] font-bold leading-[1.7] text-ink">
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
              <Emoji e="🗓" inline />{t('routine.cta')}
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
          <h2 className="text-[17px] font-extrabold leading-tight text-sky2-600">
            {norm ? t('result.strengthTitle') : l({ ko: '이 흥미가 잘 드러나는 순간', en: 'When this interest shows', ja: 'この興味が表れる瞬間' })}
          </h2>
          <ul className="mt-2.5 space-y-2">
            {persona.strengths.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] font-bold leading-[1.7] text-ink">
                <span className="mt-0.5 shrink-0 text-sky2-500">★</span>
                {l(r)}
              </li>
            ))}
          </ul>
        </Card>

        {/* 이 검사의 과학 — 척도 근거·백분위 읽는 법·결과 활용법 (결과지 읽을거리 심화) */}
        <Card className="mt-4 !p-5">
          <h2 className="text-[17px] font-extrabold leading-tight">{l({ ko: '이 검사의 과학', en: 'The science behind this test', ja: 'この検査の科学' })}</h2>
          {t(`intro.${result.testId}.basis`) !== `intro.${result.testId}.basis` && (
            <div className="mt-3">
              <p className="text-[12px] font-extrabold text-mind-600"><Emoji e="🧪" inline />{l({ ko: '무엇을 재나요?', en: 'What does it measure?', ja: '何を測る？' })}</p>
              <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">{t(`intro.${result.testId}.basis`)}</p>
            </div>
          )}
          {!norm ? (
          <div className="mt-3">
            <p className="text-[12px] font-extrabold text-mind-600"><Emoji e="📊" inline />{l({ ko: '흥미 코드는 어떻게 읽나요?', en: 'How to read your interest code', ja: '興味コードの読み方' })}</p>
            <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">
              {l({
                ko: `"${code}"는 내 안에서 가장 강한 흥미 세 가지를 순서대로 적은 거예요. 다른 사람과 비교한 순위가 아니라 나만의 흥미 모양이에요. 앞 글자일수록 대체로 더 끌린다는 뜻이지만, 점수가 비슷하면 순서는 쉽게 바뀌어요. 한 글자보다 세 글자를 함께 참고해 보세요.`,
                en: `"${code}" lists your three strongest interests in order. It is not a ranking against other people — it is the shape of your own interests. Earlier letters generally mean a stronger pull, but close scores can easily swap places — use all three letters together as a guide, not just one.`,
                ja: `「${code}」はあなたの中で最も強い興味3つを順に並べたものです。他人と比べた順位ではなく、あなた自身の興味の形です。前の文字ほどおおむね強く惹かれるという意味ですが、点数が近いと順番は入れ替わりやすいです。1文字より3文字を合わせて参考にしてください。`,
              })}
            </p>
          </div>
          ) : (
          <div className="mt-3">
            <p className="text-[12px] font-extrabold text-mind-600"><Emoji e="📊" inline />{l({ ko: '상위 %는 어떻게 읽나요?', en: 'How to read the top %', ja: '上位%の読み方' })}</p>
            <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">
              {l({
                ko: `"상위 ${topPercent}%"는 같은 검사를 본 사람 100명을 한 줄로 세웠을 때 내 위치예요. 점수는 정규분포(종 모양 곡선) 기반 추정치라, 응답 컨디션에 따라 몇 % 정도는 자연스럽게 오르내릴 수 있어요. 숫자 하나보다 "어느 구간에 있는가"를 보는 게 정확한 해석이에요.`,
                en: `"Top ${topPercent}%" is your position if 100 test-takers stood in one line. Scores are estimates based on the normal (bell-curve) distribution, so a few percentage points of natural variation is expected. Reading your band matters more than any single number.`,
                ja: `「上位${topPercent}%」は同じ検査を受けた100人を一列に並べた時のあなたの位置。スコアは正規分布に基づく推定値で、コンディションにより数%は自然に変動します。数字一つより「どの区間か」を見るのが正確な解釈です。`,
              })}
            </p>
          </div>
          )}
          <div className="mt-3">
            <p className="text-[12px] font-extrabold text-mind-600"><Emoji e="🌱" inline />{l({ ko: '결과, 이렇게 쓰세요', en: 'How to use your result', ja: '結果の活かし方' })}</p>
            <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">
              {!norm
                ? l({
                    ko: '순서는 대략적이에요. 막대 전체를 보고, 끌리는 분야를 직접 체험해 보세요. 반년~1년 뒤 다시 해 보세요.',
                    en: 'The order is approximate. Look at all the bars, try out the fields that pull you in person, and retake this in six months to a year.',
                    ja: '順番はおおよそです。棒グラフ全体を見て、惹かれる分野を実際に体験してみてください。半年〜1年後にもう一度どうぞ。',
                  })
                : l({
                ko: '심리 상태는 계절처럼 변해요. 결과는 "지금의 나"를 비추는 거울이지 낙인이 아니에요. 위의 솔루션 중 하나를 골라 2~3주 실천해 보고, 4~6주 뒤 재검사로 변화를 확인해 보세요. 같은 검사를 2회 이상 하면 결과지에 추이 그래프가 생겨요.',
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
            <h2 className="text-[17px] font-extrabold leading-tight text-red-600">{t('result.seeDoctor.title')}</h2>
            <p className="mt-2 text-[14px] font-bold leading-[1.8] text-red-700/90">
              {t(`result.seeDoctor.${result.testId}`)}
            </p>
          </motion.div>
        )}

        {/* 참고 절단점 (임상 척도, 정밀화 2차) */}
        {['adhd', 'burnout', 'dopamine'].includes(result.testId) && (
          <div className="mt-3 rounded-2xl bg-surface2 p-3.5">
            <p className="text-[12px] font-extrabold text-ink-sub"><Emoji e="📋" inline />{t('result.cutoffTitle')}</p>
            <p className="mt-1 break-keep text-[12px] font-bold leading-relaxed text-ink-faint">{t(`result.cutoff.${result.testId}`)}</p>
          </div>
        )}

        {/* IQ 추정 지표 안내 (정밀화 3차) */}
        {result.testId === 'iq' && (
          <div className="mt-3 rounded-2xl bg-surface2 p-3.5">
            <p className="text-[12px] font-extrabold text-ink-sub"><Emoji e="📋" inline />{t('result.estTitle')}</p>
            <p className="mt-1 break-keep text-[12px] font-bold leading-relaxed text-ink-faint">{t('result.iqEstimate')}</p>
          </div>
        )}
          </div>
          {locked && (
            <div className="absolute inset-x-0 top-4 flex justify-center px-3">
              <div className="w-full max-w-sm rounded-3xl border-2 border-[#D7DAF7] bg-surface/95 p-6 text-center shadow-pop">
                <div className="leading-none"><Emoji e="🔒" size={28} className="align-top" /></div>
                <h3 className="mt-2 text-[17px] font-extrabold">{lockedIq ? l({ ko: '정밀 IQ 결과 해제', en: 'Unlock full IQ result', ja: '精密IQ結果を解除' }) : l({ ko: '상세 분석 해제', en: 'Unlock full analysis', ja: '詳細分析を解除' })}</h3>
                <p className="mx-auto mt-1.5 max-w-[280px] break-keep text-[13px] font-bold leading-relaxed text-ink-sub">
                  {l({ ko: '인지영역별 분석부터 정밀 해석, 강점과 주의점까지. 한 번만 해제하면 결과지 전체를 계속 볼 수 있어요.', en: 'Cognitive breakdown, deep interpretation, strengths — unlock the full result once, kept forever.', ja: '認知領域分析・精密解釈・強み/注意まで結果全体を一度解除すればずっと見られます。' })}
                </p>
                <div className="mx-auto mt-4 max-w-[260px]">
                  <Button color="iq" size="lg" onClick={tryUnlockIqResult}>
                    {l({ ko: `다이아 ${IQ_DIA_COST}개로 전체 결과 보기`, en: `Unlock for ${IQ_DIA_COST}`, ja: `${IQ_DIA_COST}個で全結果` })}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] font-bold text-ink-faint">
                  <EmojiText text={l({ ko: `보유 💎 ${diamonds} · 1회 해제 후 영구`, en: `You have 💎${diamonds} · one-time, permanent`, ja: `保有💎${diamonds}・一度で永久` })} />
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 공통 면책 (정신건강 관련 검사) — 연속 지표 고지 강화 */}
        {['adhd', 'burnout', 'dopamine', 'love', 'resilience', 'dark'].includes(result.testId) && (
          <p className="mt-3 px-2 text-center text-[12px] font-bold leading-relaxed text-ink-faint">
            {t('result.medical')} {t('result.contInd')}
          </p>
        )}

        {/* 공유 보상 섹션 — 바이럴 루프 */}
        <Card className="mt-4 text-center">
          <h2 className="text-[17px] font-extrabold leading-tight">{t('share.title')}</h2>
          {shareMsg && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 text-[14px] font-extrabold text-mind-700"
            >
              <Emoji e="✅" inline />{shareMsg}
            </motion.p>
          )}
          {/* 카드 배경 테마 선택 */}
          <div className="mt-3 flex items-center justify-center gap-2.5">
            {CARD_THEMES.map((th, i) => (
              <button
                key={i}
                onClick={() => setCardTheme(i)}
                aria-pressed={cardTheme === i}
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
          {/* 앱 WebView에선 카카오 JS 공유가 조용히 실패한다 — 앱은 네이티브 공유 시트에서 카카오톡을 고른다 */}
            {kakaoEnabled() && !isNativeApp() && (
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
              <Emoji e="💬" inline />{t('quick.shareKakao')}
            </button>
          )}
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <Button color="sky" onClick={shareCard}>
              {t('share.card')}
            </Button>
            <Button color="white" onClick={share}>
              <EmojiText text={copied ? t('common.copied') : t('share.text')} />
            </Button>
          </div>
          {/* 대결은 '상위 %' 비교다 — 규준 없는 검사엔 없다 */}
          {norm && (
          <button
            onClick={shareDuel}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-extrabold text-white"
            style={{ background: `linear-gradient(135deg, ${persona.grad[0]}, ${persona.grad[1]})` }}
          >
            {l({ ko: '친구와 결과 대결', en: 'Challenge a friend', ja: '友達と結果バトル' })}
          </button>
          )}
        </Card>

        {/* 친구 초대 CTA — 결과 공유 직후 바이럴 (둘 다 +100P) */}
        <button
          onClick={() => nav('/rewards')}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl p-3.5 text-left shadow-card"
          style={{ background: 'linear-gradient(135deg,#4FA882,#6E9FDC)' }}
        >
          <Emoji e="🎁" size={24} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-extrabold leading-tight text-white">{l({ ko: '친구 초대하면 둘 다 +100P', en: 'Invite a friend — you both get +100P', ja: '友達招待で二人とも+100P' })}</p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-white/85">{l({ ko: '코드 공유하고 보너스 받기', en: 'Share your code & earn', ja: 'コードを共有してボーナス' })}</p>
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
            <EmojiText text={avatarSet ? `✅ ${t('result.avatarSet')}` : t('result.setAvatar')} />
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
            <Emoji e="🎉" size={20} />
            <p className="min-w-0 flex-1 break-keep text-[13px] font-extrabold leading-snug">
              {t('result.newAnimal')}
            </p>
            <button onClick={() => nav('/dex')} className="shrink-0 rounded-full bg-white/25 px-3 py-1.5 text-[12px] font-extrabold">
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
            <Emoji e="🔄" inline />{t('result.retake')}
          </Button>
          <Button color="mind" onClick={() => nav('/')}>
            <Emoji e="🏠" inline />{t('result.home')}
          </Button>
        </div>

        {/* 광고는 해석을 다 읽은 뒤 페이지 맨 아래 한 자리만. 해석이 잠긴(블러) 결과엔 게재하지 않는다 —
            읽을 수 있는 게시자 콘텐츠가 없는 화면이 되기 때문(애드센스 '콘텐츠 없는 화면' 정책) */}
        {!locked && (
          <div className="mt-5">
            <AdSlot variant="rect" />
          </div>
        )}

        {/* 다이아 부족 → 충전 안내 (IQ 결과 해제) */}
        <Modal open={needCharge} onClose={() => setNeedCharge(false)}>
          <div className="text-center">
            <p className="leading-none"><Emoji e="💎" size={28} className="align-top" /></p>
            <h3 className="mt-2 text-[20px] font-extrabold">{l({ ko: '다이아가 부족해요', en: 'Not enough diamonds', ja: 'ダイヤが足りません' })}</h3>
            <p className="mt-1 break-keep text-[13px] font-bold text-ink-faint">
              <EmojiText text={l({ ko: `상세 결과 해제에 ${IQ_DIA_COST}다이아가 필요해요 · 보유 ${diamonds}`, en: `Unlock needs 💎${IQ_DIA_COST} · you have ${diamonds}`, ja: `解除に💎${IQ_DIA_COST}必要・保有${diamonds}` })} />
            </p>
            <div className="mt-5">
              <Button color="iq" onClick={() => nav('/charge')}><Emoji e="💎" inline />{l({ ko: '충전하러 가기', en: 'Go charge', ja: 'チャージへ' })}</Button>
              <button onClick={() => setNeedCharge(false)} className="mt-2 w-full py-2 text-[13px] font-bold text-ink-faint">{l({ ko: '닫기', en: 'Close', ja: '閉じる' })}</button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}
