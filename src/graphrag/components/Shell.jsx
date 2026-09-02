import { Link, NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/graphrag', label: 'Overview', end: true },
  { to: '/graphrag/benchmarks', label: 'Benchmarks' },
  { to: '/graphrag/statistics', label: 'Statistics' },
  { to: '/graphrag/playground', label: 'Playground' },
]

export function Shell({ children }) {
 const { pathname } = useLocation()

 return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-50 border-b border-border bg-bg">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center bg-interactive-light">
                  <svg className="h-4 w-4 text-interactive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18V6l6 4.5L18 6v12"/>
                  </svg>
                </div>
                <span className="font-serif text-lg tracking-tight">Trussk</span>
              </Link>
              <span className="hidden text-helper sm:inline">/</span>
              <Link
 to="/graphrag"
 className="hidden text-sm text-secondary transition-colors hover:text-interactive sm:inline"
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
                      ' px-3 py-1.5 text-sm transition-colors',
 isActive
                        ? 'bg-interactive-light text-interactive'
 : 'text-secondary hover:text-text',
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

      <footer className="mt-24 border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-xs text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>
            A Trussk research subproject. Data: SEC EDGAR, public domain.
            Not investment advice.
          </p>
          <Link to="/" className="transition-colors hover:text-interactive">
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
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-interactive">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      {children && (
        <div className="mt-5 max-w-2xl text-[17px] leading-relaxed text-secondary">
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
        <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-2.5">
          <h2 className="font-serif text-xl tracking-tight">{label}</h2>
          {note && <span className="font-mono text-xs text-secondary">{note}</span>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Card({ children, className = '' }) {
 return (
    <div className={` border border-border bg-layer p-5 ${className}`}>
      {children}
    </div>
  )
}

const STATUS_STYLES = {
 pass: 'text-support-success bg-support-success/10 border-support-success',
 halluc: 'text-support-error bg-support-error/10 border-support-error',
 uncited: 'text-support-warning bg-support-warning/10 border-support-warning',
 refused: 'text-secondary bg-layer border-border',
 fail: 'text-secondary bg-layer border-border',
 busy: 'text-interactive bg-interactive-light border-interactive',
 error: 'text-support-error bg-support-error/10 border-support-error',
}

export function Pill({ status, children }) {
 return (
    <span
 className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
        STATUS_STYLES[status] || STATUS_STYLES.fail
      }`}
    >
      {children}
    </span>
  )
}

const DOT_STYLES = {
 pass: 'bg-support-success border-support-success',
 halluc: 'bg-support-error border-support-error',
 uncited: 'bg-support-warning border-support-warning',
 refused: 'bg-transparent border-border-strong',
 fail: 'bg-layer-alt border-border-strong',
}

export function Dot({ status, title }) {
 return (
    <span
 title={title}
 className={`inline-block h-2.5 w-2.5 border ${DOT_STYLES[status] || DOT_STYLES.fail}`}
    />
  )
}
