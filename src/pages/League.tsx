import { useEffect, useMemo, useState } from 'react'
import { SPRING } from '../lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import Celebration from '../components/Celebration'
import { Card, Chip, TopBar } from '../components/ui'
import { LEAGUE_TIERS, botsFor, myRank, myWeekPoints, nextResetMs, weekKeyOf } from '../lib/league'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { useRewardAnimation } from '../hooks/useRewardAnimation'

export default function League() {
  const t = useT()
  const l = useL()
  const lang = useStore((s) => s.lang)
  const nickname = useStore((s) => s.nickname)
  const ledger = useStore((s) => s.ledger)
  const leagueWeek = useStore((s) => s.leagueWeek)
  const leagueTier = useStore((s) => s.leagueTier)
  const leagueSeed = useStore((s) => s.leagueSeed)
  const leagueMsg = useStore((s) => s.leagueMsg)
  const ensureLeague = useStore((s) => s.ensureLeague)
  const clearLeagueMsg = useStore((s) => s.clearLeagueMsg)
  const { fire } = useRewardAnimation()
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    ensureLeague()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!leagueMsg) return
    if (leagueMsg === 'up') {
      fire('levelup') // 리그 승급 = 레벨업 연출
      setCelebrate(true) // + 풀스크린 축하 테이크오버
    }
    const tm = setTimeout(clearLeagueMsg, 4000)
    return () => clearTimeout(tm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueMsg])

  const wk = leagueWeek || weekKeyOf()
  const tier = LEAGUE_TIERS[Math.min(leagueTier, LEAGUE_TIERS.length - 1)]
  const my = myWeekPoints(ledger)
  const bots = useMemo(() => botsFor(wk, leagueSeed, leagueTier, lang), [wk, leagueSeed, leagueTier, lang])
  const rank = myRank(my, bots)

  const rows = useMemo(() => {
    const all = [
      ...bots.map((b) => ({ ...b, me: false })),
      { name: nickname, emoji: '🧠', points: my, me: true },
    ]
    return all.sort((a, b) => b.points - a.points || (a.me ? -1 : 1))
  }, [bots, my, nickname])

  const msLeft = nextResetMs() - Date.now()
  const dLeft = Math.floor(msLeft / 86400000)
  const hLeft = Math.floor((msLeft % 86400000) / 3600000)

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/rewards" title={t('league.title')} />

      {/* 승급 풀스크린 축하 */}
      <Celebration
        open={celebrate}
        emoji={tier.emoji}
        title={t('league.up')}
        subtitle={`${l(tier.name)} · ${l({ ko: '이번 주도 달려보자!', en: 'Keep it rolling this week!', ja: '今週も走ろう！' })}`}
        grad={[tier.color, `${tier.color}99`]}
        onClose={() => setCelebrate(false)}
      />

      {/* 승급/강등 배너 */}
      <AnimatePresence>
        {leagueMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mx-auto max-w-md px-5`}
          >
            <p
              className={`rounded-2xl px-4 py-3.5 text-center text-[15px] font-semibold ${
                leagueMsg === 'up' ? 'bg-mind-100 text-mind-700' : leagueMsg === 'down' ? 'bg-red-50 text-red-500' : 'bg-sky2-100 text-sky2-600'
              }`}
            >
              {t(`league.${leagueMsg}`)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-md px-5">
        {/* 티어 히어로 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={SPRING.ui}
          className="mt-2 rounded-3xl p-6 text-center shadow-pop"
          style={{ background: `linear-gradient(140deg, ${tier.color}, ${tier.color}99)` }}
        >
          <div className="flex items-center justify-center gap-3">
            {LEAGUE_TIERS.map((tr, i) => (
              <motion.span
                key={i}
                animate={i === leagueTier ? { scale: [1, 1.25, 1.12], y: [0, -4, 0] } : { scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className={`text-3xl ${i === leagueTier ? '' : 'opacity-40 grayscale'}`}
              >
                {tr.emoji}
              </motion.span>
            ))}
          </div>
          <h1 className="mt-2 text-[24px] font-extrabold tracking-tight text-white">{l(tier.name)}</h1>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-white/90">{t('league.sub')}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
              {t('league.myWeek')} 🪙 {my.toLocaleString()}P
            </span>
            <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white">
              ⏳ {t('league.reset', { d: dLeft, h: hLeft })}
            </span>
          </div>
        </motion.div>

        {/* 랭킹 리스트 */}
        <Card className="mt-4 !p-2.5">
          {rows.map((r, i) => {
            const inPromo = i < 3 && leagueTier < LEAGUE_TIERS.length - 1
            const inDemo = i >= rows.length - 3 && leagueTier > 0
            return (
              <div key={r.me ? 'me' : r.name}>
                {i === 0 && inPromo && (
                  <p className="px-3 pb-1.5 pt-1 text-[12px] font-semibold tracking-wide text-mind-600">
                    {t('league.promo')}
                  </p>
                )}
                {i === rows.length - 3 && inDemo && (
                  <p className="px-3 pb-1.5 pt-3 text-[12px] font-semibold tracking-wide text-red-400">
                    {t('league.demo')}
                  </p>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING.ui, delay: 0.04 * i }}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${
                    r.me ? 'bg-mind-50 dark:bg-surface2 ring-2 ring-mind-400' : inPromo ? 'bg-surface2' : inDemo ? 'bg-red-50/60 dark:bg-red-950/40' : ''
                  }`}
                >
                  <span
                    className={`w-7 text-center text-[16px] font-semibold ${
                      i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-ink-faint'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                    {r.name}
                    {r.me && <Chip tone="mind"> {t('league.me')}</Chip>}
                  </span>
                  <span className="text-[15px] font-semibold text-ink-sub">{r.points.toLocaleString()}P</span>
                </motion.div>
              </div>
            )
          })}
        </Card>

        <p className="mt-3 text-center text-[12px] font-medium leading-relaxed text-ink-faint">
          🏆 {t('league.sub')} · 현재 {rank}위
        </p>
      </main>
    </div>
  )
}
