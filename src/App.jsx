import { useState } from 'react'
import { Link } from 'react-router-dom'
import bench from './graphrag/data/benchmark.json'

const services = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'Build AI Agents',
    description:
      'Custom agents tailored to your domain — from customer support and sales to internal ops and research. Built on the models and tools that fit your stack.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: 'Integrate Into Workflows',
    description:
      'We embed AI where your team already works — CRM, Slack, email, ERP, and custom apps. No rip-and-replace. Agents that plug in and start delivering from day one.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Measure Impact',
    description:
      'Every deployment comes with clear metrics — time saved, cost reduced, quality improved. Dashboards and reports that prove ROI to leadership and your team.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Discover',
    text: 'We map your workflows, pain points, and data sources to find the highest-leverage AI opportunities.',
  },
  {
    num: '02',
    title: 'Design & Build',
    text: 'We architect agents with guardrails, human-in-the-loop checkpoints, and integration into your existing tools.',
  },
  {
    num: '03',
    title: 'Deploy & Measure',
    text: 'We launch in production, track KPIs from day one, and iterate based on real usage and outcomes.',
  },
]

const metrics = [
  { value: '60%', label: 'Avg. time saved on repetitive tasks' },
  { value: '3×', label: 'Faster response to customer inquiries' },
  { value: '40%', label: 'Reduction in manual data entry' },
  { value: '2 wks', label: 'Typical time to first production agent' },
]

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
    ['Services', '#services'],
    ['Process', '#process'],
    ['Impact', '#impact'],
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
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-secondary transition-colors hover:text-interactive">
              {label}
            </a>
          ))}
          <Link
            to="/graphrag"
            className="text-sm text-secondary transition-colors hover:text-interactive"
          >
            Research
          </Link>
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
          className="p-2 text-text md:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-bg md:hidden">
          {[...links, ['Research', '/graphrag'], ['Contact', '#contact']].map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block border-b border-border px-6 py-3.5 text-sm text-secondary"
            >
              {label}
            </a>
          ))}
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
                AI agents that work where you do
              </span>
            </div>

            <h1 className="font-serif text-[2.75rem] leading-[1.06] tracking-tight text-text text-balance md:text-6xl">
              Build agents. <span className="text-interactive">Integrate</span> workflows.{' '}
              Prove impact.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-secondary">
              Trussk helps companies deploy production-ready AI agents inside their existing
              tools — and measure the results that matter.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="bg-interactive px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-interactive-hover"
              >
                Start a conversation
              </a>
              <Link
                to="/graphrag"
                className="border border-border-strong px-7 py-3.5 text-center text-sm font-medium text-text transition-colors hover:border-interactive hover:text-interactive"
              >
                See our research →
              </Link>
            </div>
          </div>

          {/* Carbon-style data panel: hairlines and tabular figures, no chrome. */}
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
                  { label: 'Tasks automated today', val: '847', change: '+12%', good: true },
                  { label: 'Avg. resolution time', val: '2.3 min', change: '−68%', good: true },
                  { label: 'Cost per interaction', val: '$0.04', change: '−91%', good: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 px-5 py-4">
                    <dt className="text-sm text-secondary">{s.label}</dt>
                    <dd className="text-right">
                      <span className="font-serif text-2xl tabular-nums text-text">{s.val}</span>
                      <span className="ml-2 font-mono text-[11px] tabular-nums text-support-success">
                        {s.change}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── the research subproject, surfaced on the homepage ──────────────────────── */
function Research() {
  const g = bench.totals.graphrag
  const s = bench.totals.text_to_sql
  const v = bench.totals.vector_rag

  const cards = [
    {
      to: '/graphrag',
      kicker: 'Overview',
      title: 'The result in one matrix',
      body: 'Three architectures, four questions, three trials each. Plus the measured reason similarity search cannot reach the answer.',
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
            <Eyebrow>Research · GraphRAG Performance Metrics</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-text text-balance md:text-4xl">
              We measure our own claims before we make them
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-secondary">
              We loaded a year of SEC EDGAR disclosure into Postgres and Neo4j and asked the
              same questions three ways — text-to-SQL, vector RAG, and GraphRAG. Scoring is
              programmatic against hand-verified ground truth, and we publish the results that
              do <em className="not-italic text-text">not</em> favour our conclusion.
            </p>
            <Link
              to="/graphrag"
              className="mt-7 inline-block bg-interactive px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-interactive-hover"
            >
              Explore the research →
            </Link>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-3 border border-border bg-bg">
              {[
                ['GraphRAG', g.passes, true],
                ['text-to-SQL', s.passes, false],
                ['Vector RAG', v.passes, false],
              ].map(([label, passes, lead], i) => (
                <div
                  key={label}
                  className={`px-5 py-5 ${i < 2 ? 'border-r border-border' : ''}`}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-helper">
                    {label}
                  </p>
                  <p
                    className={`mt-2 font-serif text-4xl tabular-nums ${
                      lead ? 'text-interactive' : 'text-text'
                    }`}
                  >
                    {passes}
                    <span className="text-xl text-helper">/12</span>
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
                  className="group border border-border bg-bg p-5 transition-colors hover:border-interactive"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-interactive">
                    {c.kicker}
                  </p>
                  <h3 className="mt-2 text-[15px] font-semibold leading-snug text-text">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-secondary">{c.body}</p>
                  <span className="mt-3 inline-block text-[13px] font-medium text-interactive">
                    Open →
                  </span>
                </Link>
              ))}
            </div>

            <p className="mt-4 font-mono text-[11px] leading-relaxed text-helper">
              {bench.corpus.postgres.filings.toLocaleString()} filings ·{' '}
              {bench.corpus.postgres.chunks.toLocaleString()} vector chunks ·{' '}
              {bench.corpus.neo4j.edges.toLocaleString()} graph edges ·{' '}
              {bench.usage.total_tokens.toLocaleString()} tokens across 36 scored runs
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <Eyebrow>Services</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-text text-balance md:text-4xl">
            End-to-end AI, from idea to ROI
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-secondary">
            We don&apos;t just hand you a chatbot. We build agents that fit your business,
            connect to your systems, and show you exactly what they&apos;re worth.
          </p>
        </div>

        <div className="mt-12 grid border border-border md:grid-cols-3">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`bg-bg p-7 transition-colors hover:bg-layer ${
                i < services.length - 1 ? 'border-b border-border md:border-b-0 md:border-r' : ''
              }`}
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center bg-interactive-light text-interactive">
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-text">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-secondary">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section id="process" className="border-b border-border bg-layer">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <Eyebrow>Process</Eyebrow>
        <h2 className="mt-3 max-w-xl font-serif text-3xl tracking-tight text-text text-balance md:text-4xl">
          How we work with you
        </h2>

        {/* Numbered because this genuinely is a sequence. */}
        <ol className="mt-12 grid gap-px border border-border bg-border md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.num} className="bg-bg p-7">
              <span className="font-mono text-sm font-semibold tabular-nums text-interactive">
                {step.num}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-2.5 leading-relaxed text-secondary">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Impact() {
  return (
    <section id="impact" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Impact</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-text text-balance md:text-4xl">
              Numbers your CFO will love
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-secondary">
              AI without measurement is just hype. We instrument every agent with analytics —
              tracking throughput, accuracy, cost, and business outcomes so you always know
              what&apos;s working.
            </p>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {[
                'Real-time dashboards for ops and leadership',
                'Before/after baselines for every deployment',
                'Monthly impact reports with actionable insights',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 py-3.5 text-secondary">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-interactive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-px border border-border bg-border">
            {metrics.map((m) => (
              <div key={m.label} className="bg-bg p-6">
                <p className="font-serif text-4xl tabular-nums text-interactive">{m.value}</p>
                <p className="mt-2 text-sm leading-snug text-secondary">{m.label}</p>
              </div>
            ))}
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
    <section id="contact" className="border-b border-border bg-layer">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-text text-balance md:text-4xl">
              Ready to put AI to work?
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-secondary">
              Tell us about your workflows and we&apos;ll show you where agents can make the
              biggest difference.
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
              placeholder="What workflows would you like to automate or improve?"
              rows={4}
              required
              aria-label="Message"
              className={`${field} resize-none`}
            />
            <button
              type="submit"
              disabled={submitted}
              className="w-full bg-interactive py-3.5 text-sm font-semibold text-white transition-colors hover:bg-interactive-hover disabled:bg-support-success disabled:opacity-100"
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
          &copy; {new Date().getFullYear()} Trussk. AI agents for real workflows.
        </p>
        <div className="flex flex-wrap gap-6">
          <a href="#services" className="text-sm text-secondary hover:text-interactive">Services</a>
          <a href="#process" className="text-sm text-secondary hover:text-interactive">Process</a>
          <Link to="/graphrag" className="text-sm text-secondary hover:text-interactive">Research</Link>
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
        <Services />
        <Process />
        <Impact />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
