import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowLeft, Menu, X, type LucideIcon } from 'lucide-react'

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

type Props = {
  brand: string
  brandMark?: ReactNode
  nav: NavItem[]
  title: string
  subtitle?: string
  actions?: ReactNode
  // Classes for the active nav item, so each demo can carry its own brand colour.
  activeClass?: string
  children: ReactNode
}

// Sidebar + top bar frame shared by every demo app. The sidebar collapses into a drawer below md.
export function AppShell({ brand, brandMark, nav, title, subtitle, actions, activeClass = 'bg-slate-900 text-white', children }: Props) {
  const [open, setOpen] = useState(false)

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        {brandMark}
        <span className="text-base font-semibold">{brand}</span>
      </div>
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? activeClass : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
      <Link to="/" className="mt-auto flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-600">
        <ArrowLeft size={14} /> Back to portfolio
      </Link>
    </nav>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <button className="rounded-md p-1.5 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
