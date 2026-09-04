import { useState } from 'react'
import { SPRING } from '../lib/motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { Card, TopBar } from '../components/ui'
import { LOVE_ANIMALS, getChemi } from '../data/chemi'
import { PERSONAS } from '../i18n/animalTranslations'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { track } from '../lib/analytics'
import { sfx } from '../lib/sound'

const VALID = new Set(LOVE_ANIMALS.map((a) => a.key))

export default function Chemi() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const results = useStore((s) => s.results)

  const shared = params.get('a')
  const myLove = results.find((r) => r.testId === 'love')?.persona

  const [mine, setMine] = useState<string | null>(shared && VALID.has(shared) ? null : myLove && VALID.has(myLove) ? myLove : null)
  const [theirs, setTheirs] = useState<string | null>(shared && VALID.has(shared) ? shared : null)
  const [copied, setCopied] = useState(false)

  const chemi = mine && theirs ? getChemi(mine, theirs) : null

  const share = async () => {
    if (!mine) return
    track('share', { channel: 'chemi' })
    const url = `${location.origin}/chemi?a=${mine}`
    const txt = `[누리 마인드] 나랑 연애 궁합 볼래? 내 연애 동물은 ${l(PERSONAS[mine]?.name ?? { ko: '', en: '', ja: '' })} ${PERSONAS[mine]?.emoji ?? '🐾'}!`
    try {
      if (navigator.share) await navigator.share({ text: txt, url })
      else {
        await navigator.clipboard.writeText(`${txt} ${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      /* 취소 */
    }
  }

  const Picker = ({ value, onPick }: { value: string | null; onPick: (k: string) => void }) => (
    <div className="grid grid-cols-4 gap-2">
      {LOVE_ANIMALS.map((a) => {
        const p = PERSONAS[a.key]
        const sel = value === a.key
        return (
          <motion.button
            key={a.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onPick(a.key)
              sfx.tap()
            }}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2"
            style={{ borderColor: sel ? '#F25C8E' : 'rgb(var(--line))', background: sel ? '#F25C8E14' : 'rgb(var(--surface-2))' }}
          >
            <span className={`text-[24px] leading-none ${sel ? '' : 'opacity-70'}`}>{p.emoji}</span>
            <span className={`text-[11px] font-semibold ${sel ? 'text-[#C2456B]' : 'text-ink-faint'}`}>{l(p.name)}</span>
          </motion.button>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/profile" title={t('chemi.title')} />
      <main className="mx-auto max-w-md px-5">
        <p className="px-1 text-[14px] font-medium leading-relaxed text-ink-sub">
          {shared && theirs && PERSONAS[theirs] ? t('chemi.subFriend', { a: l(PERSONAS[theirs].name) }) : t('chemi.sub')}
        </p>

        {/* 나 */}
        <h2 className="mt-5 px-1 text-[15px] font-semibold">{t('chemi.me')}</h2>
        <div className="mt-2.5">
          <Picker value={mine} onPick={setMine} />
        </div>
        {!myLove && (
          <button onClick={() => nav('/test/love')} className="mt-2 px-1 text-[12px] font-semibold text-mind-600">
            {t('chemi.takeLove')} ›
          </button>
        )}

        {/* 친구 */}
        <h2 className="mt-5 px-1 text-[15px] font-semibold">{t('chemi.friend')}</h2>
        <div className="mt-2.5">
          <Picker value={theirs} onPick={setTheirs} />
        </div>

        {/* 궁합 결과 */}
        {chemi && mine && theirs && (
          <motion.div
            key={`${mine}-${theirs}`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={SPRING.ui}
            className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#F25C8E] to-[#FF8AAE] p-6 text-center text-white shadow-pop"
          >
            <div className="flex items-center justify-center gap-2 text-[28px]">
              <span>{PERSONAS[mine]?.emoji ?? '🐾'}</span>
              <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-[24px]">
                ❤️
              </motion.span>
              <span>{PERSONAS[theirs]?.emoji ?? '🐾'}</span>
            </div>
            <div className="mt-3 text-[28px] font-extrabold leading-none">{chemi.score}%</div>
            <div className="mx-auto mt-3 h-2.5 max-w-[220px] overflow-hidden rounded-full bg-white/30">
              <motion.div
                className="h-full rounded-full bg-surface"
                initial={{ width: 0 }}
                animate={{ width: `${chemi.score}%` }}
                transition={{ ...SPRING.gauge, delay: 0.2 }}
              />
            </div>
            <h3 className="mt-4 text-[20px] font-extrabold tracking-tight">{l(chemi.title)}</h3>
            <p className="mt-2 break-keep text-[14px] font-medium leading-relaxed text-white/95">{l(chemi.desc)}</p>
          </motion.div>
        )}

        {/* 공유 */}
        {copied && (
          <p className="mt-3 rounded-xl bg-mind-100 py-2 text-center text-[13px] font-semibold text-mind-700">{t('common.copied')}</p>
        )}
        <div className="mt-4">
          <Button color="love" disabled={!mine} onClick={share}>
            {t('chemi.invite')}
          </Button>
        </div>
        <p className="mt-3 px-2 text-center text-[12px] font-medium leading-relaxed text-ink-faint">{t('chemi.hint')}</p>
      </main>
    </div>
  )
}
