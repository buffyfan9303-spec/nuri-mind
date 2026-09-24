import { useEffect, useMemo, useState } from 'react'
import { SPRING, press3d, tapPop } from '../lib/motion'
import { motion } from 'framer-motion'
import type { L } from '../data/types'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Footer from '../components/Footer'
import TopStrip from '../components/TopStrip'
import ScrollChips, { CHIP_W } from '../components/ScrollChips'
import IconBadge from '../components/IconBadge'
import { SkeletonBlock } from '../components/Skeleton'
import { PointsPill, Card } from '../components/ui'
import { TESTS } from '../data/tests'
import { DEEP_CATS } from '../data/testGroups'
import { lifetimeOf, nextTierOf, tierOf } from '../data/rank'
import { LEAGUE_TIERS, botsFor, myRank, myWeekPoints, weekKeyOf } from '../lib/league'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { useL } from '../i18n/useT'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { TERMS, TEST_SHORT_KEY } from '../data/terms'
import { unreadMailCount } from '../lib/mailbox'

import { localDay } from '../lib/date'

const todayStr = () => localDay()

/** 출석 버튼 — 흰 3D 버튼(아랫면 3px). 누르면 그 깊이만큼 내려앉고 떼면 살짝 튀어 올라온다 */
const CHECKIN_PRESS = press3d(3, '#D8E0DA')

/**
 * 대시보드 스탯 칸 — 높이를 고정(h-[50px])하고 내용 전체를 칸 정중앙에 둔다.
 * 아이콘과 숫자를 한 덩어리로 묶어야 '🔥 1'과 '🔥 1,234'가 같은 중심선에 선다(따로 두면 숫자 폭만큼 치우친다).
 */
