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

  const sec = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { ...SPRING.ui, delay } })

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '나에 관하여', en: 'About me', ja: '私について' })} />
      <main className="mx-auto max-w-md px-5">
        <p className="px-1 text-[14px] font-medium leading-relaxed text-ink-sub">
          {l({
            ko: '내 검사 결과, 머리 지도, 나에게 맞는 읽을거리를 한곳에 모았어요.',
            en: 'Your results, mind map and reads picked for you — in one place.',
            ja: '検査結果・頭の地図・あなた向けの読み物をまとめました。',
          })}
        </p>

        {/* ── 1. 내 마음 결과 ── */}
        <motion.section {...sec(0)} className="mt-5">
          <h2 className="px-1 text-[17px] font-semibold">{l({ ko: '내 마음 결과', en: 'My results', ja: '心の結果' })}</h2>
          {deepDone.length === 0 ? (
            <Card className="mt-2.5 !p-4">
              <p className="break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
                {l({ ko: '아직 해 본 심리검사가 없어요. 아래에서 하나 골라 시작해 보세요.', en: 'No tests yet. Pick one below to start.', ja: 'まだ検査がありません。下から選んで始めましょう。' })}
              </p>
            </Card>
          ) : (
            <div className="mt-2.5 space-y-2">
              {deepDone.map((tm) => {
                const r = latest.get(tm.id)!
                const pv = PERSONA_VISUAL[r.persona]
                return (
                  <Card key={tm.id} onClick={() => nav(`/result/${r.id}`)} className="flex items-center gap-3 !p-3.5">
                    <IconBadge emoji={pv?.emoji ?? tm.emoji} color={tm.gradFrom} size={40} radius={13} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">{t(TEST_NAME_KEY(tm.id))}</p>
                      <p className="mt-0.5 truncate text-[12px] font-medium text-ink-faint">
                        {l({ ko: `상위 ${Math.max(1, 100 - r.percentile)}% · ${new Date(r.at).toLocaleDateString('ko-KR')}`, en: `Top ${Math.max(1, 100 - r.percentile)}% · ${new Date(r.at).toLocaleDateString('en-US')}`, ja: `上位${Math.max(1, 100 - r.percentile)}%・${new Date(r.at).toLocaleDateString('ja-JP')}` })}
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
              <p className="mt-4 px-1 text-[13px] font-semibold text-ink-sub">{l({ ko: '아직 안 해 본 검사', en: 'Not taken yet', ja: 'まだの検査' })}</p>
              <ScrollChips
                items={deepLeft.map((tm) => ({ id: tm.id, emoji: tm.emoji, label: t(TEST_SHORT_KEY(tm.id)), color: tm.gradFrom, onClick: () => nav(`/test/${tm.id}`) }))}
              />
            </>
          )}
        </motion.section>

        {/* ── 2. 머리 지도(종합 인지 프로필) ── */}
        <motion.section {...sec(0.05)} className="mt-4">
          <h2 className="px-1 text-[17px] font-semibold">{l({ ko: '머리 지도', en: 'Mind map', ja: '頭の地図' })}</h2>
          <Card onClick={() => nav('/cog')} className="mt-2.5 !bg-gradient-to-r from-[#5B6CF0] to-[#3B82F6] !p-4">
            <div className="flex items-center gap-3">
              <IconBadge emoji="🧩" tone="frost" size={40} radius={13} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-white">
                  {l({ ko: `두뇌 측정 ${brainDone.length}/${BRAIN.length}`, en: `Brain tests ${brainDone.length}/${BRAIN.length}`, ja: `脳の測定 ${brainDone.length}/${BRAIN.length}` })}
                </p>
                <p className="mt-0.5 truncate text-[12px] font-medium text-white/85">
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
                      <p className="truncate text-[11px] font-medium text-white/85">{t(TEST_SHORT_KEY(b.id))}</p>
                      <p className="text-[14px] font-semibold tabular-nums text-white">{v ?? '—'}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.section>

        {/* ── 3. 나에게 맞는 읽을거리(심리 매거진) ── */}
        <motion.section {...sec(0.1)} className="mt-4">
          <button onClick={() => nav('/magazine')} className="flex w-full items-center justify-between px-1 py-1">
            <h2 className="text-[17px] font-semibold">{l({ ko: '나에게 맞는 읽을거리', en: 'Reads for you', ja: 'あなた向けの読み物' })}</h2>
            <span className="text-[12px] font-semibold text-mind-600">{t('community.all')} ›</span>
          </button>
          <div className="mt-1.5 space-y-2">
            {picks.map((a) => {
              const related = a.test && latest.has(a.test)
              return (
                <Card key={a.id} onClick={() => nav(`/magazine/${a.id}`)} className="flex items-start gap-3 !p-3.5">
                  <span className="shrink-0 text-[24px] leading-none" aria-hidden="true">{a.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="break-keep text-[14px] font-semibold leading-snug">{l(a.title)}</p>
                    <p className="mt-0.5 line-clamp-2 break-keep text-[12px] font-medium leading-relaxed text-ink-faint">{l(a.summary)}</p>
                    <p className="mt-1 text-[11px] font-semibold text-mind-600">
                      {related && a.test ? l({ ko: `${t(TEST_SHORT_KEY(a.test))} 결과와 연결 · `, en: `Linked to ${t(TEST_SHORT_KEY(a.test))} · `, ja: `${t(TEST_SHORT_KEY(a.test))}の結果と関連・` }) : ''}
                      {l({ ko: `${a.readMin}분`, en: `${a.readMin} min`, ja: `${a.readMin}分` })}
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
