import type confettiFn from 'canvas-confetti'

type ConfettiOpts = NonNullable<Parameters<typeof confettiFn>[0]>

const BRAND = ['#4FA882', '#8FB8E8', '#F4B08C', '#FFB020', '#FF6F61', '#6E7BF2']

/**
 * 모든 confetti 연출의 단일 출처.
 *
 * ⚠️ canvas-confetti 는 정적 import 하지 않는다 — 첫 화면(홈·검사 목록)에는 색종이가 없는데도
 *    Onboarding → lib/confetti 경로로 메인 번들에 10.8KB(raw)/약 3.5KB(gzip)가 끌려 들어왔다.
 *    첫 연출이 실제로 터질 때 받아 온다. 정적 import 로 되돌리면 scripts/bundle-check.mjs 의
 *    메인 번들 예산이 터진다.
 *
 * 동작 줄이기(prefers-reduced-motion)가 켜져 있으면 받아오지도 않는다 —
 * 어차피 모든 호출에 disableForReducedMotion 이 붙어 아무것도 그려지지 않았다.
 */
let loading: Promise<typeof confettiFn> | null = null

function reduced(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** 색종이 한 번. 호출 시점에 모듈을 받아 오므로 첫 발사만 한 프레임 늦다. */
export function pop(opts: ConfettiOpts): void {
  if (reduced()) return
  loading ??= import('canvas-confetti').then((m) => m.default)
  void loading.then((c) => {
    c({ colors: BRAND, disableForReducedMotion: true, ...opts })
  })
}

export function burst() {
  pop({ particleCount: 70, spread: 75, origin: { y: 0.72 } })
}

export function celebrate() {
  burst()
  setTimeout(() => pop({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } }), 180)
  setTimeout(() => pop({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } }), 320)
}
