/** WebAudio 기반 마이크로 사운드 — 에셋 없이 듀오링고식 청각 피드백 제공 */
let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, dur: number, vol = 0.12, type: OscillatorType = 'sine') {
  const c = ac()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime + start)
  g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  o.connect(g).connect(c.destination)
  o.start(c.currentTime + start)
  o.stop(c.currentTime + start + dur + 0.05)
}

let enabled = true
export function setSoundEnabled(v: boolean) {
  enabled = v
}

/* ── 차분한 배경음(앰비언트 패드) — 검사 중 집중용 ── */
let ambientNodes: { osc: OscillatorNode[]; gain: GainNode } | null = null
export function startAmbient() {
  const c = ac()
  if (!c || ambientNodes) return
  const gain = c.createGain()
  gain.gain.setValueAtTime(0, c.currentTime)
  gain.gain.linearRampToValueAtTime(0.035, c.currentTime + 2)
  gain.connect(c.destination)
  // 잔잔한 화음 (A2 + E3 + A3)
  const freqs = [110, 164.81, 220]
  const osc = freqs.map((f) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const og = c.createGain()
    og.gain.value = f === 110 ? 0.5 : 0.28
    o.connect(og).connect(gain)
    o.start()
    return o
  })
  ambientNodes = { osc, gain }
}
export function stopAmbient() {
  const c = ac()
  if (!c || !ambientNodes) return
  const { osc, gain } = ambientNodes
  ambientNodes = null
  gain.gain.cancelScheduledValues(c.currentTime)
  gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.8)
  osc.forEach((o) => o.stop(c.currentTime + 0.9))
}

export const sfx = {
  /** 옵션 선택 */
  tap() {
    if (!enabled) return
    // 부드러운 '톡' — 날카로운 띡똑 대신 따뜻한 사인 블립
    tone(587.33, 0, 0.12, 0.05, 'sine')
  },
  /** 다음 문항 진행 */
  next() {
    if (!enabled) return
    tone(523, 0, 0.06, 0.07, 'sine')
    tone(784, 0.05, 0.08, 0.07, 'sine')
  },
  /** 보상 획득 */
  coin() {
    if (!enabled) return
    tone(988, 0, 0.07, 0.1, 'square')
    tone(1319, 0.07, 0.12, 0.1, 'square')
  },
  /** 결과 공개 팡파레 */
  fanfare() {
    if (!enabled) return
    tone(523, 0, 0.12, 0.1)
    tone(659, 0.1, 0.12, 0.1)
    tone(784, 0.2, 0.12, 0.1)
    tone(1047, 0.3, 0.3, 0.12)
  },
  /** 오류/거절 */
  err() {
    if (!enabled) return
    tone(220, 0, 0.15, 0.1, 'sawtooth')
  },
}
