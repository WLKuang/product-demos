import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addDays, fmtMoney, iso, parse, today } from '../../lib/format'
import { BarChart, Card, DataTable, LineChart, Select, type Column } from '../../ui'
import { drinks, fmtPct, hours, pctChange, salesOn, shops, sum, type ShopId } from './data'

const day = (n: number) => iso(addDays(today(), n))

export function Sales() {
  const [params, setParams] = useSearchParams()
  const shop = (shops.some((s) => s.id === params.get('shop')) ? params.get('shop') : '') as ShopId | ''
  const [range, setRange] = useState<7 | 28>(28)
  const shown = shop ? shops.filter((s) => s.id === shop) : shops

  const dates = Array.from({ length: range }, (_, i) => day(i - range))
  const labels = dates.map((d) => parse(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))
  const series = shown.map((s) => ({ name: s.name, color: s.color, values: dates.map((d) => sum(salesOn(d, s.id), (x) => x.revenue)) }))

  const y = salesOn(day(-1), shop || undefined)
  const byHour = hours.map((_, i) => sum(y, (d) => d.byHour[i]))

  // Drinks: last 7 days against the 7 before.
  const window = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => salesOn(day(from + i), shop || undefined)).flat()
  const thisWeek = window(-7, 0)
  const prevWeek = window(-14, -7)
  type Row = { id: string; name: string; sold: number; change: number; revenue: number }
  const rows: Row[] = drinks.map((d) => {
    const sold = sum(thisWeek, (x) => x.byDrink[d.id])
    return { id: d.id, name: d.name, sold, change: pctChange(sold, sum(prevWeek, (x) => x.byDrink[d.id])), revenue: sold * d.price }
  })
  rows.sort((a, b) => b.sold - a.sold)
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Drink', sortValue: (r) => r.name },
    { key: 'sold', header: 'Sold (7 days)', sortValue: (r) => r.sold, className: 'text-right', render: (r) => r.sold.toLocaleString('en-GB'), description: 'Cups sold in the last seven days.' },
    {
      key: 'change',
      header: 'vs week before',
      sortValue: (r) => r.change,
      className: 'text-right',
      description: 'Change in cups sold compared with the seven days before that.',
      render: (r) => <span className={r.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{fmtPct(r.change)}</span>,
    },
    { key: 'revenue', header: 'Sales', sortValue: (r) => r.revenue, className: 'hidden sm:table-cell text-right', render: (r) => fmtMoney(r.revenue) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44">
          <Select value={shop} onChange={(e) => setParams(e.target.value ? { shop: e.target.value } : {})} aria-label="Shop">
            <option value="">All shops</option>
            {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm">
          {([7, 28] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1.5 font-medium ${range === r ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
              {r} days
            </button>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Daily sales</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {series.map((s) => {
              const total = s.values.reduce((a, b) => a + b, 0)
              return (
                <span key={s.name} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: s.color }} /> {s.name}
                  <span className="text-slate-500">{fmtMoney(total)}</span>
                </span>
              )
            })}
          </div>
        </div>
        <div className="mt-4">
          <LineChart series={series} labels={labels} format={(n) => (n >= 1000 ? `£${(n / 1000).toFixed(1)}k` : fmtMoney(n))} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="min-w-0 p-5">
          <h2 className="font-semibold">Drinks by hour, yesterday</h2>
          <p className="text-sm text-slate-500">Plan staffing around the busiest hour</p>
          <div className="mt-4">
            <BarChart values={byHour} labels={hours.map((h) => String(h))} color="#14b8a6" />
          </div>
        </Card>
        <div className="min-w-0">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
        </div>
      </div>
    </div>
  )
}
