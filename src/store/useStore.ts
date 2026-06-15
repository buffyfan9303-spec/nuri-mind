import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

/** 운영자 PIN — 배포 전 반드시 변경 (실서비스는 Supabase Auth 권장) */
const OPERATOR_PIN = '5690'
/** 검사 첫 완료 보상 (1회성 — 일일 상한 제외) */
export const TEST_REWARD = 30
/** 일일 "무료 적립" 상한 — 출석·퀴즈·랜덤박스·공유 합산 (수익성 분석 §④ 권고치) */
export const DAILY_FREE_CAP = 50
/** 스트릭 프리즈 가격/보유 한도 */
export const FREEZE_COST = 300
export const FREEZE_MAX = 3

const dayStr = (offset = 0) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10)
const today = () => dayStr(0)
const yesterday = () => dayStr(1)

const genCode = () => 'NURI-' + Math.random().toString(36).slice(2, 6).toUpperCase()

interface State {
  lang: Lang
  sound: boolean
  ambient: boolean
  fontScale: number
  notify: boolean
  nickname: string
  avatar: Avatar
  deviceId: string
  posts: CommunityPost[]
  comments: Record<string, CommunityComment[]>
  reports: Report[]
  hiddenPosts: string[]
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

  setLang: (l: Lang) => void
  setSound: (v: boolean) => void
  setAmbient: (v: boolean) => void
  setFontScale: (v: number) => void
  setNotify: (v: boolean) => void
  setNickname: (n: string) => void
  setAvatar: (a: Avatar) => void
  addPost: (text: string, badge?: string) => void
  likePost: (id: string) => void
  deletePost: (id: string) => void
  addComment: (postId: string, text: string, badge?: string) => void
  reportPost: (postId: string, nick: string, excerpt: string, reason: string) => void
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
  shareReward: (resultId: string) => number
  buyFreeze: () => boolean
  redeemCode: (code: string) => 'ok' | 'invalid' | 'mine' | 'used'
  ensureLeague: () => void
  clearLeagueMsg: () => void
  completeVibe: (pct: number) => number
  unlockAi: (resultId: string) => void
  unlockAdmin: (pin: string) => boolean
  lockAdmin: () => void
  resetAll: () => void
}

const initial = () => ({
  lang: 'ko' as Lang,
  sound: true,
  ambient: false,
  fontScale: 1,
  notify: false,
  nickname: '누리',
  avatar: null as Avatar,
  deviceId: uid('dev_'),
  posts: SEED_POSTS,
  comments: {} as Record<string, CommunityComment[]>,
  reports: [] as Report[],
  hiddenPosts: [] as string[],
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
})

