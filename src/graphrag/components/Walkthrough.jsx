import { useState } from 'react'

/* One query, traced end to end through both architectures.
   Every number here is measured against the loaded 2025-09..2026-08 corpus. */

const QUESTION =
  'Monica Lozano holds an insider role at more than one company in this dataset. ' +
  'For every company where she is an officer or director, list that company’s ' +
  'disclosed subsidiaries and summarise the cybersecurity risks that company ' +
  'reported in its 10-K risk factors.'

const FACTS = [
  {
    n: '0',
    of: 'of 5,210 Item 1A sections contain the string "lozano"',
    body:
      'Her name exists only in Form 3/4/5 ownership filings — a different document type, ' +
      'never embedded alongside risk-factor prose. There is no chunk for a similarity ' +
      'search to find.',
  },
  {
    n: '3',
    of: 'distinct people share the surname',
    body:
      'Monica C (Apple, Bank of America, Target), Mariano (Mondelez) and Santiago ' +
      '(Ternium). A surname match returns all three; only CIK separates them.',
  },
  {
    n: '1 / 151',
    of: 'subsidiary names appear in their parent’s own risk factors',
    body:
      'Ownership and risk are written in separate documents by separate teams. The two ' +
      'facts the question needs are 99.3% disjoint.',
  },
]

const VECTOR_STEPS = [
  {
    label: 'embed the question',
    detail: 'all-MiniLM-L6-v2 → a single 384-dim vector',
    ok: true,
  },
  {
    label: 'HNSW cosine search, top-8',
    detail:
      'Returns the 8 chunks nearest the question vector. Nearest in embedding space means ' +
      'nearest in wording — it cannot mean "belongs to a company she governs", because no ' +
      'chunk encodes that.',
    ok: true,
  },
  {
    label: 'chunks about "insider", "director", "cybersecurity risk"',
    detail:
      'Surface-word neighbours of the question. On the January corpus the same query ' +
      'returned Cannagistics (matched "logistics") and Executive Network Partnering Corp ' +
      '(matched the word "Executive").',
    ok: false,
  },
  {
    label: 'answer',
    detail:
      'The honest outcome is a refusal: "the excerpts do not mention Monica Lozano." The ' +
      'dishonest outcome is naming whichever companies did surface.',
    ok: false,
  },
]

const GRAPH_STEPS = [
  {
    n: '1',
    title: 'Resolve identity, not text',
    code: `MATCH (p:Person {cik: 1179864})-[:OFFICER_OF|DIRECTOR_OF]->(c:Company)
MATCH (c)-[:FILED]->(f:Filing)
WHERE f.formType = '10-K' AND f.hasRiskFactors = true
RETURN c.cik AS companyCik, c.name AS companyName,
       f.accessionNumber AS accessionNumber`,
    note:
      'Keyed on CIK 1179864, so Mariano and Santiago Lozano are excluded structurally — ' +
      'not by hoping the model notices the middle initial.',
    result: '3 rows',
  },
  {
    n: '2',
    title: 'Expand each entity completely',
    code: `UNWIND [70858, 320193, 27419] AS wanted
MATCH (c:Company {cik: wanted})
OPTIONAL MATCH (s:Subsidiary)-[:SUBSIDIARY_OF]->(c)
RETURN c.name, count(DISTINCT s) AS subsidiaryCount,
       collect(DISTINCT s.name)[..12] AS sample`,
    note:
      'Deterministic, not LLM-authored. An LLM writing LIMIT 50 over a fan-out lets one ' +
      'company’s subsidiaries consume the budget and silently drops the others.',
    result: 'Bank of America 55 · Apple 18 · Target 6',
  },
  {
    n: '3',
    title: 'Fetch the exact passage by filing_id',
    code: `SELECT section_text
FROM filing_section
WHERE accession_number = ANY($1) AND item_code = '1A';
-- $1 = the three accessions the traversal returned`,
    note:
      'A primary-key lookup, not a search. The graph already decided which documents are ' +
      'in scope, so there is nothing to rank and nothing to miss.',
    result: '3 filings · ±450-char windows around "cyber"',
  },
]

const COMPANIES = [
  { name: 'BANK OF AMERICA CORP', cik: 70858, subs: 55, acc: '0000070858-26-000157' },
  { name: 'Apple Inc.', cik: 320193, subs: 18, acc: '0000320193-25-000079' },
  { name: 'TARGET CORP', cik: 27419, subs: 6, acc: '0000027419-26-000016' },
]

function Code({ children }) {
  return (
    <pre className="overflow-x-auto border border-border bg-layer p-3 font-mono text-[11px] leading-relaxed whitespace-pre text-secondary">
      {children}
    </pre>
  )
}

