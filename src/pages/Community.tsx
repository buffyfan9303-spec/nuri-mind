import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import AdSlot from '../components/AdSlot'
import { Card, Modal, TopBar } from '../components/ui'
import { PERSONAS } from '../i18n/animalTranslations'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { sfx } from '../lib/sound'
import { burst } from '../lib/confetti'

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
  const posts = useStore((s) => s.posts)
  const results = useStore((s) => s.results)
  const addPost = useStore((s) => s.addPost)
  const likePost = useStore((s) => s.likePost)
  const deletePost = useStore((s) => s.deletePost)

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [attach, setAttach] = useState(true)

  const myAnimal = results[0] ? PERSONAS[results[0].persona]?.emoji : undefined

  const submit = () => {
    if (!text.trim()) return
    addPost(text, attach ? myAnimal : undefined)
    setText('')
    burst()
    sfx.coin()
    setOpen(false)
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar
        title={t('nav.community')}
        right={
          <Button color="mind" size="sm" full={false} onClick={() => setOpen(true)}>
            ✏️ {t('community.write')}
          </Button>
        }
      />
      <main className="mx-auto max-w-md px-5">
        <p className="px-1 text-[14px] font-medium leading-relaxed tracking-wide text-[#6B756E]">
          {t('community.sub')}
        </p>

        <div className="mt-3.5 space-y-2.5">
          {posts.map((p, i) => (
            <div key={p.id}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.25), type: 'spring', stiffness: 260, damping: 26 }}
              >
                <Card className="!p-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar avatar={p.avatar} size={34} emojiScale={0.52} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-[13.5px] font-extrabold">
                        {p.nick}
                        {p.badge && <span>{p.badge}</span>}
                      </p>
                      <p className="text-[11.5px] font-bold text-ink-faint">{timeAgo(p.at, t)}</p>
                    </div>
                    {p.mine && (
                      <button onClick={() => deletePost(p.id)} className="shrink-0 text-[12px] font-bold text-ink-faint">
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[14px] font-medium leading-[1.6] text-ink">{p.text}</p>
                  <div className="mt-2 flex items-center">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => {
                        likePost(p.id)
                        if (!p.liked) sfx.tap()
                      }}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-extrabold transition-colors ${
                        p.liked ? 'bg-red-50 text-red-500' : 'bg-[#F2F5F3] text-ink-sub'
                      }`}
                    >
                      {p.liked ? '❤️' : '🤍'} {p.likes}
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
              {/* 4개마다 애드센스 광고 삽입 */}
              {i % 4 === 3 && (
                <div className="mt-2.5">
                  <AdSlot variant="banner" />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* 글쓰기 모달 */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="text-[18px] font-extrabold tracking-tight">✏️ {t('community.write')}</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('community.ph')}
          rows={4}
          maxLength={280}
          autoFocus
          className="mt-3 w-full rounded-2xl border-2 border-[#E3EAE5] bg-white px-4 py-3 text-[15px] font-medium leading-relaxed outline-none focus:border-mind-400"
        />
        {myAnimal && (
          <button
            onClick={() => setAttach((v) => !v)}
            className="mt-2 flex items-center gap-2 text-[13.5px] font-bold"
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-md border-2"
              style={{ borderColor: attach ? '#4FA882' : '#C9D4CC', background: attach ? '#4FA882' : '#fff' }}
            >
              {attach && <span className="text-[11px] text-white">✓</span>}
            </span>
            {t('community.attach', { e: myAnimal })}
          </button>
        )}
        <div className="mt-4">
          <Button color="mind" disabled={!text.trim()} onClick={submit}>
            {t('community.post')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
