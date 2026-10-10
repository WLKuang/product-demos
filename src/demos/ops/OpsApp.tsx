import { Route, Routes, useLocation } from 'react-router-dom'
import { CalendarDays, LineChart, Package, Sun } from 'lucide-react'
import { AppShell, type NavItem } from '../../ui'
import { owner } from './data'
import { Rota } from './Rota'
import { Sales } from './Sales'
import { Stock } from './Stock'
import { OpsStore } from './store'
import { Today } from './Today'

const nav: NavItem[] = [
  { to: '/ops', label: 'Today', icon: Sun, end: true },
  { to: '/ops/sales', label: 'Sales', icon: LineChart },
  { to: '/ops/stock', label: 'Stock', icon: Package },
  { to: '/ops/rota', label: 'Rota', icon: CalendarDays },
]

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const titles: Record<string, [string, string]> = {
  '/ops/sales': ['Sales', 'How each shop and drink is doing'],
  '/ops/stock': ['Stock', 'What’s running low, and deliveries in'],
  '/ops/rota': ['Rota', 'Who’s working this week. Tap Swap to change a shift'],
}

const brandMark = (
  <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-amber-300 text-base font-bold text-white shadow-sm">S</span>
)

export function OpsApp() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/$/, '')
  const [title, subtitle] = titles[path] ?? [
    `${greeting()}, ${owner.name.split(' ')[0]}`,
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · here’s yesterday across all three shops',
  ]

  return (
    <OpsStore>
      <AppShell brand="Sip & Sora" brandMark={brandMark} nav={nav} title={title} subtitle={subtitle} activeClass="bg-pink-500 text-white shadow-sm">
        <Routes>
          <Route index element={<Today />} />
          <Route path="sales" element={<Sales />} />
          <Route path="stock" element={<Stock />} />
          <Route path="rota" element={<Rota />} />
        </Routes>
      </AppShell>
    </OpsStore>
  )
}
