import { fmtMoney } from '../../lib/format'
import type { Quote } from './data'

// Itemised quote used in the enquiry sidebar and on the booking page.
export function QuoteSummary({ q, depositPaid, balanceLabel }: { q: Quote; depositPaid?: boolean; balanceLabel?: string }) {
  return (
    <div className="text-sm">
      <ul className="space-y-2">
        {q.lines.map((l) => (
          <li key={l.label} className="flex justify-between gap-4">
            <span className="text-stone-600">{l.label}</span>
            <span className="shrink-0 tabular-nums">{fmtMoney(l.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1 border-t border-stone-200 pt-3">
        <div className="flex justify-between text-stone-600">
          <span>VAT (20%)</span>
          <span className="tabular-nums">{fmtMoney(q.vat)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{fmtMoney(q.total)}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1 rounded-lg bg-stone-100 px-3 py-2 text-stone-600">
        <div className="flex justify-between">
          <span>{depositPaid ? 'Deposit paid' : 'Deposit to secure the date (25%)'}</span>
          <span className="tabular-nums">{fmtMoney(q.deposit)}</span>
        </div>
        <div className="flex justify-between">
          <span>{balanceLabel ?? 'Balance, due 14 days before'}</span>
          <span className="tabular-nums">{fmtMoney(q.total - q.deposit)}</span>
        </div>
      </div>
    </div>
  )
}