export const useStore = create<State>()(
  persist(
    (set, get) => {
      /** 일일 무료 적립 잔여량 */
      const freeLeft = (): number => {
        const s = get()
        return s.freeDate === today() ? Math.max(0, DAILY_FREE_CAP - s.freeAmount) : DAILY_FREE_CAP
      }
      /** 상한 내에서 적립 — 실제 지급액 반환 */
      const grantFree = (amount: number, memo: string): number => {
        const granted = Math.min(amount, freeLeft())
        if (granted <= 0) return 0
        const s = get()
        const t = today()
        set({
          points: s.points + granted,
          freeDate: t,
          freeAmount: (s.freeDate === t ? s.freeAmount : 0) + granted,
          ledger: [{ id: uid('lg_'), amount: granted, memo, at: Date.now() }, ...s.ledger],
        })
        return granted
      }

      return {
        ...initial(),

        setLang: (lang) => set({ lang }),
        setSound: (sound) => {
          setSoundEnabled(sound)
          set({ sound })
        },
        setAmbient: (ambient) => set({ ambient }),
        setFontScale: (fontScale) => set({ fontScale: Math.min(1.3, Math.max(0.9, fontScale)) }),
        setNotify: (notify) => set({ notify }),
        setNickname: (nickname) => set({ nickname: nickname.slice(0, 12) || '누리' }),
        setAvatar: (avatar) => set({ avatar }),

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
            ledger: [{ id: uid('lg_'), amount: 20, memo: '✍️ 커뮤니티 첫 글 보상', at: Date.now() }, ...s.ledger],
          })
          return 20
        },
        /** 첫 댓글 +10P (1회성) */
        claimFirstComment: () => {
          const s = get()
          if (s.firstCommentDone) return 0
          set({
            firstCommentDone: true,
            points: s.points + 10,
            ledger: [{ id: uid('lg_'), amount: 10, memo: '💬 커뮤니티 첫 댓글 보상', at: Date.now() }, ...s.ledger],
          })
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
          grantFree(bonus, `📅 출석 체크 (${streak}일 연속)${usedFreeze ? ' · ❄️ 프리즈 사용' : ''}`)
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
              ? [{ id: uid('lg_'), amount: reward, memo: '🧠 검사 완료 보상', at: Date.now() }, ...s.ledger]
              : s.ledger,
          })
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
            ledger: [{ id: uid('lg_'), amount: sv.reward, memo: `${sv.emoji} 설문 참여: ${sv.title}`, at: Date.now() }, ...s.ledger],
          })
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
            ledger: [{ id: uid('lg_'), amount: -item.cost, memo: `${item.emoji} 교환 신청: ${name}`, at: Date.now() }, ...s.ledger],
          })
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
              : [{ id: uid('lg_'), amount: rd.cost, memo: `↩️ 교환 반려 환불: ${rd.itemName}`, at: Date.now() }, ...s.ledger],
          })
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
          const granted = grantFree(rolled, `🎁 랜덤박스 ${viaAd ? '(광고 보너스) ' : ''}+${rolled}P 당첨`)
          return { rolled, granted }
        },

        /** 데일리 퀴즈 — 하루 1회 시도, 정답 시 +5P */
        answerQuiz: (correct) => {
          const s = get()
          if (s.lastQuizDate === today()) return 0
          set({ lastQuizDate: today() })
          return correct ? grantFree(5, '🧠 데일리 심리 퀴즈 정답') : 0
        },

        /** 결과 공유 보상 — 결과당 1회 +5P */
        shareReward: (resultId) => {
          const s = get()
          if (s.sharedResults.includes(resultId)) return 0
          set({ sharedResults: [...s.sharedResults, resultId] })
          return grantFree(5, '📤 결과 카드 공유 보상')
        },

        /** 스트릭 프리즈 구매 — 즉시 지급 디지털 아이템 */
        buyFreeze: () => {
          const s = get()
          if (s.points < FREEZE_COST || s.streakFreezes >= FREEZE_MAX) return false
          set({
            points: s.points - FREEZE_COST,
            streakFreezes: s.streakFreezes + 1,
            ledger: [{ id: uid('lg_'), amount: -FREEZE_COST, memo: '❄️ 스트릭 프리즈 구매', at: Date.now() }, ...s.ledger],
          })
          return true
        },

        /** 친구 코드 등록 — 1회, +30P (1회성이라 일일 상한 제외) */
        redeemCode: (code) => {
          const s = get()
          const up = code.trim().toUpperCase()
          if (!/^NURI-[A-Z0-9]{4,6}$/.test(up)) return 'invalid'
          if (up === s.referralCode) return 'mine'
          if (s.referredBy) return 'used'
          set({
            referredBy: up,
            points: s.points + 30,
            ledger: [{ id: uid('lg_'), amount: 30, memo: '🤝 친구 초대 코드 등록 보상', at: Date.now() }, ...s.ledger],
          })
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

        /** 바이브 테스트 완료 — 첫 완료 +10P (1회성, 일일 상한 제외) */
        completeVibe: (pct) => {
          const s = get()
          const first = !s.vibeDone
          set({
            vibeDone: true,
            vibePct: pct,
            points: first ? s.points + 10 : s.points,
            ledger: first
              ? [{ id: uid('lg_'), amount: 10, memo: '🔥 바이브 테스트 첫 완료', at: Date.now() }, ...s.ledger]
              : s.ledger,
          })
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

        resetAll: () => set({ ...initial() }),
      }
    },
    {
      name: 'nuri-mind-v1',
      onRehydrateStorage: () => (state) => {
        if (state) setSoundEnabled(state.sound)
      },
    },
  ),
)
