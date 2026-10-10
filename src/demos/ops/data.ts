// Fictional sales, stock and rota data for Sip & Sora, a three-shop bubble-tea chain in London.
// Seeded so every visit looks the same; dates are relative to today.
import { addDays, iso, rng, today } from '../../lib/format'

export type ShopId = 'soho' | 'camden' | 'stratford'
export const shops: { id: ShopId; name: string; color: string; weight: number }[] = [
  { id: 'soho', name: 'Soho', color: '#ec4899', weight: 1.3 },
  { id: 'camden', name: 'Camden', color: '#14b8a6', weight: 1 },
  { id: 'stratford', name: 'Stratford', color: '#f59e0b', weight: 0.8 },
]
export const shopById = (id: ShopId) => shops.find((s) => s.id === id)!

export const drinks = [
  { id: 'brown-sugar', name: 'Brown Sugar Milk Tea', price: 5.2, weight: 18 },
  { id: 'taro', name: 'Taro Milk Tea', price: 5.4, weight: 12 },
  { id: 'mango', name: 'Mango Passion Fruit Tea', price: 4.9, weight: 11 },
  { id: 'matcha', name: 'Matcha Latte', price: 5.6, weight: 10 },
  { id: 'jasmine', name: 'Jasmine Green Milk Tea', price: 4.8, weight: 9 },
  { id: 'strawberry', name: 'Strawberry Yakult', price: 5.0, weight: 8 },
  { id: 'hokkaido', name: 'Hokkaido Milk Tea', price: 5.3, weight: 8 },
  { id: 'lychee', name: 'Lychee Oolong', price: 4.7, weight: 7 },
  { id: 'thai', name: 'Thai Milk Tea', price: 5.1, weight: 6 },
  { id: 'peach', name: 'Peach Oolong Fruit Tea', price: 4.8, weight: 5 },
]

// Opening hours 10:00–22:00, so 12 hourly buckets.
export const hours = Array.from({ length: 12 }, (_, i) => 10 + i)
const hourShape = [0.4, 0.7, 1.3, 1.5, 1.0, 1.1, 1.5, 1.7, 1.4, 1.0, 0.7, 0.4]
const dayShape = [1.15, 0.8, 0.85, 0.9, 1.0, 1.2, 1.4] // Sun..Sat

export type DaySales = { date: string; shopId: ShopId; cups: number; revenue: number; byDrink: Record<string, number>; byHour: number[] }

export const HISTORY_DAYS = 35

// One row per shop per day, ending yesterday.
export const sales: DaySales[] = (() => {
  const r = rng(314)
  const out: DaySales[] = []
  const totalW = drinks.reduce((s, d) => s + d.weight, 0)
  const hourW = hourShape.reduce((a, b) => a + b, 0)
  for (let back = HISTORY_DAYS; back >= 1; back--) {
    const day = addDays(today(), -back)
    const trend = 1 + (HISTORY_DAYS - back) * 0.004
    for (const shop of shops) {
      const target = 330 * shop.weight * dayShape[day.getDay()] * trend * (0.9 + r() * 0.2)
      const byDrink: Record<string, number> = {}
      let cups = 0
      let revenue = 0
      for (const d of drinks) {
        const n = Math.round(((target * d.weight) / totalW) * (0.8 + r() * 0.4))
        byDrink[d.id] = n
        cups += n
        revenue += n * d.price
      }
      const byHour = hourShape.map((h) => Math.round((cups * h * (0.85 + r() * 0.3)) / hourW))
      out.push({ date: iso(day), shopId: shop.id, cups, revenue: Math.round(revenue), byDrink, byHour })
    }
  }
  return out
})()

export const salesOn = (date: string, shopId?: ShopId) => sales.filter((s) => s.date === date && (!shopId || s.shopId === shopId))
export const sum = (xs: DaySales[], f: (d: DaySales) => number) => xs.reduce((a, d) => a + f(d), 0)
export const pctChange = (now: number, before: number) => (before ? ((now - before) / before) * 100 : 0)
export const fmtPct = (p: number) => `${p >= 0 ? '+' : '-'}${Math.abs(p).toFixed(1)}%`

// --- stock ---

export type Item = { id: string; name: string; unit: string; supplier: string; usePerDay: number; par: number; reorderAt: number }

export const items: Item[] = [
  { id: 'pearls', name: 'Tapioca pearls', unit: 'kg', supplier: 'Pearl Wholesale', usePerDay: 9, par: 60, reorderAt: 20 },
  { id: 'brown-sugar', name: 'Brown sugar syrup', unit: 'L', supplier: 'Pearl Wholesale', usePerDay: 4, par: 30, reorderAt: 10 },
  { id: 'milk', name: 'Whole milk', unit: 'L', supplier: 'Fresh Dairy Direct', usePerDay: 22, par: 90, reorderAt: 35 },
  { id: 'oat', name: 'Oat milk', unit: 'L', supplier: 'Fresh Dairy Direct', usePerDay: 8, par: 40, reorderAt: 15 },
  { id: 'taro', name: 'Taro powder', unit: 'kg', supplier: 'Tea Leaf Supply Co.', usePerDay: 1.2, par: 10, reorderAt: 3 },
  { id: 'matcha', name: 'Matcha powder', unit: 'kg', supplier: 'Tea Leaf Supply Co.', usePerDay: 0.6, par: 5, reorderAt: 1.5 },
  { id: 'black-tea', name: 'Assam black tea', unit: 'kg', supplier: 'Tea Leaf Supply Co.', usePerDay: 0.8, par: 8, reorderAt: 2.5 },
  { id: 'green-tea', name: 'Jasmine green tea', unit: 'kg', supplier: 'Tea Leaf Supply Co.', usePerDay: 0.5, par: 6, reorderAt: 1.5 },
  { id: 'mango', name: 'Mango purée', unit: 'L', supplier: 'Pearl Wholesale', usePerDay: 2.5, par: 20, reorderAt: 7 },
  { id: 'passion', name: 'Passion fruit purée', unit: 'L', supplier: 'Pearl Wholesale', usePerDay: 1.8, par: 15, reorderAt: 5 },
  { id: 'cups', name: 'Cups 700ml', unit: 'sleeves', supplier: 'PackRight', usePerDay: 7, par: 60, reorderAt: 20 },
  { id: 'lids', name: 'Sealing film', unit: 'rolls', supplier: 'PackRight', usePerDay: 0.5, par: 6, reorderAt: 2 },
]
export const itemById = (id: string) => items.find((i) => i.id === id)!

