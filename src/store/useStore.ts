import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LEGAL_VERSION } from '../data/legal'
import type { FortuneDetailText } from '../lib/fortuneAi'
import type {
  Avatar,
  CommunityComment,
  CommunityPost,
  Report,
  ExperienceApplication,
  Lang,
  LedgerEntry,
  Redemption,
  ShopItem,
  Survey,
  SurveyQ,
  TestResult,
  TestId,
} from '../data/types'
import { SEED_SURVEYS, SEED_POSTS } from '../data/seed'
import { lifetimeOf, tierAtLeast } from '../data/rank'
import { botsFor, myRank, myWeekPoints, weekKeyOf } from '../lib/league'
import { uid } from '../lib/random'
import { setSoundEnabled } from '../lib/sound'
import { track } from '../lib/analytics'
import { moderateText } from '../lib/moderation'
import { claimDiamondGrantsServer } from '../lib/diamonds'
import { mirrorEarn, mirrorSpend, initEconomySync } from '../lib/economy'
import { createSettingsSlice } from './slices/settingsSlice'

/** 운영자 PIN — 배포 전 반드시 변경 (실서비스는 Supabase Auth 권장) */
const OPERATOR_PIN = '5690'
/** 검사 첫 완료 보상 (1회성 — 일일 상한 제외) */
export const TEST_REWARD = 20
/**
 * 일일 "무료 적립" 상한 — 사장님 요청으로 제한 제거(무제한). freeAmount는 '오늘 적립량' 추적용으로 유지.
 * ⚠️ 무제한 적립은 광고수익 대비 페이백이 커질 수 있어 서버 경제(v2-auth-economy) 전 어뷰징 모니터링 권장.
 */
export const DAILY_FREE_CAP = Infinity
/** 스트릭 프리즈 가격/보유 한도 */
export const FREEZE_COST = 300
export const FREEZE_MAX = 3

/* ── 다이아(유료 디지털 재화) — 1다이아 = 100원 ── */
/** 운세 종합: 매월 무료 3회, 이후 다이아 결제 */
export const FORTUNE_FREE_PER_MONTH = 3
export const FORTUNE_DIA_COST = 5
/** 오늘의 상세 운세 해제 비용(다이아) — 광고 시청 시 무료 */
export const FORTUNE_DETAIL_DIA_COST = 5
/** IQ 정밀검사 전체 해제(영구) */
export const IQ_DIA_COST = 10
/** 운영자 콘솔이 보이는 계정(닉네임 화이트리스트). 콘솔 진입은 PIN(5690)으로 2차 보호. */
export const OPERATOR_NICKS = ['누리', 'WTA']
/** 정밀검사(기억/집중/처리속도/공간) 상세분석 전체 해제 비용 */
export const PRECISION_DIA_COST = 10
/** 프리미엄 구독 — 월 5,900원(광고 제거·상세운세 무제한·전 정밀검사 해제) */
export const PREMIUM_KRW = 5900
export const PREMIUM_DAYS = 30
/** 프리미엄 활성 여부 — premiumUntil(만료 ms 타임스탬프)이 현재보다 미래면 true */
export const isPremium = (premiumUntil: number): boolean => premiumUntil > Date.now()
export interface DiaBundle {
  dia: number
  krw: number
  /** 정가 대비 할인율(%) — 표시용 */
  off?: number
  best?: boolean
}
/** 충전 번들 — 5개 10%↓, 10개 20%↓, 30개 25%↓ (PG 연동 후 실제 결제) */
export const DIA_BUNDLES: DiaBundle[] = [
  { dia: 1, krw: 100 },
  { dia: 5, krw: 450, off: 10 },
  { dia: 10, krw: 800, off: 20, best: true },
  { dia: 30, krw: 2250, off: 25 },
]

/** 전광판(확성기) 1회 게시 비용 — 1다이아(=100원). AI 필터 통과 시에만 노출. */
export const TICKER_COST = 1
export interface TickerMsg {
  id: string
  text: string
  nick: string
  at: number
}

// ⚠️ 날짜 키는 로컬 기준 — toISOString()은 UTC라 KST 하루 경계가 오전 9시로 밀림(리셋·과금 버그)
import { localDay, localDayOf, localMonth } from '../lib/date'
const dayStr = (offset = 0) => localDay(offset)
const today = () => dayStr(0)
const yesterday = () => dayStr(1)

const genCode = () => 'NURI-' + Math.random().toString(36).slice(2, 6).toUpperCase()

