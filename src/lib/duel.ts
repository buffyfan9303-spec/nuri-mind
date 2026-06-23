/**
 * 결과 대결 — 검사 결과를 URL-safe 문자열로 인코딩/디코딩. 서버 없이 친구와 비교.
 * 배열 직렬화([testId, percentile, band, nick, personaKey])로 최대한 짧게.
 */
export interface DuelResult {
  /** testId */
  t: string
  /** percentile (raw 0-100) */
  p: number
  /** band key */
  b: string
  /** nickname */
  n: string
  /** persona key */
  a: string
}

function toB64Url(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64Url(s: string): string {
  return decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))
}

export function encodeDuel(d: DuelResult): string {
  return toB64Url(JSON.stringify([d.t, Math.round(d.p), d.b, (d.n || '').slice(0, 16), d.a]))
}

export function decodeDuel(s: string): DuelResult | null {
  if (!s) return null
  try {
    const arr = JSON.parse(fromB64Url(s))
    if (!Array.isArray(arr) || arr.length < 5) return null
    const [t, p, b, n, a] = arr
    if (typeof t !== 'string' || typeof p !== 'number' || typeof a !== 'string') return null
    return { t, p, b: String(b ?? ''), n: String(n ?? ''), a }
  } catch {
    return null
  }
}
