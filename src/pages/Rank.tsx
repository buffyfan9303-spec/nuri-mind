import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, Chip, Section, TopBar } from '../components/ui'
import { EXPERIENCES, TIERS, lifetimeOf, nextTierOf, tierAtLeast, tierOf, expById } from '../data/rank'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { celebrate } from '../lib/confetti'
import { sfx } from '../lib/sound'

export default function Rank() {
  const t = useT()
  const l = useL()
  const ledger = useStore((s) => s.ledger)
  const applications = useStore((s) => s.applications)
  const applyExperience = useStore((s) => s.applyExperience)

  const lifetime = lifetimeOf(ledger)
  const tier = tierOf(lifetime)
  const next = nextTierOf(lifetime)
  const progress = next ? (lifetime - tier.min) / (next.min - tier.min) : 1

  const onApply = (expId: string) => {
    if (applyExperience(expId)) {
      celebrate()
      sfx.coin()
    }
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/rewards" title={t('rank.title')} />
      <main className="mx-auto max-w-md px-5">
        {/* 현재 등급 히어로 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 230, damping: 22 }}
          className="rounded-3xl p-7 text-center shadow-pop"
          style={{ background: `linear-gradient(140deg, ${tier.grad[0]}, ${tier.grad[1]})` }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            className="text-6xl"
          >
            {tier.emoji}
          </motion.div>
          <p className="mt-3 text-[14px] font-extrabold tracking-wide text-white/85">{t('rank.current')}</p>
          <h1 className="mt-0.5 text-[30px] font-extrabold tracking-tight text-white">{l(tier.name)}</h1>
          <p className="mt-1 text-[15px] font-bold text-white/90">
            {t('rank.lifetime')} 💎 {lifetime.toLocaleString()}P
          </p>

          <div className="mt-5">
            <div className="h-4 w-full overflow-hidden rounded-full bg-white/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.3 }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <p className="mt-2.5 text-[14px] font-extrabold text-white">
              {next
                ? t('rank.next', { tier: `${next.emoji} ${l(next.name)}`, p: (next.min - lifetime).toLocaleString() })
                : t('rank.max')}
            </p>
          </div>
        </motion.div>

        <p className="mt-3 rounded-2xl bg-mind-100 px-4 py-3 text-center text-[14px] font-bold leading-relaxed text-mind-700">
          💡 {t('rank.keep')}
        </p>

        {/* 등급 사다리 */}
        <Section title={`🪜 ${t('rank.ladder')}`}>
          <div className="space-y-3">
            {TIERS.map((tr) => {
              const reached = lifetime >= tr.min
              const isCurrent = tr.id === tier.id
              return (
                <Card
                  key={tr.id}
                  className={`!p-5 ${isCurrent ? 'ring-2' : ''} ${reached ? '' : 'opacity-65'}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                      style={{ background: reached ? `${tr.color}22` : '#F0F3F1' }}
                    >
                      {reached ? tr.emoji : '🔒'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[17px] font-extrabold tracking-tight" style={{ color: reached ? tr.color : '#9AA59E' }}>
                          {l(tr.name)}
                        </h3>
                        {isCurrent && <Chip tone="mind">NOW</Chip>}
                      </div>
                      <p className="text-[13px] font-bold text-ink-faint">💎 {tr.min.toLocaleString()}P+</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {tr.perks.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-[14.5px] font-medium leading-relaxed text-ink">
                        <span className="mt-0.5 shrink-0" style={{ color: reached ? tr.color : '#C2CBC5' }}>
                          {reached ? '✓' : '·'}
                        </span>
                        {l(p)}
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </Section>

        {/* 체험단 모집 */}
        <Section title={`🎁 ${t('rank.exp')}`}>
          <div className="space-y-3.5">
            {EXPERIENCES.map((ex) => {
              const need = TIERS.find((x) => x.id === ex.minTier)!
              const ok = tierAtLeast(lifetime, ex.minTier)
              const app = applications.find((a) => a.expId === ex.id)
              return (
                <Card key={ex.id} className={`!p-5 ${ok ? '' : 'opacity-75'}`}>
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mind-50 text-3xl">
                      {ex.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16.5px] font-extrabold leading-snug tracking-tight">{l(ex.title)}</h3>
                      <p className="mt-1 text-[14px] font-medium leading-relaxed text-ink-sub">{l(ex.desc)}</p>
                      <p className="mt-1.5 text-[14px] font-extrabold text-mind-700">🎁 {l(ex.reward)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Chip tone={ok ? 'mind' : 'gray'}>
                      {need.emoji} {t('rank.lockTier', { tier: l(need.name) })}
                    </Chip>
                    <Chip tone="blue">{t('rank.slots', { a: ex.applied, n: ex.slots })}</Chip>
                    <Chip tone="amber">{t('rank.closes', { d: ex.closesInDays })}</Chip>
                  </div>
                  <div className="mt-3.5">
                    {app ? (
                      <div className="flex items-center justify-center gap-2 rounded-2xl bg-mind-100 py-3.5 text-[15px] font-extrabold text-mind-700">
                        ✅ {t('rank.applied')} ·{' '}
                        {app.status === 'pending'
                          ? t('rewards.status.pending')
                          : app.status === 'approved'
                            ? `🎉 ${t('admin.approve')}`
                            : t('rewards.status.rejected')}
                      </div>
                    ) : ok ? (
                      <Button color="mind" onClick={() => onApply(ex.id)}>
                        ✋ {t('rank.apply')}
                      </Button>
                    ) : (
                      <Button color="white" disabled>
                        🔒 {t('rank.lockTier', { tier: `${need.emoji} ${l(need.name)}` })}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </Section>

        {/* 내 신청 현황 */}
        {applications.length > 0 && (
          <Section title={`🗂 ${t('rank.myApps')}`}>
            <Card className="!p-2">
              {applications.map((a) => {
                const ex = expById(a.expId)
                return (
                  <div key={a.id} className="flex items-center justify-between border-b border-[#F1F5F2] px-3.5 py-3.5 last:border-0">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="text-xl">{ex?.emoji}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[14.5px] font-bold">{l(ex?.title)}</p>
                        <p className="text-[12px] font-medium text-ink-faint">{new Date(a.at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {a.status === 'pending' && <Chip tone="amber">⏳ {t('rewards.status.pending')}</Chip>}
                    {a.status === 'approved' && <Chip tone="mind">🎉 {t('admin.approve')}</Chip>}
                    {a.status === 'rejected' && <Chip tone="red">{t('rewards.status.rejected')}</Chip>}
                  </div>
                )
              })}
            </Card>
          </Section>
        )}
      </main>
    </div>
  )
}
