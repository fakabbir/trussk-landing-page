import { useState } from 'react'
import data from '../data/benchmark.json'

const c = data.corpus
const n = (x) => Number(x).toLocaleString()

function Code({ children, label, height = 'max-h-72' }) {
  return (
    <div>
      {label && (
        <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-helper">
          {label}
        </p>
      )}
      <pre
        className={`overflow-auto ${height} border border-border bg-layer p-3 font-mono text-[11px] leading-relaxed whitespace-pre text-secondary`}
      >
        {children}
      </pre>
    </div>
  )
}

function Stage({ num, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-baseline gap-4 px-5 py-4 text-left
                    transition-colors hover:bg-interactive-light
                    focus-visible:bg-interactive-light ${open ? 'bg-layer' : ''}`}
      >
        <span className="w-8 shrink-0 font-mono text-sm font-semibold tabular-nums text-interactive">
          {num}
        </span>
        <span className="flex-1">
          <span className="block text-[15.5px] font-semibold text-text">{title}</span>
          <span className="mt-0.5 block text-[13px] text-secondary">{subtitle}</span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 font-mono text-[13px] leading-none text-interactive"
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="px-5 pb-7 sm:pl-[4.25rem]">{children}</div>}
    </div>
  )
}

function Flow({ items }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[11px]">
      {items.map((s, i) => (
        <span key={i} className="flex items-center gap-2">
          <span
            className={
              i === items.length - 1
                ? 'border border-interactive bg-interactive-light px-2 py-1 text-interactive'
                : 'border border-border bg-layer px-2 py-1 text-secondary'
            }
          >
            {s}
          </span>
          {i < items.length - 1 && <span className="text-helper">→</span>}
        </span>
      ))}
    </div>
  )
}

function Fact({ children }) {
  return (
    <p className="mt-4 border-l-2 border-interactive bg-interactive-light/40 py-2 pl-3 text-[13px] leading-relaxed text-text">
      {children}
    </p>
  )
}

const RSS_SAMPLE = `<item>
  <title>Aptevo Therapeutics Inc. (0001671584) (Filer)</title>
  <link>https://www.sec.gov/Archives/edgar/data/1671584/…-index.htm</link>
  <description>DEF 14A</description>
  <edgar:xbrlFiling>
    <edgar:companyName>Aptevo Therapeutics Inc.</edgar:companyName>
    <edgar:formType>DEF 14A</edgar:formType>
    <edgar:filingDate>08/31/2026</edgar:filingDate>
    <edgar:cikNumber>0001671584</edgar:cikNumber>
    <edgar:accessionNumber>0001193125-26-376763</edgar:accessionNumber>
    <edgar:acceptanceDatetime>20260831172959</edgar:acceptanceDatetime>
    <edgar:period>20260922</edgar:period>
    <edgar:assignedSic>2834</edgar:assignedSic>
    <edgar:fiscalYearEnd>1231</edgar:fiscalYearEnd>
    <edgar:xbrlFiles>
      <edgar:xbrlFile sequence="1" file="apvo-20260831.htm"
                      type="DEF 14A" size="831626" … />
      <edgar:xbrlFile sequence="2" file="img105157344_0.jpg"
                      type="GRAPHIC" size="2662537" … />
      …
    </edgar:xbrlFiles>
  </edgar:xbrlFiling>
</item>`

const EX21_SAMPLE = `<P STYLE="…"><B>SUBSIDIARIES OF THE REGISTRANT</B></P>
<TABLE>
  <TR><TD>Name</TD><TD>Jurisdiction of Incorporation</TD></TR>
  <TR><TD>Apple Asia Limited</TD><TD>Hong Kong</TD></TR>
  <TR><TD>Braeburn Capital, Inc.</TD><TD>Nevada</TD></TR>
  …
</TABLE>
<P>* Pursuant to Item 601(b)(21)(ii) of Regulation S-K, the names of
   other subsidiaries are omitted because…</P>`

const F345_SAMPLE = `ACCESSION_NUMBER     | RPTOWNERCIK | RPTOWNERNAME        | RPTOWNER_RELATIONSHIP
0001493152-26-014456 | 0002125911  | Ong Sie Hou Raymond | Director

# RPTOWNER_RELATIONSHIP is comma-joined and multi-valued:
#   "Director,Officer"                 -> two edges
#   "Director,Officer,TenPercentOwner" -> three edges
# Names are SURNAME FIRST: 'LOZANO MONICA C', not 'Monica Lozano'.`

const SECTION_ROW = `{
 "accession_number": "0001477932-25-007253",
 "item_code": "1",
 "item_title": "Business",
 "section_text": "Business.\\nWe were incorporated in the State of
     Nevada on March 22, 2011 under the name Lightcollar, Inc. …",
 "char_len": 9017,
 "company_cik": 1520118,
 "filing_date": "2025-09-30"
}`

const SCHEMA = `filing_section (
  accession_number  char(20) → filing,   -- the provenance key
  item_code         text,                -- '1', '1A', '7', …
  section_text      text,                -- the full narrative
  char_len          integer,
  company_cik       integer,
  filing_date       date,
  PRIMARY KEY (accession_number, item_code)
)
CREATE INDEX … USING GIN (to_tsvector('english', section_text));

section_chunk (
  chunk_id          bigserial,
  accession_number  char(20) → filing,   -- same provenance key
  item_code         text,
  company_cik       integer,
  chunk_index       integer,
  chunk_text        text,                -- 1,400 chars, 200 overlap
  embedding         vector(384)          -- pgvector
)
CREATE INDEX … USING hnsw (embedding vector_cosine_ops);`

const GRAPH = `(:Company   {cik, name, sic, sicDescription})
(:Person    {cik, name})                    -- insiders, Forms 3/4/5
(:Subsidiary{nameNormalized, name, jurisdiction})   -- no CIK exists
(:AuditFirm {firmKey, name, pcaobFirmId})
(:Filing    {accessionNumber, formType, filingDate,
             hasRiskFactors, riskFactorChars})

(:Company)-[:FILED]->(:Filing)
(:Person)-[:OFFICER_OF   {filingId, title}]->(:Company)
(:Person)-[:DIRECTOR_OF  {filingId}]->(:Company)
(:Person)-[:OWNS_SHARES  {filingId, basis}]->(:Company)
(:Subsidiary)-[:SUBSIDIARY_OF {filingId, jurisdiction}]->(:Company)
(:Company)-[:AUDITED_BY  {filingId, fiscalYear}]->(:AuditFirm)
(:Subsidiary)-[:RESOLVES_TO]->(:Company)`

const CYPHER = `MATCH (p:Person {cik: 1179864})-[:OFFICER_OF|DIRECTOR_OF]->(c:Company)
WITH DISTINCT c
MATCH (c)-[:FILED]->(f:Filing)
WHERE f.formType = '10-K' AND f.hasRiskFactors = true
RETURN c.cik AS companyCik, c.name AS companyName,
       f.accessionNumber AS accessionNumber`

const EXPAND = `UNWIND $ciks AS wanted
MATCH (c:Company {cik: wanted})
OPTIONAL MATCH (s:Subsidiary)-[so:SUBSIDIARY_OF]->(c)
WITH c, count(DISTINCT s) AS subsidiaryCount,
     collect(DISTINCT s.name)[..12] AS subsidiarySample
OPTIONAL MATCH (c)-[:FILED]->(f:Filing) WHERE f.hasRiskFactors
RETURN c.cik, c.name, subsidiaryCount, subsidiarySample,
       collect(DISTINCT f.accessionNumber) AS riskFilingAccessions`

const SNIPPET_SQL = `-- The graph decided WHICH filing to read, so this is an exact
-- primary-key lookup, not a search.
SELECT section_text
FROM filing_section
WHERE accession_number = $1 AND item_code = '1A';
-- then slice a ±450-char window around each matched term`

export function Pipeline() {
  return (
    <div className="border border-border bg-bg">
      <div className="border-b border-border bg-layer px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-interactive">
          Pipeline documentation
        </p>
        <h3 className="mt-1 font-serif text-xl tracking-tight text-text">
          From raw SEC filings to a scored answer
        </h3>
        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-secondary">
          Every figure below is measured from the loaded corpus. Expand a stage to see the
          real input, the transform applied, and what lands in the databases.
        </p>
      </div>

      <div>
        {/* ───────────────────────── 01 ───────────────────────── */}
        <Stage
          num="01"
          title="Source: the monthly XBRL RSS feed"
          subtitle="One file per month. The filing spine — and nothing else."
          defaultOpen
        >
          <Flow items={['sec.gov/Archives/edgar/monthly', '12 feeds · 762 MB XML', '175,531 <item> elements']} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Code label="raw input — one <item>, verbatim">{RSS_SAMPLE}</Code>
            <div>
              <p className="text-[13.5px] leading-relaxed text-secondary">
                Each <code className="font-mono text-[12px] text-text">&lt;item&gt;</code> carries
                submission metadata plus a <strong className="text-text">complete document
                manifest</strong>. That manifest is how EX-21 exhibits are located without
                guessing filenames — you read the <code className="font-mono text-[12px] text-text">type</code> attribute.
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-y-1.5 font-mono text-[12px] tabular-nums">
                {[
                  ['feeds parsed', '12'],
                  ['feed items', n(175531)],
                  ['unique filings', n(c.postgres.filings)],
                  ['unique companies', n(c.postgres.companies)],
                  ['document manifest rows', n(c.postgres.documents)],
                  ['10-K / 10-K/A', n(6184)],
                  ['EX-21 exhibits', n(4409)],
                ].map(([k, v]) => (
                  <div key={k} className="col-span-2 flex justify-between gap-4 border-b border-border py-1">
                    <dt className="text-secondary">{k}</dt>
                    <dd className="font-semibold text-text">{v}</dd>
                  </div>
                ))}
              </dl>
              <Fact>
                The feed contains <strong>no ownership edges and no narrative text</strong>. Two
                further sources supply those — which is the whole reason a graph is needed.
              </Fact>
            </div>
          </div>
        </Stage>

        {/* ───────────────────────── 02 ───────────────────────── */}
        <Stage
          num="02"
          title="Selective fetch, rate-limited"
          subtitle="10,592 documents pulled — deliberately not the whole archive"
        >
          <Flow items={['manifest', 'filter to 10-K primary + EX-21', 'curl @ 8 req/s', '10,592 docs · 19.7 GB']} />
          <p className="max-w-3xl text-[13.5px] leading-relaxed text-secondary">
            Fetching all 1.9M manifest documents would take ~67 hours at the SEC&apos;s limit. Only
            two kinds are actually needed: <strong className="text-text">10-K primary documents</strong>{' '}
            (for Item 1A risk text and the <code className="font-mono text-[12px]">dei:Auditor*</code>{' '}
            cover-page tags) and <strong className="text-text">EX-21 exhibits</strong> (for
            subsidiary lists). The stage is resumable — anything already on disk is skipped.
          </p>
          <Fact>
            SEC caps requests at <strong>10/second per requester</strong> and blocks automated
            tools that exceed it. This is a hard external ceiling: no amount of parallelism
            removes it, so the only real lever is fetching less.
          </Fact>
        </Stage>

        {/* ───────────────────────── 03 ───────────────────────── */}
        <Stage
          num="03"
          title="Preprocessing: HTML → structured text"
          subtitle="Item splitting, EX-21 table parsing, auditor tags"
        >
          <Flow items={['10-K HTML', 'block-aware text', 'ITEM heading regex', 'longest body per item code']} />
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-text">
                Splitting the 10-K into items
              </h4>
              <ol className="mt-2 space-y-2 text-[13px] leading-relaxed text-secondary">
                <li>
                  <span className="font-mono text-interactive">1.</span> lxml walk emitting a
                  newline at every block element, so headings survive as their own lines
                </li>
                <li>
                  <span className="font-mono text-interactive">2.</span> regex every{' '}
                  <code className="font-mono text-[12px] text-text">ITEM &lt;n&gt;&lt;letter&gt;</code>{' '}
                  heading and slice between consecutive matches
                </li>
                <li>
                  <span className="font-mono text-interactive">3.</span> for each item code, keep
                  the occurrence with the <strong className="text-text">longest body</strong>
                </li>
                <li>
                  <span className="font-mono text-interactive">4.</span> discard anything under
                  800 chars
                </li>
              </ol>
              <Fact>
                Step 3 is the trick: a table of contents lists every item a few characters apart,
                so the longest slice is always the real section. No need to find the TOC.
              </Fact>
            </div>
            <div className="space-y-4">
              <Code label="raw EX-21, as filed" height="max-h-52">{EX21_SAMPLE}</Code>
              <p className="text-[13px] leading-relaxed text-secondary">
                Tables are parsed to <span className="text-text">name + jurisdiction</span>, with a
                line-based fallback for free-form exhibits. Subsidiaries have{' '}
                <strong className="text-text">no CIK</strong>, so they become name-keyed nodes —
                entity resolution is on you, and the lists are{' '}
                <strong className="text-text">legally incomplete</strong> under Item 601(b)(21)(ii).
              </p>
            </div>
          </div>
        </Stage>

        {/* ───────────────────────── 04 ───────────────────────── */}
        <Stage
          num="04"
          title="The only source of ownership edges"
          subtitle="Form 3/4/5 quarterly datasets — a separate download"
        >
          <Flow items={['form345 zips', 'SUBMISSION + REPORTINGOWNER', 'relationship flags', `${n(c.postgres.ownerRows)} edges`]} />
          <Code label="raw TSV, plus the two conventions that matter">{F345_SAMPLE}</Code>
          <Fact>
            Names being surname-first is not trivia. A query written as{' '}
            <code className="font-mono text-[12px]">ILIKE &apos;%Monica Lozano%&apos;</code> finds
            nothing; <code className="font-mono text-[12px]">ILIKE &apos;%lozano%&apos;</code> finds{' '}
            <strong>three different people</strong> — Monica C (Apple, Bank of America, Target),
            Mariano (Mondelez) and Santiago (Ternium). That single fact is what separates the
            graph from the SQL baseline on the hardest question.
          </Fact>
        </Stage>

        {/* ───────────────────────── 05 ───────────────────────── */}
        <Stage
          num="05"
          title="Storage: Postgres is the system of record"
          subtitle="Relational + full-text + vector, one provenance key throughout"
        >
          <Flow items={['staging JSONL', 'COPY', 'Postgres 17 + pgvector 0.8.2', 'HNSW built after load']} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Code label="the two tables the whole comparison turns on">{SCHEMA}</Code>
            <div>
              <Code label="one staged section row" height="max-h-44">{SECTION_ROW}</Code>
              <dl className="mt-4 grid grid-cols-2 gap-y-1 font-mono text-[12px] tabular-nums">
                {[
                  ['filing', n(c.postgres.filings)],
                  ['filing_document', n(c.postgres.documents)],
                  ['filing_section', n(c.postgres.sections)],
                  ['section_chunk', n(c.postgres.chunks)],
                  ['subsidiary', n(c.postgres.subsidiaries)],
                  ['reporting_owner', n(c.postgres.ownerRows)],
                ].map(([k, v]) => (
                  <div key={k} className="col-span-2 flex justify-between gap-4 border-b border-border py-1">
                    <dt className="text-secondary">{k}</dt>
                    <dd className="font-semibold text-text">{v}</dd>
                  </div>
                ))}
              </dl>
              <Fact>
                <code className="font-mono text-[12px]">accession_number</code> is on every table.
                It is the join key <em className="not-italic text-text">and</em> the provenance
                stamp — which is what makes a graph hop resolvable to an exact passage.
              </Fact>
            </div>
          </div>
        </Stage>

        {/* ───────────────────────── 06 ───────────────────────── */}
        <Stage
          num="06"
          title="Storage: Neo4j is a projection of Postgres"
          subtitle="filingId on every single edge"
        >
          <Flow items={['Postgres', 'parameterised UNWIND', `Neo4j · ${n(c.neo4j.edges)} edges`]} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Code label="node labels and relationships">{GRAPH}</Code>
            <div>
              <p className="text-[13.5px] leading-relaxed text-secondary">
                Stage 06 reads <strong className="text-text">only from Postgres</strong>, never
                from the staging files. The graph can therefore be rebuilt from scratch in
                minutes without re-fetching a single document.
              </p>
              <Fact>
                Every relationship carries <code className="font-mono text-[12px]">filingId</code>.
                A traversal result is not &ldquo;these entities are connected&rdquo; but
                &ldquo;connected <em className="not-italic text-text">according to document X</em>&rdquo; —
                point-in-time correct, auditable, and supersedable when an amendment restates it.
              </Fact>
              <p className="mt-4 text-[13px] leading-relaxed text-secondary">
                <code className="font-mono text-[12px] text-text">:Filing</code> nodes also carry{' '}
                <code className="font-mono text-[12px]">hasRiskFactors</code> and{' '}
                <code className="font-mono text-[12px]">riskFactorChars</code>, so a Cypher query
                can find which filings actually have Item 1A text <em className="not-italic">before</em>{' '}
                asking Postgres for it.
              </p>
            </div>
          </div>
        </Stage>

        {/* ───────────────────────── 07 ───────────────────────── */}
        <Stage
          num="07"
          title="How a question is answered"
          subtitle="The three architectures, step by step"
          defaultOpen
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-text">
                text-to-SQL
              </h4>
              <Flow items={['question + full schema', 'LLM writes SQL', 'execute (1 repair attempt)', 'answer from rows']} />
              <p className="max-w-3xl text-[13px] leading-relaxed text-secondary">
                Shown the complete schema including <code className="font-mono text-[12px]">subsidiary</code>{' '}
                and <code className="font-mono text-[12px]">reporting_owner</code>, so the multi-hop
                answer <em className="not-italic text-text">is</em> reachable by joins. What it must
                do unaided is pick the join path and decode the name convention.
              </p>
            </div>

            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-text">
                Vector RAG
              </h4>
              <Flow items={['question', 'MiniLM → 384-dim', 'HNSW cosine top-k', 'answer from chunks']} />
              <p className="max-w-3xl text-[13px] leading-relaxed text-secondary">
                Retrieval driven purely by similarity to the question. Structurally unable to
                retrieve a fact that lives in a different document type, no matter how good the
                embedding model is.
              </p>
            </div>

            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-interactive">
                GraphRAG — two stages, and the second is deterministic
              </h4>
              <Flow items={['question', 'LLM plans hops', 'system expands entities', 'exact text by filing_id', 'answer']} />
              <div className="grid gap-4 lg:grid-cols-3">
                <Code label="1 · LLM writes stage-1 Cypher (entities only)" height="max-h-52">{CYPHER}</Code>
                <Code label="2 · system expands each entity COMPLETELY" height="max-h-52">{EXPAND}</Code>
                <Code label="3 · exact passage, by primary key" height="max-h-52">{SNIPPET_SQL}</Code>
              </div>
              <Fact>
                Step 2 exists because an LLM-authored <code className="font-mono text-[12px]">LIMIT 50</code>{' '}
                on a fan-out traversal lets one company&apos;s hundreds of subsidiaries consume the
                whole budget — the model then reports &ldquo;only one company found&rdquo;. The LLM
                decides <em className="not-italic text-text">which</em> entities matter; the system
                retrieves them completely.
              </Fact>
            </div>
          </div>
        </Stage>
      </div>
    </div>
  )
}
