import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui'
import { DAILY_CHALLENGES, DAILY_LINES, dayIndex } from '../data/daily'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

const todayStr = () => new Date().toISOString().slice(0, 10)

/** 데일리 콘텐츠 묶음 — 오늘의 한 줄 + 오늘의 챌린지 + 운세 바로가기 */
export default function DailyExtras() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const challengeDate = useStore((s) => s.challengeDate)
  const toggleChallenge = useStore((s) => s.toggleChallenge)

  const line = DAILY_LINES[dayIndex(DAILY_LINES.length)]
  const challenge = DAILY_CHALLENGES[dayIndex(DAILY_CHALLENGES.length)]
  const today = todayStr()
  const challengeDone = challengeDate === today

  return (
    <Card className="!p-5">
      {/* 오늘의 한 줄 */}
      <div className="flex items-start gap-2.5">
        <span className="text-[22px]">✨</span>
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold tracking-wide text-mind-600">{t('daily.line')}</p>
          <p className="mt-1 break-keep text-[15px] font-bold leading-relaxed text-ink">{l(line)}</p>
        </div>
      </div>

      {/* 오늘의 챌린지 */}
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-[13.5px] font-extrabold">{t('daily.challenge')}</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            toggleChallenge()
            sfx.tap()
          }}
          className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors"
          style={{ background: challengeDone ? '#4FA88214' : '#F5F8F6' }}
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
            style={{ borderColor: challengeDone ? '#4FA882' : '#C9D4CC', background: challengeDone ? '#4FA882' : '#fff' }}
          >
            {challengeDone && <span className="text-[13px] text-white">✓</span>}
          </span>
          <span className={`min-w-0 flex-1 break-keep text-[14.5px] font-bold leading-snug ${challengeDone ? 'text-ink-faint line-through' : 'text-ink'}`}>
            {l(challenge)}
          </span>
        </motion.button>
      </div>

      {/* 오늘의 운세 바로가기 — 데일리 재방문 후크 */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => nav('/fortune')}
        className="mt-4 flex w-full items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#6B4FB8] to-[#A88BF2] px-3.5 py-3 text-left"
      >
        <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.6 }} className="text-[22px] leading-none">
          🔮
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold leading-tight text-white">{t('fortune.homeTitle')}</p>
          <p className="mt-0.5 break-keep text-[11px] font-bold text-white/85">{t('fortune.homeSub')}</p>
        </div>
        <span className="shrink-0 text-[16px] font-extrabold text-white/90">›</span>
      </motion.button>
    </Card>
  )
}
