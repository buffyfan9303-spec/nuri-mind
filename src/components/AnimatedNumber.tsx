import { useEffect, useRef, useState } from 'react'
import { useReducedMotion, useSpring } from 'framer-motion'

/**
 * 애플식 숫자 카운트업 — 값이 바뀌면 스프링 물리로 굴러가듯 따라감.
 * 첫 마운트엔 0→값 롤업, 이후엔 이전 값→새 값. '동작 줄이기' 시 즉시 표시.
 */
export default function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const reduced = useReducedMotion()
  const spring = useSpring(0, { stiffness: 90, damping: 22, mass: 0.8 })
  const [display, setDisplay] = useState(reduced ? value : 0)
  const mounted = useRef(false)

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    if (!mounted.current) {
      mounted.current = true
      spring.jump(0)
    }
    spring.set(value)
    const unsub = spring.on('change', (v) => setDisplay(Math.round(v)))
    return unsub
  }, [value, reduced, spring])

  return <span className={className}>{display.toLocaleString()}</span>
}
