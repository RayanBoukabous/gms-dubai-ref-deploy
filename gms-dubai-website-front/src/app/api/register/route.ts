import { NextResponse } from 'next/server'

/**
 * Browser → POST /api/register (this file)
 *
 * Upstream (REGISTER_API_URL) must receive exactly:
 *   - Method: POST
 *   - Body: multipart/form-data (fields + file)
 *   - Header: X-API-Key: <REGISTER_API_KEY>
 * Do not set Content-Type manually — fetch adds multipart boundary automatically.
 */

function isSkipRecaptcha(): boolean {
  return (
    process.env.SKIP_RECAPTCHA === 'true' ||
    process.env.NEXT_PUBLIC_SKIP_RECAPTCHA === 'true'
  )
}

function appendIfPresent(fd: FormData, key: string, value: FormDataEntryValue | null) {
  if (value == null || value === '') return
  fd.append(key, String(value))
}

/** Multipart file parts need a filename; undici/Node may omit it if only Blob is passed. */
function appendFileField(fd: FormData, field: FormDataEntryValue | null) {
  if (field == null || typeof field === 'string') return
  const blob = field as Blob
  const filename =
    typeof File !== 'undefined' && field instanceof File && field.name ? field.name : 'photo.jpg'
  fd.append('file', blob, filename)
}

function logUpstream(label: string, data: Record<string, unknown>) {
  console.log(`[register proxy] ${label}`, data)
}

