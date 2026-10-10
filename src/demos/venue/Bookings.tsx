import { Link } from 'react-router-dom'
import { CalendarDays, Plus, Users } from 'lucide-react'
import { fmtDate, fmtDay, relative } from '../../lib/format'
import { StatusBadge } from '../../ui'
import { nextStep, spaceById, steps } from './data'
import { useVenue } from './store'

export function Bookings() {
  const { bookings } = useVenue()
  const sorted = [...bookings].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">Your events</h1>
          <p className="mt-1 text-stone-500">Track each booking and see what’s needed next.</p>
        </div>
        <Link
          to="/venue-hire/enquire"
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-stone-50 hover:bg-stone-700"
        >
          <Plus size={16} /> Plan a new event
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {sorted.map((b) => {
          const space = spaceById(b.spaceId)
          const next = nextStep(b)
          const done = b.completed >= steps.length
          return (
            <Link
              key={b.id}
              to={`/venue-hire/bookings/${b.id}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md sm:flex-row"
            >
              <div className={`h-3 bg-gradient-to-r sm:h-auto sm:w-3 sm:bg-gradient-to-b ${space.art}`} />
              <div className="flex flex-1 flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="text-xs text-stone-500">{b.ref}</div>
                  <h2 className="font-display text-2xl font-semibold">
                    {b.eventType} · {space.name}
                  </h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={15} /> {fmtDay(b.date)} ({relative(b.date)})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={15} /> {b.guests} guests
                    </span>
                  </div>
                </div>
                <div className="md:w-72">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>
                      Step {Math.min(b.completed + 1, steps.length)} of {steps.length}
                    </span>
                    {done ? <StatusBadge tone="green">Confirmed</StatusBadge> : next.due && <span>Due {fmtDate(next.due)}</span>}
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-stone-100">
                    <div className="h-1.5 rounded-full bg-stone-800" style={{ width: `${(b.completed / steps.length) * 100}%` }} />
                  </div>
                  <div className="mt-2 text-sm font-medium">{next.title}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
