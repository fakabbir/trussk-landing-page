import { PageHead, Section } from '../components/Shell'
import s from '../data/stats.json'

const n = (x) => Number(x).toLocaleString()
const mb = (b) => `${(b / 1048576).toFixed(0)} MB`
const gb = (b) => `${(b / 1073741824).toFixed(2)} GB`

/* ── primitives ─────────────────────────────────────────────────────────── */

function Stat({ value, label, note }) {
  return (
    <div className="border border-border bg-bg p-5">
      <p className="font-serif text-3xl tabular-nums leading-none text-interactive">{value}</p>
      <p className="mt-2 text-[13px] font-medium leading-snug text-text">{label}</p>
      {note && <p className="mt-1 font-mono text-[10.5px] leading-snug text-helper">{note}</p>}
    </div>
  )
}

/** Horizontal bars. Deliberately not a chart library: one encoding, one colour,
 *  values always printed so the bar is a comparison aid rather than the data. */
function Bars({ rows, unit = '', max: forcedMax, fmt = n, highlight }) {
  const max = forcedMax ?? Math.max(...rows.map((r) => r[1]))
  return (
    <div className="space-y-1.5">
      {rows.map(([label, v]) => {
        const hot = highlight && highlight(label, v)
        return (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`truncate text-[12.5px] ${hot ? 'font-semibold text-text' : 'text-secondary'}`}
                  title={label}
                >
                  {label}
                </span>
              </div>
              <div className="mt-1 h-[5px] w-full bg-layer-alt">
                <div
                  className={hot ? 'h-full bg-interactive' : 'h-full bg-border-strong'}
                  style={{ width: `${Math.max(1.2, (100 * v) / max)}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-text">
              {fmt(v)}
              {unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Panel({ title, note, children, className = '' }) {
  return (
    <div className={`border border-border bg-bg ${className}`}>
      <div className="border-b border-border bg-layer px-4 py-3">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-text">
          {title}
        </h3>
        {note && <p className="mt-0.5 font-mono text-[10.5px] text-helper">{note}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Table({ head, rows, alignRight = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-[11.5px] tabular-nums">
        <thead>
          <tr className="border-b border-border text-left text-[10.5px] uppercase sm:text-[10px] tracking-wider text-helper">
            {head.map((h, i) => (
              <th key={h} className={`py-1.5 pr-3 font-medium ${alignRight.includes(i) ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-border last:border-0">
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`py-1.5 pr-3 ${alignRight.includes(ci) ? 'text-right text-text' : 'text-secondary'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── page ───────────────────────────────────────────────────────────────── */

export default function Statistics() {
  const t = s.totals
  const bigFour = new Set(['Ernst & Young LLP', 'PricewaterhouseCoopers LLP',
                           'Deloitte & Touche LLP', 'KPMG LLP'])
  const bigFourTotal = s.auditors
    .filter(([a]) => bigFour.has(a))
    .reduce((acc, [, v]) => acc + v, 0)
  const auditedTotal = s.auditors.reduce((acc, [, v]) => acc + v, 0)

  const item1A = s.items.find((i) => i[0] === '1A')
  const totalChars = s.items.reduce((acc, i) => acc + i[2], 0)
  const pipelineTotal = s.pipeline.reduce((acc, p) => acc + p[1], 0)

  const multiCo = s.multiCompany.filter(([b]) => b !== '1 company')
    .reduce((acc, [, v]) => acc + v, 0)

  return (
    <>
      <PageHead
        eyebrow={`SEC EDGAR · ${s.window.from} → ${s.window.to} · ${s.window.feeds} monthly feeds`}
        title="What is actually in the data"
      >
        <p>
          Every number on this page is a query against the loaded database, not an estimate.
          It is here because the shape of the corpus explains most of the benchmark results —
          particularly how little of it any single document contains.
        </p>
      </PageHead>

      {/* headline */}
      <Section label="Corpus at a glance" note="one year of filings">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={n(t.filings)} label="Filings" note={`${s.window.feeds} monthly XBRL RSS feeds, ${s.window.xmlMB} MB XML`} />
          <Stat value={n(t.companies)} label="Companies" note="distinct CIKs in the spine" />
          <Stat value={n(t.documents)} label="Documents in the manifests" note={`${n(t.docsFetched)} actually fetched · ${t.docsFetchedGB} GB`} />
          <Stat value={n(t.sections)} label="Narrative sections extracted" note={`${(totalChars / 1e9).toFixed(2)} GB of prose`} />
          <Stat value={n(t.subsidiaries)} label="Subsidiaries (EX-21)" note="97% carry a jurisdiction" />
          <Stat value={n(t.ownerRows)} label="Ownership / role edges" note={`${n(t.insiders)} distinct insiders`} />
          <Stat value={n(t.chunks)} label="Vector chunks" note="384-dim, Item 1A only" />
          <Stat value={n(t.graphEdges)} label="Graph edges" note={`${n(t.graphNodes)} nodes, filing_id on every edge`} />
        </div>
      </Section>

      {/* the finding that drives everything */}
      <Section label="Why the corpus shape decides the result" note="three measured facts">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['0 / 5,210', 'Item 1A sections that mention the executive in the hardest question',
             'Names live in Form 3/4/5 filings. Risk factors are a different document type, written by a different team. Nothing embeds them together.'],
            ['1 / 151', 'subsidiary names that appear in their own parent’s risk factors',
             'Ownership is disclosed in EX-21; risk in Item 1A. The two facts a relational question needs are 99.3% disjoint.'],
            [`${n(multiCo)}`, 'insiders who hold roles at more than one company',
             'Every one of these is a multi-hop question that similarity search cannot express, and that a surname match answers wrongly.'],
          ].map(([big, label, body]) => (
            <div key={label} className="border border-border bg-layer p-5">
              <p className="font-serif text-3xl tabular-nums text-interactive">{big}</p>
              <p className="mt-1.5 text-[13px] font-medium leading-snug text-text">{label}</p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* filings */}
      <Section label="Filings" note="what one year of EDGAR actually contains">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Filings per month" note="Feb–May is annual-report season">
            <Bars
              rows={s.months}
              highlight={(l) => ['2026-03', '2026-05'].includes(l)}
            />
          </Panel>
          <Panel title="Top form types" note={`${n(t.filings)} filings across 120 distinct types`}>
            <Bars rows={s.forms} highlight={(l) => l === '10-K'} />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              Only the 5,576 10-K filings carry Item 1A risk factors and EX-21 subsidiary
              lists — 3.3% of filings produce nearly all the analytical content.
            </p>
          </Panel>
        </div>
      </Section>

      {/* narrative text */}
      <Section label="Narrative text" note="extracted from 10-K primary documents">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Sections by 10-K item" note="total characters">
            <Bars
              rows={s.items.map((i) => [`Item ${i[0]}`, i[2]])}
              fmt={(v) => `${(v / 1e6).toFixed(0)} M`}
              highlight={(l) => l === 'Item 1A'}
            />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              Item 1A alone is {(item1A[2] / 1e6).toFixed(0)} M characters across{' '}
              {n(item1A[1])} filings, averaging {n(item1A[3])} and peaking at{' '}
              {n(item1A[4])}. It is the only item embedded for vector search.
            </p>
          </Panel>
          <Panel title="Per-item detail" note="filings · average · longest">
            <Table
              head={['Item', 'Filings', 'Avg chars', 'Longest']}
              alignRight={[1, 2, 3]}
              rows={s.items.map((i) => [`Item ${i[0]}`, n(i[1]), n(i[3]), n(i[4])])}
            />
          </Panel>
        </div>
      </Section>

      {/* corporate structure */}
      <Section label="Corporate structure" note="from EX-21 exhibits">
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Largest subsidiary trees">
            <Bars rows={s.topParents} highlight={(l) => l.startsWith('Ventas')} />
          </Panel>
          <Panel title="Subsidiaries per parent" note="4,066 parents disclose at least one">
            <Bars rows={s.subDist} highlight={(l) => l === '500+'} />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              The distribution is why an LLM-authored <span className="text-text">LIMIT 50</span>{' '}
              is dangerous: 62 parents disclose over 500 subsidiaries, so one company can
              consume an entire result budget and silently hide the rest.
            </p>
          </Panel>
          <Panel title="Jurisdictions" note="Delaware and 'DE' are the same place">
            <Bars rows={s.jurisdictions} highlight={(l) => l === 'Delaware' || l === 'DE'} />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              Delaware appears twice under two spellings — 68,679 combined, 32% of all
              subsidiaries. Free-text jurisdictions are exactly the kind of field that needs
              normalising before it can be trusted.
            </p>
          </Panel>
        </div>
      </Section>

      {/* people and auditors */}
      <Section label="People and auditors" note="Form 3/4/5 and dei cover-page tags">
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Insider roles" note={`${n(t.ownerRows)} edges; relationship is multi-valued`}>
            <Bars rows={s.roles} highlight={(l) => l === 'officer'} />
          </Panel>
          <Panel title="Companies per insider" note={`${n(multiCo)} span more than one`}>
            <Bars rows={s.multiCompany} highlight={(l) => l === '6+'} />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              114 people hold roles at six or more issuers. These are the interlocking
              directorates that only a graph traversal expresses cleanly.
            </p>
          </Panel>
          <Panel title="Auditor concentration" note={`${n(auditedTotal)} audit relationships tagged`}>
            <Bars rows={s.auditors} highlight={([]) => false} />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              The Big Four account for {n(bigFourTotal)} of {n(auditedTotal)} tagged
              relationships ({Math.round((100 * bigFourTotal) / auditedTotal)}%). Note
              &ldquo;Deloitte &amp; Touche LLP&rdquo; appears twice in different casing — the
              tag is free text, so the graph keys AuditFirm on the PCAOB firm id instead.
            </p>
          </Panel>
        </div>
      </Section>

      {/* sectors */}
      <Section label="Who files" note="assigned SIC description, RSS-sourced companies">
        <Panel title="Top sectors" note="2,677 companies carry no SIC code in the feed">
          <Bars rows={s.sic} highlight={(l) => l === '(unclassified)'} />
        </Panel>
      </Section>

      {/* storage + graph */}
      <Section label="How it is stored" note={`${gb(t.dbBytes)} in Postgres, ${n(t.graphEdges)} edges in Neo4j`}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Postgres tables" note="total relation size">
            <Bars rows={s.tables} fmt={mb} highlight={(l) => l === 'section_chunk'} />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              section_chunk dominates at {mb(2493014016)}, of which the HNSW index alone is{' '}
              {mb(t.hnswBytes)}. Vectors, not text, are what make a RAG corpus expensive.
            </p>
          </Panel>
          <Panel title="Graph nodes">
            <Bars rows={s.graph.nodes} highlight={(l) => l === 'Subsidiary'} />
          </Panel>
          <Panel title="Graph edges" note="every one carries filing_id">
            <Bars rows={s.graph.edges} highlight={(l) => l === 'RESOLVES_TO'} />
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              RESOLVES_TO is the smallest and most valuable: 1,232 cases where a disclosed
              subsidiary is itself an SEC filer — a fact no single document states.
            </p>
          </Panel>
        </div>
      </Section>

      {/* pipeline cost */}
      <Section label="What it cost to build" note={`${(pipelineTotal / 60).toFixed(1)} hours end to end`}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Wall-clock per stage" note="minutes, measured">
            <Bars
              rows={s.pipeline}
              fmt={(v) => `${v < 1 ? v.toFixed(1) : v.toFixed(0)} min`}
              highlight={(l) => l.startsWith('embed') || l.startsWith('fetch 10')}
            />
          </Panel>
          <Panel title="The two ceilings that are not code" note="neither is fixable by optimising">
            <dl className="space-y-3 text-[13px] leading-relaxed">
              <div>
                <dt className="font-semibold text-text">
                  SEC rate limit — {s.measured.secRateLimit} requests/second
                </dt>
                <dd className="mt-0.5 text-secondary">
                  Fetching {n(t.docsFetched)} documents took {s.pipeline[2][1]} minutes of
                  mostly waiting. The limit is per requester, so parallelism cannot remove it —
                  only fetching less can.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-text">
                  Upload bandwidth — {s.measured.uploadMBs} MB/s, measured
                </dt>
                <dd className="mt-0.5 text-secondary">
                  Pushing the embeddings would have taken hours. Compressing the staged data to{' '}
                  {s.measured.compressionPct}% and embedding on the instance instead moved the
                  same work to a {s.measured.s3PullSeconds}-second S3 pull.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-text">
                  Embedding — {s.measured.embedRate} chunks/second
                </dt>
                <dd className="mt-0.5 text-secondary">
                  On 2 vCPUs this ran at 6.4/s and projected to 47 hours. Sixteen vCPUs gave a
                  16× speedup and {n(t.chunks)} chunks in 87 minutes.
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </Section>
    </>
  )
}
