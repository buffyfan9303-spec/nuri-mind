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

/** 퀵 테스트 대결 — 퀵 결과는 저장되지 않으므로 친구의 타입만 공유(비교는 "너도 해봐"). */
export interface QuickDuel {
  quick: true
  /** quick test id */
  qid: string
  /** result key */
  key: string
  /** result name(현지화 완료) */
  nm: string
  /** emoji */
  e: string
  /** nickname */
  n: string
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

export function encodeQuickDuel(d: { qid: string; key: string; nm: string; e: string; n: string }): string {
  return toB64Url(JSON.stringify(['Q', d.qid, d.key, (d.nm || '').slice(0, 20), d.e, (d.n || '').slice(0, 16)]))
}

export function decodeDuel(s: string): DuelResult | QuickDuel | null {
  if (!s) return null
  try {
    const arr = JSON.parse(fromB64Url(s))
    if (!Array.isArray(arr)) return null
    if (arr[0] === 'Q') {
      const [, qid, key, nm, e, n] = arr
      if (typeof qid !== 'string') return null
      return { quick: true, qid, key: String(key ?? ''), nm: String(nm ?? ''), e: String(e ?? '❓'), n: String(n ?? '') }
    }
    if (arr.length < 5) return null
    const [t, p, b, n, a] = arr
    if (typeof t !== 'string' || typeof p !== 'number' || typeof a !== 'string') return null
    return { t, p, b: String(b ?? ''), n: String(n ?? ''), a }
  } catch {
    return null
  }
}
