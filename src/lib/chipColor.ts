/* ── 브랜드 HEX → 젤리 칩 / 아이콘 타일 색 파생. 그라데이션 없이 단색 파생만. ── */
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

/** 브랜드 색 → 파스텔 배경·바닥모서리·텍스트 + 선택(비비드) 변형 + 아이콘 타일 색 */
export function pastelOf(color: string) {
  const base = hexToRgb(color)
  return {
    bg: mix(base, WHITE, 0.74), // 부드러운 파스텔 단색
    edge: mix(base, INK, 0.12), // 3D 바닥 모서리 — 브랜드색을 살짝 어둡게
    fg: mix(base, INK, 0.52), // 배경과 어울리는 짙은 텍스트
    solid: mix(base, INK, 0.02), // 선택 시 비비드 배경
    solidEdge: mix(base, INK, 0.34), // 선택 시 바닥 모서리
    badgeBg: mix(base, WHITE, 0.56), // 아이콘 타일 — 칩 배경보다 진한 파스텔(도드라지게)
    badgeEdge: mix(base, INK, 0.2), // 아이콘 타일 바닥 모서리
  }
}
