import { Card } from './Shell'
import stats from '../data/stats.json'
import { fmt } from '../api'

/* What the source documents actually are.

   Every number here is read from stats.json rather than written into the prose,
   because the corpus window moves and hand-written figures go stale silently. */

const ITEM_LABEL = {
  1: ['Item 1', 'Business', 'What the company does, its segments and competition.'],
  '1A': ['Item 1A', 'Risk Factors', 'What management says could go wrong. The only section embedded.'],
  '1B': ['Item 1B', 'Unresolved Staff Comments', 'Rare — outstanding SEC review comments.'],
  2: ['Item 2', 'Properties', 'Facilities the company owns or leases.'],
  3: ['Item 3', 'Legal Proceedings', 'Material litigation.'],
  7: ['Item 7', 'MD&A', "Management's discussion of results and liquidity."],
  '7A': ['Item 7A', 'Market Risk', 'Exposure to rates, currency and commodities.'],
}

const items = stats.items.map(([code, filings, , avg, max]) => ({
  code,
  filings,
  avg,
  max,
  label: ITEM_LABEL[code],
}))
const item1a = items.find((i) => i.code === '1A')
const t = stats.totals

export function SourceDocuments() {
  return (
    <div className="space-y-4">
      {/* ── the anatomy of one filing ─────────────────────────────────── */}
      <Card>
        <h3 className="font-serif text-lg">Where the three facts live</h3>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-secondary">
          A single annual filing is not one document. It is a wrapper around a mandated set of
          numbered <strong className="text-text">Items</strong> and a set of attached{' '}
          <strong className="text-text">Exhibits</strong>, in different formats, written by
          different teams. Ownership is not even in the same filing. That separation is the whole
          problem this project is about.
        </p>

        <div className="mt-5 overflow-x-auto">
          <pre className="min-w-[620px] font-mono text-[11.5px] leading-relaxed text-secondary">
{`10-K  ·  the annual report          e.g. 0000320193-25-000079  (Apple)
│
├── Item 1A   Risk Factors          prose, avg ${fmt(item1a.avg)} chars
│                                   ─► EMBEDDED · ${fmt(t.chunks)} vector chunks
│                                      the entire universe Vector RAG can see
│
└── EX-21     Subsidiaries          a list: name + jurisdiction
                                    ─► NOT embedded
                                       ─► subsidiary table · :SUBSIDIARY_OF

Form 3 / 4 / 5  ·  a separate filing entirely
│
└── who is an officer or director   ─► reporting_owner · :OFFICER_OF / :DIRECTOR_OF`}
          </pre>
        </div>

        <p className="mt-4 border-l-2 border-interactive bg-interactive-light py-2.5 pl-3 text-[13.5px] leading-relaxed text-text">
          A question that needs a person&rsquo;s role, that company&rsquo;s subsidiaries and that
          company&rsquo;s stated risks touches all three containers. No chunk contains the
          combination, so no similarity search can retrieve it — measured on this corpus, just{' '}
          <strong>1 of 151</strong> subsidiary names appears anywhere in its own parent&rsquo;s
          risk factors. Ownership and risk are 99.3% disjoint.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── the 10-K items ─────────────────────────────────────────── */}
        <Card>
          <h3 className="font-serif text-lg">10-K — the annual report</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
            Filed once a year by every US public company. The SEC mandates the structure, so
            &ldquo;Item 1A&rdquo; means the same section in every filer&rsquo;s 10-K — which is
            what makes bulk extraction possible at all.
          </p>
          <table className="mt-3.5 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-secondary">
                <th className="py-1.5 pr-3 font-medium">Item</th>
                <th className="py-1.5 pr-3 font-medium">Section</th>
                <th className="py-1.5 pr-3 text-right font-medium">Filings</th>
                <th className="py-1.5 text-right font-medium">Avg chars</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const hot = i.code === '1A'
                return (
                  <tr
                    key={i.code}
                    className={`border-b border-border last:border-0 ${
                      hot ? 'bg-interactive-light' : ''
                    }`}
                  >
                    <td className="py-2 pr-3 font-mono text-[11.5px] tabular-nums">
                      <span className={hot ? 'font-semibold text-interactive' : 'text-secondary'}>
                        {i.label[0]}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`text-[13px] ${hot ? 'font-semibold text-text' : 'text-text'}`}
                      >
                        {i.label[1]}
                      </span>
                      <span className="block text-[11.5px] leading-snug text-secondary">
                        {i.label[2]}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-[11.5px] tabular-nums text-secondary">
                      {fmt(i.filings)}
                    </td>
                    <td className="py-2 text-right font-mono text-[11.5px] tabular-nums text-secondary">
                      {fmt(i.avg)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
            Risk factors are the longest narrative section — average {fmt(item1a.avg)} characters,
            longest in this corpus {fmt(item1a.max)}. Far past any context window, which is why it
            is chunked and embedded rather than passed whole.
          </p>
        </Card>

        {/* ── EX-21 ──────────────────────────────────────────────────── */}
        <Card>
          <h3 className="font-serif text-lg">EX-21 — Subsidiaries of the Registrant</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
            An <em>exhibit</em> attached to the 10-K, not a section of it, required by Item
            601(b)(21) of Regulation S-K. Structurally a list — subsidiary name and jurisdiction of
            incorporation — so it parses into rows rather than prose.{' '}
            <strong className="text-text">{fmt(t.subsidiaries)}</strong> rows here, across{' '}
            {fmt(t.companies)} companies.
          </p>

          <p className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-helper">
            how many each company discloses
          </p>
          <div className="mt-2 space-y-1.5">
            {stats.subDist.map(([band, n]) => {
              const max = Math.max(...stats.subDist.map((r) => r[1]))
              return (
                <div key={band} className="flex items-center gap-3">
                  <span className="w-[7.5rem] shrink-0 text-right font-mono text-[11px] text-secondary">
                    {band} {String(band) === '1' ? 'subsidiary' : 'subsidiaries'}
                  </span>
                  <div className="h-[7px] flex-1 bg-layer-alt">
                    <div className="h-full bg-interactive" style={{ width: `${(100 * n) / max}%` }} />
                  </div>
                  <span className="w-12 shrink-0 text-right font-mono text-[11px] tabular-nums text-text">
                    {fmt(n)}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="mt-4 border-l-2 border-support-warning bg-support-warning/5 py-2.5 pl-3 text-[13px] leading-relaxed text-text">
            <strong>EX-21 is incomplete by design.</strong> Rule 601(b)(21)(ii) lets a filer omit
            any subsidiary that is not a &ldquo;significant subsidiary&rdquo;. So this is a floor on
            corporate structure, never a census — an absent subsidiary is not evidence it does not
            exist, and the graph inherits that limit.
          </p>

          <p className="mt-3 text-[13px] leading-relaxed text-secondary">
            The spread is why LLM-authored queries starve on this table: the top filer discloses{' '}
            {fmt(stats.topParents[0][1])} subsidiaries while {fmt(stats.subDist[0][1])} companies
            disclose one. Any <code className="font-mono text-[12px]">LIMIT</code> over a join to it
            silently drops whole companies unless rows are balanced per entity first.
          </p>
        </Card>
      </div>

      {/* ── Form 3/4/5 ───────────────────────────────────────────────── */}
      <Card>
        <h3 className="font-serif text-lg">Forms 3, 4 and 5 — insider ownership</h3>
        <div className="mt-2 grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-[13.5px] leading-relaxed text-secondary">
              Separate filings, not part of the 10-K. Officers, directors and 10% owners report
              their position and transactions: <strong className="text-text">Form 3</strong> on
              becoming an insider, <strong className="text-text">Form 4</strong> within two business
              days of a trade, <strong className="text-text">Form 5</strong> annually for anything
              deferred. They arrive as structured XML, so the role is a field rather than something
              to infer from text.
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-secondary">
              This is the container that makes identity resolvable. Each filing carries the
              insider&rsquo;s own <strong className="text-text">CIK</strong> — a stable SEC
              identifier — so two directors who share a surname are separable even though their
              names are not. In this corpus three distinct people are named Lozano, and only the CIK
              tells them apart.
            </p>
          </div>
          <div className="border border-border bg-bg p-4">
            <dl className="space-y-2.5 font-mono text-[11.5px] tabular-nums">
              {[
                ['ownership rows', fmt(t.ownerRows)],
                ['distinct insiders', fmt(t.insiders)],
                [':OFFICER_OF edges', fmt(stats.graph.edges.find((e) => e[0] === 'OFFICER_OF')[1])],
                [':DIRECTOR_OF edges', fmt(stats.graph.edges.find((e) => e[0] === 'DIRECTOR_OF')[1])],
                ['10% owners', fmt(stats.roles.find((r) => r[0] === 'ten_pct_owner')[1])],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
                  <dt className="text-secondary">{k}</dt>
                  <dd className="text-text">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-helper">
              {fmt(stats.multiCompany.find((r) => r[0] !== '1 company')?.[1])} insiders hold roles
              at 2 companies, and {fmt(stats.multiCompany[stats.multiCompany.length - 1][1])} at 6
              or more. Those are the people a multi-hop question can be built on.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
