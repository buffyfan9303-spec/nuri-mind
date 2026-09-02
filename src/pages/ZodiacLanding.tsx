import { useEffect, useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import Footer from '../components/Footer'
import { zodiacTodayLines } from '../lib/saju'

/**
 * 띠별 오늘의 운세 SEO 랜딩 — /zodiac/:slug (12지).
 * 목적: "오늘의 쥐띠 운세" 류 검색 유입 + 콘텐츠 가치 보강(정적 소개 + 매일 갱신 기운 한 줄).
 * 결정론(오늘 날짜 기반) — 로그인·생일 불필요, 크롤러도 방문자와 같은 내용을 본다.
 * 광고 없음 — 애드센스 "콘텐츠 없는 화면" 리스크 원천 차단.
 */

interface ZodiacPage {
  slug: string
  ko: string
  emoji: string
  /** 통설 성격 소개(정적 콘텐츠) */
  intro: string
  /** 성격 키워드 */
  traits: string[]
}

export const ZODIAC_PAGES: ZodiacPage[] = [
  { slug: 'rat', ko: '쥐', emoji: '🐭', traits: ['영리함', '순발력', '알뜰함'], intro: '쥐띠는 12지의 첫 자리답게 눈치가 빠르고 상황 판단이 영리하다고 전해집니다. 기회를 포착하는 순발력과 알뜰한 살림 솜씨가 강점으로 꼽히는 반면, 잔걱정이 많아지는 날엔 마음이 분주해지기 쉽다고 해요.' },
  { slug: 'ox', ko: '소', emoji: '🐮', traits: ['성실함', '끈기', '신뢰'], intro: '소띠는 묵묵히 제 길을 가는 성실함의 대명사입니다. 시간이 걸려도 끝까지 해내는 끈기 덕에 주변의 깊은 신뢰를 얻지만, 고집이 세다는 소리를 듣는 날도 있다고 전해져요.' },
  { slug: 'tiger', ko: '호랑이', emoji: '🐯', traits: ['용맹', '추진력', '카리스마'], intro: '호랑이띠는 결단이 빠르고 추진력이 강한 리더형으로 통합니다. 새로운 일을 벌이는 데 겁이 없지만, 서두르다 세부를 놓치기 쉬운 날엔 한 템포 쉬어가는 게 좋다고 하죠.' },
  { slug: 'rabbit', ko: '토끼', emoji: '🐰', traits: ['온화함', '감각', '배려'], intro: '토끼띠는 온화하고 감각이 섬세해 사람들 사이의 분위기를 부드럽게 만드는 재주가 있다고 합니다. 평화를 중시하는 만큼 갈등 상황에선 스트레스를 크게 받는 편이라 자기 돌봄이 중요해요.' },
  { slug: 'dragon', ko: '용', emoji: '🐲', traits: ['포부', '자신감', '스케일'], intro: '용띠는 12지 중 유일한 상상의 동물답게 포부와 스케일이 크다고 전해집니다. 큰 그림을 그리는 자신감이 매력이지만, 눈높이가 높아 사소한 일에 답답함을 느끼기도 한다고 해요.' },
  { slug: 'snake', ko: '뱀', emoji: '🐍', traits: ['통찰', '집중력', '우아함'], intro: '뱀띠는 조용히 관찰하고 핵심을 꿰뚫는 통찰형으로 통합니다. 몰입할 때의 집중력이 대단하지만, 속마음을 잘 드러내지 않아 오해를 사는 날엔 한 마디 설명이 큰 도움이 됩니다.' },
  { slug: 'horse', ko: '말', emoji: '🐴', traits: ['활동력', '자유', '사교성'], intro: '말띠는 활동적이고 자유를 사랑하는 에너지형입니다. 어디서든 금세 어울리는 사교성이 강점이지만, 답답한 환경에선 쉽게 지루함을 느껴 환기가 필요하다고 전해져요.' },
  { slug: 'sheep', ko: '양', emoji: '🐑', traits: ['다정함', '예술성', '공감'], intro: '양띠는 다정하고 공감 능력이 뛰어나 주변을 편안하게 만드는 힘이 있다고 합니다. 예술 감각이 좋다는 평도 많은데, 거절을 어려워해 혼자 끌어안는 일이 많아지는 날엔 선 긋기 연습이 필요해요.' },
  { slug: 'monkey', ko: '원숭이', emoji: '🐵', traits: ['재치', '손재주', '융통성'], intro: '원숭이띠는 재치와 융통성이 뛰어나 어떤 문제든 우회로를 찾아내는 해결사형으로 통합니다. 다재다능한 만큼 여러 일을 벌이기 쉬워, 마무리에 힘을 주는 날 운이 트인다고 하죠.' },
  { slug: 'rooster', ko: '닭', emoji: '🐔', traits: ['꼼꼼함', '표현력', '부지런함'], intro: '닭띠는 새벽을 여는 부지런함과 꼼꼼한 일처리로 유명합니다. 할 말은 하는 시원한 표현력이 매력이지만, 완벽을 좇다 스스로를 몰아붙이는 날엔 기준을 한 칸 낮추는 게 복이 된다고 해요.' },
  { slug: 'dog', ko: '개', emoji: '🐶', traits: ['의리', '정직', '책임감'], intro: '개띠는 의리와 정직의 상징으로, 한번 맺은 인연을 끝까지 지키는 책임감이 강점입니다. 불의를 참지 못하는 성격이라, 세상일에 마음이 상하는 날엔 좋아하는 사람들과의 시간이 약이 됩니다.' },
  { slug: 'pig', ko: '돼지', emoji: '🐷', traits: ['복덕', '너그러움', '진심'], intro: '돼지띠는 예부터 복과 재물의 상징으로 사랑받아 왔습니다. 너그럽고 진심을 다하는 성품 덕에 사람이 모이지만, 사람 좋다는 말에 손해를 보는 날엔 계산기를 한 번 두드려 보라고 하죠.' },
]

/** 오늘 기운 관계(오행 상생상극) 쉬운 설명 */
const REL_TEXT: Record<string, { title: string; desc: string }> = {
  생받음: { title: '기운을 받는 날 🌊', desc: '오늘의 오행이 내 띠를 밀어주는 최고의 흐름이에요. 미뤄둔 일을 시작하기 좋은 날.' },
  극해줌: { title: '주도권을 쥐는 날 ⚡', desc: '오늘의 기운을 내가 다루는 형세예요. 결정과 협상에서 한 발 앞설 수 있어요.' },
  비화: { title: '같은 기운이 겹치는 날 🤝', desc: '오늘의 오행과 내 띠의 기운이 같아요. 무리한 변화보다 페이스 유지가 이득이에요.' },
  생해줌: { title: '베푸는 날 🎁', desc: '내 기운이 오늘을 밀어주는 날 — 나눔과 도움이 돌아오는 복이 돼요. 에너지 안배는 필수.' },
  극받음: { title: '부딪히는 날 🛡️', desc: '오늘의 기운과 마찰이 있는 형세예요. 큰 결정은 하루 미루고, 컨디션 관리에 집중하세요.' },
}

const SITE = 'https://www.nurimind.co.kr'

export default function ZodiacLanding() {
  const { slug } = useParams()
  const nav = useNavigate()
  const idx = ZODIAC_PAGES.findIndex((z) => z.slug === slug)
  const page = idx >= 0 ? ZODIAC_PAGES[idx] : null

  // KST 고정 — 크롤러(태평양시 렌더)도 한국 사용자와 같은 날짜·운세를 보게(결정론 보장)
  const kst = new Date(Date.now() + 9 * 3600e3)
  const y = kst.getUTCFullYear()
  const km = kst.getUTCMonth() + 1
  const kd = kst.getUTCDate()
  const dateLabel = `${y}년 ${km}월 ${kd}일`
  const lines = useMemo(
    () => zodiacTodayLines({ y, m: km, d: kd }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateLabel],
  )
  const line = idx >= 0 ? lines[idx] : null
  const rel = line ? REL_TEXT[line.relation] : null
  // 해당 띠 출생년도(1949~현재+1)
  const years = useMemo(() => {
    if (idx < 0) return []
    const out: number[] = []
    for (let yy = 1949; yy <= y + 1; yy++) if ((((yy - 4) % 12) + 12) % 12 === idx) out.push(yy)
    return out
  }, [idx, y])

  // SEO 메타 — 언마운트 시 원복
  useEffect(() => {
    if (!page) return
    const prevTitle = document.title
    const md = document.querySelector('meta[name="description"]')
    const prevDesc = md?.getAttribute('content') ?? ''
    const cl = document.querySelector('link[rel="canonical"]')
    const prevCanon = cl?.getAttribute('href') ?? ''
    document.title = `오늘의 ${page.ko}띠 운세 (${dateLabel}) | 누리 마인드`
    md?.setAttribute(
      'content',
      `${dateLabel} ${page.ko}띠 운세 — 음양오행으로 보는 오늘의 기운과 ${page.ko}띠 성격·출생년도. 생년월일을 넣으면 사주(일주) 기반 상세 운세까지 무료.`,
    )
    cl?.setAttribute('href', `${SITE}/zodiac/${page.slug}`)
    return () => {
      document.title = prevTitle
      md?.setAttribute('content', prevDesc)
      if (prevCanon) cl?.setAttribute('href', prevCanon)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.slug, dateLabel])

  if (!page || !line) return <Navigate to="/fortune" replace />

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/fortune" title={`${page.ko}띠 운세`} />
      <main className="mx-auto max-w-md px-5">
        {/* 히어로 */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
          <p className="text-[28px] leading-none">{page.emoji}</p>
          <h1 className="mt-3 break-keep text-[20px] font-extrabold leading-tight">오늘의 {page.ko}띠 운세</h1>
          <p className="mt-1.5 text-[13px] font-medium text-ink-faint">{dateLabel} · 음양오행 기준</p>
        </motion.div>

        {/* 오늘의 기운(매일 갱신) */}
        <Card className="mt-5 !bg-gradient-to-br from-[#6B4FB8] to-[#A88BF2] !p-5 text-white">
          {rel && <p className="text-[13px] font-semibold text-white/85">{rel.title}</p>}
          <p className="mt-1.5 break-keep text-[16px] font-semibold leading-relaxed">{line.line.ko}</p>
          {rel && <p className="mt-2 break-keep text-[12px] font-medium leading-relaxed text-white/85">{rel.desc}</p>}
        </Card>

        {/* 정확한 운세 CTA */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <Button color="mind" onClick={() => nav('/fortune')}>
            🔮 내 사주로 정확히
          </Button>
          <Button color="white" onClick={() => nav('/compat')}>
            💞 생일 궁합 보기
          </Button>
        </div>

        {/* 띠 소개(정적 콘텐츠) */}
        <Card className="mt-4 !p-5">
          <h2 className="text-[15px] font-semibold">
            {page.emoji} {page.ko}띠는 어떤 사람?
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {page.traits.map((tr) => (
              <span key={tr} className="rounded-full bg-mind-50 px-2.5 py-1 text-[12px] font-semibold text-mind-700">
                #{tr}
              </span>
            ))}
          </div>
          <p className="mt-3 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">{page.intro}</p>
          <p className="mt-3 break-keep text-[12px] font-medium leading-relaxed text-ink-faint">
            {page.ko}띠 출생년도: {years.join(' · ')}년
          </p>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-ink-faint">
            ⓘ 띠 성격과 운세는 전통 통설을 재미로 정리한 참고 콘텐츠로, 과학적 사실이 아닙니다.
          </p>
        </Card>

        {/* 심리검사 퍼널 — 재미 콘텐츠 → 본업(검사) 연결 */}
        <Card onClick={() => nav('/')} className="mt-3.5 flex items-center gap-3 !p-4">
          <span className="text-[24px]">🧠</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold">성격이 궁금하면 심리검사로</h3>
            <p className="mt-0.5 break-keep text-[12px] font-medium text-ink-faint">자존감·애착·번아웃 등 공개 척도 기반 12종 무료</p>
          </div>
          <span className="shrink-0 text-[15px] text-ink-faint">›</span>
        </Card>

        {/* 12지 내부 링크 */}
        <h2 className="mt-6 px-1 text-[14px] font-semibold">다른 띠 오늘의 운세</h2>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {ZODIAC_PAGES.map((z) => (
            <button
              key={z.slug}
              onClick={() => nav(`/zodiac/${z.slug}`)}
              className={`rounded-2xl border-2 py-2 text-center ${z.slug === page.slug ? 'border-mind-400 bg-mind-50 text-mind-800 dark:bg-mind-500/20 dark:text-mind-100' : 'border-line bg-surface'}`}
            >
              <span className="text-[20px]">{z.emoji}</span>
              <p className="text-[11px] font-semibold">{z.ko}띠</p>
            </button>
          ))}
        </div>

        <Footer />
      </main>
    </div>
  )
}
