import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'
import Home from './pages/Home'
import { useStore } from './store/useStore'
import { pageView } from './lib/analytics'

/** 라우트별 코드 스플리팅 — 첫 로딩엔 홈만 받고 나머지는 진입 시 로드 */
const TestIntro = lazy(() => import('./pages/TestIntro'))
const TestRun = lazy(() => import('./pages/TestRun'))
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

function Loader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 1.1 }}
        className="text-4xl"
      >
        🧠
      </motion.div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const fontScale = useStore((s) => s.fontScale)
  const onboarded = useStore((s) => s.onboarded)

  // 글자 크기: 루트 zoom으로 전체 UI 배율 조정
  useEffect(() => {
    ;(document.documentElement.style as unknown as { zoom: string }).zoom = String(fontScale)
  }, [fontScale])

  const hideNav =
    location.pathname.endsWith('/run') ||
    location.pathname.startsWith('/rewards/survey') ||
    location.pathname.startsWith('/rewards/create') ||
    location.pathname.startsWith('/admin')

  useEffect(() => {
    window.scrollTo(0, 0)
    pageView(location.pathname)
  }, [location.pathname])

  // 회원가입(온보딩) 전이면 입장 대신 가입 화면
  if (!onboarded) return <Onboarding />

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
          <Suspense fallback={<Loader />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/test/:id" element={<TestIntro />} />
              <Route path="/test/:id/run" element={<TestRun />} />
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
              <Route path="/rank" element={<Rank />} />
              <Route path="/league" element={<League />} />
              <Route path="/legal/:doc" element={<Legal />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
      {!hideNav && <BottomNav />}
    </div>
  )
}
