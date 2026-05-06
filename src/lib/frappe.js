const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

function stripTrailingJsonNoise(text) {
  return String(text)
    .replace(/(?:\\n|\r\n|\n)+\s*["\],\]]+\s*$/g, '')
    .replace(/"\s*\]\s*$/g, '')
    .trim()
}

/** Frappe serializes toast rows as JSON strings like '{"message":"...","title":"Error"}'. */
function coerceServerMessageEntry(entry) {
  if (entry == null) return ''
  if (typeof entry === 'object' && typeof entry.message === 'string') {
    return stripTrailingJsonNoise(entry.message)
  }
  if (typeof entry !== 'string') return ''
  const trimmed = entry.trim()
  if (trimmed.startsWith('{') && trimmed.includes('message')) {
    try {
      const obj = JSON.parse(entry)
      if (obj && typeof obj.message === 'string') return stripTrailingJsonNoise(obj.message)
    } catch {
      // fall through
    }
  }
  return stripTrailingJsonNoise(entry)
}

function extractServerMessages(payload) {
  if (!payload?._server_messages) return []
  try {
    const messages = JSON.parse(payload._server_messages)
    if (!Array.isArray(messages)) return []
    return messages.map(coerceServerMessageEntry).filter(Boolean)
  } catch {
    return []
  }
}

function normalizeFrappeError(payload) {
  if (!payload) return new Error('Request failed')

  if (typeof payload === 'string') return new Error(cleanErrorText(payload))

  const serverTexts = extractServerMessages(payload)
  if (serverTexts.length) {
    return new Error(cleanErrorText(serverTexts[serverTexts.length - 1]))
  }

  if (payload.exc && typeof payload.exc === 'string') return new Error(cleanErrorText(payload.exc))

  if (payload.message) {
    if (typeof payload.message === 'string') return new Error(cleanErrorText(payload.message))
    if (Array.isArray(payload.message)) {
      const parts = payload.message
        .map((m) => (typeof m === 'string' ? m : m?.message))
        .filter((x) => typeof x === 'string' && x.trim())
      if (parts.length) return new Error(cleanErrorText(parts.join('\n')))
    }
  }

  return new Error('Request failed')
}

function cleanErrorText(raw) {
  if (!raw) return 'Request failed'
  let text = String(raw).trim()

  const jsonMsg = coerceServerMessageEntry(text)
  if (jsonMsg && jsonMsg !== text && (!text.startsWith('Traceback') || jsonMsg.length < text.length)) {
    text = jsonMsg
  }

  text = stripTrailingJsonNoise(text)
  text = text.replace(/\\n/g, '\n').trim()

  // Remove HTML wrapper if any
  const withoutTags = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  // Most useful line in tracebacks often starts with "ValidationError:"
  const validationMatch = withoutTags.match(/ValidationError:\s*(.+)$/i)
  if (validationMatch?.[1]) return validationMatch[1].trim()

  // Generic Frappe exception suffix: "frappe.exceptions.X: message"
  const frappeExceptionMatch = withoutTags.match(/frappe\.exceptions\.[A-Za-z_]+:\s*(.+)$/)
  if (frappeExceptionMatch?.[1]) return frappeExceptionMatch[1].trim()

  // If traceback string, use last non-empty line
  if (text.includes('Traceback')) {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const last = lines[lines.length - 1]
    if (last) {
      const idx = last.indexOf(':')
      if (idx > -1 && idx < last.length - 1) return last.slice(idx + 1).trim()
      return last
    }
  }

  return withoutTags || text.trim() || 'Request failed'
}

let cachedCsrfToken = null

export async function getLoggedUser() {
  const res = await fetch('/api/method/frappe.auth.get_logged_user', { credentials: 'include' })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw normalizeFrappeError(data)
  return data?.message
}

export async function getCsrfToken({ force = false } = {}) {
  if (!force && cachedCsrfToken) return cachedCsrfToken
  const res = await fetch('/api/method/frappe.sessions.get_csrf_token', { credentials: 'include' })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw normalizeFrappeError(data)
  cachedCsrfToken = data?.message || null
  return cachedCsrfToken
}

export async function login({ usr, pwd }) {
  const body = new URLSearchParams()
  body.set('usr', usr)
  body.set('pwd', pwd)

  const res = await fetch('/api/method/login', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    body,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) throw normalizeFrappeError(data)

  cachedCsrfToken = null
  await getCsrfToken({ force: true }).catch(() => null)
  return data?.message
}

export async function logout() {
  const csrf = await getCsrfToken().catch(() => null)
  const res = await fetch('/api/method/logout', {
    method: 'POST',
    credentials: 'include',
    headers: csrf ? { ...JSON_HEADERS, 'X-Frappe-CSRF-Token': csrf } : JSON_HEADERS,
    body: JSON.stringify({}),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw normalizeFrappeError(data)
  cachedCsrfToken = null
  return true
}

export async function frappeCall({ method, args = {}, httpMethod = 'POST' }) {
  const url = `/api/method/${method}`
  const isPost = httpMethod.toUpperCase() !== 'GET'

  let headers = JSON_HEADERS
  let body

  if (isPost) {
    const csrf = await getCsrfToken().catch(() => null)
    if (csrf) headers = { ...headers, 'X-Frappe-CSRF-Token': csrf }
    body = JSON.stringify(args || {})
  }

  const res = await fetch(url, {
    method: httpMethod,
    credentials: 'include',
    headers,
    body,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // if csrf expired, retry once
    if (res.status === 403) {
      cachedCsrfToken = null
      const csrf = await getCsrfToken({ force: true }).catch(() => null)
      const retryHeaders = csrf ? { ...JSON_HEADERS, 'X-Frappe-CSRF-Token': csrf } : JSON_HEADERS
      const retryRes = await fetch(url, {
        method: httpMethod,
        credentials: 'include',
        headers: retryHeaders,
        body: isPost ? JSON.stringify(args || {}) : undefined,
      })
      const retryData = await retryRes.json().catch(() => null)
      if (!retryRes.ok) throw normalizeFrappeError(retryData)
      return retryData?.message
    }
    throw normalizeFrappeError(data)
  }

  return data?.message
}

