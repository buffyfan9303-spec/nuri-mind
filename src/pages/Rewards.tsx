import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
import { DailyCapMeter, DailyQuiz, DailySpin } from '../components/Daily'
import Invite from '../components/Invite'
import { Card, Chip, Modal, Section, TopBar } from '../components/ui'
import { OFFERS } from '../data/seed'
import { lifetimeOf, nextTierOf, tierOf } from '../data/rank'
import { LEAGUE_TIERS, botsFor, myRank, myWeekPoints, weekKeyOf } from '../lib/league'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

export default function Rewards() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const points = useStore((s) => s.points)
  const streak = useStore((s) => s.streak)
  const lastCheckIn = useStore((s) => s.lastCheckIn)
  const surveys = useStore((s) => s.surveys)
  const taken = useStore((s) => s.takenSurveys)
  const ledger = useStore((s) => s.ledger)
  const checkIn = useStore((s) => s.checkIn)
  const streakFreezes = useStore((s) => s.streakFreezes)
  const lang = useStore((s) => s.lang)
  const leagueWeek = useStore((s) => s.leagueWeek)
  const leagueTier = useStore((s) => s.leagueTier)
  const leagueSeed = useStore((s) => s.leagueSeed)
  const ensureLeague = useStore((s) => s.ensureLeague)
  const [streakInfo, setStreakInfo] = useState(false)

  useEffect(() => {
    ensureLeague()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkedToday = lastCheckIn === new Date().toISOString().slice(0, 10)
  const open = surveys.filter((s) => s.status === 'approved' && !s.mine)
  const mine = surveys.filter((s) => s.mine)
  const lifetime = lifetimeOf(ledger)
  const tier = tierOf(lifetime)
  const next = nextTierOf(lifetime)

  const lgTier = LEAGUE_TIERS[Math.min(leagueTier, LEAGUE_TIERS.length - 1)]
  const myWeek = myWeekPoints(ledger)
  const lgRank = useMemo(
    () => myRank(myWeek, botsFor(leagueWeek || weekKeyOf(), leagueSeed, leagueTier, lang)),
    [myWeek, leagueWeek, leagueSeed, leagueTier, lang],
  )

  const onCheckIn = () => {
    if (checkIn()) {
      sfx.coin()
      burst()
    }
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar title={t('rewards.title')} />
      <main className="mx-auto max-w-md px-5">
        {/* 잔액 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="rounded-3xl bg-gradient-to-br from-mind-500 to-sky2-500 p-6 shadow-pop"
        >
          <p className="text-[13.5px] font-extrabold tracking-wide text-white/80">{t('rewards.balance')}</p>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-white">💎 {points.toLocaleString()}</span>
            <span className="pb-1 text-sm font-extrabold text-white/80">P</span>
          </div>
          {/* 랭크 등급 진입점 */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => nav('/rank')}
            className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white/20 px-4 py-3.5 text-left"
          >
            <span className="flex items-center gap-2 text-[15px] font-extrabold text-white">
              {tier.emoji} {t('rank.row')}: {l(tier.name)}
            </span>
            <span className="text-[13px] font-bold text-white/85">
              {next ? t('rank.next', { tier: next.emoji, p: (next.min - lifetime).toLocaleString() }) : t('rank.max')} ›
            </span>
          </motion.button>

          <div className="mt-3">
            {checkedToday ? (
              <div className="flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3.5 text-[15px] font-extrabold text-white">
                <span>✅ {t('rewards.checkinDone')}</span>
                <span>
                  {streak > 0 && <>🔥 {t('rewards.streak', { n: streak })}</>}
                  {streakFreezes > 0 && <span className="ml-2">❄️×{streakFreezes}</span>}
                </span>
              </div>
            ) : (
              <Button color="white" onClick={onCheckIn}>
                📅 {t('rewards.checkin')}
              </Button>
            )}
          </div>

          {/* 스트릭 설명 진입 */}
          <button
            onClick={() => setStreakInfo(true)}
            className="mt-2 flex w-full items-center justify-center gap-1 text-[12.5px] font-bold text-white/80"
          >
            ⓘ {t('streak.title')}
          </button>

          <DailyCapMeter />
        </motion.div>

        {/* 주간 리그 진입 */}
        <Card onClick={() => nav('/league')} className="mt-3.5 flex items-center gap-3.5 !p-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: `${lgTier.color}22` }}
          >
            {lgTier.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-extrabold tracking-tight">
              🏆 {t('league.title')} · {l(lgTier.name)}
            </h3>
            <p className="mt-0.5 text-[13.5px] font-bold text-ink-faint">
              {t('league.entrySub', { rank: lgRank, p: myWeek.toLocaleString() })}
            </p>
          </div>
          <span className="text-xl text-ink-faint">›</span>
        </Card>

        {/* 데일리 존 */}
        <div className="mt-3.5 space-y-3.5">
          <DailySpin />
          <DailyQuiz />
        </div>

        {/* 광고 — 상단권 노출 (가시성 개선) */}
        <div className="mt-4">
          <AdSlot variant="banner" />
        </div>

        {/* 참여 가능한 설문 */}
        <Section
          title={`📋 ${t('rewards.surveys')}`}
          action={
            <Button color="mind" size="sm" full={false} onClick={() => nav('/rewards/create')}>
              + {t('rewards.create')}
            </Button>
          }
        >
          <div className="space-y-3">
            {open.length === 0 && (
              <Card className="py-8 text-center text-sm font-bold text-ink-faint">{t('rewards.noSurveys')}</Card>
            )}
            {open.map((sv) => {
              const done = taken.includes(sv.id)
              return (
                <Card key={sv.id} className="flex items-center gap-3.5 !p-4" onClick={done ? undefined : () => nav(`/rewards/survey/${sv.id}`)}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mind-50 text-2xl">
                    {sv.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[16px] font-extrabold tracking-tight">{sv.title}</h3>
                    <p className="mt-1 text-[13.5px] font-bold text-ink-faint">
                      {sv.questions.length}
                      {t('common.q')} · {t('rewards.respondents', { n: sv.responses })}
                    </p>
                  </div>
                  {done ? (
                    <Chip tone="gray">✓ {t('rewards.taken')}</Chip>
                  ) : (
                    <span className="shrink-0 rounded-full bg-mind-100 px-3.5 py-2 text-[15px] font-extrabold text-mind-700">
                      +{sv.reward}P
                    </span>
                  )}
                </Card>
              )
            })}
          </div>
        </Section>

        {/* 내가 만든 설문 */}
        {mine.length > 0 && (
          <Section title={`🧾 ${t('rewards.mySurveys')}`}>
            <div className="space-y-3">
              {mine.map((sv) => (
                <Card key={sv.id} className="!p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sv.emoji}</span>
                    <h3 className="min-w-0 flex-1 truncate text-[15px] font-extrabold">{sv.title}</h3>
                    {sv.status === 'pending' && <Chip tone="amber">⏳ {t('rewards.status.pending')}</Chip>}
                    {sv.status === 'approved' && <Chip tone="mind">🟢 {t('rewards.status.approved')}</Chip>}
                    {sv.status === 'rejected' && <Chip tone="red">⛔ {t('rewards.status.rejected')}</Chip>}
                  </div>
                  <p className="mt-2 text-xs font-bold text-ink-faint">
                    +{sv.reward}P · {t('rewards.respondents', { n: sv.responses })} / {sv.target}
                  </p>
                  {sv.rejectReason && (
                    <p className="mt-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500">
                      {sv.rejectReason}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* 친구 초대 */}
        <div className="mt-6">
          <Invite />
        </div>

        {/* 앱 설치 미션 */}
        <Section title={`📲 ${t('rewards.offers')}`}>
          <div className="space-y-3">
            {OFFERS.map((of) => (
              <Card key={of.id} className="flex items-center gap-3.5 !p-4 opacity-75">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky2-100 text-2xl">
                  {of.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[16px] font-extrabold tracking-tight">{l(of.title)}</h3>
                  <p className="mt-1 truncate text-[13.5px] font-bold text-ink-faint">{l(of.desc)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[15px] font-extrabold text-sky2-600">+{of.reward}P</div>
                  <Chip tone="gray">{t('rewards.offerSoon')}</Chip>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* 포인트 내역 */}
        <Section title={`🧮 ${t('rewards.ledger')}`}>
          <Card className="!p-2">
            {ledger.length === 0 && (
              <p className="py-6 text-center text-sm font-bold text-ink-faint">{t('rewards.empty.ledger')}</p>
            )}
            {ledger.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-[#F1F5F2] px-3 py-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-bold">{e.memo}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-ink-faint">
                    {new Date(e.at).toLocaleDateString()} {new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`shrink-0 text-[15px] font-extrabold ${e.amount >= 0 ? 'text-mind-600' : 'text-red-400'}`}>
                  {e.amount >= 0 ? '+' : ''}
                  {e.amount.toLocaleString()}P
                </span>
              </div>
            ))}
          </Card>
        </Section>
      </main>

      {/* 스트릭(연속 출석) 설명 모달 */}
      <Modal open={streakInfo} onClose={() => setStreakInfo(false)}>
        <div className="text-center">
          <div className="text-5xl">🔥</div>
          <h3 className="mt-3 text-[19px] font-extrabold tracking-tight">{t('streak.title')}</h3>
          <p className="mt-3 whitespace-pre-line text-left text-[14.5px] font-medium leading-[1.85] text-ink-sub">
            {t('streak.body')}
          </p>
          <div className="mt-5">
            <Button color="mind" onClick={() => setStreakInfo(false)}>
              {t('streak.got')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
