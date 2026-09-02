import { Dot } from './Shell'
import { MODE_META, MODES } from '../api'
import data from '../data/benchmark.json'

/* Rows are the four question TYPES, not the twenty questions.

   Each cell leads with QUESTIONS answered, out of 5. A question counts only if
   all three attempts passed. The three attempts are independent repeats to
   measure consistency, NOT retries -- every attempt is scored and counts, so
   there is no best-of-three anywhere in these numbers. 12 of 60
   question/architecture pairs returned different outcomes across their three
   attempts, which is why one attempt each would not have been enough. */
function tally(typeId, mode) {
  const qs = data.questions.filter((q) => q.type === typeId)
  const solid = qs.filter((q) => q.runs[mode].trialStatuses.every((s) => s === 'pass'))
  const partial = qs.filter(
    (q) =>
      q.runs[mode].trialStatuses.some((s) => s === 'pass') &&
      !q.runs[mode].trialStatuses.every((s) => s === 'pass'),
  )
  return { solid: solid.length, partial: partial.length, questions: qs.length }
}

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
                  5 questions, each asked 3 times &middot; expected: {t.expect}
                </span>
              </th>
              {MODES.map((m) => {
                const r = t.runs[m]
                const { solid, partial, questions } = tally(t.id, m)
                const lead =
                  solid === Math.max(...MODES.map((x) => tally(t.id, x).solid)) && solid > 0
                return (
                  <td key={m} className="whitespace-nowrap px-5 py-3.5 align-top">
                    <span className="font-mono text-[13px] tabular-nums">
                      <b className={lead ? 'text-interactive' : solid ? 'text-text' : 'text-helper'}>
                        {solid}
                      </b>
                      <span className="text-secondary">/{questions} questions</span>
                    </span>
                    {partial > 0 && (
                      <span className="mt-0.5 block font-mono text-[10.5px] text-support-warning">
                        +{partial} passed only some attempts
                      </span>
                    )}
                    <div className="mt-1.5 flex h-[5px] w-24 bg-layer-alt">
                      <div
                        className={lead ? 'h-full bg-interactive' : 'h-full bg-border-strong'}
                        style={{ width: `${(100 * solid) / questions}%` }}
                      />
                      <div
                        className="h-full bg-support-warning/40"
                        style={{ width: `${(100 * partial) / questions}%` }}
                      />
                    </div>
                    <span className="mt-1.5 block font-mono text-[10.5px] text-helper tabular-nums">
                      {r.passes}/{r.total} attempts
                    </span>
                    {r.halluc > 0 && (
                      <span className="mt-1 block font-mono text-[10.5px] text-support-error">
                        {r.halluc}&times; false
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-layer">
            <th scope="row" className="px-5 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-secondary">
              all 20 questions &middot; 60 attempts
            </th>
            {MODES.map((m) => {
              const t = data.totals[m]
              return (
                <td key={m} className="px-5 py-3 font-mono text-sm tabular-nums">
                  <b className={t.passes === best ? 'text-interactive' : 'text-text'}>{t.passes}</b>
                  <span className="text-secondary">/{t.runs} attempts</span>
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function Attempts() {
  return (
    <p className="mt-4 border-l-2 border-border bg-layer py-2.5 pl-3 text-[13px] leading-relaxed text-secondary">
      <strong className="text-text">Every question was asked three times.</strong> Those are
      independent repeats to measure consistency, not retries — each attempt is scored and all
      three count, so nothing here is a best-of-three. A question is only credited above when all
      three attempts passed; the ones marked{' '}
      <span className="text-support-warning">passed only some attempts</span> got the right answer
      unreliably, which in production is closer to wrong than to right. It matters:{' '}
      <strong className="text-text">12 of 60</strong> question/architecture pairs returned
      different outcomes across their three attempts, and one of them — text-to-SQL on the
      Monica Lozano query — hallucinated, failed, then honestly refused. A single attempt each
      would have let that finding come down to luck.
    </p>
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
