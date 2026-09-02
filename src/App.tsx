import { Suspense, useEffect, useRef } from 'react'
import { lazyWithReload } from './lib/lazyWithReload'
import { sweepScrollLocks } from './lib/scrollLock'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'
import ReConsent from './components/ReConsent'
import Skeleton from './components/Skeleton'
import InstallPrompt from './components/InstallPrompt'
import Home from './pages/Home'
import { useStore } from './store/useStore'
import { pageView } from './lib/analytics'

/** 라우트별 코드 스플리팅 — 첫 로딩엔 홈만 받고 나머지는 진입 시 로드 */
const TestIntro = lazyWithReload(() => import('./pages/TestIntro'))
const TestRun = lazyWithReload(() => import('./pages/TestRun'))
const MemoryRun = lazyWithReload(() => import('./pages/MemoryRun'))
const FocusRun = lazyWithReload(() => import('./pages/FocusRun'))
const SpeedRun = lazyWithReload(() => import('./pages/SpeedRun'))
const SpatialRun = lazyWithReload(() => import('./pages/SpatialRun'))
const SwitchRun = lazyWithReload(() => import('./pages/SwitchRun'))
const CogProfile = lazyWithReload(() => import('./pages/CogProfile'))
const Mailbox = lazyWithReload(() => import('./pages/Mailbox'))
const TestResult = lazyWithReload(() => import('./pages/TestResult'))
const Rewards = lazyWithReload(() => import('./pages/Rewards'))
const SurveyTake = lazyWithReload(() => import('./pages/SurveyTake'))
const SurveyCreate = lazyWithReload(() => import('./pages/SurveyCreate'))
const Shop = lazyWithReload(() => import('./pages/Shop'))
const Admin = lazyWithReload(() => import('./pages/Admin'))
const Profile = lazyWithReload(() => import('./pages/Profile'))
const Rank = lazyWithReload(() => import('./pages/Rank'))
const League = lazyWithReload(() => import('./pages/League'))
const Legal = lazyWithReload(() => import('./pages/Legal'))
const Community = lazyWithReload(() => import('./pages/Community'))
const Dex = lazyWithReload(() => import('./pages/Dex'))
const Chemi = lazyWithReload(() => import('./pages/Chemi'))
const QuickHub = lazyWithReload(() => import('./pages/QuickHub'))
const QuickTest = lazyWithReload(() => import('./pages/QuickTest'))
const Routine = lazyWithReload(() => import('./pages/Routine'))
const Magazine = lazyWithReload(() => import('./pages/Magazine'))
const Article = lazyWithReload(() => import('./pages/Article'))
const Insight = lazyWithReload(() => import('./pages/Insight'))
const Fortune = lazyWithReload(() => import('./pages/Fortune'))
const ZodiacLanding = lazyWithReload(() => import('./pages/ZodiacLanding'))
const Compat = lazyWithReload(() => import('./pages/Compat'))
const Charge = lazyWithReload(() => import('./pages/Charge'))
const Premium = lazyWithReload(() => import('./pages/Premium'))
const Duel = lazyWithReload(() => import('./pages/Duel'))
const SelfReport = lazyWithReload(() => import('./pages/SelfReport'))
const DeepReport = lazyWithReload(() => import('./pages/DeepReport'))
const GrowthPlan = lazyWithReload(() => import('./pages/GrowthPlan'))
const MbtiTest = lazyWithReload(() => import('./pages/MbtiTest'))

/** 가입 없이 볼 수 있는 공개 경로(SEO·공유 유입) — sitemap 등재 경로와 일치시킬 것 */
const PUBLIC_ROUTES = /^\/(legal|zodiac|magazine|vs)(\/|$)/

/**
 * 뒤로가기 스크롤 기억(홀덤에서 이식) — 경로별 마지막 scrollY. 모듈 스코프라 라우트 전환에도 살고, 새로고침이면 비운다.
 * PUSH(새 화면)는 늘 맨 위, POP(뒤로가기)만 읽던 자리로 — 목록에서 상세로 갔다 돌아왔는데 맨 위로 튕기면
 * '어디까지 봤지'를 사용자가 다시 찾아야 한다. 복원은 exit 애니메이션이 끝나 새 화면이 실제로 서 있을 때 한다.
 */
const scrollMemo = new Map<string, number>()

