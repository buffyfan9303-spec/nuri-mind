import { motion } from 'framer-motion'

/** 펄스 스켈레톤 블록 — 토큰 색(bg-line)이라 라이트/다크 자동 대응. 레이아웃 시프트 방지용 자리표시. */
export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} aria-hidden="true" />
}

/**
 * 라우트 지연 로딩(lazy) fallback — 귀여운 마스코트 + 홈 레이아웃 자리표시 스켈레톤.
 * 밋밋한 스피너 대신 실제 콘텐츠 골격을 미리 그려 '깜빡임(layout shift)'을 줄인다.
 */
export default function Skeleton() {
  return (
    <div className="bg-dots mx-auto min-h-dvh max-w-2xl px-5 pt-6" role="status" aria-label="로딩 중">
      <motion.div
        animate={{ y: [0, -9, 0], rotate: [0, -7, 7, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        className="mb-6 text-center text-5xl"
      >
        🧠
      </motion.div>
      <SkeletonBlock className="h-28 w-full" />
      <div className="mt-4 flex gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-[84px] w-[86px] shrink-0" />
        ))}
      </div>
      <SkeletonBlock className="mt-5 h-16 w-full" />
      <SkeletonBlock className="mt-3 h-16 w-full" />
    </div>
  )
}
