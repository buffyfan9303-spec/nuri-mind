import { Navigate, useParams } from 'react-router-dom'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { Card, TopBar } from '../components/ui'
import { ROUTINES } from '../data/routines'
import type { TestId } from '../data/types'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sfx } from '../lib/sound'
import { burst } from '../lib/confetti'

export default function Routine() {
  const { id } = useParams<{ id: string }>()
  const t = useT()
  const l = useL()
  const routineDone = useStore((s) => s.routineDone)
  const toggle = useStore((s) => s.toggleRoutineDay)

  const routine = id ? ROUTINES[id as TestId] : undefined
  if (!routine) return <Navigate to="/" replace />

  const done = routineDone[id!] || []
  const pct = Math.round((done.length / 7) * 100)
  const complete = done.length === 7

  const onToggle = (day: number) => {
    const willComplete = !done.includes(day) && done.length === 6
    toggle(id!, day)
    if (willComplete) {
      burst()
      sfx.coin()
    } else sfx.tap()
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={l(routine.title)} />
      <main className="mx-auto max-w-md px-5">
        {/* 진행 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING.ui}
          className="rounded-3xl bg-gradient-to-br from-mind-500 to-sky2-500 p-5 text-white shadow-pop"
        >
          <div className="flex items-center gap-3">
            <span className="text-[34px]">{routine.emoji}</span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[18px] font-extrabold leading-tight">{l(routine.title)}</h1>
              <p className="mt-0.5 text-[13px] font-bold text-white/85">{t('routine.sub')}</p>
            </div>
            <span className="shrink-0 text-[17px] font-extrabold">{done.length}/7</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/25">
            <motion.div
              className="h-full rounded-full bg-surface"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={SPRING.gauge}
            />
          </div>
          {complete && (
            <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 text-center text-[14.5px] font-extrabold">
              🎉 {t('routine.done')}
            </motion.p>
          )}
        </motion.div>

        {/* 7일 체크리스트 */}
        <div className="mt-4 space-y-2.5">
          {routine.days.map((d, i) => {
            const checked = done.includes(i)
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggle(i)}
                className="flex w-full items-center gap-3.5 rounded-2xl border-2 bg-surface px-4 py-3.5 text-left transition-colors"
                style={{ borderColor: checked ? '#4FA882' : 'rgb(var(--line))' }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
                  style={{ background: checked ? '#4FA882' : 'rgb(var(--surface-2))', color: checked ? '#fff' : 'rgb(var(--text-faint))' }}
                >
                  {checked ? '✓' : t('routine.day', { n: i + 1 })}
                </span>
                <span className={`break-keep text-[14.5px] font-bold leading-snug ${checked ? 'text-ink-faint line-through' : 'text-ink'}`}>
                  {l(d)}
                </span>
              </motion.button>
            )
          })}
        </div>

        <p className="mt-6 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('routine.hint')}</p>
      </main>
    </div>
  )
}
