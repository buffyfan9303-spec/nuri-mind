import { useEffect, useMemo, useState, useRef } from 'react'
import { useSkeletonGate } from '../hooks/useSkeletonGate'
import LoadErrorCard from '../components/surfaces/LoadErrorCard'
import { toast, UNDO_WINDOW_MS } from '../lib/toast'
import { humanizeError } from '../lib/dbError'
import { SPRING } from '../lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { Card, Modal, TopBar } from '../components/ui'
import { PERSONAS, EMOJI_TEST } from '../i18n/animalTranslations'
import { TESTS } from '../data/tests'
import type { CommunityComment, CommunityPost, TestId } from '../data/types'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { todayTheme } from '../data/themes'
import Ticker from '../components/Ticker'
import { sfx } from '../lib/sound'
import { burst } from '../lib/confetti'
import { supabaseReady } from '../lib/supabase'
import { checkRate, moderateText, recordAction } from '../lib/moderation'
import {
  createComment,
  createPost,
  fetchComments,
  fetchPosts,
  removePost,
  reportPostServer,
  toggleLike,
} from '../lib/community'

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
  const l = useL()
  const localPosts = useStore((s) => s.posts)
  const results = useStore((s) => s.results)
  const nickname = useStore((s) => s.nickname)
  const avatar = useStore((s) => s.avatar)
  const deviceId = useStore((s) => s.deviceId)
  const addPost = useStore((s) => s.addPost)
  const likePost = useStore((s) => s.likePost)
  const deletePost = useStore((s) => s.deletePost)
  const commentsMap = useStore((s) => s.comments)
  const hiddenPosts = useStore((s) => s.hiddenPosts)
  const lang = useStore((s) => s.lang)
  const addComment = useStore((s) => s.addComment)
  const reportPost = useStore((s) => s.reportPost)
  const blockUser = useStore((s) => s.blockUser)
  const blockedNicks = useStore((s) => s.blockedNicks)
  const claimFirstPost = useStore((s) => s.claimFirstPost)
  const claimFirstComment = useStore((s) => s.claimFirstComment)

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [attach, setAttach] = useState(true)
  const [sort, setSort] = useState<'new' | 'hot'>('new')
  const [filter, setFilter] = useState<TestId | 'all'>('all')
  const [copied, setCopied] = useState(false)
  const [reward, setReward] = useState('')
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [serverComments, setServerComments] = useState<Record<string, CommunityComment[]>>({})

  /** 상단 리워드 배너 + 전역 토스트를 함께 — 호출부(수십 곳)는 그대로 flash()를 쓴다 */
  const flash = (msg: string) => {
    setReward(msg)
    setTimeout(() => setReward(''), 2400)
    toast.ok(msg)
  }

  const [server, setServer] = useState<boolean | null>(null)
  /**
   * server=false 하나로는 '서버를 안 쓰는 모드'와 '요청이 실패한 것'을 구분할 수 없었다.
   * 실패를 빈 목록으로 보여주면 사용자는 글이 없는 줄 알거나 자기 글이 사라졌다고 믿는다.
   */
  const [loadErr, setLoadErr] = useState<string | null>(null)
  /** 삭제 유예 중인 글 — 화면에서만 빠져 있고 아직 지우지 않았다(되돌리기 창) */
  const [pendingDelete, setPendingDelete] = useState<string[]>([])
  const showLoading = useSkeletonGate(server === null)
  const [serverPosts, setServerPosts] = useState<CommunityPost[]>([])
  const [newCount, setNewCount] = useState(0)
  const [pulling, setPulling] = useState(0)
  const pullRef = useRef(0)
  const likeBusyRef = useRef<Set<string>>(new Set()) // 당겨서 새로고침 거리(px)
  const [refreshing, setRefreshing] = useState(false)

  const reload = async () => {
    // 서버를 안 쓰는 모드(설정 없음)에서는 실패가 아니다 — 당겨서 새로고침이 가짜 경고를 띄우면 안 된다
    if (!supabaseReady()) {
      setServer(false)
      setLoadErr(null)
      return
    }
    try {
      setServerPosts(await fetchPosts(deviceId))
      setServer(true)
      setLoadErr(null)
      setNewCount(0)
    } catch (e) {
      setServer(false)
      setLoadErr(humanizeError(e, lang))
    }
  }

  /** 새 글 감지 폴링 (서버 모드) — 화면은 그대로 두고 pill만 표시 */
  const poll = async () => {
    try {
      const fresh = await fetchPosts(deviceId)
      setServerPosts((cur) => {
        const known = new Set(cur.map((p) => p.id))
        const n = fresh.filter((p) => !known.has(p.id) && !p.mine).length
        setNewCount(n)
        return cur
      })
    } catch {
      /* 무시 */
    }
  }

  const applyNew = async () => {
    setRefreshing(true)
    await reload()
    setRefreshing(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    sfx.tap()
  }

  useEffect(() => {
    if (supabaseReady()) reload()
    else setServer(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (server !== true) return
    const id = setInterval(poll, 20000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server])

  /** 당겨서 새로고침 — 스크롤 최상단에서 아래로 당길 때만.
   *  ⚠️ deps에 pulling을 두면 onMove의 setPulling이 이펙트를 재실행시켜 리스너가 재등록되고
   *     제스처 로컬 상태(startY/active)가 초기화된다 → onEnd가 영원히 안 걸려 인디케이터 고착.
   *     당김 값은 ref로 들고, 리스너는 마운트당 1회만 등록한다. */
  useEffect(() => {
    let startY = 0
    let active = false
    const onStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) {
        startY = e.touches[0].clientY
        active = true
      }
    }
    const onMove = (e: TouchEvent) => {
      if (!active) return
      const d = e.touches[0].clientY - startY
      if (d > 0) {
        const v = Math.min(d * 0.5, 80)
        pullRef.current = v
        setPulling(v)
      }
    }
    const onEnd = async () => {
      if (!active) return
      active = false
      const pulled = pullRef.current
      pullRef.current = 0
      setPulling(0)
      if (pulled > 50) {
        setRefreshing(true)
        try {
          await reload()
        } finally {
          setRefreshing(false)
        }
        sfx.tap()
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const myAnimal = results[0] ? PERSONAS[results[0].persona]?.emoji : undefined
  const raw = server ? serverPosts : localPosts

  /** 숨김 제외 + 주제 필터 + 정렬 */
  const posts = useMemo(() => {
    let list = raw.filter(
      (p) => !hiddenPosts.includes(p.id) && !blockedNicks.includes(p.nick) && !pendingDelete.includes(p.id),
    )
    if (filter !== 'all') list = list.filter((p) => p.badge && EMOJI_TEST[p.badge] === filter)
    return [...list].sort((a, b) => (sort === 'hot' ? b.likes - a.likes || b.at - a.at : b.at - a.at))
  }, [raw, filter, sort, hiddenPosts, blockedNicks, pendingDelete])

  const submit = async () => {
    if (!text.trim()) return
    if (!moderateText(text).ok) return flash(t('community.badword'))
    const rl = checkRate('post')
    if (!rl.ok) return flash(t('community.tooFast', { n: rl.waitSec }))
    recordAction('post')
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
    const r = claimFirstPost()
    if (r > 0) flash(t('community.firstReward', { p: r }))
  }

  /** 댓글 패널 토글 — 서버 모드면 펼칠 때 댓글 로드 */
  const loadComments = async (postId: string) => {
    try {
      const list = await fetchComments(postId, deviceId)
      setServerComments((prev) => ({ ...prev, [postId]: list }))
    } catch {
      /* 무시 — 펼침 상태 유지 */
    }
  }
  const toggleComments = (postId: string) => {
    setOpenComments((v) => {
      const next = v === postId ? null : postId
      if (next && server) loadComments(postId)
      return next
    })
  }

  const submitComment = async (postId: string) => {
    const body = commentText.trim()
    if (!body) return
    if (!moderateText(body).ok) return flash(t('community.badword'))
    const rl = checkRate('comment')
    if (!rl.ok) return flash(t('community.tooFast', { n: rl.waitSec }))
    recordAction('comment')
    const badge = attach ? myAnimal : undefined
    if (server) {
      try {
        await createComment(deviceId, postId, { nick: nickname, avatar, badge, text: body })
        await loadComments(postId)
      } catch {
        addComment(postId, body, badge) // 폴백: 로컬
      }
    } else {
      addComment(postId, body, badge)
    }
    setCommentText('')
    sfx.tap()
    const r = claimFirstComment()
    if (r > 0) flash(t('community.firstCommentReward', { p: r }))
  }

  const onReport = (p: CommunityPost) => {
    if (server) {
      reportPostServer(deviceId, p.id, { nick: p.nick, excerpt: p.text, reason: 'user-report' }).catch(() => {})
    }
    reportPost(p.id, p.nick, p.text, 'user-report') // 로컬 기록(신고자 콘솔 확인용)
    flash(t('community.reportDone'))
    sfx.tap()
  }

  const onBlock = (p: CommunityPost) => {
    blockUser(p.nick)
    flash(t('community.blockDone'))
    sfx.tap()
  }

  const onLike = async (p: CommunityPost) => {
    // 연속 탭 방지 — 같은 글의 요청이 비행 중이면 무시(서버 카운트 이중 증가·상태 불일치 차단)
    if (likeBusyRef.current.has(p.id)) return
    likeBusyRef.current.add(p.id)
    setTimeout(() => likeBusyRef.current.delete(p.id), 600)
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

  /**
   * 삭제 되돌리기 — 화면에서는 즉시 사라지되 **실제 삭제는 되돌리기 창(UNDO_WINDOW_MS)만큼 미룬다**.
   * 서버 글은 지우고 나면 되살릴 수 없다(본문·좋아요·댓글이 함께 사라진다).
   * 되돌리기를 만드는 유일한 방법은 '아직 지우지 않는 것'이다.
   * 화면을 떠나면 유예분을 즉시 확정한다 — 지웠다고 본 글이 살아 돌아오면 안 된다.
   */
  const undoTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const commitRef = useRef<Map<string, () => void>>(new Map())
  useEffect(() => {
    const timers = undoTimers.current
    const commits = commitRef.current
    return () => {
      for (const [id, timer] of timers) {
        clearTimeout(timer)
        commits.get(id)?.()
      }
      timers.clear()
      commits.clear()
    }
  }, [])

  const onDelete = (p: CommunityPost) => {
    const onServer = server === true
    setPendingDelete((cur) => [...cur, p.id])

    // 토스트 id를 확정 시점에 내리기 위해 담아 둔다(아래 commit에서 채운다)
    let toastId = 0
    const commit = () => {
      undoTimers.current.delete(p.id)
      commitRef.current.delete(p.id)
      // 되돌리기가 무효가 되는 순간 그 버튼을 화면에서 없앤다.
      // 화면을 떠나면(라우트 이동) 이 confirm이 즉시 돌지만 토스트는 라우터 밖이라 살아남는다 —
      // 그때 '되돌리기'가 남아 있으면 눌러도 아무 일이 없는 거짓 버튼이 된다.
      toast.close(toastId)
      if (onServer) {
        setServerPosts((prev) => prev.filter((x) => x.id !== p.id))
        removePost(p.id, deviceId)
          // 서버가 확인해 준 뒤에야 마스킹을 푼다 — 먼저 풀면 그 사이 도착한 새로고침이 지운 글을 되살린다
          .then(() => setPendingDelete((cur) => cur.filter((id) => id !== p.id)))
          .catch((e) => {
            toast.err(humanizeError(e, lang))
            setPendingDelete((cur) => cur.filter((id) => id !== p.id))
            reload()
          })
      } else {
        deletePost(p.id)
        setPendingDelete((cur) => cur.filter((id) => id !== p.id))
      }
    }
    commitRef.current.set(p.id, commit)
    // 토스트가 떠 있는 동안은 반드시 되돌릴 수 있어야 한다 — 같은 상수를 쓴다
    undoTimers.current.set(p.id, setTimeout(commit, UNDO_WINDOW_MS))

    toastId = toast.info(l({ ko: '글을 삭제했어요', en: 'Post deleted', ja: '投稿を削除しました' }), {
      label: l({ ko: '되돌리기', en: 'Undo', ja: '元に戻す' }),
      run: () => {
        const timer = undoTimers.current.get(p.id)
        if (timer) clearTimeout(timer)
        undoTimers.current.delete(p.id)
        commitRef.current.delete(p.id)
        setPendingDelete((cur) => cur.filter((id) => id !== p.id))
      },
    })
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

      {/* 당겨서 새로고침 인디케이터 */}
      <AnimatePresence>
        {(pulling > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-14 z-30 flex justify-center"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: pulling * 4 }}
              transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-[20px] shadow-pop"
              style={{ transform: `translateY(${refreshing ? 8 : pulling - 12}px)` }}
            >
              {refreshing ? '🐢' : pulling > 50 ? '🐰' : '🐢'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-md px-5">
        {/* 📣 전광판 (확성기) */}
        <Ticker />

        {/* 작성 유도 컴포저 바 */}
        <button
          onClick={() => setOpen(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-full bg-surface px-3 py-2.5 shadow-card"
        >
          <Avatar avatar={avatar} size={34} emojiScale={0.52} />
          <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium text-ink-faint">{t('community.composer')}</span>
          <span className="shrink-0 rounded-full bg-mind-500 px-3.5 py-1.5 text-[13px] font-semibold text-white">
            ✏️ {t('community.write')}
          </span>
        </button>

        {/* 이번 주 주제 */}
        <button
          onClick={() => setOpen(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-mind-50 to-amber-50 dark:from-surface2 dark:to-surface2 px-4 py-3 text-left"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', repeatDelay: 2 }}
            className="text-[20px]"
          >
            🗓️
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wide text-mind-600">{t('community.themeLabel')}</p>
            <p className="mt-0.5 break-keep text-[14px] font-semibold leading-snug">{l(todayTheme())}</p>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-mind-500 px-3 py-1.5 text-[12px] font-semibold text-white">
            ✍️ {t('community.themeWrite')}
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
                className="shrink-0 whitespace-nowrap rounded-full border-2 px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
                style={{
                  borderColor: active ? '#4FA882' : '#E3EAE5',
                  background: active ? '#4FA882' : 'rgb(var(--surface))',
                  color: active ? '#fff' : 'rgb(var(--text-sub))',
                }}
              >
                {tm ? `${tm.emoji} ${t(`test.${tm.id}.short`)}` : t('community.all')}
              </button>
            )
          })}
        </div>

        {/* 정렬 세그먼트 */}
        <div className="mt-3 flex gap-1 rounded-2xl bg-surface2 p-1">
          {(['new', 'hot'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`flex-1 rounded-xl py-2 text-[13px] font-semibold transition-colors ${
                sort === s ? 'bg-surface text-mind-700 shadow-card' : 'text-ink-faint'
              }`}
            >
              {t(s === 'new' ? 'community.sortNew' : 'community.sortHot')}
            </button>
          ))}
        </div>

        {copied && (
          <p className="mt-2 rounded-xl bg-mind-100 py-2 text-center text-[13px] font-semibold text-mind-700">
            {t('common.copied')}
          </p>
        )}

        {/* 피드 */}
        <div className="mt-3.5 space-y-2.5">
          {/* 실패는 목록을 '대체'하지 않는다 — 이 기기에 남은 글이 커뮤니티 전체로 보이는 게 진짜 문제였다 */}
          {loadErr && (
            <LoadErrorCard
              compact
              what={l({ ko: '커뮤니티 글', en: 'community posts', ja: 'コミュニティの投稿' })}
              hint={l({
                ko: '지금 보이는 건 이 기기에 저장된 글이에요. 다른 사람 글은 아직 못 받았어요.',
                en: 'You are seeing posts saved on this device. Others have not loaded yet.',
                ja: '表示中はこの端末に保存された投稿です。他の人の投稿はまだ取得できていません。',
              })}
              reason={loadErr}
              onRetry={reload}
            />
          )}
          {server === null ? (
            showLoading && <p className="py-10 text-center text-3xl">🧠</p>
          ) : posts.length === 0 ? (
            <Card className="py-10 text-center">
              <div className="text-5xl">🌱</div>
              <p className="mt-3 whitespace-pre-line text-[14px] font-bold leading-relaxed text-ink-faint">
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
              const comments = server ? serverComments[p.id] || [] : commentsMap[p.id] || []
              return (
                <div key={p.id} className="[content-visibility:auto] [contain-intrinsic-size:auto_180px]">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING.ui, delay: Math.min(i * 0.03, 0.25) }}
                  >
                    <Card className="!p-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar avatar={p.avatar} size={36} emojiScale={0.52} />
                        <div className="min-w-0 flex-1">
                          <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold">
                            <span className="min-w-0 truncate">{p.nick}</span>
                            {p.badge && (
                              <span className="shrink-0 rounded-full bg-mind-50 px-1.5 py-0.5 text-[12px]">
                                {p.badge}
                              </span>
                            )}
                            {hot && (
                              <span className="shrink-0 rounded-full bg-ego-light px-1.5 py-0.5 text-[11px] font-semibold text-ego-deep">
                                🔥 {t('community.hot')}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] font-medium text-ink-faint">{timeAgo(p.at, t)}</p>
                        </div>
                        {p.mine && (
                          <button onClick={() => onDelete(p)} className="shrink-0 text-[12px] font-medium text-ink-faint">
                            {t('common.delete')}
                          </button>
                        )}
                      </div>

                      <p className="mt-2 whitespace-pre-line break-keep text-[14px] font-medium leading-[1.65] text-ink">
                        {p.text}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onLike(p)}
                          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                            p.liked ? 'bg-red-50 text-red-500' : 'bg-surface2 text-ink-sub'
                          }`}
                        >
                          <motion.span animate={p.liked ? { scale: [1, 1.4, 1] } : {}}>
                            {p.liked ? '❤️' : '🤍'}
                          </motion.span>
                          {p.likes}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleComments(p.id)}
                          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                            openComments === p.id ? 'bg-mind-100 text-mind-700' : 'bg-surface2 text-ink-sub'
                          }`}
                        >
                          💬 {comments.length || ''}
                        </motion.button>
                        <button
                          onClick={() => onShare(p)}
                          className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface2 px-3 py-1.5 text-[12px] font-semibold text-ink-sub"
                        >
                          📤
                        </button>
                        {!p.mine && (
                          <div className="ml-auto flex shrink-0 items-center gap-1">
                            <button onClick={() => onBlock(p)} className="rounded-full px-2.5 py-1.5 text-[11px] font-medium text-ink-faint">
                              🚫 {t('community.block')}
                            </button>
                            <button onClick={() => onReport(p)} className="rounded-full px-2.5 py-1.5 text-[11px] font-medium text-ink-faint">
                              🚩 {t('community.report')}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 댓글 패널 */}
                      <AnimatePresence initial={false}>
                        {openComments === p.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={SPRING.ui}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2 border-t-2 border-line pt-3">
                              {comments.length === 0 ? (
                                <p className="py-1 text-center text-[12px] font-medium text-ink-faint">
                                  {t('community.commentEmpty')}
                                </p>
                              ) : (
                                comments.map((c) => (
                                  <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-2"
                                  >
                                    <Avatar avatar={c.avatar} size={26} emojiScale={0.5} />
                                    <div className="min-w-0 flex-1 rounded-2xl bg-surface2 px-3 py-2">
                                      <p className="flex items-center gap-1 text-[12px] font-semibold">
                                        <span className="truncate">{c.nick}</span>
                                        {c.badge && <span className="shrink-0">{c.badge}</span>}
                                        <span className="ml-auto shrink-0 text-[11px] font-medium text-ink-faint">
                                          {timeAgo(c.at, t)}
                                        </span>
                                      </p>
                                      <p className="mt-0.5 whitespace-pre-line break-keep text-[13px] font-medium leading-relaxed text-ink">
                                        {c.text}
                                      </p>
                                    </div>
                                  </motion.div>
                                ))
                              )}

                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  value={openComments === p.id ? commentText : ''}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submitComment(p.id)}
                                  placeholder={t('community.commentPh')}
                                  maxLength={200}
                                  className="min-w-0 flex-1 rounded-full border-2 border-line bg-surface px-3.5 py-2 text-[13px] font-medium outline-none focus:border-mind-400"
                                />
                                <motion.button
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => submitComment(p.id)}
                                  disabled={!commentText.trim()}
                                  className="shrink-0 rounded-full bg-mind-500 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
                                >
                                  {t('community.send')}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>

                </div>
              )
            })
          )}
        </div>

      </main>

      {/* 새 글 N개 pill */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={SPRING.flick}
            whileTap={{ scale: 0.97 }}
            onClick={applyNew}
            className="fixed inset-x-0 top-16 z-40 mx-auto flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shadow-pop"
            style={{ background: 'linear-gradient(135deg, #4FA882, #6E9FDC)' }}
          >
            <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              🐤
            </motion.span>
            <span className="whitespace-nowrap">{t('community.newPosts', { n: newCount })}</span>
            <span aria-hidden>↑</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 리워드 토스트 */}
      <AnimatePresence>
        {reward && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={SPRING.ui}
            className="safe-bottom fixed inset-x-0 bottom-28 z-40 mx-auto flex w-fit max-w-[90%] items-center gap-2 rounded-full bg-mind-600 px-5 py-3 text-[14px] font-semibold text-white shadow-pop"
          >
            <motion.span animate={{ rotate: [0, -12, 12, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              🎉
            </motion.span>
            <span className="whitespace-nowrap">{reward}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 플로팅 작성 버튼 */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="safe-bottom fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-[24px] text-white shadow-pop"
        style={{ background: 'linear-gradient(135deg, #4FA882, #6E9FDC)' }}
        aria-label="write"
      >
        <motion.span
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', repeatDelay: 1.8 }}
        >
          ✏️
        </motion.span>
      </motion.button>

      {/* 글쓰기 모달 */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center gap-2.5">
          <Avatar avatar={avatar} size={38} />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">{nickname}</p>
            <p className="text-[12px] font-medium text-ink-faint">{server ? t('community.shared') : t('community.local')}</p>
          </div>
        </div>
        {/* 이번 주 주제 힌트 */}
        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-mind-50 px-3 py-2">
          <span className="shrink-0 text-[14px]">🗓️</span>
          <p className="break-keep text-[12px] font-medium leading-snug text-mind-700">
            {t('community.themeLabel')} · {l(todayTheme())}
          </p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('community.ph')}
          rows={4}
          maxLength={280}
          autoFocus
          className="mt-3 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[15px] font-medium leading-relaxed outline-none focus:border-mind-400"
        />
        <div className="mt-1.5 flex items-center justify-between">
          {myAnimal ? (
            <button onClick={() => setAttach((v) => !v)} className="flex items-center gap-2 text-[13px] font-medium">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md border-2"
                style={{ borderColor: attach ? '#4FA882' : 'rgb(var(--line))', background: attach ? '#4FA882' : 'rgb(var(--surface))' }}
              >
                {attach && <span className="text-[11px] text-white">✓</span>}
              </span>
              {t('community.attach', { e: myAnimal })}
            </button>
          ) : (
            <span />
          )}
          <span className="text-[12px] font-medium text-ink-faint">{text.length}/280</span>
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
