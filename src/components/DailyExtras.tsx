import { motion } from 'framer-motion'
import { Card } from './ui'
import { DAILY_CHALLENGES, DAILY_LINES, MOODS, dayIndex } from '../data/daily'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { sfx } from '../lib/sound'

const todayStr = () => new Date().toISOString().slice(0, 10)

/** 데일리 콘텐츠 묶음 — 오늘의 한 줄 + 기분 체크(주간 추이) + 오늘의 챌린지 */
export default function DailyExtras() {
  const t = useT()
  const l = useL()
  const moodLog = useStore((s) => s.moodLog)
  const setMood = useStore((s) => s.setMood)
  const challengeDate = useStore((s) => s.challengeDate)
  const toggleChallenge = useStore((s) => s.toggleChallenge)

  const line = DAILY_LINES[dayIndex(DAILY_LINES.length)]
  const challenge = DAILY_CHALLENGES[dayIndex(DAILY_CHALLENGES.length)]
  const today = todayStr()
  const todayMood = moodLog[today]
  const challengeDone = challengeDate === today

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
    return moodLog[d]
  })

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

      {/* 기분 체크 */}
      <div className="mt-4 border-t border-[#F1F5F2] pt-4">
        <p className="text-[13.5px] font-extrabold">{t('daily.mood')}</p>
        <div className="mt-2.5 flex justify-between">
          {MOODS.map((m, i) => {
            const sel = todayMood === i
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  setMood(i)
                  sfx.tap()
                }}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5"
                style={{ background: sel ? '#4FA88218' : 'transparent' }}
              >
                <span className={`text-[26px] leading-none ${sel || todayMood === undefined ? '' : 'opacity-40'}`}>{m.emoji}</span>
                <span className={`text-[10px] font-extrabold ${sel ? 'text-mind-700' : 'text-ink-faint'}`}>{l(m.label)}</span>
              </motion.button>
            )
          })}
        </div>
        {/* 주간 추이 */}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F4F8F5] px-3 py-2">
          {week.map((mv, i) => (
            <span key={i} className={`text-[15px] ${mv === undefined ? 'text-ink-faint opacity-40' : ''}`}>
              {mv === undefined ? '·' : MOODS[mv].emoji}
            </span>
          ))}
        </div>
      </div>

      {/* 오늘의 챌린지 */}
      <div className="mt-4 border-t border-[#F1F5F2] pt-4">
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
          <span className={`break-keep text-[14.5px] font-bold leading-snug ${challengeDone ? 'text-ink-faint line-through' : 'text-ink'}`}>
            {l(challenge)}
          </span>
        </motion.button>
      </div>
    </Card>
  )
}
