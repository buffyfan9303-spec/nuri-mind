import { useMemo, useState } from 'react'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { makeCogCard, shareCardBlob } from '../lib/shareCard'
import { sfx } from '../lib/sound'
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
  { id: 'switch', label: { ko: '주의전환', en: 'Switching', ja: '注意切替' }, emoji: '🔀', color: '#0EA5E9', route: '/test/switch', get: (r) => r.wq },
]

const CX = 150
const CY = 150
const R = 110
const angle = (i: number) => ((-90 + (360 / METRICS.length) * i) * Math.PI) / 180
const pt = (i: number, r: number): [number, number] => [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))]
const poly = (rs: number[]) => rs.map((r, i) => pt(i, r).join(',')).join(' ')
/** 지수(60~145) → 레이더 반경 비율(0.05~1) */
const norm = (v: number | null) => (v == null ? 0 : Math.max(0.05, Math.min(1, (v - 60) / 85)))

/** 축 개수 단일 소스 — 하드코딩 5는 6축 추가 후 '6/5' 오표기를 냈다 */
const TOTAL_METRICS = METRICS.length

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

  const weakest = useMemo(() => {
    let wi = -1
    let wv = Infinity
    scores.forEach((s, i) => {
      if (s != null && s < wv) {
        wv = s
        wi = i
      }
    })
    return wi
  }, [scores])

  const dataRs = scores.map((s) => R * norm(s))

  /* AI 종합 코멘트 (5지수 결정론 해석 — 강점/약점/수준/균형) */
  const spread = strongest >= 0 && weakest >= 0 ? (scores[strongest] as number) - (scores[weakest] as number) : 0
  const lvl =
    avg == null
      ? null
      : avg >= 115
        ? { ko: '매우 우수한', en: 'an excellent', ja: '非常に優れた' }
        : avg >= 105
          ? { ko: '평균을 웃도는', en: 'an above-average', ja: '平均を上回る' }
          : avg >= 95
            ? { ko: '평균적인', en: 'an average', ja: '平均的な' }
            : { ko: '성장 여지가 있는', en: 'a developing', ja: '成長の余地がある' }
  const balanceTxt =
    spread < 14
      ? { ko: '영역 간 균형이 고른 올라운더형이에요.', en: 'a well-balanced all-rounder.', ja: 'バランスの取れたオールラウンダーです。' }
      : { ko: '강약이 뚜렷해 강점을 살리는 전략이 유리해요.', en: 'with clear peaks — lean into your strengths.', ja: '強弱が明確で、強みを活かす戦略が有利です。' }
  const showComment = doneCount >= 2 && strongest >= 0 && weakest >= 0 && lvl != null

  const [shareMsg, setShareMsg] = useState('')
  const shareProfile = async () => {
    try {
      const blob = await makeCogCard({
        appName: l({ ko: '누리 마인드', en: 'NURI MIND', ja: 'ヌリマインド' }),
        title: l({ ko: '내 인지 프로필', en: 'My Cognitive Profile', ja: '私の認知プロフィール' }),
        composite: avg ?? 0,
        axes: METRICS.map((m, i) => ({ label: l(m.label), value: scores[i], color: m.color })),
        grad: ['#5B6CF0', '#3B82F6'],
        ctaTop: l({ ko: '내 인지 능력은? 🧠', en: 'How sharp is your mind? 🧠', ja: 'あなたの認知力は？🧠' }),
        ctaSub: l({ ko: '누리 마인드에서 무료로 확인 →', en: 'Find out free at NURI MIND →', ja: 'ヌリマインドの精密検査で無料確認 →' }),
      })
      const how = await shareCardBlob(blob, l({ ko: '내 인지 프로필을 확인해보세요!', en: 'Check out my cognitive profile!', ja: '私の認知プロフィール！' }), 'nuri-cog-profile.png')
      if (how === 'downloaded') {
        setShareMsg(l({ ko: '카드를 저장했어요', en: 'Card saved', ja: 'カードを保存しました' }))
        setTimeout(() => setShareMsg(''), 2200)
      }
      sfx.coin()
    } catch {
      sfx.err()
    }
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '인지 프로필', en: 'Cognitive Profile', ja: '認知プロフィール' })} />
      <main className="mx-auto max-w-md px-5">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={SPRING.ui}
          className="rounded-3xl bg-gradient-to-br from-[#5B6CF0] to-[#3B82F6] p-6 text-center text-white shadow-pop"
        >
          <div className="text-[28px] leading-none">🧩</div>
          <h1 className="mt-2 text-[20px] font-extrabold tracking-tight">{l({ ko: '종합 인지 프로필', en: 'Cognitive Profile', ja: '総合認知プロフィール' })}</h1>
          <p className="mt-1.5 text-[13px] font-medium text-white/85">
            {avg != null
              ? l({ ko: `두뇌 측정 ${doneCount}/${TOTAL_METRICS} · 종합 ${avg}`, en: `${doneCount}/${TOTAL_METRICS} tests · avg ${avg}`, ja: `精密検査 ${doneCount}/${TOTAL_METRICS}・総合 ${avg}` })
              : l({ ko: '두뇌 측정을 하면 내 머리 지도가 그려져요', en: 'Take precision tests to map your mind', ja: '精密検査を解くと認知地図が描かれます' })}
          </p>
        </motion.div>

        {/* 레이더 차트 */}
        <Card className="mt-4">
          <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[320px]">
            {/* 그리드 링 */}
            {[0.25, 0.5, 0.75, 1].map((k) => (
              <polygon key={k} points={poly(METRICS.map(() => k * R))} fill="none" stroke="rgb(var(--line))" strokeWidth={1} />
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

        {/* AI 종합 코멘트 */}
        {showComment && lvl && (
          <Card className="mt-4">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold">{l({ ko: 'AI 종합 코멘트', en: 'AI summary', ja: 'AI総合コメント' })}</h2>
            <p className="mt-2 break-keep text-[14px] font-medium leading-[1.85] text-ink-sub">
              {l({
                ko: `가장 강한 영역은 「${METRICS[strongest].label.ko}」, 상대적으로 약한 영역은 「${METRICS[weakest].label.ko}」예요. 전반적으로 ${lvl.ko} 인지 프로필이고, ${balanceTxt.ko}`,
                en: `Your strongest area is ${METRICS[strongest].label.en}, while ${METRICS[weakest].label.en} has the most room to grow. Overall it's ${lvl.en} cognitive profile — ${balanceTxt.en}`,
                ja: `最も強い領域は「${METRICS[strongest].label.ja}」、相対的に弱いのは「${METRICS[weakest].label.ja}」です。全体的に${lvl.ja}認知プロフィールで、${balanceTxt.ja}`,
              })}
            </p>
            <p className="mt-2 text-[11px] font-medium text-ink-faint">{l({ ko: '※ 측정 지수를 규칙 기반으로 요약한 참고용 코멘트예요.', en: '※ A rule-based summary of your measured scores, for reference.', ja: '※ 測定指数をルールベースで要約した参考コメントです。' })}</p>
          </Card>
        )}

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
                  <p className="text-[14px] font-semibold leading-tight">
                    {l(m.label)}
                    {isStrong && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600">{l({ ko: '최강', en: 'Top', ja: '最強' })}</span>}
                  </p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.round(norm(s) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={SPRING.gauge}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </div>
                {s != null ? (
                  <span className="shrink-0 text-[17px] font-semibold" style={{ color: m.color }}>
                    {s}
                  </span>
                ) : (
                  <button onClick={() => nav(m.route)} className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white" style={{ background: m.color }}>
                    {l({ ko: '검사', en: 'Take', ja: '検査' })}
                  </button>
                )}
              </Card>
            )
          })}
        </div>

        {/* 레이더 카드 공유 (바이럴) */}
        {doneCount >= 1 && (
          <div className="mt-4">
            <Button color="iq" onClick={shareProfile}>
              {l({ ko: '인지 프로필 카드 공유', en: 'Share profile card', ja: 'プロフィールカードを共有' })}
            </Button>
            {shareMsg && <p className="mt-2 text-center text-[13px] font-semibold text-mind-700">✅ {shareMsg}</p>}
          </div>
        )}

        {doneCount < TOTAL_METRICS && (
          <p className="mt-3 px-2 text-center text-[12px] font-medium leading-relaxed text-ink-faint">
            {l({ ko: `${TOTAL_METRICS - doneCount}종을 더 하면 머리 지도가 완성돼요.`, en: `Take ${TOTAL_METRICS - doneCount} more precision tests to complete your map.`, ja: `あと${TOTAL_METRICS - doneCount}種でマップが完成します。` })}
          </p>
        )}

      </main>
    </div>
  )
}
