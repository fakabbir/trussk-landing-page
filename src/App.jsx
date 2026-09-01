import { useState } from 'react'
import { Link } from 'react-router-dom'
import bench from './graphrag/data/benchmark.json'

const Mark = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18V6l6 4.5L18 6v12" />
  </svg>
)

function Eyebrow({ children }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-interactive">
      {children}
    </p>
  )
}

function Nav() {
  const [open, setOpen] = useState(false)
  const links = [
    ['Research', '/graphrag'],
    ['Benchmarks', '/graphrag/benchmarks'],
    ['Playground', '/graphrag/playground'],
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center bg-interactive text-white">
            <Mark />
          </span>
          <span className="text-lg font-semibold tracking-tight text-text">Trussk</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map(([label, to]) => (
            <Link key={to} to={to} className="text-sm text-secondary transition-colors hover:text-interactive">
              {label}
            </Link>
          ))}
          <a
            href="#contact"
            className="bg-interactive px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-interactive-hover"
          >
            Get in touch
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="cursor-pointer p-2 text-text md:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-bg md:hidden">
          {[...links, ['Contact', '#contact']].map(([label, to]) =>
            to.startsWith('#') ? (
              <a key={to} href={to} onClick={() => setOpen(false)}
                 className="block border-b border-border px-6 py-3.5 text-sm text-secondary">{label}</a>
            ) : (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                    className="block border-b border-border px-6 py-3.5 text-sm text-secondary">{label}</Link>
            ),
          )}
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section id="top" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 border border-border bg-layer px-3 py-1.5">
              <span className="h-1.5 w-1.5 bg-interactive" />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-secondary">
                Trustworthy AI agents · measured, not claimed
              </span>
            </div>

            <h1 className="font-serif text-[2.75rem] leading-[1.06] tracking-tight text-text text-balance md:text-6xl">
              We make AI agents and LLMs{' '}
              <span className="text-interactive">trustworthy</span> — and prove it.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-secondary">
              Anyone can demo an agent that sounds right. Trussk builds retrieval
              architectures whose every claim traces back to a source document, then publishes
              the measurements — including the ones that don&apos;t flatter us.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/graphrag"
                className="bg-interactive px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-interactive-hover"
              >
                See our research →
              </Link>
              <a
                href="#contact"
                className="border border-border-strong px-7 py-3.5 text-center text-sm font-medium text-text transition-colors hover:border-interactive hover:text-interactive"
              >
                Get in touch
              </a>
            </div>
          </div>

          {/* agent dashboard */}
          <div className="lg:col-span-5">
            <div className="border border-border bg-layer">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-helper">
                  agent-dashboard
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-support-success">
                  <span className="h-1.5 w-1.5 bg-support-success" />
                  live
                </span>
              </div>
              <dl className="divide-y divide-border">
                {[
                  { label: 'Answers with a source citation', val: '100%', note: 'GraphRAG' },
                  { label: 'Confident falsehoods', val: '0', note: 'across 12 runs' },
                  { label: 'Unverifiable claims', val: '0', note: 'every hop carries filing_id' },
                ].map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 px-5 py-4">
                    <dt className="text-sm text-secondary">{s.label}</dt>
                    <dd className="text-right">
                      <span className="font-serif text-2xl tabular-nums text-text">{s.val}</span>
                      <span className="ml-2 font-mono text-[11px] text-helper">{s.note}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                to="/graphrag/playground"
                className="block border-t border-border px-5 py-3 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-interactive transition-colors hover:bg-interactive-light"
              >
                Try it against live SEC filings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Research() {
  const g = bench.totals.graphrag
  const s = bench.totals.text_to_sql
  const v = bench.totals.vector_rag

  const cards = [
    {
      to: '/graphrag',
      kicker: 'Overview',
      title: 'The result, and the mechanism',
      body: 'A quick-compare matrix, the measured reason similarity search cannot reach the answer, and one query traced through both architectures.',
    },
    {
      to: '/graphrag/benchmarks',
      kicker: 'Benchmarks',
      title: 'Methodology and case studies',
      body: 'How the comparison was kept fair, the full dataset breakdown, and the actual query each architecture wrote.',
    },
    {
      to: '/graphrag/playground',
      kicker: 'Playground',
      title: 'Run it yourself, live',
      body: 'Ask anything of a year of SEC filings and watch all three architectures answer in parallel.',
    },
  ]

  return (
    <section id="research" className="border-b border-border bg-layer">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>GraphRAG Performance Metrics</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-text text-balance md:text-4xl">
              Trust has to be measurable, so we measured it
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-secondary">
              We loaded a year of SEC EDGAR disclosure into Postgres and Neo4j and asked the
              same questions three ways — text-to-SQL, vector RAG, and GraphRAG. Scoring is
              programmatic against hand-verified ground truth, with no LLM judge, and we
              publish the results that do{' '}
              <em className="not-italic text-text">not</em> favour our conclusion.
            </p>
            <Link
              to="/graphrag"
              className="mt-7 inline-block bg-interactive px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-interactive-hover"
            >
              See our research →
            </Link>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-3 border border-border bg-bg">
              {[
                ['GraphRAG', g.passes, true],
                ['text-to-SQL', s.passes, false],
                ['Vector RAG', v.passes, false],
              ].map(([label, passes, lead], i) => (
                <div key={label} className={`px-5 py-5 ${i < 2 ? 'border-r border-border' : ''}`}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-helper">{label}</p>
                  <p className={`mt-2 font-serif text-4xl tabular-nums ${lead ? 'text-interactive' : 'text-text'}`}>
                    {passes}
                    <span className="text-xl text-helper">/{g.runs}</span>
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-helper">questions passed</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {cards.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  className="border border-border bg-bg p-5 transition-colors hover:border-interactive hover:bg-interactive-light"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-interactive">
                    {c.kicker}
                  </p>
                  <h3 className="mt-2 text-[15px] font-semibold leading-snug text-text">{c.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-secondary">{c.body}</p>
                  <span className="mt-3 inline-block text-[13px] font-medium text-interactive">Open →</span>
                </Link>
              ))}
            </div>

            <p className="mt-4 font-mono text-[11px] leading-relaxed text-helper">
              {bench.corpus.postgres.filings.toLocaleString()} filings ·{' '}
              {bench.corpus.postgres.chunks.toLocaleString()} vector chunks ·{' '}
              {bench.corpus.neo4j.edges.toLocaleString()} graph edges, each carrying the
              filing it came from
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const field =
    'w-full border border-border-strong bg-bg px-4 py-3 text-sm text-text placeholder:text-helper outline-none transition-colors focus:border-interactive'

  return (
    <section id="contact" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-text text-balance md:text-4xl">
              Want an agent you can actually audit?
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-secondary">
              Tell us what your team needs to trust, and we&apos;ll show you what it takes to
              make every answer traceable to a source.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="text" placeholder="Name" required aria-label="Name" className={field} />
              <input type="email" placeholder="Work email" required aria-label="Work email" className={field} />
            </div>
            <input type="text" placeholder="Company" aria-label="Company" className={field} />
            <textarea
              placeholder="What would your team need to verify before trusting an agent's answer?"
              rows={4}
              required
              aria-label="Message"
              className={`${field} resize-none`}
            />
            <button
              type="submit"
              disabled={submitted}
              className="w-full cursor-pointer bg-interactive py-3.5 text-sm font-semibold text-white transition-colors hover:bg-interactive-hover disabled:cursor-default disabled:bg-support-success disabled:opacity-100"
            >
              {submitted ? 'Thanks — we’ll be in touch' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center bg-interactive text-white">
            <Mark className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold text-text">Trussk</span>
        </div>
        <p className="text-sm text-helper">
          &copy; {new Date().getFullYear()} Trussk. Trustworthy AI agents, measured.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link to="/graphrag" className="text-sm text-secondary hover:text-interactive">Research</Link>
          <Link to="/graphrag/benchmarks" className="text-sm text-secondary hover:text-interactive">Benchmarks</Link>
          <Link to="/graphrag/playground" className="text-sm text-secondary hover:text-interactive">Playground</Link>
          <a href="#contact" className="text-sm text-secondary hover:text-interactive">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Research />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