/** 원장 보관 상한 — 초과분 적립은 꼬리 합계 엔트리로 이월(누적 적립·등급 계산 보존, localStorage 무한 증식 방지) */
const LEDGER_CAP = 500
const withLedger = (ledger: LedgerEntry[], entry: LedgerEntry): LedgerEntry[] => {
  const list = [entry, ...ledger]
  if (list.length <= LEDGER_CAP) return list
  const cut = list.slice(LEDGER_CAP - 1)
  const earn = cut.reduce((a, e) => a + Math.max(0, e.amount), 0)
  const oldest = cut.reduce((a, e) => Math.min(a, e.at), Date.now())
  return [...list.slice(0, LEDGER_CAP - 1), { id: 'lg_carry', amount: earn, memo: '📦 이전 적립 합계(원장 자동 정리)', at: oldest }]
}

/** localStorage 예외(용량 초과·프라이빗 모드) 시 상태 변경 액션까지 죽지 않게 감싼 저장소 */
const safeLocal = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* QuotaExceeded 등 — 메모리 상태는 유지 */
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

interface State {
  lang: Lang
  sound: boolean
  ambient: boolean
  theme: 'light' | 'dark'
  fontScale: number
  notify: boolean
  nickname: string
  avatar: Avatar
  onboarded: boolean
  consent: { v: string; at: string } | null
  birthDate: string
  /** 다이아 잔액(유료 재화). 1다이아=100원 */
  diamonds: number
  /** 운세 종합 무료횟수 리셋 기준 월(YYYY-MM) */
  fortuneMonth: string
  fortuneFreeUses: number
  /** 오늘의 상세 운세를 해제한 날짜(YYYY-MM-DD) — 오늘과 같으면 해제 상태(하루 1회) */
  fortuneDetailDate: string
  /** AI 개인화 상세 운세 캐시(해당 날짜 1회 생성) */
  fortuneAiDate: string
  fortuneAiData: FortuneDetailText | null
  /** AI 상세 운세 캐시의 언어 — 불일치 시 캐시 미스로 간주(언어 전환 고착 방지) */
  fortuneAiLang: string
  /** IQ 정밀검사 전체 해제 여부(영구) */
  iqUnlocked: boolean
  /** 정밀검사 상세분석 💎 게이팅 on/off (운영자 토글) */
  precisionGate: boolean
  /** 정밀검사(기억/집중/처리속도/공간) 상세 전체 해제됨 */
  precisionUnlocked: boolean
  /** 프리미엄 구독 만료 타임스탬프(ms). 0=미구독. isPremium()로 활성 판정 */
  premiumUntil: number
  /** 전광판(확성기) 메시지 — 최신순 */
  tickerMsgs: TickerMsg[]
  deviceId: string
  posts: CommunityPost[]
  comments: Record<string, CommunityComment[]>
  reports: Report[]
  hiddenPosts: string[]
  /** 차단한 유저 닉네임 — 이 유저의 글/댓글을 피드에서 숨김(기기 단위) */
  blockedNicks: string[]
  firstPostDone: boolean
  firstCommentDone: boolean
  points: number
  streak: number
  lastCheckIn: string
  streakFreezes: number
  results: TestResult[]
  rewardedTests: TestId[]
  surveys: Survey[]
  takenSurveys: string[]
  ledger: LedgerEntry[]
  redemptions: Redemption[]
  applications: ExperienceApplication[]
  adminUnlocked: boolean
  /* 일일 무료 적립 상한 */
  freeDate: string
  freeAmount: number
  /* 데일리 콘텐츠 */
  lastSpinDate: string
  lastAdSpinDate: string
  lastQuizDate: string
  /** 오늘의 퀘스트 보너스를 받은 날짜(YYYY-MM-DD) */
  questClaimedDate: string
  moodLog: Record<string, number>
  challengeDate: string
  routineDone: Record<string, number[]>
  sharedResults: string[]
  /* 친구 초대 */
  referralCode: string
  referredBy: string
  invitedCount: number
  /* 주간 리그 */
  leagueWeek: string
  leagueTier: number
  leagueSeed: number
  leagueMsg: 'up' | 'down' | 'stay' | ''
  /* 바이럴 바이브 테스트 */
  vibeDone: boolean
  vibePct: number | null
  /* AI 정밀 분석 잠금 해제한 결과 id */
  aiReports: string[]
  aiReportText: Record<string, string>
  /* 매거진 정독 완료한 글 id(보상 1회) */
  readArticles: string[]

