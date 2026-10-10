import { useMemo, useState } from 'react'
import { Search, UserX } from 'lucide-react'
import { Button, DataTable, EmptyState, Input, Select, StatusBadge, type Column } from '../../ui'
import { fmtDate, status, statusTone, tiers, type Member, type Status } from './data'
import { useMembership } from './store'

const statuses: Status[] = ['Active', 'Due', 'Reminded', 'Lapsed']

export function Members() {
  const { members, select } = useMembership()
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState('')
  const [state, setState] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter(
      (m) =>
        (!q || m.name.toLowerCase().includes(q) || m.email.includes(q) || m.memberNo.toLowerCase().includes(q)) &&
        (!tier || m.tier === tier) &&
        (!state || status(m) === state),
    )
  }, [members, query, tier, state])

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Member',
      description: 'Full name and the email address used for renewal reminders and newsletters.',
      sortValue: (m) => m.name,
      render: (m) => (
        <div>
          <div className="font-medium">{m.name}</div>
          <div className="text-xs text-slate-500">{m.email}</div>
        </div>
      ),
    },
    { key: 'memberNo', header: 'Member no.', description: 'Unique number printed on the membership card. Quote it to find someone quickly at the front desk or on the phone.', className: 'hidden xl:table-cell text-slate-500' },
    { key: 'tier', header: 'Tier', description: 'Membership level and yearly fee: Individual £75, Joint £120 (two adults), Family £140 (two adults and children), Patron £1,200.', sortValue: (m) => m.tier },
    { key: 'joined', header: 'Member since', description: 'The date this person first joined. Long-standing members are good people to thank or invite to upgrade.', sortValue: (m) => m.joined, render: (m) => fmtDate(m.joined), className: 'hidden sm:table-cell' },
    { key: 'renewalDate', header: 'Renewal', description: 'The date the current membership runs out and the next yearly payment is due.', sortValue: (m) => m.renewalDate, render: (m) => fmtDate(m.renewalDate) },
    {
      key: 'status',
      header: 'Status',
      description: 'Active: more than 30 days until renewal. Due: renews within 30 days and has not been contacted. Reminded: a renewal reminder has been sent. Lapsed: the renewal date has passed without payment.',
      sortValue: (m) => statuses.indexOf(status(m)),
      render: (m) => <StatusBadge tone={statusTone[status(m)]}>{status(m)}</StatusBadge>,
    },
    { key: 'visitsThisYear', header: 'Visits', description: 'How many times the member has visited this year, counted when their card is scanned at entry.', sortValue: (m) => m.visitsThisYear, className: 'hidden xl:table-cell text-right' },
  ]

  const clear = () => {
    setQuery('')
    setTier('')
    setState('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <div className="[&_input]:pl-9">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email or member number" autoFocus />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:w-80">
          <Select value={tier} onChange={(e) => setTier(e.target.value)} aria-label="Tier">
            <option value="">All tiers</option>
            {tiers.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Select value={state} onChange={(e) => setState(e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Showing {rows.length} of {members.length} members
      </p>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(m) => m.id}
        onRowClick={(m) => select(m.id)}
        empty={
          <EmptyState
            icon={UserX}
            title="No members match"
            body="Try a different name or clear the filters."
            action={<Button variant="secondary" onClick={clear}>Clear filters</Button>}
          />
        }
      />
    </div>
  )
}
