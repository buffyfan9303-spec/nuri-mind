import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import AdSlot from '../components/AdSlot'
import { Card, Modal, TopBar } from '../components/ui'
import { PERSONAS, EMOJI_TEST } from '../i18n/animalTranslations'
import { TESTS } from '../data/tests'
import type { CommunityPost, TestId } from '../data/types'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { sfx } from '../lib/sound'
import { burst } from '../lib/confetti'
import { supabaseReady } from '../lib/supabase'
import { createPost, fetchPosts, removePost, toggleLike } from '../lib/community'

const HOT = 10 // 좋아요 이 수 이상이면 인기글 (초기 트래픽 고려)

function timeAgo(at: number, t: (k: string, v?: Record<string, string | number>) => string): string {
  const m = Math.floor((Date.now() - at) / 60000)
  if (m < 1) return t('community.now')
  if (m < 60) return t('community.minAgo', { n: m })
  const h = Math.floor(m / 60)
  if (h < 24) return t('community.hourAgo', { n: h })
  return t('community.dayAgo', { n: Math.floor(h / 24) })
}

export default function Community() {
  const t = useT()
  const localPosts = useStore((s) => s.posts)
  const results = useStore((s) => s.results)
  const nickname = useStore((s) => s.nickname)
  const avatar = useStore((s) => s.avatar)
  const deviceId = useStore((s) => s.deviceId)
  const addPost = useStore((s) => s.addPost)
  const likePost = useStore((s) => s.likePost)
  const deletePost = useStore((s) => s.deletePost)

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [attach, setAttach] = useState(true)
  const [sort, setSort] = useState<'new' | 'hot'>('new')
  const [filter, setFilter] = useState<TestId | 'all'>('all')
  const [copied, setCopied] = useState(false)

  const [server, setServer] = useState<boolean | null>(null)
  const [serverPosts, setServerPosts] = useState<CommunityPost[]>([])

  const reload = async () => {
    try {
      setServerPosts(await fetchPosts(deviceId))
      setServer(true)
    } catch {
      setServer(false)
    }
  }
  useEffect(() => {
    if (supabaseReady()) reload()
    else setServer(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const myAnimal = results[0] ? PERSONAS[results[0].persona]?.emoji : undefined
  const raw = server ? serverPosts : localPosts

  /** 주제 필터 + 정렬 */
  const posts = useMemo(() => {
    let list = raw
    if (filter !== 'all') list = list.filter((p) => p.badge && EMOJI_TEST[p.badge] === filter)
    return [...list].sort((a, b) => (sort === 'hot' ? b.likes - a.likes || b.at - a.at : b.at - a.at))
  }, [raw, filter, sort])

  const submit = async () => {
    if (!text.trim()) return
    const badge = attach ? myAnimal : undefined
    if (server) {
      try {
        await createPost(deviceId, { nick: nickname, avatar, badge, text })
        await reload()
      } catch {
        addPost(text, badge)
      }
    } else {
      addPost(text, badge)
    }
    setText('')
    burst()
    sfx.coin()
    setOpen(false)
  }

  const onLike = async (p: CommunityPost) => {
    if (!p.liked) sfx.tap()
    if (server) {
      setServerPosts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x)),
      )
      try {
        await toggleLike(p.id)
      } catch {
        reload()
      }
    } else {
      likePost(p.id)
    }
  }

  const onDelete = async (p: CommunityPost) => {
    if (server) {
      setServerPosts((prev) => prev.filter((x) => x.id !== p.id))
      try {
        await removePost(p.id, deviceId)
      } catch {
        reload()
      }
    } else {
      deletePost(p.id)
    }
  }

  const onShare = async (p: CommunityPost) => {
    const txt = `[${t('app.name')}] ${p.nick}${p.badge ? ' ' + p.badge : ''}: ${p.text}`
    try {
      if (navigator.share) await navigator.share({ text: txt, url: window.location.origin })
      else {
        await navigator.clipboard.writeText(`${txt} ${window.location.origin}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      /* 취소 */
    }
  }

  const topics: (TestId | 'all')[] = ['all', ...TESTS.map((tm) => tm.id)]

  return (
    <div className="min-h-dvh pb-36">
      <TopBar title={t('nav.community')} />

      <main className="mx-auto max-w-md px-5">
        {/* 상태 표시 */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[13.5px] font-medium leading-relaxed text-[#6B756E]">{t('community.sub')}</p>
          {server !== null && (
            <span className="shrink-0 text-[11.5px] font-extrabold text-ink-faint">
              {server ? t('community.shared') : t('community.local')}
            </span>
          )}
        </div>

        {/* 작성 유도 컴포저 바 */}
        <button
          onClick={() => setOpen(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-full bg-white px-3 py-2.5 shadow-card"
        >
          <Avatar avatar={avatar} size={34} emojiScale={0.52} />
          <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium text-ink-faint">{t('community.composer')}</span>
          <span className="shrink-0 rounded-full bg-mind-500 px-3.5 py-1.5 text-[13px] font-extrabold text-white">
            ✏️ {t('community.write')}
          </span>
        </button>

        {/* 주제 필터 칩 (가로 스크롤) */}
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {topics.map((tp) => {
            const active = filter === tp
            const tm = tp === 'all' ? null : TESTS.find((x) => x.id === tp)!
            return (
              <button
                key={tp}
                onClick={() => setFilter(tp)}
                className="shrink-0 whitespace-nowrap rounded-full border-2 px-3.5 py-1.5 text-[13px] font-extrabold transition-colors"
                style={{
                  borderColor: active ? '#4FA882' : '#E3EAE5',
                  background: active ? '#4FA882' : '#fff',
                  color: active ? '#fff' : '#6B756E',
                }}
              >
                {tm ? `${tm.emoji} ${t(`test.${tm.id}.short`)}` : t('community.all')}
              </button>
            )
          })}
        </div>

        {/* 정렬 세그먼트 */}
        <div className="mt-3 flex gap-1 rounded-2xl bg-[#EFF3F0] p-1">
          {(['new', 'hot'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`flex-1 rounded-xl py-2 text-[13.5px] font-extrabold transition-colors ${
                sort === s ? 'bg-white text-mind-700 shadow-card' : 'text-ink-faint'
              }`}
            >
              {t(s === 'new' ? 'community.sortNew' : 'community.sortHot')}
            </button>
          ))}
        </div>

        {copied && (
          <p className="mt-2 rounded-xl bg-mind-100 py-2 text-center text-[13px] font-extrabold text-mind-700">
            {t('common.copied')}
          </p>
        )}

        {/* 피드 */}
        <div className="mt-3.5 space-y-2.5">
          {server === null ? (
            <p className="py-10 text-center text-3xl">🧠</p>
          ) : posts.length === 0 ? (
            <Card className="py-10 text-center">
              <div className="text-5xl">🌱</div>
              <p className="mt-3 whitespace-pre-line text-[14.5px] font-bold leading-relaxed text-ink-faint">
                {filter === 'all' ? t('community.empty') : t('community.emptyFilter')}
              </p>
              <div className="mx-auto mt-4 max-w-[200px]">
                <Button color="mind" size="sm" onClick={() => setOpen(true)}>
                  ✏️ {t('community.write')}
                </Button>
              </div>
            </Card>
          ) : (
            posts.map((p, i) => {
              const hot = p.likes >= HOT
              return (
                <div key={p.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.25), type: 'spring', stiffness: 260, damping: 26 }}
                  >
                    <Card className="!p-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar avatar={p.avatar} size={36} emojiScale={0.52} />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate text-[13.5px] font-extrabold">
                            <span className="truncate">{p.nick}</span>
                            {p.badge && (
                              <span className="shrink-0 rounded-full bg-mind-50 px-1.5 py-0.5 text-[12px]">
                                {p.badge}
                              </span>
                            )}
                            {hot && (
                              <span className="shrink-0 rounded-full bg-ego-light px-1.5 py-0.5 text-[10px] font-extrabold text-ego-deep">
                                🔥 {t('community.hot')}
                              </span>
                            )}
                          </p>
                          <p className="text-[11.5px] font-bold text-ink-faint">{timeAgo(p.at, t)}</p>
                        </div>
                        {p.mine && (
                          <button onClick={() => onDelete(p)} className="shrink-0 text-[12px] font-bold text-ink-faint">
                            {t('common.delete')}
                          </button>
                        )}
                      </div>

                      <p className="mt-2 whitespace-pre-line break-keep text-[14.5px] font-medium leading-[1.65] text-ink">
                        {p.text}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onLike(p)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-extrabold transition-colors ${
                            p.liked ? 'bg-red-50 text-red-500' : 'bg-[#F2F5F3] text-ink-sub'
                          }`}
                        >
                          <motion.span animate={p.liked ? { scale: [1, 1.4, 1] } : {}}>
                            {p.liked ? '❤️' : '🤍'}
                          </motion.span>
                          {p.likes}
                        </motion.button>
                        <button
                          onClick={() => onShare(p)}
                          className="flex items-center gap-1.5 rounded-full bg-[#F2F5F3] px-3 py-1.5 text-[12.5px] font-extrabold text-ink-sub"
                        >
                          📤 {t('community.share')}
                        </button>
                      </div>
                    </Card>
                  </motion.div>

                  {i % 4 === 3 && (
                    <div className="mt-2.5">
                      <AdSlot variant="banner" />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 플로팅 작성 버튼 */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="safe-bottom fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-[24px] text-white shadow-pop"
        style={{ background: 'linear-gradient(135deg, #4FA882, #6E9FDC)' }}
        aria-label="write"
      >
        ✏️
      </motion.button>

      {/* 글쓰기 모달 */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center gap-2.5">
          <Avatar avatar={avatar} size={38} />
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold">{nickname}</p>
            <p className="text-[12px] font-bold text-ink-faint">{server ? t('community.shared') : t('community.local')}</p>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('community.ph')}
          rows={4}
          maxLength={280}
          autoFocus
          className="mt-3 w-full rounded-2xl border-2 border-[#E3EAE5] bg-white px-4 py-3 text-[15px] font-medium leading-relaxed outline-none focus:border-mind-400"
        />
        <div className="mt-1.5 flex items-center justify-between">
          {myAnimal ? (
            <button onClick={() => setAttach((v) => !v)} className="flex items-center gap-2 text-[13px] font-bold">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md border-2"
                style={{ borderColor: attach ? '#4FA882' : '#C9D4CC', background: attach ? '#4FA882' : '#fff' }}
              >
                {attach && <span className="text-[11px] text-white">✓</span>}
              </span>
              {t('community.attach', { e: myAnimal })}
            </button>
          ) : (
            <span />
          )}
          <span className="text-[12px] font-bold text-ink-faint">{text.length}/280</span>
        </div>
        <div className="mt-3.5">
          <Button color="mind" disabled={!text.trim()} onClick={submit}>
            {t('community.post')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
