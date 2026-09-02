import type { ReactNode } from 'react'

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
