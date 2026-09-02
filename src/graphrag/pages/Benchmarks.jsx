import { useState } from 'react'
import { Card, Dot, PageHead, Pill, Section } from '../components/Shell'
import { Attempts, CompareMatrix, Legend } from '../components/CompareMatrix'
import { MODE_META, MODES, STATUS_LABEL, fmt } from '../api'
import data from '../data/benchmark.json'
import stats from '../data/stats.json'

const c = data.corpus
const ITEM_LABEL = {
  1: 'Business',
  '1A': 'Risk Factors',
  '1B': 'Unresolved Staff Comments',
  2: 'Properties',
  3: 'Legal Proceedings',
  7: "Management's Discussion & Analysis",
  '7A': 'Market Risk',
}

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
  let html = (text || '')
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

/* Every one of the 180 attempts, unaggregated. Three dots per cell = the three attempts.
   Included because the type-level rates hide which individual questions broke. */
function OutcomeGrid({ onPick }) {
  return (
    <div className="overflow-x-auto border border-border bg-bg">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-layer text-left font-mono text-[10px] uppercase tracking-[0.14em] text-secondary">
            <th className="px-5 py-3 font-medium">Question</th>
            {MODES.map((m) => (
              <th key={m} className="px-5 py-3 font-medium text-text">
                {MODE_META[m].label}
              </th>
            ))}
            <th className="px-5 py-3 font-medium">Expected to win</th>
          </tr>
        </thead>
        <tbody>
          {data.questions.map((q, i) => {
            const newType = i === 0 || data.questions[i - 1].type !== q.type
            return (
              <tr
                key={q.id}
                className={`cursor-pointer transition-colors hover:bg-interactive-light ${
                  newType ? 'border-t border-border-strong' : 'border-t border-border'
                }`}
                onClick={() => onPick(q.id)}
              >
                <th scope="row" className="px-5 py-2 text-left font-normal">
                  <span className="font-mono text-[11px] font-semibold text-interactive">
                    {q.id}
                  </span>
                  {q.id === data.killerId && (
                    <span className="ml-2 font-mono text-[10px] text-interactive">★ killer</span>
                  )}
                  {newType && (
                    <span className="ml-2 font-mono text-[10px] text-helper">{q.kind}</span>
                  )}
                </th>
                {MODES.map((m) => (
                  <td key={m} className="whitespace-nowrap px-5 py-2">
                    <span className="flex gap-1.5">
                      {q.runs[m].trialStatuses.map((s, j) => (
                        <Dot key={j} status={s} />
                      ))}
                    </span>
                  </td>
                ))}
                <td className="whitespace-nowrap px-5 py-2 font-mono text-[10.5px] text-helper">
                  {q.expect}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CaseStudy({ q }) {
  return (
    <div className="border border-border bg-layer p-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-[11px] font-semibold text-interactive">{q.id}</span>
        <h3 className="font-serif text-lg tracking-tight">{q.kind}</h3>
        <span className="font-mono text-[10.5px] text-helper">expected: {q.expect}</span>
      </div>

      <p className="mt-3 border-l-2 border-interactive pl-4 font-serif text-[15.5px] leading-relaxed text-text">
        {q.question}
      </p>

      {q.validAccessions.length > 0 && (
        <p className="mt-2.5 font-mono text-[10.5px] leading-relaxed text-secondary">
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
                  {q.runs[m].passes}/3 attempts passed
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
  const [openId, setOpenId] = useState(data.killerId)
  const totalChars = stats.items.reduce((a, r) => a + r[2], 0)
  const pipelineTotal = stats.pipeline.reduce((a, [, s]) => a + s, 0)

  return (
    <>
      <PageHead eyebrow="Methodology · dataset · case studies" title="How the comparison was run">
        <p>
          Three retrieval architectures and twenty questions in four categories. Every question was
          asked three times of every architecture — <strong className="text-text">180 scored
          attempts</strong> against hand-verified ground truth, with all three attempts counting
          rather than the best of them.
          Two of the four categories were chosen specifically because the graph should{' '}
          <em>not</em> win them. Everything below is measured from the loaded databases, including
          the parts that go against the thesis.
        </p>
      </PageHead>

      <Section id="results"
        label="Results" note="20 questions, each asked 3 times">
        <CompareMatrix />
        <Attempts />

        <div className="mt-6 overflow-x-auto border border-border bg-bg">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-layer text-left font-mono text-[10px] uppercase tracking-[0.14em] text-secondary">
                <th className="px-5 py-3 font-medium">Across all 60 attempts</th>
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
                [
                  'right answer, no citation',
                  (t) => t.uncited,
                  (t) => (t.uncited ? 'text-support-warning' : ''),
                ],
                ['honest refusals', (t) => t.refused, null],
                ['avg evidence chars', (t) => fmt(t.evidence), null],
                ['avg latency', (t) => `${t.latency}s`, null],
                ['tokens, 60 attempts', (t) => fmt(t.tokens), null],
              ].map(([label, get, cls]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row" className="px-5 py-2.5 text-left font-normal text-secondary">
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

        <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-helper">
          {fmt(data.usage.calls)} LLM calls, {fmt(data.usage.total_tokens)} tokens total across the
          whole benchmark. GraphRAG is {(data.totals.graphrag.tokens / data.totals.vector_rag.tokens).toFixed(1)}
          × the tokens of Vector RAG and{' '}
          {(data.totals.graphrag.tokens / data.totals.text_to_sql.tokens).toFixed(1)}× text-to-SQL —
          the accuracy is bought, not free.
        </p>
      </Section>

      <Section id="every-attempt"
        label="Every attempt" note="click a row to open its case study">
        <OutcomeGrid onPick={setOpenId} />
        <Legend />
        <p className="mt-4 max-w-3xl text-[13.5px] leading-relaxed text-secondary">
          The rows worth arguing with are <strong className="text-text">T2-1, T2-3, T2-4</strong>{' '}
          (GraphRAG loses to plain SQL), <strong className="text-text">T4-2</strong> (GraphRAG scores
          zero on a question designed for it), and <strong className="text-text">T1-1</strong> through{' '}
          <strong className="text-text">T1-5</strong>, where Vector RAG — the expected winner — got
          one question of five. Each is explained at the bottom of this page.
        </p>
      </Section>

      <Section id="keeping-it-fair"
        label="Keeping it fair" note="a rigged baseline proves nothing">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-serif text-lg">What both baselines get</h3>
            <ul className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-secondary">
              {[
                'The same model and settings — deepseek-v4-flash, temperature 0, reasoning off, same max_tokens.',
                'The same number of LLM calls — 2 for SQL and GraphRAG, 1 for Vector RAG.',
                'A complete schema. text-to-SQL is shown subsidiary and reporting_owner, so even the multi-hop answers are reachable by joins.',
                'The same naming-convention hint in both schema docs, including that person names are stored surname-first.',
                'One repair attempt each, triggered by an exception or an empty result — capped at two query-writing calls, never three.',
                'The same LIMIT/fan-out guardrail, applied identically to both query languages.',
                'Two of four question types selected so that the graph is the wrong tool for them.',
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
              Recorded because, unnoticed, each would have produced a confident and wrong
              conclusion.
            </p>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-secondary">
              {[
                'The SQL schema doc omitted the surname-first name convention that the graph schema doc included — an asymmetry that made text-to-SQL fail for the wrong reason.',
                'A use-before-assignment made text-to-SQL score 0/12 for an entire run.',
                'The citation scorer penalised legitimate citations on aggregate questions that have no ground-truth citation set, mis-flagging correct answers as hallucinations.',
                'A 900-token answer cap truncated answers mid-citation, turning passes into uncited.',
                'pgvector post-filtering returned 0 of 8 rows while 164 matched, until hnsw.iterative_scan was enabled — Vector RAG had been scored on an empty retriever.',
                'A shared torch encoder segfaulted under concurrency; a shared Postgres connection interleaved across threads.',
                'T4-5 encoded one expected parent when the loaded data has three filers listing AllianceBernstein Holding L.P. in their EX-21. All three architectures were naming a genuine parent and being marked wrong. Found by inspecting a single failing attempt, fixed by accepting any verified parent, and the 180 saved answers were re-scored — no new LLM calls. It moved text-to-SQL 28→29, Vector RAG 6→9 and GraphRAG 44→45, so the defect had been understating the two baselines more than the graph.',
              ].map((s) => (
                <li key={s} className="flex gap-2.5">
                  <span className="text-support-warning">!</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-4">
          <h3 className="font-serif text-lg">How often each mode used its repair</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
            Both query-writing modes get the same allowance: if the first query throws or returns
            zero rows, the model sees the error and writes one correction. Equal budget, very
            unequal use.
          </p>
          <table className="mt-3 w-full border-collapse font-mono text-[11.5px] tabular-nums">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-secondary">
                <th className="py-1.5 pr-3 font-medium">Mode</th>
                <th className="py-1.5 pr-3 text-right font-medium">Repaired</th>
                <th className="py-1.5 pr-3 text-right font-medium">T1</th>
                <th className="py-1.5 pr-3 text-right font-medium">T2</th>
                <th className="py-1.5 pr-3 text-right font-medium">T3</th>
                <th className="py-1.5 text-right font-medium">T4</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['text-to-SQL', '7/60', '3', '0', '1', '3', 'text-secondary'],
                ['GraphRAG', '34/60', '4', '9', '6', '15', 'text-text'],
                ['Vector RAG', '0/60', '—', '—', '—', '—', 'text-helper'],
              ].map(([label, tot, ...rest]) => {
                const cls = rest.pop()
                return (
                  <tr key={label} className={`border-b border-border last:border-0 ${cls}`}>
                    <td className="py-1.5 pr-3">{label}</td>
                    <td className="py-1.5 pr-3 text-right font-semibold">{tot}</td>
                    {rest.map((v, i) => (
                      <td key={i} className="py-1.5 pr-3 text-right">
                        {v}
                        {v !== '—' && <span className="text-helper">/15</span>}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-3 text-[13.5px] leading-relaxed text-secondary">
            GraphRAG leaned on the repair <strong className="text-text">five times as often</strong>,
            and on T4 it needed one on every single attempt — the first Cypher matches
            <code className="mx-1 font-mono text-[12px]">nameNormalized</code> exactly, gets zero
            rows, and the correction frequently misses too. That is most of the gap between its
            780,500 tokens and text-to-SQL&rsquo;s 158,171.
          </p>
          <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
            The trigger is also not as neutral as it looks. An over-broad SQL join returns many
            rows, so it never trips the zero-row condition even when the answer is wrong, while an
            exact graph property match returns nothing and earns a free second try. Same rule,
            unequal benefit — in GraphRAG&rsquo;s favour.
          </p>
        </Card>
      </Section>

      <Section id="dataset"
        label="Dataset" note={`${fmt(totalChars)} characters of narrative text extracted`}>
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
                {stats.items.map(([item, filings, , avg]) => (
                  <tr
                    key={item}
                    className={`border-b border-border last:border-0 ${
                      item === '1A' ? 'text-text' : 'text-secondary'
                    }`}
                  >
                    <td className="py-1.5 pr-3">{item}</td>
                    <td className="py-1.5 pr-3">{ITEM_LABEL[item]}</td>
                    <td className="py-1.5 pr-3 text-right">{fmt(filings)}</td>
                    <td className="py-1.5 text-right">{fmt(avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              Only Item 1A is embedded — {fmt(c.postgres.chunks)} chunks over{' '}
              {fmt(stats.items.find((r) => r[0] === '1A')[1])} risk-factor sections. Embedding all
              seven items would be roughly 4× the vectors for no gain on these questions.
            </p>
          </Card>

          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-secondary">
              Pipeline timings — twelve monthly feeds, minutes
            </h3>
            <div className="mt-3 space-y-2">
              {stats.pipeline.map(([label, mins]) => (
                <div key={label}>
                  <div className="flex justify-between font-mono text-[11px] tabular-nums">
                    <span className="text-secondary">{label}</span>
                    <span className="text-text">{mins} min</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden bg-layer-alt">
                    <div
                      className="h-full bg-interactive"
                      style={{ width: `${(100 * mins) / pipelineTotal}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-helper">
              Document fetch and embedding are{' '}
              {Math.round(
                (100 *
                  stats.pipeline
                    .filter(([l]) => /fetch \d|embed/.test(l))
                    .reduce((a, [, s]) => a + s, 0)) /
                  pipelineTotal,
              )}
              % of the {Math.round(pipelineTotal)}-minute pipeline. The fetch ceiling is external —
              SEC caps requests at {stats.measured.secRateLimit}/second per requester, so no amount
              of parallelism removes it. Embedding ran at {stats.measured.embedRate} chunks/s on a
              16-vCPU Graviton host.
            </p>
          </Card>
        </div>
      </Section>

      <Section id="case-studies"
        label="Case studies" note="the actual query, answer and score for each question">
        <div className="mb-5 space-y-2">
          {data.types.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-2">
              <span className="w-full font-mono text-[10px] uppercase tracking-[0.14em] text-helper sm:w-44 sm:shrink-0">
                {t.id} · {t.kind}
              </span>
              {data.questions
                .filter((q) => q.type === t.id)
                .map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setOpenId(q.id)}
                    className={`cursor-pointer border px-3 py-1.5 font-mono text-[11.5px] transition-colors ${
                      openId === q.id
                        ? 'border-interactive bg-interactive-light text-interactive'
                        : 'border-border bg-layer text-secondary hover:border-interactive hover:text-text'
                    }`}
                  >
                    {q.id}
                    {q.id === data.killerId && ' ★'}
                  </button>
                ))}
            </div>
          ))}
        </div>
        {data.questions
          .filter((q) => q.id === openId)
          .map((q) => (
            <CaseStudy key={q.id} q={q} />
          ))}
      </Section>

      <Section
        id="caveats"
        label="Where this does not support the thesis"
        note="reported because it matters more than the wins"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            [
              'Vector RAG lost the category it was supposed to win — 3/15',
              'T1 asks a single company what it disclosed about one topic: exactly the shape similarity search is for, and on a single month of filings it passed. At 508,714 chunks from 5,210 companies it collapsed. Asked about Moderna it returned Entegris, Hayward, Open Text, Arrowhead and NVIDIA — all genuinely about supply chain, none Moderna. A company name is not a strong enough signal in embedding space to outweigh topical similarity. To its credit it refused honestly on 12 of the 15 attempts rather than answering about the wrong company.',
            ],
            [
              'Plain SQL beat GraphRAG at entity resolution — 14/15 vs 9/15',
              'T4 was written for the graph and the graph came second. The failure is mundane: the model wrote Subsidiary {nameNormalized: "aep texas inc"} while the loader’s normalise step strips corporate suffixes, so the stored key is "aep texas". Zero rows, honest refusal, 0/3 on T4-2. Across the category text-to-SQL took 4 of 5 questions outright to GraphRAG’s 2. Postgres won because ILIKE %aep texas% is forgiving in a way an exact property match is not. LLM-authored Cypher is no more reliable than LLM-authored SQL, and a normalised join key is a liability when the model cannot see it.',
            ],
            [
              'GraphRAG is the wrong tool for aggregation — 6/15',
              'On T2 text-to-SQL was perfect, 15/15. GraphRAG got two of five. On "most common jurisdiction of incorporation" it grouped by company instead of jurisdiction, returned per-company counts, and reported Delaware with 2,415 — the count for one company, not the 62,504 across the corpus. Right entity, wrong number, and it attached 190 accession numbers to an answer that needed none. For counting over typed columns the graph adds nothing and the extra hop adds a place to go wrong.',
            ],
            [
              'The accuracy is bought with tokens and latency',
              `GraphRAG spent ${fmt(data.totals.graphrag.tokens)} tokens against ${fmt(data.totals.text_to_sql.tokens)} for text-to-SQL and ${fmt(data.totals.vector_rag.tokens)} for Vector RAG, at ${data.totals.graphrag.latency}s average latency versus ${data.totals.vector_rag.latency}s. It is 6.6× the token cost of similarity search for 5× the passes — worth it here, but that ratio is a property of these questions, not a law. The reverse cost also matters: text-to-SQL averaged 92s on T3 and peaked at 445s for a single SELECT, because the model joins subsidiary × filing_section × reporting_owner without narrowing first. The live playground therefore runs with a 45s statement timeout, which those questions hit.`,
            ],
            [
              'Two categories out of four, not a general win',
              'GraphRAG swept T1 and T3 (30/30) and lost or tied the other two. The honest summary is not "graphs beat vectors" but "structural retrieval wins when the question needs identity resolved or facts joined across documents, and loses when the question is a GROUP BY".',
            ],
            [
              'The hallucinations were all one failure mode',
              'Only two of the 180 attempts stated something verifiably false, both text-to-SQL on T3. Both were surname collisions: asked about Monica Lozano it reported five companies including Mondelez and Ternium — those are Mariano and Santiago Lozano. Asked about William Giles it reported ten companies. This is the exact failure the graph exists to prevent, and it is worth noting the model was fluent and confident both times.',
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
