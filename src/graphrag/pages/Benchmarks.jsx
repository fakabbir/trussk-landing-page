import { useState } from 'react'
import { Card, PageHead, Pill, Section } from '../components/Shell'
import { CompareMatrix, Legend } from '../components/CompareMatrix'
import { MODE_META, MODES, STATUS_LABEL, fmt } from '../api'
import data from '../data/benchmark.json'

const c = data.corpus
const cleanKind = (k) => k.replace(/\s*\(THE KILLER QUERY\)/i, ' ★')

function Code({ children, max = 'max-h-56' }) {
 return (
    <pre
 className={`overflow-auto ${max} border border-border bg-layer p-3 font-mono text-[11px] leading-relaxed whitespace-pre text-secondary`}
    >
      {children}
    </pre>
  )
}

function Answer({ text, forbidden }) {
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
 return (
    <div
 className="max-h-72 overflow-y-auto text-[13px] leading-relaxed text-secondary"
 dangerouslySetInnerHTML={{ __html: html.replace(/\n+/g, '<br/>') }}
    />
  )
}

function CaseStudy({ q }) {
 return (
    <div className="border border-border bg-layer p-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-[11px] font-semibold text-interactive">{q.id}</span>
        <h3 className="font-serif text-lg tracking-tight">{cleanKind(q.kind)}</h3>
        <span className="font-mono text-[10.5px] text-helper">expected: {q.expect}</span>
      </div>

      <p className="mt-3 border-l-2 border-interactive pl-4 font-serif text-[15.5px] leading-relaxed text-text">
        {q.question}
      </p>

      {q.validAccessions.length > 0 && (
        <p className="mt-2.5 font-mono text-[10.5px] text-secondary">
 filings that answer it: {q.validAccessions.join(', ')}
        </p>
      )}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {MODES.map((m) => {
 const s = q.runs[m].sample
 return (
            <div key={m} className="border border-border bg-layer">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                    {MODE_META[m].label}
                  </h4>
                  <Pill status={s.status}>{STATUS_LABEL[s.status]}</Pill>
                </div>
                <p className="mt-1 font-mono text-[10px] text-secondary">
                  {q.runs[m].passes}/3 trials passed
                </p>
              </div>

              <div className="space-y-3 p-4">
                {s.query && (
                  <div>
                    <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
                      {s.queryLang === 'sql' ? 'SQL it wrote' : 'Cypher it wrote'}
                      {s.rows !== null && ` · ${fmt(s.rows)} rows`}
                    </p>
                    <Code max="max-h-40">{s.query.trim()}</Code>
                  </div>
                )}

                {s.retrieved?.length > 0 && (
                  <div>
                    <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 chunks retrieved · cosine similarity
                    </p>
                    <table className="w-full border-collapse font-mono text-[10.5px] tabular-nums">
                      <tbody>
                        {s.retrieved.map((h, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="w-11 py-1 text-secondary">{h.sim.toFixed(3)}</td>
                            <td className="py-1 text-secondary">{h.company}</td>
                            <td className="w-8 py-1 text-right text-helper">{h.item}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {s.expanded?.length > 0 && (
                  <div>
                    <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 entities resolved, then expanded completely
                    </p>
                    <ul className="font-mono text-[10.5px] tabular-nums">
                      {s.expanded.map((e) => (
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
                  </div>
                )}

                <div>
                  <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
 what it answered
                  </p>
                  <Answer text={s.answer} forbidden={s.forbidden} />
                </div>

                <dl className="grid grid-cols-2 gap-y-1 border-t border-border pt-3 font-mono text-[10.5px] tabular-nums">
                  {[
 ['citation precision', s.citePrecision],
 ['citation recall', s.citeRecall],
 ['evidence chars', fmt(s.evidence)],
 ['tokens · calls', `${fmt(s.tokens)} · ${s.calls}`],
 ['latency', `${s.latency}s`],
                  ].map(([k, v]) => (
                    <div key={k} className="col-span-2 flex justify-between gap-3">
                      <dt className="text-secondary">{k}</dt>
                      <dd className="text-text">{v === null ? '—' : v}</dd>
                    </div>
                  ))}
                </dl>

                {s.forbidden?.length > 0 && (
                  <p className="font-mono text-[10px] leading-relaxed text-support-error">
                    Named as fact: {s.forbidden.join(', ')} — verifiably wrong.
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Benchmarks() {
 const [openId, setOpenId] = useState(data.questions[2]?.id ?? data.questions[0].id)
 const totalChars = c.sectionsByItem.reduce((a, r) => a + r.chars, 0)

 return (
    <>
      <PageHead
 eyebrow="Methodology · dataset · case studies"
 title="How the comparison was run"
      >
        <p>
          Three retrieval architectures, four questions, three trials each — 36 scored runs
 against hand-verified ground truth. Everything below is measured from the loaded
 databases, including the parts that do not favour the graph.
        </p>
      </PageHead>

      <Section label="Results"note="3 trials per question/mode">
        <CompareMatrix />
        <Legend />

        <div className="mt-6 overflow-x-auto border border-border bg-bg">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-layer text-left font-mono text-[10px] uppercase tracking-[0.14em] text-secondary">
                <th className="px-5 py-3 font-medium">Across all 12 runs</th>
                {MODES.map((m) => (
                  <th key={m} className="px-5 py-3 font-medium text-text">
                    {MODE_META[m].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-[12.5px] tabular-nums">
              {[
 ['passes', (t) => `${t.passes}/${t.runs}`, null],
 ['hallucinations', (t) => t.halluc, (t) => (t.halluc ? 'text-support-error' : '')],
 ['right answer, no citation', (t) => t.uncited, (t) => (t.uncited ? 'text-support-warning' : '')],
 ['honest refusals', (t) => t.refused, null],
 ['avg evidence chars', (t) => fmt(t.evidence), null],
 ['avg latency', (t) => `${t.latency}s`, null],
 ['tokens, 12 runs', (t) => fmt(t.tokens), null],
              ].map(([label, get, cls]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row"className="px-5 py-2.5 text-left font-normal text-secondary">
                    {label}
                  </th>
                  {MODES.map((m) => (
                    <td key={m} className={`px-5 py-2.5 ${cls?.(data.totals[m]) || 'text-text'}`}>
                      {get(data.totals[m])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section label="Keeping it fair"note="a rigged baseline proves nothing">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-serif text-lg">What both baselines get</h3>
            <ul className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-secondary">
              {[
                'The same model and settings — deepseek-v4-flash, temperature 0, reasoning off, same max_tokens.',
                'The same number of LLM calls — 2 for SQL and GraphRAG, 1 for Vector RAG.',
                'A complete schema. text-to-SQL is shown subsidiary and reporting_owner, so the multi-hop answer is reachable by joins.',
                'One repair attempt each, triggered by an exception or an empty result.',
                'The same LIMIT/fan-out guardrail, applied identically to both query languages.',
              ].map((s) => (
                <li key={s} className="flex gap-2.5">
                  <span className="text-interactive">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-serif text-lg">Bugs found in the harness itself</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
              Recorded because unnoticed they would each have produced a confident, wrong
 conclusion.
            </p>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-secondary">
              {[
                'The SQL schema doc omitted the surname-first name convention that the graph schema doc included — an asymmetry that made text-to-SQL fail for the wrong reason.',
                'A use-before-assignment made text-to-SQL score 0/12 for an entire run.',
                'The citation scorer penalised legitimate citations on questions with no ground-truth citation set, mis-flagging a correct answer as a hallucination.',
                'A 900-token answer cap truncated answers mid-citation.',
              ].map((s) => (
                <li key={s} className="flex gap-2.5">
                  <span className="text-support-warning">!</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section label="Dataset"note={`${fmt(totalChars)} characters of narrative text extracted`}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-secondary">
              Narrative sections by 10-K item
            </h3>
            <table className="mt-3 w-full border-collapse font-mono text-[11.5px] tabular-nums">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-secondary">
                  <th className="py-1.5 pr-3 font-medium">Item</th>
                  <th className="py-1.5 pr-3 font-medium">Section</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Filings</th>
                  <th className="py-1.5 text-right font-medium">Avg chars</th>
                </tr>
              </thead>
              <tbody>
                {c.sectionsByItem.map((r) => (
                  <tr
 key={r.item}
 className={`border-b border-border last:border-0 ${
 r.item === '1A' ? 'text-text' : 'text-secondary'
                    }`}
                  >
                    <td className="py-1.5 pr-3">{r.item}</td>
                    <td className="py-1.5 pr-3">{r.label}</td>
                    <td className="py-1.5 pr-3 text-right">{r.filings}</td>
                    <td className="py-1.5 text-right">{fmt(r.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-secondary">
              Pipeline timings — one month
            </h3>
            <div className="mt-3 space-y-2">
              {c.timings.map(([label, secs]) => {
 const total = c.timings.reduce((a, [, s]) => a + s, 0)
 const pct = (100 * secs) / total
 return (
                  <div key={label}>
                    <div className="flex justify-between font-mono text-[11px] tabular-nums">
                      <span className="text-secondary">{label}</span>
                      <span className="text-text">{secs.toFixed(2)}s</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden bg-layer-alt">
                      <div
 className="h-full bg-interactive"
 style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-helper">
              Embedding and the SEC-rate-limited fetch together are 78% of the pipeline. The
 fetch ceiling is external — SEC caps requests at 10/second per requester, so no
 amount of parallelism removes it.
            </p>
          </Card>
        </div>
      </Section>

      <Section label="Case studies"note="the actual query, answer and score for each question">
        <div className="mb-5 flex flex-wrap gap-2">
          {data.questions.map((q) => (
            <button
 key={q.id}
 type="button"
 onClick={() => setOpenId(q.id)}
 className={` border px-3.5 py-1.5 text-[12.5px] transition-colors ${
 openId === q.id
                  ? 'border-interactive bg-interactive-light text-interactive'
 : 'border-border bg-layer text-secondary hover:border-interactive hover:text-text'
              }`}
            >
              <span className="font-mono text-[10px] font-semibold">{q.id}</span>{' '}
              {cleanKind(q.kind)}
            </button>
          ))}
        </div>
        {data.questions
          .filter((q) => q.id === openId)
          .map((q) => (
            <CaseStudy key={q.id} q={q} />
          ))}
      </Section>

      <Section label="Where this does not support the thesis"note="reported because it matters more than the wins">
        <div className="grid gap-4 md:grid-cols-2">
          {[
 [
              'Q4 was solved by nobody — GraphRAG included',
              'The answer exists in the graph: CCO Holdings is both a Charter subsidiary and an SEC filer in its own right. GraphRAG failed because the model wrote OPTIONAL MATCH and scanned all 3,562 subsidiaries, then concluded “none exist” — a confident universal negative from a truncated scan. LLM-authored Cypher is no more reliable than LLM-authored SQL.',
            ],
 [
              'Q2 is a tie, not a win',
              'For aggregation over typed columns the graph adds nothing. text-to-SQL won outright and GraphRAG only matched it.',
            ],
 [
              'Entity resolution is the weakest link',
              'Only 3 RESOLVES_TO edges exist, because EX-21 subsidiaries carry no CIK and this slice contains few subsidiaries that are themselves filers. At scale this needs real work.',
            ],
 [
              'GraphRAG costs roughly 2× the tokens',
              'Two LLM calls plus graph facts plus text snippets, and it is the slowest of the three. Four questions over one month of filings is a demonstration, not a benchmark.',
            ],
          ].map(([title, body]) => (
            <Card key={title}>
              <h3 className="font-serif text-[17px] leading-snug">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">{body}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}
