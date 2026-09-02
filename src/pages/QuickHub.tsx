import { motion } from 'framer-motion'
import { SPRING } from '../lib/motion'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/ui'
import { JellyChip } from '../components/ScrollChips'
import { QUICK_TESTS } from '../data/quick'
import { useT, useL } from '../i18n/useT'

export default function QuickHub() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t('quick.title')} />
      <main className="mx-auto max-w-md px-5">
        <p className="px-1 text-[14px] font-medium leading-relaxed text-ink-sub">{t('quick.sub')}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {QUICK_TESTS.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING.ui, delay: 0.04 * i }}
            >
              <JellyChip
                emoji={q.emoji}
                label={l(q.title)}
                color={q.grad[0]}
                full
                badge={i === 0 ? 'HOT' : i >= QUICK_TESTS.length - 2 ? 'NEW' : undefined}
                onClick={() => nav(`/quick/${q.id}`)}
              />
            </motion.div>
          ))}
        </div>

        <p className="mt-6 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('quick.hint')}</p>
      </main>
    </div>
  )
}
