import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useL } from '../../i18n/useT'
import Emoji from '../Emoji'

/** 숫자 카운터 전용 — lib/motion의 transition 프리셋과 API가 달라 여기 둔다(오버슈트 금지) */
const COUNTER_SPRING = { stiffness: 110, damping: 22 }

/** 숫자 스프링 카운트업 — 잔액이 점프하지 않고 촤르륵 굴러가는 네이티브 감. 동작 줄이기 설정 시 즉시 표시 */
function useCountUp(value: number) {
  const reduced = useReducedMotion()
  // 숫자 카운터는 useSpring(값 보간) API라 transition 프리셋과 형태가 다르다 —
  // 오버슈트가 있으면 포인트가 잠깐 초과 표시되므로 임계감쇠로 둔다.
  const spring = useSpring(value, COUNTER_SPRING)
  useEffect(() => {
    if (reduced) spring.jump(value)
    else spring.set(value)
  }, [value, reduced, spring])
  return useTransform(spring, (v) => Math.round(v).toLocaleString())
}

/** 다이아(유료 재화) Pill — 탭하면 충전 화면으로. 포인트와 구분(💎 하드 / 🪙 소프트) */
export function DiamondPill() {
  const diamonds = useStore((s) => s.diamonds)
  const diaText = useCountUp(diamonds)
  const nav = useNavigate()
  const l = useL()
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => nav('/charge')}
      // 이름이 없으면 '보석 12 더하기'로 읽힌다 — 누르면 무엇이 되는지(충전)를 말해 준다.
      // 알약은 28px 남짓이라 before로 위아래 8px 넓혀 44px 히트영역(모양·줄 높이는 그대로)
      aria-label={l({ ko: `다이아 ${diamonds}개 · 충전하기`, en: `${diamonds} diamonds · Top up`, ja: `ダイヤ${diamonds}個・チャージ` })}
      className="relative flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-sm font-extrabold tabular-nums text-[#6E7BF2] shadow-card before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']"
    >
      <Emoji e="💎" size={16} /> <motion.span>{diaText}</motion.span>
      <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6E7BF2] text-[11px] leading-none text-white">+</span>
    </motion.button>
  )
}

export function PointsPill({ showStreak = true }: { showStreak?: boolean } = {}) {
  const points = useStore((s) => s.points)
  const pointsText = useCountUp(points)
  const streak = useStore((s) => s.streak)
  return (
    <div className="flex items-center gap-1">
      {showStreak && streak > 0 && (
        // 360px 폭에서는 연속 출석 알약을 접는다 — 세 알약이 제목 자리를 88px까지 먹어 '주의산…'처럼 잘렸다.
        // 연속 출석은 홈 대시보드에도 있으니 좁은 폰에서 상단바에서만 빠진다
        <span className="hidden items-center gap-0.5 rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold tabular-nums text-orange-500 shadow-card min-[380px]:flex">
          <Emoji e="🔥" size={15} />
          {streak}
        </span>
      )}
      <DiamondPill />
      {/* 아이콘은 SVG라 글자가 아니다 — 잔액을 잡는 테스트는 data-testid로 찾는다 */}
      <span data-testid="points-pill" className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold tabular-nums text-mind-700 shadow-card">
        <Emoji e="🪙" size={16} /> <motion.span>{pointsText}</motion.span>
      </span>
    </div>
  )
}