export type StockLine = { shopId: ShopId; itemId: string; onHand: number; onOrder: boolean; lastDelivery: string }

export const usage = (l: Pick<StockLine, 'shopId' | 'itemId'>) => itemById(l.itemId).usePerDay * shopById(l.shopId).weight
export const daysLeft = (l: StockLine) => l.onHand / usage(l)
export const reorderLevel = (l: Pick<StockLine, 'shopId' | 'itemId'>) => +(itemById(l.itemId).reorderAt * shopById(l.shopId).weight).toFixed(1)
export const parLevel = (l: Pick<StockLine, 'shopId' | 'itemId'>) => Math.round(itemById(l.itemId).par * shopById(l.shopId).weight)

export type StockStatus = 'Out' | 'Low' | 'OK'
export const stockStatus = (l: StockLine): StockStatus => (l.onHand <= 0 ? 'Out' : l.onHand <= reorderLevel(l) ? 'Low' : 'OK')

export function seedStock(): StockLine[] {
  const r = rng(99)
  const out: StockLine[] = []
  for (const shop of shops) {
    for (const item of items) {
      const line = { shopId: shop.id, itemId: item.id }
      const x = r()
      // ~15% low, a couple out, the rest comfortably stocked.
      const onHand = x < 0.04 ? 0 : x < 0.19 ? reorderLevel(line) * (0.3 + r() * 0.6) : reorderLevel(line) + (parLevel(line) - reorderLevel(line)) * (0.2 + r() * 0.8)
      out.push({ ...line, onHand: +onHand.toFixed(1), onOrder: false, lastDelivery: iso(addDays(today(), -Math.ceil(r() * 9))) })
    }
  }
  return out
}

// --- staff and rota ---

export type Role = 'Supervisor' | 'Team member'
export type Staff = { id: string; name: string; role: Role; home: ShopId }
export type Shift = { id: string; date: string; shopId: ShopId; staffId: string; slot: 'Open' | 'Close'; role: Role }

export const slotTimes = { Open: '09:30–16:00', Close: '15:30–22:30' } as const

const names: Record<ShopId, string[]> = {
  soho: ['Tom Hayes', 'Aiko Tanaka', 'Bea Moreno', 'Jordan Pike', 'Lily Zhang', 'Sami Haddad', 'Ruby Clarke', 'Dev Mistry'],
  camden: ['Grace Owusu', 'Leon Fischer', 'Mina Park', 'Callum Reid', 'Zara Ali', 'Finn Walsh', 'Ivy Chen', 'Max Doyle'],
  stratford: ['Priya Nair', 'Owen Price', 'Hana Sato', 'Theo Grant', 'Amara Eze', 'Luca Romano', 'Ella Brooks', 'Kai Wong'],
}

export const staff: Staff[] = shops.flatMap((s) =>
  names[s.id].map((name, i) => ({ id: `${s.id}-${i}`, name, role: (i < 3 ? 'Supervisor' : 'Team member') as Role, home: s.id })),
)
export const staffById = (id: string) => staff.find((s) => s.id === id)!

export const ROTA_DAYS = 7

export function seedShifts(): Shift[] {
  const out: Shift[] = []
  for (let d = 0; d < ROTA_DAYS; d++) {
    const date = addDays(today(), d)
    const busy = [5, 6].includes(date.getDay())
    for (const shop of shops) {
      const team = staff.filter((s) => s.home === shop.id)
      const sups = team.filter((s) => s.role === 'Supervisor')
      const members = team.filter((s) => s.role === 'Team member')
      // Rotate who opens, closes and is off so everyone gets days off.
      const rot = (xs: Staff[], k: number) => xs.map((_, i) => xs[(i + k) % xs.length])
      const m = rot(members, d * 2)
      const plan: [Staff, 'Open' | 'Close', Role][] = [
        [sups[d % 3], 'Open', 'Supervisor'],
        [sups[(d + 1) % 3], 'Close', 'Supervisor'],
        [m[0], 'Open', 'Team member'],
        [m[1], 'Close', 'Team member'],
        [m[2], 'Close', 'Team member'],
        ...(busy ? ([[m[3], 'Open', 'Team member']] as [Staff, 'Open', Role][]) : []),
      ]
      plan.forEach(([p, slot, role], i) => out.push({ id: `${iso(date)}-${shop.id}-${i}`, date: iso(date), shopId: shop.id, staffId: p.id, slot, role }))
    }
  }
  return out
}

export const owner = { name: 'Mei Lin', role: 'Owner' }
