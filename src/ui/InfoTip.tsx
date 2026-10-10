import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'

const TIP_W = 256

type Props = { label: string; text: string; children: ReactNode; iconSize?: number }

// Wraps a label with an info icon; hovering or focusing shows an explanation underneath.
// The tooltip is portalled with fixed positioning so scroll containers can neither clip it
// nor grow to make room for it.
export function InfoTip({ label, text, children, iconSize = 12 }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(r.left, window.innerWidth - TIP_W - 8)) })
  }
  const hide = () => setPos(null)

  return (
    <span
      className="inline-flex items-center gap-1"
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={hide}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={hide}
    >
      {children}
      <Info size={iconSize} tabIndex={0} aria-label={`About ${label}`} className="shrink-0 cursor-help text-slate-400 outline-none focus:text-slate-900" />
      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top, left: pos.left, width: TIP_W }}
            className="pointer-events-none fixed z-[70] rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-lg"
          >
            {text}
          </div>,
          document.body,
        )}
    </span>
  )
}
