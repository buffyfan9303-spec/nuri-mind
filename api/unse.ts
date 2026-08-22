export const config = { runtime: 'edge' }

/**
 * 띠별 '오늘의 운세' SEO 랜딩 — 엣지에서 완전한 HTML을 서빙(크롤러·사람 동일).
 * "오늘의 운세", "쥐띠 운세" 등 검색 유입용. 리다이렉트가 아닌 실콘텐츠라 색인 대상.
 * saju.ts와 동일한 60갑자 일주 공식(자체 포함 — 엣지 번들에 앱 데이터 미포함).
 * 라우팅: vercel.json rewrite  /unse → /api/unse,  /unse/:zodiac → /api/unse?z=:zodiac
 */

const STEMS = [
  { ko: '갑', el: '목' }, { ko: '을', el: '목' }, { ko: '병', el: '화' }, { ko: '정', el: '화' },
  { ko: '무', el: '토' }, { ko: '기', el: '토' }, { ko: '경', el: '금' }, { ko: '신', el: '금' },
  { ko: '임', el: '수' }, { ko: '계', el: '수' },
] as const

const BRANCHES = [
  { ko: '자', el: '수', zo: '쥐', emoji: '🐭' }, { ko: '축', el: '토', zo: '소', emoji: '🐮' },
  { ko: '인', el: '목', zo: '호랑이', emoji: '🐯' }, { ko: '묘', el: '목', zo: '토끼', emoji: '🐰' },
  { ko: '진', el: '토', zo: '용', emoji: '🐲' }, { ko: '사', el: '화', zo: '뱀', emoji: '🐍' },
  { ko: '오', el: '화', zo: '말', emoji: '🐴' }, { ko: '미', el: '토', zo: '양', emoji: '🐑' },
  { ko: '신', el: '금', zo: '원숭이', emoji: '🐵' }, { ko: '유', el: '금', zo: '닭', emoji: '🐔' },
  { ko: '술', el: '토', zo: '개', emoji: '🐶' }, { ko: '해', el: '수', zo: '돼지', emoji: '🐷' },
] as const

const SHENG: Record<string, string> = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' }
const KE: Record<string, string> = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' }
const COLOR_KO: Record<string, string> = { 목: '초록', 화: '빨강', 토: '노랑', 금: '흰색', 수: '남색' }
const COLOR_HEX: Record<string, string> = { 목: '#36B37E', 화: '#FF5630', 토: '#FFAB00', 금: '#8E99AB', 수: '#2B4C7E' }
const NUMS: Record<string, [number, number]> = { 목: [3, 8], 화: [2, 7], 토: [5, 10], 금: [4, 9], 수: [1, 6] }
const BASE: Record<string, number> = { 생받음: 85, 극해줌: 78, 비화: 70, 생해줌: 62, 극받음: 52 }

/** 관계별 총운 카피 — 앱 SHORT_LINES와 톤 통일(재미로 보는 오늘의 기운, 단정 배제) */
const LINES: Record<string, { head: string; body: string; tip: string }> = {
  생받음: {
    head: '기운이 나를 밀어주는 날',
    body: '오늘의 기운이 든든한 후원자처럼 등을 받쳐줍니다. 미뤄둔 부탁이나 제안을 꺼내기 좋고, 우연한 도움이 들어오기 쉬운 흐름이에요.',
    tip: '받은 호의는 가볍게라도 바로 갚아두면 흐름이 두 배로 오래갑니다.',
  },
  극해줌: {
    head: '주도권이 내 손에 있는 날',
    body: '오늘은 흐름을 내가 끌고 가는 형세입니다. 결정을 미루지 말고 선택지를 좁혀보세요. 협상·정리·끊어내기에 유리한 하루예요.',
    tip: '주도권이 있을 때일수록 말투는 부드럽게 — 세게 나가면 얻을 것도 놓칩니다.',
  },
  비화: {
    head: '내 페이스대로 가는 날',
    body: '오늘의 기운이 나와 같은 결이라 익숙한 일에서 안정감이 큽니다. 새 판을 벌이기보다 하던 일을 한 단계 다듬을 때 성과가 나요.',
    tip: '루틴을 지킨 사람에게 조용히 쌓이는 날 — 화려함보다 꾸준함이 답입니다.',
  },
  생해줌: {
    head: '베풀수록 돌아오는 날',
    body: '내 에너지가 밖으로 흐르는 날이라 챙겨줄 일이 많아질 수 있어요. 소모감이 들 수 있지만, 오늘 심은 호의는 이자 붙어 돌아옵니다.',
    tip: '전부 다 떠안지는 말 것 — 도움의 범위를 정해두면 지치지 않습니다.',
  },
  극받음: {
    head: '한 템포 쉬어가는 날',
    body: '기운이 나를 누르는 형세라 무리한 확장·큰 결정은 잠시 보류가 좋습니다. 컨디션 관리와 마무리 점검에 집중하면 손실 없이 지나가요.',
    tip: '오늘의 "안 하기"가 내일의 "잘 하기"를 만듭니다. 일찍 쉬세요.',
  },
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function dayPillarIndex(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
  return ((jdn - 11) % 60 + 60) % 60
}

function relation(me: string, today: string): string {
  if (me === today) return '비화'
  if (SHENG[today] === me) return '생받음'
  if (SHENG[me] === today) return '생해줌'
  if (KE[today] === me) return '극받음'
  return '극해줌'
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

/** KST(UTC+9) 오늘 — 엣지는 UTC로 돌므로 9시간 보정 */
function kstToday(): { y: number; m: number; d: number; wd: number } {
  const t = new Date(Date.now() + 9 * 3600_000)
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), wd: t.getUTCDay() }
}

