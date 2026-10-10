import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, PoundSterling, Users } from 'lucide-react'
import { Button, Card, InfoTip, StatCard, StatusBadge, useToast } from '../../ui'
import { daysUntil, fmtMoney, iso, relative, status, statusTone, tierPrice, tiers, today } from './data'
import { useMembership } from './store'

export function Overview() {
  const { members, select, remind } = useMembership()
  const toast = useToast()

  const current = members.filter((m) => status(m) !== 'Lapsed')
  const due = members.filter((m) => ['Due', 'Reminded'].includes(status(m))).sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
  const lapsed90 = members.filter((m) => status(m) === 'Lapsed' && daysUntil(m.renewalDate) >= -90)
  const revenue = current.reduce((sum, m) => sum + tierPrice[m.tier], 0)

  // Renewals per month for the last six complete months, from each member's latest renewal date.
  const now = today()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1)
    const key = iso(d).slice(0, 7)
    return { label: d.toLocaleDateString('en-GB', { month: 'short' }), count: members.filter((m) => m.renewedAt?.startsWith(key)).length }
  })
  const maxMonth = Math.max(1, ...months.map((m) => m.count))
  const byTier = tiers.map((t) => ({ tier: t, count: current.filter((m) => m.tier === t).length }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current members" info="Everyone whose membership is still valid, including members due to renew in the next 30 days. Lapsed members are not counted." value={String(current.length)} delta="+4.2% vs last quarter" icon={Users} />
        <StatCard label="Due in next 30 days" info="Members whose renewal date falls in the next 30 days, whether or not they have been reminded. Includes Direct Debit members, who renew automatically." value={String(due.length)} icon={CalendarClock} />
        <StatCard label="Lapsed (last 90 days)" info="Memberships that ran out in the last 90 days without being renewed. These are the people most likely to rejoin if contacted." value={String(lapsed90.length)} delta="-12% vs last quarter" goodWhenDown icon={AlertTriangle} />
        <StatCard label="Annual membership income" info="What current members pay in a year, adding up each member's tier fee. Lapsed members are not included." value={fmtMoney(revenue)} icon={PoundSterling} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold">
                <InfoTip label="Due for renewal" text="The members renewing soonest. Not contacted means no reminder has been sent yet; Direct Debit members renew automatically. The full list is on the Renewals page." iconSize={14}>Due for renewal</InfoTip>
              </h2>
              <p className="text-sm text-slate-500">Next 30 days, soonest first</p>
            </div>
            <Link to="/membership/renewals" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              View renewals →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {due.slice(0, 7).map((m) => {
              const s = status(m)
              return (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <button onClick={() => select(m.id)} className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium hover:underline">{m.name}</div>
                    <div className="text-xs text-slate-500">
                      {m.tier} · renews {relative(m.renewalDate)}
                    </div>
                  </button>
                  {m.directDebit ? (
                    <StatusBadge tone="purple">Direct Debit</StatusBadge>
                  ) : (
                    <StatusBadge tone={statusTone[s]}>{s === 'Due' ? 'Not contacted' : 'Reminded'}</StatusBadge>
                  )}
                  {!m.directDebit && s === 'Due' && (
                    <Button
                      variant="secondary"
                      className="hidden sm:inline-flex"
                      onClick={() => {
                        remind([m.id])
                        toast(`Reminder sent to ${m.name}`)
                      }}
                    >
                      Send reminder
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">
              <InfoTip label="Members by tier" text="How current members are split across the four membership levels. Lapsed members are not counted." iconSize={14}>Members by tier</InfoTip>
            </h2>
            <div className="mt-4 space-y-3">
              {byTier.map(({ tier, count }) => (
                <div key={tier}>
                  <div className="flex justify-between text-sm">
                    <span>{tier}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-800" style={{ width: `${(count / current.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">
              <InfoTip label="Renewals" text="How many members renewed in each of the last six complete months. The current month is added once it has finished." iconSize={14}>Renewals</InfoTip>
            </h2>
            <p className="text-sm text-slate-500">Last six complete months</p>
            <div className="mt-4 flex h-32 items-end gap-3">
              {months.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-slate-500">{m.count}</span>
                  <div className="w-full rounded-t bg-emerald-800/80" style={{ height: `${(m.count / maxMonth) * 88}px` }} />
                  <span className="text-xs text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <p className="text-xs text-slate-400">Demo data · figures as of {now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  )
}
