import { useEffect, useState } from 'react'
import { SPRING } from '../lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import { useT } from '../i18n/useT'
import { LEGAL_EFFECTIVE } from '../data/legal'

/**
 * 약관·개인정보 본문 시트 — 온보딩에서 라우트 이동 대신 이걸 띄운다.
 *
 * 왜 시트인가: /legal/* 는 공개 라우트라 App의 온보딩 분기가 다른 트리로 교체되면서
 * Onboarding이 통째로 언마운트된다. 초안(sessionStorage)으로 증상은 막았지만,
 * "필수 동의 약관을 읽으러 갔다가 폼이 리셋되는" 구조 자체를 없애는 게 근본 해결이다.
 *
 * 본문(50KB대)은 열 때 동적 import — 첫 화면 번들에 얹지 않는다.
 */
export default function LegalSheet({ doc, onClose }: { doc: 'terms' | 'privacy' | null; onClose: () => void }) {
  const t = useT()
  const [body, setBody] = useState<string | null>(null)

  useEffect(() => {
    if (!doc) return
    let alive = true
    setBody(null)
    void import('../data/legalDocs').then((m) => {
      if (alive) setBody(doc === 'terms' ? m.TERMS : m.PRIVACY)
    })
    return () => {
      alive = false
    }
  }, [doc])

  // 열려 있는 동안 배경 스크롤 잠금 + ESC로 닫기
  useEffect(() => {
    if (!doc) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [doc, onClose])

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t(doc === 'terms' ? 'legal.terms' : 'legal.privacy')}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRING.ui}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-[16px] font-semibold">
                  {t(doc === 'terms' ? 'legal.terms' : 'legal.privacy')}
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-ink-faint">{LEGAL_EFFECTIVE} 시행 · 엔에이치홀딩스</p>
              </div>
              <button
                onClick={onClose}
                aria-label={t('common.close')}
                className="-mr-1 shrink-0 rounded-full px-3 py-1.5 text-[15px] font-semibold text-ink-faint"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {body === null ? (
                <div className="space-y-2.5 pt-2">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="h-3.5 animate-pulse rounded-full bg-surface2" style={{ width: `${95 - i * 6}%` }} />
                  ))}
                </div>
              ) : (
                <p className="whitespace-pre-line text-[13px] font-medium leading-relaxed text-ink">{body}</p>
              )}
            </div>

            <div className="shrink-0 border-t border-line p-4">
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-mind-500 py-3.5 text-[15px] font-semibold text-white transition-transform active:translate-y-[2px]"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
