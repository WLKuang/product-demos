import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { NavItem } from './AppShell'

type Props = {
  brand: ReactNode
  nav: NavItem[]
  user?: { name: string; detail?: string }
  children: ReactNode
  footer?: ReactNode
}

// Header-navigation frame for customer-facing portals (AppShell's sidebar suits staff tools).
// On small screens the links drop into an evenly spaced row under the brand.
export function TopNavShell({ brand, nav, user, children, footer }: Props) {
  const links = nav.map(({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  ))

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 md:px-6">
          {brand}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">{links}</nav>
          {user && (
            <div className="ml-auto flex items-center gap-3 md:ml-0">
              <div className="hidden text-right text-sm leading-tight sm:block">
                <div className="font-medium">{user.name}</div>
                {user.detail && <div className="text-xs text-stone-500">{user.detail}</div>}
              </div>
              <span className="flex size-9 items-center justify-center rounded-full bg-stone-800 text-sm font-medium text-stone-50">
                {user.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </span>
            </div>
          )}
        </div>
        <nav className="flex gap-1 px-4 pb-3 md:hidden [&>a]:flex-1 [&>a]:justify-center [&>a]:px-2 [&_svg]:hidden">{links}</nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        {footer}
        <Link to="/" className="ml-2 underline-offset-2 hover:underline">
          Back to portfolio
        </Link>
      </footer>
    </div>
  )
}
