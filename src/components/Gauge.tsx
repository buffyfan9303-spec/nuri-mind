import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export function useCountUp(target: number, duration = 1200, start = true) {
  const [v, setV] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    if (!start) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, start])
  return v
}

/** 반원 백분위 게이지 — 정규분포 좌표 시각화 */
export default function Gauge({
  value,
  color = '#4FA882',
  label,
  bigSuffix = '%',
}: {
  value: number
  color?: string
  label?: string
  bigSuffix?: string
}) {
  const R = 80
  const CIRC = Math.PI * R
  const shown = useCountUp(value)
  return (
    <div className="relative mx-auto w-[210px]">
      <svg viewBox="0 0 200 112" className="w-full">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E7EDE9" strokeWidth="14" strokeLinecap="round" />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC * (1 - Math.min(100, value) / 100) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <span className="text-4xl font-extrabold tracking-tight" style={{ color }}>
          {shown.toFixed(value % 1 ? 1 : 0)}
        </span>
        <span className="text-xl font-extrabold" style={{ color }}>
          {bigSuffix}
        </span>
        {label && <div className="mt-0.5 text-xs font-bold tracking-wide text-ink-sub">{label}</div>}
      </div>
    </div>
  )
}