function StatTile({ icon, value, label, onClick }: { icon: string; value: string; label: string; onClick?: () => void }) {
  const inner = (
    <>
      <span className="inline-flex max-w-full items-center justify-center gap-1 text-[16px] font-extrabold leading-none text-white">
        <span aria-hidden="true" className="shrink-0">{icon}</span>
        <span className="truncate tabular-nums">{value}</span>
      </span>
      <span className="mt-1.5 block max-w-full truncate text-center text-[11px] font-extrabold leading-none text-white/90">{label}</span>
    </>
  )
  const cls = 'flex h-[50px] min-w-0 flex-col items-center justify-center rounded-2xl bg-white/20 px-1.5 text-center'
  return onClick ? (
    <motion.button whileTap={tapPop} transition={SPRING.press} onClick={onClick} className={cls}>
      {inner}
    </motion.button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

/**
 * 섹션 머리 — 모든 검사 묶음이 같은 모양(제목 + 오른쪽 '전체 ›')을 쓴다.
 * 좌우 여백 0: 제목 첫 글자(이모지)가 아래 칩 격자·카드의 왼쪽 모서리와 같은 선에 선다
 * (예전 px-1은 제목만 4px 안으로 들어가 격자와 어긋났다). 높이 44px은 버튼 히트영역.
 */
function SectionHead({ emoji, title, onAll, allLabel }: { emoji: string; title: string; onAll: () => void; allLabel: string }) {
  return (
    <button onClick={onAll} className="-mb-1 mt-3 flex min-h-[44px] w-full items-center justify-between gap-3">
      <h2 className="flex min-w-0 items-center gap-2 text-[20px] font-extrabold leading-tight">
        <span aria-hidden="true" className="shrink-0 text-[20px]">{emoji}</span>
        <span className="truncate">{title}</span>
      </h2>
      <span className="shrink-0 text-[13px] font-extrabold leading-none text-mind-600">{allLabel} ›</span>
    </button>
  )
}

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
  const checkedToday = s.lastCheckIn === todayStr()

  /**
   * 오늘의 운세 칸 아이콘 — 저장된 운세 입력(fortuneProfile)의 띠. 입춘 기준 띠라 만세력 차트로 구한다.
   * saju·manse 모듈은 지연 로드(메인 번들 오염 방지 표준 패턴).
   */
  const [fx, setFx] = useState<{ zodiacEmoji: string } | null>(null)
  const fp = s.fortuneProfile
  useEffect(() => {
    setFx(null)
    if (!fp?.date) return
    let alive = true
    Promise.all([import('../lib/saju'), import('../lib/manse')])
      .then(([sj, mn]) => {
        if (!alive) return
        const solar = mn.profileSolar(fp)
        if (!solar) return
        const chart = mn.chartOf(solar, mn.parseTime(fp.time))
        setFx({ zodiacEmoji: sj.sajuOf(solar.y, solar.m, solar.d, chart).zodiacEmoji })
      })
      // 청크 로드 실패(재배포 후 구 해시·오프라인) — 칸은 기본 아이콘(🔮)으로 남는다
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [fp])

  const onCheckIn = () => {
    if (s.checkIn()) fire('coin')
  }

  // 퀵테스트 칩 — 문항·결과 데이터(60KB)는 지연 로드(메인 번들 오염 방지). 칩엔 메타 4필드만 필요
  const [quickChips, setQuickChips] = useState<{ id: string; emoji: string; short: L; grad0: string }[]>([])
  useEffect(() => {
    import('../data/quick')
      .then((m) =>
        setQuickChips(m.QUICK_TESTS.map((q) => ({ id: q.id, emoji: q.emoji, short: q.short, grad0: q.grad[0] }))),
      )
      // 청크 로드 실패(재배포 후 구 해시·오프라인) — 스켈레톤 영구 고착·unhandled rejection 방지
      .catch(() => setQuickChips([]))
  }, [])

  const trioDone = (['selfesteem', 'perfect', 'efficacy'] as const).every((id) => s.results.some((r) => r.testId === id))
  // 심층검사 전 종목 완주 시 AI 종합 심층 리포트 진입 노출(프리미엄 가치 상단 노출)
  const deepAllDone = TESTS.filter((tm) => !tm.precision).every((tm) => s.results.some((r) => r.testId === tm.id))
  // 🌱 성장 플랜 — 오늘 남은 실천 수(플랜이 있을 때만 홈에 노출)
  /**
   * 🌱 성장 플랜 배너 — 오늘 남은 실천 수.
   *
   * ⚠️ lib/growth는 페르소나 처방 전문(animalTranslations, 184KB)을 끌고 온다. 정적 import하면
   *    Home이 메인 번들이라 **모든 방문자가** 그 184KB를 받는다 — 정작 플랜이 있는 사람만 쓰는데.
   *    (personaVisual.ts가 애초에 이 연결을 끊으려고 만든 모듈인데 여기로 다시 새고 있었다.)
   *    플랜이 없으면 아예 로드하지 않고, 있으면 배너에 필요한 '개수'만 지연 계산한다.
   *    재발 방지는 scripts/bundle-check.mjs 가 맡는다.
   */
  const [growth, setGrowth] = useState({ total: 0, left: 0 })
  useEffect(() => {
    if (!s.growthPlanAt) {
      setGrowth({ total: 0, left: 0 })
      return
    }
    let alive = true
    void import('../lib/growth').then((g) => {
      if (!alive) return
      const tasks = g.buildFocuses(s.growthFocusIds, s.results).flatMap((f) => f.tasks)
      const left = tasks.filter((tk) => !g.isTaskDone(s.growthDone[tk.id], tk.cadence, todayStr())).length
      setGrowth({ total: tasks.length, left })
    }).catch(() => {
      // 청크 로드 실패(재배포 후 구 해시·오프라인) — 배너만 숨기고 unhandled rejection은 막는다
    })
    return () => {
      alive = false
    }
  }, [s.growthPlanAt, s.growthFocusIds, s.results, s.growthDone])

  return (
    <div className="bg-dots min-h-dvh pb-36">
      {/* 맨 위 얇은 띠 — 리워드 설문 상시 진입점(본문 레이아웃을 밀지 않는 34px). 설문이 꺼져 있으면 '준비 중' 안내 */}
      <TopStrip />

      <header className="mx-auto flex max-w-md items-center justify-between gap-2 px-5 pt-5">
        <div className="flex shrink-0 items-center gap-2">
          <img src="/icon.svg" alt="" className="floaty h-8 w-8 rounded-2xl" />
          <span className="whitespace-nowrap text-[17px] font-extrabold leading-none text-mind-800">{t('app.name')}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            whileTap={tapPop}
            transition={SPRING.press}
            onClick={() => nav('/mail')}
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-[16px] shadow-card"
            aria-label={l({ ko: '우편함', en: 'Mailbox', ja: 'メールボックス' })}
          >
            📬
            {unreadMail > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-extrabold text-white">
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
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING.pop}
          className="mt-4 rounded-3xl bg-gradient-to-br from-mind-500 to-sky2-500 px-4 pb-3.5 pt-4 shadow-pop"
        >
          <div className="flex items-center justify-between">
            <button onClick={() => nav('/profile')} className="flex min-w-0 items-center gap-2">
              <Avatar avatar={s.avatar} size={38} emojiScale={0.55} className="ring-2 ring-white/40" />
              <p className="truncate text-[17px] font-extrabold leading-none text-white">
                {s.nickname}
                <span className="ml-1 text-[14px] font-bold text-white/90">님 👋</span>
              </p>
            </button>
            <motion.button
              whileTap={tapPop}
              transition={SPRING.press}
              onClick={() => nav('/rank')}
              className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 text-[13px] font-extrabold leading-none text-white"
            >
              {tier.emoji} {l(tier.name)} ›
            </motion.button>
          </div>

          {/* 잔액 줄 — 환산액·교환 가능 수는 뺐다(홈 첫 카드는 잔액과 출석만). 출석 버튼과 세로 중앙 정렬 */}
          <div className="mt-2.5 flex min-h-[40px] items-center justify-between gap-3">
            {/* 숫자와 단위 P는 같은 기준선(items-baseline)에 — 아래끝 맞춤(items-end)은 글꼴 하단 여백 차이로 P가 떠 보였다 */}
            <div className="flex min-w-0 items-baseline gap-1">
              {/* 코인 이모지는 숫자와 따로 — 한 덩어리로 leading-none + truncate를 걸면 이모지 위아래가 잘린다 */}
              <span aria-hidden="true" className="shrink-0 self-center text-[24px] leading-none">🪙</span>
              <span className="truncate text-[28px] font-black leading-tight tracking-tight text-white tabular-nums">
                {s.points.toLocaleString()}
              </span>
              <span className="text-[16px] font-extrabold leading-none text-white/85">P</span>
            </div>
            {!checkedToday && (
              <motion.button
                whileTap={CHECKIN_PRESS.whileTap}
                transition={CHECKIN_PRESS.transition}
                onClick={onCheckIn}
                className="flex h-10 shrink-0 items-center rounded-2xl bg-white px-4 text-[14px] font-extrabold leading-none text-[#2F6B52]"
                style={{ boxShadow: CHECKIN_PRESS.rest }}
              >
                {t('dash.checkin')}
              </motion.button>
            )}
          </div>

          {/* 스탯 3종 — 세 칸 모두 같은 틀(StatTile). 숫자 자릿수가 바뀌어도 칸 한가운데에 오도록
              아이콘+숫자를 한 덩어리(inline-flex)로 묶어 가운데 정렬하고, 숫자는 고정폭(tabular-nums) */}
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <StatTile icon="🔥" value={s.streak.toLocaleString()} label={t('dash.streak')} />
            <StatTile icon={lgTier.emoji} value={l({ ko: `${lgRank}위`, en: `#${lgRank}`, ja: `${lgRank}位` })} label={t('dash.leagueShort')} onClick={() => nav('/league')} />
            <StatTile icon="⚡" value={`${todayFree.toLocaleString()}P`} label={t('dash.freeShort')} onClick={() => nav('/rewards')} />
          </div>

          {/* 다음 등급 진행 */}
          <div className="mt-2.5">
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round(tierProgress * 100))}%` }}
                transition={{ ...SPRING.gauge, delay: 0.25 }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <p className="mt-2 text-[12px] font-extrabold leading-none text-white/90">
              {next
                ? t('rank.next', { tier: `${next.emoji} ${l(next.name)}`, p: (next.min - lifetime).toLocaleString() })
                : t('rank.max')}
            </p>
          </div>
        </motion.div>

        {/* ── 대시보드 바로 아래 두 칸: 나에 관하여 | 오늘의 운세 — 아이콘 옆 제목 한 줄(설명·점수 없음).
            운세 칸 아이콘은 입력한 생일의 띠(없으면 🔮) ── */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {/* 등장('톡', 지연 포함)은 바깥 칸이, 누름은 안쪽 버튼이 — 한 요소에 두면 등장 지연이 누름 복귀에도 붙는다 */}
          <motion.div className="flex" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING.pop, delay: 0.06 }}>
            <motion.button
              whileTap={tapPop}
              transition={SPRING.press}
              onClick={() => nav('/me')}
              className="flex h-[64px] flex-1 items-center gap-2.5 rounded-3xl bg-gradient-to-br from-[#5B6CF0] to-[#8B95F6] px-3.5 text-left shadow-card"
            >
              <IconBadge emoji="🪞" tone="frost" size={36} radius={12} />
              <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-none text-white">{l({ ko: '나에 관하여', en: 'About me', ja: '私について' })}</span>
            </motion.button>
          </motion.div>
          <motion.div className="flex" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING.pop, delay: 0.1 }}>
            <motion.button
              whileTap={tapPop}
              transition={SPRING.press}
              onClick={() => nav('/fortune')}
              className="flex h-[64px] flex-1 items-center gap-2.5 rounded-3xl bg-gradient-to-br from-[#6B4FB8] to-[#A88BF2] px-3.5 text-left shadow-card"
            >
              <IconBadge emoji={fx?.zodiacEmoji ?? '🔮'} tone="frost" size={36} radius={12} />
              <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-none text-white">{t('fortune.title')}</span>
            </motion.button>
          </motion.div>
        </div>

        {/* ── 즐겨찾는 심리검사 — 가장 많이 찾는 검사를 첫 줄에 모은다.
            선정 근거(2026-09 조사): 성격유형·연애유형·애착유형은 국내 테스트 플랫폼·기사에서 참여 수치가 확인된 유형.
            ADHD·IQ는 운영자 지정. 가장 큰 유행(에겐/테토)은 앱에 대응 검사가 없어 제외. 운세는 위 박스로 옮겼다 ── */}
        <SectionHead emoji="⭐" title={l({ ko: '즐겨찾는 심리검사', en: 'Popular tests', ja: '人気の心理検査' })} onAll={() => nav('/tests')} allLabel={t('community.all')} />
        <ScrollChips
          items={[
            { id: 'fav-adhd', emoji: '🎯', label: 'ADHD', color: '#FFB020', onClick: () => nav('/test/adhd') },
            { id: 'fav-iq', emoji: '🧩', label: t('test.iq.short'), color: '#6E7BF2', onClick: () => nav('/test/iq') },
            { id: 'fav-mbti', emoji: '🔠', label: l({ ko: '성격', en: 'Persona', ja: '性格' }), color: '#3B9EFF', onClick: () => nav('/mbti/quick') },
            { id: 'fav-lovestyle', emoji: '💘', label: l({ ko: '연애', en: 'Love', ja: '恋愛' }), color: '#F25C8E', onClick: () => nav('/quick/lovestyle') },
            { id: 'fav-attach', emoji: '💞', label: l({ ko: '애착', en: 'Attach', ja: '愛着' }), color: '#E0567F', onClick: () => nav('/test/love') },
            { id: 'fav-stress', emoji: '🌋', label: l({ ko: '스트레스', en: 'Stress', ja: 'ストレス' }), color: '#8B7CF6', onClick: () => nav('/quick/stress') },
            { id: 'fav-mbti-deep', emoji: '🧩', label: l({ ko: '성격 심층', en: 'Persona+', ja: '性格詳細' }), color: '#6E7BF2', onClick: () => nav('/mbti/deep') },
          ]}
        />

        {/* ── 두뇌 측정 (실측 인지과제) — 즐겨찾기 바로 아래 ── */}
        <SectionHead emoji="🔬" title={l(TERMS.sectionPrecision)} onAll={() => nav('/tests', { state: { scrollTo: 'brain' } })} allLabel={t('community.all')} />
        <ScrollChips
          items={TESTS.filter((tm) => tm.precision).map((tm) => ({
            id: tm.id,
            emoji: tm.emoji,
            label: t(TEST_SHORT_KEY(tm.id)),
            color: tm.gradFrom,
            onClick: () => nav(`/test/${tm.id}`),
          }))}
        />

        {/* ── 1분 테스트 — 유행형·가벼운 검사 ── */}
        <SectionHead emoji="🔥" title={t('quick.banner')} onAll={() => nav('/quick')} allLabel={t('community.all')} />
        {quickChips.length ? (
          <ScrollChips
            items={quickChips.map((q, i) => ({
              id: q.id,
              emoji: q.emoji,
              label: l(q.short),
              color: q.grad0,
              onClick: () => nav(`/quick/${q.id}`),
              badge: i === 0 ? ('HOT' as const) : undefined,
            }))}
          />
        ) : (
          /* 데이터 로드 전 스켈레톤 칩 — 레이아웃 시프트 방지(실제 칩과 동일 규격) */
          <div className="no-scrollbar flex gap-2.5 overflow-x-hidden pb-3 pt-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} className={`${CHIP_W} aspect-square shrink-0 !rounded-[20px]`} />
            ))}
          </div>
        )}

        {/* ── 깊이 보는 심리검사 — 많이 찾는 순서: 연애·관계 → 요즘 내 마음 → 나를 알기 ── */}
        <div id="deep-tests">
          <SectionHead emoji="🧠" title={t('home.testsHeader')} onAll={() => nav('/tests', { state: { scrollTo: 'deep' } })} allLabel={t('community.all')} />
        </div>
        {DEEP_CATS.map((cat) => (
          <div key={cat.key}>
            <p className="mb-1 mt-2 flex items-center gap-1.5 text-[14px] font-extrabold leading-none text-ink-sub">
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
                }))}
            />
          </div>
        ))}

        {/* ── 🌱 오늘의 성장 실천 — 플랜 보유자에게만 ── */}
        {s.growthPlanAt > 0 && growth.total > 0 && (
          <Card
            onClick={() => nav('/growth')}
            ariaLabel={l({ ko: '성장 플랜 열기', en: 'Open growth plan', ja: '成長プランを開く' })}
            className="mt-3 flex items-center gap-3 !p-3.5"
          >
            <IconBadge emoji="🌱" color="#4FA882" size={40} radius={13} />
            <div className="min-w-0 flex-1">
              <h3 className="break-keep text-[16px] font-extrabold leading-tight">{l({ ko: '오늘의 성장 실천', en: "Today's growth actions", ja: '今日の成長実践' })}</h3>
              <p className="mt-1 break-keep text-[12px] font-bold leading-snug text-ink-sub">
                {growth.left > 0
                  ? l({ ko: `${growth.left}개 남았어요 · 하나씩 체크하면 +5P`, en: `${growth.left} left · +5P each`, ja: `残り${growth.left}件・1つ+5P` })
                  : l({ ko: '오늘 실천을 다 했어요', en: 'All done today', ja: '今日は完了' })}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-mind-100 px-2.5 py-1 text-[12px] font-extrabold text-mind-700">
              {growth.total - growth.left}/{growth.total}
            </span>
          </Card>
        )}

        {/* ── 완주자 전용 리포트 — 조건을 채운 사람에게만 ── */}
        {trioDone && (
          <Card onClick={() => nav('/self-report')} className="mt-3 flex items-center gap-3 !bg-gradient-to-r from-[#5B6CF0] to-[#9AA6FF] !p-3.5">
            <IconBadge emoji="🪞" tone="frost" size={40} radius={13} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-extrabold leading-tight text-white">{l({ ko: '통합 자기 리포트', en: 'Integrated self report', ja: '統合自己レポート' })}</h3>
              <p className="mt-1 truncate text-[12px] font-bold leading-snug text-white/90">{l({ ko: '자존감·완벽주의·자기효능감을 한 번에', en: 'Self-esteem · perfectionism · efficacy', ja: '自尊感情・完璧主義・自己効力感' })}</p>
            </div>
            <span className="text-[17px] font-extrabold leading-none text-white/85" aria-hidden="true">›</span>
          </Card>
        )}
        {deepAllDone && (
          <Card onClick={() => nav('/deep-report')} className="mt-3 flex items-center gap-3 !bg-gradient-to-r from-[#6E7BF2] to-[#A88BF2] !p-3.5">
            <IconBadge emoji="🧬" tone="frost" size={40} radius={13} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-extrabold leading-tight text-white">{l({ ko: 'AI 종합 심층 리포트', en: 'AI deep report', ja: 'AI総合レポート' })}</h3>
              <p className="mt-1 truncate text-[12px] font-bold leading-snug text-white/90">{l({ ko: '심층검사를 모두 마쳤어요. 한데 모아 읽어 드려요', en: 'All deep tests done — read as one', ja: '深層検査完走！一つに読み解きます' })}</p>
            </div>
            <span className="text-[17px] font-extrabold leading-none text-white/85" aria-hidden="true">›</span>
          </Card>
        )}

        {/* 친구 초대 — 둘 다 +100P */}
        <motion.button
          whileTap={tapPop}
          transition={SPRING.press}
          onClick={() => nav('/rewards', { state: { scrollTo: 'invite' } })}
          className="mt-4 flex w-full items-center gap-3 rounded-3xl p-3.5 text-left shadow-card"
          style={{ background: 'linear-gradient(135deg,#4FA882,#6E9FDC)' }}
        >
          <IconBadge emoji="🎁" tone="frost" size={40} radius={13} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-extrabold leading-tight text-white">{l({ ko: '친구 초대하고 +100P', en: 'Invite a friend, +100P', ja: '友達招待で+100P' })}</h3>
            <p className="mt-1 truncate text-[12px] font-bold leading-snug text-white/90">{l({ ko: '친구도 나도 +100P', en: 'You both get +100P', ja: '二人とも+100P' })}</p>
          </div>
          <span className="text-[17px] font-extrabold leading-none text-white/85" aria-hidden="true">›</span>
        </motion.button>

        <p className="mt-6 px-2 text-center text-[12px] font-bold leading-relaxed text-ink-faint">
          {t('home.disclaimer')}
        </p>

        <Footer />
      </main>
    </div>
  )
}