export default function App() {
  const location = useLocation()
  const navType = useNavigationType()
  const restoreY = useRef<number | null>(null)
  const fontScale = useStore((s) => s.fontScale)
  const onboarded = useStore((s) => s.onboarded)
  const theme = useStore((s) => s.theme)

  // 글자 크기: 루트 zoom으로 전체 UI 배율 조정
  useEffect(() => {
    ;(document.documentElement.style as unknown as { zoom: string }).zoom = String(fontScale)
  }, [fontScale])

  // 다크모드: 루트에 .dark 클래스 토글 (CSS 변수로 전체 색 전환)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const hideNav =
    !onboarded ||
    location.pathname.endsWith('/run') ||
    location.pathname.startsWith('/rewards/survey') ||
    location.pathname.startsWith('/rewards/create') ||
    location.pathname.startsWith('/admin')

  useEffect(() => {
    const remembered = navType === 'POP' ? scrollMemo.get(location.pathname) : undefined
    if (remembered === undefined) window.scrollTo(0, 0)
    else restoreY.current = remembered
    // 오버레이가 정리 함수 없이 사라진 경로 전환(딥링크·뒤로가기)에서 잠금이 남으면 앱 전체 스크롤이 죽는다
    sweepScrollLocks()
    pageView(location.pathname)
    const path = location.pathname
    // 정리 시점엔 이전 화면이 아직 exit 중이라 scrollY가 그 화면의 값이다
    return () => {
      scrollMemo.set(path, window.scrollY)
    }
    // navType은 pathname과 함께 바뀐다 — 단독 변화는 없다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])


  // 회원가입(온보딩) 전이면 입장 대신 가입 화면.
  // 단, 공개 경로(약관·SEO 랜딩·매거진·공유 결과)는 통과 — 검색 유입·크롤러·공유링크가
  // 가입 게이트에 막히면 sitemap 등재 URL이 전부 렌더되지 않는다.
  if (!onboarded && !PUBLIC_ROUTES.test(location.pathname)) return <Onboarding />

  return (
    // reducedMotion="user": 시스템 '동작 줄이기' 설정 시 framer 전체가 자동으로 이동/스케일 생략(접근성 정합 단일 스위치)
    <MotionConfig reducedMotion="user">
    <div className="mx-auto min-h-dvh max-w-2xl">
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          if (restoreY.current === null) return
          window.scrollTo(0, restoreY.current)
          restoreY.current = null
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.14, ease: 'easeIn' } }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<Skeleton />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/test/:id" element={<TestIntro />} />
              <Route path="/test/:id/run" element={<TestRun />} />
              <Route path="/memory/run" element={<MemoryRun />} />
              <Route path="/focus/run" element={<FocusRun />} />
              <Route path="/speed/run" element={<SpeedRun />} />
              <Route path="/spatial/run" element={<SpatialRun />} />
              <Route path="/switch/run" element={<SwitchRun />} />
              <Route path="/cog" element={<CogProfile />} />
              <Route path="/mail" element={<Mailbox />} />
              <Route path="/result/:rid" element={<TestResult />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/rewards/survey/:id" element={<SurveyTake />} />
              <Route path="/rewards/create" element={<SurveyCreate />} />
              <Route path="/community" element={<Community />} />
              <Route path="/dex" element={<Dex />} />
              <Route path="/chemi" element={<Chemi />} />
              <Route path="/quick" element={<QuickHub />} />
              <Route path="/quick/:id" element={<QuickTest />} />
              <Route path="/routine/:id" element={<Routine />} />
              <Route path="/magazine" element={<Magazine />} />
              <Route path="/magazine/:id" element={<Article />} />
              <Route path="/insight" element={<Insight />} />
              <Route path="/fortune" element={<Fortune />} />
              <Route path="/zodiac/:slug" element={<ZodiacLanding />} />
              <Route path="/compat" element={<Compat />} />
              <Route path="/rank" element={<Rank />} />
              <Route path="/league" element={<League />} />
              <Route path="/legal/:doc" element={<Legal />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/charge" element={<Charge />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/vs" element={<Duel />} />
              <Route path="/self-report" element={<SelfReport />} />
              <Route path="/deep-report" element={<DeepReport />} />
              <Route path="/growth" element={<GrowthPlan />} />
              <Route path="/mbti/:mode" element={<MbtiTest />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
      {!hideNav && <BottomNav />}
      <ReConsent />
      <InstallPrompt />
    </div>
    </MotionConfig>
  )
}
