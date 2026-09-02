import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, Chip, TopBar } from '../components/ui'
import { useStore, PRECISION_DIA_COST } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { expById, TIERS } from '../data/rank'
import { sfx } from '../lib/sound'
import { grantDiamondsNick, sendMailNick } from '../lib/mailbox'
import { probeAi, type AiHealth, type AiFnName } from '../lib/aiHealth'

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
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && tryUnlock()}
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
  const [aiHealth, setAiHealth] = useState<AiHealth[]>([])
  const [aiBusy, setAiBusy] = useState(false)
  const t = useT()
  const l = useL()
  const [tab, setTab] = useState<Tab>('surveys')
  const addDiamonds = useStore((s) => s.addDiamonds)
  const [diaNick, setDiaNick] = useState('')
  const [diaAmt, setDiaAmt] = useState('')
  const [mailNick, setMailNick] = useState('')
  const [mailTitle, setMailTitle] = useState('')
  const [mailBody, setMailBody] = useState('')
  const [mailDia, setMailDia] = useState('')
  const [opMsg, setOpMsg] = useState('')
  const opResult = (r: string, okMsg: string) =>
    setOpMsg(r === 'ok' ? okMsg : r === 'no_user' ? '그 닉네임의 유저가 없어요' : '권한 없음/오류 — 운영자(WTA) 로그인이 필요해요')
  const onGrantNick = async () => {
    const n = parseInt(diaAmt, 10)
    if (!diaNick.trim() || !n || n <= 0) return setOpMsg('닉네임과 개수를 확인하세요')
    const r = await grantDiamondsNick(diaNick.trim(), n)
    opResult(r, `${diaNick}님에게 💎${n} 지급(우편함으로)`)
    if (r === 'ok') sfx.coin()
  }
  const onSendMail = async () => {
    if (!mailNick.trim() || !mailTitle.trim()) return setOpMsg('받는 사람과 제목을 확인하세요')
    const r = await sendMailNick(mailNick.trim(), mailTitle.trim(), mailBody.trim(), parseInt(mailDia, 10) || 0)
    opResult(r, `${mailNick}님에게 우편을 보냈어요`)
    if (r === 'ok') sfx.tap()
  }
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
            {t('admin.lock')}
          </button>
        </div>
        <div className="no-scrollbar mx-auto flex max-w-md gap-1.5 overflow-x-auto px-4 pb-3">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-colors${
                tab === tb.key ? 'bg-[#1ab394] text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              {tb.label}
              {tb.badge !== undefined && tb.badge > 0 && (
                <span className="rounded-full bg-surface px-1.5 text-[11px] font-semibold text-[#1ab394]">{tb.badge}</span>
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
                    <h3 className="text-[15px] font-semibold leading-snug">{sv.title}</h3>
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
                      <li key={q.id} className="rounded-xl bg-surface2 px-3 py-2 text-[12px] font-medium leading-relaxed">
                        <span className="text-mind-600">Q{i + 1}.</span> {q.text}
                        <span className="ml-1.5 text-[11px] font-semibold text-ink-faint">
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
                    <h3 className="truncate text-[15px] font-semibold">{rd.itemName}</h3>
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
                      <h3 className="truncate text-[16px] font-semibold">{l(ex?.title)}</h3>
                      <p className="text-[13px] font-medium text-ink-faint">
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
                    <h3 className="truncate text-[14px] font-semibold">{rp.nick}</h3>
                    <p className="text-[11px] font-medium text-ink-faint">{new Date(rp.at).toLocaleString()}</p>
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
                <div className="mt-0.5 text-[11px] font-medium tracking-wide text-ink-sub">{st.label}</div>
              </Card>
            ))}
          </div>
          {/* 정밀검사 상세 💎 게이팅 토글 (운영자) */}
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 p-4">
            <div className="min-w-0 pr-3">
              <p className="text-[14px] font-semibold text-white">💎 정밀검사 상세 게이팅</p>
              <p className="mt-0.5 break-keep text-[11px] font-medium text-white/60">
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

          {/* AI 엣지 함수 진단 — 키가 실제로 먹었는지 확인할 유일한 수단 */}
          <div className="mt-3 rounded-2xl bg-white/10 p-4">
            <h3 className="text-[14px] font-semibold text-white">🩺 AI 연결 진단</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-white/50">
              키(ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY)가 없으면 앱은 조용히 정적 요약으로 착지해요.
              키를 넣은 뒤 여기서 실제 동작과 어느 제공자가 붙었는지 확인하세요. (실호출 1회분이 과금됩니다)
            </p>
            <button
              disabled={aiBusy}
              onClick={async () => {
                setAiBusy(true)
                setAiHealth([])
                const fns: AiFnName[] = ['deep-report', 'ai-report', 'fortune-detail']
                // 순차 실행 — 동시에 때리면 어느 함수가 느린지/막혔는지 구분이 안 된다
                for (const f of fns) {
                  const h = await probeAi(f)
                  setAiHealth((prev) => [...prev, h])
                }
                setAiBusy(false)
              }}
              className="mt-2.5 w-full rounded-xl bg-[#6E7BF2] py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {aiBusy ? '진단 중…' : '3종 함수 진단 실행'}
            </button>
            {aiHealth.map((h) => (
              <div key={h.fn} className="mt-2 rounded-xl bg-black/20 p-3">
                <p className="text-[12px] font-semibold text-white">{h.fn}</p>
                <p className={`mt-0.5 text-[12px] font-medium${h.ok ? 'text-[#4FA882]' : 'text-[#FF9AA2]'}`}>{h.verdict}</p>
                {h.detail && <p className="mt-1 break-all text-[11px] leading-relaxed text-white/45">{h.detail}</p>}
              </div>
            ))}
          </div>

          {/* 운영자 도구 — 다이아 지급 / 개인 우편 */}
          <div className="mt-3 rounded-2xl bg-white/10 p-4">
            <h3 className="text-[14px] font-semibold text-white">다이아 지급</h3>
            <button
              onClick={() => { addDiamonds(10000); setOpMsg('이 기기에 💎10,000 지급됨'); sfx.coin() }}
              className="mt-2 w-full rounded-xl bg-[#1ab394] py-2.5 text-[13px] font-semibold text-white"
            >
              내 기기에 💎10,000 지급 (로컬)
            </button>
            <div className="mt-2 flex gap-2">
              <input value={diaNick} onChange={(e) => setDiaNick(e.target.value)} placeholder="닉네임(서버 유저)" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-[13px] text-white placeholder-white/40 outline-none" />
              <input value={diaAmt} onChange={(e) => setDiaAmt(e.target.value.replace(/\D/g, ''))} placeholder="개수" inputMode="numeric" className="w-20 rounded-xl bg-white/10 px-3 py-2.5 text-[13px] text-white placeholder-white/40 outline-none" />
              <button onClick={onGrantNick} className="shrink-0 rounded-xl bg-[#6E7BF2] px-4 py-2.5 text-[13px] font-semibold text-white">지급</button>
            </div>

            <h3 className="mt-4 text-[14px] font-semibold text-white">개인 우편 보내기</h3>
            <input value={mailNick} onChange={(e) => setMailNick(e.target.value)} placeholder="받는 사람 닉네임" className="mt-2 w-full rounded-xl bg-white/10 px-3 py-2.5 text-[13px] text-white placeholder-white/40 outline-none" />
            <input value={mailTitle} onChange={(e) => setMailTitle(e.target.value)} placeholder="제목" className="mt-2 w-full rounded-xl bg-white/10 px-3 py-2.5 text-[13px] text-white placeholder-white/40 outline-none" />
            <textarea value={mailBody} onChange={(e) => setMailBody(e.target.value)} placeholder="내용" rows={2} className="mt-2 w-full resize-none rounded-xl bg-white/10 px-3 py-2.5 text-[13px] text-white placeholder-white/40 outline-none" />
            <div className="mt-2 flex gap-2">
              <input value={mailDia} onChange={(e) => setMailDia(e.target.value.replace(/\D/g, ''))} placeholder="첨부 💎(선택)" inputMode="numeric" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-[13px] text-white placeholder-white/40 outline-none" />
              <button onClick={onSendMail} className="shrink-0 rounded-xl bg-[#6E7BF2] px-4 py-2.5 text-[13px] font-semibold text-white">보내기</button>
            </div>

            {opMsg && <p className="mt-2.5 text-[12px] font-medium text-white/90">{opMsg}</p>}
            <p className="mt-2 text-[11px] leading-relaxed text-white/45">ⓘ '내 기기' 지급은 이 기기에 즉시 반영(로컬). 닉네임 지급·개인우편은 운영자(WTA)를 is_admin으로 설정하고 운영자로 로그인해야 동작해요.</p>
          </div>
          </>
        )}
      </main>
    </div>
  )
}
