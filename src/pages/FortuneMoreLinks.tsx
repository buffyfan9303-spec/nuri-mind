import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SPRING, tapPop } from '../lib/motion'
import { useL } from '../i18n/useT'
import { shareOrCopy } from '../lib/share'
import { shareOrigin } from '../lib/platform'
import { toast } from '../lib/toast'
import { track } from '../lib/analytics'
import IconBadge from '../components/IconBadge'

/** 운세 화면 안의 '재미 운세 더 보기' — 별자리·타로·꿈해몽 입구 세 칸 */
export function FortuneMoreLinks({ current }: { current?: '/star' | '/tarot' | '/dream' }) {
  const l = useL()
  const nav = useNavigate()
  const items = [
    { to: '/star', emoji: '🌟', label: l({ ko: '별자리 운세', en: 'Horoscope', ja: '星座占い' }), grad: 'from-[#4A7BE0] to-[#8FB6FF]' },
    { to: '/tarot', emoji: '🃏', label: l({ ko: '오늘의 타로', en: 'Daily tarot', ja: 'タロット' }), grad: 'from-[#6B4FB8] to-[#A88BF2]' },
    { to: '/dream', emoji: '🌙', label: l({ ko: '꿈 해몽', en: 'Dream meanings', ja: '夢占い' }), grad: 'from-[#3D3A8C] to-[#7C74D9]' },
  ].filter((x) => x.to !== current)
  return (
    <section className="mt-6">
      <h2 className="text-[15px] font-extrabold text-ink-sub">{l({ ko: '재미로 보는 운세 더 보기', en: 'More just-for-fun readings', ja: 'お楽しみ占いをもっと' })}</h2>
      <div className={`mt-2 grid gap-2 ${items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {items.map((x) => (
          <motion.button
            key={x.to}
            whileTap={tapPop}
            transition={SPRING.press}
            onClick={() => nav(x.to)}
            className={`flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-3xl bg-gradient-to-br px-2 py-3 shadow-card ${x.grad}`}
          >
            <IconBadge emoji={x.emoji} tone="frost" size={32} radius={11} />
            <span className="w-full break-keep text-center text-[13px] font-extrabold leading-tight text-white">{x.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

/** 재미 운세 공통 안내 — 오락 목적임을 분명히 */
export function FunNote() {
  const l = useL()
  return (
    <p className="mt-5 break-keep text-center text-[11px] font-bold leading-relaxed text-ink-faint">
      {l({
        ko: 'ⓘ 재미로 보는 운세 · 오락 목적의 콘텐츠예요. 과학적 근거가 없으며 건강·금전·중요한 결정의 판단 기준이 아니에요.',
        en: 'ⓘ Just for fun — entertainment only. Not scientifically based, and not a basis for health, money, or important decisions.',
        ja: 'ⓘ お楽しみの占い・娯楽目的のコンテンツです。科学的根拠はなく、健康・お金・大事な決断の判断基準にはなりません。',
      })}
    </p>
  )
}

/** 공유 — 앱에서도 웹 주소로(shareOrigin). 복사로 떨어졌을 때만 토스트 */
export function useFunShare() {
  const l = useL()
  return async (channel: string, path: string, text: string) => {
    track('share', { channel })
    const out = await shareOrCopy({ title: l({ ko: '누리 마인드', en: 'NURI MIND', ja: 'NURI MIND' }), text, url: `${shareOrigin()}${path}` })
    if (out === 'copied') toast.ok(l({ ko: '링크를 복사했어요', en: 'Link copied', ja: 'リンクをコピーしました' }))
  }
}
