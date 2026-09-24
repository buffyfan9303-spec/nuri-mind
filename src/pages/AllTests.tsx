import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { SPRING } from '../lib/motion'
import { TopBar } from '../components/ui'
import { JellyChip } from '../components/ScrollChips'
import Emoji from '../components/Emoji'
import { useL, useT } from '../i18n/useT'
import { TESTS } from '../data/tests'
import { TERMS, TEST_SHORT_KEY } from '../data/terms'
import { DEEP_CATS } from '../data/testGroups'
import type { L } from '../data/types'

/**
 * 전체 검사 — 홈의 모든 묶음 '전체 ›'이 오는 곳. 홈은 가로 한 줄(5칸)만 보여 주고,
 * 여기서는 같은 칩을 5열 격자로 전부 펼친다(홈과 같은 칸 규격이라 좌우 여백이 그대로 맞는다).
 * state.scrollTo('brain' | 'deep')로 들어오면 그 묶음으로 바로 내려간다.
 */
type Chip = { id: string; emoji: string; label: string; color: string; go: string }

export default function AllTests() {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const loc = useLocation()

  const [quick, setQuick] = useState<Chip[]>([])
  useEffect(() => {
    import('../data/quick')
      .then((m) => setQuick(m.QUICK_TESTS.map((q) => ({ id: q.id, emoji: q.emoji, label: l(q.short), color: q.grad[0], go: `/quick/${q.id}` }))))
      .catch(() => setQuick([]))
  }, [l])

  useEffect(() => {
    const to = (loc.state as { scrollTo?: string } | null)?.scrollTo
    if (!to) return
    const id = requestAnimationFrame(() => document.getElementById(`sec-${to}`)?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(id)
  }, [loc.state])

  const deepChip = (id: string): Chip | null => {
    const tm = TESTS.find((x) => x.id === id)
    return tm ? { id: tm.id, emoji: tm.emoji, label: t(TEST_SHORT_KEY(tm.id)), color: tm.gradFrom, go: `/test/${tm.id}` } : null
  }

  const sections: { key: string; emoji: string; title: L | string; chips: Chip[] }[] = [
    {
      key: 'popular',
      emoji: '⭐',
      title: { ko: '즐겨찾는 심리검사', en: 'Popular tests', ja: '人気の心理検査' },
      chips: [
        { id: 'adhd', emoji: '🎯', label: 'ADHD', color: '#FFB020', go: '/test/adhd' },
        { id: 'iq', emoji: '🧩', label: t('test.iq.short'), color: '#6E7BF2', go: '/test/iq' },
        // 아이콘은 홈 즐겨찾기와 같게(🪪 성격 · 🔍 성격 심층 — 이유는 Home.tsx)
        { id: 'mbti', emoji: '🪪', label: l({ ko: '성격', en: 'Persona', ja: '性格' }), color: '#3B9EFF', go: '/mbti/quick' },
        { id: 'mbti-deep', emoji: '🔍', label: l({ ko: '성격 심층', en: 'Persona+', ja: '性格詳細' }), color: '#6E7BF2', go: '/mbti/deep' },
        { id: 'fortune', emoji: '🔮', label: l({ ko: '운세', en: 'Fortune', ja: '運勢' }), color: '#6B4FB8', go: '/fortune' },
      ],
    },
    {
      key: 'brain',
      emoji: '🔬',
      title: TERMS.sectionPrecision,
      chips: TESTS.filter((tm) => tm.precision).map((tm) => deepChip(tm.id)!),
    },
    ...DEEP_CATS.map((c) => ({
      key: c.key === 'relation' ? 'deep' : c.key,
      emoji: c.emoji,
      title: c.label as L,
      chips: c.ids.map(deepChip).filter((x): x is Chip => !!x),
    })),
    { key: 'quick', emoji: '🔥', title: t('quick.banner'), chips: quick },
  ]

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '전체 검사', en: 'All tests', ja: 'すべての検査' })} />
      <main className="mx-auto max-w-md px-5">
        {sections.map((sec, si) => (
          <motion.section
            key={sec.key}
            id={`sec-${sec.key}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.ui, delay: Math.min(0.04 * si, 0.2) }}
            className="scroll-mt-20 pt-4"
          >
            <h2 className="flex items-center gap-2 text-[20px] font-extrabold leading-tight">
              <Emoji e={sec.emoji} size={22} />
              {typeof sec.title === 'string' ? sec.title : l(sec.title)}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2.5 pb-2 pt-1">
              {sec.chips.map((c) => (
                <JellyChip key={c.id} emoji={c.emoji} label={c.label} color={c.color} onClick={() => nav(c.go)} />
              ))}
            </div>
          </motion.section>
        ))}
      </main>
    </div>
  )
}
