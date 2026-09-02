/* The Trussk mark: a conical flask whose contents are a check.
 *
 * The flask is the method — everything on this site is an experiment with a
 * measured result — and the check is what the experiment is for. Drawn as
 * strokes in currentColor so one file serves the blue-on-white header, the
 * white-on-blue landing badge and anything else, with no per-context variants.
 *
 * Two stroke widths on purpose: the glassware is line work, the check is the
 * statement, so the check stays legible when the mark is rendered at 16px.
 */
export function Mark({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* rim, neck, shoulders and base as one continuous outline */}
      <path
        strokeWidth={1.7}
        d="M9.2 2.9h5.6M10.3 2.9v6.2L5.1 18.4a1.4 1.4 0 0 0 1.2 2.1h11.4a1.4 1.4 0 0 0 1.2-2.1L13.7 9.1V2.9"
      />
      {/* the contents: a check where the liquid line would sit */}
      <path strokeWidth={2.1} d="M9.4 15.9l1.9 1.9 2.9-3.6" />
    </svg>
  )
}
