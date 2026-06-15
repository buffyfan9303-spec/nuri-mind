import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, TopBar } from '../components/ui'
import { articleById } from '../data/magazine'
import { useT, useL } from '../i18n/useT'

export default function Article() {
  const { id } = useParams<{ id: string }>()
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const a = articleById(id || '')
  if (!a) return <Navigate to="/magazine" replace />

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/magazine" title={t('mag.title')} />
      <main className="mx-auto max-w-md px-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
          <div className="text-[44px]">{a.emoji}</div>
          <h1 className="mt-2 break-keep text-[24px] font-extrabold leading-tight tracking-tight">{l(a.title)}</h1>
          <p className="mt-2.5 break-keep text-[14.5px] font-medium leading-relaxed text-ink-sub">{l(a.summary)}</p>
        </motion.div>

        <div className="mt-6 space-y-5">
          {a.sections.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 * i }}
            >
              <h2 className="break-keep text-[17px] font-extrabold leading-snug tracking-tight text-mind-700">{l(s.h)}</h2>
              <p className="mt-2 break-keep text-[15px] font-medium leading-[1.8] text-ink">{l(s.p)}</p>
            </motion.section>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-mind-50 px-5 py-4 text-center">
          <p className="break-keep text-[15px] font-extrabold leading-relaxed text-mind-700">“{l(a.close)}”</p>
        </div>

        {a.test && (
          <div className="mt-5">
            <Button color="mind" onClick={() => nav(`/test/${a.test}`)}>
              🔬 {t('mag.cta', { name: t(`test.${a.test}.name`) })}
            </Button>
          </div>
        )}

        <p className="mt-5 px-2 text-center text-[12px] font-medium leading-relaxed text-ink-faint">{t('mag.disclaimer')}</p>
      </main>
    </div>
  )
}
