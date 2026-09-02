import { NavLink, useLocation } from 'react-router-dom'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { useT } from '../i18n/useT'
import { haptic } from '../lib/haptic'

const TABS = [
  { to: '/', icon: '🏠', key: 'nav.home' },
  { to: '/rewards', icon: '🪙', key: 'nav.rewards' },
  { to: '/community', icon: '💬', key: 'nav.community' },
  { to: '/shop', icon: '🎁', key: 'nav.shop' },
  { to: '/profile', icon: '👤', key: 'nav.profile' },
]

/** 플로팅 둥근 하단 내비 — 활성 탭 원형 강조 / 아래 콘텐츠 비침 방지 페이드 */
export default function BottomNav() {
  const t = useT()
  const loc = useLocation()
  return (
    <>
      {/* 콘텐츠가 바 아래/옆으로 비치지 않도록 풀폭 페이드 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-24 bg-gradient-to-t from-cream via-cream/95 to-transparent" />

      <nav className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[19px]"
                  style={{ background: active ? 'linear-gradient(135deg, #9BC4B2, #8FB8E8)' : 'transparent' }}
                >
                  {tab.icon}
                </motion.span>
                <span
                  className={`mt-px text-[10.5px] font-extrabold leading-tight transition-colors ${
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
    </>
  )
}
