import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { SPRING, popIn, tapPop } from '../lib/motion'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import { useL } from '../i18n/useT'
import { useStore } from '../store/useStore'
import { usePageMeta } from '../hooks/usePageMeta'
import { STAR_SIGNS, ELEMENT_NAME, ELEMENT_GRAD, type StarSign } from '../data/star'
import { signOfBirth, starReading } from '../lib/oracle'
import { localDay } from '../lib/date'
import { FortuneMoreLinks, FunNote, useFunShare } from './FortuneMoreLinks'
import { GuestForm, LockedCard, type GuestInfo } from './FunGuest'

/**
 * 별자리 운세 — /star. 생일이 저장돼 있으면 그 별자리, 없으면 직접 고른다(고른 값은 이 기기에 기억).
 * 문구·행운 요소는 (별자리, 날짜)로 결정론 — 오늘 몇 번을 열어도 같고 자정에 바뀐다.
 */
const PICK_KEY = 'nuri-star-sign'
const readPick = () => {
  try {
    return localStorage.getItem(PICK_KEY)
  } catch {
    return null
  }
}

/** 별자리 기호는 글자로 — 이모지 표시(보라 네모)가 아니라 텍스트 표시(︎)로 고정 */
const Sym = ({ s, className = '' }: { s: string; className?: string }) => (
  <span aria-hidden className={`font-extrabold leading-none ${className}`}>{s}{'︎'}</span>
)

