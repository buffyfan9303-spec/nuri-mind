import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { compatOf, type Compat } from '../lib/saju'
import { track } from '../lib/analytics'

export default function Compat() {
  const t = useT()
  const l = useL()
  const birthDate = useStore((s) => s.birthDate)
  const setBirthDate = useStore((s) => s.setBirthDate)
  const [me, setMe] = useState(birthDate)
  const [partner, setPartner] = useState('')
  const [result, setResult] = useState<Compat | null>(null)

  useEffect(() => {
    track('compat_view')
  }, [])

  const run = () => {
    const [ay, am, ad] = me.split('-').map(Number)
    const [by, bm, bd] = partner.split('-').map(Number)
    if (!ay || !am || !ad || !by || !bm || !bd) return
    if (me !== birthDate) setBirthDate(me)
    setResult(compatOf({ y: ay, m: am, d: ad }, { y: by, m: bm, d: bd }))
    track('compat_run')
  }

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/fortune" title={t('compat.title')} />
      <main className="mx-auto max-w-md px-5">
        <div className="mt-6 text-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-[52px] leading-none">
            💞
          </motion.div>
          <h1 className="mt-2 break-keep text-[21px] font-extrabold leading-tight">{t('compat.ask')}</h1>
        </div>

        <Card className="mt-5 space-y-3">
          <div>
            <label className="px-1 text-[13px] font-extrabold">{t('compat.me')}</label>
            <input type="date" value={me} max="2025-12-31" min="1920-01-01" onChange={(e) => setMe(e.target.value)} className="mt-1.5 w-full rounded-2xl border-2 border-[#E3EAE5] bg-white px-4 py-3 text-[15px] font-extrabold outline-none focus:border-mind-400" />
          </div>
          <div>
            <label className="px-1 text-[13px] font-extrabold">{t('compat.partner')}</label>
            <input type="date" value={partner} max="2025-12-31" min="1920-01-01" onChange={(e) => setPartner(e.target.value)} className="mt-1.5 w-full rounded-2xl border-2 border-[#E3EAE5] bg-white px-4 py-3 text-[15px] font-extrabold outline-none focus:border-mind-400" />
          </div>
          <Button color="love" size="lg" disabled={!me || !partner} onClick={run}>
            💞 {t('compat.see')}
          </Button>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 190, damping: 18 }} className="mt-4">
            <div className="rounded-3xl p-6 text-center text-white shadow-pop" style={{ background: `linear-gradient(135deg, ${result.grad[0]}, ${result.grad[1]})` }}>
              <p className="text-[12.5px] font-extrabold text-white/85">{result.aIlju} ✕ {result.bIlju}</p>
              <div className="floaty mt-2 text-[46px] font-extrabold leading-none">
                {result.score}
                <span className="text-[20px]">{t('fortune.point')}</span>
              </div>
              <h2 className="mt-2 text-[20px] font-extrabold tracking-tight">{l(result.template.label)}</h2>
            </div>
            <Card className="mt-3">
              <p className="break-keep text-[14px] font-medium leading-relaxed text-ink">{l(result.template.desc)}</p>
            </Card>
            <p className="mt-3 px-2 text-center text-[11.5px] font-medium leading-relaxed text-ink-faint">{t('compat.disclaimer')}</p>
            <button onClick={() => setResult(null)} className="mt-1 w-full py-2 text-[13px] font-extrabold text-ink-faint">
              🔁 {t('compat.again')}
            </button>
          </motion.div>
        )}
      </main>
    </div>
  )
}
