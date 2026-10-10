import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, CreditCard, FileSignature, Send, Sparkles, Users } from 'lucide-react'
import { daysUntil, fmtDate, fmtDay, fmtMoney, relative } from '../../lib/format'
import { Button, EmptyState, Field, Input, Modal, useToast } from '../../ui'
import { balanceDue, capacity, cateringById, coordinator, extras, finalNumbersDue, holdUntil, nextStep, quote, spaceById, steps, type Booking } from './data'
import { QuoteSummary } from './QuoteSummary'
import { useVenue } from './store'

type Dialog = 'deposit' | 'contract' | 'numbers' | 'balance' | null

export function BookingDetail() {
  const { id } = useParams()
  const { bookings } = useVenue()
  const b = bookings.find((x) => x.id === id)

  if (!b) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState icon={CalendarDays} title="Booking not found" action={<Link to="/venue-hire/bookings"><Button variant="secondary">Your events</Button></Link>} />
      </div>
    )
  }
  return <Detail b={b} />
}

function Detail({ b }: { b: Booking }) {
  const { advance, send } = useVenue()
  const toast = useToast()
  const [dialog, setDialog] = useState<Dialog>(null)
  const space = spaceById(b.spaceId)
  const base = quote(b)
  const q = { ...base, deposit: b.depositAmount ?? base.deposit }
  const next = nextStep(b)
  const close = () => setDialog(null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <Link to="/venue-hire/bookings" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft size={15} /> Your events
      </Link>

      <div className={`mt-4 overflow-hidden rounded-2xl bg-gradient-to-br ${space.art} p-6 text-white md:p-8`}>
        <div className="text-xs uppercase tracking-[0.2em] text-white/70">{b.ref}</div>
        <h1 className="mt-2 font-display text-3xl font-semibold drop-shadow md:text-4xl">
          {b.eventType} · {space.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={15} /> {fmtDay(b.date)} · {relative(b.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={15} /> {b.guests} guests · {cateringById(b.cateringId).name}
          </span>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <NextStepCard b={b} total={q.total} deposit={q.deposit} onAction={setDialog} title={next.title} due={next.due} />

          <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
            <h2 className="font-semibold">Progress</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-5">
              {steps.map((s, i) => {
                const done = i < b.completed
                const current = i === b.completed
                return (
                  <li key={s} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        done ? 'bg-stone-900 text-stone-50' : current ? 'border-2 border-stone-900' : 'border border-stone-300 text-stone-400'
                      }`}
                    >
                      {done ? <Check size={15} /> : i + 1}
                    </span>
                    <span className={`text-sm ${done || current ? 'font-medium' : 'text-stone-400'}`}>{s}</span>
                  </li>
                )
              })}
            </ol>
          </section>

          <Messages b={b} onSend={(text) => send(b.id, text)} />
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-display text-xl font-semibold">Your quote</h2>
            <div className="mt-4">
              <QuoteSummary
                q={q}
                depositPaid={b.completed >= 2}
                balanceLabel={b.completed >= 5 ? 'Balance paid' : `Balance, due ${fmtDate(balanceDue(b))}`}
              />
            </div>
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-5 text-sm">
            <h2 className="font-semibold">Your events manager</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-amber-100 font-medium text-amber-900">JO</span>
              <div>
                <div className="font-medium">{coordinator.name}</div>
                <div className="text-stone-500">{coordinator.role} · events@ashcombe.example</div>
              </div>
            </div>
            {b.extras.length > 0 && (
              <>
                <h3 className="mt-5 font-semibold">Extras booked</h3>
                <ul className="mt-2 space-y-1 text-stone-600">
                  {b.extras.map((x) => <li key={x}>{extras.find((e) => e.id === x)!.name}</li>)}
                </ul>
              </>
            )}
            {b.dietary && (
              <>
                <h3 className="mt-5 font-semibold">Dietary requirements</h3>
                <p className="mt-1 text-stone-600">{b.dietary}</p>
              </>
            )}
          </section>
        </aside>
      </div>

      <PayDialog
        open={dialog === 'deposit'}
        onClose={close}
        title="Pay your deposit"
        amount={q.deposit}
        note={`Pays 25% of your quote and secures ${fmtDay(b.date)}. The balance is due ${fmtDate(balanceDue(b))}.`}
        onPay={() => {
          advance(b.id, { depositAmount: q.deposit })
          close()
          toast('Deposit paid. Your date is secured')
        }}
      />
      <PayDialog
        open={dialog === 'balance'}
        onClose={close}
        title="Pay the balance"
        amount={q.total - q.deposit}
        note={`Final balance for ${b.guests} guests, after your deposit of ${fmtMoney(q.deposit)}.`}
        onPay={() => {
          advance(b.id)
          close()
          toast('Balance paid. You’re all set')
        }}
      />
      {dialog === 'contract' && (
        <ContractDialog
          b={b}
          onClose={close}
          onSign={(name) => {
            advance(b.id, { signedName: name })
            close()
            toast('Contract signed')
          }}
        />
      )}
      {dialog === 'numbers' && (
        <NumbersDialog
          b={b}
          onClose={close}
          onConfirm={(guests, dietary) => {
            advance(b.id, { guests, dietary })
            close()
            toast('Final numbers confirmed')
          }}
        />
      )}
    </div>
  )
}

function NextStepCard({
  b,
  title,
  due,
  total,
  deposit,
  onAction,
}: {
  b: Booking
  title: string
  due?: string
  total: number
  deposit: number
  onAction: (d: Dialog) => void
}) {
  const action = {
    1: { label: `Pay ${fmtMoney(deposit)} deposit`, icon: CreditCard, dialog: 'deposit' as const, body: `We’re holding your date until ${fmtDate(holdUntil(b))}. Pay the deposit to secure it.` },
    2: { label: 'Review and sign', icon: FileSignature, dialog: 'contract' as const, body: 'Your contract sets out timings, cancellation terms and what’s included.' },
    3: { label: 'Confirm numbers', icon: Users, dialog: 'numbers' as const, body: `Let us know final guest numbers and any dietary requirements by ${fmtDate(finalNumbersDue(b))}.` },
    4: { label: `Pay ${fmtMoney(total - deposit)}`, icon: CreditCard, dialog: 'balance' as const, body: `The remaining balance is due by ${fmtDate(balanceDue(b))}.` },
  }[b.completed]

  if (!action) {
    return (
      <section className="flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
        <Sparkles className="shrink-0 text-emerald-700" />
        <div>
          <h2 className="font-semibold text-emerald-950">You’re all set</h2>
          <p className="mt-1 text-sm text-emerald-900">
            Everything is confirmed for {fmtDay(b.date)}. {coordinator.name} will send a running order and arrival details a week before.
          </p>
        </div>
      </section>
    )
  }

  const overdue = due && daysUntil(due) < 0
  return (
    <section className="rounded-2xl border border-stone-900 bg-white p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-500">Next step</div>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-stone-600">{action.body}</p>
          {due && <p className={`mt-1 text-xs font-medium ${overdue ? 'text-rose-600' : 'text-stone-500'}`}>Due {relative(due)}</p>}
        </div>
        <Button onClick={() => onAction(action.dialog)}>
          <action.icon size={16} /> {action.label}
        </Button>
      </div>
    </section>
  )
}

function PayDialog({ open, onClose, title, amount, note, onPay }: { open: boolean; onClose: () => void; title: string; amount: number; note: string; onPay: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onPay}>Pay {fmtMoney(amount)}</Button>
        </>
      }
    >
      <div className="text-3xl font-semibold tabular-nums">{fmtMoney(amount)}</div>
      <p className="mt-2 text-sm text-stone-600">{note}</p>
      <p className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-500">Demo only. No payment is taken and no card details are needed.</p>
    </Modal>
  )
}

function ContractDialog({ b, onClose, onSign }: { b: Booking; onClose: () => void; onSign: (name: string) => void }) {
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const terms = [
    `Hire of ${spaceById(b.spaceId).name} on ${fmtDay(b.date)}, 6pm to ${b.extras.includes('late') ? '1am' : '11pm'}.`,
    `Final numbers are due by ${fmtDate(finalNumbersDue(b))} and the balance by ${fmtDate(balanceDue(b))}.`,
    'The deposit is refundable if you cancel more than 90 days before the event.',
    'Catering and bar are provided by the museum’s approved caterer.',
    'No open flames, confetti or fixings to the walls in gallery spaces.',
  ]
  return (
    <Modal
      open
      onClose={onClose}
      title="Your hire contract"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!agreed || !name.trim()} onClick={() => onSign(name.trim())}>
            <FileSignature size={16} /> Sign contract
          </Button>
        </>
      }
    >
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-stone-700">
        {terms.map((t) => <li key={t}>{t}</li>)}
      </ul>
      <div className="mt-5 space-y-3">
        <Field label="Type your full name to sign">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={b.name} />
        </Field>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />I have read and agree to the hire terms.
        </label>
      </div>
    </Modal>
  )
}

function NumbersDialog({ b, onClose, onConfirm }: { b: Booking; onClose: () => void; onConfirm: (guests: number, dietary: string) => void }) {
  const [guests, setGuests] = useState(b.guests)
  const [dietary, setDietary] = useState('')
  const max = capacity(b.spaceId, b.cateringId)
  const valid = guests >= 10 && guests <= max
  const newTotal = quote({ ...b, guests }).total
  return (
    <Modal
      open
      onClose={onClose}
      title="Confirm final numbers"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={() => onConfirm(guests, dietary.trim())}>Confirm</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Final guest numbers" hint={`Up to ${max} for ${spaceById(b.spaceId).name} with ${cateringById(b.cateringId).name.toLowerCase()}.`}>
          <div className="max-w-40">
            <Input type="number" min={10} max={max} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
          </div>
        </Field>
        <Field label="Dietary requirements" hint="For example: 4 vegetarian, 2 vegan, 1 nut allergy.">
          <textarea
            rows={3}
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </Field>
        <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm">
          {valid ? (
            <>
              New total <strong className="tabular-nums">{fmtMoney(newTotal)}</strong>
              {guests !== b.guests && <span className="text-stone-500"> (was {fmtMoney(quote(b).total)})</span>}
            </>
          ) : (
            <span className="text-rose-700">Choose between 10 and {max} guests.</span>
          )}
        </p>
      </div>
    </Modal>
  )
}

function Messages({ b, onSend }: { b: Booking; onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
      <h2 className="font-semibold">Messages</h2>
      <ul className="mt-4 space-y-3">
        {b.messages.map((m, i) => (
          <li key={i} className={`flex ${m.from === 'client' ? 'justify-end' : ''}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'client' ? 'rounded-br-md bg-stone-900 text-stone-50' : 'rounded-bl-md bg-stone-100'}`}>
              {m.text}
              <div className={`mt-1 text-xs ${m.from === 'client' ? 'text-stone-400' : 'text-stone-500'}`}>
                {m.from === 'client' ? 'You' : coordinator.name} · {fmtDate(m.at)}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          onSend(text.trim())
          setText('')
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${coordinator.name.split(' ')[0]}…`}
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
        <Button type="submit" aria-label="Send">
          <Send size={16} />
        </Button>
      </form>
      <p className="mt-2 text-xs text-stone-500">{coordinator.name.split(' ')[0]} usually replies within one working day.</p>
    </section>
  )
}
