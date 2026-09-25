import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SPRING } from '../lib/motion'
import { TopBar, Card } from '../components/ui'
import IconBadge from '../components/IconBadge'
import ScrollChips from '../components/ScrollChips'
import { useStore } from '../store/useStore'
import { useL, useT } from '../i18n/useT'
import { TESTS } from '../data/tests'
import { TEST_NAME_KEY, TEST_SHORT_KEY } from '../data/terms'
import { PERSONA_VISUAL } from '../i18n/personaVisual'
import type { L, TestId, TestResult } from '../data/types'
import Emoji from '../components/Emoji'
import { round1, shortDate, topPercentOf } from '../lib/format'
import { summarizePersonas } from '../lib/selfSummary'
import { needsCare } from '../data/care'
import type { Persona } from '../i18n/animalTranslations'

/**
 * 나에 관하여 — 흩어져 있던 '내 결과'(검사별 결과 화면), '머리 지도'(종합 인지 프로필),
 * '읽을거리'(심리 매거진)를 한 화면에 모은다.
 *
 * 매거진 글은 관련 검사(article.test)를 갖고 있다 → 내가 해 본 검사와 연결된 글을 먼저 보여 준다.
 * 결과를 보고 끝나는 게 아니라 '왜 그런지·어떻게 하면 좋은지'로 이어지게 하는 것이 이 화면의 일이다.
 */

/** 두뇌 측정 6종 → 결과에 담긴 지수 필드 */
const BRAIN: { id: TestId; get: (r: TestResult) => number | undefined }[] = [
  { id: 'iq', get: (r) => r.iq },
  { id: 'memory', get: (r) => r.mq },
  { id: 'focus', get: (r) => r.fq },
  { id: 'speed', get: (r) => r.sq },
  { id: 'spatial', get: (r) => r.xq },
  { id: 'switch', get: (r) => r.wq },
]

type ArticleHead = { id: string; emoji: string; test?: TestId; title: L; summary: L; readMin: number }

