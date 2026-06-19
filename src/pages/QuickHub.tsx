import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, TopBar } from '../components/ui'
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

        <div className="mt-4 space-y-3">
          {QUICK_TESTS.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 240, damping: 24 }}
            >
              <Card onClick={() => nav(`/quick/${q.id}`)} className="flex items-center gap-3.5 !p-0 !bg-transparent !shadow-none">
                <div
                  className="flex w-full items-center gap-3.5 rounded-3xl p-4 text-white shadow-pop"
                  style={{ background: `linear-gradient(135deg, ${q.grad[0]}, ${q.grad[1]})` }}
                >
                  <span className="text-[34px]">{q.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-extrabold tracking-tight">{l(q.title)}</h3>
                    <p className="mt-0.5 text-[13px] font-bold text-white/90">{l(q.desc)}</p>
                  </div>
                  <span className="shrink-0 text-[18px] text-white/70">›</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('quick.hint')}</p>
      </main>
    </div>
  )
}