const WD = ['일', '월', '화', '수', '목', '금', '토']

export default function handler(req: Request) {
  const url = new URL(req.url)
  const origin = url.origin
  // searchParams.get()이 이미 1차 디코딩한 값 — 이중 인코딩만 추가 해제하고, 잘못된 %시퀀스는 원문 사용(URIError 500 방지)
  const zRaw = url.searchParams.get('z') || ''
  let zDecoded = zRaw
  try {
    zDecoded = decodeURIComponent(zRaw)
  } catch {
    /* 오타·크롤러 URL — 목록 페이지로 폴백 */
  }
  const zParam = zDecoded.replace(/띠$/, '')
  const zi = BRANCHES.findIndex((b) => b.zo === zParam)
  const now = kstToday()
  const dateKo = `${now.y}년 ${now.m}월 ${now.d}일 (${WD[now.wd]})`
  const todayIdx = dayPillarIndex(now.y, now.m, now.d)
  const todayStem = STEMS[todayIdx % 10]
  const todayIlju = todayStem.ko + BRANCHES[todayIdx % 12].ko
  const el = todayStem.el

  const zodiacBlock = (i: number, full: boolean) => {
    const b = BRANCHES[i]
    const rel = relation(b.el, el)
    const line = LINES[rel]
    const overall = clamp(BASE[rel] + ((((todayIdx * 7 + i * 5) % 15) + 15) % 15 - 7), 1, 99)
    const love = clamp(BASE[rel] + ((((todayIdx * 3 + i * 2) % 15) + 15) % 15 - 7), 1, 99)
    const money = clamp(BASE[rel] + ((((todayIdx * 5 + i * 4) % 15) + 15) % 15 - 7), 1, 99)
    if (!full)
      return `<li><a href="/unse/${encodeURIComponent(b.zo + '띠')}"><span class="e">${b.emoji}</span> <b>${b.zo}띠</b> <span class="s">${overall}점 · ${esc(line.head)}</span></a></li>`
    return `
    <section class="hero">
      <p class="date">${esc(dateKo)} · 오늘의 일진 <b>${esc(todayIlju)}일</b></p>
      <h1>${b.emoji} ${b.zo}띠 오늘의 운세</h1>
      <p class="score"><b>${overall}</b><span>점</span></p>
      <p class="head">“${esc(line.head)}”</p>
    </section>
    <section class="card">
      <p>${esc(line.body)}</p>
      <ul class="stats">
        <li>💘 애정운 <b>${love}점</b></li>
        <li>💰 금전운 <b>${money}점</b></li>
        <li>🎨 행운의 색 <b style="color:${COLOR_HEX[el]}">${COLOR_KO[el]}</b></li>
        <li>🔢 행운의 숫자 <b>${NUMS[el][todayIdx % 2]}</b></li>
      </ul>
      <p class="tip">💡 ${esc(line.tip)}</p>
    </section>`
  }

  const isOne = zi >= 0
  const title = isOne
    ? `${BRANCHES[zi].zo}띠 오늘의 운세 (${now.m}월 ${now.d}일) | 누리 마인드`
    : `오늘의 운세 — 띠별 무료 운세 (${now.m}월 ${now.d}일) | 누리 마인드`
  const desc = isOne
    ? `${dateKo} ${BRANCHES[zi].zo}띠 오늘의 운세. 총운·애정운·금전운과 행운의 색까지 — 매일 아침 무료로 확인하세요.`
    : `${dateKo} 12띠 오늘의 운세 무료 보기. 쥐띠부터 돼지띠까지 총운 점수와 행운의 색을 한눈에.`
  const canonical = isOne ? `${origin}/unse/${encodeURIComponent(BRANCHES[zi].zo + '띠')}` : `${origin}/unse`
  const ogImg = `${origin}/api/og?k=unse&e=${encodeURIComponent(isOne ? BRANCHES[zi].emoji : '🔮')}`

  const main = isOne
    ? zodiacBlock(zi, true) +
      `<section class="card"><h2>다른 띠 운세</h2><ul class="list">${BRANCHES.map((_, i) => i)
        .filter((i) => i !== zi)
        .map((i) => zodiacBlock(i, false))
        .join('')}</ul></section>`
    : `<section class="hero"><p class="date">${esc(dateKo)} · 오늘의 일진 <b>${esc(todayIlju)}일</b></p><h1>🔮 오늘의 운세 — 띠별 보기</h1><p class="head">내 띠를 골라 오늘의 총운을 확인하세요</p></section>
       <section class="card"><ul class="list">${BRANCHES.map((_, i) => zodiacBlock(i, false)).join('')}</ul></section>`

  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="누리 마인드">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image">
<style>
  :root{color-scheme:light}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Pretendard,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:#FAFCF9;color:#33413A;line-height:1.65;word-break:keep-all}
  .wrap{max-width:520px;margin:0 auto;padding:20px 20px 48px}
  .hero{background:linear-gradient(135deg,#6B4FB8,#A88BF2);border-radius:24px;padding:26px 22px;color:#fff;text-align:center;box-shadow:0 8px 28px rgba(47,107,82,.16)}
  .hero .date{font-size:12.5px;font-weight:700;opacity:.85}
  .hero h1{font-size:24px;font-weight:800;margin-top:6px;letter-spacing:-.02em}
  .hero .score{margin-top:10px;font-size:15px}
  .hero .score b{font-size:46px;font-weight:800;line-height:1}
  .hero .head{margin-top:8px;font-size:15px;font-weight:700;opacity:.95}
  .card{background:#fff;border:1px solid #EAEFEC;border-radius:20px;padding:20px;margin-top:14px;box-shadow:0 2px 12px rgba(47,107,82,.08)}
  .card h2{font-size:16px;font-weight:800;margin-bottom:10px}
  .card p{font-size:15px;font-weight:500}
  .stats{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
  .stats li{background:#F2F5F3;border-radius:14px;padding:10px 12px;font-size:13.5px;font-weight:700}
  .tip{margin-top:14px;font-size:13.5px;font-weight:700;background:#F4F9F6;border-radius:14px;padding:12px}
  .list{list-style:none}
  .list li a{display:flex;align-items:center;gap:8px;padding:11px 6px;border-bottom:1px solid #EAEFEC;text-decoration:none;color:inherit;font-size:14.5px}
  .list li:last-child a{border-bottom:none}
  .list .e{font-size:20px}
  .list .s{margin-left:auto;font-size:12.5px;font-weight:700;color:#6B756E}
  .cta{display:block;margin-top:16px;background:linear-gradient(135deg,#4FA882,#6E9FDC);color:#fff;text-align:center;text-decoration:none;font-weight:800;font-size:15px;border-radius:18px;padding:15px}
  .cta.sub{background:#fff;color:#2F6B52;border:2px solid #C8E3D5}
  footer{margin-top:22px;text-align:center;font-size:11.5px;color:#9AA59E}
  footer a{color:#6B756E}
</style></head>
<body><div class="wrap">
${main}
<a class="cta" href="/fortune">🔮 생년월일로 내 사주 운세 정확히 보기</a>
<a class="cta sub" href="/">🧠 무료 심리검사 17종 해보기 — 누리 마인드</a>
<footer>매일 0시(KST) 갱신 · 재미로 보는 오늘의 기운이에요 · <a href="/">누리 마인드</a></footer>
</div></body></html>`

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // KST 자정 전환을 크게 벗어나지 않게 30분 캐시 + SWR
      'cache-control': 'public, max-age=1800, stale-while-revalidate=600',
    },
  })
}