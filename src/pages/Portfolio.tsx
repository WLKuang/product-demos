import { Link } from 'react-router-dom'
import { ArrowRight, Code2 } from 'lucide-react'
import { demos, repoUrl, type DemoEntry } from '../demos/registry'
import { StatusBadge } from '../ui'

const badge = (s: DemoEntry['status']) => (
  <StatusBadge tone={s === 'ready' ? 'green' : s === 'in-progress' ? 'amber' : 'grey'}>
    {s === 'ready' ? 'Live' : s === 'in-progress' ? 'In progress' : 'Coming soon'}
  </StatusBadge>
)

export function Portfolio() {
  const ready = demos.filter((d) => d.status === 'ready')
  const upcoming = demos.filter((d) => d.status !== 'ready')

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <p className="text-sm font-medium text-slate-500">Wanlun Kuang</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Interactive product demos</h1>
      <p className="mt-4 max-w-2xl text-slate-600">Working front-end demos built from rough briefs with Claude Code.</p>
      <a href={repoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
        <Code2 size={16} /> View the code on GitHub
      </a>

      <div className="mt-12 space-y-6">
        {ready.map((d) => (
          <article key={d.path} className="grid gap-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_2fr] md:p-8">
            <div className="flex flex-col items-start">
              {badge(d.status)}
              <h2 className="mt-4 text-xl font-semibold">{d.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{d.tagline}</p>
              <Link
                to={d.path}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                View live demo <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-5 text-sm">
              <section>
                <h3 className="font-semibold">The brief</h3>
                <p className="mt-1 text-slate-600">“{d.brief}”</p>
              </section>
              {d.iterations && d.iterations.length > 0 && (
                <section>
                  <h3 className="font-semibold">What changed after the first version</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">
                    {d.iterations.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                </section>
              )}
              <section>
                <h3 className="font-semibold">Handover to engineering</h3>
                <p className="mt-1 text-slate-600">{d.handover}</p>
              </section>
            </div>
          </article>
        ))}

        {upcoming.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((d) => {
              const body = (
                <>
                  {badge(d.status)}
                  <h2 className="mt-4 font-semibold">{d.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{d.tagline}</p>
                </>
              )
              // In-progress demos are already usable, so they link through; planned ones don't exist yet.
              return d.status === 'in-progress' ? (
                <Link key={d.path} to={d.path} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  {body}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                    Preview <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ) : (
                <div key={d.path} className="rounded-xl border border-dashed border-slate-300 p-6">
                  {body}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
