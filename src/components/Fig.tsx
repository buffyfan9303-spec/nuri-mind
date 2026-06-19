import type { Fig, Prim } from '../data/types'

const STROKE = '#33413A'

function renderPrim(p: Prim, i: number) {
  switch (p.k) {
    case 'c':
      return (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.f ? STROKE : 'none'} stroke={STROKE} strokeWidth={3} />
      )
    case 'r': {
      const cx = p.x + p.w / 2
      const cy = p.y + p.h / 2
      return (
        <rect
          key={i}
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          rx={2}
          fill={p.f ? STROKE : 'none'}
          stroke={STROKE}
          strokeWidth={3}
          transform={p.rot ? `rotate(${p.rot} ${cx} ${cy})` : undefined}
        />
      )
    }
    case 't': {
      const s = p.s
      const pts = `${p.x},${p.y - s * 0.62} ${p.x - s / 2},${p.y + s * 0.45} ${p.x + s / 2},${p.y + s * 0.45}`
      return (
        <polygon
          key={i}
          points={pts}
          fill={p.f ? STROKE : 'none'}
          stroke={STROKE}
          strokeWidth={3}
          strokeLinejoin="round"
          transform={p.rot ? `rotate(${p.rot} ${p.x} ${p.y})` : undefined}
        />
      )
    }
    case 'l':
      return (
        <line
          key={i}
          x1={p.x1}
          y1={p.y1}
          x2={p.x2}
          y2={p.y2}
          stroke={STROKE}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={p.dash ? '4 5' : undefined}
        />
      )
    case 'd':
      return <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={STROKE} />
  }
}

export function FigCell({ fig, className = '' }: { fig: Fig; className?: string }) {
  return (
    <svg viewBox="0 0 72 72" className={className}>
      {fig.map(renderPrim)}
    </svg>
  )
}

/** 3×3 행렬 그리드 — 9번째 칸은 ? */
export function MatrixGrid({ cells }: { cells: Fig[] }) {
  return (
    <div className="mx-auto grid w-full max-w-[300px] grid-cols-3 gap-1.5">
      {cells.map((fig, i) => (
        <div key={i} className="aspect-square rounded-xl border-2 border-line bg-surface p-1">
          <FigCell fig={fig} className="h-full w-full" />
        </div>
      ))}
      <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-iq bg-iq-light text-3xl font-extrabold text-iq-deep">
        ?
      </div>
    </div>
  )
}

/** 종이접기 단계 스트립 — 패널 사이 화살표 */
export function FoldStrip({ cells }: { cells: Fig[] }) {
  return (
    <div className="mx-auto flex w-full max-w-[340px] items-center justify-center gap-1.5">
      {cells.map((fig, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-lg font-extrabold text-ink-faint">→</span>}
          <div className="h-24 w-24 rounded-xl border-2 border-line bg-surface p-1">
            <FigCell fig={fig} className="h-full w-full" />
          </div>
        </div>
      ))}
      <span className="text-lg font-extrabold text-ink-faint">→</span>
      <div className="flex h-24 w-16 items-center justify-center rounded-xl border-2 border-dashed border-iq bg-iq-light text-2xl font-extrabold text-iq-deep">
        ?
      </div>
    </div>
  )
}
