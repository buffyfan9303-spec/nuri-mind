import { useCallback } from 'react'
import { pop } from '../lib/confetti'
import { sfx } from '../lib/sound'
import { haptic } from '../lib/haptic'

export type RewardKind = 'tap' | 'coin' | 'win' | 'levelup'

/**
 * 어디서든 호출하는 '보상 연출' 훅 — confetti(canvas) + 마이크로 사운드를 한 번에.
 * 게이미피케이션 연출을 단일 출처로 통일(중복 confetti 호출/톤 불일치 제거).
 *
 *   const { fire, fireAt } = useRewardAnimation()
 *   onClick={() => fire('coin')}              // 화면 하단에서 팡
 *   onClick={(e) => fireAt(e, 'tap')}         // 클릭 좌표에서 팡(정확한 위치)
 *
 * kind: 'tap'(가벼운 터치) · 'coin'(포인트 획득) · 'win'(검사 완료/달성) · 'levelup'(등급/레벨업, 가장 화려)
 * 색상·동작 줄이기 존중·모듈 지연 로드는 lib/confetti 의 pop() 이 일괄 처리한다.
 */
export function useRewardAnimation() {
  const fire = useCallback((kind: RewardKind = 'win', origin?: { x: number; y: number }) => {
    const o = origin ?? { x: 0.5, y: 0.7 }

    if (kind === 'tap') {
      sfx.tap()
      haptic(6)
      pop({ particleCount: 22, spread: 52, startVelocity: 24, origin: o, scalar: 0.8 })
      return
    }

    if (kind === 'coin') sfx.coin()
    else sfx.fanfare()
    haptic(kind === 'coin' ? 14 : [12, 36, 16])

    pop({ particleCount: 80, spread: 78, origin: o })

    if (kind === 'win' || kind === 'levelup') {
      window.setTimeout(() => pop({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } }), 160)
      window.setTimeout(() => pop({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } }), 300)
    }
    if (kind === 'levelup') {
      window.setTimeout(() => pop({ particleCount: 130, spread: 130, startVelocity: 46, origin: { x: 0.5, y: 0.5 }, scalar: 1.1 }), 120)
    }
  }, [])

  /** 클릭/탭 이벤트 좌표에서 정확히 터뜨리기 */
  const fireAt = useCallback(
    (e: { clientX: number; clientY: number }, kind: RewardKind = 'tap') => {
      fire(kind, { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    },
    [fire],
  )

  return { fire, fireAt }
}
