export const config = { runtime: 'edge' }

// 결과 대결 공유 랜딩 — 크롤러(카카오/트위터)엔 동적 OG 메타를 주고, 사람은 SPA /vs 로 즉시 리다이렉트.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type Decoded =
  | { quick: false; t: string; p: string; n: string }
  | { quick: true; nm: string; e: string; n: string }

function decode(r: string): Decoded | null {
  try {
    const b = r.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b)))
    const arr = JSON.parse(json)
    if (!Array.isArray(arr)) return null
    if (arr[0] === 'Q') {
      return { quick: true, nm: String(arr[3] ?? ''), e: String(arr[4] ?? ''), n: String(arr[5] ?? '') }
    }
    return { quick: false, t: String(arr[0] ?? ''), p: String(arr[1] ?? ''), n: String(arr[3] ?? '') }
  } catch {
    return null
  }
}

export default function handler(req: Request) {
  const url = new URL(req.url)
  const r = url.searchParams.get('r') || ''
  const origin = url.origin
  const d = decode(r)

  const vs = d ? `${origin}/vs?r=${encodeURIComponent(r)}` : `${origin}/`
  const rawNick = (d?.n || '').slice(0, 16)
  const title = '누리 마인드 결과 대결 🆚'
  let ogImg = `${origin}/og.jpg`
  let desc = '내 심리검사 결과와 친구를 비교해보세요!'
  if (d && d.quick) {
    ogImg = `${origin}/api/og?e=${encodeURIComponent(d.e)}`
    desc = rawNick ? `${rawNick} 님은 "${d.nm}"! 너도 해보고 같은 결과인지 확인해봐` : `친구의 결과 "${d.nm}"! 너도 해볼래?`
  } else if (d) {
    ogImg = `${origin}/api/og?t=${encodeURIComponent(d.t)}&p=${encodeURIComponent(d.p)}`
    desc = rawNick ? `${rawNick} 님의 심리검사 결과에 도전해보세요!` : '내 심리검사 결과와 친구를 비교해보세요!'
  }

  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta property="og:type" content="website">
<meta property="og:site_name" content="누리 마인드">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:url" content="${vs}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImg}">
<meta http-equiv="refresh" content="0; url=${vs}">
<title>${esc(title)}</title></head>
<body style="font-family:sans-serif;text-align:center;padding-top:48px;color:#333">
<p>결과 대결 페이지로 이동 중…</p>
<p><a href="${vs}">바로 이동하기</a></p>
<script>location.replace(${JSON.stringify(vs)})</script>
</body></html>`

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
  })
}