  setLang: (l: Lang) => void
  setSound: (v: boolean) => void
  setAmbient: (v: boolean) => void
  setTheme: (v: 'light' | 'dark') => void
  setFontScale: (v: number) => void
  setNotify: (v: boolean) => void
  setNickname: (n: string) => void
  setAvatar: (a: Avatar) => void
  completeOnboarding: (nickname: string, avatar: Avatar) => void
  acceptConsent: () => void
  setBirthDate: (d: string) => void
  addPost: (text: string, badge?: string) => void
  likePost: (id: string) => void
  deletePost: (id: string) => void
  addComment: (postId: string, text: string, badge?: string) => void
  reportPost: (postId: string, nick: string, excerpt: string, reason: string) => void
  /** 유저 차단 — 해당 닉네임의 글/댓글 숨김 */
  blockUser: (nick: string) => void
  /** 차단 해제 */
  unblockUser: (nick: string) => void
  resolveReport: (id: string, hide: boolean) => void
  claimFirstPost: () => number
  claimFirstComment: () => number
  freeRemaining: () => number
  checkIn: () => boolean
  addResult: (r: TestResult) => number
  submitSurvey: (s: { emoji: string; title: string; desc: string; questions: SurveyQ[]; reward: number; target: number }) => void
  takeSurvey: (id: string) => number
  approveSurvey: (id: string) => void
  rejectSurvey: (id: string, reason: string) => void
  redeem: (item: ShopItem, name: string) => boolean
  decideRedemption: (id: string, approve: boolean) => void
  applyExperience: (expId: string) => boolean
  decideApplication: (id: string, approve: boolean) => void
  spin: (viaAd: boolean) => { rolled: number; granted: number } | null
  answerQuiz: (correct: boolean) => number
  /** 오늘의 퀘스트(출석+퀴즈+검사 1개) 완료 보너스 +50P — 하루 1회 */
  claimDailyQuest: () => number
  setMood: (mood: number) => void
  toggleChallenge: () => void
  toggleRoutineDay: (testId: string, day: number) => void
  shareReward: (resultId: string) => number
  buyFreeze: () => boolean
  redeemCode: (code: string) => 'ok' | 'invalid' | 'mine' | 'used'
  ensureLeague: () => void
  clearLeagueMsg: () => void
  completeVibe: (pct: number) => number
  unlockAi: (resultId: string) => void
  setAiReportText: (id: string, text: string) => void
  /** 다이아 충전(결제 성공 후 호출) */
  addDiamonds: (n: number) => void
  /** 운영자 서버 지급분 수령(로그인 시) → 받은 다이아 합계. 없으면 0 */
  claimDiamonds: () => Promise<number>
  /** 다이아 차감 — 잔액 부족 시 false */
  spendDiamonds: (n: number) => boolean
  /** 운세 종합 열람 시도 — 'free'(월무료)·'dia'(차감)·'need'(잔액부족) */
  viewFortuneFull: () => 'free' | 'dia' | 'need'
  /** 오늘의 상세 운세 해제 표시(오늘 날짜로) — 광고 시청 또는 다이아 차감 후 호출 */
  markFortuneDetail: () => void
  /** AI 개인화 상세 운세 캐시 저장(날짜+데이터+언어) */
  setFortuneAi: (date: string, data: FortuneDetailText, lang: string) => void
  /** IQ 정밀검사 전체 해제(10다이아) — 부족 시 false */
  unlockIq: () => boolean
  /** 정밀검사 상세 게이팅 on/off (운영자) */
  setPrecisionGate: (v: boolean) => void
  /** 정밀검사 상세 전체 해제(10다이아) — 부족 시 false */
  unlockPrecision: () => boolean
  /** 프리미엄 구독(베타 즉시지급) — 30일 연장 + 정밀/IQ 즉시 해제 */
  subscribePremiumBeta: () => void
  /** 프리미엄 해지(테스트/환불용) — 즉시 만료 */
  cancelPremium: () => void
  /** 전광판 게시(1다이아) — 'ok'·'dia'(잔액부족)·'bad'(AI필터 차단) */
  postTicker: (text: string) => 'ok' | 'dia' | 'bad'
  readArticle: (id: string) => number
  unlockAdmin: (pin: string) => boolean
  lockAdmin: () => void
  resetAll: () => void
}

