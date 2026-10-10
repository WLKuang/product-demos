// Date, money and seeded-random helpers shared by every demo.

const DAY = 86_400_000

export function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// Local-time YYYY-MM-DD (toISOString would shift to UTC and lose a day during BST).
export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parse = (date: string) => new Date(date + 'T00:00:00')
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY)
export const addYears = (d: Date, n: number) => {
  const r = new Date(d)
  r.setFullYear(r.getFullYear() + n)
  return r
}
export const daysUntil = (date: string) => Math.round((parse(date).getTime() - today().getTime()) / DAY)

export const fmtDate = (date: string) => parse(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtDay = (date: string) =>
  parse(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

export const fmtMoney = (n: number) => '£' + Math.round(n).toLocaleString('en-GB')

export function relative(date: string) {
  const d = daysUntil(date)
  if (d === 0) return 'today'
  if (d === 1) return 'tomorrow'
  if (d === -1) return 'yesterday'
  return d > 0 ? `in ${d} days` : `${-d} days ago`
}

// Small deterministic PRNG (mulberry32) so generated demo data is identical on every visit.
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
