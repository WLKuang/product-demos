import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { fmtDay } from '../../lib/format'
import { Button, Card, Modal, Select, useToast } from '../../ui'
import { shopById, shops, slotTimes, staff, staffById, type Shift, type ShopId } from './data'
import { coverOptions, nameOf, useOps } from './store'

export function Rota() {
  const { shifts, swap } = useOps()
  const toast = useToast()
  const [shopFilter, setShopFilter] = useState<ShopId | ''>('')
  const [swapping, setSwapping] = useState<Shift | null>(null)

  const dates = [...new Set(shifts.map((s) => s.date))].sort()
  const shown = shopFilter ? shops.filter((s) => s.id === shopFilter) : shops

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-44">
          <Select value={shopFilter} onChange={(e) => setShopFilter(e.target.value as ShopId | '')} aria-label="Shop">
            <option value="">All shops</option>
            {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <p className="text-sm text-slate-500">
          Open {slotTimes.Open} · Close {slotTimes.Close} · <span className="text-pink-600">★</span> supervisor
        </p>
      </div>

      {dates.map((date, di) => (
        <Card key={date} className="overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold">
            {di === 0 ? 'Today · ' : di === 1 ? 'Tomorrow · ' : ''}
            {fmtDay(date)}
          </div>
          <div className={`grid divide-y divide-slate-100 ${shown.length > 1 ? 'md:grid-cols-3 md:divide-x md:divide-y-0' : ''}`}>
            {shown.map((s) => (
              <div key={s.id} className="p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </div>
                {(['Open', 'Close'] as const).map((slot) => (
                  <div key={slot} className="mt-3">
                    <div className="text-xs text-slate-500">{slot}</div>
                    <ul className="mt-1 space-y-1">
                      {shifts
                        .filter((x) => x.date === date && x.shopId === s.id && x.slot === slot)
                        .map((x) => {
                          const covering = staffById(x.staffId).home !== x.shopId
                          return (
                            <li key={x.id} className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50">
                              <span>
                                {nameOf(x.staffId)}
                                {x.role === 'Supervisor' && <span className="ml-1 text-xs text-pink-600">★</span>}
                                {covering && <span className="ml-1.5 text-xs text-slate-400">covering from {shopById(staffById(x.staffId).home).name}</span>}
                              </span>
                              <button
                                onClick={() => setSwapping(x)}
                                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-white hover:text-slate-900 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                              >
                                <ArrowLeftRight size={12} /> Swap
                              </button>
                            </li>
                          )
                        })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {swapping && (
        <SwapDialog
          shift={swapping}
          onClose={() => setSwapping(null)}
          onSwap={(staffId) => {
            swap(swapping.id, staffId)
            toast(`${nameOf(staffId)} is now covering ${nameOf(swapping.staffId).split(' ')[0]}’s shift`)
            setSwapping(null)
          }}
        />
      )}
    </div>
  )
}

function SwapDialog({ shift, onClose, onSwap }: { shift: Shift; onClose: () => void; onSwap: (staffId: string) => void }) {
  const { shifts } = useOps()
  const options = coverOptions(shift, shifts, staff)
  const [pick, setPick] = useState(options.find((o) => !o.reason)?.person.id ?? '')

  return (
    <Modal
      open
      onClose={onClose}
      title="Swap shift"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!pick} onClick={() => onSwap(pick)}>
            Confirm swap
          </Button>
        </>
      }
    >
      <p className="text-sm">
        <strong>{nameOf(shift.staffId)}</strong>’s {shift.slot.toLowerCase()} shift at {shopById(shift.shopId).name}, {fmtDay(shift.date)} ({slotTimes[shift.slot]})
        {shift.role === 'Supervisor' && ' · needs a supervisor'}
      </p>
      <h3 className="mt-4 text-sm font-semibold">Who can cover?</h3>
      <ul className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
        {options.map(({ person, reason, sameShop }) => (
          <li key={person.id}>
            <label className={`flex items-center gap-3 px-3 py-2 text-sm ${reason ? 'text-slate-400' : 'cursor-pointer hover:bg-slate-50'}`}>
              <input type="radio" name="cover" disabled={!!reason} checked={pick === person.id} onChange={() => setPick(person.id)} />
              <span className="flex-1">
                {person.name}
                {person.role === 'Supervisor' && <span className="ml-1 text-xs text-pink-600">★</span>}
                <span className="ml-1.5 text-xs text-slate-400">{sameShop ? person.role : `${shopById(person.home).name} · ${person.role}`}</span>
              </span>
              {reason && <span className="text-xs">{reason}</span>}
            </label>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