export default function StarFortune() {
  const l = useL()
  const birthDate = useStore((s) => s.birthDate)
  const share = useFunShare()
  const fromBirth = useMemo(() => signOfBirth(birthDate), [birthDate])
  const [picked, setPicked] = useState<string | null>(readPick)
  // 비회원: 이름·생일을 받아 별자리와 오늘 한 줄만(나머지는 잠금). 입력값은 state에만
  const guest = !useStore((s) => s.onboarded)
  const [g, setG] = useState<GuestInfo | null>(null)
  const sign: StarSign | null = guest ? (g ? signOfBirth(g.birth) : null) : (STAR_SIGNS.find((s) => s.id === picked) ?? fromBirth)
  const day = localDay()
  const r = useMemo(() => (sign ? starReading(sign, day) : null), [sign, day])

  usePageMeta({
    title: l({ ko: '오늘의 별자리 운세 | 누리 마인드', en: "Today's Horoscope | NURI MIND", ja: '今日の星座占い | NURI MIND' }),
    description: l({
      ko: '12별자리 오늘의 운세와 이번 주 흐름, 행운의 색·숫자, 잘 맞는 별자리까지. 재미로 보는 무료 별자리 운세.',
      en: "Today's horoscope and this week's flow for all 12 signs, with lucky color, number, and a compatible sign. Free, just for fun.",
      ja: '12星座の今日の運勢と今週の流れ、ラッキーカラー・数字、相性の良い星座まで。お楽しみの無料星座占い。',
    }),
    path: '/star',
  })

  const choose = (id: string) => {
    setPicked(id)
    try {
      localStorage.setItem(PICK_KEY, id)
    } catch {
      /* 저장 못 해도 이번 화면에선 동작 */
    }
  }

  const grad = sign ? ELEMENT_GRAD[sign.element] : ELEMENT_GRAD.water

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back={guest ? '/' : '/fortune'} right={guest ? <span /> : undefined} title={l({ ko: '별자리 운세', en: 'Horoscope', ja: '星座占い' })} />
      <main className="mx-auto max-w-md px-5">
        {sign && r ? (
          <motion.div key={sign.id} initial="hidden" animate="show" variants={popIn}>
            {/* 히어로 */}
            <div className="relative mt-3 overflow-hidden rounded-3xl p-6 text-center text-white shadow-pop" style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
              <span aria-hidden className="sparkle absolute right-5 top-4 text-[20px] text-white/70">✦</span>
              <span aria-hidden className="sparkle absolute bottom-5 left-6 text-[13px] text-white/60" style={{ animationDelay: '0.8s' }}>✦</span>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/25">
                <Sym s={sign.sym} className="text-[28px]" />
              </div>
              <h1 className="mt-3 text-[24px] font-extrabold tracking-tight">{l(sign.name)}</h1>
              <p className="mt-1 text-[13px] font-bold text-white/90">
                {l(sign.range)} · {l({ ko: `${l(ELEMENT_NAME[sign.element])}의 별자리`, en: `${l(ELEMENT_NAME[sign.element])} sign`, ja: `${l(ELEMENT_NAME[sign.element])}の星座` })}
              </p>
              {!guest && !picked && fromBirth && (
                <p className="mt-2 text-[12px] font-bold text-white/80">{l({ ko: '저장된 생일로 찾았어요', en: 'Found from your saved birthday', ja: '保存した誕生日から見つけました' })}</p>
              )}
            </div>

            {/* 오늘 */}
            <Card className="mt-3">
              <h2 className="text-[15px] font-extrabold">{l({ ko: '오늘의 운세', en: 'Today', ja: '今日の運勢' })}</h2>
              <p className="mt-2 break-keep text-[15px] font-bold leading-relaxed text-ink">{l(r.today)}</p>
            </Card>

            {guest ? (
              <LockedCard
                name={g?.name}
                what={l({ ko: '이번 주 흐름 · 행운의 색과 숫자 · 잘 맞는 별자리는 가입하면 볼 수 있어요', en: "This week's flow, lucky color & number, and your best match unlock when you sign up", ja: '今週の流れ・ラッキーカラーと数字・相性の良い星座は登録すると見られます' })}
              />
            ) : (
            <>
            {/* 행운 요소 */}
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              <div className="flex flex-col items-center rounded-2xl bg-surface p-3 text-center shadow-card">
                <span aria-hidden className="h-6 w-6 rounded-full border-2 border-line" style={{ background: r.color.hex }} />
                <p className="mt-1.5 text-[11px] font-bold text-ink-faint">{l({ ko: '행운의 색', en: 'Lucky color', ja: 'ラッキーカラー' })}</p>
                <p className="mt-0.5 break-keep text-[13px] font-extrabold leading-tight">{l(r.color.name)}</p>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-surface p-3 text-center shadow-card">
                <span className="text-[20px] font-black leading-6" style={{ color: grad[0] }}>{r.number}</span>
                <p className="mt-1.5 text-[11px] font-bold text-ink-faint">{l({ ko: '행운의 숫자', en: 'Lucky number', ja: 'ラッキーナンバー' })}</p>
              </div>
              <button
                onClick={() => choose(r.mate.id)}
                className="flex flex-col items-center rounded-2xl bg-surface p-3 text-center shadow-card"
                aria-label={l({ ko: `잘 맞는 별자리 ${l(r.mate.name)} 보기`, en: `See compatible sign ${l(r.mate.name)}`, ja: `相性の良い${l(r.mate.name)}を見る` })}
              >
                <Sym s={r.mate.sym} className="text-[20px]" />
                <p className="mt-1.5 text-[11px] font-bold text-ink-faint">{l({ ko: '잘 맞는 별자리', en: 'Good match', ja: '相性の良い星座' })}</p>
                <p className="mt-0.5 break-keep text-[13px] font-extrabold leading-tight">{l(r.mate.name)}</p>
              </button>
            </div>

            {/* 이번 주 */}
            <Card className="mt-3">
              <h2 className="text-[15px] font-extrabold">{l({ ko: '이번 주 흐름', en: 'This week', ja: '今週の流れ' })}</h2>
              <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{l(r.week)}</p>
            </Card>

            {/* 성격 */}
            <Card className="mt-3">
              <h2 className="text-[15px] font-extrabold">{l({ ko: `${l(sign.name)}는 이런 사람`, en: `About ${l(sign.name)}`, ja: `${l(sign.name)}はこんな人` })}</h2>
              <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{l(sign.trait)}</p>
            </Card>

            <div className="mt-4">
              <Button
                color="white"
                onClick={() =>
                  share('star', '/star', l({
                    ko: `[누리 마인드] 오늘의 ${l(sign.name)} 운세: ${l(r.today)}`,
                    en: `[NURI MIND] Today's ${l(sign.name)} horoscope: ${l(r.today)}`,
                    ja: `[NURI MIND] 今日の${l(sign.name)}：${l(r.today)}`,
                  }))
                }
              >
                {l({ ko: '공유하기', en: 'Share', ja: '共有する' })}
              </Button>
            </div>
            </>
            )}
          </motion.div>
        ) : guest ? (
          <GuestForm title={l({ ko: '이름과 생일로 오늘의 별자리 운세 보기', en: "See today's horoscope with your name and birthday", ja: '名前と誕生日で今日の星座占いを見る' })} onDone={setG} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.ui} className="mt-8 text-center">
            <h1 className="break-keep text-[20px] font-extrabold leading-tight">{l({ ko: '내 별자리를 골라 주세요', en: 'Pick your sign', ja: '自分の星座を選んでください' })}</h1>
            <p className="mt-1.5 break-keep text-[13px] font-bold text-ink-faint">
              {l({ ko: '생일을 저장해 두면 다음부터 바로 보여 드려요', en: 'Save your birthday and we will show it right away next time', ja: '誕生日を保存すると次回からすぐ表示します' })}
            </p>
          </motion.div>
        )}

        {/* 12별자리 고르기 — 회원만(비회원은 생일로 정해진 별자리 하나) */}
        {!guest && (<>
        <h2 className="mt-6 text-[15px] font-extrabold text-ink-sub">{sign ? l({ ko: '다른 별자리 보기', en: 'Other signs', ja: 'ほかの星座' }) : l({ ko: '12별자리', en: '12 signs', ja: '12星座' })}</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {STAR_SIGNS.map((s) => {
            const on = s.id === sign?.id
            return (
              <motion.button
                key={s.id}
                whileTap={tapPop}
                transition={SPRING.press}
                onClick={() => choose(s.id)}
                aria-pressed={on}
                className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl border-2 px-1 py-2 ${on ? 'border-mind-400 bg-mind-50 dark:bg-mind-500/20' : 'border-line bg-surface'}`}
              >
                <Sym s={s.sym} className="text-[20px]" />
                <span className="mt-1 break-keep text-[12px] font-extrabold leading-tight">{l(s.name)}</span>
                <span className="text-[11px] font-bold text-ink-faint">{l(s.range)}</span>
              </motion.button>
            )
          })}
        </div>
        </>)}

        <FortuneMoreLinks current="/star" />
        <FunNote />
      </main>
    </div>
  )
}
