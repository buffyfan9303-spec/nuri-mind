import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, Chip, TopBar } from '../components/ui'
import { JellyChip } from '../components/ScrollChips'
import { ARTICLES } from '../data/magazine'
import { testMeta } from '../data/tests'
import type { L } from '../data/types'
import { useT, useL } from '../i18n/useT'
import { useStore } from '../store/useStore'

export default function Magazine() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const readArticles = useStore((s) => s.readArticles)
  const [tag, setTag] = useState<string | null>(null)

  const FALLBACK = ['#4FA882', '#6E9FDC', '#F25C8E', '#8B7CF6', '#12A5C2', '#FFB020']
  const tags = useMemo(() => {
    const map = new Map<string, { key: string; label: L; emoji: string; color: string }>()
    for (const a of ARTICLES) {
      if (map.has(a.tag.ko)) continue
      const color = (a.test && testMeta(a.test)?.gradFrom) || FALLBACK[map.size % FALLBACK.length]
      map.set(a.tag.ko, { key: a.tag.ko, label: a.tag, emoji: a.emoji, color })
    }
    return [...map.values()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const filtered = tag ? ARTICLES.filter((a) => a.tag.ko === tag) : ARTICLES

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t('mag.title')} />
      <main className="mx-auto max-w-md px-5">
        <p className="px-1 text-[14px] font-medium leading-relaxed text-ink-sub">{t('mag.sub')}</p>

        {/* 태그 필터 (젤리 칩) */}
        <div className="no-scrollbar -mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-3 pt-1 [overscroll-behavior-x:contain]">
          <div className="shrink-0 snap-start">
            <JellyChip emoji="📚" label={l({ ko: '전체', en: 'All', ja: '全て' })} color="#4FA882" selected={tag === null} onClick={() => setTag(null)} />
          </div>
          {tags.map((tg) => (
            <div key={tg.key} className="shrink-0 snap-start">
              <JellyChip emoji={tg.emoji} label={l(tg.label)} color={tg.color} selected={tag === tg.key} onClick={() => setTag(tg.key)} />
            </div>
          ))}
        </div>

        <div className="mt-2 space-y-3">
          {filtered.map((a, i) => {
            const read = readArticles.includes(a.id)
            return (
              <motion.div
                key={a.id}
                className="[content-visibility:auto] [contain-intrinsic-size:auto_150px]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 240, damping: 24 }}
              >
                <Card onClick={() => nav(`/magazine/${a.id}`)} className="flex items-center gap-3.5 !p-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mind-50 text-[28px]">
                    {a.emoji}
                    {read && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mind-600 text-[10px] font-extrabold text-white shadow-card">✓</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Chip tone="mind">{l(a.tag)}</Chip>
                      <span className="text-[11.5px] font-bold text-ink-faint">📖 {t('mag.read', { n: a.readMin })}</span>
                    </div>
                    <h3 className="mt-1.5 break-keep text-[15.5px] font-extrabold leading-snug tracking-tight">{l(a.title)}</h3>
                    <p className="mt-1 line-clamp-2 break-keep text-[12.5px] font-medium leading-relaxed text-ink-faint">{l(a.summary)}</p>
                  </div>
                  <span className="shrink-0 self-center text-lg text-ink-faint">›</span>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <p className="mt-6 px-2 text-center text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('mag.hint')}</p>
      </main>
    </div>
  )
}
