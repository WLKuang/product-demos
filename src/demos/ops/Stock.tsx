import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackagePlus, Send, Truck } from 'lucide-react'
import { fmtDate } from '../../lib/format'
import { Button, DataTable, Field, Input, Modal, Select, StatusBadge, useToast, type Column } from '../../ui'
import { daysLeft, itemById, items, parLevel, reorderLevel, shopById, shops, stockStatus, type ShopId, type StockLine } from './data'
import { useOps } from './store'

export function Stock() {
  const { stock, logDelivery, placeOrders } = useOps()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const shopId = (shops.some((s) => s.id === params.get('shop')) ? params.get('shop') : 'soho') as ShopId
  const [delivery, setDelivery] = useState<{ itemId: string } | null>(null)
  const [ordering, setOrdering] = useState(false)

  const rows = stock.filter((l) => l.shopId === shopId)
  const toOrder = rows.filter((l) => stockStatus(l) !== 'OK' && !l.onOrder)
  const lowCount = (id: ShopId) => stock.filter((l) => l.shopId === id && stockStatus(l) !== 'OK' && !l.onOrder).length

  const columns: Column<StockLine>[] = [
    { key: 'item', header: 'Item', sortValue: (l) => itemById(l.itemId).name, render: (l) => <span className="font-medium">{itemById(l.itemId).name}</span> },
    {
      key: 'onHand',
      header: 'In stock',
      className: 'text-right',
      sortValue: (l) => l.onHand,
      render: (l) => (
        <>
          {l.onHand} {itemById(l.itemId).unit}
          {/* On phones the days-left column is hidden, so show it here instead. */}
          <div className="text-xs sm:hidden">
            <Lasts l={l} />
          </div>
        </>
      ),
      description: 'Counted at close last night, plus any deliveries logged since.',
    },
    {
      key: 'days',
      header: 'Lasts',
      className: 'hidden sm:table-cell text-right',
      sortValue: (l) => daysLeft(l),
      description: 'Roughly how many days this will last at this shop’s usual daily usage.',
      render: (l) => <Lasts l={l} />,
    },
    {
      key: 'reorder',
      header: 'Reorder at',
      className: 'hidden sm:table-cell text-right text-slate-500',
      render: (l) => `${reorderLevel(l)} ${itemById(l.itemId).unit}`,
      description: 'When stock falls to this level it is flagged as low. Orders top it back up to the usual full level.',
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (l) => (l.onOrder ? 1 : stockStatus(l) === 'Out' ? 0 : stockStatus(l) === 'Low' ? 0.5 : 2),
      render: (l) =>
        l.onOrder ? (
          <StatusBadge tone="blue">On order</StatusBadge>
        ) : (
          <StatusBadge tone={{ Out: 'red', Low: 'amber', OK: 'green' }[stockStatus(l)] as 'red' | 'amber' | 'green'}>{stockStatus(l) === 'Out' ? 'Out' : stockStatus(l)}</StatusBadge>
        ),
    },
    { key: 'supplier', header: 'Supplier', className: 'hidden lg:table-cell text-slate-500', render: (l) => itemById(l.itemId).supplier },
    { key: 'last', header: 'Last delivery', className: 'hidden xl:table-cell text-slate-500', sortValue: (l) => l.lastDelivery, render: (l) => fmtDate(l.lastDelivery) },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {shops.map((s) => (
            <button
              key={s.id}
              onClick={() => setParams({ shop: s.id })}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition sm:flex-none ${shopId === s.id ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              style={shopId === s.id ? { background: s.color } : undefined}
            >
              {s.name}
              {lowCount(s.id) > 0 && (
                <span className={`rounded-full px-1.5 text-xs ${shopId === s.id ? 'bg-white/25' : 'bg-amber-100 text-amber-800'}`}>{lowCount(s.id)}</span>
              )}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="secondary" onClick={() => setDelivery({ itemId: items[0].id })}>
            <Truck size={16} /> Log delivery
          </Button>
          <Button disabled={toOrder.length === 0} onClick={() => setOrdering(true)}>
            <PackagePlus size={16} /> Order low stock ({toOrder.length})
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={[...rows].sort((a, b) => daysLeft(a) - daysLeft(b))}
        rowKey={(l) => l.itemId}
        onRowClick={(l) => setDelivery({ itemId: l.itemId })}
      />
      <p className="text-xs text-slate-500">Tap an item to log a delivery for it.</p>

      {delivery && (
        <DeliveryDialog
          shopId={shopId}
          initialItem={delivery.itemId}
          onClose={() => setDelivery(null)}
          onSave={(itemId, qty) => {
            logDelivery(shopId, itemId, qty)
            setDelivery(null)
            toast(`Delivery logged: ${qty} ${itemById(itemId).unit} of ${itemById(itemId).name.toLowerCase()}`)
          }}
        />
      )}

      <Modal
        open={ordering}
        onClose={() => setOrdering(false)}
        title={`Order for ${shopById(shopId).name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOrdering(false)}>Cancel</Button>
            <Button
              onClick={() => {
                placeOrders(toOrder)
                setOrdering(false)
                toast(`Orders sent to ${new Set(toOrder.map((l) => itemById(l.itemId).supplier)).size} suppliers`)
              }}
            >
              <Send size={16} /> Send orders
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Quantities top each item back up to its usual full level. Grouped by supplier, one email each.</p>
        {[...new Set(toOrder.map((l) => itemById(l.itemId).supplier))].map((supplier) => (
          <div key={supplier} className="mt-4">
            <h3 className="text-sm font-semibold">{supplier}</h3>
            <ul className="mt-1 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
              {toOrder
                .filter((l) => itemById(l.itemId).supplier === supplier)
                .map((l) => (
                  <li key={l.itemId} className="flex justify-between px-3 py-2">
                    {itemById(l.itemId).name}
                    <span className="tabular-nums text-slate-600">
                      {Math.ceil(parLevel(l) - l.onHand)} {itemById(l.itemId).unit}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">Demo only. No emails are sent.</p>
      </Modal>
    </div>
  )
}

function Lasts({ l }: { l: StockLine }) {
  if (l.onHand <= 0) return <span className="font-medium text-rose-600">None left</span>
  const d = daysLeft(l)
  const text = d < 1 ? 'Under a day' : Math.floor(d) === 1 ? '1 day' : `${Math.floor(d)} days`
  return <span className={d < 2 ? 'font-medium text-rose-600' : d < 4 ? 'text-amber-700' : ''}>{text}</span>
}

function DeliveryDialog({ shopId, initialItem, onClose, onSave }: { shopId: ShopId; initialItem: string; onClose: () => void; onSave: (itemId: string, qty: number) => void }) {
  const { stock } = useOps()
  const suggested = (itemId: string) => {
    const line = stock.find((l) => l.shopId === shopId && l.itemId === itemId)!
    return Math.max(1, Math.ceil(parLevel(line) - line.onHand))
  }
  const [itemId, setItemId] = useState(initialItem)
  const [qty, setQty] = useState(String(suggested(initialItem)))
  const n = Number(qty)
  const item = itemById(itemId)

  return (
    <Modal
      open
      onClose={onClose}
      title={`Log a delivery · ${shopById(shopId).name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!(n > 0)} onClick={() => onSave(itemId, n)}>
            Save delivery
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Item">
          <Select
            value={itemId}
            onChange={(e) => {
              setItemId(e.target.value)
              setQty(String(suggested(e.target.value)))
            }}
          >
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
        </Field>
        <Field label={`Quantity received (${item.unit})`} hint={`Filled in with what tops this item back up to full. Change it to match the delivery note.`}>
          <div className="max-w-40">
            <Input type="number" inputMode="decimal" min={0} step="any" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
        </Field>
        <p className="text-sm text-slate-500">Supplier: {item.supplier}</p>
      </div>
    </Modal>
  )
}
