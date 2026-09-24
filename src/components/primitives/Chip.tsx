import type { ReactNode } from 'react'

export function Chip({ children, tone = 'mind' }: { children: ReactNode; tone?: 'mind' | 'amber' | 'red' | 'gray' | 'blue' }) {
  const map = {
    mind: 'bg-mind-100 text-mind-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-500',
    blue: 'bg-sky2-100 text-sky2-600',
  }
  return <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-bold leading-none ${map[tone]}`}>{children}</span>
}
