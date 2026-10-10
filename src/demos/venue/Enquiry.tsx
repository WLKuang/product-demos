import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, CalendarCheck, Check, Users } from 'lucide-react'
import { addDays, fmtDay, fmtMoney, iso, today } from '../../lib/format'
import { Button, Field, Input, Select, Stepper, useToast } from '../../ui'
import {
  availability,
  capacity,
  caterings,
  eventTypes,
  extras,
  isPeak,
  MIN_NOTICE_DAYS,
  nextAvailable,
  quote,
  spaceById,
  spaces,
  client,
  type CateringId,
  type EventType,
  type ExtraId,
  type SpaceId,
} from './data'
import { QuoteSummary } from './QuoteSummary'
import { useVenue } from './store'

const stepNames = ['Space & date', 'Guests & catering', 'Your details', 'Review']

type Form = {
  spaceId: SpaceId | ''
  date: string
  eventType: EventType | ''
  guests: number
  cateringId: CateringId
  extras: ExtraId[]
  name: string
  email: string
  company: string
  phone: string
  notes: string
}

export function Enquiry() {
  const [params] = useSearchParams()
  const { bookings, create } = useVenue()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>(() => ({
    spaceId: (spaces.some((s) => s.id === params.get('space')) ? params.get('space') : '') as SpaceId | '',
    date: '',
    eventType: '',
    guests: 80,
    cateringId: 'dinner',
    extras: [],
    // The client is signed in, so their details are filled in for them.
    name: client.name,
    email: client.email,
    company: client.company,
    phone: client.phone,
    notes: '',
  }))
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  // The client's own existing bookings also block their dates.
  const taken = bookings.filter((b) => b.spaceId === form.spaceId).map((b) => b.date)
  const avail = form.spaceId && form.date ? availability(form.spaceId, form.date, taken) : null
  const maxGuests = form.spaceId ? capacity(form.spaceId, form.cateringId) : 0
  const q = form.spaceId ? quote({ ...form, spaceId: form.spaceId }) : null

  const valid = [
    !!form.spaceId && !!form.eventType && avail === 'available',
    form.guests >= 10 && form.guests <= maxGuests,
    !!form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && !!form.phone.trim(),
    true,
  ]

  const submit = () => {
    const b = create({ ...form, spaceId: form.spaceId as SpaceId, eventType: form.eventType as EventType })
    toast('Enquiry sent. Your date is on hold for 7 days')
    navigate(`/venue-hire/bookings/${b.id}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 md:px-6 lg:pb-12">
      <h1 className="font-display text-3xl font-semibold md:text-4xl">Plan your event</h1>
      <div className="mt-6">
        <Stepper steps={stepNames} current={step} />
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 md:p-7">
          {step === 0 && (
            <>
              <Section title="Which space?">
                <div className="grid gap-3 sm:grid-cols-2">
                  {spaces.map((s) => (
                    <Choice key={s.id} selected={form.spaceId === s.id} onClick={() => set('spaceId', s.id)}>
                      <div className="font-medium">{s.name}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                        <Users size={12} /> up to {s.seated} seated · {s.standing} standing
                      </div>
                      <div className="mt-1 text-xs text-stone-500">
                        Hire {fmtMoney(s.weekday)} Sun–Thu · {fmtMoney(s.weekend)} Fri/Sat
                      </div>
                    </Choice>
                  ))}
                </div>
              </Section>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type of event">
                  <Select value={form.eventType} onChange={(e) => set('eventType', e.target.value as EventType)}>
                    <option value="" disabled>
                      Choose…
                    </option>
                    {eventTypes.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Date" hint={`We need at least ${MIN_NOTICE_DAYS} days’ notice.`}>
                  <Input type="date" value={form.date} min={iso(addDays(today(), MIN_NOTICE_DAYS))} onChange={(e) => set('date', e.target.value)} />
                </Field>
              </div>

              {avail && form.spaceId && <AvailabilityNote status={avail} spaceId={form.spaceId} date={form.date} taken={taken} onPick={(d) => set('date', d)} />}
            </>
          )}

          {step === 1 && form.spaceId && (
            <>
              <Section title="Catering">
                <div className="grid gap-3 sm:grid-cols-2">
                  {caterings.map((c) => (
                    <Choice key={c.id} selected={form.cateringId === c.id} onClick={() => set('cateringId', c.id)}>
                      <div className="flex justify-between gap-2 font-medium">
                        {c.name}
                        <span className="shrink-0 text-sm font-normal text-stone-500">{fmtMoney(c.perHead)}/guest</span>
                      </div>
                      <div className="mt-0.5 text-xs text-stone-500">{c.detail}</div>
                    </Choice>
                  ))}
                </div>
              </Section>

              <Field
                label="Number of guests"
                hint={`${spaceById(form.spaceId).name} holds up to ${maxGuests} guests ${caterings.find((c) => c.id === form.cateringId)!.seated ? 'seated' : 'standing'}.`}
              >
                <div className="max-w-40">
                  <Input type="number" min={10} max={maxGuests} value={form.guests} onChange={(e) => set('guests', Number(e.target.value))} />
                </div>
              </Field>
              {form.guests > maxGuests && (
                <Warning>
                  That’s more than the space can hold with this catering. Choose{' '}
                  {orList([
                    `up to ${maxGuests} guests`,
                    caterings.find((c) => c.id === form.cateringId)!.seated && 'a standing reception',
                    spaces.some((s) => capacity(s.id, form.cateringId) > maxGuests) && 'a larger space',
                  ])}
                  .
                </Warning>
              )}
              {form.guests < 10 && <Warning>The minimum is 10 guests.</Warning>}

              <Section title="Extras (optional)">
                <div className="grid gap-3 sm:grid-cols-2">
                  {extras.map((x) => {
                    const on = form.extras.includes(x.id)
                    return (
                      <Choice
                        key={x.id}
                        selected={on}
                        onClick={() =>
                          setForm((f) => ({ ...f, extras: f.extras.includes(x.id) ? f.extras.filter((e) => e !== x.id) : [...f.extras, x.id] }))
                        }
                        checkbox
                      >
                        <div className="flex justify-between gap-2 font-medium">
                          {x.name}
                          <span className="shrink-0 text-sm font-normal text-stone-500">{fmtMoney(x.price)}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-stone-500">{x.detail}</div>
                      </Choice>
                    )
                  })}
                </div>
              </Section>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-stone-500">We’ve filled this in from your account. Change anything that’s different for this event.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name">
                  <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
                </Field>
                <Field label="Organisation (optional)">
                  <Input value={form.company} onChange={(e) => set('company', e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </Field>
              </div>
              <Field label="Anything we should know? (optional)" hint="Timings, accessibility needs, ideas for the evening…">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </Field>
            </>
          )}

          {step === 3 && form.spaceId && (
            <dl className="divide-y divide-stone-100 text-sm">
              {[
                ['Event', `${form.eventType} at ${spaceById(form.spaceId).name}`, 0],
                ['Date', `${fmtDay(form.date)}${isPeak(form.date) ? ' (Fri/Sat rate)' : ''}`, 0],
                ['Guests & catering', `${form.guests} guests · ${caterings.find((c) => c.id === form.cateringId)!.name}`, 1],
                ['Extras', form.extras.length ? form.extras.map((id) => extras.find((x) => x.id === id)!.name).join(', ') : 'None', 1],
                ['Contact', `${form.name}${form.company ? `, ${form.company}` : ''} · ${form.email} · ${form.phone}`, 2],
                ['Notes', form.notes || 'None', 2],
              ].map(([k, v, s]) => (
                <div key={k as string} className="flex gap-4 py-3">
                  <dt className="w-36 shrink-0 text-stone-500">{k}</dt>
                  <dd className="flex-1">{v}</dd>
                  <button className="shrink-0 text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-900 hover:underline" onClick={() => setStep(s as number)}>
                    Edit
                  </button>
                </div>
              ))}
              <p className="pt-4 text-xs text-stone-500">
                Sending an enquiry is free and doesn’t commit you to anything. We’ll hold the date for 7 days while you review the quote.
              </p>
            </dl>
          )}

          <div className="flex justify-between border-t border-stone-100 pt-5">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <Button disabled={!valid[step]} onClick={() => setStep(step + 1)}>
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={submit}>
                <CalendarCheck size={16} /> Send enquiry
              </Button>
            )}
          </div>
        </div>

        <aside className="hidden rounded-2xl border border-stone-200 bg-white p-5 lg:sticky lg:top-24 lg:block">
          <h2 className="font-display text-xl font-semibold">Your estimate</h2>
          {q ? (
            <div className="mt-4">
              <QuoteSummary q={q} />
              {!form.date && <p className="mt-3 text-xs text-stone-500">Shown at the Sun–Thu rate until you choose a date.</p>}
            </div>
          ) : (
            <p className="mt-2 text-sm text-stone-500">Choose a space to see an instant estimate.</p>
          )}
        </aside>
      </div>

      {q && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Estimated total incl. VAT</span>
            <span className="text-lg font-semibold tabular-nums">{fmtMoney(q.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ['a', 'b', 'c'] -> 'a, b or c', skipping falsy entries.
function orList(items: (string | false)[]) {
  const xs = items.filter(Boolean) as string[]
  return xs.length > 1 ? `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}` : xs[0]
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-medium">{title}</h2>
      {children}
    </section>
  )
}

function Choice({ selected, onClick, checkbox, children }: { selected: boolean; onClick: () => void; checkbox?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      role={checkbox ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onClick}
      className={`relative rounded-xl border p-4 pr-10 text-left transition ${
        selected ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : 'border-stone-200 hover:border-stone-400'
      }`}
    >
      {children}
      <span
        className={`absolute right-3 top-4 flex size-5 items-center justify-center ${checkbox ? 'rounded' : 'rounded-full'} border ${
          selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
        }`}
      >
        {selected && <Check size={12} />}
      </span>
    </button>
  )
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

function AvailabilityNote({
  status,
  spaceId,
  date,
  taken,
  onPick,
}: {
  status: ReturnType<typeof availability>
  spaceId: SpaceId
  date: string
  taken: string[]
  onPick: (d: string) => void
}) {
  if (status === 'available') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
        <Check size={16} /> {fmtDay(date)} is available{isPeak(date) ? '. Friday and Saturday hire is charged at the peak rate.' : '.'}
      </div>
    )
  }
  const next = nextAvailable(spaceId, date, taken)
  const reason = {
    booked: 'Sorry, that date is already booked.',
    'out-of-season': `${spaceById(spaceId).name} is only open from April to September.`,
    'too-soon': `We need at least ${MIN_NOTICE_DAYS} days’ notice to plan an event.`,
  }[status]
  return (
    <Warning>
      {reason}
      {next && (
        <>
          {' '}
          The next available date is{' '}
          <button className="font-medium underline underline-offset-2" onClick={() => onPick(next)}>
            {fmtDay(next)}
          </button>
          .
        </>
      )}
    </Warning>
  )
}
