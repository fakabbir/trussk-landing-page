import { Dot } from './Shell'
import { MODE_META, MODES } from '../api'
import data from '../data/benchmark.json'

const cleanKind = (k) => k.replace(/\s*\(THE KILLER QUERY\)/i, '')
const isKiller = (k) => /killer/i.test(k)

export function CompareMatrix({ compact = false }) {
 return (
    <div className="overflow-x-auto border border-border bg-bg">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-layer">
            <th className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-secondary">
              Question
            </th>
            {MODES.map((m) => (
              <th
 key={m}
 className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text"
              >
                {MODE_META[m].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.questions.map((q) => (
            <tr key={q.id} className="border-b border-border last:border-0">
              <th scope="row"className="min-w-[230px] px-5 py-3.5 text-left align-top">
                <span className="font-mono text-[11px] font-semibold text-interactive">{q.id}</span>
                <span className="mt-0.5 block text-[13.5px] font-medium text-text">
                  {cleanKind(q.kind)}
                  {isKiller(q.kind) && <span className="ml-1.5 text-support-warning">★</span>}
                </span>
                {!compact && (
                  <span className="mt-1 block font-mono text-[10.5px] text-helper">
 expected: {q.expect}
                  </span>
                )}
              </th>
              {MODES.map((m) => {
 const r = q.runs[m]
 return (
                  <td key={m} className="whitespace-nowrap px-5 py-3.5 align-top">
                    <span className="mr-2.5 inline-flex gap-1 align-middle">
                      {r.trialStatuses.map((s, i) => (
                        <Dot key={i} status={s} title={`trial ${i + 1}: ${s}`} />
                      ))}
                    </span>
                    <span className="font-mono text-[12.5px] tabular-nums">
                      <b className={r.passes > 0 ? 'text-text' : 'text-helper'}>
                        {r.passes}
                      </b>
                      <span className="text-secondary">/3</span>
                      {r.halluc > 0 && (
                        <span className="ml-1.5 text-support-error">{r.halluc}× false</span>
                      )}
                      {r.halluc === 0 && r.uncited > 0 && (
                        <span className="ml-1.5 text-support-warning">{r.uncited}× uncited</span>
                      )}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-layer">
            <th scope="row"className="px-5 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-secondary">
 all 12 runs
            </th>
            {MODES.map((m) => {
 const t = data.totals[m]
 const best = Math.max(...MODES.map((x) => data.totals[x].passes))
 return (
                <td key={m} className="px-5 py-3 font-mono text-sm tabular-nums">
                  <b className={t.passes === best ? 'text-interactive' : 'text-text'}>
                    {t.passes}
                  </b>
                  <span className="text-secondary">/{t.runs}</span>
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function Legend() {
 const items = [
 ['pass', 'pass — right entities, right text, correct citation'],
 ['halluc', 'hallucination — stated something false'],
 ['uncited', 'right answer, no citation'],
 ['refused', 'refused — said it could not answer'],
  ]
 return (
    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-secondary">
      {items.map(([s, label]) => (
        <li key={s} className="flex items-center gap-2">
          <Dot status={s} />
          {label}
        </li>
      ))}
    </ul>
  )
}
