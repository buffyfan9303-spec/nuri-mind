import { NavLink, useLocation } from 'react-router-dom'
import { SPRING } from '../lib/motion'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/useT'
import { haptic } from '../lib/haptic'

const TABS = [
  { to: '/', icon: '🏠', key: 'nav.home' },
  { to: '/rewards', icon: '🪙', key: 'nav.rewards' },
  { to: '/community', icon: '💬', key: 'nav.community' },
  { to: '/shop', icon: '🎁', key: 'nav.shop' },
  { to: '/profile', icon: '👤', key: 'nav.profile' },
]

/** 아래로 이만큼 누적 스크롤하면 숨김 — 손가락 한 번의 '읽으러 내려간다'는 의사 */
const HIDE_AFTER = 48
/** 위로 이만큼이면 즉시 복귀 — 돌아오는 건 짧아야 '언제든 있다'로 느껴진다 */
const SHOW_AFTER = 24
/** 최상단 근처에서는 항상 보인다 */
const TOP_ZONE = 80
/** 이보다 큰 한 번의 이동은 손가락이 아니라 프로그램이 옮긴 것(복원·앵커·scrollTo) */
const JUMP = 200

/**
 * 플로팅 둥근 하단 내비 — 활성 탭 원형 강조 / 아래 콘텐츠 비침 방지 페이드.
 *
 * 스크롤 자동 숨김(홀덤 캘린더에서 이식): 결과지·매거진·리포트처럼 긴 화면에서 내비+페이드가 375px 폰의
 * 세로 110px을 먹는다. 아래로 읽어 내려가면 숨고, 위로 살짝만 올려도 돌아온다.
 * 방향이 바뀌면 누적치를 0부터 다시 세서(direction-reset) 스크롤 관성으로 오락가락하지 않는다.
 * 라우트가 바뀌면 무조건 보인다 — 새 화면의 첫인상에 내비가 없으면 길을 잃는다.
 */
export default function BottomNav() {
  const t = useT()
  const loc = useLocation()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const last = useRef(0)
  const acc = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const dy = y - last.current
    last.current = y
    /**
     * 한 번에 크게 튄 이동은 손가락이 만든 게 아니다 — 뒤로가기 스크롤 복원(App의 scrollMemo),
     * 앵커 이동, scrollTo가 만든 점프다. 사용자의 의사가 아니므로 위치만 맞추고 아무 판단도 하지 않는다.
     * 이게 없으면 목록으로 '뒤로' 돌아온 순간 dy가 수백 px로 잡혀 내비가 곧바로 숨는다.
     */
    if (Math.abs(dy) > JUMP) {
      acc.current = 0
      return
    }
    if (y < TOP_ZONE) {
      acc.current = 0
      if (hidden) setHidden(false)
      return
    }
    // 같은 방향이면 누적, 방향이 바뀌면 리셋 — 관성 스크롤의 미세 진동에 반응하지 않는다
    acc.current = Math.sign(dy) === Math.sign(acc.current) ? acc.current + dy : dy
    if (acc.current > HIDE_AFTER && !hidden) setHidden(true)
    else if (acc.current < -SHOW_AFTER && hidden) setHidden(false)
  })

  useEffect(() => {
    setHidden(false)
    acc.current = 0
    last.current = window.scrollY
  }, [loc.pathname])

  return (
    <motion.div animate={{ y: hidden ? 120 : 0 }} transition={SPRING.ui} className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      {/* 콘텐츠가 바 아래/옆으로 비치지 않도록 풀폭 페이드 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cream via-cream/95 to-transparent" />

      <nav className="safe-bottom pointer-events-none relative z-40">
        <div className="pointer-events-auto mx-auto mb-1 flex max-w-[380px] items-center justify-around rounded-[26px] border border-line bg-surface/95 px-1.5 py-1.5 shadow-pop backdrop-blur-md">
          {TABS.map((tab) => {
            const active = tab.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(tab.to)
            return (
              <NavLink key={tab.to} to={tab.to} onClick={() => haptic(6)} className="flex w-[60px] flex-col items-center py-0.5">
                <motion.span
                  animate={
                    active
                      ? { y: -2, scale: [0.88, 1.14, 1], boxShadow: '0 5px 12px rgba(47,107,82,0.28)' }
                      : { y: 0, scale: 1, boxShadow: '0 0px 0px rgba(0,0,0,0)' }
                  }
                  transition={{
                    ...SPRING.flick,
                    // 탭 배지의 scale만 키프레임으로 따로 간다(스프링으로는 중간 피크를 만들 수 없다)
                    scale: { duration: 0.34, times: [0, 0.55, 1], ease: 'easeOut' },
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[20px]"
                  style={{ background: active ? 'linear-gradient(135deg, #9BC4B2, #8FB8E8)' : 'transparent' }}
                >
                  {tab.icon}
                </motion.span>
                <span
                  className={`mt-px text-[11px] font-semibold leading-tight transition-colors ${
                    active ? 'text-mind-700' : 'text-ink-faint'
                  }`}
                >
                  {t(tab.key)}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </motion.div>
  )
}
