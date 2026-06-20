import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, Chip, TopBar } from '../components/ui'
import { useStore, PRECISION_DIA_COST } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { expById, TIERS } from '../data/rank'
import { sfx } from '../lib/sound'

type Tab = 'surveys' | 'redeem' | 'exp' | 'reports' | 'stats'

export default function Admin() {
  const t = useT()
  const unlocked = useStore((s) => s.adminUnlocked)
  return unlocked ? <Console /> : <PinGate />
}

function PinGate() {
  const t = useT()
  const unlockAdmin = useStore((s) => s.unlockAdmin)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)

  const tryUnlock = () => {
    if (!unlockAdmin(pin)) {
      setErr(true)
      sfx.err()
      setTimeout(() => setErr(false), 500)
      setPin('')
    } else {
      sfx.coin()
    }
  }

  return (
    <div className="min-h-dvh pb-28">
      <TopBar back="/profile" title={t('admin.title')} />
      <div className="mx-auto max-w-md px-5 pt-16 text-center">
        <div className="text-5xl">🔐</div>
        <h1 className="mt-4 text-lg font-extrabold">{t('admin.pinTitle')}</h1>
        <div className={`mx-auto mt-5 max-w-[260px] ${err ? 'shake' : ''}`}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            placeholder={t('admin.pinPh')}
            className="w-full rounded-2xl border-2 bg-surface px-4 py-3.5 text-center text-lg font-extrabold tracking-widest outline-none focus:border-mind-400"
            style={{ borderColor: err ? '#EF4444' : '#E3EAE5' }}
          />
        </div>
        {err && <p className="mt-2 text-sm font-bold text-red-500">{t('admin.pinErr')}</p>}
        <div className="mx-auto mt-4 max-w-[260px]">
          <Button color="mind" onClick={tryUnlock} disabled={pin.length < 4}>
            {t('admin.enter')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Console() {
  const t = useT()
  const l = useL()
  const [tab, setTab] = useState<Tab>('surveys')
  const surveys = useStore((s) => s.surveys)
  const redemptions = useStore((s) => s.redemptions)
  const results = useStore((s) => s.results)
  const ledger = useStore((s) => s.ledger)
  const applications = useStore((s) => s.applications)
  const approveSurvey = useStore((s) => s.approveSurvey)
  const rejectSurvey = useStore((s) => s.rejectSurvey)
  const decideRedemption = useStore((s) => s.decideRedemption)
  const decideApplication = useStore((s) => s.decideApplication)
  const reports = useStore((s) => s.reports)
  const resolveReport = useStore((s) => s.resolveReport)
  const lockAdmin = useStore((s) => s.lockAdmin)
  const precisionGate = useStore((s) => s.precisionGate)
  const setPrecisionGate = useStore((s) => s.setPrecisionGate)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [openQ, setOpenQ] = useState<string | null>(null)

  const pendingSurveys = surveys.filter((s) => s.status === 'pending')
  const pendingRedeems = redemptions.filter((r) => r.status === 'pending')
  const pendingApps = applications.filter((a) => a.status === 'pending')
  const openReports = reports.filter((r) => !r.resolved)
  const pointsIssued = ledger.filter((e) => e.amount > 0).reduce((a, e) => a + e.amount, 0)
  const totalResponses = surveys.reduce((a, s) => a + s.responses, 0)

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'surveys', label: t('admin.tab.surveys'), badge: pendingSurveys.length },
    { key: 'redeem', label: t('admin.tab.redeem'), badge: pendingRedeems.length },
    { key: 'exp', label: t('admin.tab.exp'), badge: pendingApps.length },
    { key: 'reports', label: t('admin.tab.reports'), badge: openReports.length },
    { key: 'stats', label: t('admin.tab.stats') },
  ]

  return (
    <div className="min-h-dvh bg-[#2F4050] pb-28">
      <div className="sticky top-0 z-30 bg-[#2F4050]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-md items-center gap-2 px-4">
          <span className="text-lg font-extrabold text-white">🛠 {t('admin.title')}</span>
          <div className="flex-1" />
          <button onClick={lockAdmin} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white">
            🔒 {t('admin.lock')}
          </button>
        </div>
        <div className="no-scrollbar mx-auto flex max-w-md gap-1.5 overflow-x-auto px-4 pb-3">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-extrabold transition-colors ${
                tab === tb.key ? 'bg-[#1ab394] text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              {tb.label}
              {tb.badge !== undefined && tb.badge > 0 && (
                <span className="rounded-full bg-surface px-1.5 text-[11px] font-extrabold text-[#1ab394]">{tb.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-md px-4 pt-4">
        {tab === 'surveys' && (
          <div className="space-y-3">
            {pendingSurveys.length === 0 && (
              <Card className="py-10 text-center text-sm font-bold text-ink-faint">{t('admin.emptyQueue')}</Card>
            )}
            {pendingSurveys.map((sv) => (
              <Card key={sv.id} className="!p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{sv.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-extrabold leading-snug">{sv.title}</h3>
                    <p className="mt-0.5 text-xs font-medium leading-relaxed text-ink-sub">{sv.desc}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Chip tone="blue">
                        {sv.questions.length}
                        {t('common.q')}
                      </Chip>
                      <Chip tone="mind">
                        {t('admin.rewardPer')} {sv.reward}P
                      </Chip>
                      <Chip tone="gray">🎯 {sv.target}</Chip>
                      {sv.mine && <Chip tone="amber">USER</Chip>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setOpenQ(openQ === sv.id ? null : sv.id)}
                  className="mt-3 w-full rounded-xl bg-surface2 py-2 text-xs font-extrabold text-ink-sub"
                >
                  {openQ === sv.id ? '▲' : '▼'} {t('common.q')}
                </button>
                {openQ === sv.id && (
                  <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-1.5">
                    {sv.questions.map((q, i) => (
                      <li key={q.id} className="rounded-xl bg-surface2 px-3 py-2 text-[12px] font-bold leading-relaxed">
                        <span className="text-mind-600">Q{i + 1}.</span> {q.text}
                        <span className="ml-1.5 text-[10px] font-extrabold text-ink-faint">
                          [{t(`create.type.${q.type}`)}{q.required ? ` · ${t('common.required')}` : ''}]
                        </span>
                        {q.options && <p className="mt-0.5 text-[11px] text-ink-faint">{q.options.join(' / ')}</p>}
                      </li>
                    ))}
                  </motion.ul>
                )}

                <input
                  value={reasons[sv.id] ?? ''}
                  onChange={(e) => setReasons((p) => ({ ...p, [sv.id]: e.target.value }))}
                  placeholder={t('admin.rejectPh')}
                  className="mt-3 w-full rounded-xl border-2 border-line px-3 py-2 text-[13px] font-medium outline-none focus:border-mind-400"
                />
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <Button
                    color="mind"
                    size="sm"
                    onClick={() => {
                      approveSurvey(sv.id)
                      sfx.coin()
                    }}
                  >
                    ✅ {t('admin.approve')}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => {
                      rejectSurvey(sv.id, reasons[sv.id] ?? '')
                      sfx.err()
                    }}
                  >
                    ⛔ {t('admin.reject')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'redeem' && (
          <div className="space-y-3">
            {pendingRedeems.length === 0 && (
              <Card className="py-10 text-center text-sm font-bold text-ink-faint">{t('admin.emptyQueue')}</Card>
            )}
            {pendingRedeems.map((rd) => (
              <Card key={rd.id} className="!p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rd.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-extrabold">{rd.itemName}</h3>
                    <p className="text-xs font-bold text-ink-faint">
                      🪙 {rd.cost.toLocaleString()}P · {new Date(rd.at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button color="mind" size="sm" onClick={() => { decideRedemption(rd.id, true); sfx.coin() }}>
                    ✅ {t('admin.approve')}
                  </Button>
                  <Button color="danger" size="sm" onClick={() => { decideRedemption(rd.id, false); sfx.err() }}>
                    ⛔ {t('admin.reject')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'exp' && (
          <div className="space-y-3">
            {pendingApps.length === 0 && (
              <Card className="py-10 text-center text-[15px] font-bold text-ink-faint">{t('admin.emptyQueue')}</Card>
            )}
            {pendingApps.map((ap) => {
              const ex = expById(ap.expId)
              const need = ex && TIERS.find((x) => x.id === ex.minTier)
              return (
                <Card key={ap.id} className="!p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ex?.emoji ?? '🎁'}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[16px] font-extrabold">{l(ex?.title)}</h3>
                      <p className="text-[13px] font-bold text-ink-faint">
                        {need ? `${need.emoji} ${l(need.name)}+` : ''} · {new Date(ap.at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button color="mind" size="sm" onClick={() => { decideApplication(ap.id, true); sfx.coin() }}>
                      ✅ {t('admin.approve')}
                    </Button>
                    <Button color="danger" size="sm" onClick={() => { decideApplication(ap.id, false); sfx.err() }}>
                      ⛔ {t('admin.reject')}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {tab === 'reports' && (
          <div className="space-y-3">
            {openReports.length === 0 && (
              <Card className="py-10 text-center text-[15px] font-bold text-ink-faint">{t('admin.emptyQueue')}</Card>
            )}
            {openReports.map((rp) => (
              <Card key={rp.id} className="!p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚩</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-extrabold">{rp.nick}</h3>
                    <p className="text-[11.5px] font-bold text-ink-faint">{new Date(rp.at).toLocaleString()}</p>
                  </div>
                </div>
                <p className="mt-2 rounded-xl bg-surface2 px-3 py-2 text-[13px] font-medium leading-relaxed text-ink break-keep line-clamp-4">
                  {rp.excerpt}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button color="danger" size="sm" onClick={() => { resolveReport(rp.id, true); sfx.err() }}>
                    🙈 {t('admin.report.hide')}
                  </Button>
                  <Button color="mind" size="sm" onClick={() => { resolveReport(rp.id, false); sfx.tap() }}>
                    ✅ {t('admin.report.keep')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'stats' && (
          <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('admin.stat.results'), value: results.length, icon: '🧠' },
              { label: t('admin.stat.points'), value: pointsIssued.toLocaleString() + 'P', icon: '🪙' },
              { label: t('admin.stat.surveys'), value: surveys.length, icon: '📋' },
              { label: t('admin.stat.responses'), value: totalResponses, icon: '🗳️' },
            ].map((st) => (
              <Card key={st.label} className="!p-5 text-center">
                <div className="text-2xl">{st.icon}</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight">{st.value}</div>
                <div className="mt-0.5 text-[11px] font-bold tracking-wide text-ink-sub">{st.label}</div>
              </Card>
            ))}
          </div>
          {/* 정밀검사 상세 💎 게이팅 토글 (운영자) */}
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 p-4">
            <div className="min-w-0 pr-3">
              <p className="text-[14px] font-extrabold text-white">💎 정밀검사 상세 게이팅</p>
              <p className="mt-0.5 break-keep text-[11.5px] font-bold text-white/60">
                켜면 기억·집중·처리속도·공간 상세분석이 💎{PRECISION_DIA_COST}로 잠겨요 (IQ 정밀은 별도)
              </p>
            </div>
            <button
              onClick={() => setPrecisionGate(!precisionGate)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${precisionGate ? 'bg-[#1ab394]' : 'bg-white/20'}`}
              aria-label="precision-gate"
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${precisionGate ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
          </>
        )}
      </main>
    </div>
  )
}
