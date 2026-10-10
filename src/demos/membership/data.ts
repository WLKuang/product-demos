// Fictional member data for The Ashcombe Museum. Generated from a fixed seed so every visit looks the same,
// with dates relative to today so the demo never looks stale.

export type Tier = 'Individual' | 'Joint' | 'Family' | 'Patron'
export const tiers: Tier[] = ['Individual', 'Joint', 'Family', 'Patron']
export const tierPrice: Record<Tier, number> = { Individual: 75, Joint: 120, Family: 140, Patron: 1200 }

export type Status = 'Active' | 'Due' | 'Reminded' | 'Lapsed'
export type HistoryItem = { date: string; text: string }

export type Member = {
  id: string
  memberNo: string
  name: string
  email: string
  phone: string
  tier: Tier
  joined: string
  renewalDate: string
  renewedAt?: string
  reminderSentAt?: string
  directDebit: boolean
  visitsThisYear: number
  notes: HistoryItem[]
  history: HistoryItem[]
}

import { addDays, addYears, daysUntil, iso, rng, today } from '../../lib/format'

// Re-exported so the membership screens keep importing everything from './data'.
export { addDays, addYears, daysUntil, fmtDate, fmtMoney, iso, relative, today } from '../../lib/format'

export function status(m: Member): Status {
  const d = daysUntil(m.renewalDate)
  if (d < 0) return 'Lapsed'
  if (d <= 30) return m.reminderSentAt ? 'Reminded' : 'Due'
  return 'Active'
}

export const statusTone = { Active: 'green', Due: 'amber', Reminded: 'blue', Lapsed: 'red' } as const

// --- generator ---

const first = ['Eleanor', 'James', 'Priya', 'Thomas', 'Aisha', 'Oliver', 'Grace', 'Daniel', 'Mei', 'Henry', 'Sofia', 'Samuel', 'Hannah', 'Arjun', 'Isla', 'George', 'Fatima', 'William', 'Chloe', 'Kwame', 'Lucy', 'Edward', 'Yuki', 'Rosa', 'Felix', 'Imogen', 'Omar', 'Harriet', 'Leo', 'Nadia']
const last = ['Whitfield', 'Okafor', 'Patel', 'Hargreaves', 'Chen', 'Morrison', 'Ellis', 'Novak', 'Bennett', 'Ahmed', 'Fletcher', 'Lindqvist', 'Russo', 'Campbell', 'Osei', 'Thornton', 'Kaur', 'Ashworth', 'Delgado', 'Reid', 'Nakamura', 'Holloway', 'Byrne', 'Quinn']

function pick<T>(r: () => number, xs: T[]) {
  return xs[Math.floor(r() * xs.length)]
}

function pickTier(r: () => number): Tier {
  const x = r()
  return x < 0.45 ? 'Individual' : x < 0.7 ? 'Joint' : x < 0.92 ? 'Family' : 'Patron'
}

export function generateMembers(count = 240): Member[] {
  const r = rng(2026)
  const now = today()
  const used = new Set<string>()
  const members: Member[] = []

  for (let i = 0; i < count; i++) {
    let name = ''
    do name = `${pick(r, first)} ${pick(r, last)}`
    while (used.has(name))
    used.add(name)

    const tier = pickTier(r)
    const bucket = r()
    // ~8% lapsed in the last four months, ~11% due within 30 days, the rest renew later in the year
    const offset = bucket < 0.08 ? -Math.ceil(r() * 120) : bucket < 0.19 ? Math.floor(r() * 31) : 31 + Math.floor(r() * 330)
    const renewal = addDays(now, offset)
    const years = 1 + Math.floor(r() * 7)
    const joined = addYears(renewal, -years)
    const renewedAt = years > 1 ? iso(addYears(renewal, -1)) : undefined
    const directDebit = tier !== 'Patron' && r() < 0.35

    let reminderSentAt: string | undefined
    if (offset >= 0 && offset <= 30 && !directDebit && r() < 0.35) reminderSentAt = iso(addDays(now, -Math.ceil(r() * 6)))
    if (offset < 0 && r() < 0.3) reminderSentAt = iso(addDays(renewal, Math.ceil(r() * Math.min(10, -offset))))

    const [fn, ln] = name.toLowerCase().split(' ')
    const history: HistoryItem[] = [{ date: iso(joined), text: `Joined as ${tier} member` }]
    for (let y = 1; y < years; y++) history.push({ date: iso(addYears(joined, y)), text: `Renewed ${tier} membership` })
    if (reminderSentAt) history.push({ date: reminderSentAt, text: offset < 0 ? 'Win-back email sent' : 'Renewal reminder sent' })

    members.push({
      id: `m${i}`,
      memberNo: `ASH-${String(10234 + i * 13).padStart(6, '0')}`,
      name,
      email: `${fn}.${ln}@${pick(r, ['gmail.com', 'outlook.com', 'icloud.com', 'btinternet.com'])}`,
      phone: `07${Math.floor(100 + r() * 899)} ${Math.floor(100000 + r() * 899999)}`,
      tier,
      joined: iso(joined),
      renewalDate: iso(renewal),
      renewedAt,
      reminderSentAt,
      directDebit,
      visitsThisYear: Math.floor(r() * (tier === 'Family' ? 14 : 9)),
      notes: tier === 'Patron' && r() < 0.6 ? [{ date: iso(addDays(now, -20)), text: 'Interested in the spring exhibition private view.' }] : [],
      history: history.reverse(),
    })
  }
  return members
}
