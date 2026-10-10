import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Check, type LucideIcon } from 'lucide-react'
import { InfoTip } from './InfoTip'

// Small building blocks shared across demos so every demo looks consistent.

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }[variant]
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
}

type StatCardProps = {
  label: string
  value: string
  delta?: string
  // For figures where a fall is good news (lapses, complaints), so a negative delta shows green.
  goodWhenDown?: boolean
  icon?: LucideIcon
  info?: string
}

export function StatCard({ label, value, delta, goodWhenDown, icon: Icon, info }: StatCardProps) {
  const good = delta?.startsWith('-') === !!goodWhenDown
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-sm text-slate-500">
        {info ? <InfoTip label={label} text={info}>{label}</InfoTip> : label}
        {Icon && <Icon size={18} className="text-slate-400" />}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {delta && <div className={`mt-1 text-xs font-medium ${good ? 'text-emerald-600' : 'text-rose-600'}`}>{delta}</div>}
    </Card>
  )
}

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'grey' | 'purple'

export function StatusBadge({ tone = 'grey', children }: { tone?: Tone; children: ReactNode }) {
  const styles: Record<Tone, string> = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    grey: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[tone]}`}>{children}</span>
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <Icon size={32} className="text-slate-400" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200'

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input className={inputClass} {...props} />
export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select className={inputClass} {...props} />

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done ? 'bg-slate-900 text-white' : active ? 'border-2 border-slate-900 text-slate-900' : 'border border-slate-300 text-slate-400'
              }`}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className={`hidden text-sm sm:inline ${active ? 'font-medium' : 'text-slate-500'}`}>{step}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        )
      })}
    </ol>
  )
}
