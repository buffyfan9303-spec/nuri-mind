import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TopBar, Card, ProgressBar, Modal } from '../components/ui'
import Button from '../components/Button'
import { useStore, FORTUNE_FREE_PER_MONTH, FORTUNE_DIA_COST } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sajuOf, fortuneOf, weekOf, yearOf, monthOf, zodiacTodayLines } from '../lib/saju'
import { makeResultCard, shareCardBlob } from '../lib/shareCard'
import { ELEMENT_SVG } from '../lib/characters'
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
  const [draft, setDraft] = useState(birthDate)
  const [editing, setEditing] = useState(!birthDate)
  const [saved, setSaved] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [needCharge, setNeedCharge] = useState(false)

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

  const { saju, fortune, week, year, month, zodiac } = data
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
              <div className="min-w-0">
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
                    style={{ background: mine ? `${fortune.grad[0]}14` : '#fff', border: mine ? `2px solid ${fortune.grad[0]}` : '2px solid #EEF2F0' }}
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
          <div className="relative mt-6 overflow-hidden rounded-3xl border-2 border-dashed border-[#C9C3F2] bg-[#F7F6FE] p-6 text-center">
            {/* 흐릿한 미리보기 */}
            <div className="pointer-events-none absolute inset-x-5 bottom-3 flex items-end justify-between gap-1.5 opacity-30 blur-[3px]">
              {week.map((w, i) => (
                <div key={i} className="flex-1 rounded-full" style={{ height: `${10 + w.overall * 0.4}px`, background: fortune.grad[0] }} />
              ))}
            </div>
            <div className="relative">
              <div className="text-[40px] leading-none">🔮</div>
              <h3 className="mt-2 text-[18px] font-extrabold">{l({ ko: '종합 운세 풀어보기', en: 'Unlock Full Fortune', ja: '総合運勢を開く' })}</h3>
              <p className="mx-auto mt-1 max-w-[260px] break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
                {l({ ko: '이번 주 추이 · 이달의 운 · 올해의 운 · 띠별 한마디를 한 번에', en: 'Weekly trend · this month · this year · zodiac notes — all at once', ja: '週の推移・今月・今年・干支の一言をまとめて' })}
              </p>
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
      </main>
    </div>
  )
}
