import { useEffect, useRef, useState } from 'react'
import { PageHead, Pill, Section } from '../components/Shell'
import { API_CONFIGURED, MODES, MODE_META, STATUS_LABEL, ask, fmt, getMeta } from '../api'
import data from '../data/benchmark.json'

const PRESETS = data.questions.map((q) => ({
  id: q.id,
  label: q.kind.replace(/\s*\(THE KILLER QUERY\)/i, ' ★'),
  question: q.question,
}))

const EXTRAS = [
  { id: null, label: 'Boeing’s subsidiaries', question: 'Which subsidiaries does Boeing disclose, and in which jurisdictions?' },
  { id: null, label: 'Who audits whom', question: 'Which companies does Ernst & Young audit, and what is its PCAOB firm id?' },
  { id: null, label: 'Shared directors', question: 'Find two companies that share a board member, and name the person.' },
  { id: null, label: 'Largest subsidiary trees', question: 'Which company discloses the most subsidiaries, and how many?' },
]

function Skeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {['92%', '74%', '83%', '56%'].map((w) => (
        <div key={w} className="h-2.5 rounded bg-white/8" style={{ width: w }} />
      ))}
    </div>
  )
}

function Code({ children }) {
  return (
    <pre className="max-h-52 overflow-auto rounded-lg border border-white/8 bg-ink/70 p-3 font-mono text-[11px] leading-relaxed whitespace-pre text-muted">
      {children}
    </pre>
  )
}

function renderAnswer(text, forbidden) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e8edf4] font-semibold">$1</strong>')
    .replace(
      /\b(\d{10}-\d{2}-\d{6})\b/g,
      '<span class="font-mono text-[11.5px] text-accent bg-accent/10 rounded px-1">$1</span>',
    )
  for (const w of forbidden || []) {
    html = html.replace(
      new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
      '<span class="text-red-300 font-semibold underline decoration-wavy decoration-1 underline-offset-[3px]">$1</span>',
    )
  }
  return html.replace(/\n+/g, '<br/>')
}