const initial = () => ({
  lang: 'ko' as Lang,
  sound: true,
  ambient: false,
  theme: 'light' as 'light' | 'dark',
  fontScale: 1,
  notify: false,
  nickname: '누리',
  avatar: null as Avatar,
  onboarded: false,
  consent: null as { v: string; at: string } | null,
  birthDate: '',
  diamonds: 0,
  fortuneMonth: '',
  fortuneFreeUses: 0,
  fortuneDetailDate: '',
  fortuneAiDate: '',
  fortuneAiData: null,
  fortuneAiLang: '',
  iqUnlocked: false,
  precisionGate: false,
  precisionUnlocked: false,
  premiumUntil: 0,
  tickerMsgs: [
    { id: 'tk_s1', text: '🎉 검사 8종 올클리어 도전 중! 같이 하실 분?', nick: '누리', at: Date.now() - 5400000 },
    { id: 'tk_s2', text: '💪 오늘도 출석 도장 찍고 갑니다', nick: '민지', at: Date.now() - 3600000 },
    { id: 'tk_s3', text: '🔮 이번 달 종합 운세 대박이었음', nick: '하늘', at: Date.now() - 1800000 },
  ] as TickerMsg[],
  deviceId: uid('dev_'),
  posts: SEED_POSTS,
  comments: {} as Record<string, CommunityComment[]>,
  reports: [] as Report[],
  hiddenPosts: [] as string[],
  blockedNicks: [] as string[],
  firstPostDone: false,
  firstCommentDone: false,
  points: 100,
  streak: 0,
  lastCheckIn: '',
  streakFreezes: 0,
  results: [] as TestResult[],
  rewardedTests: [] as TestId[],
  surveys: SEED_SURVEYS,
  takenSurveys: [] as string[],
  ledger: [{ id: uid('lg_'), amount: 100, memo: '🎉 가입 환영 보너스', at: Date.now() }] as LedgerEntry[],
  redemptions: [] as Redemption[],
  applications: [] as ExperienceApplication[],
  adminUnlocked: false,
  freeDate: '',
  freeAmount: 0,
  lastSpinDate: '',
  lastAdSpinDate: '',
  lastQuizDate: '',
  questClaimedDate: '',
  moodLog: {} as Record<string, number>,
  challengeDate: '',
  routineDone: {} as Record<string, number[]>,
  sharedResults: [] as string[],
  referralCode: genCode(),
  referredBy: '',
  invitedCount: 0,
  leagueWeek: '',
  leagueTier: 0,
  leagueSeed: Math.floor(Math.random() * 1e9),
  leagueMsg: '' as const,
  vibeDone: false,
  vibePct: null,
  aiReports: [] as string[],
  aiReportText: {} as Record<string, string>,
  readArticles: [] as string[],
})

