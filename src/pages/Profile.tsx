import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import Badges from '../components/Badges'
import { Card, Chip, Modal, Section, TopBar } from '../components/ui'
import { PERSONAS, PERSONA_TEST } from '../i18n/animalTranslations'
import { lifetimeOf, tierOf } from '../data/rank'
import type { Lang } from '../data/types'
import { fileToAvatarDataUrl } from '../lib/image'
import { scheduleStreakReminder } from '../lib/notify'
import { authReady, signInWithKakao, signOut, getAuthUser, onAuthChange, type AuthUser } from '../lib/auth'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'

const LANGS: { key: Lang; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },
]

export default function Profile() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const s = useStore()
  const [resetOpen, setResetOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nick, setNick] = useState(s.nickname)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  useEffect(() => {
    if (!authReady()) return
    getAuthUser().then(setAuthUser)
    return onAuthChange(() => getAuthUser().then(setAuthUser))
  }, [])
  const fileRef = useRef<HTMLInputElement>(null)

  // 검사로 얻은 동물(중복 제거) — 아바타 후보
  const earnedAnimals = Array.from(new Set(s.results.map((r) => r.persona)))

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      s.setAvatar({ kind: 'photo', dataUrl })
      setAvatarOpen(false)
    } catch {
      /* noop */
    }
    e.target.value = ''
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar title={t('profile.title')} />
      <main className="mx-auto max-w-md px-5">
        {/* 유저 카드 */}
        <Card className="flex items-center gap-4">
          <button onClick={() => setAvatarOpen(true)} className="relative shrink-0">
            <Avatar avatar={s.avatar} size={64} />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[12px] shadow-card">
              📷
            </span>
          </button>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  maxLength={12}
                  placeholder={t('profile.nickPh')}
                  className="min-w-0 flex-1 rounded-xl border-2 border-mind-300 px-3 py-1.5 text-[15px] font-extrabold outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    s.setNickname(nick)
                    setEditing(false)
                  }}
                  className="text-lg"
                >
                  ✅
                </button>
              </div>
            ) : (
              <h2 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight">
                {s.nickname}
                <button onClick={() => setEditing(true)} className="text-sm opacity-60">
                  ✏️
                </button>
              </h2>
            )}
            <p className="mt-1 text-[13px] font-bold text-ink-faint">
              🪙 {s.points.toLocaleString()}P · 🧪 {s.results.length} · 🔥 {s.streak}
            </p>
            <button
              onClick={() => nav('/rank')}
              className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-extrabold"
              style={{ background: `${tierOf(lifetimeOf(s.ledger)).color}1F`, color: tierOf(lifetimeOf(s.ledger)).color }}
            >
              {tierOf(lifetimeOf(s.ledger)).emoji} {l(tierOf(lifetimeOf(s.ledger)).name)} ›
            </button>
          </div>
        </Card>

        {/* 동물 도감 진입 */}
        <Card onClick={() => nav('/dex')} className="mt-3.5 flex items-center gap-3.5 !p-4">
          <span className="text-[28px]">🗂</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15.5px] font-extrabold tracking-tight">{t('dex.title')}</h3>
            <p className="mt-0.5 text-[12.5px] font-bold text-ink-faint">
              {t('dex.progress', {
                c: new Set(s.results.map((r) => r.persona).filter((k) => PERSONA_TEST[k])).size,
                t: Object.keys(PERSONA_TEST).length,
              })}
            </p>
          </div>
          <span className="text-lg text-ink-faint">›</span>
        </Card>

        {/* 연애 궁합 진입 */}
        <Card onClick={() => nav('/chemi')} className="mt-3 flex items-center gap-3.5 !p-4">
          <span className="text-[28px]">💞</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15.5px] font-extrabold tracking-tight">{t('chemi.title')}</h3>
            <p className="mt-0.5 text-[12.5px] font-bold text-ink-faint">{t('chemi.entry')}</p>
          </div>
          <span className="text-lg text-ink-faint">›</span>
        </Card>

        {/* AI 종합 심리 프로필 */}
        <Card onClick={() => nav('/insight')} className="mt-3 flex items-center gap-3.5 !bg-gradient-to-r from-[#6E7BF2] to-[#9AA6FF] !p-4">
          <span className="text-[28px]">🧬</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15.5px] font-extrabold tracking-tight text-white">{t('insight.title')}</h3>
            <p className="mt-0.5 text-[12.5px] font-bold text-white/90">{t('insight.entry')}</p>
          </div>
          <span className="text-lg text-white/80">›</span>
        </Card>

        {/* 검사 히스토리 */}
        <Section title={`🗂 ${t('profile.history')}`}>
          {s.results.length === 0 ? (
            <Card className="whitespace-pre-line py-8 text-center text-sm font-bold leading-relaxed text-ink-faint">
              {t('profile.noHistory')}
            </Card>
          ) : (
            <div className="space-y-2.5">
              {s.results.slice(0, 15).map((r) => {
                const p = PERSONAS[r.persona]
                return (
                  <Card key={r.id} onClick={() => nav(`/result/${r.id}`)} className="flex items-center gap-3 !p-3.5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                      style={{ background: `${p.grad[0]}22` }}
                    >
                      {p.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-keep text-[15px] font-extrabold leading-tight">
                        {t(`test.${r.testId}.name`)}
                      </p>
                      <p className="mt-1 break-keep text-[12px] font-bold leading-snug text-ink-faint">
                        {new Date(r.at).toLocaleDateString()} · {l(p.name)}
                        {r.iq ? ` · IQ ${r.iq}` : ''}
                      </p>
                    </div>
                    <Chip tone="mind">{t('result.topPercent', { p: Math.round((100 - r.percentile) * 10) / 10 })}</Chip>
                  </Card>
                )
              })}
            </div>
          )}
        </Section>

        {/* 업적/뱃지 */}
        <Badges />

        {/* 설정 */}
        <Section title={`⚙️ ${t('profile.settings')}`}>
          <Card className="!p-2">
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-[15.5px] font-bold">{t('profile.language')}</span>
              <div className="flex gap-1 rounded-xl bg-surface2 p-1">
                {LANGS.map((lg) => (
                  <button
                    key={lg.key}
                    onClick={() => s.setLang(lg.key)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition-colors ${
                      s.lang === lg.key ? 'bg-surface text-mind-700 dark:text-mind-300 shadow-card' : 'text-ink-faint'
                    }`}
                  >
                    {lg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line px-3 py-3">
              <span className="text-[15.5px] font-bold">{t('profile.sound')}</span>
              <button
                onClick={() => s.setSound(!s.sound)}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                style={{ background: s.sound ? '#4FA882' : '#D9E2DC' }}
                aria-label="sound"
              >
                <motion.span
                  animate={{ x: s.sound ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-surface shadow"
                />
              </button>
            </div>

            {/* 다크 모드 */}
            <div className="flex items-center justify-between border-t border-line px-3 py-3">
              <span className="text-[15.5px] font-bold">{t('profile.darkMode')}</span>
              <button
                onClick={() => s.setTheme(s.theme === 'dark' ? 'light' : 'dark')}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                style={{ background: s.theme === 'dark' ? '#4FA882' : '#D9E2DC' }}
                aria-label="dark mode"
              >
                <motion.span
                  animate={{ x: s.theme === 'dark' ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-surface shadow"
                />
              </button>
            </div>

            {/* 검사 중 배경음 */}
            <div className="flex items-center justify-between border-t border-line px-3 py-3">
              <span className="text-[15.5px] font-bold">{t('profile.ambient')}</span>
              <button
                onClick={() => s.setAmbient(!s.ambient)}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                style={{ background: s.ambient ? '#4FA882' : '#D9E2DC' }}
                aria-label="ambient"
              >
                <motion.span
                  animate={{ x: s.ambient ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-surface shadow"
                />
              </button>
            </div>

            {/* 글자 크기 슬라이더 */}
            <div className="border-t border-line px-3 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[15.5px] font-bold">{t('profile.fontSize')}</span>
                <span className="text-[13px] font-extrabold text-mind-700 dark:text-mind-300">{Math.round(s.fontScale * 100)}%</span>
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="text-[13px] font-bold text-ink-faint">가</span>
                <input
                  type="range"
                  min={0.9}
                  max={1.3}
                  step={0.05}
                  value={s.fontScale}
                  onChange={(e) => s.setFontScale(Number(e.target.value))}
                  className="h-2 flex-1 accent-mind-500"
                />
                <span className="text-[19px] font-bold text-ink">가</span>
              </div>
            </div>

            {/* 출석 알림 (APK) */}
            <div className="flex items-center justify-between border-t border-line px-3 py-3">
              <div className="min-w-0 pr-3">
                <p className="text-[15.5px] font-bold">{t('profile.notify')}</p>
                <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-ink-faint">{t('profile.notifyDesc')}</p>
              </div>
              <button
                onClick={() => {
                  const next = !s.notify
                  s.setNotify(next)
                  void scheduleStreakReminder(next)
                }}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                style={{ background: s.notify ? '#4FA882' : '#D9E2DC' }}
                aria-label="notify"
              >
                <motion.span
                  animate={{ x: s.notify ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-surface shadow"
                />
              </button>
            </div>

            {authReady() &&
              (authUser ? (
                <button
                  onClick={async () => {
                    await signOut()
                    setAuthUser(null)
                  }}
                  className="flex w-full items-center justify-between border-t border-line px-3 py-3"
                >
                  <span className="text-[15.5px] font-bold">🔓 {t('auth.logout')}{authUser.nickname ? ` · ${authUser.nickname}` : ''}</span>
                  <span className="text-ink-faint">›</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const r = await signInWithKakao()
                    if (!r.ok) alert(t('auth.needSetup'))
                  }}
                  className="flex w-full items-center justify-between border-t border-line px-3 py-3"
                >
                  <span className="text-[15.5px] font-bold">💬 {t('auth.kakaoLogin')}</span>
                  <span className="text-ink-faint">›</span>
                </button>
              ))}
            <button
              onClick={() => nav('/legal/terms')}
              className="flex w-full items-center justify-between border-t border-line px-3 py-3"
            >
              <span className="text-[15.5px] font-bold">📜 {t('legal.terms')}</span>
              <span className="text-ink-faint">›</span>
            </button>
            <button
              onClick={() => nav('/legal/privacy')}
              className="flex w-full items-center justify-between border-t border-line px-3 py-3"
            >
              <span className="text-[15.5px] font-bold">🔐 {t('legal.privacy')}</span>
              <span className="text-ink-faint">›</span>
            </button>
            <button
              onClick={() => nav('/admin')}
              className="flex w-full items-center justify-between border-t border-line px-3 py-3"
            >
              <span className="text-[15.5px] font-bold">🛠 {t('profile.adminMode')}</span>
              <span className="text-ink-faint">›</span>
            </button>
            <button
              onClick={() => setResetOpen(true)}
              className="flex w-full items-center justify-between border-t border-line px-3 py-3 text-red-500"
            >
              <span className="text-[15.5px] font-bold">🗑 {t('profile.reset')}</span>
              <span>›</span>
            </button>
          </Card>
        </Section>

        <p className="mt-6 text-center text-[12.5px] font-medium text-ink-faint">{t('profile.version')}</p>
      </main>

      {/* 아바타 선택 */}
      <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
      <Modal open={avatarOpen} onClose={() => setAvatarOpen(false)}>
        <div>
          <h3 className="text-center text-[18px] font-extrabold tracking-tight">{t('profile.avatarPick')}</h3>
          <div className="mt-4 flex justify-center">
            <Avatar avatar={s.avatar} size={88} />
          </div>

          {/* 동물 후보 */}
          {earnedAnimals.length > 0 ? (
            <div className="mt-4 grid grid-cols-4 gap-2.5">
              {earnedAnimals.map((key) => {
                const p = PERSONAS[key]
                const active = s.avatar?.kind === 'animal' && s.avatar.persona === key
                return (
                  <button
                    key={key}
                    onClick={() => s.setAvatar({ kind: 'animal', persona: key })}
                    className="flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl"
                    style={{
                      borderColor: active ? '#4FA882' : '#E3EAE5',
                      background: active ? '#4FA8821A' : 'rgb(var(--surface))',
                    }}
                  >
                    {p.emoji}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-surface2 px-4 py-3 text-center text-[13.5px] font-bold text-ink-faint">
              {t('profile.avatarNoAnimal')}
            </p>
          )}

          <div className="mt-4 space-y-2.5">
            <Button color="mind" onClick={() => fileRef.current?.click()}>
              {t('profile.avatarPhoto')}
            </Button>
            <Button color="white" onClick={() => s.setAvatar(null)}>
              🧠 {t('profile.avatarDefault')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)}>
        <div className="text-center">
          <div className="text-4xl">🗑</div>
          <p className="mt-3 text-sm font-bold leading-relaxed text-ink-sub">{t('profile.resetConfirm')}</p>
          <div className="mt-5 space-y-2.5">
            <Button
              color="danger"
              onClick={() => {
                s.resetAll()
                setResetOpen(false)
              }}
            >
              {t('profile.reset')}
            </Button>
            <Button color="white" onClick={() => setResetOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
