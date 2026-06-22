import { type CSSProperties } from 'react'
import { motion } from 'framer-motion'

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
}

/* ── 브랜드 HEX → 젤리 칩 3색(배경/바닥모서리/텍스트). 그라데이션 없이 단색만. ── */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(v, 16)
  if (Number.isNaN(n)) return [148, 163, 158] // 잘못된 색 입력 시 중립 그레이 폴백
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a: [number, number, number], b: [number, number, number], t: number): string => {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r}, ${g}, ${bl})`
}
const WHITE: [number, number, number] = [255, 255, 255]
const INK: [number, number, number] = [20, 24, 28]

/** 브랜드 색 → { bg: 밝은 파스텔, edge: 한 톤 어두운 바닥 모서리(입체), fg: 짙은 텍스트 } */
export function pastelOf(color: string): { bg: string; edge: string; fg: string } {
  const base = hexToRgb(color)
  return {
    bg: mix(base, WHITE, 0.74), // 부드러운 파스텔 단색
    edge: mix(base, INK, 0.12), // 3D 바닥 모서리 — 브랜드색을 살짝 어둡게
    fg: mix(base, INK, 0.52), // 배경과 어울리는 짙은 텍스트
  }
}

const BADGE_BG: Record<NonNullable<ChipItem['badge']>, string> = { NEW: '#3B9EFF', HOT: '#FF4D4D' }

/**
 * 듀오링고식 가로 스크롤 '젤리 칩' 줄.
 * - 단색 파스텔(그라데이션 금지) + 자연스러운 입체(.jelly-chip: 상단 광택 + 컬러 바닥 모서리 + 부드러운 그림자)
 *   + :active 젤리 눌림. CSS Scroll Snap, 스크롤바 숨김, 우측 칩 살짝 잘림(부모 -mx-5 px-5), 칩 간격 12px.
 * - 콤팩트 86×84(과한 높이 제거). 선택적 NEW/HOT 코너 리본.
 */
export default function ScrollChips({ items, baseDelay = 0 }: { items: ChipItem[]; baseDelay?: number }) {
  return (
    <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 pt-1 [overscroll-behavior-x:contain]">
      {items.map((it, i) => {
        const { bg, edge, fg } = pastelOf(it.color)
        return (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: baseDelay + 0.045 * i, type: 'spring', stiffness: 260, damping: 24 }}
            className="shrink-0 snap-start"
          >
            <button
              type="button"
              onClick={it.onClick}
              aria-label={it.label}
              style={{ background: bg, color: fg, '--edge': edge } as CSSProperties}
              className="jelly-chip relative flex h-[84px] w-[86px] flex-col items-center justify-center gap-1.5 rounded-3xl px-2 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {it.badge && (
                <span
                  className="pointer-events-none absolute right-1.5 top-1.5 rounded-full px-1.5 py-px text-[8.5px] font-extrabold leading-[1.4] tracking-wide text-white"
                  style={{ background: BADGE_BG[it.badge] }}
                >
                  {it.badge}
                </span>
              )}
              <span aria-hidden="true" className="text-[26px] leading-none">{it.emoji}</span>
              <span className="line-clamp-2 break-keep px-0.5 text-center text-[12.5px] font-extrabold leading-tight">{it.label}</span>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
