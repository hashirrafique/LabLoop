// All API calls go through this function.
// In development Vite forwards /api to the Express server (see vite.config.js).
export async function api(path, options = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Request failed with status ' + res.status)
  }
  return data
}
