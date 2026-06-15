import confetti from 'canvas-confetti'

const BRAND = ['#4FA882', '#8FB8E8', '#F4B08C', '#FFB020', '#FF6F61', '#6E7BF2']

export function burst() {
  confetti({ particleCount: 70, spread: 75, origin: { y: 0.72 }, colors: BRAND, disableForReducedMotion: true })
}

export function celebrate() {
  burst()
  setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: BRAND }), 180)
  setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: BRAND }), 320)
}