function Pane({ mode, state }) {
  const meta = MODE_META[mode]
  const r = state?.result
  const sc = r?.score

  let status = 'refused'
  let label = 'idle'
  if (state?.busy) {
    status = 'busy'
    label = 'running'
  } else if (state?.error) {
    status = 'error'
    label = 'error'
  } else if (r) {
    if (sc) {
      if (sc.correct) [status, label] = ['pass', 'pass']
      else if (sc.forbidden_present?.length) [status, label] = ['halluc', 'hallucination']
      else if (sc.entity_recall === 1 && !sc.correct_citations?.length)
        [status, label] = ['uncited', 'no citation']
      else [status, label] = ['fail', 'fail']
    } else {
      ;[status, label] = ['refused', 'answered']
    }
  }

  const cites = r?.answer ? [...new Set(r.answer.match(/\b\d{10}-\d{2}-\d{6}\b/g) || [])] : []

  return (
    <article className="overflow-hidden rounded-xl border border-white/8 bg-surface/60">
      <header className="border-b border-white/8 bg-white/[0.02] px-4 py-3.5">
        <h3 className="font-mono text-[11.5px] font-semibold uppercase tracking-wider">
          {meta.label}
        </h3>
        <p className="mt-0.5 font-mono text-[10.5px] text-muted">{meta.role}</p>
        <div className="mt-2.5 flex items-center gap-2">
          <Pill status={status}>{label}</Pill>
          {state?.elapsed != null && (
            <span className="ml-auto font-mono text-[11px] tabular-nums text-muted">
              {state.elapsed.toFixed(1)}s
              {r?.tokens != null && ` · ${fmt(r.tokens)} tok`}
            </span>
          )}
        </div>
      </header>

      <div className="divide-y divide-white/8">
        {state?.busy && (
          <div className="p-4">
            <p className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
              working
            </p>
            <Skeleton />
          </div>
        )}

        {state?.error && (
          <div className="p-4">
            <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
              failed
            </p>
            <p className="font-mono text-[11px] leading-relaxed text-red-300">{state.error}</p>
          </div>
        )}

        {r && !state.busy && (
          <>
            {(r.sql || r.cypher) && (
              <div className="p-4">
                <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
                  {r.sql ? 'SQL it wrote' : 'Cypher it wrote'}
                  {(r.sql ? r.row_count : r.graph_rows) != null &&
                    ` · ${fmt(r.sql ? r.row_count : r.graph_rows)} rows`}
                </p>
                <Code>{(r.sql || r.cypher).trim()}</Code>
              </div>
            )}

            {r.retrieved?.length > 0 && (
              <div className="p-4">
                <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
                  chunks retrieved · cosine similarity
                </p>
                <table className="w-full border-collapse font-mono text-[10.5px] tabular-nums">
                  <tbody>
                    {r.retrieved.map((h, i) => (
                      <tr key={i} className="border-b border-white/6 last:border-0">
                        <td className="w-11 py-1 text-muted">{h.similarity.toFixed(3)}</td>
                        <td className="py-1 text-muted/90">{h.company}</td>
                        <td className="w-8 py-1 text-right text-muted/60">{h.item}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {r.companies_expanded?.length > 0 && (
              <div className="p-4">
                <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
                  entities resolved, then expanded completely
                </p>
                <ul className="font-mono text-[10.5px] tabular-nums">
                  {r.companies_expanded.map((e) => (
                    <li
                      key={e.cik}
                      className="flex justify-between gap-3 border-b border-white/6 py-1 last:border-0"
                    >
                      <span className="text-[#e8edf4]">{e.name}</span>
                      <span className="whitespace-nowrap text-muted">
                        {e.subsidiaryCount} subs
                      </span>
                    </li>
                  ))}
                </ul>
                {r.snippets != null && (
                  <p className="mt-2 font-mono text-[10px] text-muted/70">
                    {r.snippets} passages pulled by filing_id
                    {r.text_terms?.length ? `, matching ${r.text_terms.join(', ')}` : ''}.
                  </p>
                )}
              </div>
            )}

            <div className="p-4">
              <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
                what it answered
              </p>
              <div
                className="max-h-80 overflow-y-auto text-[13px] leading-relaxed text-muted"
                dangerouslySetInnerHTML={{
                  __html: renderAnswer(r.answer || '—', sc?.forbidden_present),
                }}
              />
            </div>

            <div className="p-4">
              <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
                {sc ? 'score' : 'cost & evidence'}
              </p>
              <dl className="grid grid-cols-2 gap-y-1 font-mono text-[10.5px] tabular-nums">
                {(sc
                  ? [
                      [
                        'required entities',
                        `${sc.entities_found.length}/${
                          sc.entities_found.length + sc.entities_missing.length
                        }`,
                      ],
                      ...(sc.forbidden_present?.length
                        ? [['false entities', sc.forbidden_present.length]]
                        : []),
                      ['citation precision', sc.cite_precision ?? '—'],
                      ['citation recall', sc.cite_recall ?? '—'],
                    ]
                  : [['filings cited', cites.length]]
                )
                  .concat([
                    ['evidence chars', fmt(r.evidence_chars)],
                    ['tokens · calls', `${fmt(r.tokens)} · ${r.llm_calls}`],
                    ['latency', `${r.elapsed_s}s`],
                  ])
                  .map(([k, v]) => (
                    <div key={k} className="col-span-2 flex justify-between gap-3">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-[#e8edf4]">{v}</dd>
                    </div>
                  ))}
              </dl>
              {sc?.forbidden_present?.length > 0 && (
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-red-300">
                  Named as fact: {sc.forbidden_present.join(', ')} — verifiably wrong.
                </p>
              )}
              {r.trace && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60 hover:text-accent">
                    retrieval trace
                  </summary>
                  <div className="mt-2">
                    <Code>{r.trace}</Code>
                  </div>
                </details>
              )}
            </div>
          </>
        )}

        {!state && (
          <div className="p-4">
            <p className="font-mono text-[11px] leading-relaxed text-muted/70">
              Pick a question above, or write your own, then press <b>Ask all three</b>.
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

export default function Playground() {
  const [question, setQuestion] = useState(PRESETS[2]?.question ?? '')
  const [selected, setSelected] = useState(new Set(MODES))
  const [panes, setPanes] = useState({})
  const [busy, setBusy] = useState(false)
  const [health, setHealth] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!API_CONFIGURED) return
    getMeta()
      .then(setHealth)
      .catch((e) => setHealth({ error: e.message }))
  }, [])

  function toggle(m) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(m) ? next.delete(m) : next.add(m)
      return next
    })
  }

  async function run() {
    const q = question.trim()
    if (!q || busy) return

    const modes = MODES.filter((m) => selected.has(m))
    if (!modes.length) return

    const preset = [...PRESETS].find((p) => p.question === q)
    const controller = new AbortController()
    abortRef.current = controller

    setBusy(true)
    setPanes(Object.fromEntries(modes.map((m) => [m, { busy: true }])))

    const started = Date.now()
    await Promise.all(
      modes.map(async (mode) => {
        try {
          const result = await ask({
            question: q,
            mode,
            questionId: preset?.id || null,
            signal: controller.signal,
          })
          setPanes((p) => ({
            ...p,
            [mode]: { busy: false, result, elapsed: (Date.now() - started) / 1000 },
          }))
        } catch (e) {
          setPanes((p) => ({
            ...p,
            [mode]: { busy: false, error: e.message, elapsed: (Date.now() - started) / 1000 },
          }))
        }
      }),
    )
    setBusy(false)
  }

  const chips = [...PRESETS, ...EXTRAS]

  return (
    <>
      <PageHead eyebrow="Live · three architectures · one question" title="Playground">
        <p>
          Ask anything of the loaded SEC filings. text-to-SQL, Vector RAG and GraphRAG run in
          parallel, each showing the query it wrote and the evidence it found. The four preset
          questions marked with an ID have verified ground truth, so those get a real verdict —
          free-form questions show evidence and cost, not a score.
        </p>
      </PageHead>

      <Section>
        {!API_CONFIGURED && (
          <div className="mb-5 rounded-lg border border-warm/25 bg-warm/10 px-4 py-3 text-[13.5px] text-warm">
            <b>Live queries are not configured for this deployment.</b> Set{' '}
            <code className="font-mono text-[12px]">VITE_API_BASE</code> in the Vercel project
            environment to the API URL and redeploy. Until then, the fixed case studies on{' '}
            <a href="/graphrag/benchmarks" className="underline">
              Benchmarks
            </a>{' '}
            show the same panes with recorded results.
          </div>
        )}

        {health?.error && (
          <div className="mb-5 rounded-lg border border-red-400/25 bg-red-400/10 px-4 py-3 text-[13.5px] text-red-300">
            Could not reach the API: {health.error}
          </div>
        )}

        {health?.stats && (
          <ul className="mb-5 flex flex-wrap gap-2 font-mono text-[11px] text-muted">
            {[
              [health.stats.postgres.ok, `Postgres ${fmt(health.stats.postgres.filings)} filings · ${fmt(health.stats.postgres.chunks)} chunks`],
              [health.stats.neo4j.ok, `Neo4j ${fmt(health.stats.neo4j.nodes)} nodes · ${fmt(health.stats.neo4j.edges)} edges`],
              [health.stats.api_key, health.stats.model],
            ].map(([ok, label], i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded border border-white/10 bg-surface/60 px-2.5 py-1.5"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`}
                />
                {label}
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            run()
          }}
          className="rounded-xl border border-white/8 bg-surface/60 p-5"
        >
          <label
            htmlFor="q"
            className="mb-2 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/60"
          >
            Your question
          </label>
          <textarea
            id="q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                run()
              }
            }}
            spellCheck={false}
            rows={3}
            placeholder="e.g. Which subsidiaries does Boeing disclose, and in which jurisdictions?"
            className="w-full resize-y rounded-lg border border-white/12 bg-ink/60 px-3.5 py-3 font-serif text-[16px] leading-relaxed text-[#e8edf4] outline-none focus:border-accent focus:ring-1 focus:ring-accent/40"
          />

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {MODES.map((m) => (
                <label
                  key={m}
                  className={`flex cursor-pointer select-none items-center gap-2 rounded border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                    selected.has(m)
                      ? 'border-accent/40 bg-accent/10 text-[#e8edf4]'
                      : 'border-white/12 bg-surface text-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(m)}
                    onChange={() => toggle(m)}
                    className="accent-accent"
                  />
                  {MODE_META[m].label}
                </label>
              ))}
            </div>
            <span className="font-mono text-[10.5px] text-muted/60">⌘↵ to run</span>
            <button
              type="submit"
              disabled={busy || !API_CONFIGURED || !question.trim()}
              className="ml-auto rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
            >
              {busy ? 'Running…' : 'Ask all three'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
            {chips.map((cq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuestion(cq.question)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-surface/80 px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-accent/30 hover:text-[#e8edf4]"
              >
                {cq.id && (
                  <span className="font-mono text-[10px] font-semibold text-accent">{cq.id}</span>
                )}
                {cq.label}
              </button>
            ))}
          </div>
        </form>
      </Section>

      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {MODES.filter((m) => selected.has(m)).map((m) => (
            <Pane key={m} mode={m} state={panes[m]} />
          ))}
        </div>
      </Section>
    </>
  )
}
