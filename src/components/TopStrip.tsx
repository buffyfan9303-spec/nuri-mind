import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { bestSurveyOf } from '../lib/survey'
import { useL } from '../i18n/useT'
import { haptic } from '../lib/haptic'
import { canHover } from '../lib/device'

/**
 * 상단 띠 배너 — 화면 맨 위 한 줄. 누르면 지금 가장 보상이 큰 설문으로 바로 간다.
 *
 * 왜 띠인가: 홈 본문의 설문 카드는 스크롤을 내려야 보인다. 리워드는 재방문의 이유라
 * '내려야 보이는 자리'에 두면 첫 방문자가 존재를 모른 채 나간다. 띠는 세로 34px만 쓰고
 * 헤더 위에 상시 붙어 있어, 본문 레이아웃을 밀지 않으면서 진입점 하나를 항상 노출한다.
 *
 * 설문이 하나도 없으면 리워드 허브로 보낸다 — 빈손으로 보내지 않는다.
 * 광택 스윕은 3.6초마다 한 번, 동작 줄이기에선 MotionConfig가 통째로 끈다.
 */
export default function TopStrip() {
  const nav = useNavigate()
  const l = useL()
  const surveys = useStore((s) => s.surveys)
  const taken = useStore((s) => s.takenSurveys)
  const best = bestSurveyOf(surveys, taken)

  const go = () => {
    haptic(6)
    nav(best ? `/rewards/survey/${best.id}` : '/rewards')
  }

  return (
    <motion.button
      onClick={go}
      whileTap={{ scale: 0.995, filter: 'brightness(0.96)' }}
      whileHover={canHover ? { filter: 'brightness(1.06)' } : undefined}
      className="relative block w-full overflow-hidden bg-gradient-to-r from-mind-600 via-mind-500 to-sky2-500 py-2 text-white"
      aria-label={l({ ko: '설문 참여하러 가기', en: 'Go to surveys', ja: 'アンケートへ' })}
    >
      {/* 광택 스윕 — 띠가 '살아 있는 링크'로 읽히게. 위치만 움직여 리페인트가 없다 */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        initial={{ x: '-30%' }}
        animate={{ x: '130vw' }}
        transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 3.6, ease: 'easeInOut' }}
      />
      <span className="relative mx-auto flex max-w-md items-center gap-2 px-5">
        <span className="shrink-0 text-[14px]" aria-hidden="true">
          💰
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-[12px] font-semibold">
          {best
            ? l({
                ko: `설문 참여하고 ${best.reward}P 받기`,
                en: `Take a survey, earn ${best.reward}P`,
                ja: `アンケートで${best.reward}P`,
              })
            : l({ ko: '리워드 받으러 가기', en: 'Go earn rewards', ja: 'リワードを受け取る' })}
        </span>
        <span className="shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-semibold">
          {l({ ko: '참여하기', en: 'Start', ja: '参加' })} ›
        </span>
      </span>
    </motion.button>
  )
}
