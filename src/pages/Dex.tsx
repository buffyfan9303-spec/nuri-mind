import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, Modal, TopBar } from '../components/ui'
import { PERSONAS, PERSONA_TEST } from '../i18n/animalTranslations'
import { TESTS } from '../data/tests'
import type { TestId } from '../data/types'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

/** 검사별 페르소나 목록 (PERSONA_TEST 등록 순서 유지) */
const BY_TEST: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {}
  for (const [key, tid] of Object.entries(PERSONA_TEST)) {
    ;(m[tid] = m[tid] || []).push(key)
  }
  return m
})()

const TOTAL = Object.keys(PERSONA_TEST).length

export default function Dex() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const results = useStore((s) => s.results)
  const [detail, setDetail] = useState<string | null>(null)

  // 본인 검사로 획득한 동물 (추후: 친구 초대 수집분 합산)
  const owned = useMemo(() => new Set(results.map((r) => r.persona)), [results])
  const count = useMemo(() => [...owned].filter((k) => PERSONA_TEST[k]).length, [owned])
  const pct = Math.round((count / TOTAL) * 100)

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/profile" title={t('dex.title')} />
      <main className="mx-auto max-w-md px-5">
        {/* 진행 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="rounded-3xl bg-gradient-to-br from-mind-500 to-sky2-500 p-5 text-white shadow-pop"
        >
          <p className="text-[13.5px] font-extrabold tracking-wide text-white/85">{t('dex.sub')}</p>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-[34px] font-extrabold leading-none">{count}</span>
            <span className="pb-1 text-[16px] font-extrabold text-white/80">/ {TOTAL} 마리</span>
            <span className="ml-auto pb-1 text-[15px] font-extrabold text-white/90">{pct}%</span>
          </div>
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white/25">
            <motion.div
              className="h-full rounded-full bg-surface"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.2 }}
            />
          </div>
        </motion.div>

        {/* 친구 초대 수집 (소셜 컬렉션) */}
        <Card onClick={() => nav('/rewards')} className="mt-3.5 flex items-center gap-3.5 !bg-gradient-to-r from-amber-50 to-mind-50 !p-4">
          <span className="text-[28px]">🤝</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold leading-tight">{t('dex.friendTitle')}</h3>
            <p className="mt-0.5 break-keep text-[12.5px] font-bold leading-snug text-ink-faint">{t('dex.friendDesc')}</p>
          </div>
          <span className="shrink-0 text-lg text-ink-faint">›</span>
        </Card>

        {/* 검사별 도감 섹션 */}
        {TESTS.map((tm, ti) => {
          const keys = BY_TEST[tm.id] || []
          const got = keys.filter((k) => owned.has(k)).length
          return (
            <section key={tm.id} className="mt-6">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[18px]">{tm.emoji}</span>
                <h2 className="text-[16px] font-extrabold tracking-tight">{t(`test.${tm.id}.name`)}</h2>
                <span className="ml-auto text-[12.5px] font-extrabold text-ink-faint">
                  {got}/{keys.length}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-4 gap-2.5">
                {keys.map((key, i) => {
                  const p = PERSONAS[key]
                  const has = owned.has(key)
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min((ti * 4 + i) * 0.015, 0.4), type: 'spring', stiffness: 260, damping: 22 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        sfx.tap()
                        if (has) setDetail(key)
                        else nav(`/test/${tm.id}`)
                      }}
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2"
                      style={{
                        borderColor: has ? `${p.grad[0]}55` : '#E9EEEB',
                        background: has ? `${p.grad[0]}14` : '#F5F8F6',
                      }}
                    >
                      <span className={`text-[26px] leading-none ${has ? '' : 'opacity-25 grayscale'}`}>
                        {has ? p.emoji : '❓'}
                      </span>
                      <span className={`max-w-full truncate px-1 text-[10.5px] font-extrabold ${has ? 'text-ink' : 'text-ink-faint'}`}>
                        {has ? l(p.name) : '???'}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </section>
          )
        })}

        <p className="mt-7 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">
          {t('dex.hint')}
        </p>
      </main>

      {/* 동물 상세 */}
      <Modal open={detail !== null} onClose={() => setDetail(null)}>
        {detail && (
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -8, 6, 0] }} className="text-7xl">
              {PERSONAS[detail].emoji}
            </motion.div>
            <h3 className="mt-3 text-[22px] font-extrabold tracking-tight">{l(PERSONAS[detail].name)}</h3>
            <p className="mt-1 text-[14px] font-extrabold text-mind-700">{l(PERSONAS[detail].title)}</p>
            <p className="mt-2.5 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
              “{l(PERSONAS[detail].tagline)}”
            </p>
            <div className="mt-5">
              <Button color="mind" onClick={() => nav(`/test/${PERSONA_TEST[detail]}`)}>
                🔄 {t('dex.retake')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