export const useStore = create<State>()(
  persist(
    (set, get) => {
      /** 일일 무료 적립 잔여량 */
      const freeLeft = (): number => {
        const s = get()
        return s.freeDate === today() ? Math.max(0, DAILY_FREE_CAP - s.freeAmount) : DAILY_FREE_CAP
      }
      /** 상한 내에서 적립 — 실제 지급액 반환. reasonKey는 서버 미러 중복 차단 키(일일 보상은 날짜 포함) */
      const grantFree = (amount: number, memo: string, reasonKey: string | null = null): number => {
        const granted = Math.min(amount, freeLeft())
        if (granted <= 0) return 0
        const s = get()
        const t = today()
        set({
          points: s.points + granted,
          freeDate: t,
          freeAmount: (s.freeDate === t ? s.freeAmount : 0) + granted,
          ledger: withLedger(s.ledger, { id: uid('lg_'), amount: granted, memo, at: Date.now() }),
        })
        mirrorEarn(granted, memo, reasonKey)
        return granted
      }

      return {
        ...initial(),

        // ── 설정/계정 슬라이스(분리 적용) — 동작·필드 100% 동일 ──
        ...createSettingsSlice(set),

        addPost: (text, badge) => {
          const body = text.trim().slice(0, 280)
          if (!body) return
          const s = get()
          const post: CommunityPost = {
            id: uid('po_'),
            nick: s.nickname,
            avatar: s.avatar,
            badge,
            text: body,
            likes: 0,
            liked: false,
            mine: true,
            at: Date.now(),
          }
          set({ posts: [post, ...s.posts].slice(0, 200) })
        },
        likePost: (id) =>
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
            ),
          })),
        deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),

        addComment: (postId, text, badge) => {
          const body = text.trim().slice(0, 200)
          if (!body) return
          const s = get()
          const c: CommunityComment = {
            id: uid('cm_'),
            postId,
            nick: s.nickname,
            avatar: s.avatar,
            badge,
            text: body,
            at: Date.now(),
            mine: true,
          }
          set({ comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), c] } })
        },

        reportPost: (postId, nick, excerpt, reason) => {
          const s = get()
          if (s.reports.some((r) => r.postId === postId && !r.resolved)) return
          set({
            reports: [
              { id: uid('rp_'), postId, nick, excerpt: excerpt.slice(0, 60), reason, at: Date.now(), resolved: false },
              ...s.reports,
            ],
          })
        },
        blockUser: (nick) =>
          set((s) => (s.blockedNicks.includes(nick) ? s : { blockedNicks: [...s.blockedNicks, nick] })),
        unblockUser: (nick) => set((s) => ({ blockedNicks: s.blockedNicks.filter((n) => n !== nick) })),
        resolveReport: (id, hide) =>
          set((s) => {
            const rep = s.reports.find((r) => r.id === id)
            return {
              reports: s.reports.map((r) => (r.id === id ? { ...r, resolved: true } : r)),
              hiddenPosts: hide && rep ? [...new Set([...s.hiddenPosts, rep.postId])] : s.hiddenPosts,
            }
          }),

        /** 첫 글 +20P (1회성, 일일 상한 제외) */
        claimFirstPost: () => {
          const s = get()
          if (s.firstPostDone) return 0
          set({
            firstPostDone: true,
            points: s.points + 20,
            ledger: withLedger(s.ledger, { id: uid('lg_'), amount: 20, memo: '✍️ 커뮤니티 첫 글 보상', at: Date.now() }),
          })
          mirrorEarn(20, '✍️ 커뮤니티 첫 글 보상', 'first_post')
          return 20
        },
        /** 첫 댓글 +10P (1회성) */
        claimFirstComment: () => {
          const s = get()
          if (s.firstCommentDone) return 0
          set({
            firstCommentDone: true,
            points: s.points + 10,
            ledger: withLedger(s.ledger, { id: uid('lg_'), amount: 10, memo: '💬 커뮤니티 첫 댓글 보상', at: Date.now() }),
          })
          mirrorEarn(10, '💬 커뮤니티 첫 댓글 보상', 'first_comment')
          return 10
        },

        freeRemaining: () => freeLeft(),

        /** 출석 래더: 10P + 연속일 보너스(+2/일, 최대 +10) + 실버 등급 +2 / 프리즈로 하루 공백 보호 */
        checkIn: () => {
          const s = get()
          if (s.lastCheckIn === today()) return false
          let streak = 1
          let usedFreeze = false
          if (s.lastCheckIn === yesterday()) {
            streak = s.streak + 1
          } else if (s.lastCheckIn === dayStr(2) && s.streakFreezes > 0) {
            streak = s.streak + 1
            usedFreeze = true
          }
          const silver = tierAtLeast(lifetimeOf(s.ledger), 'silver')
          const bonus = 10 + 2 * Math.min(streak - 1, 5) + (silver ? 2 : 0)
          set({
            lastCheckIn: today(),
            streak,
            streakFreezes: usedFreeze ? s.streakFreezes - 1 : s.streakFreezes,
          })
          grantFree(bonus, `📅 출석 체크 (${streak}일 연속)${usedFreeze ? ' · ❄️ 복구권 사용' : ''}`, `checkin:${today()}`)
          return true
        },

        addResult: (r) => {
          const s = get()
          const first = !s.rewardedTests.includes(r.testId)
          const reward = first ? TEST_REWARD : 0
          set({
            results: [r, ...s.results].slice(0, 100),
            rewardedTests: first ? [...s.rewardedTests, r.testId] : s.rewardedTests,
            points: s.points + reward,
            ledger: first
              ? withLedger(s.ledger, { id: uid('lg_'), amount: reward, memo: '🧠 검사 완료 보상', at: Date.now() })
              : s.ledger,
          })
          if (first) mirrorEarn(reward, '🧠 검사 완료 보상', `test_complete:${r.testId}`)
          track('test_complete', { test: r.testId, first })
          return reward
        },

        submitSurvey: (data) => {
          const s = get()
          const survey: Survey = {
            id: uid('sv_'),
            ...data,
            responses: 0,
            status: 'pending',
            mine: true,
            createdAt: Date.now(),
          }
          set({ surveys: [survey, ...s.surveys] })
        },

        takeSurvey: (id) => {
          const s = get()
          if (s.takenSurveys.includes(id)) return 0
          const sv = s.surveys.find((x) => x.id === id)
          if (!sv || sv.status !== 'approved') return 0
          set({
            takenSurveys: [...s.takenSurveys, id],
            surveys: s.surveys.map((x) => (x.id === id ? { ...x, responses: x.responses + 1 } : x)),
            points: s.points + sv.reward,
            ledger: withLedger(s.ledger, { id: uid('lg_'), amount: sv.reward, memo: `${sv.emoji} 설문 참여: ${sv.title}`, at: Date.now() }),
          })
          mirrorEarn(sv.reward, `${sv.emoji} 설문 참여: ${sv.title}`, `survey:${id}`)
          track('survey_complete', { reward: sv.reward })
          return sv.reward
        },

        approveSurvey: (id) =>
          set((s) => ({
            surveys: s.surveys.map((x) => (x.id === id ? { ...x, status: 'approved' as const } : x)),
          })),

        rejectSurvey: (id, reason) =>
          set((s) => ({
            surveys: s.surveys.map((x) =>
              x.id === id ? { ...x, status: 'rejected' as const, rejectReason: reason } : x,
            ),
          })),

        redeem: (item, name) => {
          const s = get()
          if (s.points < item.cost) return false
          set({
            points: s.points - item.cost,
            redemptions: [
              { id: uid('rd_'), itemName: name, emoji: item.emoji, cost: item.cost, status: 'pending', at: Date.now() },
              ...s.redemptions,
            ],
            ledger: withLedger(s.ledger, { id: uid('lg_'), amount: -item.cost, memo: `${item.emoji} 교환 신청: ${name}`, at: Date.now() }),
          })
          mirrorSpend(item.cost, `${item.emoji} 교환 신청: ${name}`)
          return true
        },

        decideRedemption: (id, approve) => {
          const s = get()
          const rd = s.redemptions.find((x) => x.id === id)
          if (!rd) return
          set({
            redemptions: s.redemptions.map((x) =>
              x.id === id ? { ...x, status: approve ? ('approved' as const) : ('rejected' as const) } : x,
            ),
            points: approve ? s.points : s.points + rd.cost,
            ledger: approve
              ? s.ledger
              : withLedger(s.ledger, { id: uid('lg_'), amount: rd.cost, memo: `↩️ 교환 반려 환불: ${rd.itemName}`, at: Date.now() }),
          })
          if (!approve) mirrorEarn(rd.cost, `↩️ 교환 반려 환불: ${rd.itemName}`, `refund:${id}`)
        },

        applyExperience: (expId) => {
          const s = get()
          if (s.applications.some((a) => a.expId === expId)) return false
          set({
            applications: [{ id: uid('ap_'), expId, status: 'pending', at: Date.now() }, ...s.applications],
          })
          return true
        },

        decideApplication: (id, approve) =>
          set((s) => ({
            applications: s.applications.map((a) =>
              a.id === id ? { ...a, status: approve ? ('approved' as const) : ('rejected' as const) } : a,
            ),
          })),

        /** 랜덤박스 — 무료 1회/일 + 광고 시청 1회/일, 가중 랜덤 보상 */
        spin: (viaAd) => {
          const s = get()
          const t = today()
          if (viaAd ? s.lastAdSpinDate === t : s.lastSpinDate === t) return null
          if (freeLeft() <= 0) return null
          const r = Math.random()
          const rolled = r < 0.3 ? 3 : r < 0.55 ? 5 : r < 0.75 ? 8 : r < 0.88 ? 12 : r < 0.96 ? 20 : r < 0.99 ? 30 : 50
          set(viaAd ? { lastAdSpinDate: t } : { lastSpinDate: t })
          const granted = grantFree(rolled, `🎁 랜덤박스 ${viaAd ? '(광고 보너스) ' : ''}+${rolled}P 당첨`, `${viaAd ? 'spin_ad' : 'spin'}:${t}`)
          return { rolled, granted }
        },

        /** 데일리 퀴즈 — 하루 1회 시도, 정답 시 +5P */
        answerQuiz: (correct) => {
          const s = get()
          if (s.lastQuizDate === today()) return 0
          set({ lastQuizDate: today() })
          return correct ? grantFree(5, '🧠 데일리 심리 퀴즈 정답', `quiz:${today()}`) : 0
        },

        /** 오늘의 퀘스트 — 출석 + 데일리퀴즈 + 검사 1개 모두 완료 시 보너스 +50P(하루 1회) */
        claimDailyQuest: () => {
          const s = get()
          const t = today()
          if (s.questClaimedDate === t) return 0
          const tested = s.results.some((r) => localDayOf(r.at) === t)
          if (!(s.lastCheckIn === t && s.lastQuizDate === t && tested)) return 0
          set({ questClaimedDate: t })
          return grantFree(50, '🎯 오늘의 퀘스트 완료 보너스', `quest:${t}`)
        },

        /** 오늘 기분 기록 (보상 없음 — 자기 관찰 도구) */
        setMood: (mood) => set((s) => ({ moodLog: { ...s.moodLog, [today()]: mood } })),

        /** 오늘의 챌린지 완료 토글 (당일만) */
        toggleChallenge: () =>
          set((s) => ({ challengeDate: s.challengeDate === today() ? '' : today() })),

        /** 7일 루틴 — 특정 일차 완료 토글 */
        toggleRoutineDay: (testId, day) =>
          set((s) => {
            const cur = s.routineDone[testId] || []
            const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day]
            return { routineDone: { ...s.routineDone, [testId]: next } }
          }),

        /** 결과 공유 보상 — 결과당 1회 +5P */
        shareReward: (resultId) => {
          const s = get()
          track('share', { resultId })
          if (s.sharedResults.includes(resultId)) return 0
          set({ sharedResults: [...s.sharedResults, resultId] })
          return grantFree(5, '📤 결과 카드 공유 보상', `share:${resultId}`)
        },

        /** 스트릭 프리즈 구매 — 즉시 지급 디지털 아이템 */
        buyFreeze: () => {
          const s = get()
          if (s.points < FREEZE_COST || s.streakFreezes >= FREEZE_MAX) return false
          set({
            points: s.points - FREEZE_COST,
            streakFreezes: s.streakFreezes + 1,
            ledger: withLedger(s.ledger, { id: uid('lg_'), amount: -FREEZE_COST, memo: '❄️ 연속출석 복구권 구매', at: Date.now() }),
          })
          mirrorSpend(FREEZE_COST, '❄️ 연속출석 복구권 구매')
          return true
        },

        /** 친구 코드 입력 — 1회, +100P (신규 유입 LTV로 정당화 · 일일 상한 제외) */
        redeemCode: (code) => {
          const s = get()
          const up = code.trim().toUpperCase()
          if (!/^NURI-[A-Z0-9]{4,6}$/.test(up)) return 'invalid'
          if (up === s.referralCode) return 'mine'
          if (s.referredBy) return 'used'
          set({
            referredBy: up,
            points: s.points + 100,
            ledger: withLedger(s.ledger, { id: uid('lg_'), amount: 100, memo: '🤝 친구 초대 코드 입력 보상', at: Date.now() }),
          })
          // referrals.sql의 redeem_referral과 같은 키 — 어느 경로로든 서버 지급은 1회만
          mirrorEarn(100, '🤝 친구 초대 코드 입력 보상', 'referral_redeem')
          return 'ok'
        },

        /** 주차 변경 감지 → 지난주 정산(승급/강등) 후 새 시즌 시작 */
        ensureLeague: () => {
          const s = get()
          const wk = weekKeyOf()
          if (s.leagueWeek === wk) return
          if (!s.leagueWeek) {
            set({ leagueWeek: wk })
            return
          }
          const my = myWeekPoints(s.ledger, s.leagueWeek)
          const bots = botsFor(s.leagueWeek, s.leagueSeed, s.leagueTier, 'ko')
          const rank = myRank(my, bots)
          let tier = s.leagueTier
          let msg: State['leagueMsg'] = 'stay'
          if (rank <= 3 && tier < 3) {
            tier++
            msg = 'up'
          } else if (rank >= 8 && tier > 0) {
            tier--
            msg = 'down'
          }
          set({ leagueWeek: wk, leagueTier: tier, leagueSeed: Math.floor(Math.random() * 1e9), leagueMsg: msg })
        },

        clearLeagueMsg: () => set({ leagueMsg: '' }),

        unlockAi: (resultId) =>
          set((s) => (s.aiReports.includes(resultId) ? s : { aiReports: [...s.aiReports, resultId] })),
        setAiReportText: (id, text) => set((s) => ({ aiReportText: { ...s.aiReportText, [id]: text } })),

        addDiamonds: (n) => set((s) => ({ diamonds: s.diamonds + Math.max(0, Math.round(n)) })),
        /** 운영자 서버 지급분 수령 → 로컬 잔액에 1회 가산(서버가 claimed 처리해 중복 차단) */
        claimDiamonds: async () => {
          const got = await claimDiamondGrantsServer()
          if (got > 0) set((s) => ({ diamonds: s.diamonds + got }))
          return got
        },
        spendDiamonds: (n) => {
          const s = get()
          if (s.diamonds < n) return false
          set({ diamonds: s.diamonds - n })
          return true
        },
        /** 운세 종합 열람 — 월 무료 3회 → 이후 5다이아 차감 */
        viewFortuneFull: () => {
          const s = get()
          if (isPremium(s.premiumUntil)) return 'free' // 프리미엄 = 무제한 무료
          const m = localMonth()
          const used = s.fortuneMonth === m ? s.fortuneFreeUses : 0
          if (used < FORTUNE_FREE_PER_MONTH) {
            set({ fortuneMonth: m, fortuneFreeUses: used + 1 })
            return 'free'
          }
          if (s.diamonds >= FORTUNE_DIA_COST) {
            set({ diamonds: s.diamonds - FORTUNE_DIA_COST })
            return 'dia'
          }
          return 'need'
        },
        markFortuneDetail: () => set({ fortuneDetailDate: today() }),
        setFortuneAi: (date, data, lang) => set({ fortuneAiDate: date, fortuneAiData: data, fortuneAiLang: lang }),
        /** IQ 정밀검사 전체 해제 — 1회 10다이아(영구) */
        unlockIq: () => {
          const s = get()
          if (s.iqUnlocked) return true
          if (s.diamonds < IQ_DIA_COST) return false
          set({ diamonds: s.diamonds - IQ_DIA_COST, iqUnlocked: true })
          return true
        },
        setPrecisionGate: (v) => set({ precisionGate: v }),
        /** 정밀검사 상세 전체 해제 — 1회 10다이아(영구, 4종 공통) */
        unlockPrecision: () => {
          const s = get()
          if (s.precisionUnlocked) return true
          if (s.diamonds < PRECISION_DIA_COST) return false
          set({ diamonds: s.diamonds - PRECISION_DIA_COST, precisionUnlocked: true })
          return true
        },
        /**
         * 프리미엄 구독(베타: PG 연동 전 즉시지급) — 30일 연장.
         * ⚠️ iqUnlocked/precisionUnlocked 영구 플래그는 건드리지 않는다 — 구독 유래 해제는
         * 사용처에서 `|| isPremium(premiumUntil)`로 판정해야 해지/환불/만료 시 자동 회수된다.
         */
        subscribePremiumBeta: () => {
          const s = get()
          const base = Math.max(Date.now(), s.premiumUntil)
          set({ premiumUntil: base + PREMIUM_DAYS * 86400000 })
        },
        cancelPremium: () => set({ premiumUntil: 0 }),
        /** 전광판 게시 — AI 필터 통과 + 1다이아 차감 후 노출 */
        postTicker: (text) => {
          const s = get()
          const body = text.trim().slice(0, 60)
          if (!body) return 'bad'
          if (!moderateText(body).ok) return 'bad'
          if (s.diamonds < TICKER_COST) return 'dia'
          set({
            diamonds: s.diamonds - TICKER_COST,
            tickerMsgs: [{ id: uid('tk_'), text: body, nick: s.nickname, at: Date.now() }, ...s.tickerMsgs].slice(0, 30),
          })
          return 'ok'
        },

        /** 매거진 정독 보상 — 글당 1회 +8P(일일 무료 상한 적용) */
        readArticle: (id) => {
          const s = get()
          if (s.readArticles.includes(id)) return 0
          set({ readArticles: [...s.readArticles, id] })
          return grantFree(8, '📖 매거진 정독 보상', `read:${id}`)
        },

        /** 바이브 테스트 완료 — 첫 완료 +10P (1회성, 일일 상한 제외) */
        completeVibe: (pct) => {
          const s = get()
          const first = !s.vibeDone
          set({
            vibeDone: true,
            vibePct: pct,
            points: first ? s.points + 10 : s.points,
            ledger: first
              ? withLedger(s.ledger, { id: uid('lg_'), amount: 10, memo: '🔥 바이브 테스트 첫 완료', at: Date.now() })
              : s.ledger,
          })
          if (first) mirrorEarn(10, '🔥 바이브 테스트 첫 완료', 'vibe_first')
          return first ? 10 : 0
        },

        unlockAdmin: (pin) => {
          if (pin === OPERATOR_PIN) {
            set({ adminUnlocked: true })
            return true
          }
          return false
        },
        lockAdmin: () => set({ adminUnlocked: false }),

        /**
         * 전체 초기화 — 단, 유료 재화·영구 구매권·기기 신원은 보존한다.
         * 다이아 잔액은 로컬이 원본(서버 지급분은 이미 claimed 처리)이라 지우면 복구 불가이고,
         * deviceId/추천 관계를 재생성하면 서버 게시글 소유권·추천인 1회 제한이 깨진다.
         */
        resetAll: () => {
          const s = get()
          set({
            ...initial(),
            diamonds: s.diamonds,
            premiumUntil: s.premiumUntil,
            iqUnlocked: s.iqUnlocked,
            precisionUnlocked: s.precisionUnlocked,
            deviceId: s.deviceId,
            referralCode: s.referralCode,
            referredBy: s.referredBy,
            invitedCount: s.invitedCount,
          })
        },
      }
    },
    {
      name: 'nuri-mind-v1',
      version: 2,
      migrate: (persisted, version) => {
        const s = persisted as Partial<State> | undefined
        if (s) {
          // v1: 글자 크기 배율 100% 1회 정규화
          if (version < 1) s.fontScale = 1
          // v2: 기존 유저(검사기록 있거나 닉네임 바꾼)는 회원가입 건너뜀
          if (version < 2) s.onboarded = (s.results?.length ?? 0) > 0 || (!!s.nickname && s.nickname !== '누리')
        }
        return s as State
      },
      storage: createJSONStorage(() => safeLocal),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // 스냅샷 파싱 실패 — 기본값으로 덮어쓰기 전에 원본을 백업 키로 보존(복구 문의 대응)
          try {
            const raw = localStorage.getItem('nuri-mind-v1')
            if (raw) localStorage.setItem('nuri-mind-v1-corrupt', raw)
          } catch {
            /* ignore */
          }
        }
        if (state) setSoundEnabled(state.sound)
      },
    },
  ),
)

// ── 서버 경제 동기화(로그인 시) — 키 있는 아웃박스 미러 + 복원/이관(economy.ts 참조) ──
initEconomySync({
  getWallet: () => ({ points: useStore.getState().points }),
  restoreTo: (serverPoints, snapshotPoints) => {
    const s = useStore.getState()
    const next = serverPoints + (s.points - snapshotPoints) // 동기화 중 적립 드리프트 보존
    const diff = next - s.points
    useStore.setState({
      points: next,
      ledger:
        diff === 0
          ? s.ledger
          : withLedger(s.ledger, {
              id: uid('lg_'),
              amount: diff,
              memo: diff > 0 ? '☁️ 서버 지갑 복원' : '☁️ 서버 지갑 동기화(잔액 맞춤)',
              at: Date.now(),
            }),
    })
  },
  resetWallet: (points, memo) => {
    const s = useStore.getState()
    const diff = points - s.points
    useStore.setState({
      points,
      ledger: diff === 0 ? s.ledger : withLedger(s.ledger, { id: uid('lg_'), amount: diff, memo, at: Date.now() }),
    })
  },
})
