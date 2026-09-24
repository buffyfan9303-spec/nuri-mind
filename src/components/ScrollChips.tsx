import { memo, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { SPRING } from '../lib/motion'
import { pastelOf } from '../lib/chipColor'
import IconBadge from './IconBadge'
import { haptic } from '../lib/haptic'

export interface ChipItem {
  id: string
  emoji: string
  /** 이미 현지화된 라벨 */
  label: string
  /** 카테고리 브랜드 색(HEX) — 파스텔 배경·짙은 텍스트·바닥 모서리를 자동 생성 */
  color: string
  onClick: () => void
  /** 코너 리본 — 'NEW'(신규) 파랑 · 'HOT'(인기) 빨강 */
  badge?: 'NEW' | 'HOT'
  /** 필터용 — 선택 시 비비드 채움 */
  selected?: boolean
}

/* 색 파생(pastelOf)·아이콘 타일 색은 lib/chipColor.ts로 분리 (IconBadge와 공유) */

/**
 * 가로 줄 칩 한 칸의 폭 — 화면(최대 28rem) 안쪽 여백 20px×2와 간격 10px×4를 빼고 5등분.
 * 첫 화면에 정확히 5칸이 들어가 왼쪽 여백(20px)과 오른쪽 여백(20px)이 같다(듀오링고식 대칭 격자).
 * 정사각(aspect-square)이라 칸 모양도 화면 폭과 함께 비례한다.
 */
export const CHIP_W = 'w-[calc((min(100vw,28rem)-80px)/5)]'
const CHIP_SQUARE = CHIP_W + ' aspect-square shrink-0'

const BADGE_BG: Record<NonNullable<ChipItem['badge']>, string> = { NEW: '#3B9EFF', HOT: '#FF4D4D' }

/**
 * 듀오링고식 '젤리 칩' 버튼 — 단색 파스텔(그라데이션❌) + 자연스러운 입체(.jelly-chip)
 * + :active 젤리 눌림. ScrollChips(가로 스크롤)·그리드·필터 어디서나 재사용.
 */
export const JellyChip = memo(function JellyChip({
  emoji,
  label,
  color,
  badge,
  selected,
  full,
  onClick,
}: {
  emoji: string
  label: string
  color: string
  badge?: 'NEW' | 'HOT'
  selected?: boolean
  full?: boolean
  onClick?: () => void
}) {
  const c = pastelOf(color)
  const style = selected
    ? ({ background: c.solid, color: '#fff', '--edge': c.solidEdge } as CSSProperties)
    : ({ background: c.bg, color: c.fg, '--edge': c.edge } as CSSProperties)
  return (
    <button
      type="button"
      onClick={() => {
        haptic(6)
        onClick?.()
      }}
      aria-label={label}
      aria-pressed={selected}
      style={style}
      className={`jelly-chip relative flex ${full ? 'h-[76px] w-full' : CHIP_SQUARE} flex-col items-center justify-center gap-1 overflow-hidden rounded-[20px] px-1 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-current`}
    >
      {/* 글로시 상단 광택 — 단색감을 없애는 핵심 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: 'linear-gradient(rgba(255,255,255,0.45),rgba(255,255,255,0))' }}
      />
      {badge && (
        <span
          className="pointer-events-none absolute right-1 top-1 z-[2] rounded-full px-1 py-px text-[11px] font-semibold leading-none tracking-wide text-white"
          style={{ background: BADGE_BG[badge] }}
        >
          {badge}
        </span>
      )}
      <span className="relative z-[1]">
        <IconBadge emoji={emoji} color={color} size={30} radius={10} tone={selected ? 'frost' : 'solid'} />
      </span>
      <span className="relative z-[1] block w-full truncate whitespace-nowrap text-center text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  )
})

/**
 * 가로 스크롤 젤리 칩 줄. CSS Scroll Snap + 스크롤바 숨김 + 칩 간격 10px.
 * ⚠️ 본문 폭 안에서만 스크롤한다(예전 -mx-5 풀블리드는 다음 칩이 오른쪽 여백을 파고들어 좌우가 어긋났다).
 *    6번째 칩부터는 밀어서 본다 — 라벨은 전부 한 줄 약칭이라 아이콘 위치가 칸마다 같다.
 */
export default function ScrollChips({ items, baseDelay = 0 }: { items: ChipItem[]; baseDelay?: number }) {
  return (
    <div className="no-scrollbar mt-2 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-3 pt-1 [overscroll-behavior-x:contain]">
      {items.map((it, i) => (
        <motion.div
          key={it.id}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING.ui, delay: baseDelay + 0.045 * i }}
          className="shrink-0 snap-start"
        >
          <JellyChip emoji={it.emoji} label={it.label} color={it.color} badge={it.badge} selected={it.selected} onClick={it.onClick} />
        </motion.div>
      ))}
    </div>
  )
}
