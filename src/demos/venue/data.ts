// Spaces, pricing rules and seed bookings for the Ashcombe Museum private-hire portal (all fictional).
import { addDays, daysUntil, iso, parse, rng, today } from '../../lib/format'

export type SpaceId = 'great-hall' | 'sculpture-court' | 'library' | 'terrace'

export type Space = {
  id: SpaceId
  name: string
  blurb: string
  seated: number
  standing: number
  weekday: number
  weekend: number
  // Open months, 0-based and inclusive. Undefined = all year.
  season?: [number, number]
  features: string[]
  art: string
}

export const spaces: Space[] = [
  {
    id: 'great-hall',
    name: 'The Great Hall',
    blurb: 'Double-height Victorian hall beneath the museum’s whale skeleton. Our grandest space.',
    seated: 250,
    standing: 400,
    weekday: 4500,
    weekend: 6500,
    features: ['Stage and dance floor', 'Step-free access', 'Private entrance'],
    art: 'from-stone-800 via-stone-700 to-amber-900',
  },
  {
    id: 'sculpture-court',
    name: 'The Sculpture Court',
    blurb: 'Glass-roofed court surrounded by marble sculpture, full of daylight until sunset.',
    seated: 120,
    standing: 200,
    weekday: 2800,
    weekend: 3800,
    features: ['Natural daylight', 'Gallery views', 'Built-in lighting'],
    art: 'from-slate-300 via-stone-200 to-amber-100',
  },
  {
    id: 'library',
    name: 'The Library Room',
    blurb: 'Oak-panelled reading room for intimate dinners, board meetings and talks.',
    seated: 40,
    standing: 60,
    weekday: 950,
    weekend: 1400,
    features: ['Fireplace', 'Screen and microphone', 'Quiet wing'],
    art: 'from-emerald-950 via-emerald-900 to-stone-800',
  },
  {
    id: 'terrace',
    name: 'The Garden Terrace',
    blurb: 'Lawned terrace overlooking the sculpture garden. Open April to September.',
    seated: 80,
    standing: 150,
    weekday: 1900,
    weekend: 2600,
    season: [3, 8],
    features: ['Outdoor space', 'Marquee option', 'Seasonal: Apr–Sep'],
    art: 'from-lime-800 via-emerald-700 to-sky-800',
  },
]

export type CateringId = 'canapes' | 'dinner' | 'feast' | 'refreshments'
export type Catering = { id: CateringId; name: string; perHead: number; seated: boolean; detail: string }

export const caterings: Catering[] = [
  { id: 'canapes', name: 'Drinks & canapés', perHead: 38, seated: false, detail: 'Standing reception, two drinks and eight canapés per guest' },
  { id: 'dinner', name: 'Three-course dinner', perHead: 85, seated: true, detail: 'Plated seated dinner with half a bottle of wine per guest' },
  { id: 'feast', name: 'Sharing feast', perHead: 72, seated: true, detail: 'Long tables, sharing platters and wine' },
  { id: 'refreshments', name: 'Tea, coffee & pastries', perHead: 14, seated: true, detail: 'For daytime meetings and talks' },
]

export type ExtraId = 'av' | 'flowers' | 'late' | 'private-view' | 'cloakroom'
export const extras: { id: ExtraId; name: string; price: number; detail: string }[] = [
  { id: 'private-view', name: 'After-hours gallery private view', price: 1200, detail: 'Guests explore the main galleries with a curator' },
  { id: 'av', name: 'AV & staging', price: 650, detail: 'PA system, lectern, projector and technician' },
  { id: 'flowers', name: 'Floral styling', price: 900, detail: 'Table centres and entrance arrangement' },
  { id: 'late', name: 'Late licence', price: 750, detail: 'Extend your event until 1am' },
  { id: 'cloakroom', name: 'Staffed cloakroom', price: 250, detail: 'Recommended for 80+ guests in winter' },
]

export const eventTypes = ['Wedding', 'Corporate dinner', 'Product launch', 'Private party', 'Conference'] as const
export type EventType = (typeof eventTypes)[number]

export type Enquiry = {
  spaceId: SpaceId
  date: string
  eventType: EventType
  guests: number
  cateringId: CateringId
  extras: ExtraId[]
  name: string
  email: string
  company: string
  phone: string
  notes: string
}

export const MIN_NOTICE_DAYS = 14
export const DEPOSIT_RATE = 0.25
export const VAT_RATE = 0.2

export const spaceById = (id: SpaceId) => spaces.find((s) => s.id === id)!
export const cateringById = (id: CateringId) => caterings.find((c) => c.id === id)!

// Friday and Saturday are peak nights.
export const isPeak = (date: string) => [5, 6].includes(parse(date).getDay())

export const capacity = (spaceId: SpaceId, cateringId: CateringId) => {
  const s = spaceById(spaceId)
  return cateringById(cateringId).seated ? s.seated : s.standing
}

export type Quote = { lines: { label: string; amount: number }[]; subtotal: number; vat: number; total: number; deposit: number }

export function quote(e: Pick<Enquiry, 'spaceId' | 'date' | 'guests' | 'cateringId' | 'extras'>): Quote {
  const space = spaceById(e.spaceId)
  const cat = cateringById(e.cateringId)
  const peak = e.date ? isPeak(e.date) : false
  const lines = [
    { label: `${space.name} hire (${peak ? 'Fri/Sat' : 'Sun–Thu'} rate)`, amount: peak ? space.weekend : space.weekday },
    { label: `${cat.name} × ${e.guests} guests`, amount: cat.perHead * e.guests },
    ...e.extras.map((id) => {
      const x = extras.find((x) => x.id === id)!
      return { label: x.name, amount: x.price }
    }),
  ]
  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  const vat = Math.round(subtotal * VAT_RATE)
  const total = subtotal + vat
  return { lines, subtotal, vat, total, deposit: Math.round(total * DEPOSIT_RATE) }
}

