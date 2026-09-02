// Query API client. Base URL comes from the Vercel env var VITE_API_BASE, which
// is the CloudFront distribution in front of the EC2 host (HTTPS, so the browser
// does not block it as mixed content).
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export const API_CONFIGURED = BASE.length > 0

export const MODES = ['text_to_sql', 'vector_rag', 'graphrag']

export const MODE_META = {
  text_to_sql: { label: 'text-to-SQL', role: 'Postgres only · no graph' },
  vector_rag: { label: 'Vector RAG', role: 'pgvector · MiniLM-L6-v2' },
  graphrag: { label: 'GraphRAG', role: 'Neo4j hop → filing_id → SQL' },
}

export const STATUS_LABEL = {
  pass: 'pass',
  halluc: 'hallucination',
  uncited: 'no citation',
  refused: 'refused',
  fail: 'fail',
}

async function req(path, init) {
  if (!API_CONFIGURED) {
    throw new Error(
      'VITE_API_BASE is not set for this deployment, so the live playground has nothing to call.',
    )
  }
  const res = await fetch(`${BASE}${path}`, init)
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`API returned non-JSON (${res.status}): ${text.slice(0, 200)}`)
  }
  if (!res.ok) throw new Error(body.error || body.detail || `API error ${res.status}`)
  return body
}

export function getMeta() {
  return req('/api/meta')
}

export function ask({ question, mode, questionId, model, signal }) {
  return req('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // model is optional: the API falls back to the benchmarked model, and
    // rejects any id that is not in its own catalogue.
    body: JSON.stringify({
      question,
      mode,
      question_id: questionId || null,
      model: model || null,
    }),
    signal,
  })
}

export const fmt = (n) =>
  n === null || n === undefined ? '—' : Number(n).toLocaleString()
