import { useEffect, useRef, useState } from 'react'
import { SPRING } from '../lib/motion'
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { useT } from '../i18n/useT'
import { lockScroll, unlockScroll } from '../lib/scrollLock'
import { useBackClose } from '../lib/backstack'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { useSkeletonGate } from '../hooks/useSkeletonGate'
import { haptic } from '../lib/haptic'
import { LEGAL_EFFECTIVE } from '../data/legal'

/**
 * 약관·개인정보 본문 시트 — 온보딩에서 라우트 이동 대신 이걸 띄운다.
 *
 * 왜 시트인가: /legal/* 는 공개 라우트라 App의 온보딩 분기가 다른 트리로 교체되면서
 * Onboarding이 통째로 언마운트된다. 초안(sessionStorage)으로 증상은 막았지만,
 * "필수 동의 약관을 읽으러 갔다가 폼이 리셋되는" 구조 자체를 없애는 게 근본 해결이다.
 *
 * 본문(50KB대)은 열 때 동적 import — 첫 화면 번들에 얹지 않는다.
 * 헤더를 잡고 끌어내리면 닫힌다(본문은 스크롤 영역이라 드래그 시작점에서 제외) — Modal과 같은 운동량 판정.
 */
export default function LegalSheet({ doc, onClose }: { doc: 'terms' | 'privacy' | null; onClose: () => void }) {
  const t = useT()
  const [body, setBody] = useState<string | null>(null)
  const controls = useDragControls()
  const panelRef = useRef<HTMLDivElement>(null)
  // 캐시된 청크는 수십 ms에 오므로 스켈레톤이 '번쩍'하지 않게 200ms 게이트
  const showSkeleton = useSkeletonGate(body === null)

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

  // 뒤로가기로 시트만 닫힌다 — 약관을 읽다 뒤로가기를 누르면 온보딩이 사라지는 게 아니라 시트가 닫혀야 한다
  useBackClose(doc !== null, onClose)
  useDialogFocus(doc !== null, panelRef)

  // 열려 있는 동안 배경 스크롤 잠금 + ESC로 닫기
  useEffect(() => {
    if (!doc) return
    lockScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      unlockScroll()
      window.removeEventListener('keydown', onKey)
    }
  }, [doc, onClose])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) {
      haptic(6)
      onClose()
    }
  }

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
            ref={panelRef}
            role="dialog"
            data-scroll-lock
            aria-modal="true"
            aria-label={t(doc === 'terms' ? 'legal.terms' : 'legal.privacy')}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRING.sheet}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface"
          >
            <div
              onPointerDown={(e) => controls.start(e)}
              className="flex shrink-0 cursor-grab touch-none items-center justify-between border-b border-line px-5 pb-4 pt-2 active:cursor-grabbing"
            >
              <div className="min-w-0">
                <span className="mx-auto mb-2 block h-1 w-9 rounded-full bg-line" aria-hidden="true" />
                <h2 className="truncate text-[16px] font-semibold">
                  {t(doc === 'terms' ? 'legal.terms' : 'legal.privacy')}
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-ink-faint">{LEGAL_EFFECTIVE} 시행 · 엔에이치홀딩스</p>
              </div>
              <button
                onClick={onClose}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={t('common.close')}
                className="-mr-2 inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-ink-faint"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {body === null ? (
                showSkeleton && (
                  <div className="space-y-2.5 pt-2">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="h-3.5 animate-pulse rounded-full bg-surface2" style={{ width: `${95 - i * 6}%` }} />
                    ))}
                  </div>
                )
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
