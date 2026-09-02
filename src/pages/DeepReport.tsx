import { useEffect, useMemo, useRef, useState } from 'react'
import { SPRING } from '../lib/motion'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, TopBar } from '../components/ui'
import { PERSONAS } from '../i18n/animalTranslations'
import { TESTS } from '../data/tests'
import { useStore, isPremium, PREMIUM_KRW } from '../store/useStore'
import { track } from '../lib/analytics'
import { useT, useL } from '../i18n/useT'
import { SECTION_EMOJI, buildPayload, fetchDeepReport, type DeepReport as Report } from '../lib/deepReport'
import { burst } from '../lib/confetti'

/**
 * 🧬 AI 종합 심층 리포트 (프리미엄) — 심층검사 11종을 가로질러 "한 사람"으로 통합.
 *
 * 3상태: ①미완주(잠금+진행률) ②완주·비프리미엄(핵심요약 티저 + 잠긴 섹션 + 프리미엄 CTA)
 *        ③완주·프리미엄(엣지 생성 → 캐시 렌더, 실패 시 정적 폴백)
 * 비용 가드: 비프리미엄은 엣지를 호출하지 않는다(정적 티저만).
 */

/** 심층검사(비정밀) 목록 — 완주 판정 기준 */
const DEEP_IDS = TESTS.filter((t) => !t.precision).map((t) => t.id)
/** 캐시 키(store.aiReportText) · 재생성 쿨다운 */
const CACHE_KEY = 'deep'
const REGEN_COOLDOWN_MS = 24 * 3600e3

/** 섹션 순서(엣지 SECTION_KEYS와 동일) — 잠금 목록·정렬에 사용 */
const ORDER = ['core', 'strengths', 'shadow', 'relations', 'work', 'stress', 'cognition', 'roadmap']

