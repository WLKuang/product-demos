import { Link } from 'react-router-dom'
import { CupSoda, PackageX, PoundSterling, Receipt } from 'lucide-react'
import { addDays, fmtMoney, iso, today } from '../../lib/format'
import { BarList, Card, InfoTip, Sparkline, StatCard, StatusBadge } from '../../ui'
import { daysLeft, drinks, fmtPct, itemById, pctChange, salesOn, shopById, shops, slotTimes, stockStatus, sum } from './data'
import { nameOf, useOps } from './store'

const day = (n: number) => iso(addDays(today(), n))

export function Today() {
  const { stock, shifts } = useOps()
  const y = salesOn(day(-1))
  const lastWeek = salesOn(day(-8))
  const revenue = sum(y, (d) => d.revenue)
  const cups = sum(y, (d) => d.cups)
  const low = stock.filter((l) => stockStatus(l) !== 'OK').sort((a, b) => daysLeft(a) - daysLeft(b))
  const lowNotOrdered = low.filter((l) => !l.onOrder)

  const best = drinks
    .map((d) => ({ label: d.name, value: sum(y, (s) => s.byDrink[d.id]) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Yesterday’s sales"
          value={fmtMoney(revenue)}
          delta={`${fmtPct(pctChange(revenue, sum(lastWeek, (d) => d.revenue)))} vs last week`}
          icon={PoundSterling}
          info="Takings across all three shops yesterday, compared with the same day last week so weekends are compared with weekends."
        />
        <StatCard label="Drinks sold" value={cups.toLocaleString('en-GB')} delta={`${fmtPct(pctChange(cups, sum(lastWeek, (d) => d.cups)))} vs last week`} icon={CupSoda} />
        <StatCard label="Average drink price" value={`£${(revenue / cups).toFixed(2)}`} icon={Receipt} info="Yesterday’s sales divided by drinks sold. A rise usually means more large sizes and extra toppings." />
        <StatCard
          label="Stock to reorder"
          value={String(lowNotOrdered.length)}
          icon={PackageX}
          info="Items at or below their reorder level in any shop that haven’t been ordered yet."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold">
            <InfoTip label="Sales by shop" text="Yesterday’s takings per shop, with the change against the same day last week and a two-week trend line." iconSize={14}>
              Sales by shop
            </InfoTip>
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {shops.map((s) => {
              const rev = sum(salesOn(day(-1), s.id), (d) => d.revenue)
              const change = pctChange(rev, sum(salesOn(day(-8), s.id), (d) => d.revenue))
              const trend = Array.from({ length: 14 }, (_, i) => sum(salesOn(day(i - 14), s.id), (d) => d.revenue))
              return (
                <Link key={s.id} to={`/ops/sales?shop=${s.id}`} className="rounded-xl border border-slate-100 p-4 transition hover:border-slate-300">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </div>
                  <div className="mt-2 text-xl font-semibold">{fmtMoney(rev)}</div>
                  <div className={`text-xs font-medium ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmtPct(change)} vs last week</div>
                  <div className="mt-3">
                    <Sparkline values={trend} color={s.color} />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Best sellers yesterday</h2>
          <div className="mt-4">
            <BarList items={best} color="#ec4899" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold">
              <InfoTip label="Running low" text="Sorted by how many days each item will last at that shop’s usual usage, soonest first." iconSize={14}>
                Running low
              </InfoTip>
            </h2>
            <Link to="/ops/stock" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Stock →
            </Link>
          </div>
          {low.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {low.slice(0, 6).map((l) => {
                const item = itemById(l.itemId)
                const status = stockStatus(l)
                return (
                  <li key={l.shopId + l.itemId} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: shopById(l.shopId).color }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        {shopById(l.shopId).name} · {l.onHand} {item.unit} left
                        {status === 'Low' && ` · about ${Math.max(1, Math.floor(daysLeft(l)))} day${Math.floor(daysLeft(l)) > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    {l.onOrder ? <StatusBadge tone="blue">On order</StatusBadge> : <StatusBadge tone={status === 'Out' ? 'red' : 'amber'}>{status === 'Out' ? 'Out of stock' : 'Low'}</StatusBadge>}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold">On shift today</h2>
            <Link to="/ops/rota" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Rota →
            </Link>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            {shops.map((s) => (
              <div key={s.id}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </div>
                {(['Open', 'Close'] as const).map((slot) => (
                  <div key={slot} className="mt-3">
                    <div className="text-xs text-slate-500">
                      {slot} · {slotTimes[slot]}
                    </div>
                    <ul className="mt-1 space-y-0.5 text-sm">
                      {shifts
                        .filter((x) => x.date === day(0) && x.shopId === s.id && x.slot === slot)
                        .map((x) => (
                          <li key={x.id}>
                            {nameOf(x.staffId)}
                            {x.role === 'Supervisor' && <span className="ml-1 text-xs text-pink-600">★</span>}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="px-5 pb-4 text-xs text-slate-500">★ Shift supervisor</p>
        </Card>
      </div>
    </div>
  )
}
