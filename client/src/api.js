// All API calls go through this function.
// In development Vite forwards /api to the Express server (see vite.config.js).
export async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Request failed with status ' + res.status)
  }
  return data
}
