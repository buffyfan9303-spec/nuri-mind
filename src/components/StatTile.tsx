import { motion } from 'framer-motion'
import { SPRING } from '../lib/motion'
import { darken } from '../lib/color'
import Emoji from './Emoji'

/**
 * 완료 스탯 타일 — 듀오링고 '레슨 완료' 화면 패턴.
 * 색 테두리 상자 + 위쪽 색 띠(흰 라벨) + 안쪽 흰 칸(아이콘 + 색 숫자).
 * 줄지어 나올 때 index로 순서대로 '톡' 튀어나온다(보상 획득 순간이라 pop 탄성이 뜻에 맞다).
 */
export function StatTile({
  label,
  value,
  icon,
  color,
  index = 0,
}: {
  label: string
  value: string
  icon: string
  color: string
  index?: number
}) {
  const deep = darken(color, 0.28)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING.pop, delay: 0.55 + index * 0.12 }}
      className="min-w-0 flex-1 overflow-hidden rounded-2xl border-2"
      style={{ borderColor: color, background: color }}
    >
      <p className="truncate px-1.5 pb-1 pt-1.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-white">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1.5 rounded-[14px] bg-surface px-1.5 py-3">
        <Emoji e={icon} size={20} />
        <span className="truncate text-[17px] font-extrabold dark:!text-ink" style={{ color: deep }}>
          {value}
        </span>
      </div>
    </motion.div>
  )
}