export default function DeepReport() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const results = useStore((s) => s.results)
  const premiumUntil = useStore((s) => s.premiumUntil)
  const nickname = useStore((s) => s.nickname)
  const lang = useStore((s) => s.lang)
  const aiReportText = useStore((s) => s.aiReportText)
  const setAiReportText = useStore((s) => s.setAiReportText)
  const premium = isPremium(premiumUntil)

  /** 검사별 최신 결과 1개씩 */
  const latest = useMemo(() => {
    const by: Record<string, (typeof results)[number]> = {}
    for (const r of [...results].sort((a, b) => b.at - a.at)) if (!by[r.testId]) by[r.testId] = r
    return Object.values(by)
  }, [results])

  const doneDeep = useMemo(() => DEEP_IDS.filter((id) => latest.some((r) => r.testId === id)), [latest])
  const complete = doneDeep.length >= DEEP_IDS.length

  // 페이월 노출을 1회만 계측 — 전환율의 분모다(클릭만 세면 '몇 명이 보고 안 눌렀는지'를 모른다).
  // 잠금 화면이 실제로 렌더되는 조건(완주했는데 프리미엄이 아님)에서만 센다.
  const seenPaywall = useRef(false)
  useEffect(() => {
    if (premium || !complete || seenPaywall.current) return
    seenPaywall.current = true
    track('paywall_view', { surface: 'deep_report', price: PREMIUM_KRW })
  }, [premium, complete])
  const hasCognition = latest.some((r) => r.iq || r.mq || r.fq || r.sq || r.xq || r.wq)

  /** 캐시된 리포트 */
  const cached = useMemo<Report | null>(() => {
    const raw = aiReportText[CACHE_KEY]
    if (!raw) return null
    try {
      const p = JSON.parse(raw) as Report
      return Array.isArray(p?.sections) && p.sections.length ? p : null
    } catch {
      return null
    }
  }, [aiReportText])

  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  /** 정적 폴백/티저 — 페르소나 조합(LLM 없이도 의미 있는 요약) */
  const staticCore = useMemo(() => {
    // 같은 페르소나가 여러 검사에 걸릴 수 있어 문구가 중복되므로 dedupe 후 슬라이스
    const ps = latest.map((r) => PERSONAS[r.persona]).filter(Boolean)
    const uniq = (arr: string[], n: number) => [...new Set(arr)].slice(0, n)
    const strengths = uniq(ps.flatMap((p) => p!.strengths.slice(0, 1)).map((x) => l(x)), 3)
    const risks = uniq(ps.flatMap((p) => p!.risks.slice(0, 1)).map((x) => l(x)), 2)
    if (!strengths.length) return ''
    return l({
      ko: `${doneDeep.length}개 검사가 공통으로 가리키는 건 이런 모습이에요. ${strengths.join(', ')}. 동시에 ${risks.join(', ')} 같은 면도 함께 보입니다. 강점과 취약함은 대개 같은 성향의 앞뒷면이라, 하나만 떼어 고치기보다 둘을 같이 이해할 때 훨씬 잘 다뤄집니다.`,
      en: `Across ${doneDeep.length} tests, a consistent picture emerges — ${strengths.join(', ')}. Alongside it: ${risks.join(', ')}. Strengths and vulnerabilities are usually two sides of one trait, so understanding both together works better than fixing one alone.`,
      ja: `${doneDeep.length}件の検査が共通して示すのは — ${strengths.join('、')}。同時に${risks.join('、')}という面も見えます。強みと弱さは同じ傾向の表裏であることが多く、両方をまとめて理解するほうがうまく扱えます。`,
    })
  }, [latest, doneDeep.length, l])

  /** 프리미엄 + 완주 + 캐시 없음 → 자동 생성 1회.
   *  ⚠️ loading을 deps에 넣으면 setLoading(true)가 이펙트를 재실행시키고 cleanup이 즉시
   *     alive=false로 만들어 응답 처리가 통째로 스킵된다(무한 로딩). 시작 여부는 ref로 관리. */
  const startedRef = useRef(false)
  useEffect(() => {
    if (!premium || !complete || cached || failed || startedRef.current) return
    startedRef.current = true
    let alive = true
    setLoading(true)
    const payload = buildPayload(results, (id) => t(`test.${id}.name`), lang, nickname)
    fetchDeepReport(payload).then((rep) => {
      if (!alive) return
      setLoading(false)
      if (rep) {
        setAiReportText(CACHE_KEY, JSON.stringify(rep))
        burst()
      } else setFailed(true)
    })
    return () => {
      // ⚠️ StrictMode 이중 마운트: cleanup에서 ref를 되돌리지 않으면 두 번째(진짜) 실행이
      //    가드에 막히고 첫 실행 응답은 여기서 버려져 영구 로딩이 된다.
      alive = false
      startedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premium, complete, cached, failed])

  const canRegen = cached ? Date.now() - cached.at > REGEN_COOLDOWN_MS : false
  const regen = () => {
    startedRef.current = false
    setFailed(false)
    setAiReportText(CACHE_KEY, '')
  }
  const retry = () => {
    startedRef.current = false
    setFailed(false)
  }

  const sections = useMemo(() => {
    if (!cached) return []
    return [...cached.sections].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key))
  }, [cached])

  /* ── ① 미완주 ── */
  if (!complete) {
    const left = DEEP_IDS.length - doneDeep.length
    const pct = Math.round((doneDeep.length / DEEP_IDS.length) * 100)
    return (
      <div className="bg-dots min-h-dvh pb-36">
        <TopBar back="/" title={l({ ko: 'AI 종합 심층 리포트', en: 'AI Deep Report', ja: 'AI総合レポート' })} />
        <main className="mx-auto max-w-md px-5 pt-8 text-center">
          <div className="text-6xl">🧬</div>
          <h1 className="mt-4 break-keep text-[20px] font-extrabold tracking-tight">
            {l({ ko: '심층검사를 모두 마치면 열려요', en: 'Unlocks when all deep tests are done', ja: '深層検査を全て終えると解放' })}
          </h1>
          <p className="mt-2 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
            {l({
              ko: `검사 하나씩이 아니라, ${DEEP_IDS.length}개를 가로질러 '한 사람'으로 읽어드려요. ${left}개 남았어요.`,
              en: `Not test by test — we read all ${DEEP_IDS.length} as one person. ${left} to go.`,
              ja: `検査ごとではなく、${DEEP_IDS.length}件を横断して「一人」として読みます。あと${left}件。`,
            })}
          </p>
          <Card className="mt-6 !p-5">
            <div className="flex items-end justify-between">
              <span className="text-[13px] font-semibold text-ink-sub">
                {l({ ko: '완주 진행', en: 'Progress', ja: '進捗' })}
              </span>
              <span className="text-[20px] font-extrabold text-mind-700">
                {doneDeep.length}/{DEEP_IDS.length}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={SPRING.ui}
                className="h-full rounded-full bg-gradient-to-r from-mind-500 to-sky2-500"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {DEEP_IDS.map((id) => {
                const on = doneDeep.includes(id)
                const meta = TESTS.find((x) => x.id === id)!
                return (
                  <button
                    key={id}
                    onClick={() => nav(`/test/${id}`)}
                    className={`rounded-full px-2.5 py-1.5 text-[12px] font-semibold${on ? 'bg-mind-100 text-mind-700' : 'bg-surface2 text-ink-faint'}`}
                  >
                    {on ? '✓' : meta.emoji} {t(`test.${id}.short`)}
                  </button>
                )
              })}
            </div>
          </Card>
          <div className="mx-auto mt-6 max-w-[260px]">
            <Button color="mind" onClick={() => nav('/')}>
              🧠 {l({ ko: '검사 이어서 하기', en: 'Continue tests', ja: '検査を続ける' })}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  /* ── ②③ 완주 ── */
  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: 'AI 종합 심층 리포트', en: 'AI Deep Report', ja: 'AI総合レポート' })} />
      <main className="mx-auto max-w-md px-5">
        {/* 히어로 */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING.ui}
          className="mt-4 rounded-3xl bg-gradient-to-br from-[#6E7BF2] to-[#A88BF2] p-5 text-white shadow-pop"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[28px] leading-none">🧬</span>
            <div className="min-w-0 flex-1">
              <h1 className="break-keep text-[17px] font-semibold leading-tight">
                {l({ ko: 'AI 종합 심층 리포트', en: 'AI Deep Report', ja: 'AI総合レポート' })}
              </h1>
              <p className="mt-0.5 break-keep text-[12px] font-medium text-white/85">
                {l({
                  ko: `${DEEP_IDS.length}개 검사를 하나로 읽은 ${nickname}님 설명서`,
                  en: `${DEEP_IDS.length} tests, read as one person`,
                  ja: `${DEEP_IDS.length}件を一つに読んだ取扱説明書`,
                })}
              </p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[12px] font-semibold">
            ✅ {l({ ko: `심층검사 ${DEEP_IDS.length}종 완주`, en: `All ${DEEP_IDS.length} deep tests done`, ja: `深層検査${DEEP_IDS.length}種完走` })}
          </div>
        </motion.div>

        {/* 프리미엄: 생성 중 */}
        {premium && loading && (
          <Card className="mt-4 !p-6 text-center">
            <motion.div
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="text-[28px] leading-none"
            >
              🧬
            </motion.div>
            <p className="mt-3 break-keep text-[14px] font-semibold">
              {l({ ko: '검사들을 하나로 엮는 중…', en: 'Weaving your tests together…', ja: '検査を一つに織り込み中…' })}
            </p>
            <p className="mt-1 text-[12px] font-medium text-ink-faint">
              {l({ ko: '20초 정도 걸려요', en: 'About 20 seconds', ja: '20秒ほどかかります' })}
            </p>
          </Card>
        )}

        {/* 프리미엄: 리포트 본문 */}
        {premium &&
          sections.map((s, i) => (
            <motion.div
              key={s.key || i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING.ui, delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className="mt-3.5 !p-5">
                <h2 className="flex items-center gap-2 break-keep text-[16px] font-semibold">
                  <span>{SECTION_EMOJI[s.key] ?? '📄'}</span>
                  {s.title}
                </h2>
                <p className="mt-2.5 whitespace-pre-line break-keep text-[14px] font-medium leading-[1.85] text-ink-sub">
                  {s.body}
                </p>
              </Card>
            </motion.div>
          ))}

        {/* 프리미엄: 엣지 실패 → 정적 폴백 */}
        {premium && failed && (
          <Card className="mt-3.5 !p-5">
            <h2 className="flex items-center gap-2 text-[16px] font-semibold">{l({ ko: '핵심 성격 요약', en: 'Core summary', ja: '中核サマリー' })}</h2>
            <p className="mt-2.5 break-keep text-[14px] font-medium leading-[1.85] text-ink-sub">{staticCore}</p>
            <p className="mt-3 rounded-2xl bg-surface2 px-3.5 py-2.5 text-[12px] font-medium leading-relaxed text-ink-faint">
              ⓘ {l({
                ko: 'AI 생성이 일시적으로 어려워 기본 요약을 보여드렸어요. 잠시 후 다시 시도할 수 있어요.',
                en: 'AI generation is temporarily unavailable, so here is the basic summary. You can retry shortly.',
                ja: 'AI生成が一時的に難しく、基本サマリーを表示しました。後ほど再試行できます。',
              })}
            </p>
            <div className="mt-3">
              <Button color="mind" size="sm" onClick={retry}>
                {l({ ko: '다시 시도', en: 'Retry', ja: '再試行' })}
              </Button>
            </div>
          </Card>
        )}

        {/* 리포트 → 실행 연결: 성장 플랜 */}
        {premium && (cached || failed) && (
          <Card
            onClick={() => nav('/growth')}
            ariaLabel={l({ ko: '성장 플랜 열기', en: 'Open growth plan', ja: '成長プランを開く' })}
            className="mt-3.5 flex items-center gap-3 !bg-gradient-to-r from-mind-500 to-sky2-500 !p-4"
          >
            <span className="text-[24px]">🌱</span>
            <div className="min-w-0 flex-1">
              <h3 className="break-keep text-[15px] font-semibold text-white">
                {l({ ko: '읽었으면, 이제 실천으로', en: 'Now turn it into action', ja: '読んだら実践へ' })}
              </h3>
              <p className="mt-0.5 break-keep text-[12px] font-medium text-white/85">
                {l({ ko: '오늘 할 일로 바꿔주는 성장 플랜', en: 'A growth plan with daily actions', ja: '今日の行動に変える成長プラン' })}
              </p>
            </div>
            <span className="shrink-0 text-[15px] text-white/80">›</span>
          </Card>
        )}

        {/* 프리미엄: 재생성 */}
        {premium && cached && (
          <div className="mt-4 text-center">
            <button
              onClick={regen}
              disabled={!canRegen}
              className={`text-[12px] font-semibold${canRegen ? 'text-mind-600' : 'text-ink-faint/60'}`}
            >
              {canRegen
                ? `🔄 ${l({ ko: '리포트 다시 생성', en: 'Regenerate report', ja: 'レポート再生成' })}`
                : l({ ko: '재생성은 하루 1회예요', en: 'Regenerate once a day', ja: '再生成は1日1回' })}
            </button>
          </div>
        )}

        {/* 비프리미엄: 티저 + 잠금 목록 + CTA */}
        {!premium && (
          <>
            <Card className="mt-4 !p-5">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">
                {l({ ko: '핵심 성격 요약', en: 'Core summary', ja: '中核サマリー' })}
              </h2>
              <p className="mt-2.5 break-keep text-[14px] font-medium leading-[1.85] text-ink-sub">{staticCore}</p>
            </Card>

            <Card className="mt-3.5 !p-5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-faint">
                🔒 {l({ ko: '프리미엄에서 전체 공개', en: 'Full report in Premium', ja: 'プレミアムで全公開' })}
              </p>
              <div className="mt-2.5">
                {ORDER.filter((k) => k !== 'core' && (k !== 'cognition' || hasCognition)).map((k, i, arr) => (
                  <div
                    key={k}
                    className={`flex items-center gap-2.5 py-3 ${i < arr.length - 1 ? 'border-b border-line' : ''}`}
                  >
                    <span className="text-[15px] opacity-40">🔒</span>
                    <span className="flex-1 break-keep text-[14px] font-bold text-ink-sub">
                      {SECTION_EMOJI[k]}{' '}
                      {l(
                        {
                          strengths: { ko: '타고난 강점', en: 'Natural strengths', ja: '生まれ持った強み' },
                          shadow: { ko: '그림자와 취약 지점', en: 'Shadow & blind spots', ja: '影と弱点' },
                          relations: { ko: '관계 속의 나', en: 'Me in relationships', ja: '関係の中の私' },
                          work: { ko: '일과 성취 스타일', en: 'Work & achievement style', ja: '仕事と達成スタイル' },
                          stress: { ko: '스트레스와 회복', en: 'Stress & recovery', ja: 'ストレスと回復' },
                          cognition: { ko: '인지 프로필', en: 'Cognitive profile', ja: '認知プロフィール' },
                          roadmap: { ko: '90일 성장 로드맵', en: '90-day growth roadmap', ja: '90日成長ロードマップ' },
                        }[k]!,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING.ui, delay: 0.1 }}
            >
              <Card
                onClick={() => {
                  track('paywall_click', { surface: 'deep_report', price: PREMIUM_KRW })
                  nav('/premium')
                }}
                className="mt-3.5 !bg-gradient-to-br from-[#6E7BF2] to-[#A88BF2] !p-5 text-white"
              >
                <p className="flex items-center gap-2 text-[15px] font-semibold">
                  ✨ {l({ ko: '프리미엄으로 전체 해금', en: 'Unlock everything with Premium', ja: 'プレミアムで全解放' })}
                </p>
                <p className="mt-1.5 break-keep text-[13px] font-medium leading-relaxed text-white/90">
                  {l({
                    ko: `전 섹션 + 운세 무제한 + 광고 제거 · 월 ₩${PREMIUM_KRW.toLocaleString()}`,
                    en: `All sections + unlimited fortune + no ads · ₩${PREMIUM_KRW.toLocaleString()}/mo`,
                    ja: `全セクション+運勢無制限+広告除去・月₩${PREMIUM_KRW.toLocaleString()}`,
                  })}
                </p>
                <div className="mt-3 rounded-2xl bg-white px-4 py-2.5 text-center text-[14px] font-semibold text-[#5B4FD8]">
                  {l({ ko: '프리미엄 시작하기 →', en: 'Start Premium →', ja: 'プレミアム開始 →' })}
                </div>
              </Card>
            </motion.div>
          </>
        )}

        <p className="mt-5 break-keep px-2 text-center text-[11px] font-medium leading-relaxed text-ink-faint">
          ⓘ {l({
            ko: '이 리포트는 자기 이해를 돕는 참고 자료이며, 의학적 진단을 대신하지 않습니다.',
            en: 'This report supports self-understanding and does not replace medical diagnosis.',
            ja: 'このレポートは自己理解の参考であり、医学的診断に代わるものではありません。',
          })}
        </p>
      </main>
    </div>
  )
}
