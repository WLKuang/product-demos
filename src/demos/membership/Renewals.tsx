import type { ReactNode } from 'react'
import { CreditCard, Mail, PartyPopper } from 'lucide-react'
import { Button, Card, InfoTip, useToast } from '../../ui'
import { daysUntil, relative, status, type Member } from './data'
import { useMembership } from './store'

// Renewal workflow as three lanes: contact the due, follow up the reminded, win back the lapsed.
export function Renewals() {
  const { members, remind, renew, select } = useMembership()
  const toast = useToast()

  const toContact = members.filter((m) => status(m) === 'Due' && !m.directDebit)
  const reminded = members.filter((m) => status(m) === 'Reminded')
  const lapsed = members.filter((m) => status(m) === 'Lapsed' && daysUntil(m.renewalDate) >= -90)
  const directDebit = members.filter((m) => status(m) === 'Due' && m.directDebit)
  const renewedRecently = members.filter((m) => m.renewedAt && daysUntil(m.renewedAt) >= -30)

  const byDate = (a: Member, b: Member) => a.renewalDate.localeCompare(b.renewalDate)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-6 text-sm">
          <InfoTip
            label="renewed in the last 30 days"
            text="Members who paid for another year in the last 30 days, including anyone you mark as renewed on this page."
            iconSize={14}
          >
            <strong className="text-lg">{renewedRecently.length}</strong> <span className="text-slate-500">renewed in the last 30 days</span>
          </InfoTip>
          <InfoTip
            label="Direct Debit renewals"
            text="These members renew in the next 30 days but pay by Direct Debit, so payment is collected automatically and they don't need a reminder. They are left out of the lanes below."
            iconSize={14}
          >
            <span className="flex items-center gap-1.5 text-slate-500">
              <CreditCard size={16} /> {directDebit.length} will renew automatically by Direct Debit
            </span>
          </InfoTip>
        </div>
        <Button
          disabled={toContact.length === 0}
          onClick={() => {
            remind(toContact.map((m) => m.id))
            toast(`Reminders sent to ${toContact.length} members`)
          }}
        >
          <Mail size={16} /> Send reminders to all ({toContact.length})
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Lane
          title="To contact"
          hint="Due in the next 30 days, not yet reminded"
          info="Members who pay manually and whose renewal date is in the next 30 days. Nobody has emailed them yet. Send a reminder to move them to Reminder sent."
          count={toContact.length}
        >
          {toContact.sort(byDate).map((m) => (
            <MemberCard key={m.id} m={m} onOpen={() => select(m.id)} meta={`Renews ${relative(m.renewalDate)}`}>
              <Button variant="secondary" onClick={() => { remind([m.id]); toast(`Reminder sent to ${m.name}`) }}>
                Send reminder
              </Button>
            </MemberCard>
          ))}
        </Lane>

        <Lane
          title="Reminder sent"
          hint="Waiting for the member to renew"
          info="These members have had a renewal reminder but haven't paid yet. When their payment comes in, click Mark renewed to extend their membership by a year."
          count={reminded.length}
        >
          {reminded.sort(byDate).map((m) => (
            <MemberCard key={m.id} m={m} onOpen={() => select(m.id)} meta={`Renews ${relative(m.renewalDate)} · reminded ${relative(m.reminderSentAt!)}`}>
              <Button variant="secondary" onClick={() => { renew(m.id); toast(`${m.name} renewed`) }}>
                Mark renewed
              </Button>
            </MemberCard>
          ))}
        </Lane>

        <Lane
          title="Lapsed"
          hint="Expired in the last 90 days"
          info="Memberships that ran out in the last 90 days without being renewed. A win-back email invites them to rejoin. After 90 days they drop off this list but stay in Members."
          count={lapsed.length}
        >
          {lapsed.sort(byDate).reverse().map((m) => {
            const contacted = m.reminderSentAt && m.reminderSentAt >= m.renewalDate
            return (
              <MemberCard
                key={m.id}
                m={m}
                onOpen={() => select(m.id)}
                meta={`Lapsed ${relative(m.renewalDate)}${contacted ? ` · win-back sent ${relative(m.reminderSentAt!)}` : ''}`}
              >
                {contacted ? (
                  <Button variant="secondary" onClick={() => { renew(m.id); toast(`Welcome back, ${m.name}`) }}>
                    Mark renewed
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => { remind([m.id]); toast(`Win-back email sent to ${m.name}`) }}>
                    Send win-back
                  </Button>
                )}
              </MemberCard>
            )
          })}
        </Lane>
      </div>
    </div>
  )
}

function Lane({ title, hint, info, count, children }: { title: string; hint: string; info: string; count: number; children: ReactNode }) {
  return (
    <Card className="flex flex-col bg-slate-100/60">
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">
            <InfoTip label={title} text={info} iconSize={14}>{title}</InfoTip>
          </h2>
          <span className="rounded-full bg-white px-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200">{count}</span>
        </div>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-3">
        {count === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-sm text-slate-500">
            <PartyPopper size={24} className="text-slate-400" /> All clear
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  )
}

function MemberCard({ m, meta, onOpen, children }: { m: Member; meta: string; onOpen: () => void; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium hover:underline">{m.name}</span>
          <span className="shrink-0 text-xs text-slate-500">{m.tier}</span>
        </div>
        <div className="mt-0.5 text-xs text-slate-500">{meta}</div>
      </button>
      <div className="mt-2 [&_button]:w-full [&_button]:py-1.5">{children}</div>
    </div>
  )
}
