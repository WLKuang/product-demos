import { useState } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { Button, Drawer, StatusBadge, useToast } from '../../ui'
import { fmtDate, fmtMoney, relative, status, statusTone, tierPrice } from './data'
import { useMembership } from './store'

export function MemberDrawer() {
  const { selected: m, select, remind, renew, addNote } = useMembership()
  const toast = useToast()
  const [note, setNote] = useState('')

  if (!m) return null
  const s = status(m)
  const close = () => {
    setNote('')
    select(null)
  }

  const facts: [string, string][] = [
    ['Email', m.email],
    ['Phone', m.phone],
    ['Member since', fmtDate(m.joined)],
    ['Renewal date', `${fmtDate(m.renewalDate)} (${relative(m.renewalDate)})`],
    ['Annual fee', fmtMoney(tierPrice[m.tier])],
    ['Payment', m.directDebit ? 'Direct Debit' : 'Manual renewal'],
    ['Visits this year', String(m.visitsThisYear)],
  ]

  return (
    <Drawer
      open
      onClose={close}
      title={m.name}
      subtitle={`${m.memberNo} · ${m.tier}`}
      footer={
        <>
          {s !== 'Active' && (
            <Button
              variant="secondary"
              onClick={() => {
                remind([m.id])
                toast(s === 'Lapsed' ? `Win-back email sent to ${m.name}` : `Reminder sent to ${m.name}`)
              }}
            >
              <Mail size={16} /> {s === 'Lapsed' ? 'Send win-back' : s === 'Reminded' ? 'Resend reminder' : 'Send reminder'}
            </Button>
          )}
          <Button
            onClick={() => {
              renew(m.id)
              toast(`${m.name} renewed for another year`)
            }}
          >
            <RefreshCw size={16} /> Mark renewed
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone={statusTone[s]}>{s === 'Due' ? 'Due for renewal' : s}</StatusBadge>
        {m.directDebit && <StatusBadge tone="purple">Direct Debit</StatusBadge>}
        {m.reminderSentAt && s !== 'Active' && <StatusBadge tone="grey">Contacted {relative(m.reminderSentAt)}</StatusBadge>}
      </div>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
        {facts.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-slate-500">{k}</dt>
            <dd className="break-all">{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-8 text-sm font-semibold">Notes</h3>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!note.trim()) return
          addNote(m.id, note.trim())
          setNote('')
        }}
      >
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <Button variant="secondary" type="submit">Add</Button>
      </form>
      <ul className="mt-3 space-y-2">
        {m.notes.map((n, i) => (
          <li key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-sm">
            {n.text}
            <div className="mt-0.5 text-xs text-slate-500">{fmtDate(n.date)}</div>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-sm font-semibold">Activity</h3>
      <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
        {m.history.map((h, i) => (
          <li key={i} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-slate-300" />
            {h.text}
            <div className="text-xs text-slate-500">{fmtDate(h.date)}</div>
          </li>
        ))}
      </ol>
    </Drawer>
  )
}
