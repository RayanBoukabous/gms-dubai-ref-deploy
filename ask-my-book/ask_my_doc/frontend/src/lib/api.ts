// src/lib/api.ts
// Toutes les fonctions qui parlent au backend FastAPI

import type { UploadResponse, CogneeLoadResponse } from '@/types'

const BASE = '/api'

/** Lit le corps d'une réponse d'erreur (JSON FastAPI ou texte) pour l'affichage UI. */
async function readHttpErrorDetail(res: Response): Promise<string> {
  const raw = await res.text().catch(() => '')
  if (!raw) return res.statusText || 'Erreur inconnue'
  try {
    const j = JSON.parse(raw) as { detail?: unknown }
    if (j.detail !== undefined) {
      return typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail)
    }
  } catch {
    /* pas du JSON */
  }
  return raw.slice(0, 500)
}

/** Vérifie la réponse SSE avant lecture du flux. */
async function requireSSEBody(res: Response, label: string): Promise<ReadableStream<Uint8Array>> {
  if (!res.ok) {
    const detail = await readHttpErrorDetail(res)
    throw new Error(`${label} (${res.status}): ${detail}`)
  }
  if (!res.body) {
    throw new Error(
      `${label}: pas de corps de réponse (streaming). ` +
        "Définis NEXT_PUBLIC_BACKEND_URL vers ton API FastAPI (ex. http://localhost:8000), " +
        "rebuild l'image frontend, ou vérifie le proxy /auth.",
    )
  }
  return res.body
}

/** Appelle le backend en direct pour le SSE (évite le buffering du proxy Next.js). */
function sseFetchUrl(path: string): string {
  if (typeof window === 'undefined') return path
  const root = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') ?? ''
  if (!root) return path
  return `${root}${path.startsWith('/') ? path : `/${path}`}`
}

// ── Auth Helper ───────────────────────────────────────────────────────────────
function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: Record<string, string> = { ...extraHeaders }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// ── Auth APIs ─────────────────────────────────────────────────────────────────
export async function registerAPI(data: any): Promise<{ access_token: string, user: any }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Registration failed')
  }
  return res.json()
}

export async function loginAPI(data: any): Promise<{ access_token: string, user: any }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Login failed')
  }
  return res.json()
}

export async function meAPI(token: string): Promise<any> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) {
    throw new Error('Failed to fetch user')
  }
  return res.json()
}

// ── Upload ────────────────────────────────────────────────────────────────────
export async function uploadDocument(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Upload failed')
  }
  return res.json()
}

// ── Summarize (SSE streaming) ─────────────────────────────────────────────────
export async function streamSummary(
  documentText: string,
  onChunk: (text: string) => void,
  onDone: (usage: Record<string, unknown>) => void,
): Promise<void> {
  const url = sseFetchUrl('/api/summarize')
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ document_text: documentText }),
    cache: 'no-store',
  })

  const body = await requireSSEBody(res, 'Summarize')
  await readSSE(body, onChunk, onDone)
}

// ── Chat (SSE streaming) ──────────────────────────────────────────────────────
export async function streamChat(
  payload: {
    query: string
    documentText: string
    documentSummary: string
    history: Array<{ role: string; content: string }>
  },
  onRoute: (route: string) => void,
  onChunk: (text: string) => void,
  onDone: (usage: Record<string, unknown>) => void,
): Promise<void> {
  const url = sseFetchUrl('/api/chat')
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      query:            payload.query,
      document_text:    payload.documentText,
      document_summary: payload.documentSummary,
      history:          payload.history,
    }),
    cache: 'no-store',
  })

  const body = await requireSSEBody(res, 'Chat')

  await readSSE(
    body,
    (chunk) => {
      if (chunk.startsWith('__ROUTE__:')) {
        onRoute(chunk.replace('__ROUTE__:', ''))
      } else {
        onChunk(chunk)
      }
    },
    onDone,
  )
}

// ── Cognee load ───────────────────────────────────────────────────────────────
export async function loadCognee(): Promise<CogneeLoadResponse> {
  const res = await fetch(`${BASE}/cognee/load`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Cognee load failed')
  return res.json()
}

// ── Helper : lit un flux SSE ──────────────────────────────────────────────────
// Chaque token est dispatché séparément avec un setTimeout(0) entre les deux.
// Cela permet à React de peindre chaque token individuellement (effet "typing")
// sans risquer le React #185 (maximum update depth) causé par flushSync.
async function readSSE(
  body: ReadableStream<Uint8Array>,
  onData: (line: string) => void,
  onDone: (usage: Record<string, unknown>) => void,
): Promise<void> {
  const reader  = body.getReader()
  const decoder = new TextDecoder()
  let   buffer  = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.replace(/\r$/, '')
      if (!trimmed.startsWith('data: ')) continue
      const payload = trimmed.slice(6)

      if (payload.startsWith('__DONE__:')) {
        try {
          const usage = JSON.parse(payload.slice(9))
          onDone(usage)
        } catch { /* ignore */ }
      } else {
        const text = payload.replace(/\\n/g, '\n')
        onData(text)
        // Yield au moteur JS → React peut commit ce rendu avant le token suivant.
        // Effet "typing" token par token, sans flushSync (qui cause #185).
        await new Promise<void>(r => setTimeout(r, 0))
      }
    }
  }
}
