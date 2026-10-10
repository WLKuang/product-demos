import { useEffect, useRef, useState } from 'react'

// Lightweight SVG charts shared by the demos. No chart library: each chart measures its container
// and draws at real pixel size so text never stretches. The SVG is absolutely positioned so it never
// holds its container open when the screen shrinks.

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

// Round an axis maximum up to a readable number (e.g. 3,712 -> 4,000).
const niceMax = (v: number) => {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  return ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * p >= v) ?? 10) * p
}

export function Sparkline({ values, color, height = 32 }: { values: number[]; color: string; height?: number }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const max = Math.max(...values)
  const min = Math.min(...values)
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, height - 2 - ((v - min) / (max - min || 1)) * (height - 4)])
  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} aria-hidden className="absolute inset-0">
          <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={pts[pts.length - 1][0] - 2} cy={pts[pts.length - 1][1]} r={3} fill={color} />
        </svg>
      )}
    </div>
  )
}

export type Series = { name: string; color: string; values: number[] }

export function LineChart({ series, labels, height = 240, format = String }: { series: Series[]; labels: string[]; height?: number; format?: (n: number) => string }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const pad = { l: 52, r: 12, t: 12, b: 26 }
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)))
  const n = labels.length
  const x = (i: number) => pad.l + (i / Math.max(1, n - 1)) * (w - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - v / max) * (height - pad.t - pad.b)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max)
  const every = Math.ceil(n / Math.max(2, Math.floor(w / 70)))

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {w > 0 && (
        <svg
          width={w}
          height={height}
          className="absolute inset-0"
          onMouseMove={(e) => {
            const px = e.clientX - e.currentTarget.getBoundingClientRect().left
            setHover(Math.max(0, Math.min(n - 1, Math.round(((px - pad.l) / (w - pad.l - pad.r)) * (n - 1)))))
          }}
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#64748b">
                {format(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % every === 0 || i === n - 1 ? (
              <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={11} fill="#64748b">
                {l}
              </text>
            ) : null,
          )}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={height - pad.b} stroke="#94a3b8" strokeDasharray="3 3" />}
          {series.map((s) => (
            <g key={s.name}>
              <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={2.25} strokeLinejoin="round" />
              {hover !== null && <circle cx={x(hover)} cy={y(s.values[hover])} r={4} fill="white" stroke={s.color} strokeWidth={2} />}
            </g>
          ))}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
          style={x(hover) > w / 2 ? { right: w - x(hover) + 12 } : { left: x(hover) + 12 }}
        >
          <div className="mb-1 font-medium">{labels[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              {s.name}
              <span className="ml-auto pl-3 tabular-nums">{format(s.values[hover])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function BarChart({ values, labels, color, height = 180, format = String }: { values: number[]; labels: string[]; color: string; height?: number; format?: (n: number) => string }) {
  const max = Math.max(1, ...values)
  const peak = values.indexOf(Math.max(...values))
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1">
          <span className={`text-[10px] tabular-nums ${i === peak ? 'font-semibold text-slate-700' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>{format(v)}</span>
          <div className="w-full rounded-t-md transition" style={{ height: `${(v / max) * (height - 36)}px`, background: color, opacity: i === peak ? 1 : 0.55 }} />
          <span className="text-[10px] text-slate-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export function BarList({ items, color }: { items: { label: string; value: number; display?: string }[]; color: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate">{it.label}</span>
            <span className="shrink-0 tabular-nums text-slate-500">{it.display ?? it.value}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
