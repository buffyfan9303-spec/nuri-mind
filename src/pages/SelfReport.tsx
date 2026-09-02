import { useMemo } from 'react'
import { SPRING } from '../lib/motion'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, TopBar } from '../components/ui'
import { PERSONAS } from '../i18n/animalTranslations'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import type { L } from '../data/types'

/** 자기 3부작 — 자존감(가치)·완벽주의(기준)·자기효능감(능력 믿음) */
const TRIO = ['selfesteem', 'perfect', 'efficacy'] as const

interface Arch {
  emoji: string
  name: L
  desc: L
  tips: L[]
}
/** 2축(자기수용도 = 자존감+효능감 / 완벽주의 압박) → 4유형 */
const ARCHETYPES: Record<'calm' | 'driven' | 'critic' | 'grow', Arch> = {
  calm: {
    emoji: '🌿',
    name: { ko: '편안한 자기 신뢰형', en: 'Calm self-trust', ja: '穏やかな自己信頼型' },
    desc: {
      ko: '자신을 있는 그대로 받아들이고 능력도 믿으면서, 완벽에 집착하지 않아요. 가장 안정적이고 덜 지치는 자기 인식 조합이에요.',
      en: 'You accept yourself as you are, trust your ability, and don\'t cling to perfect. The steadiest, least-draining self-profile.',
      ja: '自分をそのまま受け入れ能力も信じつつ、完璧に執着しない。最も安定し疲れにくい自己認識の組み合わせです。',
    },
    tips: [
      { ko: '이 안정감을 발판으로 평소보다 한 단계 큰 도전을 시도해보세요', en: 'Use this steadiness to take on a challenge one level above usual', ja: 'この安定を足場に普段より一段大きな挑戦を' },
      { ko: '주변의 불안한 완벽주의자에게 그 여유가 좋은 본보기가 돼요', en: 'Your ease is a great model for anxious perfectionists around you', ja: 'あなたの余裕は不安な完璧主義者の良い手本に' },
    ],
  },
  driven: {
    emoji: '🚀',
    name: { ko: '단단한 성취형', en: 'Grounded achiever', ja: '堅実な達成型' },
    desc: {
      ko: '높은 기준을 세우면서도 자신을 믿고 받아들여요. 완벽주의가 \'자기비난\'이 아니라 \'성장 동력\'으로 작동하는, 건강한 고성취 조합이에요.',
      en: 'You set high standards while still trusting and accepting yourself. Perfectionism works as growth fuel, not self-blame — a healthy high-achiever mix.',
      ja: '高い基準を立てつつ自分を信じ受け入れる。完璧主義が「自己批判」でなく「成長の原動力」として働く健康な高達成型です。',
    },
    tips: [
      { ko: '기준이 높은 만큼 의도적인 휴식을 일정에 넣어 소진을 막으세요', en: 'Your bar is high — schedule deliberate rest to prevent burnout', ja: '基準が高い分、意図的な休息を予定に入れて消耗を防いで' },
      { ko: '타인에게도 같은 기준을 기대하고 있지 않은지 한 번 점검해보세요', en: 'Check whether you expect the same bar from others, too', ja: '他人にも同じ基準を期待していないか点検を' },
    ],
  },
  critic: {
    emoji: '🥀',
    name: { ko: '자기비판적 완벽주의형', en: 'Self-critical perfectionist', ja: '自己批判的完璧主義型' },
    desc: {
      ko: '기준은 높은데 자신을 받아들이는 힘은 약한 조합입니다. "더 잘해야 해"와 "난 부족해"가 동시에 작동해 가장 쉽게 지치는 패턴이에요. 당신 잘못이 아니라, 균형이 한쪽으로 기운 것뿐이에요.',
      en: 'High standards but a weak ability to accept yourself. "I must do better" and "I\'m not enough" run at once — the easiest pattern to burn out. It\'s not your fault; the balance has just tipped one way.',
      ja: '基準は高いが自分を受け入れる力は弱い組み合わせ。「もっと上手く」と「自分は足りない」が同時に働き最も疲れやすい。あなたのせいでなく、均衡が片方に傾いただけです。',
    },
    tips: [
      { ko: '기준을 낮추기보다 \'나에게 친절한 말투\'를 먼저 연습하세요', en: 'Rather than lowering the bar, first practice a kinder inner voice', ja: '基準を下げるより「自分に優しい口調」をまず練習' },
      { ko: '완벽하지 않아도 끝낸 일을 매일 1개 기록하세요. 효능감의 증거가 쌓여요', en: 'Log one "done, not perfect" thing daily — gather evidence of efficacy', ja: '完璧でなくても終えた事を毎日1つ記録 — 効力感の証拠集め' },
    ],
  },
  grow: {
    emoji: '🌱',
    name: { ko: '자기 믿음 충전형', en: 'Confidence in the making', ja: '自己信頼チャージ型' },
    desc: {
      ko: '아직 자신에 대한 믿음이 자라는 중이에요. 완벽주의 압박이 적은 건 오히려 강점이에요. 부담 없이 작은 성공을 쌓으며 효능감과 자존감을 함께 키우기 좋은 출발점이에요.',
      en: 'Your self-belief is still growing. Low perfectionistic pressure is actually a strength — a great starting point to stack small wins and build both efficacy and esteem.',
      ja: '自分への信頼はまだ育ち中。完璧主義の圧が少ないのはむしろ強み — 負担なく小さな成功を積み、効力感と自尊心を共に育てる好スタートです。',
    },
    tips: [
      { ko: '5분이면 끝낼 작은 일부터 \'완료\' 경험을 쌓으세요', en: 'Start with a 5-minute task to build "done" experiences', ja: '5分で終わる小さな事から「完了」体験を積む' },
      { ko: '잘한 일을 매일 1가지 기록하세요. 자신을 인정하는 근육이 자라요', en: 'Log one thing you did well daily — build the self-credit muscle', ja: '良かった事を毎日1つ記録 — 自己承認の筋トレ' },
    ],
  },
}

