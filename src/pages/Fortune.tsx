import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar, Card, ProgressBar } from '../components/ui'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sajuOf, fortuneOf } from '../lib/saju'

export default function Fortune() {
  const t = useT()
  const l = useL()
  const birthDate = useStore((s) => s.birthDate)
  const setBirthDate = useStore((s) => s.setBirthDate)
  const [draft, setDraft] = useState(birthDate)
  const [editing, setEditing] = useState(!birthDate)

  const data = useMemo(() => {
    if (!birthDate) return null
    const [y, m, d] = birthDate.split('-').map(Number)
    if (!y || !m || !d) return null
    const now = new Date()
    return {
      saju: sajuOf(y, m, d),
      fortune: fortuneOf({ y, m, d }, { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }),
    }
  }, [birthDate])

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
              className="mt-2 w-full rounded-2xl border-2 border-[#E3EAE5] bg-white px-4 py-3.5 text-[16px] font-extrabold outline-none focus:border-mind-400"
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

  const { saju, fortune } = data
  const tpl = fortune.template
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
          className="mt-3 rounded-3xl p-6 text-center text-white shadow-pop"
          style={{ background: `linear-gradient(135deg, ${fortune.grad[0]}, ${fortune.grad[1]})` }}
        >
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
            <div key={x.label} className="rounded-2xl bg-white p-3 text-center shadow-card">
              <div className="text-[22px] leading-none">{x.emoji}</div>
              <p className="mt-1.5 text-[11px] font-bold text-ink-faint">{x.label}</p>
              <p className="mt-0.5 text-[15px] font-extrabold">{x.val}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 px-2 text-center text-[11.5px] font-medium leading-relaxed text-ink-faint">{t('fortune.disclaimer')}</p>
        <button onClick={() => { setDraft(birthDate); setEditing(true) }} className="mt-1 w-full py-2 text-[13px] font-extrabold text-ink-faint">
          🔁 {t('fortune.changeBirth')}
        </button>
      </main>
    </div>
  )
}
