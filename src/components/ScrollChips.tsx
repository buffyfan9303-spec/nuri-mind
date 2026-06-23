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
      className={`jelly-chip relative flex h-[84px] ${full ? 'w-full' : 'w-[86px] shrink-0'} flex-col items-center justify-center gap-1.5 overflow-hidden rounded-3xl px-2 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-current`}
    >
      {/* 글로시 상단 광택 — 단색감을 없애는 핵심 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: 'linear-gradient(rgba(255,255,255,0.45),rgba(255,255,255,0))' }}
      />
      {badge && (
        <span
          className="pointer-events-none absolute right-1.5 top-1.5 z-[2] rounded-full px-1.5 py-px text-[8.5px] font-extrabold leading-[1.4] tracking-wide text-white"
          style={{ background: BADGE_BG[badge] }}
        >
          {badge}
        </span>
      )}
      <span className="relative z-[1]">
        <IconBadge emoji={emoji} color={color} size={38} radius={12} tone={selected ? 'frost' : 'solid'} />
      </span>
      <span className="relative z-[1] line-clamp-2 break-keep px-0.5 text-center text-[12.5px] font-extrabold leading-tight">{label}</span>
    </button>
  )
})

/**
 * 가로 스크롤 젤리 칩 줄. CSS Scroll Snap + 스크롤바 숨김 + 우측 칩 살짝 잘림(부모 -mx-5 px-5) + 칩 간격 12px.
 */
export default function ScrollChips({ items, baseDelay = 0 }: { items: ChipItem[]; baseDelay?: number }) {
  return (
    <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5 pb-4 pt-1 [overscroll-behavior-x:contain]">
      {items.map((it, i) => (
        <motion.div
          key={it.id}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING.jelly, delay: baseDelay + 0.045 * i }}
          className="shrink-0 snap-start"
        >
          <JellyChip emoji={it.emoji} label={it.label} color={it.color} badge={it.badge} selected={it.selected} onClick={it.onClick} />
        </motion.div>
      ))}
    </div>
  )
}