export function Walkthrough() {
  const [lane, setLane] = useState('graph')

  return (
    <div className="border border-border bg-bg">
      {/* the question */}
      <div className="border-b border-border bg-layer px-5 py-5">
        <p className="font-mono text-[10.5px] uppercase sm:text-[10px] tracking-[0.16em] text-interactive">
          One query, traced through both architectures
        </p>
        <p className="mt-2.5 max-w-4xl border-l-2 border-interactive pl-4 font-serif text-[16.5px] leading-relaxed text-text">
          {QUESTION}
        </p>
      </div>

      {/* why it is hard — three measured facts */}
      <div className="grid border-b border-border md:grid-cols-3">
        {FACTS.map((f, i) => (
          <div
            key={f.of}
            className={`px-5 py-5 ${i < FACTS.length - 1 ? 'border-b border-border md:border-b-0 md:border-r' : ''}`}
          >
            <p className="font-serif text-3xl tabular-nums text-interactive">{f.n}</p>
            <p className="mt-1 font-mono text-[10.5px] uppercase leading-snug tracking-wider text-helper">
              {f.of}
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed text-secondary">{f.body}</p>
          </div>
        ))}
      </div>

      {/* lane switch */}
      <div className="flex border-b border-border">
        {[
          ['vector', 'Why Vector RAG cannot answer it'],
          ['graph', 'How GraphRAG resolves it'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setLane(key)}
            aria-pressed={lane === key}
            className={`flex-1 cursor-pointer px-5 py-3.5 text-left text-[13.5px] font-semibold transition-colors ${
              lane === key
                ? 'bg-interactive-light text-interactive'
                : 'text-secondary hover:bg-layer hover:text-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── vector lane ─────────────────────────────────────────────── */}
      {lane === 'vector' && (
        <div className="px-4 py-6 sm:px-5">
          <ol className="space-y-0">
            {VECTOR_STEPS.map((s, i) => (
              <li key={s.label} className="flex gap-4 border-b border-border py-3.5 last:border-0">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[11px] font-semibold ${
                    s.ok
                      ? 'bg-layer-alt text-secondary'
                      : 'bg-support-error/10 text-support-error'
                  }`}
                >
                  {s.ok ? i + 1 : '×'}
                </span>
                <div>
                  <p
                    className={`text-[14px] font-semibold ${
                      s.ok ? 'text-text' : 'text-support-error'
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-secondary">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-l-2 border-support-error bg-support-error/5 py-2.5 pl-3 text-[13.5px] leading-relaxed text-text">
            <strong>This is not a tuning problem.</strong> A better embedding model, smaller
            chunks or a higher <code className="font-mono text-[12px]">k</code> cannot help: the
            three facts the question needs live in three separate documents, so no chunk
            contains the combination. The ceiling is the corpus, not the retriever.
          </p>
        </div>
      )}

      {/* ── graph lane ──────────────────────────────────────────────── */}
      {lane === 'graph' && (
        <div className="px-4 py-6 sm:px-5">
          <div className="space-y-5">
            {GRAPH_STEPS.map((s) => (
              <div key={s.n} className="border-b border-border pb-5 last:border-0 last:pb-0">
                {/* wraps below sm: "Bank of America 55 · Apple 18 · Target 6"
                    with ml-auto shrink-0 pushed the page past 390px */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                  <span className="font-mono text-sm font-semibold text-interactive">{s.n}</span>
                  <h4 className="text-[15px] font-semibold text-text">{s.title}</h4>
                  <span className="border border-interactive bg-interactive-light px-2 py-0.5 font-mono text-[10.5px] text-interactive sm:ml-auto">
                    {s.result}
                  </span>
                </div>
                <div className="mt-3 min-w-0 sm:pl-7">
                  <Code>{s.code}</Code>
                  <p className="mt-2 text-[13px] leading-relaxed text-secondary">{s.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* the result */}
          <div className="mt-6 border border-interactive">
            <p className="border-b border-interactive bg-interactive-light px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-interactive">
              Result — three companies, provenance attached
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse font-mono text-[12px] tabular-nums">
                <thead>
                  <tr className="border-b border-border text-left text-[10.5px] uppercase sm:text-[10px] tracking-wider text-helper">
                    <th className="px-4 py-2 font-medium">Company</th>
                    <th className="px-4 py-2 font-medium">CIK</th>
                    <th className="px-4 py-2 text-right font-medium">Subsidiaries</th>
                    <th className="px-4 py-2 font-medium">Risk-factor filing</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPANIES.map((co) => (
                    <tr key={co.cik} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-semibold text-text">{co.name}</td>
                      <td className="px-4 py-2 text-secondary">{co.cik}</td>
                      <td className="px-4 py-2 text-right text-text">{co.subs}</td>
                      <td className="px-4 py-2 text-interactive">{co.acc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-4 py-3 text-[13px] leading-relaxed text-secondary">
              Every claim is traceable to an accession number, so the answer can be audited
              against the filing. Mondelez and Ternium — the other two Lozanos — never enter
              the result set, because identity was resolved on CIK before any text was read.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
