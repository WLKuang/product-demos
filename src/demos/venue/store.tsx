import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { iso, today } from '../../lib/format'
import { coordinator, seedBookings, type Booking, type Enquiry } from './data'

type Store = {
  bookings: Booking[]
  create: (e: Enquiry) => Booking
  advance: (id: string, patch?: Partial<Booking>) => void
  send: (id: string, text: string) => void
}

const Ctx = createContext<Store | null>(null)

export function VenueStore({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(seedBookings)

  const store = useMemo<Store>(() => {
    const patch = (id: string, fn: (b: Booking) => Booking) => setBookings((bs) => bs.map((b) => (b.id === id ? fn(b) : b)))
    return {
      bookings,
      create: (e) => {
        const n = bookings.length
        const booking: Booking = {
          ...e,
          id: `new${n}`,
          ref: `ASH-E${2100 + n}`,
          createdAt: iso(today()),
          completed: 1,
          messages: [
            {
              from: 'venue',
              text: `Thanks for your enquiry, ${e.name.split(' ')[0]}. We’re holding the date for you for 7 days. I’m ${coordinator.name}, your events manager, and I’ll be your contact from here.`,
              at: iso(today()),
            },
          ],
        }
        setBookings((bs) => [booking, ...bs])
        return booking
      },
      advance: (id, extra) => patch(id, (b) => ({ ...b, ...extra, completed: b.completed + 1 })),
      send: (id, text) => patch(id, (b) => ({ ...b, messages: [...b.messages, { from: 'client', text, at: iso(today()) }] })),
    }
  }, [bookings])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useVenue() {
  const store = useContext(Ctx)
  if (!store) throw new Error('useVenue must be used inside VenueStore')
  return store
}
