import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TopBar, Card, ProgressBar, Modal } from '../components/ui'
import Button from '../components/Button'
import AdGate from '../components/AdGate'
import { useStore, FORTUNE_FREE_PER_MONTH, FORTUNE_DIA_COST, FORTUNE_DETAIL_DIA_COST } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sajuOf, fortuneOf, weekOf, yearOf, monthOf, zodiacTodayLines, detailOf } from '../lib/saju'
import { makeResultCard, shareCardBlob } from '../lib/shareCard'
import { ELEMENT_SVG } from '../lib/characters'
import { WEEK_LINES } from '../data/fortune'
import { track } from '../lib/analytics'
import { burst } from '../lib/confetti'

export default function Fortune() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const birthDate = useStore((s) => s.birthDate)
  const setBirthDate = useStore((s) => s.setBirthDate)
  const diamonds = useStore((s) => s.diamonds)
  const fortuneMonth = useStore((s) => s.fortuneMonth)
  const fortuneFreeUses = useStore((s) => s.fortuneFreeUses)
  const viewFortuneFull = useStore((s) => s.viewFortuneFull)
  const fortuneDetailDate = useStore((s) => s.fortuneDetailDate)
  const markFortuneDetail = useStore((s) => s.markFortuneDetail)
  const spendDiamonds = useStore((s) => s.spendDiamonds)
  const [draft, setDraft] = useState(birthDate)
  const [editing, setEditing] = useState(!birthDate)
  const [saved, setSaved] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [needCharge, setNeedCharge] = useState(false)
  const [showAd, setShowAd] = useState(false)

  const data = useMemo(() => {
    if (!birthDate) return null
    const [y, m, d] = birthDate.split('-').map(Number)
    if (!y || !m || !d) return null
    const now = new Date()
    const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }
    const birth = { y, m, d }
    return {
      saju: sajuOf(y, m, d),
      fortune: fortuneOf(birth, today),
      week: weekOf(birth, today),
      year: yearOf(birth, today.y),
      month: monthOf(birth, today.y, today.m),
      zodiac: zodiacTodayLines(today),
      detail: detailOf(birth, today),
    }
  }, [birthDate])

  useEffect(() => {
    if (data) track('fortune_view')
  }, [data])

  const shareFortune = async () => {
    if (!data) return
    const { saju, fortune } = data
    track('share', { channel: 'fortune' })
    try {
      const blob = await makeResultCard({
        emoji: saju.zodiacEmoji,
        name: `${saju.iljuKo} · ${saju.zodiacKo}${t('fortune.zodiacSuffix')}`,
        title: `${t('fortune.overall')} ${fortune.overall}${t('fortune.point')}`,
        topPercent: 0,
        chipText: `${fortune.luckyColorKo} · ${fortune.luckyNumber}`,
        testName: t('fortune.title'),
        grad: fortune.grad,
        appName: t('app.name'),
        heroLabel: t('fortune.title'),
        ctaTop: '내 오늘의 운세는? 🔮',
        ctaSub: '지금 누리 마인드에서 무료로 →',
      })
      const how = await shareCardBlob(blob, `[누리 마인드] 오늘의 운세 · ${saju.zodiacKo}띠 ${saju.iljuKo}`, 'nurimind-fortune.png')
      if (how === 'downloaded') {
        setSaved(true)
        setTimeout(() => setSaved(false), 2200)
      }
    } catch {
      /* noop */
    }
  }

  // ── 생일 입력 ──
  if (editing || !data) {
    return (
      <div className="bg-dots min-h-dvh pb-36">
        <TopBar back="/" title={t('fortune.title')} />
        <main className="mx-auto max-w-md px-5">
          <div className="mt-7 text-center">
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-[58px] leading-none">
              🔮
            </motion.div>
            <h1 className="mt-3 break-keep text-[22px] font-extrabold leading-tight">{t('fortune.askTitle')}</h1>
            <p className="mt-2 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">{t('fortune.askSub')}</p>
          </div>
          <Card className="mt-6">
            <label className="px-1 text-[13px] font-extrabold">{t('fortune.birthLabel')}</label>
            <input
              type="date"
              value={draft}
              max="2025-12-31"
              min="1920-01-01"
              onChange={(e) => setDraft(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3.5 text-[16px] font-extrabold outline-none focus:border-mind-400"
            />
            <p className="mt-2 px-1 text-[11.5px] font-medium leading-relaxed text-ink-faint">{t('fortune.birthHint')}</p>
            <div className="mt-4">
              <Button color="mind" size="lg" disabled={!draft} onClick={() => { setBirthDate(draft); setEditing(false) }}>
                🔮 {t('fortune.see')}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  const { saju, fortune, week, year, month, zodiac, detail } = data
  const tpl = fortune.template
  const now2 = new Date()
  const thisYear = now2.getFullYear()
  const thisMonth = now2.getMonth() + 1
  const monthKey = `${thisYear}-${String(thisMonth).padStart(2, '0')}`
  const freeUsed = fortuneMonth === monthKey ? fortuneFreeUses : 0
  const freeLeft = Math.max(0, FORTUNE_FREE_PER_MONTH - freeUsed)
  const openFull = () => {
    const r = viewFortuneFull()
    if (r === 'need') {
      setNeedCharge(true)
      return
    }
    setUnlocked(true)
    burst()
  }
  const todayStr = new Date().toISOString().slice(0, 10)
  const detailUnlocked = fortuneDetailDate === todayStr
  const unlockDetailDia = () => {
    if (spendDiamonds(FORTUNE_DETAIL_DIA_COST)) {
      markFortuneDetail()
      burst()
    } else {
      setNeedCharge(true)
    }
  }
  const gauges = [
    { key: 'overall', emoji: '✨', label: t('fortune.overall'), score: fortune.overall, text: l(tpl.overall) },
    { key: 'love', emoji: '💕', label: t('fortune.love'), score: fortune.love, text: l(tpl.love) },
    { key: 'money', emoji: '💰', label: t('fortune.money'), score: fortune.money, text: l(tpl.money) },
    { key: 'health', emoji: '🌿', label: t('fortune.health'), score: fortune.health, text: l(tpl.health) },
  ]

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/" title={t('fortune.title')} />
      <main className="mx-auto max-w-md px-5">
        {/* 사주 히어로 */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 190, damping: 18 }}
          className="relative mt-3 rounded-3xl p-6 text-center text-white shadow-pop"
          style={{ background: `linear-gradient(135deg, ${fortune.grad[0]}, ${fortune.grad[1]})` }}
        >
          {ELEMENT_SVG[saju.ilganEl] && (
            <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25" title={saju.ilganEl}>
              <img src={`data:image/svg+xml;utf8,${encodeURIComponent(ELEMENT_SVG[saju.ilganEl])}`} alt="" className="h-8 w-8" />
            </div>
          )}
          <p className="text-[12.5px] font-extrabold text-white/85">{t('fortune.todayIs', { ilju: fortune.todayIljuKo })}</p>
          <div className="floaty mt-1 text-[58px] leading-none">{saju.zodiacEmoji}</div>
          <h1 className="mt-2 text-[23px] font-extrabold tracking-tight">{t('fortune.myIlju', { ilju: saju.iljuKo })}</h1>
          <p className="mt-1.5 text-[13.5px] font-bold text-white/90">
            {t('fortune.zodiacLine', { zodiac: saju.zodiacKo, ym: saju.ilganYm, el: saju.ilganEl })}
          </p>
        </motion.div>

        {/* 탄생화 */}
        <Card className="mt-3 flex items-center gap-3">
          <span className="text-[32px]">{saju.birthFlower.emoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="break-keep text-[15px] font-extrabold">{t('fortune.birthFlower', { name: saju.birthFlower.nameKo })}</h3>
            <p className="mt-0.5 break-keep text-[12.5px] font-medium leading-relaxed text-ink-sub">
              「{saju.birthFlower.meaningKo}」 · {saju.birthFlower.blurbKo}
            </p>
          </div>
        </Card>

        {/* 오늘의 기운 */}
        <h2 className="mt-6 px-1 text-[17px] font-extrabold tracking-tight">{t('fortune.todayLuck')}</h2>
        <div className="mt-3 space-y-2.5">
          {gauges.map((g, i) => (
            <motion.div key={g.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, type: 'spring', stiffness: 240, damping: 24 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <span className="text-[14.5px] font-extrabold">{g.emoji} {g.label}</span>
                  <span className="text-[13.5px] font-extrabold" style={{ color: fortune.grad[0] }}>{g.score}{t('fortune.point')}</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={g.score / 100} color={fortune.grad[0]} />
                </div>
                <p className="mt-2.5 break-keep text-[13.5px] font-medium leading-relaxed text-ink">{g.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 행운 요소 */}
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[
            { emoji: '🎨', label: t('fortune.luckyColor'), val: fortune.luckyColorKo },
            { emoji: '🔢', label: t('fortune.luckyNum'), val: String(fortune.luckyNumber) },
            { emoji: '🧭', label: t('fortune.luckyDir'), val: fortune.luckyDir },
          ].map((x) => (
            <div key={x.label} className="rounded-2xl bg-surface p-3 text-center shadow-card">
              <div className="text-[22px] leading-none">{x.emoji}</div>
              <p className="mt-1.5 text-[11px] font-bold text-ink-faint">{x.label}</p>
              <p className="mt-0.5 text-[15px] font-extrabold">{x.val}</p>
            </div>
          ))}
        </div>

        {/* ── 오늘의 상세 운세 (광고 또는 5💎 해제 · 하루 무제한 열람) ── */}
        <div className="mt-7 flex items-center gap-2 px-1">
          <h2 className="text-[17px] font-extrabold tracking-tight">🔮 {l({ ko: '오늘의 상세 운세', en: 'Detailed Daily Fortune', ja: '今日の詳細運勢' })}</h2>
          {detailUnlocked ? (
            <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700">{l({ ko: '열람 중', en: 'unlocked', ja: '閲覧中' })}</span>
          ) : (
            <span className="rounded-full bg-adhd-light px-2 py-0.5 text-[11px] font-extrabold text-adhd-deep">{l({ ko: '프리미엄', en: 'Premium', ja: 'プレミアム' })}</span>
          )}
        </div>
        <p className="mt-1 break-keep px-1 text-[12.5px] font-medium leading-relaxed text-ink-sub">
          {l({ ko: '시간대별 흐름부터 행운의 방향·장소·아이템까지, 오늘 하루를 아주 자세하게 풀어드려요.', en: 'From hour-by-hour flow to lucky direction, place, and item — your whole day in full detail.', ja: '時間帯ごとの流れから幸運の方角・場所・アイテムまで、今日を詳しく解説。' })}
        </p>

        <div className="relative mt-3">
          <div className={detailUnlocked ? 'space-y-3' : 'pointer-events-none max-h-[440px] space-y-3 overflow-hidden select-none blur-[5px]'} aria-hidden={!detailUnlocked}>
            {/* 시간대별 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">⏰ {l({ ko: '시간대별 운세', en: 'By Time of Day', ja: '時間帯別の運勢' })}</h3>
              <div className="mt-2.5 space-y-2.5">
                {[
                  { emoji: '🌅', label: l({ ko: '아침', en: 'Morning', ja: '朝' }), text: l(detail.morning) },
                  { emoji: '☀️', label: l({ ko: '낮', en: 'Noon', ja: '昼' }), text: l(detail.noon) },
                  { emoji: '🌙', label: l({ ko: '저녁', en: 'Evening', ja: '夜' }), text: l(detail.evening) },
                ].map((r) => (
                  <div key={r.label} className="rounded-2xl bg-surface2 p-3">
                    <span className="text-[12.5px] font-extrabold text-mind-700">{r.emoji} {r.label}</span>
                    <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink">{r.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 행운 포인트 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">🍀 {l({ ko: '오늘의 행운 포인트', en: 'Lucky Points', ja: '今日のラッキーポイント' })}</h3>
              <div className="mt-2.5 space-y-2">
                {[
                  { emoji: '⏳', label: l({ ko: '행운의 시간', en: 'Lucky time', ja: 'ラッキー時間' }), val: detail.luckyTime },
                  { emoji: '🧭', label: l({ ko: '좋은 방향', en: 'Good direction', ja: '良い方角' }), val: fortune.luckyDir },
                  { emoji: '📍', label: l({ ko: '행운의 장소', en: 'Lucky place', ja: 'ラッキー場所' }), val: l(detail.place) },
                  { emoji: '🎁', label: l({ ko: '행운의 아이템', en: 'Lucky item', ja: 'ラッキーアイテム' }), val: l(detail.item) },
                  { emoji: '🍴', label: l({ ko: '행운의 음식', en: 'Lucky food', ja: 'ラッキーフード' }), val: l(detail.food) },
                ].map((r) => (
                  <div key={r.label} className="flex items-start gap-2.5 rounded-2xl bg-surface2 p-2.5">
                    <span className="text-[18px] leading-none">{r.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] font-bold text-ink-faint">{r.label}</p>
                      <p className="mt-0.5 break-keep text-[13.5px] font-extrabold text-ink">{r.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 분야별 상세 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">📊 {l({ ko: '분야별 상세', en: 'By Area', ja: '分野別の詳細' })}</h3>
              <div className="mt-2.5 space-y-3">
                {[
                  { emoji: '🤝', label: l({ ko: '인간관계', en: 'Relationships', ja: '人間関係' }), text: l(detail.relation) },
                  { emoji: '💼', label: l({ ko: '일·학업', en: 'Work & Study', ja: '仕事・学業' }), text: l(detail.work) },
                  { emoji: '💰', label: l({ ko: '재물', en: 'Wealth', ja: '財運' }), text: l(detail.wealth) },
                  { emoji: '🌿', label: l({ ko: '건강', en: 'Health', ja: '健康' }), text: l(detail.health) },
                ].map((r) => (
                  <div key={r.label}>
                    <span className="text-[12.5px] font-extrabold text-mind-700">{r.emoji} {r.label}</span>
                    <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink">{r.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 조심 & 조언 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">⚠️ {l({ ko: '오늘 조심할 것', en: 'Watch Out For', ja: '今日の注意点' })}</h3>
              <p className="mt-1.5 break-keep text-[13px] font-medium leading-relaxed text-ink">{l(detail.caution)}</p>
              <h3 className="mt-3.5 text-[14px] font-extrabold">💡 {l({ ko: '오늘의 조언', en: 'Today’s Advice', ja: '今日の助言' })}</h3>
              <p className="mt-1.5 break-keep text-[13px] font-medium leading-relaxed text-ink">{l(detail.advice)}</p>
            </Card>

            {/* 총평 */}
            <div className="rounded-3xl p-4 text-white shadow-pop" style={{ background: `linear-gradient(135deg, ${fortune.grad[0]}, ${fortune.grad[1]})` }}>
              <h3 className="text-[12.5px] font-extrabold text-white/85">📝 {l({ ko: '오늘의 총평', en: 'Summary', ja: '今日の総評' })}</h3>
              <p className="mt-1.5 break-keep text-[14px] font-extrabold leading-relaxed">{l(detail.summary)}</p>
            </div>
          </div>

          {/* 잠금 오버레이 */}
          {!detailUnlocked && (
            <div className="absolute inset-0 flex items-end justify-center rounded-3xl bg-gradient-to-b from-transparent via-cream/60 to-cream pb-1">
              <div className="w-full rounded-3xl border-2 border-mind-200 bg-surface p-5 text-center shadow-pop">
                <div className="text-[34px] leading-none">🔒</div>
                <h3 className="mt-2 break-keep text-[16px] font-extrabold">{l({ ko: '상세 운세 잠금 해제', en: 'Unlock Detailed Fortune', ja: '詳細運勢を解除' })}</h3>
                <p className="mt-1 break-keep text-[12.5px] font-medium leading-relaxed text-ink-sub">
                  {l({ ko: '광고를 보거나 다이아 5개로 오늘 하루 종일 열람할 수 있어요.', en: 'Watch an ad or spend 5💎 to view all day today.', ja: '広告視聴または5💎で今日一日中閲覧できます。' })}
                </p>
                <div className="mt-4 space-y-2.5">
                  <Button color="mind" size="lg" onClick={() => setShowAd(true)}>
                    📺 {l({ ko: '광고 보고 무료로 해제', en: 'Watch Ad — Free', ja: '広告を見て無料で解除' })}
                  </Button>
                  <Button color="white" size="lg" onClick={unlockDetailDia}>
                    💎 {l({ ko: `다이아 ${FORTUNE_DETAIL_DIA_COST}개로 해제`, en: `Unlock with ${FORTUNE_DETAIL_DIA_COST}💎`, ja: `${FORTUNE_DETAIL_DIA_COST}💎で解除` })}
                  </Button>
                </div>
                <p className="mt-2.5 text-[11.5px] font-bold text-ink-faint">{l({ ko: '보유', en: 'Balance', ja: '保有' })} 💎 {diamonds.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── 종합 운세 (프리미엄: 매월 무료 3회 → 이후 5다이아) ── */}
        {unlocked ? (
          <>
            <div className="mt-6 flex items-center gap-2 px-1">
              <h2 className="text-[17px] font-extrabold tracking-tight">🔮 {l({ ko: '종합 운세', en: 'Full Fortune', ja: '総合運勢' })}</h2>
              <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700">{l({ ko: '열람 중', en: 'unlocked', ja: '閲覧中' })}</span>
            </div>

            {/* 이번 주 총운 추이 */}
            <h3 className="mt-4 px-1 text-[15px] font-extrabold tracking-tight text-ink-sub">{t('fortune.weekTitle')}</h3>
            <Card className="mt-2">
              <div className="flex items-end justify-between gap-1.5">
                {week.map((w, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10.5px] font-extrabold" style={{ color: w.isToday ? fortune.grad[0] : '#9AA5A0' }}>{w.overall}</span>
                    <div className="flex h-[72px] w-full items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${w.overall}%` }}
                        transition={{ delay: 0.04 * i, type: 'spring', stiffness: 200, damping: 22 }}
                        className="w-[58%] rounded-full"
                        style={{ background: w.isToday ? `linear-gradient(${fortune.grad[0]}, ${fortune.grad[1]})` : '#DCE4DF' }}
                      />
                    </div>
                    <span className="text-[10.5px] font-bold" style={{ color: w.isToday ? fortune.grad[0] : '#9AA5A0' }}>{w.isToday ? t('fortune.today') : w.weekdayKo}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">{l(WEEK_LINES[fortune.relation])}</p>
            </Card>

            {/* 이달의 운 */}
            <Card className="mt-3 flex items-start gap-3">
              <span className="shrink-0 text-[26px]">🗓</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[14.5px] font-extrabold">{l({ ko: `${thisMonth}월의 운`, en: 'This month', ja: `${thisMonth}月の運` })}</h3>
                  <span className="shrink-0 text-[13px] font-extrabold" style={{ color: fortune.grad[0] }}>{month.overall}{t('fortune.point')}</span>
                </div>
                <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">{l(month.line)}</p>
              </div>
            </Card>

            {/* 올해의 운 */}
            <Card className="mt-3 flex items-start gap-3">
              <span className="shrink-0 text-[26px]">📅</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-extrabold">{t('fortune.yearTitle', { year: thisYear })}</h3>
                <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">{l(year.line)}</p>
              </div>
            </Card>

            {/* 띠별 오늘 한마디 */}
            <h3 className="mt-6 px-1 text-[15px] font-extrabold tracking-tight text-ink-sub">{t('fortune.zodiacTitle')}</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {zodiac.map((z) => {
                const mine = z.zodiacKo === saju.zodiacKo
                return (
                  <div
                    key={z.zodiacKo}
                    className="flex items-center gap-2 rounded-2xl p-2.5"
                    style={{ background: mine ? `${fortune.grad[0]}14` : 'rgb(var(--surface))', border: mine ? `2px solid ${fortune.grad[0]}` : '2px solid rgb(var(--line))' }}
                  >
                    <span className="shrink-0 text-[22px] leading-none">{z.zodiacEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-extrabold">{z.zodiacKo}{t('fortune.zodiacSuffix')}{mine ? ' · 나' : ''}</p>
                      <p className="break-keep text-[10.5px] font-medium leading-tight text-ink-sub">{l(z.line)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="relative mt-6 overflow-hidden rounded-3xl border-2 border-dashed border-[#8B7CF6] bg-surface2 p-6 text-center">
            {/* 흐릿한 미리보기 */}
            <div className="pointer-events-none absolute inset-x-5 bottom-3 flex items-end justify-between gap-1.5 opacity-30 blur-[3px]">
              {week.map((w, i) => (
                <div key={i} className="flex-1 rounded-full" style={{ height: `${10 + w.overall * 0.4}px`, background: fortune.grad[0] }} />
              ))}
            </div>
            <div className="relative">
              <div className="text-[40px] leading-none">🔮</div>
              <h3 className="mt-2 text-[18px] font-extrabold">{l({ ko: '종합 운세 풀어보기', en: 'Unlock Full Fortune', ja: '総合運勢を開く' })}</h3>
              <p className="mx-auto mt-1 max-w-[260px] break-keep text-[12.5px] font-medium leading-relaxed text-ink-sub">
                {l({ ko: '오늘은 무료, 이번 주·이달·올해 운세를 한 번에', en: 'Today is free — unlock week, month & year at once', ja: '今日は無料、今週・今月・今年をまとめて' })}
              </p>
              <div className="mx-auto mt-3 grid max-w-[300px] grid-cols-2 gap-2">
                {[
                  { e: '🌅', label: l({ ko: '오늘 운세', en: 'Today', ja: '今日' }), free: true },
                  { e: '📈', label: l({ ko: '이번 주 운세', en: 'This week', ja: '今週' }), free: false },
                  { e: '🗓', label: l({ ko: '이달 운세', en: 'This month', ja: '今月' }), free: false },
                  { e: '🎍', label: l({ ko: '올해 운세', en: 'This year', ja: '今年' }), free: false },
                ].map((h) => (
                  <div key={h.label} className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-2.5 py-2 text-left">
                    <span className="shrink-0 text-[16px] leading-none">{h.e}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold">{h.label}</span>
                    <span className="shrink-0 text-[11px]">{h.free ? '✅' : '🔒'}</span>
                  </div>
                ))}
              </div>
              <div className="mx-auto mt-4 max-w-[280px]">
                <Button color="burn" onClick={openFull}>
                  {freeLeft > 0
                    ? l({ ko: `무료로 보기 · 이번 달 ${freeLeft}회 남음`, en: `View free · ${freeLeft} left this month`, ja: `無料で見る・今月あと${freeLeft}回` })
                    : l({ ko: `💎 ${FORTUNE_DIA_COST}개로 보기`, en: `View for 💎${FORTUNE_DIA_COST}`, ja: `💎${FORTUNE_DIA_COST}で見る` })}
                </Button>
              </div>
              <p className="mt-2 text-[11.5px] font-medium text-ink-faint">
                {freeLeft > 0
                  ? l({ ko: `매월 ${FORTUNE_FREE_PER_MONTH}회 무료 · 이후 1회 ${FORTUNE_DIA_COST}다이아`, en: `${FORTUNE_FREE_PER_MONTH} free/month, then 💎${FORTUNE_DIA_COST}`, ja: `毎月${FORTUNE_FREE_PER_MONTH}回無料・以降💎${FORTUNE_DIA_COST}` })
                  : l({ ko: `보유 💎 ${diamonds}`, en: `You have 💎${diamonds}`, ja: `保有💎${diamonds}` })}
              </p>
            </div>
          </div>
        )}

        {/* 궁합 + 공유 */}
        <div className="mt-5 space-y-2.5">
          <Button color="love" onClick={() => nav('/compat')}>💞 {t('fortune.compatCta')}</Button>
          <Button color="sky" onClick={shareFortune}>🖼 {t('fortune.share')}</Button>
        </div>
        {saved && (
          <p className="mt-3 rounded-xl bg-mind-100 py-2 text-center text-[13px] font-extrabold text-mind-700">✅ {t('share.saved')}</p>
        )}

        <p className="mt-4 px-2 text-center text-[11.5px] font-medium leading-relaxed text-ink-faint">{t('fortune.disclaimer')}</p>
        <button onClick={() => { setDraft(birthDate); setEditing(true) }} className="mt-1 w-full py-2 text-[13px] font-extrabold text-ink-faint">
          🔁 {t('fortune.changeBirth')}
        </button>

        <Modal open={needCharge} onClose={() => setNeedCharge(false)}>
          <div className="text-center">
            <p className="text-[44px] leading-none">💎</p>
            <h3 className="mt-2 text-[19px] font-extrabold">{l({ ko: '다이아가 부족해요', en: 'Not enough diamonds', ja: 'ダイヤが足りません' })}</h3>
            <p className="mt-1 break-keep text-[13.5px] font-bold text-ink-faint">
              {l({ ko: `종합 운세 열람에 ${FORTUNE_DIA_COST}다이아가 필요해요 · 보유 ${diamonds}`, en: `Full fortune needs 💎${FORTUNE_DIA_COST} · you have ${diamonds}`, ja: `総合運勢に💎${FORTUNE_DIA_COST}必要・保有${diamonds}` })}
            </p>
            <div className="mt-5">
              <Button color="iq" onClick={() => nav('/charge')}>💎 {l({ ko: '충전하러 가기', en: 'Go charge', ja: 'チャージへ' })}</Button>
              <button onClick={() => setNeedCharge(false)} className="mt-2 w-full py-2 text-[13px] font-bold text-ink-faint">{l({ ko: '다음에', en: 'Later', ja: '後で' })}</button>
            </div>
          </div>
        </Modal>

        {showAd && (
          <AdGate
            onDone={() => {
              markFortuneDetail()
              setShowAd(false)
              burst()
            }}
          />
        )}
      </main>
    </div>
  )
}
