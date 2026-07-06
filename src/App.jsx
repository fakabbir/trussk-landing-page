import { useState } from 'react'

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

function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18V6l6 4.5L18 6v12" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Trussk</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#services" className="text-sm text-muted transition hover:text-white">Services</a>
          <a href="#process" className="text-sm text-muted transition hover:text-white">Process</a>
          <a href="#impact" className="text-sm text-muted transition hover:text-white">Impact</a>
          <a
            href="#contact"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink transition hover:bg-accent-dim"
          >
            Get in touch
          </a>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-pulse-glow absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-warm/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            AI agents that work where you do
          </div>

          <h1 className="font-serif text-5xl leading-[1.1] tracking-tight text-white md:text-7xl">
            Build agents.{' '}
            <em className="text-accent not-italic">Integrate</em> workflows.{' '}
            <em className="text-warm not-italic">Prove</em> impact.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
            Trussk helps companies deploy production-ready AI agents inside their existing
            tools — and measure the results that matter.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="w-full rounded-full bg-accent px-8 py-3.5 text-center text-sm font-semibold text-ink transition hover:bg-accent-dim sm:w-auto"
            >
              Start a conversation
            </a>
            <a
              href="#services"
              className="w-full rounded-full border border-white/15 px-8 py-3.5 text-center text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 sm:w-auto"
            >
              See what we do
            </a>
          </div>
        </div>

        <div className="animate-float mx-auto mt-20 max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-surface/80 p-1 shadow-2xl shadow-accent/5 backdrop-blur">
            <div className="rounded-xl bg-ink-light p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-warm/80" />
                <div className="h-3 w-3 rounded-full bg-accent/80" />
                <span className="ml-3 text-xs text-muted">agent-dashboard — live</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Tasks automated today', val: '847', change: '+12%' },
                  { label: 'Avg. resolution time', val: '2.3 min', change: '-68%' },
                  { label: 'Cost per interaction', val: '$0.04', change: '-91%' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-white/5 bg-ink/60 p-4">
                    <p className="text-xs text-muted">{stat.label}</p>
                    <p className="mt-1 font-serif text-2xl text-white">{stat.val}</p>
                    <p className="mt-1 text-xs text-accent">{stat.change} vs. baseline</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Services</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-white md:text-5xl">
            End-to-end AI, from idea to ROI
          </h2>
          <p className="mt-4 text-lg text-muted">
            We don&apos;t just hand you a chatbot. We build agents that fit your business,
            connect to your systems, and show you exactly what they&apos;re worth.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-white/8 bg-surface/50 p-8 transition hover:border-accent/30 hover:bg-surface"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent/20">
                {s.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section id="process" className="border-t border-white/5 bg-surface/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Process</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-white md:text-5xl">
            How we work with you
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <span className="font-serif text-6xl text-white/5">{step.num}</span>
              <h3 className="-mt-4 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Impact() {
  return (
    <section id="impact" className="border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Impact</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-white md:text-5xl">
              Numbers your CFO will love
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              AI without measurement is just hype. We instrument every agent with
              analytics — tracking throughput, accuracy, cost, and business outcomes
              so you always know what&apos;s working.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Real-time dashboards for ops and leadership',
                'Before/after baselines for every deployment',
                'Monthly impact reports with actionable insights',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-white/8 bg-surface/50 p-6 text-center"
              >
                <p className="font-serif text-4xl text-accent md:text-5xl">{m.value}</p>
                <p className="mt-2 text-sm leading-snug text-muted">{m.label}</p>
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

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="border-t border-white/5 bg-surface/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Contact</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-white md:text-5xl">
            Ready to put AI to work?
          </h2>
          <p className="mt-4 text-lg text-muted">
            Tell us about your workflows and we&apos;ll show you where agents can make the biggest difference.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-lg space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              required
              className="rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm text-white placeholder:text-muted/60 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
            <input
              type="email"
              placeholder="Work email"
              required
              className="rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm text-white placeholder:text-muted/60 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
          </div>
          <input
            type="text"
            placeholder="Company"
            className="w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm text-white placeholder:text-muted/60 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
          <textarea
            placeholder="What workflows would you like to automate or improve?"
            rows={4}
            required
            className="w-full resize-none rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm text-white placeholder:text-muted/60 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
          <button
            type="submit"
            disabled={submitted}
            className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-ink transition hover:bg-accent-dim disabled:opacity-60"
          >
            {submitted ? 'Thanks — we\'ll be in touch!' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10">
            <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18V6l6 4.5L18 6v12" />
            </svg>
          </div>
          <span className="font-semibold text-white">Trussk</span>
        </div>
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Trussk. AI agents for real workflows.
        </p>
        <div className="flex gap-6">
          <a href="#services" className="text-sm text-muted transition hover:text-white">Services</a>
          <a href="#process" className="text-sm text-muted transition hover:text-white">Process</a>
          <a href="#contact" className="text-sm text-muted transition hover:text-white">Contact</a>
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
        <Services />
        <Process />
        <Impact />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
