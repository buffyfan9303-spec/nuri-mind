import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, TopBar } from '../components/ui'
import { useStore, isPremium, PREMIUM_KRW } from '../store/useStore'
import { track } from '../lib/analytics'
import { useT, useL } from '../i18n/useT'
import { localDay } from '../lib/date'
import { buildFocuses, isTaskDone, pickFocusIds } from '../lib/growth'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { sfx } from '../lib/sound'

/**
 * 🌱 성장 플래너 — 검사 결과가 알려준 방향을 "오늘 할 일"로 바꾸는 화면.
 *
 * 3상태: ①검사 부족 ②플랜 없음(생성) ③플랜 있음(투두 + 28일 캘린더)
 * 과제는 페르소나 처방에서 파생되므로 AI 키 없이도 동작한다.
 */

/** 캘린더에 보여줄 최근 일수 */
const DAYS = 28
/** 플랜 생성 최소 검사 수 */
const MIN_TESTS = 3

export default function GrowthPlan() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const results = useStore((s) => s.results)
  const premiumUntil = useStore((s) => s.premiumUntil)
  const growthPlanAt = useStore((s) => s.growthPlanAt)
  const growthFocusIds = useStore((s) => s.growthFocusIds)
  const growthDone = useStore((s) => s.growthDone)
  const buildPlan = useStore((s) => s.buildGrowthPlan)
  const resetPlan = useStore((s) => s.resetGrowthPlan)
  const toggleTask = useStore((s) => s.toggleGrowthTask)
  const { fire } = useRewardAnimation()
  const premium = isPremium(premiumUntil)
  const todayKey = localDay()
  const [toast, setToast] = useState('')

  const focuses = useMemo(() => buildFocuses(growthFocusIds, results), [growthFocusIds, results])

  /**
   * 페이월이 실제로 화면에 뜨는 조건. 아래 렌더 분기가 이 값을 그대로 쓴다 —
   * 계측과 렌더가 각자 조건을 갖고 있으면 반드시 갈라진다.
   * (실제로 갈라졌었다: 검사가 3개 미만이면 페이월 이전 화면으로 빠지는데 노출은 세고 있었고,
   *  그러면 전환율의 분모가 부풀어 실제보다 나빠 보인다 — 가격 판단을 그르치는 종류의 오류다.)
   */
  const showPaywall = !premium && results.length >= MIN_TESTS && (!growthPlanAt || focuses.length === 0)

  // 노출 1회만 계측 — 전환율의 분모
  const seenPaywall = useRef(false)
  useEffect(() => {
    if (!showPaywall || seenPaywall.current) return
    seenPaywall.current = true
    track('paywall_view', { surface: 'growth_plan', price: PREMIUM_KRW })
  }, [showPaywall])
  const allTasks = useMemo(() => focuses.flatMap((f) => f.tasks), [focuses])
  const doneToday = allTasks.filter((tk) => isTaskDone(growthDone[tk.id], tk.cadence, todayKey)).length

  /** 최근 28일 완료 히트맵 — 날짜별 완료 개수 */
  const heat = useMemo(() => {
    const counts = new Map<string, number>()
    for (const arr of Object.values(growthDone)) for (const d of arr) counts.set(d, (counts.get(d) ?? 0) + 1)
    return Array.from({ length: DAYS }, (_, i) => {
      const key = localDay(DAYS - 1 - i)
      return { key, n: counts.get(key) ?? 0 }
    })
  }, [growthDone])

  const onToggle = (id: string) => {
    const got = toggleTask(id)
    if (got > 0) {
      fire('coin')
      setToast(l({ ko: `+${got}P 적립!`, en: `+${got}P earned!`, ja: `+${got}P 獲得！` }))
      setTimeout(() => setToast(''), 1800)
    } else sfx.tap()
  }

  const onCreate = () => {
    buildPlan(pickFocusIds(results))
    sfx.coin()
  }

  /* ── ① 검사 부족 ── */
  if (results.length < MIN_TESTS) {
    return (
      <div className="bg-dots min-h-dvh pb-36">
        <TopBar back="/" title={l({ ko: '성장 플랜', en: 'Growth plan', ja: '成長プラン' })} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center">
          <div className="text-6xl">🌱</div>
          <h1 className="mt-4 break-keep text-[21px] font-extrabold tracking-tight">
            {l({ ko: '검사를 조금만 더 해주세요', en: 'A few more tests first', ja: 'もう少し検査を' })}
          </h1>
          <p className="mt-2 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
            {l({
              ko: `검사 ${MIN_TESTS}개부터 나에게 맞는 실천 계획을 만들 수 있어요. (${results.length}/${MIN_TESTS})`,
              en: `We can build your plan from ${MIN_TESTS} tests. (${results.length}/${MIN_TESTS})`,
              ja: `検査${MIN_TESTS}件からプランを作れます。(${results.length}/${MIN_TESTS})`,
            })}
          </p>
          <div className="mx-auto mt-6 max-w-[240px]">
            <Button color="mind" onClick={() => nav('/')}>
              🧠 {l({ ko: '검사하러 가기', en: 'Take a test', ja: '検査に行く' })}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  /* ── ② 플랜 없음 ── */
  if (!growthPlanAt || focuses.length === 0) {
    return (
      <div className="bg-dots min-h-dvh pb-36">
        <TopBar back="/" title={l({ ko: '성장 플랜', en: 'Growth plan', ja: '成長プラン' })} />
        <main className="mx-auto max-w-md px-5">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-3xl bg-gradient-to-br from-mind-500 to-sky2-500 p-6 text-center text-white shadow-pop"
          >
            <div className="text-[44px] leading-none">🌱</div>
            <h1 className="mt-3 break-keep text-[20px] font-extrabold leading-tight">
              {l({ ko: '검사 결과를 오늘 할 일로', en: 'Turn results into daily actions', ja: '結果を今日の行動に' })}
            </h1>
            <p className="mt-2 break-keep text-[13.5px] font-bold leading-relaxed text-white/90">
              {l({
                ko: '가장 손볼 가치가 큰 3가지를 골라, 매일·매주 할 수 있는 작은 실천으로 만들어 드려요.',
                en: 'We pick your 3 highest-leverage areas and turn them into small daily and weekly actions.',
                ja: '効果が大きい3つを選び、毎日・毎週の小さな行動にします。',
              })}
            </p>
          </motion.div>

          {/* ⚠️ premium이 아니라 showPaywall로 분기한다 — 노출 계측이 쓰는 값과 같아야 갈라지지 않는다 */}
          {!showPaywall ? (
            <div className="mt-5">
              <Button color="mind" size="lg" onClick={onCreate}>
                🌱 {l({ ko: '내 성장 플랜 만들기', en: 'Build my plan', ja: 'プランを作る' })}
              </Button>
            </div>
          ) : (
            <>
              <Card
                onClick={() => {
                  track('paywall_click', { surface: 'growth_plan', price: PREMIUM_KRW })
                  nav('/premium')
                }}
                ariaLabel={l({ ko: '프리미엄 시작', en: 'Start premium', ja: 'プレミアム開始' })}
                className="mt-5 !bg-gradient-to-br from-[#6E7BF2] to-[#A88BF2] !p-5 text-white"
              >
                <p className="flex items-center gap-2 text-[15.5px] font-extrabold">
                  ✨ {l({ ko: '프리미엄에서 열려요', en: 'Available in Premium', ja: 'プレミアムで解放' })}
                </p>
                <p className="mt-1.5 break-keep text-[13px] font-bold leading-relaxed text-white/90">
                  {l({
                    ko: `성장 플랜 + AI 심층 리포트 + 운세 무제한 · 월 ₩${PREMIUM_KRW.toLocaleString()}`,
                    en: `Growth plan + AI deep report + unlimited fortune · ₩${PREMIUM_KRW.toLocaleString()}/mo`,
                    ja: `成長プラン+AIレポート+運勢無制限・月₩${PREMIUM_KRW.toLocaleString()}`,
                  })}
                </p>
                <div className="mt-3 rounded-2xl bg-white px-4 py-2.5 text-center text-[14px] font-extrabold text-[#5B4FD8]">
                  {l({ ko: '프리미엄 시작하기 →', en: 'Start Premium →', ja: 'プレミアム開始 →' })}
                </div>
              </Card>
              <p className="mt-4 break-keep px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">
                {l({
                  ko: '지금도 검사 결과지에서 검사별 7일 루틴은 무료로 이용할 수 있어요.',
                  en: 'The 7-day routine per test is still free from your result page.',
                  ja: '検査ごとの7日ルーティンは結果ページから無料で使えます。',
                })}
              </p>
            </>
          )}
        </main>
      </div>
    )
  }

  /* ── ③ 플랜 있음 ── */
  const dayCount = Math.max(1, Math.floor((Date.now() - growthPlanAt) / 86400000) + 1)
  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '성장 플랜', en: 'Growth plan', ja: '成長プラン' })} />
      <main className="mx-auto max-w-md px-5">
        {/* 오늘 진행 */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="mt-4 rounded-3xl bg-gradient-to-br from-mind-500 to-sky2-500 p-5 text-white shadow-pop"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[13px] font-extrabold text-white/85">
                🌱 {l({ ko: `성장 ${dayCount}일차`, en: `Day ${dayCount}`, ja: `成長${dayCount}日目` })}
              </p>
              <p className="mt-1 text-[26px] font-extrabold leading-none">
                {doneToday}
                <span className="text-[15px] font-bold text-white/80"> / {allTasks.length}</span>
              </p>
            </div>
            <p className="pb-1 text-[12.5px] font-bold text-white/85">
              {doneToday >= allTasks.length
                ? l({ ko: '오늘 완료! 🎉', en: 'All done today! 🎉', ja: '今日は完了！🎉' })
                : l({ ko: '오늘의 실천', en: "Today's actions", ja: '今日の実践' })}
            </p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/25">
            <motion.div
              animate={{ width: `${allTasks.length ? (doneToday / allTasks.length) * 100 : 0}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 26 }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </motion.div>

        {toast && (
          <motion.p
            initial={{ opacity: 0, y: 8, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            className="fixed bottom-40 left-1/2 z-50 rounded-full bg-mind-600 px-4 py-2 text-[13.5px] font-extrabold text-white shadow-pop"
          >
            🌱 {toast}
          </motion.p>
        )}

        {/* 포커스별 투두 */}
        {focuses.map((f, i) => (
          <motion.div
            key={f.testId}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, type: 'spring', stiffness: 220, damping: 24 }}
          >
            <Card className="mt-3.5 !p-5">
              <h2 className="flex items-center gap-2 break-keep text-[15.5px] font-extrabold tracking-tight">
                <span>{f.emoji}</span>
                {t(`test.${f.testId}.short`)}
              </h2>
              <div className="mt-2.5 space-y-1">
                {f.tasks.map((tk) => {
                  const done = isTaskDone(growthDone[tk.id], tk.cadence, todayKey)
                  return (
                    <button
                      key={tk.id}
                      onClick={() => onToggle(tk.id)}
                      className="flex w-full items-start gap-2.5 rounded-2xl px-1 py-2.5 text-left transition-colors active:bg-surface2"
                      aria-pressed={done}
                    >
                      <span
                        className={`mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border-2 text-[13px] font-black leading-none transition-colors ${
                          done ? 'border-mind-500 bg-mind-500 text-white' : 'border-line bg-surface text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block break-keep text-[14px] font-bold leading-relaxed ${done ? 'text-ink-faint line-through' : 'text-ink'}`}
                        >
                          {l(tk.title)}
                        </span>
                        <span className="mt-0.5 inline-block rounded-full bg-surface2 px-2 py-0.5 text-[10.5px] font-extrabold text-ink-faint">
                          {tk.cadence === 'daily'
                            ? l({ ko: '매일', en: 'Daily', ja: '毎日' })
                            : l({ ko: '주 1회', en: 'Weekly', ja: '週1回' })}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        ))}

        {/* 28일 캘린더 히트맵 */}
        <Card className="mt-3.5 !p-5">
          <h2 className="text-[15.5px] font-extrabold tracking-tight">
            📅 {l({ ko: '최근 4주 실천 기록', en: 'Last 4 weeks', ja: '直近4週の記録' })}
          </h2>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {heat.map((d) => (
              <div
                key={d.key}
                title={`${d.key} · ${d.n}`}
                className="aspect-square rounded-md"
                style={{
                  background:
                    d.n === 0
                      ? 'rgb(var(--surface2))'
                      : `rgba(79, 168, 130, ${Math.min(0.25 + d.n * 0.25, 1)})`,
                  outline: d.key === todayKey ? '2px solid #4FA882' : undefined,
                  outlineOffset: d.key === todayKey ? '1px' : undefined,
                }}
              />
            ))}
          </div>
          <p className="mt-2.5 text-[11.5px] font-medium text-ink-faint">
            {l({ ko: '진할수록 그날 실천이 많았어요', en: 'Darker means more actions that day', ja: '濃いほど実践が多い日' })}
          </p>
        </Card>

        <button onClick={resetPlan} className="mx-auto mt-5 block text-[12.5px] font-extrabold text-ink-faint">
          🔄 {l({ ko: '플랜 다시 만들기', en: 'Rebuild plan', ja: 'プランを作り直す' })}
        </button>
      </main>
    </div>
  )
}
