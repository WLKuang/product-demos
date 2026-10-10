import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { iso, today } from '../../lib/format'
import { seedShifts, seedStock, staffById, type Shift, type ShopId, type Staff, type StockLine } from './data'

type Store = {
  stock: StockLine[]
  shifts: Shift[]
  logDelivery: (shopId: ShopId, itemId: string, qty: number) => void
  placeOrders: (lines: { shopId: ShopId; itemId: string }[]) => void
  swap: (shiftId: string, staffId: string) => void
}

const Ctx = createContext<Store | null>(null)

export function OpsStore({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState(seedStock)
  const [shifts, setShifts] = useState(seedShifts)

  const store = useMemo<Store>(() => {
    const same = (a: { shopId: ShopId; itemId: string }, b: { shopId: ShopId; itemId: string }) => a.shopId === b.shopId && a.itemId === b.itemId
    return {
      stock,
      shifts,
      logDelivery: (shopId, itemId, qty) =>
        setStock((s) =>
          s.map((l) => (same(l, { shopId, itemId }) ? { ...l, onHand: +(l.onHand + qty).toFixed(1), onOrder: false, lastDelivery: iso(today()) } : l)),
        ),
      placeOrders: (lines) => setStock((s) => s.map((l) => (lines.some((x) => same(l, x)) ? { ...l, onOrder: true } : l))),
      swap: (shiftId, staffId) => setShifts((s) => s.map((x) => (x.id === shiftId ? { ...x, staffId } : x))),
    }
  }, [stock, shifts])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useOps() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useOps must be used inside OpsStore')
  return s
}

// Who could cover a shift, and why everyone else can't. Cover can come from any shop.
export function coverOptions(shift: Shift, shifts: Shift[], everyone: Staff[]) {
  const working = new Set(shifts.filter((s) => s.date === shift.date).map((s) => s.staffId))
  return everyone
    .filter((p) => p.id !== shift.staffId)
    .map((p) => {
      const reason = working.has(p.id)
        ? 'Already working that day'
        : shift.role === 'Supervisor' && p.role !== 'Supervisor'
          ? 'Not a supervisor'
          : null
      return { person: p, reason, sameShop: p.home === shift.shopId }
    })
    .sort((a, b) => Number(!!a.reason) - Number(!!b.reason) || Number(b.sameShop) - Number(a.sameShop) || a.person.name.localeCompare(b.person.name))
}

export const nameOf = (id: string) => staffById(id).name
