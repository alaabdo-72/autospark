function resolveApiUrl() {
  // Known production hostname always wins, regardless of whether the
  // VITE_API_URL build-time env var was actually injected by the host.
  if (typeof window !== 'undefined' && window.location.hostname === 'autospark-web.onrender.com') {
    return 'https://autospark-api.onrender.com'
  }
  // Inside the Capacitor native shell there's no localhost:4000 to reach —
  // point the app at the deployed backend instead.
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return 'https://autospark-api.onrender.com'
  }
  return import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
}

const API_URL = resolveApiUrl()

const TOKEN_KEY = 'autospark.token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data.error ?? 'Something went wrong', res.status)
  }

  return data
}