export default function AboutMe() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const results = useStore((s) => s.results)
  const readArticles = useStore((s) => s.readArticles)
  const lang = useStore((s) => s.lang)

  /** 검사별 최신 결과 1개 */
  const latest = useMemo(() => {
    const m = new Map<TestId, TestResult>()
    for (const r of [...results].sort((a, b) => b.at - a.at)) if (!m.has(r.testId)) m.set(r.testId, r)
    return m
  }, [results])

  const deepDone = TESTS.filter((tm) => !tm.precision && latest.has(tm.id))
  const deepLeft = TESTS.filter((tm) => !tm.precision && !latest.has(tm.id))
  const brainDone = BRAIN.filter((b) => latest.has(b.id))

  // 매거진 본문은 무거워(별도 청크) 목록에 필요한 머리글만 뽑는다
  const [articles, setArticles] = useState<ArticleHead[]>([])
  useEffect(() => {
    import('../data/magazine')
      .then((m) => setArticles(m.ARTICLES.map((a) => ({ id: a.id, emoji: a.emoji, test: a.test, title: a.title, summary: a.summary, readMin: a.readMin }))))
      .catch(() => setArticles([]))
  }, [])

  /** 내가 해 본 검사와 연결된 글 → 안 읽은 글 → 최신 글 순. 5개만 */
  const picks = useMemo(() => {
    const read = new Set(readArticles)
    const score = (a: ArticleHead) => (a.test && latest.has(a.test) ? 2 : 0) + (read.has(a.id) ? 0 : 1)
    return [...articles]
      .map((a, i) => ({ a, i }))
      .sort((x, y) => score(y.a) - score(x.a) || y.i - x.i)
      .slice(0, 5)
      .map((x) => x.a)
  }, [articles, readArticles, latest])

  /** 심리검사를 모두 마쳤을 때만 동물 캐릭터 데이터(큰 청크)를 불러와 종합 설명을 만든다 */
  const deepTotal = deepDone.length + deepLeft.length
  const allDone = deepLeft.length === 0 && deepTotal > 0
  const [personas, setPersonas] = useState<Record<string, Persona> | null>(null)
  useEffect(() => {
    if (!allDone || personas) return
    import('../i18n/animalTranslations')
      .then((m) => setPersonas(m.PERSONAS))
      .catch(() => setPersonas({}))
  }, [allDone, personas])

  const summary = useMemo(() => {
    if (!allDone || !personas) return null
    const rows = deepDone.map((tm) => ({ tm, r: latest.get(tm.id)! }))
    const s = summarizePersonas(
      rows.map(({ r }) => personas[r.persona]).filter((p): p is Persona => !!p),
      rows.length,
      l,
    )
    const areas = rows.map(({ tm, r }) => ({
      id: tm.id,
      emoji: tm.emoji,
      color: tm.gradFrom,
      band: t(`band.${tm.id}.${r.band}`),
      line: personas[r.persona] ? l(personas[r.persona].tagline) : '',
      care: needsCare(tm.id, r.band),
    }))
    return { ...s, areas, care: areas.filter((a) => a.care) }
  }, [allDone, personas, deepDone, latest, l, t])

  const sec = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { ...SPRING.ui, delay } })

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '나에 관하여', en: 'About me', ja: '私について' })} />
      <main className="mx-auto max-w-md px-5">
        <p className="text-[14px] font-bold leading-relaxed text-ink-sub">
          {l({
            ko: '내 검사 결과, 머리 지도, 나에게 맞는 읽을거리를 한곳에 모았어요.',
            en: 'Your results, mind map and reads picked for you — in one place.',
            ja: '検査結果・頭の地図・あなた向けの読み物をまとめました。',
          })}
        </p>

        {/* ── 0. 나에 대하여 한눈에 — 심리검사를 모두 마치면 열리는 종합 설명 ── */}
        {deepTotal > 0 && (
          <motion.section {...sec(0)} className="mt-5">
            {!allDone ? (
              <Card className="!p-4">
                <div className="flex items-center gap-3">
                  <IconBadge emoji="🔒" color="#8B5CF6" size={40} radius={13} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-extrabold">
                      {l({ ko: '나에 대하여 한눈에', en: 'You at a glance', ja: 'ひと目でわかる私' })}
                    </p>
                    <p className="mt-0.5 break-keep text-[12px] font-bold text-ink-faint">
                      {l({
                        ko: `심리검사 ${deepTotal}개를 모두 마치면 결과를 한데 모아 설명해 드려요 · ${deepDone.length}/${deepTotal}`,
                        en: `Finish all ${deepTotal} tests to see them read together · ${deepDone.length}/${deepTotal}`,
                        ja: `${deepTotal}件の検査を終えると結果をまとめて説明します・${deepDone.length}/${deepTotal}`,
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={deepTotal} aria-valuenow={deepDone.length}>
                  <div className="h-full rounded-full bg-[#8B5CF6]" style={{ width: `${Math.round((deepDone.length / deepTotal) * 100)}%` }} />
                </div>
              </Card>
            ) : (
              <Card className="!p-5">
                <h2 className="text-[20px] font-extrabold leading-tight">
                  <Emoji e="🪞" inline />
                  {l({ ko: '나에 대하여 한눈에', en: 'You at a glance', ja: 'ひと目でわかる私' })}
                </h2>
                {!summary ? (
                  <p className="mt-3 text-[13px] font-bold text-ink-faint">{l({ ko: '결과를 모으는 중이에요…', en: 'Putting it together…', ja: 'まとめています…' })}</p>
                ) : (
                  <>
                    {/* 심층 리포트 티저(summary.core)는 강점·약한 면을 문장으로 한 번 더 읊어 아래 목록과 겹친다 — 여기선 도입·마무리만 */}
                    <p className="mt-3 break-keep text-[14px] font-bold leading-[1.85] text-ink-sub">
                      {l({
                        ko: `검사 ${deepTotal}개를 나란히 놓고 보면, 여러 결과에 걸쳐 되풀이되는 모습이 있어요.`,
                        en: `Put all ${deepTotal} tests side by side and a few patterns keep showing up.`,
                        ja: `${deepTotal}件の検査を並べてみると、繰り返し現れる姿があります。`,
                      })}
                    </p>

                    {summary.strengths.length > 0 && (
                      <>
                        <p className="mt-4 text-[13px] font-extrabold text-ink-sub">{l({ ko: '나의 강점', en: 'Your strengths', ja: 'あなたの強み' })}</p>
                        <ul className="mt-1.5 space-y-1">
                          {summary.strengths.map((s) => (
                            <li key={s} className="break-keep text-[13px] font-bold leading-relaxed text-ink">
                              <Emoji e="💪" inline />{s}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {summary.risks.length > 0 && (
                      <>
                        <p className="mt-3 text-[13px] font-extrabold text-ink-sub">{l({ ko: '돌보면 좋은 점', en: 'Worth looking after', ja: 'いたわりたい点' })}</p>
                        <ul className="mt-1.5 space-y-1">
                          {summary.risks.map((s) => (
                            <li key={s} className="break-keep text-[13px] font-bold leading-relaxed text-ink">
                              <Emoji e="🌱" inline />{s}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {summary.strengths.length > 0 && summary.risks.length > 0 && (
                      <p className="mt-3 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">
                        {l({
                          ko: '강점과 돌볼 점은 대개 같은 성향의 앞뒷면이에요. 하나만 떼어 고치기보다 둘을 함께 이해할 때 훨씬 다루기 쉬워요.',
                          en: 'Strengths and soft spots are usually two sides of one trait — understanding both together works better than fixing one alone.',
                          ja: '強みといたわりたい点は、たいてい同じ傾向の表と裏。片方だけ直すより、両方を一緒に理解するほうが扱いやすくなります。',
                        })}
                      </p>
                    )}

                    <p className="mt-4 text-[13px] font-extrabold text-ink-sub">{l({ ko: '영역별로 보면', en: 'Area by area', ja: '領域ごとに見ると' })}</p>
                    <ul className="mt-1.5 divide-y divide-line">
                      {summary.areas.map((a) => (
                        <li key={a.id} className="flex items-start gap-2.5 py-2">
                          <Emoji e={a.emoji} size={18} className="mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-extrabold">
                              {t(TEST_SHORT_KEY(a.id))} <span style={{ color: a.color }}>· {a.band}</span>
                            </p>
                            {a.line && <p className="mt-0.5 break-keep text-[12px] font-bold leading-relaxed text-ink-faint">{a.line}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {summary.care.length > 0 && (
                      <div className="mt-3 rounded-2xl bg-mind-50 p-3.5">
                        <p className="break-keep text-[13px] font-bold leading-relaxed text-ink">
                          {l({
                            ko: `${summary.care.map((a) => t(TEST_SHORT_KEY(a.id))).join('·')} 결과는 혼자 견디기보다 전문가와 한 번 이야기해 보면 좋은 구간이에요.`,
                            en: `Your ${summary.care.map((a) => t(TEST_SHORT_KEY(a.id))).join(', ')} results are in a range where talking to a professional can help.`,
                            ja: `${summary.care.map((a) => t(TEST_SHORT_KEY(a.id))).join('・')}の結果は、専門家に一度相談してみるとよい範囲です。`,
                          })}
                        </p>
                      </div>
                    )}

                    <p className="mt-3 break-keep text-[11px] font-bold leading-relaxed text-ink-faint">
                      {l({
                        ko: '자기보고 검사를 모아 본 참고용 설명이에요. 의학적 진단이 아니에요.',
                        en: 'A reference summary of self-report tests — not a medical diagnosis.',
                        ja: '自己報告式検査をまとめた参考用の説明です。医学的な診断ではありません。',
                      })}
                    </p>
                    <button
                      onClick={() => nav('/deep-report')}
                      className="mt-3 flex min-h-[44px] w-full items-center justify-between rounded-2xl bg-surface2 px-4 text-left"
                    >
                      <span className="text-[13px] font-extrabold">
                        <Emoji e="🧭" inline />
                        {l({ ko: 'AI 심층 리포트로 더 깊이 읽기', en: 'Read deeper with the AI report', ja: 'AI深層レポートでさらに詳しく' })}
                      </span>
                      <span className="text-ink-faint" aria-hidden="true">›</span>
                    </button>
                  </>
                )}
              </Card>
            )}
          </motion.section>
        )}

        {/* ── 1. 내 마음 결과 ── */}
        <motion.section {...sec(0)} className="mt-6">
          <h2 className="text-[20px] font-extrabold leading-tight">{l({ ko: '내 마음 결과', en: 'My results', ja: '心の結果' })}</h2>
          {deepDone.length === 0 ? (
            <Card className="mt-3 !p-4">
              <p className="break-keep text-[14px] font-bold leading-relaxed text-ink-sub">
                {l({ ko: '아직 해 본 심리검사가 없어요. 아래에서 하나 골라 시작해 보세요.', en: 'No tests yet. Pick one below to start.', ja: 'まだ検査がありません。下から選んで始めましょう。' })}
              </p>
            </Card>
          ) : (
            <div className="mt-3 space-y-2">
              {deepDone.map((tm) => {
                const r = latest.get(tm.id)!
                const pv = PERSONA_VISUAL[r.persona]
                return (
                  <Card key={tm.id} onClick={() => nav(`/result/${r.id}`)} className="flex items-center gap-3 !p-3.5">
                    <IconBadge emoji={pv?.emoji ?? tm.emoji} color={tm.gradFrom} size={40} radius={13} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-extrabold">{t(TEST_NAME_KEY(tm.id))}</p>
                      <p className="mt-0.5 truncate text-[12px] font-bold text-ink-faint">
                        {l({
                          ko: `상위 ${topPercentOf(r.percentile)}% · ${shortDate(r.at, lang)}`,
                          en: `Top ${topPercentOf(r.percentile)}% · ${shortDate(r.at, lang)}`,
                          ja: `上位${topPercentOf(r.percentile)}%・${shortDate(r.at, lang)}`,
                        })}
                      </p>
                    </div>
                    <span className="text-ink-faint" aria-hidden="true">›</span>
                  </Card>
                )
              })}
            </div>
          )}
          {deepLeft.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-[14px] font-extrabold leading-none text-ink-sub">{l({ ko: '아직 안 해 본 검사', en: 'Not taken yet', ja: 'まだの検査' })}</p>
              <ScrollChips
                items={deepLeft.map((tm) => ({ id: tm.id, emoji: tm.emoji, label: t(TEST_SHORT_KEY(tm.id)), color: tm.gradFrom, onClick: () => nav(`/test/${tm.id}`) }))}
              />
            </>
          )}
        </motion.section>

        {/* ── 2. 머리 지도(종합 인지 프로필) ── */}
        <motion.section {...sec(0.05)} className="mt-6">
          <h2 className="text-[20px] font-extrabold leading-tight">{l({ ko: '머리 지도', en: 'Mind map', ja: '頭の地図' })}</h2>
          <Card onClick={() => nav('/cog')} className="mt-3 !bg-gradient-to-r from-[#5B6CF0] to-[#3B82F6] !p-4">
            <div className="flex items-center gap-3">
              <IconBadge emoji="🧩" tone="frost" size={40} radius={13} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold text-white">
                  {l({ ko: `두뇌 측정 ${brainDone.length}/${BRAIN.length}`, en: `Brain tests ${brainDone.length}/${BRAIN.length}`, ja: `脳の測定 ${brainDone.length}/${BRAIN.length}` })}
                </p>
                <p className="mt-0.5 truncate text-[12px] font-bold text-white/85">
                  {brainDone.length === 0
                    ? l({ ko: '하나만 해도 지도가 그려지기 시작해요', en: 'One test starts your map', ja: '1つで地図が描かれ始めます' })
                    : l({ ko: '추론·기억·집중·속도·공간·전환 레이더 보기', en: 'See your 6-area radar', ja: '6領域レーダーを見る' })}
                </p>
              </div>
              <span className="text-white/80" aria-hidden="true">›</span>
            </div>
            {brainDone.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {brainDone.map((b) => {
                  const v = b.get(latest.get(b.id)!)
                  return (
                    <div key={b.id} className="rounded-xl bg-white/20 px-2 py-1.5 text-center">
                      <p className="truncate text-[11px] font-bold text-white/85">{t(TEST_SHORT_KEY(b.id))}</p>
                      <p className="text-[14px] font-extrabold tabular-nums text-white">{v == null ? '—' : round1(v)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.section>

        {/* ── 3. 나에게 맞는 읽을거리(심리 매거진) ── */}
        <motion.section {...sec(0.1)} className="mt-4">
          <button onClick={() => nav('/magazine')} className="flex min-h-[44px] w-full items-center justify-between">
            <h2 className="text-[20px] font-extrabold leading-tight">{l({ ko: '나에게 맞는 읽을거리', en: 'Reads for you', ja: 'あなた向けの読み物' })}</h2>
            <span className="text-[13px] font-extrabold leading-none text-mind-600">{t('community.all')} ›</span>
          </button>
          <div className="mt-0.5 space-y-2">
            {picks.map((a) => {
              const related = a.test && latest.has(a.test)
              return (
                <Card key={a.id} onClick={() => nav(`/magazine/${a.id}`)} className="flex items-start gap-3 !p-3.5">
                  <Emoji e={a.emoji} size={24} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="break-keep text-[14px] font-extrabold leading-snug">{l(a.title)}</p>
                    <p className="mt-0.5 line-clamp-2 break-keep text-[12px] font-bold leading-relaxed text-ink-sub">{l(a.summary)}</p>
                    <p className="mt-1 text-[11px] font-extrabold text-mind-600">
                      {related && a.test ? l({ ko: `${t(TEST_SHORT_KEY(a.test))} 결과와 연결 · `, en: `Linked to ${t(TEST_SHORT_KEY(a.test))} · `, ja: `${t(TEST_SHORT_KEY(a.test))}の結果と関連・` }) : ''}
                      {l({ ko: `${a.readMin}분 읽기`, en: `${a.readMin} min read`, ja: `${a.readMin}分で読める` })}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </motion.section>
      </main>
    </div>
  )
}
