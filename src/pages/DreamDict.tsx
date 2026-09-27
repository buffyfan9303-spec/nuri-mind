import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SPRING, popIn, tapPop } from '../lib/motion'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import Emoji from '../components/Emoji'
import { useL } from '../i18n/useT'
import { usePageMeta } from '../hooks/usePageMeta'
import { DREAMS, type DreamTone } from '../data/dream'
import { matchDreams } from '../lib/oracle'
import type { L } from '../data/types'
import { FortuneMoreLinks, FunNote, useFunShare } from './FortuneMoreLinks'
import { LockedCard } from './FunGuest'
import { useStore } from '../store/useStore'
import { fetchDreamReading, DREAM_AI_MAX, type DreamReading } from '../lib/dreamAi'

/**
 * 꿈 해몽 — /dream. 사전(data/dream.ts)만 쓴다(서버·AI 호출 없음).
 * 문장을 적으면 들어 있는 키워드를 전부 찾아 풀이를 보여 주고, 인기 키워드 칩으로 바로 볼 수도 있다.
 */
const TONE: Record<DreamTone, { label: L; cls: string }> = {
  good: { label: { ko: '길몽', en: 'Lucky', ja: '吉夢' }, cls: 'bg-[#FFF1D6] text-[#9A5B00] dark:bg-[#9A5B00]/30 dark:text-[#FFD591]' },
  soso: { label: { ko: '상황 따라', en: 'It depends', ja: '状況次第' }, cls: 'bg-mind-50 text-mind-700 dark:bg-mind-500/20 dark:text-mind-100' },
  care: { label: { ko: '마음 살핌', en: 'Self-care', ja: '心のケア' }, cls: 'bg-[#E6F1FF] text-[#2F5FB3] dark:bg-[#2F5FB3]/30 dark:text-[#AFCBFF]' },
}

const POPULAR = DREAMS.filter((d) => d.pop)

/** 비회원 맛보기용 — 풀이의 첫 문장만 */
const firstSentence = (s: string) => s.match(/^.+?[.。!?！](?=s|$)/)?.[0] ?? s

