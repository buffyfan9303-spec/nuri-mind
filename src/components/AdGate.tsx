import { useEffect, useMemo, useRef, useState } from 'react'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import Button from './Button'
import { useT, useL } from '../i18n/useT'
import { showInterstitial } from '../lib/ads'
import type { L } from '../data/types'

const WAIT_SEC = 5

/**
 * 결과 준비 게이트 — 검사 완료 → 결과 공개 사이의 브릿지.
 * ⚠️ AdSense 정책: 전면(인터스티셜) 화면에 웹 디스플레이 광고 게재 금지
 *   ("알림·이동·행동 목적 화면") → 광고 대신 '심리 한 스푼' 상식 카드를 보여준다.
 *   APK 전환 시엔 showInterstitial()이 AdMob 전면광고(앱 정책상 허용)로 대체.
 */
const TIPS: { emoji: string; text: L }[] = [
  { emoji: '🧠', text: { ko: '뇌는 멀티태스킹을 못 해요 — 실제론 빠르게 "전환"할 뿐이라 그때마다 집중력이 새어나가요.', en: 'Brains can\'t multitask — they rapidly switch, leaking focus each time.', ja: '脳はマルチタスクができません — 実際は高速で「切替」し、その度に集中が漏れます。' } },
  { emoji: '😴', text: { ko: '수면이 부족하면 편도체(감정 뇌)가 60% 더 과민해져요. 예민한 날엔 먼저 잠을 점검하세요.', en: 'Sleep loss makes the amygdala ~60% more reactive. On edgy days, check your sleep first.', ja: '睡眠不足で扁桃体は約60%過敏に。イライラの日はまず睡眠を点検。' } },
  { emoji: '📝', text: { ko: '걱정을 종이에 적기만 해도 뇌의 위협 반응이 줄어들어요 — "이름 붙이면 길들여진다".', en: 'Just writing worries down calms the brain\'s threat response — "name it to tame it".', ja: '心配を紙に書くだけで脳の脅威反応が減少 —「名付ければ手なずく」。' } },
  { emoji: '🚶', text: { ko: '10분 산책은 저용량 항우울제만큼 기분을 끌어올린다는 연구가 있어요.', en: 'A 10-minute walk can lift mood comparably to a low-dose antidepressant, studies suggest.', ja: '10分の散歩は低用量抗うつ薬並みに気分を上げるという研究も。' } },
  { emoji: '🫁', text: { ko: '숨을 "4초 들이쉬고 6초 내쉬면" 심박이 느려지며 몸이 먼저 진정돼요. 마음은 그 뒤를 따라와요.', en: 'Breathe in 4s, out 6s — the heart slows, the body calms first, and the mind follows.', ja: '4秒吸って6秒吐くと心拍が落ち、体が先に鎮まり心が続きます。' } },
  { emoji: '🤝', text: { ko: '자존감은 "잘나서" 생기는 게 아니라, 실수한 나를 친구 대하듯 대할 때 자라요.', en: 'Self-esteem grows not from being great, but from treating your failing self like a friend.', ja: '自尊心は「優秀さ」でなく、失敗した自分を友のように扱う時に育ちます。' } },
]

export default function AdGate({ onDone }: { onDone: () => void }) {
  const t = useT()
  const l = useL()
  const [left, setLeft] = useState(WAIT_SEC)
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], [])
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    showInterstitial()
    boxRef.current?.focus() // 게이트로 초점 이동 — 키보드로 뒤 화면 조작해 우회하는 것 방지(+스크린리더 인지)
    const iv = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <motion.div
      ref={boxRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('gate.title')}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F3F30]/95 px-5 outline-none backdrop-blur"
    >
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="mb-3 text-5xl"
          >
            🧠
          </motion.div>
          <h2 className="text-xl font-extrabold text-white">{t('gate.title')}</h2>
          <p className="mt-1 text-sm font-medium tracking-wide text-mind-200">{t('gate.sub')}</p>
        </div>

        {/* 심리 한 스푼 — 대기 시간을 콘텐츠로 채움 */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING.sheet, delay: 0.2 }}
          className="rounded-3xl bg-white/10 p-5 text-center"
        >
          <p className="text-[13px] font-extrabold tracking-wide text-mind-300">💡 {l({ ko: '기다리는 동안, 심리 한 스푼', en: 'While you wait — a psych spoonful', ja: '待つ間に、心理ひとさじ' })}</p>
          <p className="mt-2 text-[30px] leading-none">{tip.emoji}</p>
          <p className="mt-2.5 break-keep text-[14.5px] font-bold leading-relaxed text-white">{l(tip.text)}</p>
        </motion.div>

        <div className="mt-5">
          {left > 0 ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/10 py-3.5 font-extrabold text-white">
              <svg className="h-6 w-6 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#ffffff33" strokeWidth="4" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  animate={{ strokeDashoffset: [0, 2 * Math.PI * 15] }}
                  transition={{ duration: WAIT_SEC, ease: 'linear' }}
                />
              </svg>
              {left}s
            </div>
          ) : (
            <Button color="mind" size="lg" onClick={onDone}>
              {t('gate.continue')} →
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
