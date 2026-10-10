import { Link, Route, Routes } from 'react-router-dom'
import { CalendarPlus, Landmark, Ticket } from 'lucide-react'
import { TopNavShell, type NavItem } from '../../ui'
import { BookingDetail } from './BookingDetail'
import { Bookings } from './Bookings'
import { client } from './data'
import { Enquiry } from './Enquiry'
import { Spaces } from './Spaces'
import { VenueStore } from './store'

const nav: NavItem[] = [
  { to: '/venue-hire', label: 'Spaces', icon: Landmark, end: true },
  { to: '/venue-hire/enquire', label: 'Plan an event', icon: CalendarPlus },
  { to: '/venue-hire/bookings', label: 'Your events', icon: Ticket },
]

const brand = (
  <Link to="/venue-hire" className="flex shrink-0 items-center gap-2.5">
    <span className="flex size-9 items-center justify-center rounded-md bg-emerald-900 font-display text-xl font-semibold text-amber-50">A</span>
    <span className="leading-tight">
      <span className="block font-display text-lg font-semibold">Ashcombe Museum</span>
      <span className="block text-[11px] uppercase tracking-[0.18em] text-stone-500">Private hire</span>
    </span>
  </Link>
)

export function VenueApp() {
  return (
    <VenueStore>
      <TopNavShell brand={brand} nav={nav} user={{ name: client.name, detail: client.company }} footer="Demo portal · fictional venue and data.">
        <Routes>
          <Route index element={<Spaces />} />
          <Route path="enquire" element={<Enquiry />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
        </Routes>
      </TopNavShell>
    </VenueStore>
  )
}
