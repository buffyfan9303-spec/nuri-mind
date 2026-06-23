import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AdSlot from '../components/AdSlot'
import Avatar from '../components/Avatar'
import ScrollChips from '../components/ScrollChips'
import { PointsPill, Card } from '../components/ui'
import { TESTS } from '../data/tests'
import { QUICK_TESTS } from '../data/quick'
import { SHOP_ITEMS } from '../data/seed'
import { lifetimeOf, nextTierOf, tierOf } from '../data/rank'
import { LEAGUE_TIERS, botsFor, myRank, myWeekPoints, weekKeyOf } from '../lib/league'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { useL } from '../i18n/useT'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { TERMS, TEST_SHORT_KEY } from '../data/terms'
import { unreadMailCount } from '../lib/mailbox'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function Home() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const s = useStore()
  const { fire } = useRewardAnimation()

  const [unreadMail, setUnreadMail] = useState(0)
  useEffect(() => {
    s.ensureLeague()
    unreadMailCount().then(setUnreadMail)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lifetime = lifetimeOf(s.ledger)
  const tier = tierOf(lifetime)
  const next = nextTierOf(lifetime)
  const tierProgress = next ? (lifetime - tier.min) / (next.min - tier.min) : 1

  const lgTier = LEAGUE_TIERS[Math.min(s.leagueTier, LEAGUE_TIERS.length - 1)]
  const myWeek = myWeekPoints(s.ledger)
  const lgRank = useMemo(
    () => myRank(myWeek, botsFor(s.leagueWeek || weekKeyOf(), s.leagueSeed, s.leagueTier, s.lang)),
    [myWeek, s.leagueWeek, s.leagueSeed, s.leagueTier, s.lang],
  )

  const todayFree = s.freeDate === todayStr() ? s.freeAmount : 0
  const redeemable = SHOP_ITEMS.filter((i) => s.points >= i.cost).length
  const checkedToday = s.lastCheckIn === todayStr()

  /* HOT 칸용: 지금 참여 가능한 최고 보상 설문 */
  const bestSurvey = s.surveys
    .filter((sv) => sv.status === 'approved' && !sv.mine && !s.takenSurveys.includes(sv.id))
    .sort((a, b) => b.reward - a.reward)[0]

  const onCheckIn = () => {
    if (s.checkIn()) fire('coin')
  }

  // 오늘의 퀘스트 (출석 + 데일리퀴즈 + 검사 1개 → +50P)
  const quizDoneToday = s.lastQuizDate === todayStr()
  const testedToday = s.results.some((r) => new Date(r.at).toISOString().slice(0, 10) === todayStr())
  const questClaimed = s.questClaimedDate === todayStr()
  const quests = [
    { key: 'checkin', emoji: '📅', label: l({ ko: '출석 체크', en: 'Check in', ja: '出席チェック' }), done: checkedToday, go: onCheckIn },
    { key: 'quiz', emoji: '🧠', label: l({ ko: '데일리 퀴즈 풀기', en: 'Daily quiz', ja: 'デイリークイズ' }), done: quizDoneToday, go: () => nav('/rewards') },
    { key: 'test', emoji: '🔬', label: l({ ko: '심리검사 1개 완료', en: 'Finish 1 test', ja: '検査を1つ' }), done: testedToday, go: () => document.getElementById('deep-tests')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
  ]
  const questDone = quests.filter((q) => q.done).length
  const onClaimQuest = () => {
    if (s.claimDailyQuest() > 0) fire('coin')
  }

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <header className="mx-auto flex max-w-md items-center justify-between gap-2 px-5 pt-5">
        <div className="flex shrink-0 items-center gap-2">
          <img src="/icon.svg" alt="" className="floaty h-8 w-8 rounded-xl" />
          <span className="whitespace-nowrap text-[16px] font-extrabold tracking-tight text-mind-800">{t('app.name')}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => nav('/mail')}
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-[16px] shadow-card"
            aria-label="mailbox"
          >
            📬
            {unreadMail > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                {unreadMail > 9 ? '9+' : unreadMail}
              </span>
            )}
          </motion.button>
          <PointsPill showStreak={false} />
        </div>
      </header>

      <main className="mx-auto max-w-md px-5">
        {/* ── 내 자산 대시보드 ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="mt-4 rounded-3xl bg-gradient-to-br from-mind-500 to-sky2-500 p-5 shadow-pop"
        >
          <div className="flex items-center justify-between">
            <button onClick={() => nav('/profile')} className="flex min-w-0 items-center gap-2">
              <Avatar avatar={s.avatar} size={38} emojiScale={0.55} className="ring-2 ring-white/40" />
              <p className="truncate text-[16px] font-extrabold text-white">
                {s.nickname}
                <span className="ml-0.5 text-[13px] font-bold text-white/80">님 👋</span>
              </p>
            </button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => nav('/rank')}
              className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-extrabold text-white"
            >
              {tier.emoji} {l(tier.name)} ›
            </motion.button>
          </div>

          <div className="mt-2.5 flex items-end justify-between">
            <div>
              <div className="flex items-end gap-1.5">
                <span className="text-[34px] font-extrabold leading-none tracking-tight text-white">
                  🪙 {s.points.toLocaleString()}
                </span>
                <span className="pb-1 text-[15px] font-extrabold text-white/80">P</span>
              </div>
              <p className="mt-1 text-[13px] font-bold text-white/85">
                {t('dash.cash', { w: s.points.toLocaleString() })} · {t('dash.redeem', { n: redeemable })}
              </p>
            </div>
            {!checkedToday && (
              <motion.button
                whileTap={{ y: 3, boxShadow: '0 0 0 #D8E0DA' }}
                onClick={onCheckIn}
                className="rounded-2xl bg-white px-4 py-2.5 text-[14px] font-extrabold text-[#2F6B52]"
                style={{ boxShadow: '0 3px 0 #D8E0DA' }}
              >
                📅 {t('dash.checkin')}
              </motion.button>
            )}
          </div>

          {/* 스탯 3종 */}
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-2xl bg-white/20 px-1 py-2.5">
              <p className="text-[16px] font-extrabold leading-none text-white">🔥 {s.streak}</p>
              <p className="mt-1 whitespace-nowrap text-[10.5px] font-bold text-white/80">{t('dash.streak')}</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => nav('/league')} className="flex flex-col items-center rounded-2xl bg-white/20 px-1 py-2.5">
              <p className="text-[16px] font-extrabold leading-none text-white">{lgTier.emoji} {lgRank}위</p>
              <p className="mt-1 whitespace-nowrap text-[10.5px] font-bold text-white/80">{t('dash.leagueShort')}</p>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => nav('/rewards')} className="flex flex-col items-center rounded-2xl bg-white/20 px-1 py-2.5">
              <p className="text-[16px] font-extrabold leading-none text-white">⚡ {todayFree}P</p>
              <p className="mt-1 whitespace-nowrap text-[10.5px] font-bold text-white/80">{t('dash.freeShort')}</p>
            </motion.button>
          </div>

          {/* 다음 등급 진행 */}
          <div className="mt-3">
            <div className="h-2.5 overflow-hidden rounded-full bg-white/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round(tierProgress * 100))}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.25 }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <p className="mt-1.5 text-[11.5px] font-extrabold text-white/85">
              {next
                ? t('rank.next', { tier: `${next.emoji} ${l(next.name)}`, p: (next.min - lifetime).toLocaleString() })
                : t('rank.max')}
            </p>
          </div>
        </motion.div>

        {/* ── 오늘의 퀘스트 ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, type: 'spring', stiffness: 220, damping: 22 }}>
          <Card className="mt-3.5 !p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-[15px] font-extrabold">🎯 {l({ ko: '오늘의 퀘스트', en: 'Daily quest', ja: '今日のクエスト' })}</h3>
              <span className="text-[12.5px] font-extrabold text-mind-600">{questDone}/3</span>
            </div>
            <div className="mt-3 space-y-2">
              {quests.map((q) => (
                <div key={q.key} className="flex items-center gap-2.5">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] ${q.done ? 'bg-mind-500 text-white' : 'bg-surface2'}`}>{q.done ? '✓' : q.emoji}</span>
                  <span className={`flex-1 break-keep text-[13.5px] font-bold ${q.done ? 'text-ink-faint line-through' : 'text-ink'}`}>{q.label}</span>
                  {!q.done && (
                    <button onClick={q.go} className="shrink-0 rounded-full bg-surface2 px-2.5 py-1 text-[11.5px] font-extrabold text-mind-700">{l({ ko: '하기', en: 'Go', ja: 'やる' })} ›</button>
                  )}
                </div>
              ))}
            </div>
            {questDone === 3 && !questClaimed && (
              <button onClick={onClaimQuest} className="mt-3 w-full rounded-2xl bg-mind-500 py-3 text-[14.5px] font-extrabold text-white shadow-[0_3px_0_#2F6B52] transition-transform active:translate-y-[3px]">
                🎁 {l({ ko: '보너스 +50P 받기', en: 'Claim +50P', ja: 'ボーナス+50P受取' })}
              </button>
            )}
            {questClaimed && (
              <p className="mt-3 rounded-2xl bg-mind-100 py-2 text-center text-[13px] font-extrabold text-mind-700">✅ {l({ ko: '오늘 퀘스트 완료! +50P', en: 'Quest done! +50P', ja: 'クエスト完了！+50P' })}</p>
            )}
          </Card>
        </motion.div>

        {/* ── 돈 버는 리워드 설문 (즉시 적립) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 220, damping: 22 }}
        >
          <Card
            onClick={() => nav(bestSurvey ? `/rewards/survey/${bestSurvey.id}` : '/rewards')}
            className="mt-3.5 flex items-center gap-3 !bg-gradient-to-r from-mind-600 to-mind-400 !p-4"
          >
            <motion.span animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="shrink-0 text-[26px]">
              💰
            </motion.span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15.5px] font-extrabold leading-tight text-white">{t('home.surveyBanner')}</h3>
              <p className="mt-0.5 truncate text-[12.5px] font-bold text-white/90">
                {bestSurvey ? t('home.surveyBadge') : t('home.surveyBannerEmpty')}
              </p>
            </div>
            {bestSurvey && (
              <span className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-[14.5px] font-extrabold text-mind-700">
                +{bestSurvey.reward}P
              </span>
            )}
          </Card>
        </motion.div>

        {/* ── 오늘의 운세 (신규: 사주·음양오행) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 22 }}
        >
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            <Card onClick={() => nav('/fortune')} className="flex items-center gap-2.5 overflow-hidden !bg-gradient-to-br from-[#6B4FB8] to-[#A88BF2] !p-3.5">
              <motion.span animate={{ rotate: [0, -11, 11, -7, 7, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', repeatDelay: 2 }} className="shrink-0 text-[24px] leading-none">🔮</motion.span>
              <h3 className="min-w-0 flex-1 break-keep text-[14px] font-extrabold leading-tight text-white">{t('fortune.homeTitle')}</h3>
              <span className="shrink-0 text-[15px] text-white/70">›</span>
            </Card>
            <Card onClick={() => nav('/compat')} className="flex items-center gap-2.5 overflow-hidden !bg-gradient-to-br from-[#F25C8E] to-[#FF9EC0] !p-3.5">
              <motion.span animate={{ rotate: [0, 11, -11, 7, -7, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', repeatDelay: 2.2 }} className="shrink-0 text-[24px] leading-none">💞</motion.span>
              <h3 className="min-w-0 flex-1 break-keep text-[14px] font-extrabold leading-tight text-white">{t('compat.title')}</h3>
              <span className="shrink-0 text-[15px] text-white/70">›</span>
            </Card>
          </div>
        </motion.div>

        {/* ── 1분 바이럴 퀵 테스트 (메인 전면 노출) ── */}
        <div className="mt-6">
          <button onClick={() => nav('/quick')} className="flex w-full items-center justify-between px-1">
            <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold tracking-tight">
              <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>🔥</motion.span>
              {t('quick.banner')}
            </h2>
            <span className="text-[12.5px] font-extrabold text-mind-600">{t('community.all')} ›</span>
          </button>
          <ScrollChips
            items={QUICK_TESTS.map((q, i) => ({
              id: q.id,
              emoji: q.emoji,
              label: l(q.title),
              color: q.grad[0],
              onClick: () => nav(`/quick/${q.id}`),
              badge: i === 0 ? ('HOT' as const) : i >= QUICK_TESTS.length - 2 ? ('NEW' as const) : undefined,
            }))}
          />
        </div>

        {/* ── 심층 심리검사 (듀오링고식 젤리 칩 가로 스크롤) — 정밀검사보다 위 ── */}
        <div id="deep-tests" className="mt-6 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold tracking-tight">
            <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}>🧠</motion.span>
            {t('home.testsHeader')}
          </h2>
          <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700">
            {TESTS.filter((tm) => !tm.precision).length}
            {l(TERMS.unitTests)}
          </span>
        </div>
        <ScrollChips
          items={TESTS.filter((tm) => !tm.precision).map((tm) => ({
            id: tm.id,
            emoji: tm.emoji,
            label: t(TEST_SHORT_KEY(tm.id)),
            color: tm.gradFrom,
            onClick: () => nav(`/test/${tm.id}`),
          }))}
        />

        {/* ── 정밀검사 (실측 인지과제) — 1분 테스트식 헤더(앞 아이콘+뒤 배지) + 젤리 칩 ── */}
        <div className="mt-6 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold tracking-tight">
            <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>🔬</motion.span>
            {l(TERMS.sectionPrecision)}
          </h2>
          <span className="rounded-full bg-iq-light px-2 py-0.5 text-[11px] font-extrabold text-iq-deep">{l(TERMS.badgeMeasured)}</span>
        </div>
        <ScrollChips
          items={TESTS.filter((tm) => tm.precision).map((tm, i, arr) => ({
            id: tm.id,
            emoji: tm.emoji,
            label: t(TEST_SHORT_KEY(tm.id)),
            color: tm.gradFrom,
            onClick: () => nav(`/test/${tm.id}`),
            badge: i >= arr.length - 2 ? ('NEW' as const) : undefined,
          }))}
        />

        {/* 종합 인지 프로필 (정밀검사 레이더) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 24 }}>
          <Card onClick={() => nav('/cog')} className="mt-2.5 flex items-center gap-3 !bg-gradient-to-r from-[#5B6CF0] to-[#3B82F6] !p-3.5">
            <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2.6, repeatDelay: 2 }} className="text-[24px]">🧩</motion.span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[14.5px] font-extrabold leading-tight text-white">{l({ ko: '종합 인지 프로필 보기', en: 'View cognitive profile', ja: '総合認知プロフィール' })}</h3>
              <p className="mt-0.5 truncate text-[11.5px] font-bold text-white/85">{l({ ko: 'IQ·기억·집중·처리속도·공간 레이더', en: 'IQ·memory·focus·speed·spatial radar', ja: 'IQ·記憶·集中·速度·空間レーダー' })}</p>
            </div>
            <span className="text-white/80">›</span>
          </Card>
        </motion.div>

        {/* 광고 — 검사 그리드 직하단 */}
        <div className="mt-5">
          <AdSlot variant="banner" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 220, damping: 22 }}
          className="mt-4"
        >
          <Card onClick={() => nav('/rewards')} className="flex items-center gap-3.5 !p-4">
            <motion.span animate={{ rotate: [0, -9, 9, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 2.4 }} className="text-[28px]">🪙</motion.span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-extrabold tracking-tight">{t('home.rewardsBanner')}</h3>
              <p className="mt-0.5 text-[13px] font-bold text-ink-faint">{t('home.rewardsBannerSub')}</p>
            </div>
            <span className="text-xl text-ink-faint">›</span>
          </Card>
        </motion.div>

        {/* 친구 초대 CTA — 바이럴 후크 (둘 다 +100P) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, type: 'spring', stiffness: 220, damping: 22 }} className="mt-4">
          <button
            onClick={() => nav('/rewards')}
            className="flex w-full items-center gap-3.5 rounded-3xl p-4 text-left shadow-pop"
            style={{ background: 'linear-gradient(135deg,#4FA882,#6E9FDC)' }}
          >
            <motion.span animate={{ rotate: [0, 10, -10, 6, -6, 0] }} transition={{ repeat: Infinity, duration: 2.3, ease: 'easeInOut', repeatDelay: 2 }} className="text-[28px]">🎁</motion.span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15.5px] font-extrabold tracking-tight text-white">{l({ ko: '친구 초대하고 +100P', en: 'Invite a friend, +100P', ja: '友達招待で+100P' })}</h3>
              <p className="mt-0.5 truncate text-[12.5px] font-bold text-white/85">{l({ ko: '친구도 나도 +100P · 많이 부를수록 보너스 ↑', en: 'You both get +100P · more invites, bigger bonus', ja: '二人とも+100P・招待ほどボーナス↑' })}</p>
            </div>
            <span className="text-xl text-white/80">›</span>
          </button>
        </motion.div>

        {/* 심리 매거진 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 22 }} className="mt-4">
          <Card onClick={() => nav('/magazine')} className="flex items-center gap-3.5 !p-4">
            <span className="text-[28px]">📖</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-extrabold tracking-tight">{t('mag.title')}</h3>
              <p className="mt-0.5 truncate text-[13px] font-bold text-ink-faint">{t('mag.banner')}</p>
            </div>
            <span className="text-xl text-ink-faint">›</span>
          </Card>
        </motion.div>

        <p className="mt-6 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">
          {t('home.disclaimer')}
        </p>

        {/* 정사각형 광고 — 페이지 맨 아래 */}
        <div className="mt-5">
          <AdSlot variant="rect" />
        </div>
      </main>
    </div>
  )
}
