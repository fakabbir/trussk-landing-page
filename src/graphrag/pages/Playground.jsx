import { useEffect, useRef, useState } from 'react'
import { PageHead, Pill, Section } from '../components/Shell'
import { API_CONFIGURED, MODES, MODE_META, STATUS_LABEL, ask, fmt, getMeta } from '../api'
import data from '../data/benchmark.json'

const PRESETS = data.questions.map((q) => ({
 id: q.id,
 label: q.id + (q.id === data.killerId ? ' ★' : ''),
 type: q.type,
 question: q.question,
}))

const KILLER = PRESETS.find((p) => p.id === data.killerId)

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
        <div key={w} className="h-2.5 bg-layer-alt" style={{ width: w }} />
      ))}
    </div>
  )
}

function Code({ children }) {
 return (
    <pre className="max-h-52 overflow-auto border border-border bg-layer p-3 font-mono text-[11px] leading-relaxed whitespace-pre text-secondary">
      {children}
    </pre>
  )
}

function renderAnswer(text, forbidden) {
 let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text font-semibold">$1</strong>')
    .replace(
      /\b(\d{10}-\d{2}-\d{6})\b/g,
      '<span class="font-mono text-[11.5px] text-interactive bg-interactive-light px-1">$1</span>',
    )
 for (const w of forbidden || []) {
 html = html.replace(
 new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
      '<span class="text-support-error font-semibold underline decoration-wavy decoration-1 underline-offset-[3px]">$1</span>',
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
  } else if (r?.timeout) {
 status = 'error'
 label = 'timed out'
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
    <article className="overflow-hidden border border-border bg-layer">
      <header className="border-b border-border bg-layer px-4 py-3.5">
        <h3 className="font-mono text-[11.5px] font-semibold uppercase tracking-wider">
          {meta.label}
        </h3>
        <p className="mt-0.5 font-mono text-[10.5px] text-secondary">{meta.role}</p>
        <div className="mt-2.5 flex items-center gap-2">
          <Pill status={status}>{label}</Pill>
          {state?.elapsed != null && (
            <span className="ml-auto font-mono text-[11px] tabular-nums text-secondary">
              {state.elapsed.toFixed(1)}s
              {r?.tokens != null && ` · ${fmt(r.tokens)} tok`}
            </span>
          )}
        </div>
      </header>

      <div className="divide-y divide-border">
        {state?.busy && (
          <div className="p-4">
            <p className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 working
            </p>
            <Skeleton />
          </div>
        )}

        {state?.error && (
          <div className="p-4">
            <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 failed
            </p>
            <p className="font-mono text-[11px] leading-relaxed text-support-error">{state.error}</p>
          </div>
        )}

        {r?.timeout && !state.busy && (
          <div className="p-4">
            <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
              exceeded the request deadline
            </p>
            <p className="text-[12.5px] leading-relaxed text-support-error">{r.error}</p>
          </div>
        )}

        {r && !r.timeout && !state.busy && (
          <>
            {(r.sql || r.cypher) && (
              <div className="p-4">
                <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
                  {r.sql ? 'SQL it wrote' : 'Cypher it wrote'}
                  {(r.sql ? r.row_count : r.graph_rows) != null &&
                    ` · ${fmt(r.sql ? r.row_count : r.graph_rows)} rows`}
                </p>
                <Code>{(r.sql || r.cypher).trim()}</Code>
              </div>
            )}

            {r.retrieved?.length > 0 && (
              <div className="p-4">
                <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 chunks retrieved · cosine similarity
                </p>
                <table className="w-full border-collapse font-mono text-[10.5px] tabular-nums">
                  <tbody>
                    {r.retrieved.map((h, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="w-11 py-1 text-secondary">{h.similarity.toFixed(3)}</td>
                        <td className="py-1 text-secondary">{h.company}</td>
                        <td className="w-8 py-1 text-right text-helper">{h.item}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {r.companies_expanded?.length > 0 && (
              <div className="p-4">
                <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 entities resolved, then expanded completely
                </p>
                <ul className="font-mono text-[10.5px] tabular-nums">
                  {r.companies_expanded.map((e) => (
                    <li
 key={e.cik}
 className="flex justify-between gap-3 border-b border-border py-1 last:border-0"
                    >
                      <span className="text-text">{e.name}</span>
                      <span className="whitespace-nowrap text-secondary">
                        {e.subsidiaryCount} subs
                      </span>
                    </li>
                  ))}
                </ul>
                {r.snippets != null && (
                  <p className="mt-2 font-mono text-[10px] text-helper">
                    {r.snippets} passages pulled by filing_id
                    {r.text_terms?.length ? `, matching ${r.text_terms.join(', ')}` : ''}.
                  </p>
                )}
              </div>
            )}

            <div className="p-4">
              <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 what it answered
              </p>
              <div
 className="max-h-80 overflow-y-auto text-[13px] leading-relaxed text-secondary"
 dangerouslySetInnerHTML={{
                  __html: renderAnswer(r.answer || '—', sc?.forbidden_present),
                }}
              />
            </div>

            <div className="p-4">
              <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
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
                      <dt className="text-secondary">{k}</dt>
                      <dd className="text-text">{v}</dd>
                    </div>
                  ))}
              </dl>
              {sc?.forbidden_present?.length > 0 && (
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-support-error">
                  Named as fact: {sc.forbidden_present.join(', ')} — verifiably wrong.
                </p>
              )}
              {r.trace && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper hover:text-interactive">
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
            <p className="font-mono text-[11px] leading-relaxed text-helper">
              Pick a question above, or write your own, then press <b>Ask all three</b>.
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

export default function Playground() {
 const [question, setQuestion] = useState(KILLER?.question ?? PRESETS[0].question)
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


 return (
    <>
      <PageHead eyebrow="Live · three architectures · one question" title="Playground">
        <p>
          Ask anything of the loaded SEC filings. text-to-SQL, Vector RAG and GraphRAG run in
 parallel, each showing the query it wrote and the evidence it found. The twenty preset
 questions have hand-verified ground truth, so those get a real verdict — free-form
 questions show evidence and cost, not a score.
        </p>
        <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
          Queries carry a 45s Postgres statement timeout and a 50s request deadline. text-to-SQL
          hits it on the multi-hop questions — it writes joins across subsidiary, filing_section
          and reporting_owner without narrowing first, measured at 92s average and 445s worst case.
          That timeout is the honest result, not a broken page.
        </p>
      </PageHead>

      <Section>
        {!API_CONFIGURED && (
          <div className="mb-5 border border-support-warning bg-support-warning/10 px-4 py-3 text-[13.5px] text-support-warning">
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
          <div className="mb-5 border border-support-error bg-support-error/10 px-4 py-3 text-[13.5px] text-support-error">
            Could not reach the API: {health.error}
          </div>
        )}

        {health?.stats && (
          <ul className="mb-5 flex flex-wrap gap-2 font-mono text-[11px] text-secondary">
            {[
 [health.stats.postgres.ok, `Postgres ${fmt(health.stats.postgres.filings)} filings · ${fmt(health.stats.postgres.chunks)} chunks`],
 [health.stats.neo4j.ok, `Neo4j ${fmt(health.stats.neo4j.nodes)} nodes · ${fmt(health.stats.neo4j.edges)} edges`],
 [health.stats.api_key, health.stats.model],
            ].map(([ok, label], i) => (
              <li
 key={i}
 className="flex items-center gap-2 border border-border bg-layer px-2.5 py-1.5"
              >
                <span
 className={`h-1.5 w-1.5  ${ok ? 'bg-support-success' : 'bg-support-error'}`}
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
 className="border border-border bg-layer p-5"
        >
          <label
 htmlFor="q"
 className="mb-2 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper"
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
 className="w-full resize-y border border-border bg-layer px-3.5 py-3 font-serif text-[16px] leading-relaxed text-text outline-none focus:border-accent"
          />

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {MODES.map((m) => (
                <label
 key={m}
 className={`flex cursor-pointer select-none items-center gap-2 border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
 selected.has(m)
                      ? 'border-interactive bg-interactive-light text-text'
 : 'border-border bg-layer text-secondary'
                  }`}
                >
                  <input
 type="checkbox"
 checked={selected.has(m)}
 onChange={() => toggle(m)}
 className="accent-interactive"
                  />
                  {MODE_META[m].label}
                </label>
              ))}
            </div>
            <span className="font-mono text-[10.5px] text-helper">⌘↵ to run</span>
            <button
 type="submit"
 disabled={busy || !API_CONFIGURED || !question.trim()}
 className="ml-auto bg-interactive px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
            >
              {busy ? 'Running…' : 'Ask all three'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {data.types.map((t) => (
              <div key={t.id} className="flex w-full flex-wrap items-center gap-2">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-helper"
                  title={`expected to win: ${t.expect}`}
                >
                  {t.kind}
                </span>
                {PRESETS.filter((p) => p.type === t.id).map((cq) => (
                  <button
                    key={cq.id}
                    type="button"
                    onClick={() => setQuestion(cq.question)}
                    title={cq.question}
                    className={`cursor-pointer border px-2.5 py-1 font-mono text-[11.5px] transition-colors ${
                      question === cq.question
                        ? 'border-interactive bg-interactive-light text-interactive'
                        : 'border-border bg-layer text-secondary hover:border-interactive hover:text-text'
                    }`}
                  >
                    {cq.label}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex w-full flex-wrap items-center gap-2 border-t border-border pt-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-helper">
                free-form · no ground truth
              </span>
              {EXTRAS.map((cq) => (
                <button
                  key={cq.label}
                  type="button"
                  onClick={() => setQuestion(cq.question)}
                  className="cursor-pointer border border-border bg-layer px-2.5 py-1 text-[12px] text-secondary transition-colors hover:border-interactive hover:text-text"
                >
                  {cq.label}
                </button>
              ))}
            </div>
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
