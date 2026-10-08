import { useState } from 'react'
import { SPRING } from '../lib/motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
import { Card, Chip, TopBar } from '../components/ui'
import { articleById } from '../data/magazine'
import { useT, useL } from '../i18n/useT'
import { useStore } from '../store/useStore'
import { celebrate } from '../lib/confetti'
import { usePageMeta } from '../hooks/usePageMeta'
import Footer from '../components/Footer'
import Emoji, { EmojiText } from '../components/Emoji'
import { toast } from '../lib/toast'

export default function Article() {
  const { id } = useParams<{ id: string }>()
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const a = articleById(id || '')
  const readArticle = useStore((s) => s.readArticle)
  const onboarded = useStore((s) => s.onboarded)
  const claimedBefore = useStore((s) => (a ? s.readArticles.includes(a.id) : false))
  const [justClaimed, setJustClaimed] = useState(false)
  usePageMeta(a ? { title: `${l(a.title)} | 누리 마인드 심리 매거진`, description: l(a.summary), path: `/magazine/${a.id}` } : null)
  if (!a) return <Navigate to="/magazine" replace />

  const done = claimedBefore || justClaimed
  // 본문 중간 배너: 섹션 4개 이상일 때만, 절반을 읽은 경계에 — 짧은 글이면 하단 광고와 붙어 과노출이 되므로 생략
  const midAdAt = a.sections.length >= 4 ? Math.floor(a.sections.length / 2) - 1 : -1
  const onFinish = () => {
    // 가입 전이면 보상이 기록되지 않는다(store.readArticle) — '읽기 완료 ✓'로 바꾸면 받은 것처럼 보였다
    if (!onboarded) {
      toast.info(l({ ko: '시작하기를 마치면 정독 보상(+8P)을 받을 수 있어요', en: 'Finish getting started to earn the reading reward (+8P)', ja: 'はじめるを完了すると精読報酬（+8P）がもらえます' }))
      return
    }
    const got = readArticle(a.id)
    setJustClaimed(true)
    if (got > 0) celebrate()
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/magazine" title={t('mag.title')} />
      <main className="mx-auto max-w-md px-5">
        {/* 히어로 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING.ui}
          className="pt-1 text-center"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-mind-50 shadow-card">
            <Emoji e={a.emoji} size={28} className="floaty" />
          </div>
          <div className="mt-3.5 flex items-center justify-center gap-1.5">
            <Chip tone="mind">{l(a.tag)}</Chip>
            <Chip tone="gray"><Emoji e="📖" inline />{t('mag.read', { n: a.readMin })}</Chip>
          </div>
          <h1 className="mt-3 break-keep text-[24px] font-extrabold leading-tight tracking-tight">{l(a.title)}</h1>
          <p className="mx-auto mt-2.5 max-w-[19rem] break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{l(a.intro)}</p>
        </motion.div>

        {/* 섹션 = 듀오링고식 레슨 카드. 애드센스 승인(2026-10) 후 본문 중간 배너 복귀 — 글 절반을 읽은 섹션 경계 한 곳 */}
        <div className="mt-7 space-y-3.5">
          {a.sections.map((s, i) => (
            <div key={i}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={SPRING.ui}
              >
                <Card className="!p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mind-600 text-[15px] font-extrabold text-white">{i + 1}</span>
                    <h2 className="break-keep text-[17px] font-extrabold leading-snug">{l(s.h)}</h2>
                  </div>
                  {s.key && (
                    <div className="mt-2.5">
                      <Chip tone="mind">✦ {l(s.key)}</Chip>
                    </div>
                  )}
                  <p className="mt-2.5 break-keep text-[15px] font-bold leading-[1.8] text-ink">{l(s.p)}</p>
                  {s.tip && (
                    <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5">
                      <Emoji e="💡" size={15} />
                      <p className="break-keep text-[13px] font-bold leading-relaxed text-amber-700">
                        <span className="opacity-60">{t('mag.tip')} · </span>{l(s.tip)}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
              {i === midAdAt && (
                <div className="mt-3.5">
                  <AdSlot variant="banner" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 핵심 요약 체크리스트 */}
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={SPRING.ui}>
          <Card className="mt-5 !bg-mind-50 dark:!bg-surface !p-4 !shadow-none">
            <h3 className="text-[15px] font-extrabold text-mind-700">{t('mag.keypoints')}</h3>
            <ul className="mt-2.5 space-y-2.5">
              {a.takeaways.map((k, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mind-600 text-[11px] font-extrabold text-white">✓</span>
                  <span className="break-keep text-[14px] font-bold leading-relaxed text-ink">{l(k)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* 마무리 한 줄 */}
        <div className="mt-4 rounded-3xl bg-gradient-to-br from-mind-100 to-mind-50 px-5 py-5 text-center">
          <div className="sparkle leading-none"><Emoji e="🌟" size={24} className="align-top" /></div>
          <p className="mt-1.5 break-keep text-[15px] font-bold leading-relaxed text-mind-700">“{l(a.close)}”</p>
        </div>

        {/* 정독 완료 보상 (듀오링고식 레슨 클리어) */}
        {/* 누르는 순간 버튼이 한 번 '톡' 부풀며 완료색으로 바뀌고(듀오링고 레슨 클리어), 보상 칩이 위로 떠오른다.
            이미 받은 글을 다시 열었을 땐(claimedBefore) 아무것도 움직이지 않는다 */}
        <div className="relative mt-4">
          <motion.button
            type="button"
            onClick={done ? undefined : onFinish}
            disabled={done}
            whileTap={done ? undefined : { scale: 0.97 }}
            animate={justClaimed ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={justClaimed ? { duration: 0.4, times: [0, 0.4, 1], ease: 'easeOut' } : SPRING.press}
            className={`w-full rounded-2xl py-3.5 text-[15px] font-extrabold transition-colors ${
              done ? 'bg-mind-100 text-mind-700' : 'bg-mind-600 text-white shadow-duo active:translate-y-0.5'
            }`}
          >
            <EmojiText text={done ? t('mag.readClaimed') : t('mag.readReward', { n: 8 })} />
          </motion.button>
          {justClaimed && (
            <motion.span
              aria-hidden="true"
              // 가운데 정렬은 framer의 x로(클래스 -translate-x-1/2는 framer가 transform을 덮어써 사라진다 — nuri-lessons-ui)
              initial={{ opacity: 0, x: '-50%', y: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], x: '-50%', y: -34, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], opacity: { duration: 1.1, times: [0, 0.15, 0.7, 1] } }}
              className="pointer-events-none absolute left-1/2 top-0 rounded-full bg-amber-400 px-2.5 py-0.5 text-[13px] font-extrabold text-white shadow-card"
            >
              +8P
            </motion.span>
          )}
        </div>

        {/* 검사 연결 CTA */}
        {a.test && (
          <div className="mt-3">
            <Button color="mind" onClick={() => nav(`/test/${a.test}`)}>
              <Emoji e="🔬" inline />{t('mag.cta', { name: t(`test.${a.test}.name`) })}
            </Button>
          </div>
        )}

        {/* 하단 사각 광고(본문·요약·마무리를 다 읽은 뒤) + 디스클레이머 */}
        <div className="mt-6">
          <AdSlot variant="rect" />
        </div>
        <p className="mt-4 px-2 text-center text-[12px] font-bold leading-relaxed text-ink-faint">{t('mag.disclaimer')}</p>
        <Footer />
      </main>
    </div>
  )
}