export default function DreamDict() {
  const l = useL()
  const share = useFunShare()
  const [q, setQ] = useState('')
  // 비회원: 첫 번째 키워드의 짧은 풀이만(나머지 키워드·AI 해몽은 잠금)
  const guest = !useStore((s) => s.onboarded)
  const hits = useMemo(() => matchDreams(q), [q])
  const typed = q.trim().length > 0
  const shown = guest ? hits.slice(0, 1) : hits

  usePageMeta({
    title: l({ ko: '꿈 해몽 사전 | 누리 마인드', en: 'Dream Meanings Dictionary | NURI MIND', ja: '夢占い辞典 | NURI MIND' }),
    description: l({
      ko: '뱀꿈·돼지꿈·이빨 빠지는 꿈·똥꿈·떨어지는 꿈 등 80가지 꿈 키워드 해몽. 꿈 내용을 적으면 여러 키워드를 한 번에 찾아 줘요. 재미로 보는 무료 꿈 해몽.',
      en: 'Meanings for 80 common dream symbols — snakes, teeth falling out, falling, being chased and more. Describe your dream to match several at once. Free, just for fun.',
      ja: '蛇・豚・歯が抜ける・落ちる夢など80の夢キーワードを解説。夢の内容を書くと複数のキーワードを一度に探します。お楽しみの無料夢占い。',
    }),
    path: '/dream',
  })

  const chips = (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {POPULAR.map((d) => (
        <motion.button
          key={d.id}
          whileTap={tapPop}
          transition={SPRING.press}
          onClick={() => setQ(l(d.title))}
          className="flex min-h-[44px] items-center rounded-full border-2 border-line bg-surface px-3 text-[13px] font-extrabold"
        >
          <Emoji e={d.emoji} inline />
          {l(d.title)}
        </motion.button>
      ))}
    </div>
  )

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back={guest ? '/' : '/fortune'} right={guest ? <span /> : undefined} title={l({ ko: '꿈 해몽', en: 'Dream meanings', ja: '夢占い' })} />
      <main className="mx-auto max-w-md px-5">
        <div className="mt-5 text-center">
          <h1 className="break-keep text-[20px] font-extrabold leading-tight">{l({ ko: '어젯밤 무슨 꿈을 꿨나요?', en: 'What did you dream last night?', ja: '昨夜はどんな夢を見ましたか？' })}</h1>
          <p className="mt-1.5 break-keep text-[13px] font-bold text-ink-faint">
            {l({ ko: '꿈 내용을 편하게 적으면 키워드를 찾아 풀어 드려요', en: 'Describe it freely and we will find the symbols in it', ja: '夢の内容を自由に書くと、キーワードを見つけて解説します' })}
          </p>
        </div>

        <label className="mt-4 block">
          <span className="sr-only">{l({ ko: '꿈 내용', en: 'Your dream', ja: '夢の内容' })}</span>
          <div className="flex items-center gap-2 rounded-3xl border-2 border-line bg-surface px-4 focus-within:border-mind-400">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={DREAM_AI_MAX}
              enterKeyHint="search"
              aria-label={l({ ko: '꿈 내용 검색', en: 'Search your dream', ja: '夢の内容を検索' })}
              placeholder={l({ ko: '예: 뱀이 집으로 들어오는 꿈', en: 'e.g. a snake came into my house', ja: '例：蛇が家に入ってくる夢' })}
              className="min-h-[52px] min-w-0 flex-1 bg-transparent text-[15px] font-bold outline-none focus-visible:outline-none placeholder:text-ink-faint"
              data-testid="dream-input"
            />
            {typed && (
              <button onClick={() => setQ('')} className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-[15px] font-extrabold text-ink-faint" aria-label={l({ ko: '지우기', en: 'Clear', ja: 'クリア' })}>
                ✕
              </button>
            )}
          </div>
        </label>

        {!typed && (
          <>
            <h2 className="mt-5 text-[15px] font-extrabold text-ink-sub">{l({ ko: '많이 찾는 꿈', en: 'Popular dreams', ja: 'よく検索される夢' })}</h2>
            {chips}
          </>
        )}

        <div className="mt-4 space-y-3" data-testid="dream-results" aria-live="polite">
          <AnimatePresence initial={false}>
            {shown.map((d) => (
              <motion.div key={d.id} layout initial="hidden" animate="show" exit="exit" variants={popIn}>
                <Card>
                  <div className="flex items-center gap-2.5">
                    <Emoji e={d.emoji} size={28} />
                    <h3 className="min-w-0 flex-1 break-keep text-[16px] font-extrabold leading-tight">{l(d.title)}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${TONE[d.tone].cls}`}>{l(TONE[d.tone].label)}</span>
                  </div>
                  <p className="mt-2.5 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{guest ? firstSentence(l(d.meaning)) : l(d.meaning)}</p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {typed && hits.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.ui}>
            <Card className="text-center">
              <div className="leading-none"><Emoji e="🌙" size={28} className="align-top" /></div>
              <p className="mt-2 break-keep text-[15px] font-extrabold">{l({ ko: '아직 사전에 없는 꿈이에요', en: "That one isn't in our dictionary yet", ja: 'まだ辞典にない夢です' })}</p>
              <p className="mt-1 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">
                {l({
                  ko: '꿈에 나온 동물·장소·물건을 짧게 적어 보세요. 아래 인기 키워드에서 골라도 좋아요.',
                  en: 'Try a short word for an animal, place, or object from your dream — or pick a popular one below.',
                  ja: '夢に出た動物・場所・物を短く書いてみて。下の人気キーワードから選んでもOK。',
                })}
              </p>
            </Card>
            <h2 className="mt-5 text-[15px] font-extrabold text-ink-sub">{l({ ko: '많이 찾는 꿈', en: 'Popular dreams', ja: 'よく検索される夢' })}</h2>
            {chips}
          </motion.div>
        )}

        {guest && hits.length > 0 && (
          <LockedCard
            what={
              hits.length > 1
                ? l({ ko: `찾은 키워드 ${hits.length - 1}개 더, 자세한 풀이와 AI 해몽은 가입하면 볼 수 있어요`, en: `${hits.length - 1} more symbols, full meanings, and AI dream reading unlock when you sign up`, ja: `ほかのキーワード${hits.length - 1}件、詳しい解説とAI夢占いは登録すると見られます` })
                : l({ ko: '자세한 풀이와 AI 해몽은 가입하면 볼 수 있어요', en: 'Full meanings and AI dream reading unlock when you sign up', ja: '詳しい解説とAI夢占いは登録すると見られます' })
            }
          />
        )}

        {!guest && typed && <DreamAiSection q={q} keywords={hits.map((d) => l(d.title))} />}

        {!guest && hits.length > 0 && (
          <div className="mt-4">
            <Button
              color="white"
              onClick={() =>
                share('dream', '/dream', l({
                  ko: `[누리 마인드] 꿈 해몽: ${hits.map((d) => l(d.title)).join(', ')} — ${l(hits[0].meaning)}`,
                  en: `[NURI MIND] Dream meaning: ${hits.map((d) => l(d.title)).join(', ')} — ${l(hits[0].meaning)}`,
                  ja: `[NURI MIND] 夢占い：${hits.map((d) => l(d.title)).join('、')} — ${l(hits[0].meaning)}`,
                }))
              }
            >
              {l({ ko: '공유하기', en: 'Share', ja: '共有する' })}
            </Button>
          </div>
        )}

        <p className="mt-5 break-keep text-center text-[12px] font-bold leading-relaxed text-ink-faint">
          {l({
            ko: '꿈은 미래를 알려 주지 않아요. 불편한 꿈이 자주 이어져 힘들다면, 믿을 수 있는 사람과 이야기 나눠 보세요.',
            en: "Dreams don't predict the future. If upsetting dreams keep coming back, it can help to talk with someone you trust.",
            ja: '夢は未来を告げるものではありません。つらい夢が続くときは、信頼できる人と話してみてください。',
          })}
        </p>
        <FortuneMoreLinks current="/dream" />
        <FunNote />
      </main>
    </div>
  )
}

/** AI 꿈 해몽(회원) — 버튼을 눌렀을 때만 호출. 입력이 바뀌면 이전 결과는 숨긴다(다른 꿈의 풀이가 남지 않게) */
function DreamAiSection({ q, keywords }: { q: string; keywords: string[] }) {
  const l = useL()
  const lang = useStore((s) => s.lang)
  const text = q.trim()
  const [st, setSt] = useState<{ text: string; lang: string; status: 'loading' | 'ok' | 'quota' | 'error'; reading?: DreamReading } | null>(null)
  const cur = st && st.text === text && st.lang === lang ? st : null
  const run = async () => {
    setSt({ text, lang, status: 'loading' })
    const r = await fetchDreamReading(text, keywords, lang)
    setSt(r.ok ? { text, lang, status: 'ok', reading: r.reading } : { text, lang, status: r.reason })
  }
  const rd = cur?.status === 'ok' ? cur.reading : undefined
  return (
    <section className="mt-4" data-testid="dream-ai">
      {!rd && (
        <>
          <p className="break-keep text-[12px] font-bold leading-relaxed text-ink-faint">
            {l({
              ko: 'ⓘ 꿈 내용이 AI 해석을 위해 외부 AI 서비스(Google)로 전송돼요. 이름 등 개인정보는 적지 마세요.',
              en: 'ⓘ Your dream text is sent to an external AI service (Google) for interpretation. Please leave out names and other personal details.',
              ja: 'ⓘ 夢の内容はAI解釈のため外部AIサービス（Google）に送信されます。名前などの個人情報は書かないでください。',
            })}
          </p>
          <div className="mt-2">
            <Button color="mind" disabled={text.length < 5} busy={cur?.status === 'loading'} onClick={run}>
              {l({ ko: 'AI로 자세히 풀어 보기', en: 'Read it in depth with AI', ja: 'AIで詳しく読み解く' })}
              <Emoji e="✨" size="1.1em" className="ml-1 align-[-0.15em]" />
            </Button>
          </div>
          {text.length < 5 && (
            <p className="mt-1.5 text-center text-[11px] font-bold text-ink-faint">{l({ ko: '꿈 내용을 5자 이상 적으면 눌 수 있어요', en: 'Write at least 5 characters to use it', ja: '5文字以上書くと使えます' })}</p>
          )}
        </>
      )}
      {cur?.status === 'loading' && (
        <Card className="mt-3 space-y-2.5" ariaLabel={l({ ko: 'AI 해몽을 불러오는 중', en: 'Loading AI reading', ja: 'AI夢占いを読み込み中' })}>
          {[70, 95, 88, 60].map((w) => (
            <div key={w} className="skeleton h-3.5 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </Card>
      )}
      {(cur?.status === 'quota' || cur?.status === 'error') && (
        <p className="mt-3 rounded-2xl bg-surface2 px-4 py-3 text-center break-keep text-[13px] font-bold text-ink-sub" role="status">
          {cur.status === 'quota'
            ? l({ ko: '오늘 AI 해몽 횟수를 다 썼어요. 내일 다시 만나요', en: "You've used today's AI readings. See you tomorrow", ja: '今日のAI夢占いの回数を使い切りました。また明日' })
            : l({ ko: '지금은 AI 해몽을 불러오지 못했어요', en: "Couldn't load the AI reading right now", ja: '今はAI夢占いを読み込めませんでした' })}
        </p>
      )}
      {rd && (
        <motion.div initial="hidden" animate="show" variants={popIn}>
          <Card className="!bg-gradient-to-br from-[#3D3A8C] to-[#7C74D9] text-white">
            <p className="text-[12px] font-extrabold text-white/80">{l({ ko: 'AI 꿈 해몽', en: 'AI dream reading', ja: 'AI夢占い' })}</p>
            <h3 className="mt-1 break-keep text-[17px] font-extrabold leading-tight">{rd.title}</h3>
            <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-white/95">{rd.summary}</p>
          </Card>
          <Card className="mt-3">
            <h3 className="text-[15px] font-extrabold">{l({ ko: '꿈속 상징', en: 'Symbols', ja: '夢のシンボル' })}</h3>
            <ul className="mt-2 space-y-2">
              {rd.symbols.map((sy, i) => (
                <li key={i} className="break-keep text-[14px] font-bold leading-relaxed text-ink-sub">
                  <b className="text-ink">{sy.symbol}</b> · {sy.meaning}
                </li>
              ))}
            </ul>
            <h3 className="mt-4 text-[15px] font-extrabold">{l({ ko: '마음 읽기', en: 'How it may feel', ja: '心の読み解き' })}</h3>
            <p className="mt-1.5 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{rd.feeling}</p>
            <h3 className="mt-4 text-[15px] font-extrabold">{l({ ko: '오늘의 한마디', en: "Today's tip", ja: '今日のひとこと' })}</h3>
            <p className="mt-1.5 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{rd.advice}</p>
          </Card>
          <p className="mt-2 break-keep text-center text-[11px] font-bold leading-relaxed text-ink-faint">
            {l({ ko: 'ⓘ AI가 만든 재미용 해석이에요. 오락 목적이며 사실이나 예언이 아니에요.', en: 'ⓘ An AI-generated interpretation for fun — entertainment only, not fact or prediction.', ja: 'ⓘ AIが作ったお楽しみ用の解釈です。娯楽目的で、事実や予言ではありません。' })}
          </p>
        </motion.div>
      )}
    </section>
  )
}
