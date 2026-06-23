import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TopBar } from '../components/ui'
import Button from '../components/Button'
import { PERSONAS } from '../i18n/animalTranslations'
import { testMeta } from '../data/tests'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { decodeDuel } from '../lib/duel'

const topOf = (p: number) => Math.max(0.5, Math.round((100 - p) * 10) / 10)
/** 점수가 높을수록 '우세'로 볼 수 있는 검사(IQ·회복탄력성). 임상검사는 중립 비교만. */
const HIGHER_BETTER = new Set(['iq', 'resilience'])

export default function Duel() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const t = useT()
  const l = useL()
  const results = useStore((s) => s.results)
  const friend = useMemo(() => decodeDuel(params.get('r') ?? ''), [params])

  if (!friend || !PERSONAS[friend.a]) {
    return (
      <div className="min-h-dvh pb-20">
        <TopBar back="/" title={l({ ko: '결과 대결', en: 'Result duel', ja: '結果バトル' })} />
        <main className="mx-auto max-w-md px-5 pt-12 text-center">
          <p className="text-[44px]">🤔</p>
          <p className="mt-3 text-[15px] font-bold text-ink-sub">
            {l({ ko: '대결 링크가 올바르지 않아요.', en: 'This duel link is invalid.', ja: 'リンクが正しくありません。' })}
          </p>
          <div className="mt-5">
            <Button color="mind" onClick={() => nav('/')}>{l({ ko: '검사하러 가기', en: 'Take a test', ja: '検査へ' })}</Button>
          </div>
        </main>
      </div>
    )
  }

  const fPersona = PERSONAS[friend.a]
  const fTop = topOf(friend.p)
  const tm = testMeta(friend.t as Parameters<typeof testMeta>[0])
  const testName = t(`test.${friend.t}.name`)
  const mine = results.filter((r) => r.testId === friend.t).sort((a, b) => b.at - a.at)[0]
  const myPersona = mine ? PERSONAS[mine.persona] : null
  const myTop = mine ? topOf(mine.percentile) : null

  let verdict = ''
  if (mine && myPersona) {
    if (mine.persona === friend.a) verdict = l({ ko: '쌍둥이 결과! 🤝 완전 닮은꼴', en: 'Twins! 🤝 same type', ja: 'そっくり！🤝 同じタイプ' })
    else if (HIGHER_BETTER.has(friend.t)) {
      verdict =
        mine.percentile > friend.p
          ? l({ ko: '🏆 내가 더 높아요!', en: '🏆 I scored higher!', ja: '🏆 私の勝ち！' })
          : mine.percentile < friend.p
            ? l({ ko: '😮 친구가 더 높네요!', en: '😮 Friend scored higher!', ja: '😮 友達の勝ち！' })
            : l({ ko: '🤝 완전 동점!', en: '🤝 A tie!', ja: '🤝 引き分け！' })
    } else verdict = l({ ko: '서로 다른 유형이에요!', en: 'Different types!', ja: '違うタイプ！' })
  }

  const Side = ({ label, p, top, win }: { label: string; p: typeof fPersona; top: number; win: boolean }) => (
    <div
      className={`flex flex-1 flex-col items-center rounded-3xl p-4 text-center ${win ? 'ring-4 ring-amber-300' : ''}`}
      style={{ background: `linear-gradient(150deg, ${p.grad[0]}, ${p.grad[1]})` }}
    >
      <span className="max-w-full truncate text-[11px] font-extrabold text-white/85">{label}</span>
      <span className="mt-1 text-[40px] leading-none">{p.emoji}</span>
      <span className="mt-1.5 break-keep text-[13.5px] font-extrabold text-white">{l(p.name)}</span>
      <span className="mt-1.5 rounded-full bg-black/15 px-2 py-0.5 text-[11px] font-extrabold text-white">
        {l({ ko: `상위 ${top}%`, en: `top ${top}%`, ja: `上位${top}%` })}
      </span>
    </div>
  )

  const iWin = !!mine && HIGHER_BETTER.has(friend.t) && mine.percentile > friend.p
  const friendWin = !!mine && HIGHER_BETTER.has(friend.t) && friend.p > mine.percentile

  return (
    <div className="min-h-dvh pb-24">
      <TopBar back="/" title={l({ ko: '결과 대결', en: 'Result duel', ja: '結果バトル' })} />
      <main className="mx-auto max-w-md px-5">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 break-keep text-center text-[19px] font-extrabold tracking-tight"
        >
          {tm?.emoji} {testName} {l({ ko: '대결', en: 'duel', ja: 'バトル' })}
        </motion.h1>

        <div className="mt-5 flex items-stretch gap-2">
          {mine && myPersona ? (
            <Side label={l({ ko: '나', en: 'Me', ja: '私' })} p={myPersona} top={myTop!} win={iWin} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line p-4 text-center">
              <span className="text-[34px]">❔</span>
              <span className="mt-1.5 break-keep text-[12.5px] font-bold text-ink-faint">{l({ ko: '아직 안 했어요', en: 'Not yet', ja: '未実施' })}</span>
            </div>
          )}
          <div className="flex shrink-0 items-center text-[20px] font-black text-ink-faint">VS</div>
          <Side label={friend.n || l({ ko: '친구', en: 'Friend', ja: '友達' })} p={fPersona} top={fTop} win={friendWin} />
        </div>

        {verdict && (
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            className="mt-4 rounded-2xl bg-mind-100 py-3 text-center text-[15px] font-extrabold text-mind-700"
          >
            {verdict}
          </motion.p>
        )}

        <div className="mt-6">
          {mine ? (
            <Button color="mind" onClick={() => nav(`/result/${mine.id}`)}>
              {l({ ko: '내 결과 자세히 보기', en: 'View my result', ja: '私の結果を見る' })}
            </Button>
          ) : (
            <Button color="mind" onClick={() => nav(`/test/${friend.t}`)}>
              🆚 {l({ ko: `나도 ${testName} 하고 비교하기`, en: `Take ${testName} & compare`, ja: `${testName}で比較する` })}
            </Button>
          )}
        </div>
        <button onClick={() => nav('/')} className="mt-2 w-full py-2 text-[13px] font-bold text-ink-faint">
          {l({ ko: '홈으로', en: 'Home', ja: 'ホーム' })}
        </button>
      </main>
    </div>
  )
}
