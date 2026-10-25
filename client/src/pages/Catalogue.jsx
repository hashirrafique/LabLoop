import { useEffect, useState } from 'react'
import { api } from '../api.js'

const emptyFilters = { q: '', category: '', from: '', to: '' }

function formatDate(value) {
  return new Date(value + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function Catalogue() {
  const [filters, setFilters] = useState(emptyFilters)
  const [categories, setCategories] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function search(values) {
    setError('')
    setLoading(true)
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value)
    }
    try {
      const data = await api('/catalogue?' + params.toString())
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // load the categories and the full list once when the page opens
  useEffect(() => {
    api('/catalogue/categories')
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]))
    api('/catalogue')
      .then((data) => setResult(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    search(filters)
  }

  function handleClear() {
    setFilters(emptyFilters)
    search(emptyFilters)
  }

  return (
    <div>
      <h2>Equipment catalogue</h2>

      <form className="card filters" onSubmit={handleSubmit}>
        <label>
          Search
          <input
            name="q"
            placeholder="e.g. arduino, oscilloscope"
            value={filters.q}
            onChange={handleChange}
          />
        </label>
        <label>
          Category
          <select name="category" value={filters.category} onChange={handleChange}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input type="date" name="from" value={filters.from} onChange={handleChange} />
        </label>
        <label>
          To
          <input type="date" name="to" value={filters.to} onChange={handleChange} />
        </label>
        <div className="filter-buttons">
          <button type="submit" disabled={loading}>
            Search
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>

      {error && <p className="alert alert-error">{error}</p>}

      {result && !error && (
        <>
          <p className="muted">
            {result.items.length} item(s) found. Showing availability{' '}
            {result.from === result.to
              ? 'for ' + formatDate(result.from)
              : 'from ' + formatDate(result.from) + ' to ' + formatDate(result.to)}
            .
          </p>

          {result.items.length === 0 ? (
            <p className="card">No equipment matches your search.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Max loan</th>
                  <th>Free units</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.description && <div className="muted small">{item.description}</div>}
                    </td>
                    <td>{item.category}</td>
                    <td>{item.maxLoanDays} days</td>
                    <td>
                      {item.freeUnits} of {item.totalUnits}
                    </td>
                    <td>
                      {item.freeUnits > 0 ? (
                        <span className="badge badge-ok">Available</span>
                      ) : (
                        <span className="badge badge-no">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}

export default Catalogue