// --- availability ---

// Pre-booked dates per space for the next year: busier on Fri/Sat, as real venues are.
const booked: Record<SpaceId, Set<string>> = (() => {
  const r = rng(77)
  const start = today()
  const out = {} as Record<SpaceId, Set<string>>
  for (const s of spaces) {
    out[s.id] = new Set()
    for (let i = 0; i < 400; i++) {
      const d = addDays(start, i)
      const chance = [5, 6].includes(d.getDay()) ? 0.45 : 0.1
      if (r() < chance) out[s.id].add(iso(d))
    }
  }
  return out
})()

export type Availability = 'available' | 'booked' | 'out-of-season' | 'too-soon'

export function availability(spaceId: SpaceId, date: string, ignoreBookingDates: string[] = []): Availability {
  if (daysUntil(date) < MIN_NOTICE_DAYS) return 'too-soon'
  const season = spaceById(spaceId).season
  const month = parse(date).getMonth()
  if (season && (month < season[0] || month > season[1])) return 'out-of-season'
  if (booked[spaceId].has(date) || ignoreBookingDates.includes(date)) return 'booked'
  return 'available'
}

export function nextAvailable(spaceId: SpaceId, from: string, taken: string[] = []): string | null {
  let d = parse(from)
  if (daysUntil(from) < MIN_NOTICE_DAYS) d = addDays(today(), MIN_NOTICE_DAYS)
  for (let i = 0; i < 366; i++) {
    const candidate = iso(addDays(d, i))
    if (availability(spaceId, candidate, taken) === 'available') return candidate
  }
  return null
}

// --- bookings ---

export const steps = ['Enquiry sent', 'Deposit paid', 'Contract signed', 'Final numbers confirmed', 'Balance paid'] as const

export type Message = { from: 'client' | 'venue'; text: string; at: string }

export type Booking = Enquiry & {
  id: string
  ref: string
  createdAt: string
  completed: number // how many of `steps` are done
  depositAmount?: number // fixed once paid, even if guest numbers change later
  signedName?: string
  dietary?: string
  messages: Message[]
}

export const holdUntil = (b: Booking) => iso(addDays(parse(b.createdAt), 7))
export const finalNumbersDue = (b: Booking) => iso(addDays(parse(b.date), -21))
export const balanceDue = (b: Booking) => iso(addDays(parse(b.date), -14))

// What the client needs to do next, and by when.
export function nextStep(b: Booking): { title: string; due?: string } {
  switch (b.completed) {
    case 1:
      return { title: 'Accept the quote and pay your deposit', due: holdUntil(b) }
    case 2:
      return { title: 'Sign your contract' }
    case 3:
      return { title: 'Confirm final numbers', due: finalNumbersDue(b) }
    case 4:
      return { title: 'Pay the balance', due: balanceDue(b) }
    default:
      return { title: 'All set for the day' }
  }
}

export const coordinator = { name: 'Jamie Okoro', role: 'Events Manager' }
export const client = { name: 'Hannah Ellis', email: 'hannah@northwindstudio.co.uk', company: 'Northwind Studio', phone: '07700 900418' }

// Pick a seed date that is actually free so the demo never contradicts itself.
const freeDate = (spaceId: SpaceId, offset: number) => nextAvailable(spaceId, iso(addDays(today(), offset)))!

export function seedBookings(): Booking[] {
  const dinnerDate = freeDate('sculpture-court', 45)
  const launchDate = freeDate('great-hall', 120)
  return [
    {
      id: 'b1',
      ref: 'ASH-E2041',
      createdAt: iso(addDays(today(), -40)),
      completed: 3,
      depositAmount: quote({ spaceId: 'sculpture-court', date: dinnerDate, guests: 90, cateringId: 'dinner', extras: ['av', 'flowers'] }).deposit,
      spaceId: 'sculpture-court',
      date: dinnerDate,
      eventType: 'Corporate dinner',
      guests: 90,
      cateringId: 'dinner',
      extras: ['av', 'flowers'],
      ...client,
      notes: 'Annual client dinner. Short speech before dessert.',
      signedName: client.name,
      messages: [
        { from: 'client', text: 'Could we have a microphone for a short speech before dessert?', at: iso(addDays(today(), -30)) },
        { from: 'venue', text: 'Of course. I’ve added AV & staging, so a technician will be on hand. Menu tastings can be booked any weekday afternoon.', at: iso(addDays(today(), -29)) },
        { from: 'venue', text: 'Thanks for signing the contract. Final numbers and dietary requirements are due three weeks before the event.', at: iso(addDays(today(), -12)) },
      ],
    },
    {
      id: 'b2',
      ref: 'ASH-E2087',
      createdAt: iso(addDays(today(), -2)),
      completed: 1,
      spaceId: 'great-hall',
      date: launchDate,
      eventType: 'Product launch',
      guests: 220,
      cateringId: 'canapes',
      extras: ['av', 'late', 'private-view'],
      ...client,
      notes: 'Launch of our spring collection. Would love the whale lit in brand colours.',
      messages: [{ from: 'venue', text: 'Thanks for your enquiry, Hannah. We’re holding the date for you for 7 days while you review the quote.', at: iso(addDays(today(), -2)) }],
    },
  ]
}
