import { type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { pastelOf } from '../lib/chipColor'

/**
 * 입체 아이콘 타일 — 이모지를 글로시(상단 광택) 라운드 타일에 올려 입체감을 준다.
 *   tone='solid' : 흰 배경 카드용(브랜드색 파스텔 타일)
 *   tone='frost' : 컬러/그라데이션 카드용(반투명 흰 유리 타일)
 *   wiggle=true  : 이모지가 살짝 흔들리는 생기 애니메이션
 */
export default function IconBadge({
  emoji,
  color = '#8B95F6',
  size = 44,
  radius = 15,
  tone = 'solid',
  wiggle = false,
}: {
  emoji: string
  color?: string
  size?: number
  radius?: number
  tone?: 'solid' | 'frost'
  wiggle?: boolean
}) {
  const c = pastelOf(color)
  const tile: CSSProperties =
    tone === 'frost'
      ? {
          background: 'rgba(255,255,255,0.22)',
          boxShadow:
            'inset 0 2px 1px rgba(255,255,255,0.7), 0 3px 0 0 rgba(0,0,0,0.14), 0 5px 9px -3px rgba(0,0,0,0.25)',
        }
      : {
          background: c.badgeBg,
          boxShadow: `inset 0 2px 1px rgba(255,255,255,0.85), 0 3px 0 0 ${c.badgeEdge}, 0 5px 9px -3px rgba(31,41,48,0.2)`,
        }
  const fontSize = Math.round(size * 0.54)
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius, ...tile }}
    >
      {/* 상단 광택 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: 'linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0))' }}
      />
      {wiggle ? (
        <motion.span
          aria-hidden="true"
          className="relative z-[1] leading-none"
          style={{ fontSize }}
          animate={{ rotate: [0, -9, 9, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 2 }}
        >
          {emoji}
        </motion.span>
      ) : (
        <span aria-hidden="true" className="relative z-[1] leading-none" style={{ fontSize }}>
          {emoji}
        </span>
      )}
    </span>
  )
}
