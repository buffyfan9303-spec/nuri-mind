import { AnimatePresence, motion } from 'framer-motion'
import { SPRING } from '../lib/motion'
import { useToastStore } from '../lib/toast'

const GLYPH = { ok: '✅', err: '⚠️', info: 'ℹ️' } as const

/**
 * 토스트 표시층 — App에 하나만 마운트된다.
 *
 * 위치: 하단 내비 바로 위. 내비가 스크롤로 숨어도 토스트는 그 자리에 남는다 —
 * 알림이 내비를 따라 사라지면 방금 한 행동의 결과를 놓친다.
 *
 * 접근성: 컨테이너가 aria-live="polite"라 스크린리더가 읽던 문장을 끊지 않고 이어서 알린다.
 * 되돌리기 버튼은 실제 <button>이라 키보드로도 닿는다(토스트가 사라지기 전까지).
 *
 * 폭: max-w-[340px]에 가운데 정렬. 화면 폭을 꽉 채우면 한 줄짜리 문구가 좌우로 흩어져 읽기 어렵고,
 * 너무 좁으면 한국어가 세로로 꺾인다(홀덤이 실제로 겪은 문제).
 */
export default function Toast() {
  const items = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-5"
    >
      <AnimatePresence initial={false}>
        {items.map((it) => (
          <motion.div
            key={it.id}
            layout
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.16 } }}
            transition={SPRING.snap}
            /* 되돌리기가 달린 토스트는 본문 탭으로 닫지 않는다 — 알림을 치우려다 유일한 되돌리기 수단을 버리게 된다 */
            onClick={it.action ? undefined : () => dismiss(it.id)}
            className={`pointer-events-auto flex w-full max-w-[340px] items-center gap-2.5 rounded-2xl px-4 py-3 shadow-pop backdrop-blur-md ${
              it.variant === 'err' ? 'bg-[#3B2326]/95 text-[#FFE2E2]' : 'bg-[#22322B]/95 text-[#E7F3EC]'
            }`}
          >
            <span className="shrink-0 text-[14px]" aria-hidden="true">
              {GLYPH[it.variant]}
            </span>
            <span className="min-w-0 flex-1 break-keep text-[13px] font-semibold leading-snug">{it.text}</span>
            {it.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  it.action?.run()
                  dismiss(it.id)
                }}
                className="-mr-1 shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold"
              >
                {it.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