export default function SelfReport() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const results = useStore((s) => s.results)

  const byTest = useMemo(() => {
    const m: Record<string, (typeof results)[number]> = {}
    for (const r of [...results].sort((a, b) => b.at - a.at)) if (!m[r.testId]) m[r.testId] = r
    return m
  }, [results])

  const se = byTest['selfesteem']
  const pf = byTest['perfect']
  const ef = byTest['efficacy']
  const haveAll = !!(se && pf && ef)

  const AX_LABEL: Record<string, L> = {
    selfesteem: { ko: '자존감 · 나의 가치', en: 'Self-esteem · my worth', ja: '自尊心・価値' },
    perfect: { ko: '완벽주의 · 나의 기준', en: 'Perfectionism · my standards', ja: '完璧主義・基準' },
    efficacy: { ko: '자기효능감 · 능력 믿음', en: 'Self-efficacy · capability', ja: '自己効力感・能力信念' },
  }

  if (!haveAll) {
    return (
      <div className="min-h-dvh pb-36">
        <TopBar back="/" title={l({ ko: '통합 자기 리포트', en: 'Self report', ja: '統合セルフレポート' })} />
        <main className="mx-auto max-w-md px-5 pt-8 text-center">
          <div className="text-6xl">🪞</div>
          <h1 className="mt-4 text-[20px] font-extrabold tracking-tight">{l({ ko: '자기 3부작을 완성하면 열려요', en: 'Finish the self-trio to unlock', ja: 'セルフ3部作で解放' })}</h1>
          <p className="mt-2 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
            {l({ ko: '자존감·완벽주의·자기효능감을 모두 마치면, 셋을 종합한 나만의 통합 리포트를 드려요.', en: 'Finish self-esteem, perfectionism, and self-efficacy to get a combined report.', ja: '自尊心・完璧主義・自己効力感を全て終えると統合レポートが出ます。' })}
          </p>
          <div className="mt-6 space-y-2.5 text-left">
            {TRIO.map((id) => {
              const done = !!byTest[id]
              return (
                <button
                  key={id}
                  onClick={() => !done && nav(`/test/${id}`)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 ${done ? 'border-mind-200 bg-mind-50 dark:border-mind-600/50 dark:bg-mind-500/10' : 'border-line bg-surface'}`}
                >
                  <span className="text-[20px]">{done ? '✅' : '⬜'}</span>
                  <span className="flex-1 break-keep text-[14px] font-semibold">{t(`test.${id}.name`)}</span>
                  {!done && <span className="text-[13px] font-semibold text-mind-600">{l({ ko: '하기 ›', en: 'Go ›', ja: 'やる ›' })}</span>}
                </button>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  const accept = (se.percentile + ef.percentile) / 2
  const pressure = pf.percentile
  const key = accept >= 50 ? (pressure >= 60 ? 'driven' : 'calm') : pressure >= 60 ? 'critic' : 'grow'
  const arch = ARCHETYPES[key]
  const axes = [se, pf, ef]

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '통합 자기 리포트', en: 'Self report', ja: '統合セルフレポート' })} />
      <main className="mx-auto max-w-md px-5">
        {/* 3축 요약 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.ui} className="mt-3 grid grid-cols-3 gap-2">
          {axes.map((r) => {
            const p = PERSONAS[r.persona]
            return (
              <div key={r.testId} className="flex flex-col items-center rounded-2xl bg-surface2 p-3 text-center">
                <span className="text-[24px] leading-none">{p?.emoji ?? '•'}</span>
                <span className="mt-1.5 break-keep text-[11px] font-semibold text-ink-sub">{l(AX_LABEL[r.testId])}</span>
                <span className="mt-1 break-keep text-[11px] font-medium text-ink-faint">{t(`band.${r.testId}.${r.band}`)}</span>
              </div>
            )
          })}
        </motion.div>

        {/* 통합 유형 */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING.sheet, delay: 0.08 }}>
          <Card className="mt-4 !bg-gradient-to-br !from-[#6E7BF2] !to-[#A88BF2] !p-6 text-center text-white">
            <p className="text-[12px] font-semibold text-white/80">{l({ ko: '나의 자기 인식 유형', en: 'Your self-profile', ja: 'あなたの自己認識タイプ' })}</p>
            <p className="mt-2 text-[28px] leading-none">{arch.emoji}</p>
            <h1 className="mt-2 text-[20px] font-extrabold tracking-tight">{l(arch.name)}</h1>
            <p className="mt-3 break-keep text-[14px] font-medium leading-relaxed text-white/95">{l(arch.desc)}</p>
          </Card>
        </motion.div>

        {/* 처방 */}
        <Card className="mt-3 !p-5">
          <p className="text-[14px] font-semibold">💡 {l({ ko: '나를 위한 한 걸음', en: 'A step for you', ja: 'あなたへの一歩' })}</p>
          <div className="mt-3 space-y-2.5">
            {arch.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mind-100 text-[11px] font-semibold text-mind-700">{i + 1}</span>
                <span className="break-keep text-[13px] font-medium text-ink-sub">{l(tip)}</span>
              </div>
            ))}
          </div>
        </Card>

        <p className="mt-4 px-2 text-center text-[11px] font-medium leading-relaxed text-ink-faint">
          {l({ ko: '본 리포트는 심리 참고용이며 의학적 진단이 아니에요.', en: 'For self-reflection only — not a medical diagnosis.', ja: '心理参考用で医学的診断ではありません。' })}
        </p>
        <div className="mt-4">
          <Button color="mind" onClick={() => nav('/')}>{l({ ko: '홈으로', en: 'Home', ja: 'ホーム' })}</Button>
        </div>
      </main>
    </div>
  )
}
