import { Link, NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/graphrag', label: 'Overview', end: true },
  { to: '/graphrag/benchmarks', label: 'Benchmarks' },
  { to: '/graphrag/playground', label: 'Playground' },
]

export function Shell({ children }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-ink text-[#e8edf4]">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18V6l6 4.5L18 6v12" />
                  </svg>
                </div>
                <span className="font-serif text-lg tracking-tight">Trussk</span>
              </Link>
              <span className="hidden text-muted/40 sm:inline">/</span>
              <Link
                to="/graphrag"
                className="hidden text-sm text-muted transition-colors hover:text-accent sm:inline"
              >
                GraphRAG Performance Metrics
              </Link>
            </div>

            <nav className="flex items-center gap-1">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    [
                      'rounded-md px-3 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted hover:text-[#e8edf4]',
                    ].join(' ')
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            A Trussk research subproject. Data: SEC EDGAR, public domain.
            Not investment advice.
          </p>
          <Link to="/" className="transition-colors hover:text-accent">
            ← Back to trussk.com
          </Link>
        </div>
      </footer>
    </div>
  )
}

export function PageHead({ eyebrow, title, children }) {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
      {eyebrow && (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      {children && (
        <div className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">
          {children}
        </div>
      )}
    </div>
  )
}

export function Section({ label, note, children, className = '' }) {
  return (
    <section className={`mx-auto max-w-6xl px-6 py-10 ${className}`}>
      {label && (
        <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-white/10 pb-2.5">
          <h2 className="font-serif text-xl tracking-tight">{label}</h2>
          {note && <span className="font-mono text-xs text-muted">{note}</span>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-white/8 bg-surface/60 p-5 ${className}`}>
      {children}
    </div>
  )
}

const STATUS_STYLES = {
  pass: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25',
  halluc: 'text-red-300 bg-red-400/10 border-red-400/25',
  uncited: 'text-warm bg-warm/10 border-warm/25',
  refused: 'text-muted bg-white/5 border-white/12',
  fail: 'text-muted bg-white/5 border-white/12',
  busy: 'text-accent bg-accent/10 border-accent/30',
  error: 'text-red-300 bg-red-400/10 border-red-400/25',
}

export function Pill({ status, children }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
        STATUS_STYLES[status] || STATUS_STYLES.fail
      }`}
    >
      {children}
    </span>
  )
}

const DOT_STYLES = {
  pass: 'bg-emerald-400 border-emerald-400',
  halluc: 'bg-red-400 border-red-400',
  uncited: 'bg-warm border-warm',
  refused: 'bg-transparent border-white/25',
  fail: 'bg-white/10 border-white/20',
}

export function Dot({ status, title }) {
  return (
    <span
      title={title}
      className={`inline-block h-2.5 w-2.5 rounded-[2px] border ${DOT_STYLES[status] || DOT_STYLES.fail}`}
    />
  )
}
