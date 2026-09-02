import { Link } from 'react-router-dom'
import { Card, PageHead, Section } from '../components/Shell'
import { CompareMatrix, Legend } from '../components/CompareMatrix'
import { Pipeline } from '../components/Pipeline'
import { Walkthrough } from '../components/Walkthrough'
import { MODE_META, MODES, fmt } from '../api'
import data from '../data/benchmark.json'

const c = data.corpus

function Stat({ value, label }) {
 return (
    <div>
      <div className="font-serif text-3xl tabular-nums tracking-tight text-interactive">{value}</div>
      <div className="mt-1 text-[13px] leading-snug text-secondary">{label}</div>
    </div>
  )
}

function ArchColumn({ title, subtitle, rows, accent }) {
 return (
    <Card className="flex flex-col">
      <h3 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-text">
        {title}
      </h3>
      <p className="mt-1 font-mono text-[11px] text-secondary">{subtitle}</p>
      <ul className="mt-4 space-y-2 text-[13px] text-secondary">
        {rows.map((r) => (
          <li key={r} className="flex gap-2">
            <span className={accent ? 'text-interactive' : 'text-helper'}>→</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Home() {
 const best = MODES.reduce(
    (a, m) => (data.totals[m].passes > data.totals[a].passes ? m : a),
    MODES[0],
  )

 return (
    <>
      <PageHead
 eyebrow={`SEC EDGAR · ${fmt(c.postgres.filings)} filings · 180 scored runs`}
 title="Three ways to ask a filing a question"
      >
        <p>
          Twelve months of SEC disclosure loaded into Postgres and Neo4j, then queried three
 ways by the same model — twenty questions, three trials each. The finding is not that
 SQL cannot join. It is that{' '}
          <em className="text-text not-italic">identity</em> and{' '}
          <em className="text-text not-italic">provenance</em> are structure you either
 store or reconstruct — and reconstructing them is where the answers go wrong.
        </p>
      </PageHead>

      <Section>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <Stat value={`${data.totals.graphrag.passes}/60`} label="GraphRAG passes"/>
          <Stat value={`${data.totals.text_to_sql.passes}/60`} label="text-to-SQL passes"/>
          <Stat value={`${data.totals.vector_rag.passes}/60`} label="Vector RAG passes"/>
          <Stat value={data.totals.text_to_sql.halluc} label="Confident falsehoods from SQL"/>
        </div>
      </Section>

      <Section label="Quick compare" note="rows are question types · 5 questions × 3 trials each">
        <CompareMatrix />
        <Legend />
        <p className="mt-5 text-[13.5px] leading-relaxed text-secondary">
          Scoring is programmatic against hand-verified ground truth — required entities,
 forbidden entities, and citation precision/recall. No LLM judge.{' '}
          <Link to="/graphrag/benchmarks" className="text-interactive hover:underline">
            Full methodology →
          </Link>
        </p>
      </Section>

      <Section label="Why similarity search cannot reach the answer" note="measured, not asserted">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <p className="font-serif text-3xl tabular-nums text-interactive">0</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-secondary">
              of 5,210 risk-factor sections mention the executive
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-secondary">
              The subject of the killer query is Monica Lozano. The string “lozano” appears in{' '}
              <strong className="text-text">none</strong> of the extracted Item 1A sections — her
              name exists only in Form 3/4/5 ownership filings, a different document type that is
              never embedded alongside risk-factor prose. There is no chunk to retrieve.
            </p>
            <p className="mt-4 font-serif text-3xl tabular-nums text-interactive">1 / 151</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-secondary">
              subsidiary names that appear in their parent’s own Item 1A
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-secondary">
              Role, ownership and risk are written in three separate documents by three separate
              teams, so no chunk in the corpus contains the combination the question asks about.
              Not a chunk-size problem, and not an embedding-quality problem.
            </p>
          </Card>

          <Card>
            <h3 className="font-serif text-lg">Vector RAG cannot filter by entity</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
              Asked what supply-chain risks <strong className="text-text">Moderna</strong>
              disclosed, similarity search returned risk-factor chunks from Entegris, Hayward,
              Open Text, Arrowhead and NVIDIA. All are genuinely about supply chain — none are
              Moderna.
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-secondary">
              Across 508,714 chunks from 5,210 companies, a company name is not a strong enough
              signal in embedding space to outweigh topical similarity. On a single month of
              filings the same question passed; at this scale it fails{' '}
              <strong className="text-text">12 of 15 times</strong>.
            </p>
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-helper">
              Scale broke it. That is not a result we predicted, and it is the clearest argument
              on this page for structural retrieval over similarity.
            </p>
          </Card>
        </div>
      </Section>

      <Section
        label="Why Vector RAG fails, and how GraphRAG gets the answer"
        note="one query, traced step by step against the live corpus"
      >
        <Walkthrough />
      </Section>

      <Section
        label="How it works, end to end"
        note="raw filing → preprocessing → storage → query execution"
      >
        <Pipeline />
      </Section>

      <Section label="Architecture" note="two stores, one provenance key">
        <div className="grid gap-4 md:grid-cols-3">
          <ArchColumn
 title="text-to-SQL"
 subtitle={MODE_META.text_to_sql.role}
 rows={[
              'Full relational schema in the prompt, including subsidiary and reporting_owner',
              'Generates one read-only query, one repair attempt on error or empty result',
              'Can express the joins — loses which entity and which document',
            ]}
          />
          <ArchColumn
 title="Vector RAG"
 subtitle={MODE_META.vector_rag.role}
 rows={[
              `${fmt(c.postgres.chunks)} chunks, 384-dim, HNSW cosine index`,
              'Retrieval driven purely by similarity to the question',
              'Cannot retrieve a fact that lives in a different document type',
            ]}
          />
          <ArchColumn
 accent
 title="GraphRAG"
 subtitle={MODE_META.graphrag.role}
 rows={[
              `${fmt(c.neo4j.nodes)} nodes / ${fmt(c.neo4j.edges)} edges, filingId on every edge`,
              'LLM plans the hops; the system expands each entity completely',
              'Pulls the exact passage from Postgres by filing_id',
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-secondary">
              Postgres — system of record
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 font-mono text-[12px] tabular-nums">
              {[
 ['filings', c.postgres.filings],
 ['companies', c.postgres.companies],
 ['document manifest', c.postgres.documents],
 ['narrative sections', c.postgres.sections],
 ['vector chunks', c.postgres.chunks],
 ['subsidiaries (EX-21)', c.postgres.subsidiaries],
 ['ownership rows', c.postgres.ownerRows],
              ].map(([k, v]) => (
                <div key={k} className="col-span-2 flex justify-between gap-4">
                  <dt className="text-secondary">{k}</dt>
                  <dd className="text-text">{fmt(v)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4 border border-interactive bg-interactive-light p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Try it against live data</h2>
            <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-secondary">
              Ask anything of the loaded filings and watch all three architectures answer in
 parallel — each showing the query it wrote and the evidence it found.
            </p>
          </div>
          <Link
 to="/graphrag/playground"
 className="shrink-0 bg-interactive px-5 py-2.5 text-center text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Open the playground
          </Link>
        </div>
      </Section>
    </>
  )
}
