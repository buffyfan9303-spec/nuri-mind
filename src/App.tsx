import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'
import ReConsent from './components/ReConsent'
import Skeleton from './components/Skeleton'
import InstallPrompt from './components/InstallPrompt'
import Home from './pages/Home'
import { useStore } from './store/useStore'
import { pageView } from './lib/analytics'
import { markFortuneSeen } from './lib/fortunePrefs'

/** 라우트별 코드 스플리팅 — 첫 로딩엔 홈만 받고 나머지는 진입 시 로드 */
const TestIntro = lazy(() => import('./pages/TestIntro'))
const TestRun = lazy(() => import('./pages/TestRun'))
const MemoryRun = lazy(() => import('./pages/MemoryRun'))
const FocusRun = lazy(() => import('./pages/FocusRun'))
const SpeedRun = lazy(() => import('./pages/SpeedRun'))
const SpatialRun = lazy(() => import('./pages/SpatialRun'))
const SwitchRun = lazy(() => import('./pages/SwitchRun'))
const CogProfile = lazy(() => import('./pages/CogProfile'))
const Mailbox = lazy(() => import('./pages/Mailbox'))
const TestResult = lazy(() => import('./pages/TestResult'))
const Rewards = lazy(() => import('./pages/Rewards'))
const SurveyTake = lazy(() => import('./pages/SurveyTake'))
const SurveyCreate = lazy(() => import('./pages/SurveyCreate'))
const Shop = lazy(() => import('./pages/Shop'))
const Admin = lazy(() => import('./pages/Admin'))
const Profile = lazy(() => import('./pages/Profile'))
const Rank = lazy(() => import('./pages/Rank'))
const League = lazy(() => import('./pages/League'))
const Legal = lazy(() => import('./pages/Legal'))
const Community = lazy(() => import('./pages/Community'))
const Dex = lazy(() => import('./pages/Dex'))
const Chemi = lazy(() => import('./pages/Chemi'))
const QuickHub = lazy(() => import('./pages/QuickHub'))
const QuickTest = lazy(() => import('./pages/QuickTest'))
const Routine = lazy(() => import('./pages/Routine'))
const Magazine = lazy(() => import('./pages/Magazine'))
const Article = lazy(() => import('./pages/Article'))
const Insight = lazy(() => import('./pages/Insight'))
const Fortune = lazy(() => import('./pages/Fortune'))
const Compat = lazy(() => import('./pages/Compat'))
const Charge = lazy(() => import('./pages/Charge'))
const Premium = lazy(() => import('./pages/Premium'))
const Duel = lazy(() => import('./pages/Duel'))
const SelfReport = lazy(() => import('./pages/SelfReport'))

export default function App() {
  const location = useLocation()
  const fontScale = useStore((s) => s.fontScale)
  const onboarded = useStore((s) => s.onboarded)
  const theme = useStore((s) => s.theme)

  // 글자 크기: 루트 zoom으로 전체 UI 배율 조정
  useEffect(() => {
    ;(document.documentElement.style as unknown as { zoom: string }).zoom = String(fontScale)
  }, [fontScale])

  // 다크모드: 루트에 .dark 클래스 토글 (CSS 변수로 전체 색 전환)
  // View Transitions API 지원 시 전체 화면이 부드럽게 크로스페이드 (미지원 시 즉시 전환)
  useEffect(() => {
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark')
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (doc.startViewTransition && document.documentElement.classList.contains('dark') !== (theme === 'dark')) {
      doc.startViewTransition(apply)
    } else {
      apply()
    }
  }, [theme])

  const hideNav =
    !onboarded ||
    location.pathname.endsWith('/run') ||
    location.pathname.startsWith('/rewards/survey') ||
    location.pathname.startsWith('/rewards/create') ||
    location.pathname.startsWith('/admin')

  useEffect(() => {
    window.scrollTo(0, 0)
    pageView(location.pathname)
    // 오늘의 퀘스트 '운세 보기' 판정 — 운세 화면 진입 자체를 열람으로 기록
    if (location.pathname === '/fortune') markFortuneSeen()
  }, [location.pathname])


  // 회원가입(온보딩) 전이면 입장 대신 가입 화면
  // 단, 약관·개인정보 페이지는 가입 화면에서 탭해 열 수 있도록 통과시킴
  if (!onboarded && !location.pathname.startsWith('/legal')) return <Onboarding />

  return (
    <div className="mx-auto min-h-dvh max-w-2xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
              <Route path="/compat" element={<Compat />} />
              <Route path="/rank" element={<Rank />} />
              <Route path="/league" element={<League />} />
              <Route path="/legal/:doc" element={<Legal />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/charge" element={<Charge />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/vs" element={<Duel />} />
              <Route path="/self-report" element={<SelfReport />} />
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
  )
}
