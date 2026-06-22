import { type CSSProperties } from 'react'
import { motion } from 'framer-motion'

export interface ChipItem {
  id: string
  emoji: string
  /** 이미 현지화된 라벨 */
  label: string
  /** 카테고리 브랜드 색(HEX) — 파스텔 단색 배경·짙은 텍스트·한 톤 어두운 그림자를 자동 생성 */
  color: string
  onClick: () => void
}

/* ── 브랜드 HEX → 젤리 파스텔 3색(배경/그림자/텍스트). 그라데이션 없이 단색만. ── */
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

/** 브랜드 색 → { bg: 밝은 파스텔, sh: 한 톤 어두운 그림자, fg: 짙은 채도 텍스트 } */
export function pastelOf(color: string): { bg: string; sh: string; fg: string } {
  const base = hexToRgb(color)
  return {
    bg: mix(base, WHITE, 0.76), // 부드러운 파스텔 단색
    sh: mix(base, WHITE, 0.42), // 배경보다 한 톤 어두운 입체 그림자
    fg: mix(base, INK, 0.52), // 배경과 어울리는 짙은 텍스트
  }
}

/**
 * 듀오링고식 가로 스크롤 '젤리 칩' 줄.
 * - 단색 파스텔(그라데이션 금지) + blur 0 두께 그림자(5px) + :active 꾹 눌림(translate-y 4px + 그림자 1px).
 * - CSS Scroll Snap(snap-x mandatory + 자식 snap-start), 스크롤바 숨김(no-scrollbar),
 *   부모 -mx-5 px-5 로 우측 칩이 살짝 잘려 스크롤 가능을 암시, 칩 간격 12px(gap-3).
 */
export default function ScrollChips({ items, baseDelay = 0 }: { items: ChipItem[]; baseDelay?: number }) {
  return (
    <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [overscroll-behavior-x:contain]">
      {items.map((it, i) => {
        const { bg, sh, fg } = pastelOf(it.color)
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
              style={{ background: bg, color: fg, '--sh': sh } as CSSProperties}
              className="flex h-[106px] w-[92px] flex-col items-center justify-center gap-2 rounded-3xl px-2 outline-none transition-[transform,box-shadow] duration-100 ease-out [box-shadow:0_5px_0_var(--sh)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-current active:translate-y-[4px] active:[box-shadow:0_1px_0_var(--sh)]"
            >
              <span aria-hidden="true" className="text-[30px] leading-none [filter:drop-shadow(0_1.5px_0.5px_rgba(0,0,0,0.18))]">{it.emoji}</span>
              <span className="line-clamp-2 break-keep px-0.5 text-center text-[13px] font-extrabold leading-tight">{it.label}</span>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
