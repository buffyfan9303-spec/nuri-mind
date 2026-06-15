import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, Chip, TopBar } from '../components/ui'
import { ARTICLES } from '../data/magazine'
import { useT, useL } from '../i18n/useT'
import { useStore } from '../store/useStore'

export default function Magazine() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const readArticles = useStore((s) => s.readArticles)

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t('mag.title')} />
      <main className="mx-auto max-w-md px-5">
        <p className="px-1 text-[14px] font-medium leading-relaxed text-ink-sub">{t('mag.sub')}</p>

        <div className="mt-4 space-y-3">
          {ARTICLES.map((a, i) => {
            const read = readArticles.includes(a.id)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 240, damping: 24 }}
              >
                <Card onClick={() => nav(`/magazine/${a.id}`)} className="flex items-center gap-3.5 !p-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mind-50 text-[28px]">
                    {a.emoji}
                    {read && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mind-600 text-[10px] font-extrabold text-white shadow-card">✓</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Chip tone="mind">{l(a.tag)}</Chip>
                      <span className="text-[11.5px] font-bold text-ink-faint">📖 {t('mag.read', { n: a.readMin })}</span>
                    </div>
                    <h3 className="mt-1.5 break-keep text-[15.5px] font-extrabold leading-snug tracking-tight">{l(a.title)}</h3>
                    <p className="mt-1 line-clamp-2 break-keep text-[12.5px] font-medium leading-relaxed text-ink-faint">{l(a.summary)}</p>
                  </div>
                  <span className="shrink-0 self-center text-lg text-ink-faint">›</span>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <p className="mt-6 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('mag.hint')}</p>
      </main>
    </div>
  )
}
