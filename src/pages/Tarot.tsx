import { useMemo, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { SPRING, popIn } from '../lib/motion'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import Emoji from '../components/Emoji'
import { useL } from '../i18n/useT'
import { useStore } from '../store/useStore'
import { usePageMeta } from '../hooks/usePageMeta'
import { tarotOfDay } from '../lib/oracle'
import { localDay } from '../lib/date'
import { haptic } from '../lib/haptic'
import { FortuneMoreLinks, FunNote, useFunShare } from './FortuneMoreLinks'
import { GuestForm, LockedCard, type GuestInfo } from './FunGuest'

/**
 * 오늘의 타로 한 장 — /tarot. (기기, 날짜)로 카드·방향이 고정돼 하루 종일 같은 카드가 나온다.
 * 뒤집었다는 사실도 오늘 날짜로 기억해, 다시 들어오면 이미 펼쳐진 상태로 보여 준다(다시 '뽑는' 척하지 않는다).
 * 뒤집기는 rotateY 스프링(flick — 사용자가 탭으로 운동량을 준 순간). '동작 줄이기'면 MotionConfig가 즉시 전환.
 */
const OPEN_KEY = 'nuri-tarot-open'
/** 풀이는 카드가 거의 다 돈 뒤에 떠오른다 */
const readingIn = { ...popIn, show: { ...(popIn.show as object), transition: { ...SPRING.pop, delay: 0.25 } } }
const readOpen = (day: string) => {
  try {
    return localStorage.getItem(OPEN_KEY) === day
  } catch {
    return false
  }
}

export default function Tarot() {
  const l = useL()
  const deviceId = useStore((s) => s.deviceId)
  const share = useFunShare()
  const day = localDay()
  // 비회원: 스토어에 기기 id가 없으므로 (이름+생일+날짜)로 오늘의 카드를 고정. 입력값·펼침 여부는 state에만
  const guest = !useStore((s) => s.onboarded)
  const [g, setG] = useState<GuestInfo | null>(null)
  const seed = guest ? `guest:${g?.name ?? ''}:${g?.birth ?? ''}` : deviceId
  const { card, reversed } = useMemo(() => tarotOfDay(seed, day), [seed, day])
  const [open, setOpen] = useState(() => !guest && readOpen(day))

  usePageMeta({
    title: l({ ko: '오늘의 타로 한 장 | 누리 마인드', en: 'Daily Tarot Card | NURI MIND', ja: '今日のタロット1枚 | NURI MIND' }),
    description: l({
      ko: '하루 한 장, 메이저 아르카나 22장 중 오늘의 카드와 정·역방향 의미, 오늘의 한마디 조언. 재미로 보는 무료 타로.',
      en: 'One card a day from the 22 Major Arcana — upright or reversed meaning plus a one-line tip for today. Free, just for fun.',
      ja: '1日1枚、大アルカナ22枚から今日のカードと正・逆位置の意味、今日のひとことアドバイス。お楽しみの無料タロット。',
    }),
    path: '/tarot',
  })

  // 앞·뒷면 표시는 회전값으로 직접 정한다(90°에서 교대). backface-visibility·preserve-3d는 Chromium이 transform 애니메이션 뒤
  // 3D를 평면화해 뒷면이 거울상으로 남았다(실측) — 쓰지 않는다. 부모 180°×앞면 180°가 상쇄돼 평면이어도 바르게 읽힌다
  const rot = useMotionValue(open ? 180 : 0)
  const backOpacity = useTransform(rot, [89.9, 90], [1, 0])
  const faceOpacity = useTransform(rot, [89.9, 90], [0, 1])
  const reduce = useReducedMotion()

  const flip = () => {
    if (open) return
    haptic(12)
    setOpen(true)
    if (reduce) rot.set(180)
    else animate(rot, 180, SPRING.flick)
    if (guest) return
    try {
      localStorage.setItem(OPEN_KEY, day)
    } catch {
      /* 기억 못 해도 카드는 같다(결정론) */
    }
  }

  const dirLabel = reversed ? l({ ko: '역방향', en: 'Reversed', ja: '逆位置' }) : l({ ko: '정방향', en: 'Upright', ja: '正位置' })
  const advice = l(reversed ? card.adviceRev : card.adviceUp)

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back={guest ? '/' : '/fortune'} right={guest ? <span /> : undefined} title={l({ ko: '오늘의 타로', en: 'Daily tarot', ja: '今日のタロット' })} />
      <main className="mx-auto max-w-md px-5">
        <div className="mt-5 text-center">
          <h1 className="break-keep text-[20px] font-extrabold leading-tight">{l({ ko: '오늘의 타로 한 장', en: 'Your card for today', ja: '今日のタロット1枚' })}</h1>
          <p className="mt-1.5 break-keep text-[13px] font-bold text-ink-faint">
            {open
              ? l({ ko: '오늘 하루는 이 카드가 함께해요', en: 'This card stays with you all day', ja: '今日一日はこのカードと一緒' })
              : l({ ko: '마음을 가볍게 하고 카드를 눌러 뒤집어 보세요', en: 'Take a breath, then tap the card to turn it over', ja: '気持ちを軽くして、カードをタップしてめくってみて' })}
          </p>
        </div>

        {guest && !g ? (
          <GuestForm title={l({ ko: '이름과 생일을 적고 오늘의 카드를 뽑아 보세요', en: "Enter your name and birthday to draw today's card", ja: '名前と誕生日を入れて今日のカードを引いてみて' })} onDone={setG} />
        ) : (
        /* 카드 — 바깥은 원근(perspective), 안쪽 버튼이 회전한다 */
        <div className={`mx-auto mt-5 h-[300px] w-[190px] [perspective:1100px] ${open ? '' : 'floaty'}`}>
          <motion.button
            type="button"
            onClick={flip}
            aria-disabled={open}
            aria-label={open ? `${l(card.name)} · ${dirLabel}` : l({ ko: '카드 뒤집기', en: 'Turn the card over', ja: 'カードをめくる' })}
            data-testid="tarot-card"
            style={{ rotateY: rot }}
            className="relative h-full w-full rounded-3xl"
          >
            {/* 뒷면 */}
            <motion.span
              className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-4 border-white/70 shadow-pop"
              style={{
                opacity: backOpacity,
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16) 0 2px, transparent 3px) 0 0 / 18px 18px, linear-gradient(150deg, #3D3A8C, #6B4FB8 55%, #A88BF2)',
              }}
            >
              <span aria-hidden className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/60 text-[28px] text-white">✦</span>
              <span aria-hidden className="sparkle absolute left-5 top-6 text-[14px] text-white/80">✦</span>
              <span aria-hidden className="sparkle absolute bottom-7 right-6 text-[12px] text-white/70" style={{ animationDelay: '1s' }}>✦</span>
              <span className="mt-4 text-[12px] font-extrabold tracking-[0.2em] text-white/85">NURI TAROT</span>
            </motion.span>
            {/* 앞면 — 뒤집힌 상태에서 바로 읽히도록 미리 180° 돌려 둔다 */}
            <motion.span
              className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border-4 border-white p-4 text-white shadow-pop"
              style={{ opacity: faceOpacity, rotateY: 180, background: `linear-gradient(160deg, ${card.grad[0]}, ${card.grad[1]})` }}
            >
              <span className="text-[13px] font-extrabold tracking-widest text-white/90">{card.roman}</span>
              <span className={`flex h-24 w-24 items-center justify-center rounded-full bg-white/25 ${reversed ? 'rotate-180' : ''}`}>
                <Emoji e={card.emoji} size={56} />
              </span>
              <span className="w-full">
                <span className="block break-keep text-center text-[17px] font-extrabold leading-tight">{l(card.name)}</span>
                <span className="mt-1.5 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-extrabold">{dirLabel}</span>
              </span>
            </motion.span>
          </motion.button>
        </div>
        )}

        <AnimatePresence>
          {open && (
            <motion.div key="reading" initial="hidden" animate="show" exit="exit" variants={readingIn} data-testid="tarot-reading">
              <p className="mt-5 text-center text-[13px] font-extrabold text-ink-sub">{l(card.keys)}</p>
              {guest ? (
                <LockedCard
                  name={g?.name}
                  what={l({ ko: '카드의 자세한 의미와 오늘의 한마디는 가입하면 볼 수 있어요', en: "The full meaning and today's tip unlock when you sign up", ja: 'カードの詳しい意味と今日のひとことは登録すると見られます' })}
                />
              ) : (
              <>
              <Card className="mt-3">
                <h2 className="text-[15px] font-extrabold">
                  {l({ ko: '카드의 의미', en: 'What it means', ja: 'カードの意味' })} · {dirLabel}
                </h2>
                <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink">{l(reversed ? card.rev : card.up)}</p>
              </Card>
              <Card className="mt-3 !bg-gradient-to-br from-[#6B4FB8] to-[#A88BF2] text-white">
                <h2 className="text-[15px] font-extrabold text-white/90">{l({ ko: '오늘의 한마디', en: "Today's tip", ja: '今日のひとこと' })}</h2>
                <p className="mt-2 break-keep text-[16px] font-bold leading-relaxed">{advice}</p>
              </Card>
              <div className="mt-4">
                <Button
                  color="white"
                  onClick={() =>
                    share('tarot', '/tarot', l({
                      ko: `[누리 마인드] 오늘의 타로: ${l(card.name)} (${dirLabel}) — ${advice}`,
                      en: `[NURI MIND] Today's tarot: ${l(card.name)} (${dirLabel}) — ${advice}`,
                      ja: `[NURI MIND] 今日のタロット：${l(card.name)}（${dirLabel}）— ${advice}`,
                    }))
                  }
                >
                  {l({ ko: '공유하기', en: 'Share', ja: '共有する' })}
                </Button>
              </div>
              <p className="mt-3 break-keep text-center text-[12px] font-bold text-ink-faint">
                {l({ ko: '자정이 지나면 새 카드가 기다려요', en: 'A new card waits after midnight', ja: '明日の0時を過ぎたら新しいカードが待っています' })}
              </p>
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FortuneMoreLinks current="/tarot" />
        <FunNote />
      </main>
    </div>
  )
}
