import { Route, Routes, useLocation } from 'react-router-dom'
import { LayoutDashboard, RefreshCw, Users } from 'lucide-react'
import { AppShell, type NavItem } from '../../ui'
import { MemberDrawer } from './MemberDrawer'
import { Members } from './Members'
import { Overview } from './Overview'
import { Renewals } from './Renewals'
import { MembershipStore } from './store'

const nav: NavItem[] = [
  { to: '/membership', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/membership/members', label: 'Members', icon: Users },
  { to: '/membership/renewals', label: 'Renewals', icon: RefreshCw },
]

const titles: Record<string, [string, string]> = {
  '/membership': ['Overview', 'How membership is looking today'],
  '/membership/members': ['Members', 'Find and manage any member'],
  '/membership/renewals': ['Renewals', 'Contact members before they lapse'],
}

const brandMark = (
  <span className="flex size-8 items-center justify-center rounded-md bg-emerald-900 font-serif text-lg text-amber-50">A</span>
)

export function MembershipApp() {
  const { pathname } = useLocation()
  const [title, subtitle] = titles[pathname.replace(/\/$/, '')] ?? titles['/membership']

  return (
    <MembershipStore>
      <AppShell brand="Ashcombe Museum" brandMark={brandMark} nav={nav} title={title} subtitle={subtitle}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="members" element={<Members />} />
          <Route path="renewals" element={<Renewals />} />
        </Routes>
      </AppShell>
      <MemberDrawer />
    </MembershipStore>
  )
}
