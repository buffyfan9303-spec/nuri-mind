import { useEffect, useMemo, useRef, useState } from 'react'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TopBar, Card, ProgressBar, Modal } from '../components/ui'
import Button from '../components/Button'
import AdGate from '../components/AdGate'
import { useStore, isPremium, fortuneRecentKey, FORTUNE_FREE_PER_MONTH, FORTUNE_DIA_COST, FORTUNE_DETAIL_DIA_COST } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sajuOf, fortuneOf, weekOf, yearOf, monthOf, zodiacTodayLines, detailOf, analysisOf } from '../lib/saju'
import {
  chartOf, parseTime, profileSolar, profileKey, profileFromBirthDate, emptyProfile, parseYmd, fmtYmd, isValidSolar,
  lunarSupported, lunarToSolar, solarToLunar, ageOf, branchRangeKo, pillarKo,
  STEM_KO, STEM_HJ, BRANCH_KO, BRANCH_HJ, STEM_EL, BRANCH_EL, ELS, type FortuneProfile, type Pillar, type El,
} from '../lib/manse'
import { fetchFortuneDetailAi, type FortuneDetailText } from '../lib/fortuneAi'
import { FUNCTIONS_URL } from '../lib/supabase'
import { makeResultCard, shareCardBlob } from '../lib/shareCard'
import { ELEMENT_SVG } from '../lib/characters'
import { WEEK_LINES, TEN_GOD_LINES, STRENGTH_LINES, REL_NOTES, PILLAR_POS, EL_NAMES } from '../data/fortune'
import { track } from '../lib/analytics'
import { localDay } from '../lib/date'
import { burst } from '../lib/confetti'
import Emoji, { EmojiText } from '../components/Emoji'

/** 오행 색 — 사주표 칸 배경/테두리(글자는 ink로 두어 다크 모드 대비 유지) */
const EL_HEX: Record<El, string> = { 목: '#36B37E', 화: '#FF5630', 토: '#FFAB00', 금: '#8E99AB', 수: '#2B4C7E' }

const todayYmd = () => {
  const n = new Date()
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }
}

/** 재방문 시 폼에 채울 값 — 마지막 입력. 본인 프로필인데 계정 생일(궁합 화면 등에서 바뀜)과 어긋나면 생일을 따른다 */
function initialDraft(profile: FortuneProfile | null, birthDate: string): FortuneProfile {
  if (profile) {
    if (profile.self && birthDate) {
      const sol = profileSolar(profile)
      if (!sol || fmtYmd(sol) !== birthDate) return { ...profile, calendar: 'solar', leap: false, date: birthDate }
    }
    return profile
  }
  return birthDate ? profileFromBirthDate(birthDate) : { ...emptyProfile(), self: true }
}

