import { motion } from 'framer-motion'

/**
 * 다이내믹 코어 브레인 앰블럼 (백서 §3-①)
 * - 이중 점선 궤도가 서로 반대로 회전 (Outer Dotted Orbits)
 * - 세이지-소프트 블루 그라데이션 광배 (Emblem Base)
 * - 우상단 메탈 피치 스파클 핀 (Sparkles Pin)
 */
export default function Emblem({ size = 210 }: { size?: number }) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* 광배 */}
      <div
        className="absolute inset-2 rounded-full opacity-70 blur-2xl"
        style={{ background: 'linear-gradient(135deg, #9BC4B2 0%, #8FB8E8 100%)' }}
      />

      {/* 궤도 A */}
      <motion.div
        className="absolute inset-0"
        style={{ rotate: 24 }}
        animate={{ rotate: 384 }}
        transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
      >
        <svg viewBox="0 0 210 210" className="h-full w-full">
          <ellipse cx="105" cy="105" rx="100" ry="40" fill="none" stroke="#6FB394" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* 궤도 B (역방향) */}
      <motion.div
        className="absolute inset-0"
        style={{ rotate: -28 }}
        animate={{ rotate: -388 }}
        transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
      >
        <svg viewBox="0 0 210 210" className="h-full w-full">
          <ellipse cx="105" cy="105" rx="96" ry="48" fill="none" stroke="#8FB8E8" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* 코어 브레인 */}
      <div className="floaty absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-[118px] w-[118px] items-center justify-center rounded-full shadow-pop"
          style={{ background: 'linear-gradient(135deg, #9BC4B2 0%, #8FB8E8 100%)' }}
        >
          <svg viewBox="0 0 128 128" className="h-[72px] w-[72px]">
            <path
              d="M52 34c-9 0-16 7-16 15 0 2 .4 4 1.2 6C32 58 29 63 29 69c0 7 4.5 12.5 10.8 14.6C41 92 47.5 98 56 98h8V34h-12z"
              fill="#ffffff"
              fillOpacity="0.96"
            />
            <path
              d="M76 34c9 0 16 7 16 15 0 2-.4 4-1.2 6C96 58 99 63 99 69c0 7-4.5 12.5-10.8 14.6C87 92 80.5 98 72 98h-8V34h12z"
              fill="#ffffff"
              fillOpacity="0.72"
            />
          </svg>
        </div>
      </div>

      {/* 스파클 핀 */}
      <div className="sparkle absolute right-5 top-4 text-2xl drop-shadow" style={{ color: '#F4B08C' }}>
        ✦
      </div>
      <div className="sparkle absolute right-1 top-12 text-sm" style={{ color: '#E89D77', animationDelay: '0.8s' }}>
        ✦
      </div>
    </div>
  )
}
