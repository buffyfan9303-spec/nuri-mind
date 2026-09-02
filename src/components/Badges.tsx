import { useMemo, useState } from 'react'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { Card, Modal, Section } from './ui'
import { ACHIEVEMENTS, type AchCtx } from '../data/achievements'
import { PERSONA_TEST } from '../i18n/animalTranslations'
import { lifetimeOf } from '../data/rank'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

/** 업적/뱃지 — 기존 활동(검사·출석·공유·도감 등)에 자동 평가되는 수집형 보상 */
export default function Badges() {
  const t = useT()
  const l = useL()
  const results = useStore((s) => s.results)
  const streak = useStore((s) => s.streak)
  const sharedResults = useStore((s) => s.sharedResults)
  const takenSurveys = useStore((s) => s.takenSurveys)
  const firstPostDone = useStore((s) => s.firstPostDone)
  const invitedCount = useStore((s) => s.invitedCount)
  const ledger = useStore((s) => s.ledger)
  const [open, setOpen] = useState<string | null>(null)

  const ctx: AchCtx = useMemo(
    () => ({
      resultCount: results.length,
      testCount: new Set(results.map((r) => r.testId)).size,
      dexCount: new Set(results.map((r) => r.persona).filter((k) => PERSONA_TEST[k])).size,
      streak,
      shares: sharedResults.length,
      surveys: takenSurveys.length,
      firstPost: firstPostDone,
      lifetime: lifetimeOf(ledger),
      invited: invitedCount,
    }),
    [results, streak, sharedResults, takenSurveys, firstPostDone, invitedCount, ledger],
  )

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(ctx)).length
  const sel = open ? ACHIEVEMENTS.find((a) => a.id === open) : null
  const selDone = sel ? sel.check(ctx) : false

  return (
    <Section title={`${t('ach.title')}`}>
      <Card className="!p-4">
        <p className="mb-3 text-center text-[13px] font-semibold text-ink-faint">
          {t('ach.progress', { c: unlocked, t: ACHIEVEMENTS.length })}
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {ACHIEVEMENTS.map((a, i) => {
            const done = a.check(ctx)
            return (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING.ui, delay: Math.min(i * 0.02, 0.3) }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sfx.tap()
                  setOpen(a.id)
                }}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2"
                style={{
                  borderColor: done ? '#4FA88255' : 'rgb(var(--line))',
                  background: done ? '#4FA88214' : 'rgb(var(--surface-2))',
                }}
              >
                <span className={`text-[24px] leading-none${done ? '' : 'opacity-25 grayscale'}`}>{a.emoji}</span>
                <span className={`max-w-full truncate px-1 text-[11px] font-semibold${done ? 'text-ink' : 'text-ink-faint'}`}>
                  {done ? l(a.title) : '???'}
                </span>
              </motion.button>
            )
          })}
        </div>
      </Card>

      <Modal open={open !== null} onClose={() => setOpen(null)}>
        {sel && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -8, 6, 0] }}
              className={`text-7xl ${selDone ? '' : 'opacity-30 grayscale'}`}
            >
              {sel.emoji}
            </motion.div>
            <h3 className="mt-3 text-[20px] font-extrabold tracking-tight">{l(sel.title)}</h3>
            <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-ink-sub">{l(sel.desc)}</p>
            <p
              className={`mt-3 inline-block rounded-full px-4 py-1.5 text-[13px] font-semibold${
                selDone ? 'bg-mind-100 text-mind-700' : 'bg-surface2 text-ink-faint'
              }`}
            >
              {selDone ? `✅ ${t('ach.done')}` : `🔒 ${t('ach.locked')}`}
            </p>
          </div>
        )}
      </Modal>
    </Section>
  )
}