export default function Fortune() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const birthDate = useStore((s) => s.birthDate)
  const fortuneProfile = useStore((s) => s.fortuneProfile)
  const fortuneRecent = useStore((s) => s.fortuneRecent)
  const saveFortuneProfile = useStore((s) => s.saveFortuneProfile)
  const removeFortuneRecent = useStore((s) => s.removeFortuneRecent)
  const diamonds = useStore((s) => s.diamonds)
  const fortuneMonth = useStore((s) => s.fortuneMonth)
  const fortuneFreeUses = useStore((s) => s.fortuneFreeUses)
  const viewFortuneFull = useStore((s) => s.viewFortuneFull)
  const fortuneDetailDate = useStore((s) => s.fortuneDetailDate)
  const markFortuneDetail = useStore((s) => s.markFortuneDetail)
  const markFortuneSeen = useStore((s) => s.markFortuneSeen)
  const claimFortuneShare = useStore((s) => s.claimFortuneShare)
  const spendDiamonds = useStore((s) => s.spendDiamonds)
  const fortuneAiDate = useStore((s) => s.fortuneAiDate)
  const fortuneAiData = useStore((s) => s.fortuneAiData)
  const fortuneAiKey = useStore((s) => s.fortuneAiKey)
  const setFortuneAi = useStore((s) => s.setFortuneAi)
  const lang = useStore((s) => s.lang)
  const premiumUntil = useStore((s) => s.premiumUntil)
  const premium = isPremium(premiumUntil)
  /**
   * 화면은 **항상 입력 폼부터** — 가족·친구 운세를 번갈아 보는 사람이 많아서, 재방문 때 지난 결과로 곧장
   * 건너뛰지 않고 지난 입력을 채운 폼을 보여 준다. 결과는 '오늘의 운세 보기'를 눌러야 열린다.
   */
  const [view, setView] = useState<'form' | 'result'>('form')
  /** 폼 초기값 전환용 키 — 'edit…'=지난 입력, 'new…'=빈 칸(다른 사람 운세 보기) */
  const [formSeed, setFormSeed] = useState('edit0')
  const backToForm = (fresh: boolean) => {
    setFormSeed(`${fresh ? 'new' : 'edit'}${Date.now()}`)
    setView('form')
    window.scrollTo({ top: 0 })
  }
  const [saved, setSaved] = useState(false)
  const [shareBonus, setShareBonus] = useState(false)
  /** 공유 성공(공유/저장) 시 하루 1회 +5P — 검사 공유와 같은 루프를 운세에도 */
  const rewardShare = (how: 'shared' | 'downloaded' | 'cancelled') => {
    if (how === 'cancelled') return
    if (claimFortuneShare() > 0) {
      burst()
      setShareBonus(true)
      setTimeout(() => setShareBonus(false), 2400)
    }
  }
  // 오늘 이미 해제했다면 새로고침해도 열린 상태 유지(유료 결제 소멸 방지) — 해제는 계정·날짜 단위라 누구 운세든 같이 열린다
  const fortuneFullDate = useStore((st) => st.fortuneFullDate)
  const [unlocked, setUnlocked] = useState(fortuneFullDate === localDay())
  /** 다이아 부족 시트 — 어느 해제에서 모자랐는지에 따라 필요한 개수가 다르다(종합 vs 상세) */
  const [needCharge, setNeedCharge] = useState<null | 'full' | 'detail'>(null)
  const [showAd, setShowAd] = useState(false)

  const profile = fortuneProfile
  const data = useMemo(() => {
    if (!profile) return null
    const solar = profileSolar(profile)
    if (!solar) return null
    const chart = chartOf(solar, parseTime(profile.time))
    const today = todayYmd()
    const gender = profile.gender
    return {
      solar,
      chart,
      lunar: profile.calendar === 'solar' ? solarToLunar(solar.y, solar.m, solar.d) : null,
      age: ageOf(solar, today),
      analysis: analysisOf(chart),
      saju: sajuOf(solar.y, solar.m, solar.d, chart),
      fortune: fortuneOf(solar, today, { chart, gender }),
      week: weekOf(solar, today, { chart, gender }),
      year: yearOf(solar, today.y, chart),
      month: monthOf(solar, today.y, today.m, chart),
      zodiac: zodiacTodayLines(today),
      detail: detailOf(solar, today, chart),
    }
  }, [profile])
  const pKey = profile ? profileKey(profile) : ''
  const timeLabel = (tm: string) => fmtTime(tm, lang, t('fortune.timeUnknown'))

  const submit = (p: FortuneProfile) => {
    saveFortuneProfile(p)
    setView('result')
    // 오늘의 퀘스트 '운세 확인' — 결과를 실제로 연 순간 기록(하루 1회 가드는 스토어가 한다)
    markFortuneSeen()
    track('fortune_view', { who: p.self ? 'self' : 'other', calendar: p.calendar, time: p.time ? 'known' : 'unknown' })
    window.scrollTo({ top: 0 })
  }

  // SEO 메타 — sitemap 등재 경로라 canonical을 자기 자신으로(정적 index.html은 홈 고정). 언마운트 시 원복
  useEffect(() => {
    const prevTitle = document.title
    const md = document.querySelector('meta[name="description"]')
    const prevDesc = md?.getAttribute('content') ?? ''
    const cl = document.querySelector('link[rel="canonical"]')
    const prevCanon = cl?.getAttribute('href') ?? ''
    document.title = '오늘의 운세 무료보기 — 사주팔자·음양오행 | 누리 마인드'
    md?.setAttribute('content', '생년월일(양력·음력)과 태어난 시간으로 사주팔자·음양오행을 풀어 오늘의 총운·애정운·금전운·건강운과 행운의 색·숫자·방향까지 무료. 가족·친구 운세와 띠별 운세도 함께.')
    cl?.setAttribute('href', 'https://www.nurimind.co.kr/fortune')
    return () => {
      document.title = prevTitle
      md?.setAttribute('content', prevDesc)
      if (prevCanon) cl?.setAttribute('href', prevCanon)
    }
  }, [])

  // 상세 운세 해제 상태면 AI 개인화본을 생성·캐싱 — 사람(profileKey)·날짜별 1회 (미배포/실패 시 결정론 템플릿 폴백)
  useEffect(() => {
    const today = localDay()
    // 결과 화면이 아니거나 잠금 상태면 호출 안 함(과금 절약). 프리미엄은 날짜 마킹 없이 상시 해제라 별도 허용(#19)
    if (view !== 'result' || !data || !profile || (fortuneDetailDate !== today && !premium)) return
    if (fortuneAiDate === today && fortuneAiData && fortuneAiKey === pKey) return // 이 사람 오늘 캐시 있음
    if (!FUNCTIONS_URL) return // 엣지 함수 미배포 → 결정론 폴백
    let cancelled = false
    const c = data.chart
    const P = (p: Pillar | null, suffix: string) => (p ? pillarKo(p) + suffix : '')
    fetchFortuneDetailAi({
      ilju: data.saju.iljuKo,
      element: data.saju.ilganEl,
      zodiac: data.saju.zodiacKo,
      luckyDir: data.fortune.luckyDir,
      luckyTime: data.detail.luckyTime,
      lang,
      date: today,
      pillars: [P(c.year, '년'), P(c.month, '월'), P(c.day, '일'), P(c.hour, '시')].filter(Boolean).join(' '),
      gender: profile.gender,
      age: data.age.man,
      strength: data.analysis.strength.strength,
      favorable: data.analysis.strength.favorable.join(','),
      todayTenGod: data.fortune.tenGod,
      todayIlju: data.fortune.todayIljuKo,
    }).then((res) => {
      if (res && !cancelled) setFortuneAi(today, res, pKey)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, data, fortuneDetailDate, premium, lang])

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
      rewardShare(how)
      if (how === 'downloaded') {
        setSaved(true)
        setTimeout(() => setSaved(false), 2200)
      }
    } catch {
      /* noop */
    }
  }

  // 상세 운세(총평·행운 방향) 공유 카드
  const shareDetail = async () => {
    if (!data) return
    const { saju, fortune, detail } = data
    const aiT = fortuneAiDate === localDay() && fortuneAiKey === pKey ? fortuneAiData : null
    track('share', { channel: 'fortune_detail' })
    try {
      const blob = await makeResultCard({
        emoji: saju.zodiacEmoji,
        name: `${saju.zodiacKo}${t('fortune.zodiacSuffix')} · ${saju.iljuKo}`,
        title: l({ ko: `행운의 방향 ${fortune.luckyDir}쪽`, en: `Lucky way: ${fortune.luckyDir}`, ja: `幸運の方角 ${fortune.luckyDir}` }),
        topPercent: 0,
        subtitle: aiT ? aiT.summary : l(detail.summary),
        chipText: `⏳ ${aiT ? aiT.luckyTime : detail.luckyTime}`,
        testName: l({ ko: '오늘의 상세 운세', en: 'Detailed Daily Fortune', ja: '今日の詳細運勢' }),
        grad: fortune.grad,
        appName: t('app.name'),
        heroLabel: l({ ko: '오늘의 상세 운세', en: 'Detailed Fortune', ja: '今日の詳細運勢' }),
        ctaTop: l({ ko: '내 오늘의 상세 운세는? 🔮', en: "What's my detailed fortune? 🔮", ja: '私の詳細運勢は？🔮' }),
        ctaSub: l({ ko: '지금 누리 마인드에서 →', en: 'Now on NURI MIND →', ja: '今すぐ NURI MIND で →' }),
      })
      const how = await shareCardBlob(blob, `[누리 마인드] 오늘의 상세 운세 · ${saju.zodiacKo}${t('fortune.zodiacSuffix')}`, 'nurimind-fortune-detail.png')
      rewardShare(how)
      if (how === 'downloaded') {
        setSaved(true)
        setTimeout(() => setSaved(false), 2200)
      }
    } catch {
      /* noop */
    }
  }

  // ── 입력 폼(항상 첫 화면) ──
  if (view === 'form' || !data) {
    return (
      <div className="bg-dots min-h-dvh pb-36">
        <TopBar back="/" title={t('fortune.title')} />
        <main className="mx-auto max-w-md px-5">
          <ProfileForm
            key={formSeed}
            initial={formSeed.startsWith('new') ? emptyProfile() : initialDraft(fortuneProfile, birthDate)}
            recent={fortuneRecent}
            onRemoveRecent={removeFortuneRecent}
            onSubmit={submit}
          />
        </main>
      </div>
    )
  }

  const { saju, fortune, week, year, month, zodiac, detail, chart, analysis } = data
  const isSelf = !!profile?.self
  const pName = profile?.name.trim() ?? ''
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
      setNeedCharge('full')
      return
    }
    setUnlocked(true)
    burst()
  }
  const todayStr = localDay()
  const detailUnlocked = fortuneDetailDate === todayStr || premium
  const aiDetail = fortuneAiDate === todayStr && fortuneAiKey === pKey ? fortuneAiData : null
  const usingAi = !!aiDetail
  const v: FortuneDetailText = aiDetail ?? {
    morning: l(detail.morning), noon: l(detail.noon), evening: l(detail.evening),
    luckyTime: detail.luckyTime, place: l(detail.place), item: l(detail.item), food: l(detail.food),
    caution: l(detail.caution), advice: l(detail.advice), relation: l(detail.relation),
    work: l(detail.work), wealth: l(detail.wealth), health: l(detail.health), summary: l(detail.summary),
  }
  const unlockDetailDia = () => {
    if (spendDiamonds(FORTUNE_DETAIL_DIA_COST)) {
      markFortuneDetail()
      burst()
    } else {
      setNeedCharge('detail')
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
      <TopBar back={() => backToForm(false)} title={t('fortune.title')} />
      <main className="mx-auto max-w-md px-5" data-testid="fortune-result">
        {/* 사주 히어로 */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING.ui}
          className="relative mt-3 rounded-3xl p-6 text-center text-white shadow-pop"
          style={{ background: `linear-gradient(135deg, ${fortune.grad[0]}, ${fortune.grad[1]})` }}
        >
          {ELEMENT_SVG[saju.ilganEl] && (
            <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25" title={saju.ilganEl}>
              <img src={`data:image/svg+xml;utf8,${encodeURIComponent(ELEMENT_SVG[saju.ilganEl])}`} alt="" className="h-8 w-8" />
            </div>
          )}
          <p className="text-[12px] font-extrabold text-white/85">
            {pName ? `${t('fortune.whose', { name: pName })} · ` : ''}{t('fortune.todayIs', { ilju: fortune.todayIljuKo })}
          </p>
          <div className="floaty mt-1 leading-none"><Emoji e={saju.zodiacEmoji} size={28} className="align-top" /></div>
          <h1 className="mt-2 text-[24px] font-extrabold tracking-tight">
            {isSelf ? t('fortune.myIlju', { ilju: saju.iljuKo }) : pName ? t('fortune.nameIlju', { name: pName, ilju: saju.iljuKo }) : `${t('fortune.pillarDay')}, ${saju.iljuKo}`}
          </h1>
          <p className="mt-1.5 text-[13px] font-bold text-white/90">
            {t('fortune.zodiacLine', { zodiac: saju.zodiacKo, ym: saju.ilganYm, el: saju.ilganEl })}
          </p>
        </motion.div>

        <SajuCards
          chart={chart}
          analysis={analysis}
          fortune={fortune}
          solarText={fmtYmd(data.solar)}
          lunarText={data.lunar ? `${fmtYmd(data.lunar)}${data.lunar.leap ? ` (${t('fortune.leap')})` : ''}` : profile && profile.calendar === 'lunar' ? `${profile.date}${profile.leap ? ` (${t('fortune.leap')})` : ''}` : ''}
          age={data.age}
          timeText={profile?.time ? timeLabel(profile.time) : t('fortune.timeUnknown')}
        />

        {/* 탄생화 */}
        <Card className="mt-3 flex items-center gap-3">
          <Emoji e={saju.birthFlower.emoji} size={28} />
          <div className="min-w-0 flex-1">
            <h3 className="break-keep text-[15px] font-extrabold">{t('fortune.birthFlower', { name: saju.birthFlower.nameKo })}</h3>
            <p className="mt-0.5 break-keep text-[12px] font-bold leading-relaxed text-ink-sub">
              「{saju.birthFlower.meaningKo}」 · {saju.birthFlower.blurbKo}
            </p>
          </div>
        </Card>

        {/* 오늘의 기운 */}
        <h2 className="mt-6 text-[20px] font-extrabold leading-tight">{t('fortune.todayLuck')}</h2>
        <div className="mt-3 space-y-2.5">
          {gauges.map((g, i) => (
            <motion.div key={g.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.ui, delay: 0.05 * i }}>
              <Card>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-extrabold"><Emoji e={g.emoji} inline />{g.label}</span>
                  <span className="text-[13px] font-extrabold" style={{ color: fortune.grad[0] }}>{g.score}{t('fortune.point')}</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={g.score / 100} color={fortune.grad[0]} />
                </div>
                <p className="mt-2.5 break-keep text-[13px] font-bold leading-relaxed text-ink">{g.text}</p>
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
              <div className="leading-none"><Emoji e={x.emoji} size={20} className="align-top" /></div>
              <p className="mt-1.5 text-[11px] font-bold text-ink-faint">{x.label}</p>
              <p className="mt-0.5 text-[15px] font-extrabold">{x.val}</p>
            </div>
          ))}
        </div>

        {/* ── 오늘의 상세 운세 (광고 또는 5💎 해제 · 하루 무제한 열람) ── */}
        <div className="mt-7 flex items-center gap-2">
          <h2 className="text-[17px] font-extrabold">{l({ ko: '오늘의 상세 운세', en: 'Detailed Daily Fortune', ja: '今日の詳細運勢' })}</h2>
          {detailUnlocked ? (
            <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700">
              <EmojiText text={usingAi ? `✨ ${l({ ko: 'AI 맞춤', en: 'AI personalized', ja: 'AI個別' })}` : l({ ko: '열람 중', en: 'unlocked', ja: '閲覧中' })} />
            </span>
          ) : (
            <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700"><Emoji e="📺" inline />{l({ ko: '오늘 무료', en: 'Free today', ja: '今日無料' })}</span>
          )}
        </div>
        <p className="mt-1 break-keep text-[12px] font-bold leading-relaxed text-ink-sub">
          {l({ ko: '시간대별 흐름부터 행운의 방향·장소·아이템까지 아주 자세하게. 매일 광고 한 번이면 무료로 볼 수 있어요.', en: 'From hour-by-hour flow to lucky direction, place, and item — in full detail. One ad a day unlocks it free.', ja: '時間帯ごとの流れから幸運の方角・場所・アイテムまで詳しく。毎日広告1回で無料。' })}
        </p>

        <div className="relative mt-3">
          <div className={detailUnlocked ? 'space-y-3' : 'pointer-events-none max-h-[440px] space-y-3 overflow-hidden select-none blur-[5px]'} aria-hidden={!detailUnlocked}>
            {/* 시간대별 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">{l({ ko: '시간대별 운세', en: 'By Time of Day', ja: '時間帯別の運勢' })}</h3>
              <div className="mt-2.5 space-y-2.5">
                {[
                  { emoji: '🌅', label: l({ ko: '아침', en: 'Morning', ja: '朝' }), text: v.morning },
                  { emoji: '☀️', label: l({ ko: '낮', en: 'Noon', ja: '昼' }), text: v.noon },
                  { emoji: '🌙', label: l({ ko: '저녁', en: 'Evening', ja: '夜' }), text: v.evening },
                ].map((r) => (
                  <div key={r.label} className="rounded-2xl bg-surface2 p-3">
                    <span className="text-[12px] font-extrabold text-mind-700"><Emoji e={r.emoji} inline />{r.label}</span>
                    <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink">{r.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 행운 포인트 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">{l({ ko: '오늘의 행운 포인트', en: 'Lucky Points', ja: '今日のラッキーポイント' })}</h3>
              <div className="mt-2.5 space-y-2">
                {[
                  { emoji: '⏳', label: l({ ko: '행운의 시간', en: 'Lucky time', ja: 'ラッキー時間' }), val: v.luckyTime },
                  { emoji: '🧭', label: l({ ko: '좋은 방향', en: 'Good direction', ja: '良い方角' }), val: fortune.luckyDir },
                  { emoji: '📍', label: l({ ko: '행운의 장소', en: 'Lucky place', ja: 'ラッキー場所' }), val: v.place },
                  { emoji: '🎁', label: l({ ko: '행운의 아이템', en: 'Lucky item', ja: 'ラッキーアイテム' }), val: v.item },
                  { emoji: '🍴', label: l({ ko: '행운의 음식', en: 'Lucky food', ja: 'ラッキーフード' }), val: v.food },
                ].map((r) => (
                  <div key={r.label} className="flex items-start gap-2.5 rounded-2xl bg-surface2 p-2.5">
                    <Emoji e={r.emoji} size={17} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-ink-faint">{r.label}</p>
                      <p className="mt-0.5 break-keep text-[13px] font-extrabold text-ink">{r.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 분야별 상세 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">{l({ ko: '분야별 상세', en: 'By Area', ja: '分野別の詳細' })}</h3>
              <div className="mt-2.5 space-y-3">
                {[
                  { emoji: '🤝', label: l({ ko: '인간관계', en: 'Relationships', ja: '人間関係' }), text: v.relation },
                  { emoji: '💼', label: l({ ko: '일·학업', en: 'Work & Study', ja: '仕事・学業' }), text: v.work },
                  { emoji: '💰', label: l({ ko: '재물', en: 'Wealth', ja: '財運' }), text: v.wealth },
                  { emoji: '🌿', label: l({ ko: '건강', en: 'Health', ja: '健康' }), text: v.health },
                ].map((r) => (
                  <div key={r.label}>
                    <span className="text-[12px] font-extrabold text-mind-700"><Emoji e={r.emoji} inline />{r.label}</span>
                    <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink">{r.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 조심 & 조언 */}
            <Card>
              <h3 className="text-[14px] font-extrabold">{l({ ko: '오늘 조심할 것', en: 'Watch Out For', ja: '今日の注意点' })}</h3>
              <p className="mt-1.5 break-keep text-[13px] font-bold leading-relaxed text-ink">{v.caution}</p>
              <h3 className="mt-3.5 text-[14px] font-extrabold">{l({ ko: '오늘의 조언', en: 'Today’s Advice', ja: '今日の助言' })}</h3>
              <p className="mt-1.5 break-keep text-[13px] font-bold leading-relaxed text-ink">{v.advice}</p>
            </Card>

            {/* 총평 */}
            <div className="rounded-3xl p-4 text-white shadow-pop" style={{ background: `linear-gradient(135deg, ${fortune.grad[0]}, ${fortune.grad[1]})` }}>
              <h3 className="text-[12px] font-extrabold text-white/85">{l({ ko: '오늘의 총평', en: 'Summary', ja: '今日の総評' })}</h3>
              <p className="mt-1.5 break-keep text-[14px] font-bold leading-relaxed">{v.summary}</p>
            </div>

            {detailUnlocked && (
              <Button color="sky" size="lg" onClick={shareDetail}>
                {l({ ko: '상세 운세 공유하기', en: 'Share Detailed Fortune', ja: '詳細運勢をシェア' })}
              </Button>
            )}
          </div>

          {/* 잠금 오버레이 */}
          {!detailUnlocked && (
            <div className="absolute inset-0 flex items-end justify-center rounded-3xl bg-gradient-to-b from-transparent via-cream/60 to-cream pb-1">
              <div className="w-full rounded-3xl border-2 border-mind-200 bg-surface p-5 text-center shadow-pop">
                <div className="leading-none"><Emoji e="🔮" size={28} className="align-top" /></div>
                <h3 className="mt-2 break-keep text-[16px] font-extrabold">{l({ ko: '오늘의 상세 운세, 광고 1회면 무료', en: 'Detailed fortune — free with 1 ad!', ja: '今日の詳細運勢 — 広告1回で無料！' })}</h3>
                <p className="mt-1 break-keep text-[12px] font-bold leading-relaxed text-ink-sub">
                  {l({ ko: '광고 한 번이면 오늘 하루 종일 열려요. 내일 다시 오면 또 무료예요.', en: 'One ad unlocks it all day — come back tomorrow for another free view!', ja: '広告1回で今日一日中閲覧OK。明日また来ればまた無料！' })}
                </p>
                <div className="mt-4 space-y-2.5">
                  <Button color="mind" size="lg" onClick={() => setShowAd(true)}>
                    <Emoji e="📺" inline />{l({ ko: '광고 보고 무료로 보기', en: 'Watch ad — free', ja: '広告を見て無料で見る' })}
                  </Button>
                  <Button color="white" size="lg" onClick={unlockDetailDia}>
                    <EmojiText text={l({ ko: `광고 없이 바로 보기 (💎 ${FORTUNE_DETAIL_DIA_COST}개)`, en: `Skip the ad (${FORTUNE_DETAIL_DIA_COST}💎)`, ja: `広告なしで見る (${FORTUNE_DETAIL_DIA_COST}💎)` })} />
                  </Button>
                </div>
                <p className="mt-2.5 text-[11px] font-bold text-ink-faint">{l({ ko: '보유', en: 'Balance', ja: '保有' })} <Emoji e="💎" inline />{diamonds.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── 종합 운세 (프리미엄: 매월 무료 3회 → 이후 5다이아) ── */}
        {unlocked ? (
          <>
            <div className="mt-6 flex items-center gap-2">
              <h2 className="text-[17px] font-extrabold">{l({ ko: '종합 운세', en: 'Full Fortune', ja: '総合運勢' })}</h2>
              <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700">{l({ ko: '열람 중', en: 'unlocked', ja: '閲覧中' })}</span>
            </div>

            {/* 이번 주 총운 추이 */}
            <h3 className="mt-4 text-[15px] font-extrabold text-ink-sub">{t('fortune.weekTitle')}</h3>
            <Card className="mt-2">
              <div className="flex items-end justify-between gap-1.5">
                {week.map((w, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[11px] font-extrabold" style={{ color: w.isToday ? fortune.grad[0] : '#9AA5A0' }}>{w.overall}</span>
                    <div className="flex h-[72px] w-full items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${w.overall}%` }}
                        transition={{ ...SPRING.ui, delay: 0.04 * i }}
                        className="w-[58%] rounded-full"
                        style={{ background: w.isToday ? `linear-gradient(${fortune.grad[0]}, ${fortune.grad[1]})` : '#DCE4DF' }}
                      />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: w.isToday ? fortune.grad[0] : '#9AA5A0' }}>{w.isToday ? t('fortune.today') : w.weekdayKo}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">{l(WEEK_LINES[fortune.relation])}</p>
            </Card>

            {/* 이달의 운 */}
            <Card className="mt-3 flex items-start gap-3">
              <Emoji e="🗓" size={24} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[14px] font-extrabold">{l({ ko: `${thisMonth}월의 운`, en: 'This month', ja: `${thisMonth}月の運` })}</h3>
                  <span className="shrink-0 text-[13px] font-extrabold" style={{ color: fortune.grad[0] }}>{month.overall}{t('fortune.point')}</span>
                </div>
                <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">{l(month.line)}</p>
              </div>
            </Card>

            {/* 올해의 운 */}
            <Card className="mt-3 flex items-start gap-3">
              <Emoji e="📅" size={24} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-extrabold">{t('fortune.yearTitle', { year: thisYear })}</h3>
                <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">{l(year.line)}</p>
              </div>
            </Card>

            {/* 띠별 오늘 한마디 */}
            <h3 className="mt-6 text-[15px] font-extrabold text-ink-sub">{t('fortune.zodiacTitle')}</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {zodiac.map((z) => {
                const mine = z.zodiacKo === saju.zodiacKo
                return (
                  <div
                    key={z.zodiacKo}
                    className="flex items-center gap-2 rounded-2xl p-2.5"
                    style={{ background: mine ? `${fortune.grad[0]}14` : 'rgb(var(--surface))', border: mine ? `2px solid ${fortune.grad[0]}` : '2px solid rgb(var(--line))' }}
                  >
                    <Emoji e={z.zodiacEmoji} size={20} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold">{z.zodiacKo}{t('fortune.zodiacSuffix')}{mine ? ` · ${isSelf ? t('fortune.me') : pName || '★'}` : ''}</p>
                      <p className="break-keep text-[11px] font-bold leading-tight text-ink-sub">{l(z.line)}</p>
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
              <div className="leading-none"><Emoji e="🔮" size={28} className="align-top" /></div>
              <h3 className="mt-2 text-[17px] font-extrabold">{l({ ko: '종합 운세 풀어보기', en: 'Unlock Full Fortune', ja: '総合運勢を開く' })}</h3>
              <p className="mx-auto mt-1 max-w-[260px] break-keep text-[12px] font-bold leading-relaxed text-ink-sub">
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
                    <Emoji e={h.e} size={16} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold">{h.label}</span>
                    <Emoji e={h.free || premium ? '✅' : '🔒'} size={13} className="shrink-0" />
                  </div>
                ))}
              </div>
              <div className="mx-auto mt-4 max-w-[280px]">
                <Button color="burn" onClick={openFull}>
                  <EmojiText text={premium
                    ? l({ ko: '✨ 프리미엄 무제한 보기', en: '✨ Premium · unlimited', ja: '✨ プレミアム無制限' })
                    : freeLeft > 0
                      ? l({ ko: `무료로 보기 · 이번 달 ${freeLeft}회 남음`, en: `View free · ${freeLeft} left this month`, ja: `無料で見る・今月あと${freeLeft}回` })
                      : l({ ko: `💎 ${FORTUNE_DIA_COST}개로 보기`, en: `View for 💎${FORTUNE_DIA_COST}`, ja: `💎${FORTUNE_DIA_COST}で見る` })} />
                </Button>
              </div>
              <p className="mt-2 text-[11px] font-bold text-ink-faint">
                <EmojiText text={premium
                  ? l({ ko: '프리미엄 구독 중 · 운세 무제한', en: 'Premium active · unlimited', ja: 'プレミアム中・運勢無制限' })
                  : freeLeft > 0
                    ? l({ ko: `매월 ${FORTUNE_FREE_PER_MONTH}회 무료 · 이후 1회 ${FORTUNE_DIA_COST}다이아`, en: `${FORTUNE_FREE_PER_MONTH} free/month, then 💎${FORTUNE_DIA_COST}`, ja: `毎月${FORTUNE_FREE_PER_MONTH}回無料・以降💎${FORTUNE_DIA_COST}` })
                    : l({ ko: `보유 💎 ${diamonds}`, en: `You have 💎${diamonds}`, ja: `保有💎${diamonds}` })} />
              </p>
            </div>
          </div>
        )}

        {/* 궁합 + 공유 */}
        <div className="mt-5 space-y-2.5">
          <Button color="love" onClick={() => nav('/compat')}><Emoji e="💞" inline />{t('fortune.compatCta')}</Button>
          <Button color="sky" onClick={shareFortune}>{t('fortune.share')}</Button>
        </div>
        {saved && (
          <p className="mt-3 rounded-xl bg-mind-100 py-2 text-center text-[13px] font-extrabold text-mind-700"><Emoji e="✅" inline />{t('share.saved')}</p>
        )}
        {/* 예전엔 위 '저장됨' 안에 들어 있어 이미지 저장일 때만 보였다 — 공유 시트로 보낸 보상은 말없이 들어왔다 */}
        {shareBonus && (
          <motion.p
            initial={{ opacity: 0, y: 8, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            transition={SPRING.flick}
            className="fixed bottom-40 left-1/2 z-50 rounded-full bg-mind-600 px-4 py-2 text-[13px] font-extrabold text-white shadow-pop"
          >
            <Emoji e="📤" inline />{l({ ko: '공유 보상 +5P!', en: 'Share bonus +5P!', ja: 'シェア報酬 +5P！' })}
          </motion.p>
        )}

        <p className="mt-4 px-2 text-center text-[11px] font-bold leading-relaxed text-ink-faint">{t('fortune.disclaimer')}</p>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button onClick={() => backToForm(false)} className="min-h-[44px] rounded-2xl py-2 text-[13px] font-extrabold text-ink-sub">
            {t('fortune.changeBirth')}
          </button>
          <button onClick={() => backToForm(true)} className="min-h-[44px] rounded-2xl py-2 text-[13px] font-extrabold text-mind-700">
            {t('fortune.otherPerson')}
          </button>
        </div>

        <Modal open={needCharge !== null} onClose={() => setNeedCharge(null)}>
          <div className="text-center">
            <p className="leading-none"><Emoji e="💎" size={28} className="align-top" /></p>
            <h3 className="mt-2 text-[20px] font-extrabold">{l({ ko: '다이아가 부족해요', en: 'Not enough diamonds', ja: 'ダイヤが足りません' })}</h3>
            <p className="mt-1 break-keep text-[13px] font-bold text-ink-faint">
              <EmojiText text={needCharge === 'detail'
                ? l({ ko: `상세 운세 열람에 ${FORTUNE_DETAIL_DIA_COST}다이아가 필요해요 · 보유 ${diamonds}`, en: `Detailed fortune needs 💎${FORTUNE_DETAIL_DIA_COST} · you have ${diamonds}`, ja: `詳細運勢に💎${FORTUNE_DETAIL_DIA_COST}必要・保有${diamonds}` })
                : l({ ko: `종합 운세 열람에 ${FORTUNE_DIA_COST}다이아가 필요해요 · 보유 ${diamonds}`, en: `Full fortune needs 💎${FORTUNE_DIA_COST} · you have ${diamonds}`, ja: `総合運勢に💎${FORTUNE_DIA_COST}必要・保有${diamonds}` })} />
            </p>
            <div className="mt-5">
              <Button color="iq" onClick={() => nav('/charge')}><Emoji e="💎" inline />{l({ ko: '충전하러 가기', en: 'Go charge', ja: 'チャージへ' })}</Button>
              <button onClick={() => setNeedCharge(null)} className="mt-2 w-full py-2 text-[13px] font-bold text-ink-faint">{l({ ko: '다음에', en: 'Later', ja: '後で' })}</button>
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

/** 태어난 시간 표기 — 'b:0' → '자시 23:30~01:29', 'HH:MM' 그대로 */
function fmtTime(tm: string, lang: string, unknown: string): string {
  const b = /^b:(\d{1,2})$/.exec(tm)
  if (b) {
    const i = +b[1]
    return lang === 'ko' ? `${BRANCH_KO[i]}시 ${branchRangeKo(i)}` : `${BRANCH_HJ[i]}時 ${branchRangeKo(i)}`
  }
  return /^\d{2}:\d{2}$/.test(tm) ? tm : unknown
}

const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()
const selectCls = 'w-full appearance-none rounded-2xl border-2 border-line bg-surface px-3 py-3 text-[16px] font-extrabold outline-none focus:border-mind-400'
const inputCls = 'w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[16px] font-extrabold outline-none focus:border-mind-400'

/** 두세 개 중 하나 고르는 알약 토글 */
function Seg<T extends string>({ value, options, onChange, label }: { value: T | ''; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1.5">
      {options.map((o) => {
        const on = value === o.v
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.v)}
            className={`min-h-[44px] flex-1 rounded-2xl border-2 px-3 text-[14px] font-extrabold transition-colors ${
              on ? 'border-mind-400 bg-mind-100 text-mind-700' : 'border-line bg-surface text-ink-sub'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * 운세 입력 폼 — 이름(선택)·성별·생년월일(양/음력·윤달)·태어난 시간(모름/시진/정확한 시각).
 * 지난 입력이 채워진 채로 열리고, 최근 본 사람 칩으로 가족·친구를 바로 바꿔 볼 수 있다.
 */
function ProfileForm({
  initial,
  recent,
  onRemoveRecent,
  onSubmit,
}: {
  initial: FortuneProfile
  recent: FortuneProfile[]
  onRemoveRecent: (key: string) => void
  onSubmit: (p: FortuneProfile) => void
}) {
  const t = useT()
  const l = useL()
  const lang = useStore((s) => s.lang)
  const [p, setP] = useState<FortuneProfile>(initial)
  const init = parseYmd(initial.date)
  const [ys, setYs] = useState(init ? String(init.y) : '')
  const [ms, setMs] = useState(init ? String(init.m) : '')
  const [ds, setDs] = useState(init ? String(init.d) : '')
  const [exact, setExact] = useState(/^\d{2}:\d{2}$/.test(initial.time))
  const [err, setErr] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const today = todayYmd()
  const thisYear = today.y

  const patch = (q: Partial<FortuneProfile>) => {
    setP((cur) => ({ ...cur, ...q }))
    setErr('')
  }
  const load = (r: FortuneProfile) => {
    setP(r)
    const d = parseYmd(r.date)
    setYs(d ? String(d.y) : '')
    setMs(d ? String(d.m) : '')
    setDs(d ? String(d.d) : '')
    setExact(/^\d{2}:\d{2}$/.test(r.time))
    setErr('')
  }
  const clearForOther = () => {
    load({ ...emptyProfile(), self: false })
    nameRef.current?.focus()
  }

  const y = Number(ys)
  const m = Number(ms)
  const d = Number(ds)
  const complete = !!(ys && ms && ds)
  const dateStr = complete ? fmtYmd({ y, m, d }) : ''
  /** 입력 날짜 → 양력 생일(또는 오류 문구) */
  const resolved = useMemo((): { solar: { y: number; m: number; d: number } } | { error: string } | null => {
    if (!complete) return null
    let solar: { y: number; m: number; d: number } | null
    if (p.calendar === 'lunar') {
      if (!lunarSupported()) return { error: t('fortune.lunarUnsupported') }
      solar = lunarToSolar(y, m, d, p.leap)
      if (!solar) return { error: t('fortune.invalidLunar') }
    } else {
      if (!isValidSolar(y, m, d)) return { error: t('fortune.invalidDate') }
      solar = { y, m, d }
    }
    if (fmtYmd(solar) > fmtYmd(today)) return { error: t('fortune.futureDate') }
    return { solar }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, y, m, d, p.calendar, p.leap, t])
  const solar = resolved && 'solar' in resolved ? resolved.solar : null
  const age = solar ? ageOf(solar, today) : null
  const counterpart = solar
    ? p.calendar === 'lunar'
      ? t('fortune.solarIs', { date: fmtYmd(solar) })
      : (() => {
          const lu = solarToLunar(solar.y, solar.m, solar.d)
          return lu ? t('fortune.lunarIs', { date: `${fmtYmd(lu)}${lu.leap ? ` (${t('fortune.leap')})` : ''}` }) : ''
        })()
    : ''
  const maxDay = p.calendar === 'lunar' ? 30 : y && m ? daysIn(y, m) : 31
  const curKey = fortuneRecentKey({ ...p, date: dateStr, leap: p.calendar === 'lunar' && p.leap })

  const go = () => {
    if (!complete) return setErr(t('fortune.needDate'))
    if (resolved && 'error' in resolved) return setErr(resolved.error)
    if (!p.gender) return setErr(t('fortune.needGender'))
    const time = exact ? (/^\d{2}:\d{2}$/.test(p.time) ? p.time : '') : /^b:\d{1,2}$/.test(p.time) ? p.time : ''
    onSubmit({ ...p, date: dateStr, leap: p.calendar === 'lunar' && p.leap, time })
  }

  const recentLabel = (r: FortuneProfile) => r.name.trim() || (r.self ? t('fortune.me') : r.date.slice(2).replace(/-/g, '.'))

  return (
    <>
      <div className="mt-7 text-center">
        <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="leading-none">
          <Emoji e="🔮" size={28} className="align-top" />
        </motion.div>
        <h1 className="mt-3 break-keep text-[20px] font-extrabold leading-tight">{t('fortune.askTitle')}</h1>
        <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{t('fortune.askSub')}</p>
      </div>

      {/* 최근 본 사람 — 탭 한 번으로 그 사람 입력값을 채운다 */}
      {recent.length > 0 && (
        <div className="mt-5">
          <p className="text-[12px] font-extrabold text-ink-faint">{t('fortune.recent')}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recent.map((r) => {
              const k = fortuneRecentKey(r)
              const on = k === curKey
              return (
                <span
                  key={k}
                  className={`inline-flex items-center rounded-full border-2 text-[13px] font-extrabold transition-colors ${
                    on ? 'border-mind-400 bg-mind-100 text-mind-700' : 'border-line bg-surface text-ink'
                  }`}
                >
                  <button type="button" onClick={() => load(r)} aria-pressed={on} className="min-h-[36px] py-1 pl-3 pr-1">
                    {recentLabel(r)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveRecent(k)}
                    aria-label={l({ ko: `${recentLabel(r)} 지우기`, en: `Remove ${recentLabel(r)}`, ja: `${recentLabel(r)}を削除` })}
                    className="flex min-h-[36px] min-w-[32px] items-center justify-center pr-2 text-[13px] text-ink-faint"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="break-keep text-[12px] font-bold leading-relaxed text-ink-sub">{t('fortune.otherHint')}</p>
          <button type="button" onClick={clearForOther} className="min-h-[44px] shrink-0 rounded-xl px-2 text-[13px] font-extrabold text-mind-700">
            {t('fortune.otherPerson')}
          </button>
        </div>

        {/* 이름 */}
        <label htmlFor="fx-name" className="mt-3 block text-[13px] font-extrabold">
          {t('fortune.nameLabel')} <span className="font-bold text-ink-faint">({t('fortune.optional')})</span>
        </label>
        <input
          id="fx-name"
          ref={nameRef}
          value={p.name}
          maxLength={12}
          placeholder={t('fortune.namePh')}
          onChange={(e) => patch({ name: e.target.value })}
          className={`mt-2 ${inputCls}`}
        />

        {/* 성별 */}
        <p className="mt-4 text-[13px] font-extrabold">{t('fortune.genderLabel')}</p>
        <div className="mt-2">
          <Seg
            label={t('fortune.genderLabel')}
            value={p.gender}
            onChange={(v) => patch({ gender: v })}
            options={[{ v: 'f', label: t('fortune.female') }, { v: 'm', label: t('fortune.male') }]}
          />
        </div>

        {/* 생년월일 */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-[13px] font-extrabold">{t('fortune.birthLabel')}</p>
          <div className="w-[148px]">
            <Seg
              label={`${t('fortune.solar')}/${t('fortune.lunar')}`}
              value={p.calendar}
              onChange={(v) => patch({ calendar: v, leap: v === 'lunar' ? p.leap : false })}
              options={[{ v: 'solar', label: t('fortune.solar') }, { v: 'lunar', label: t('fortune.lunar') }]}
            />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-[1.35fr_1fr_1fr] gap-1.5">
          <select aria-label={t('fortune.year')} value={ys} onChange={(e) => { setYs(e.target.value); setErr('') }} className={selectCls}>
            <option value="">{t('fortune.year')}</option>
            {Array.from({ length: thisYear - 1920 + 1 }, (_, i) => thisYear - i).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select aria-label={t('fortune.month')} value={ms} onChange={(e) => { setMs(e.target.value); setErr('') }} className={selectCls}>
            <option value="">{t('fortune.month')}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select aria-label={t('fortune.day')} value={ds} onChange={(e) => { setDs(e.target.value); setErr('') }} className={selectCls}>
            <option value="">{t('fortune.day')}</option>
            {Array.from({ length: Math.max(maxDay, d || 0) }, (_, i) => i + 1).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        {p.calendar === 'lunar' && (
          <label className="mt-2 flex min-h-[44px] items-center gap-2 text-[13px] font-extrabold">
            <input type="checkbox" checked={p.leap} onChange={(e) => patch({ leap: e.target.checked })} className="h-5 w-5 accent-[#4FA882]" />
            {t('fortune.leap')}
          </label>
        )}
        {age && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.snap} className="mt-2 text-[12px] font-bold text-ink-sub" data-testid="fortune-age">
            {t('fortune.age', age)}
            {counterpart ? ` · ${counterpart}` : ''}
          </motion.p>
        )}

        {/* 태어난 시간 */}
        <label htmlFor="fx-time" className="mt-4 block text-[13px] font-extrabold">
          {t('fortune.timeLabel')} <span className="font-bold text-ink-faint">({t('fortune.optional')})</span>
        </label>
        <div className={`mt-2 grid gap-1.5 ${exact ? 'grid-cols-[1.4fr_1fr]' : 'grid-cols-1'}`}>
          <select
            id="fx-time"
            value={exact ? 'exact' : p.time}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'exact') {
                setExact(true)
                patch({ time: '' })
              } else {
                setExact(false)
                patch({ time: v })
              }
            }}
            className={selectCls}
          >
            <option value="">{t('fortune.timeUnknown')}</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={`b:${i}`}>{fmtTime(`b:${i}`, lang, '')}</option>
            ))}
            <option value="exact">{t('fortune.timeExact')}</option>
          </select>
          {exact && (
            <input
              type="time"
              aria-label={t('fortune.timeExact')}
              value={p.time}
              onChange={(e) => patch({ time: e.target.value })}
              className={inputCls}
            />
          )}
        </div>
        <p className="mt-2 text-[11px] font-bold leading-relaxed text-ink-faint">{t('fortune.timeHint')}</p>

        <label className="mt-3 flex min-h-[44px] items-center gap-2 text-[13px] font-extrabold">
          <input type="checkbox" checked={p.self} onChange={(e) => patch({ self: e.target.checked })} className="h-5 w-5 accent-[#4FA882]" />
          {t('fortune.isMe')}
        </label>

        <div className="mt-3">
          <Button color="mind" size="lg" onClick={go}>
            {t('fortune.see')}
          </Button>
        </div>
        {err && (
          <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.snap} className="mt-2 text-center text-[13px] font-extrabold text-[#D9401F]">
            {err}
          </motion.p>
        )}
        <p className="mt-2 text-[11px] font-bold leading-relaxed text-ink-faint">{t('fortune.birthHint')}</p>
      </Card>

      {!complete && <ZodiacTaste />}
    </>
  )
}

/** 생일 입력 전에도 즉시 가치 — 띠만 골라 오늘의 기운 맛보기(zodiacTodayLines는 생일 불필요) */
function ZodiacTaste() {
  const t = useT()
  const l = useL()
  const zTaste = useMemo(() => zodiacTodayLines(todayYmd()).map((z) => ({ emoji: z.zodiacEmoji, zo: z.zodiacKo, line: z.line })), [])
  const [pick, setPick] = useState<number | null>(null)
  return (
    <Card className="mt-4">
      <p className="text-[13px] font-extrabold">
        <EmojiText text={l({ ko: '🐾 먼저 띠로 3초 맛보기', en: '🐾 Quick taste by zodiac', ja: '🐾 まず干支で3秒お試し' })} />
      </p>
      <div className="mt-2.5 grid grid-cols-6 gap-1.5">
        {zTaste.map((z, i) => (
          <button
            key={z.zo}
            onClick={() => setPick(i)}
            aria-label={z.zo}
            className="flex aspect-square items-center justify-center rounded-2xl border-2"
            style={{
              borderColor: pick === i ? '#6B4FB8' : 'rgb(var(--line))',
              background: pick === i ? '#6B4FB816' : 'rgb(var(--surface))',
            }}
          >
            <Emoji e={z.emoji} size={24} />
          </button>
        ))}
      </div>
      {pick !== null && zTaste[pick] && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.ui} className="mt-3 rounded-2xl bg-surface2 px-4 py-3">
          <p className="break-keep text-[13px] font-bold leading-relaxed">
            {zTaste[pick].emoji} <b>{zTaste[pick].zo}{t('fortune.zodiacSuffix')}</b> · {l(zTaste[pick].line)}
          </p>
          <p className="mt-1.5 break-keep text-[11px] font-bold text-ink-faint">
            {l({ ko: '위에 생년월일을 넣으면 사주팔자로 훨씬 자세해져요', en: 'Add a birthday above for a much more detailed reading', ja: '上に生年月日を入れると四柱推命でより詳しく' })}
          </p>
        </motion.div>
      )}
    </Card>
  )
}

/** 결과 상단 — 사주팔자 표 · 오행 분포/일간 강약 · 오늘 일진과의 관계 */
function SajuCards({
  chart,
  analysis,
  fortune,
  solarText,
  lunarText,
  age,
  timeText,
}: {
  chart: ReturnType<typeof chartOf>
  analysis: ReturnType<typeof analysisOf>
  fortune: ReturnType<typeof fortuneOf>
  solarText: string
  lunarText: string
  age: { man: number; korean: number }
  timeText: string
}) {
  const t = useT()
  const l = useL()
  const cols: { key: 'hour' | 'day' | 'month' | 'year'; label: string; p: Pillar | null }[] = [
    { key: 'hour', label: t('fortune.pillarHour'), p: chart.hour },
    { key: 'day', label: t('fortune.pillarDay'), p: chart.day },
    { key: 'month', label: t('fortune.pillarMonth'), p: chart.month },
    { key: 'year', label: t('fortune.pillarYear'), p: chart.year },
  ]
  const cell = (hj: string, ko: string, el: El | null, me = false) => (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 py-2 ${el ? '' : 'border-dashed border-line'}`}
      style={el ? { background: `${EL_HEX[el]}1F`, borderColor: me ? EL_HEX[el] : `${EL_HEX[el]}55` } : undefined}
    >
      <span className={`text-[20px] font-extrabold leading-none ${el ? '' : 'text-ink-faint'}`}>{hj}</span>
      <span className="mt-1 text-[11px] font-bold text-ink-sub">{el ? `${ko} · ${l(EL_NAMES[el]).replace(/\(.*\)/, '')}` : ko}</span>
    </div>
  )
  const { counts, total } = analysis.elements
  const maxCount = Math.max(1, ...ELS.map((e) => counts[e]))
  const st = STRENGTH_LINES[analysis.strength.strength]
  const tg = TEN_GOD_LINES[fortune.tenGod]
  const notes: string[] = []
  if (fortune.stemRel === 'hap') notes.push(l(REL_NOTES.stemHap))
  if (fortune.stemRel === 'chung') notes.push(l(REL_NOTES.stemChung))
  for (const r of fortune.branchRels) notes.push(l(REL_NOTES[r.kind]).replace('{pos}', l(PILLAR_POS[r.pos])))
  if (!notes.length) notes.push(l(REL_NOTES.none))

  return (
    <>
      {/* 사주팔자 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.ui, delay: 0.05 }} data-testid="fortune-pillars">
        <Card className="mt-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-extrabold">{t('fortune.pillarsTitle')}</h2>
            <span className="text-[12px] font-bold text-ink-faint">{t('fortune.age', age)}</span>
          </div>
          <p className="mt-1 break-keep text-[12px] font-bold leading-relaxed text-ink-sub">
            {t('fortune.solarIs', { date: solarText })}
            {lunarText ? ` · ${t('fortune.lunarIs', { date: lunarText })}` : ''} · {timeText}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {cols.map((c) => (
              <div key={c.key} className="flex flex-col gap-1.5">
                <p className={`text-center text-[11px] font-extrabold ${c.key === 'day' ? 'text-mind-700' : 'text-ink-faint'}`}>
                  {c.label}{c.key === 'day' ? ' ★' : ''}
                </p>
                {c.p ? cell(STEM_HJ[c.p.stem], STEM_KO[c.p.stem], STEM_EL[c.p.stem], c.key === 'day') : cell('?', t('fortune.timeUnknown'), null)}
                {c.p ? cell(BRANCH_HJ[c.p.branch], BRANCH_KO[c.p.branch], BRANCH_EL[c.p.branch]) : cell('?', t('fortune.timeUnknown'), null)}
              </div>
            ))}
          </div>
          {chart.nearTerm && <p className="mt-2.5 break-keep text-[11px] font-bold leading-relaxed text-ink-faint">{t('fortune.nearTerm')}</p>}
        </Card>
      </motion.div>

      {/* 오행 분포 · 일간 강약 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.ui, delay: 0.1 }}>
        <Card className="mt-3">
          <h2 className="text-[15px] font-extrabold">{t('fortune.elementsTitle')}</h2>
          <div className="mt-2.5 space-y-2">
            {ELS.map((e) => (
              <div key={e} className="flex items-center gap-2.5">
                <span className="w-[64px] shrink-0 text-[12px] font-extrabold">{l(EL_NAMES[e])}</span>
                <div className="min-w-0 flex-1">
                  <ProgressBar value={counts[e] / maxCount} color={EL_HEX[e]} />
                </div>
                <span className={`w-[28px] shrink-0 text-right text-[12px] font-extrabold ${counts[e] ? '' : 'text-ink-faint'}`}>
                  {counts[e]}/{total}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-surface2 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] font-extrabold text-ink-sub">{t('fortune.strengthTitle')}</span>
              <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700">{l(st.label)}</span>
            </div>
            <p className="mt-1.5 break-keep text-[13px] font-bold leading-relaxed">{l(st.line)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] font-extrabold text-ink-sub">{t('fortune.helpfulEls')}</span>
              {analysis.strength.favorable.map((e) => (
                <span key={e} className="rounded-full px-2 py-0.5 text-[11px] font-extrabold" style={{ background: `${EL_HEX[e]}26` }}>
                  {l(EL_NAMES[e])}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 오늘 일진과 나 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.ui, delay: 0.15 }}>
        <Card className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-extrabold">{t('fortune.todayRel')}</h2>
            <span className="rounded-full bg-mind-100 px-2 py-0.5 text-[11px] font-extrabold text-mind-700">
              {fortune.todayIljuKo}{l({ ko: '일', en: ' day', ja: '日' })} · {fortune.tenGod}
            </span>
          </div>
          <p className="mt-2 text-[14px] font-extrabold">{l(tg.title)}</p>
          <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink">{l(tg.line)}</p>
          <ul className="mt-2.5 space-y-1.5">
            {notes.map((n, i) => (
              <li key={i} className="break-keep rounded-2xl bg-surface2 px-3 py-2 text-[12px] font-bold leading-relaxed text-ink-sub">
                {n}
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </>
  )
}
