import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { L } from '../data/types'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Footer from '../components/Footer'
import ScrollChips from '../components/ScrollChips'
import IconBadge from '../components/IconBadge'
import { SkeletonBlock } from '../components/Skeleton'
import { PointsPill, Card } from '../components/ui'
import { TESTS } from '../data/tests'
import { SHOP_ITEMS } from '../data/seed'
import { lifetimeOf, nextTierOf, tierOf } from '../data/rank'
import { LEAGUE_TIERS, botsFor, myRank, myWeekPoints, weekKeyOf } from '../lib/league'
import { useStore, isPremium, PREMIUM_KRW } from '../store/useStore'
import { useT } from '../i18n/useT'
import { useL } from '../i18n/useT'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { TERMS, TEST_SHORT_KEY } from '../data/terms'
import { unreadMailCount } from '../lib/mailbox'

import { localDay, localDayOf } from '../lib/date'

const todayStr = () => localDay()

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

  // 오늘의 운세 프리뷰 — saju 모듈(별도 청크 gzip 32KB)은 지연 로드(메인 번들 오염 방지 표준 패턴)
  const [fx, setFx] = useState<{ overall: number; luckyColorKo: string; luckyNumber: number; zodiacEmoji: string } | null>(null)
  const [zlines, setZlines] = useState<{ emoji: string; zo: string; line: L }[]>([])
  const [zPick, setZPick] = useState<number | null>(null)
  useEffect(() => {
    let alive = true
    import('../lib/saju').then((m) => {
      if (!alive) return
      const now = new Date()
      const td = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }
      if (s.birthDate) {
        const [y, mo, d] = s.birthDate.split('-').map(Number)
        if (y && mo && d) {
          const f = m.fortuneOf({ y, m: mo, d }, td)
          const sj = m.sajuOf(y, mo, d)
          setFx({ overall: f.overall, luckyColorKo: f.luckyColorKo, luckyNumber: f.luckyNumber, zodiacEmoji: sj.zodiacEmoji })
          return
        }
      }
      // 생년월일 없음 → 띠 12지 맛보기(입력 장벽 제거: zodiacTodayLines는 생일이 필요 없음)
      setZlines(m.zodiacTodayLines(td).map((z) => ({ emoji: z.zodiacEmoji, zo: z.zodiacKo, line: z.line })))
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.birthDate])

  // 출석 직후 운세 넛지 — 이미 하는 행동(출석)에 얹는 재방문 습관 고리
  const [fortuneNudge, setFortuneNudge] = useState(false)
  const fortuneSeenToday = s.fortuneSeenDate === todayStr()
  const onCheckIn = () => {
    if (s.checkIn()) {
      fire('coin')
      if (!fortuneSeenToday) setFortuneNudge(true)
    }
  }

  // 오늘의 퀘스트 (출석 + 데일리퀴즈 + 검사 1개 + 운세 확인 → +50P)
  const quizDoneToday = s.lastQuizDate === todayStr()
  const testedToday = s.results.some((r) => localDayOf(r.at) === todayStr())
  const questClaimed = s.questClaimedDate === todayStr()
  const quests = [
    { key: 'checkin', emoji: '📅', label: l({ ko: '출석 체크', en: 'Check in', ja: '出席チェック' }), done: checkedToday, go: onCheckIn },
    { key: 'quiz', emoji: '🧠', label: l({ ko: '데일리 퀴즈 풀기', en: 'Daily quiz', ja: 'デイリークイズ' }), done: quizDoneToday, go: () => nav('/rewards') },
    { key: 'test', emoji: '🔬', label: l({ ko: '심리검사 1개 완료', en: 'Finish 1 test', ja: '検査を1つ' }), done: testedToday, go: () => document.getElementById('deep-tests')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
    { key: 'fortune', emoji: '🔮', label: l({ ko: '오늘의 운세 확인', en: "Check today's fortune", ja: '今日の運勢を見る' }), done: fortuneSeenToday, go: () => nav('/fortune') },
  ]
  const questDone = quests.filter((q) => q.done).length
  const onClaimQuest = () => {
    if (s.claimDailyQuest() > 0) fire('coin')
  }
  const premium = isPremium(s.premiumUntil)
  const premiumDaysLeft = premium ? Math.max(0, Math.ceil((s.premiumUntil - Date.now()) / 86400000)) : 0

  // 퀵테스트 칩 — 문항·결과 데이터(60KB)는 지연 로드(메인 번들 오염 방지). 칩엔 메타 4필드만 필요
  const [quickChips, setQuickChips] = useState<{ id: string; emoji: string; title: L; grad0: string }[]>([])
  useEffect(() => {
    import('../data/quick').then((m) =>
      setQuickChips(m.QUICK_TESTS.map((q) => ({ id: q.id, emoji: q.emoji, title: q.title, grad0: q.grad[0] }))),
    )
  }, [])

  // 매거진 최신 글 롤링 — 본문 데이터는 지연 로드(메인 번들에 매거진 전문 미포함)
  const [magHeads, setMagHeads] = useState<{ id: string; emoji: string; title: L }[]>([])
  const [magIdx, setMagIdx] = useState(0)
  useEffect(() => {
    import('../data/magazine').then((m) =>
      setMagHeads(m.ARTICLES.slice(-4).reverse().map((a) => ({ id: a.id, emoji: a.emoji, title: a.title }))),
    )
  }, [])
  useEffect(() => {
    if (magHeads.length < 2) return
    const iv = setInterval(() => setMagIdx((i) => (i + 1) % magHeads.length), 3600)
    return () => clearInterval(iv)
  }, [magHeads.length])
  const magHead = magHeads[magIdx]
  const trioDone = (['selfesteem', 'perfect', 'efficacy'] as const).every((id) => s.results.some((r) => r.testId === id))

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

        {/* ── 1분 바이럴 퀵 테스트 — 첫 화면 핵심 가치(신규 방문자 즉시 체험) ── */}
        <div className="mt-5">
          <button onClick={() => nav('/quick')} className="flex w-full items-center justify-between px-1">
            <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold tracking-tight">
              <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>🔥</motion.span>
              {t('quick.banner')}
            </h2>
            <span className="text-[12.5px] font-extrabold text-mind-600">{t('community.all')} ›</span>
          </button>
          {quickChips.length ? (
            <ScrollChips
              items={quickChips.map((q, i) => ({
                id: q.id,
                emoji: q.emoji,
                label: l(q.title),
                color: q.grad0,
                onClick: () => nav(`/quick/${q.id}`),
                badge: i === 0 ? ('HOT' as const) : i >= quickChips.length - 2 ? ('NEW' as const) : undefined,
              }))}
            />
          ) : (
            /* 데이터 로드 전 스켈레톤 칩 — 레이아웃 시프트 방지(실제 칩과 동일 규격) */
            <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-hidden px-5 pb-4 pt-1">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-[84px] w-[86px] shrink-0 !rounded-3xl" />
              ))}
            </div>
          )}
        </div>

        {/* 출석 직후 운세 넛지 — 출석이라는 기존 습관에 운세 확인을 얹음 */}
        <AnimatePresence>
          {fortuneNudge && !fortuneSeenToday && (
            <motion.button
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={() => nav('/fortune')}
              className="mt-3 flex w-full items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#6B4FB8] to-[#A88BF2] px-4 py-3 text-left shadow-card"
            >
              <span className="shrink-0 text-[22px]">🔮</span>
              <span className="min-w-0 flex-1 break-keep text-[13.5px] font-extrabold leading-snug text-white">
                {l({ ko: '출석 완료! 오늘의 운세도 확인해보세요', en: "Checked in! See today's fortune too", ja: '出席完了！今日の運勢もチェック' })}
              </span>
              <span className="shrink-0 text-[15px] text-white/80">›</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── 오늘의 퀘스트 ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, type: 'spring', stiffness: 220, damping: 22 }}>
          <Card className="mt-3.5 !p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-[15px] font-extrabold">🎯 {l({ ko: '오늘의 퀘스트', en: 'Daily quest', ja: '今日のクエスト' })}</h3>
              <span className="text-[12.5px] font-extrabold text-mind-600">{questDone}/{quests.length}</span>
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

        {/* ── 오늘의 운세 히어로 — 결과 프리뷰(생일 없으면 띠 맛보기)로 존재감 강화 ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 22 }}
        >
          <Card onClick={() => nav('/fortune')} className="mt-3.5 overflow-hidden !bg-gradient-to-br from-[#6B4FB8] to-[#A88BF2] !p-4">
            <div className="flex items-center gap-2.5">
              <IconBadge emoji="🔮" tone="frost" size={40} radius={13} wiggle />
              <div className="min-w-0 flex-1">
                <h3 className="break-keep text-[15.5px] font-extrabold leading-tight text-white">{t('fortune.title')}</h3>
                <p className="mt-0.5 break-keep text-[11.5px] font-bold text-white/80">{t('fortune.homeSub')}</p>
              </div>
              <span className="shrink-0 text-[15px] text-white/70">›</span>
            </div>

            {fx ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-extrabold text-white">
                  {fx.zodiacEmoji} {l({ ko: `총운 ${fx.overall}점`, en: `Overall ${fx.overall}`, ja: `総運 ${fx.overall}点` })}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-1.5 text-[12px] font-extrabold text-white/90">🎨 {fx.luckyColorKo}</span>
                <span className="rounded-full bg-white/15 px-2.5 py-1.5 text-[12px] font-extrabold text-white/90">🔢 {fx.luckyNumber}</span>
              </div>
            ) : zlines.length > 0 ? (
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <p className="text-[12px] font-extrabold text-white/85">
                  {l({ ko: '내 띠 누르고 3초 맛보기', en: 'Tap your zodiac for a 3s taste', ja: '干支をタップして3秒お試し' })}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {zlines.map((z, i2) => (
                    <button
                      key={z.zo}
                      onClick={() => setZPick(i2)}
                      aria-label={z.zo}
                      className={`rounded-full px-2 py-1 text-[16px] leading-none transition-colors ${zPick === i2 ? 'bg-white/90' : 'bg-white/15'}`}
                    >
                      {z.emoji}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {zPick !== null && zlines[zPick] && (
                    <motion.div
                      key={zPick}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 rounded-xl bg-white/15 px-3 py-2.5"
                    >
                      <p className="break-keep text-[12.5px] font-bold leading-relaxed text-white">
                        {zlines[zPick].emoji} {l(zlines[zPick].line)}
                      </p>
                      <button
                        onClick={() => nav('/fortune')}
                        className="mt-1.5 text-[12px] font-extrabold text-white underline underline-offset-2"
                      >
                        {l({ ko: '내 사주로 정확히 보기 →', en: 'See my exact fortune →', ja: '私の四柱で正確に見る →' })}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <SkeletonBlock className="h-8 w-28 rounded-full" />
                <SkeletonBlock className="h-8 w-20 rounded-full" />
              </div>
            )}
          </Card>

          {/* 생일 궁합 — 슬림 배너 */}
          <Card onClick={() => nav('/compat')} className="mt-2.5 flex items-center gap-2.5 overflow-hidden !bg-gradient-to-br from-[#F25C8E] to-[#FF9EC0] !p-3.5">
            <IconBadge emoji="💞" tone="frost" size={36} radius={12} wiggle />
            <h3 className="min-w-0 flex-1 break-keep text-[14px] font-extrabold leading-tight text-white">{t('compat.title')}</h3>
            <span className="shrink-0 text-[15px] text-white/70">›</span>
          </Card>
        </motion.div>

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
        {/* 카테고리 허브 — 기질·마음 / 나를 알기 / 관계 속 나 (인지=아래 정밀검사 섹션) */}
        {(
          [
            { key: 'temper', emoji: '🧘', label: { ko: '기질 · 마음 컨디션', en: 'Mind & temperament', ja: '気質・心のコンディション' }, ids: ['adhd', 'burnout', 'dopamine', 'resilience', 'socialanx'], newIds: ['socialanx'] },
            { key: 'self', emoji: '🪞', label: { ko: '나를 알기', en: 'Know yourself', ja: '自分を知る' }, ids: ['selfesteem', 'perfect', 'efficacy'], newIds: ['efficacy'] },
            { key: 'relation', emoji: '💞', label: { ko: '관계 속 나', en: 'Me in relationships', ja: '関係の中の私' }, ids: ['love', 'ego', 'dark'], newIds: [] },
          ] as const
        ).map((cat) => (
          <div key={cat.key}>
            <p className="mt-3 flex items-center gap-1 px-1 text-[13px] font-extrabold text-ink-sub">
              <span aria-hidden="true">{cat.emoji}</span>
              {l(cat.label)}
            </p>
            <ScrollChips
              items={cat.ids
                .map((id) => TESTS.find((tm) => tm.id === id))
                .filter((tm): tm is NonNullable<typeof tm> => !!tm)
                .map((tm) => ({
                  id: tm.id,
                  emoji: tm.emoji,
                  label: t(TEST_SHORT_KEY(tm.id)),
                  color: tm.gradFrom,
                  onClick: () => nav(`/test/${tm.id}`),
                  badge: (cat.newIds as readonly string[]).includes(tm.id) ? ('NEW' as const) : undefined,
                }))}
            />
          </div>
        ))}

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
            <IconBadge emoji="🧩" tone="frost" size={40} radius={13} wiggle />
            <div className="min-w-0 flex-1">
              <h3 className="text-[14.5px] font-extrabold leading-tight text-white">{l({ ko: '종합 인지 프로필 보기', en: 'View cognitive profile', ja: '総合認知プロフィール' })}</h3>
              <p className="mt-0.5 truncate text-[11.5px] font-bold text-white/85">{l({ ko: 'IQ·기억·집중·처리속도·공간 레이더', en: 'IQ·memory·focus·speed·spatial radar', ja: 'IQ·記憶·集中·速度·空間レーダー' })}</p>
            </div>
            <span className="text-white/80">›</span>
          </Card>
        </motion.div>

        {/* ── 통합 자기 리포트 (자기 3부작 완료 시) — 검사 섹션 뒤 완료자 대상 ── */}
        {trioDone && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, type: 'spring', stiffness: 220, damping: 22 }} className="mt-4">
            <button
              onClick={() => nav('/self-report')}
              className="flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-pop"
              style={{ background: 'linear-gradient(135deg,#5B6CF0,#9AA6FF)' }}
            >
              <IconBadge emoji="🪞" tone="frost" size={44} radius={14} wiggle />
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-extrabold tracking-tight text-white">
                  ✨ {l({ ko: '통합 자기 리포트 완성!', en: 'Self report ready!', ja: '統合セルフレポート完成！' })}
                </h3>
                <p className="mt-0.5 truncate text-[12px] font-bold text-white/85">
                  {l({ ko: '자존감·완벽주의·효능감 종합 분석', en: 'Your combined self-profile', ja: '自尊心・完璧主義・効力感の統合分析' })}
                </p>
              </div>
              <span className="text-xl text-white/80">›</span>
            </button>
          </motion.div>
        )}

        {/* ── 프리미엄 구독 CTA — 수익화 존(검사 가치 체험 뒤) ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, type: 'spring', stiffness: 220, damping: 22 }} className="mt-4">
          <button
            onClick={() => nav('/premium')}
            className="flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-pop"
            style={{ background: premium ? 'linear-gradient(135deg,#F2B01E,#FF7E5F)' : 'linear-gradient(135deg,#6E7BF2,#A88BF2)' }}
          >
            <IconBadge emoji="✨" tone="frost" size={44} radius={14} wiggle />
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-extrabold tracking-tight text-white">
                {premium
                  ? l({ ko: '프리미엄 이용 중', en: 'Premium active', ja: 'プレミアム利用中' })
                  : l({ ko: '프리미엄 · 광고 제거 + 무제한', en: 'Premium · no ads + unlimited', ja: 'プレミアム・広告除去+無制限' })}
              </h3>
              <p className="mt-0.5 truncate text-[12px] font-bold text-white/85">
                {premium
                  ? l({ ko: `남은 기간 D-${premiumDaysLeft}`, en: `D-${premiumDaysLeft} left`, ja: `残りD-${premiumDaysLeft}` })
                  : l({
                      ko: `운세·정밀검사 무제한 · 월 ₩${PREMIUM_KRW.toLocaleString()}`,
                      en: `Unlimited fortune & tests · ₩${PREMIUM_KRW.toLocaleString()}/mo`,
                      ja: `運勢・検査無制限・月₩${PREMIUM_KRW.toLocaleString()}`,
                    })}
              </p>
            </div>
            <span className="text-xl text-white/80">›</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 220, damping: 22 }}
          className="mt-4"
        >
          <Card onClick={() => nav('/rewards')} className="flex items-center gap-3.5 !p-4">
            <IconBadge emoji="🪙" color="#F2B01E" size={46} radius={15} wiggle />
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
            <IconBadge emoji="🎁" tone="frost" size={46} radius={15} wiggle />
            <div className="min-w-0 flex-1">
              <h3 className="text-[15.5px] font-extrabold tracking-tight text-white">{l({ ko: '친구 초대하고 +100P', en: 'Invite a friend, +100P', ja: '友達招待で+100P' })}</h3>
              <p className="mt-0.5 truncate text-[12.5px] font-bold text-white/85">{l({ ko: '친구도 나도 +100P · 많이 부를수록 보너스 ↑', en: 'You both get +100P · more invites, bigger bonus', ja: '二人とも+100P・招待ほどボーナス↑' })}</p>
            </div>
            <span className="text-xl text-white/80">›</span>
          </button>
        </motion.div>

        {/* 심리 매거진 — 최신 글 제목 롤링(누르면 해당 글로) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 22 }} className="mt-4">
          <Card onClick={() => nav(magHead ? `/magazine/${magHead.id}` : '/magazine')} className="flex items-center gap-3.5 !p-4">
            <IconBadge emoji="📖" color="#8B95F6" size={46} radius={15} wiggle />
            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-extrabold tracking-tight">{t('mag.title')}</h3>
              {magHead ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={magHead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="mt-0.5 flex items-center gap-1 truncate text-[13px] font-bold text-ink-faint"
                  >
                    {magIdx === 0 && (
                      <span className="shrink-0 rounded-full bg-[#3B9EFF] px-1.5 py-px text-[8.5px] font-extrabold leading-[1.4] tracking-wide text-white">NEW</span>
                    )}
                    <span className="truncate">{magHead.emoji} {l(magHead.title)}</span>
                  </motion.p>
                </AnimatePresence>
              ) : (
                <p className="mt-0.5 truncate text-[13px] font-bold text-ink-faint">{t('mag.banner')}</p>
              )}
            </div>
            <span className="text-xl text-ink-faint">›</span>
          </Card>
        </motion.div>

        <p className="mt-6 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">
          {t('home.disclaimer')}
        </p>

        <Footer />
      </main>
    </div>
  )
}
