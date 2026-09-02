import { Dot } from './Shell'
import { MODE_META, MODES } from '../api'
import data from '../data/benchmark.json'

/* Rows are the four question TYPES, not the twenty questions: with 5 questions
   and 3 trials each, the meaningful number is the rate within a type. */
export function CompareMatrix() {
  const best = Math.max(...MODES.map((m) => data.totals[m].passes))

  return (
    <div className="overflow-x-auto border border-border bg-bg">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-layer">
            <th className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-secondary">
              Question type
            </th>
            {MODES.map((m) => (
              <th key={m} className="px-5 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text">
                {MODE_META[m].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.types.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <th scope="row" className="min-w-[250px] px-5 py-3.5 text-left align-top">
                <span className="font-mono text-[11px] font-semibold text-interactive">{t.id}</span>
                <span className="mt-0.5 block text-[13.5px] font-medium text-text">{t.kind}</span>
                <span className="mt-1 block font-mono text-[10.5px] text-helper">
                  5 questions &times; 3 trials &middot; expected: {t.expect}
                </span>
              </th>
              {MODES.map((m) => {
                const r = t.runs[m]
                const pct = Math.round((100 * r.passes) / r.total)
                const lead = r.passes === Math.max(...MODES.map((x) => t.runs[x].passes))
                return (
                  <td key={m} className="whitespace-nowrap px-5 py-3.5 align-top">
                    <span className="font-mono text-[13px] tabular-nums">
                      <b className={lead && r.passes > 0 ? 'text-interactive' : r.passes ? 'text-text' : 'text-helper'}>
                        {r.passes}
                      </b>
                      <span className="text-secondary">/{r.total}</span>
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-helper">{pct}%</span>
                    <div className="mt-1.5 h-[5px] w-24 bg-layer-alt">
                      <div
                        className={lead && r.passes > 0 ? 'h-full bg-interactive' : 'h-full bg-border-strong'}
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                    {r.halluc > 0 && (
                      <span className="mt-1 block font-mono text-[10.5px] text-support-error">
                        {r.halluc}&times; false
                      </span>
                    )}
                    {r.halluc === 0 && r.uncited > 0 && (
                      <span className="mt-1 block font-mono text-[10.5px] text-support-warning">
                        {r.uncited}&times; uncited
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-layer">
            <th scope="row" className="px-5 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-secondary">
              all 60 runs per architecture
            </th>
            {MODES.map((m) => {
              const t = data.totals[m]
              return (
                <td key={m} className="px-5 py-3 font-mono text-sm tabular-nums">
                  <b className={t.passes === best ? 'text-interactive' : 'text-text'}>{t.passes}</b>
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
