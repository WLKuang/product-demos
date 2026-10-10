import { Link } from 'react-router-dom'
import { ArrowRight, Check, Users } from 'lucide-react'
import { fmtMoney } from '../../lib/format'
import { spaces } from './data'

export function Spaces() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Private hire</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight md:text-5xl">Host your event among the collection</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Four spaces for weddings, dinners, launches and talks. Choose a space and date to get an instant estimate, then manage your booking here.
      </p>

      <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
        {['Choose your space and date', 'See an instant estimate', 'Book and manage everything online'].map((t, i) => (
          <li key={t} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-stone-50">{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {spaces.map((s) => (
          <article key={s.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className={`relative h-44 bg-gradient-to-br ${s.art}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
              <h2 className="absolute bottom-4 left-5 font-display text-3xl font-semibold text-white drop-shadow">{s.name}</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-stone-600">{s.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-stone-400" /> {s.seated} seated · {s.standing} standing
                </span>
                <span className="text-stone-500">From {fmtMoney(s.weekday)} hire</span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                    <Check size={12} /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to={`/venue-hire/enquire?space=${s.id}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-stone-900 underline-offset-4 hover:underline"
              >
                Check dates and prices <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