/** Sanity check: if GET returns 200, the App Router handler is mounted (not a missing route). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST multipart here; the server forwards to REGISTER_API_URL with X-API-Key.',
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const file = formData.get('file')
    const first_name = formData.get('first_name')
    const last_name = formData.get('last_name')
    const profile = formData.get('profile')
    const recaptcha_token = formData.get('recaptcha_token')

    const parent_email = formData.get('parent_email')
    const parent_phone = formData.get('parent_phone')
    const matricule = formData.get('matricule')
    const class_name = formData.get('class_name')

    const grade = formData.get('grade')
    const curriculum = formData.get('curriculum')
    const stream = formData.get('stream')

    const apiKey = (process.env.REGISTER_API_KEY ?? '').trim()
    const apiUrl = (process.env.REGISTER_API_URL ?? '').trim()
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
    const skipRecaptcha = isSkipRecaptcha()

    const required: Record<string, FormDataEntryValue | null> = {
      file,
      first_name,
      last_name,
      profile,
    }
    if (!skipRecaptcha) {
      required.recaptcha_token = recaptcha_token
    }
    for (const [k, v] of Object.entries(required)) {
      if (!v) {
        return NextResponse.json(
          { status: 'error', message: `Missing required field: ${k}` },
          { status: 400 }
        )
      }
    }

    const profileStr = String(profile)
    if (profileStr === 'Student') {
      if (!grade) {
        return NextResponse.json(
          { status: 'error', message: 'Missing required field: grade (Student)' },
          { status: 400 }
        )
      }
      const g = String(grade)
      if (g === 'Grade 10') {
        if (!curriculum) {
          return NextResponse.json(
            { status: 'error', message: 'Missing required field: curriculum (Grade 10)' },
            { status: 400 }
          )
        }
      }
      if (g === 'Grade 11' || g === 'Grade 12') {
        if (!curriculum || !stream) {
          return NextResponse.json(
            { status: 'error', message: 'Missing required fields: curriculum and stream (Grades 11–12)' },
            { status: 400 }
          )
        }
      }
    }

    if (!skipRecaptcha) {
      if (!recaptchaSecret) {
        return NextResponse.json(
          { status: 'error', message: 'Server misconfiguration: RECAPTCHA_SECRET_KEY missing' },
          { status: 500 }
        )
      }

      const verifyBody = new URLSearchParams()
      verifyBody.append('secret', recaptchaSecret)
      verifyBody.append('response', String(recaptcha_token))
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verifyBody.toString(),
        cache: 'no-store',
      })
      const verifyData = await verifyRes.json().catch(() => null)
      if (!verifyRes.ok || !verifyData?.success) {
        return NextResponse.json(
          { status: 'error', message: 'Captcha verification failed' },
          { status: 400 }
        )
      }
    }

    if (!apiUrl?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Server misconfiguration: REGISTER_API_URL missing' },
        { status: 500 }
      )
    }
    if (!apiKey) {
      return NextResponse.json(
        { status: 'error', message: 'Server misconfiguration: REGISTER_API_KEY missing' },
        { status: 500 }
      )
    }

    const forward = new FormData()
    appendFileField(forward, file)
    forward.append('first_name', String(first_name))
    forward.append('last_name', String(last_name))
    forward.append('profile', profileStr)

    appendIfPresent(forward, 'parent_email', parent_email)
    appendIfPresent(forward, 'parent_phone', parent_phone)
    appendIfPresent(forward, 'matricule', matricule)
    appendIfPresent(forward, 'class_name', class_name)

    if (profileStr === 'Student') {
      forward.append('grade', String(grade))
      appendIfPresent(forward, 'curriculum', curriculum)
      appendIfPresent(forward, 'stream', stream)
    }

    const targetUrl = apiUrl.trim()
    logUpstream('→ outgoing', {
      method: 'POST',
      url: targetUrl,
      hasApiKey: Boolean(apiKey),
      formKeys: Array.from(new Set(forward.keys())),
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    let res: Response
    try {
      const authHeaders = new Headers()
      authHeaders.set('X-API-Key', apiKey)

      res = await fetch(targetUrl, {
        method: 'POST',
        body: forward,
        cache: 'no-store',
        signal: controller.signal,
        headers: authHeaders,
      })
    } catch (e) {
      logUpstream('✗ fetch failed (network / timeout)', {
        error: String(e),
        name: e instanceof Error ? e.name : undefined,
        url: targetUrl,
      })
      return NextResponse.json(
        {
          status: 'error',
          message: 'Unable to reach enrollment API',
          detail: String(e),
        },
        { status: 502 }
      )
    } finally {
      clearTimeout(timeoutId)
    }

    const contentType = res.headers.get('content-type') || ''
    const payload =
      contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : await res.text().catch(() => '')

    const payloadPreview =
      payload == null
        ? null
        : typeof payload === 'string'
          ? payload.length > 2000
            ? `${payload.slice(0, 2000)}… (${payload.length} chars)`
            : payload
          : JSON.stringify(payload)

    logUpstream('← incoming (raw Response)', {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      contentType,
    })
    logUpstream('← incoming (parsed body)', {
      payloadType: payload == null ? 'null' : typeof payload,
      payload: payloadPreview,
    })

    if (!res.ok) {
      const message =
        payload == null || payload === ''
          ? `Enrollment API returned ${res.status} with an empty body. Check REGISTER_API_URL and the API key.`
          : typeof payload === 'string'
            ? payload
            : ((payload as { message?: string }).message ?? JSON.stringify(payload))
      // 404 upstream → 502 here so it is not confused with a missing Next route.
      // Keep 4xx/5xx from enrollment API (e.g. 500) so DevTools matches the real upstream error.
      const clientStatus = res.status === 404 ? 502 : res.status
      logUpstream('✗ upstream error (returning to client)', {
        upstreamStatus: res.status,
        clientStatus,
        message,
      })
      return NextResponse.json(
        {
          status: 'error',
          message,
          upstreamStatus: res.status,
        },
        { status: clientStatus }
      )
    }

    if (payload == null || payload === '') {
      return NextResponse.json(
        { status: 'error', message: `Upstream returned ${res.status} with empty body` },
        { status: 500 }
      )
    }

    logUpstream('✓ success', {
      status: res.status,
      bodyKeys: typeof payload === 'object' && payload !== null ? Object.keys(payload as object) : [],
    })
    return typeof payload === 'string'
      ? NextResponse.json({ status: 'error', message: payload }, { status: res.status })
      : NextResponse.json(payload, { status: res.status })
  } catch (e) {
    logUpstream('✗ handler exception', { error: String(e) })
    return NextResponse.json(
      { status: 'error', message: 'Register API failed', detail: String(e) },
      { status: 500 }
    )
  }
}
