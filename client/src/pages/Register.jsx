import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const emptyForm = { fullName: '', studentId: '', email: '', password: '' }

function Register() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSuccess(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="card form-card">
        <h2>Check your email</h2>
        <p className="alert alert-success">{success}</p>
        <p>
          Open the link in the email to activate your account, then <Link to="/login">log in</Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="card form-card">
      <h2>Create a student account</h2>
      {error && <p className="alert alert-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </label>
        <label>
          Student ID
          <input
            name="studentId"
            placeholder="22F-1234"
            value={form.studentId}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          University email
          <input
            type="email"
            name="email"
            placeholder="f221234@cfd.nu.edu.pk"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <small className="hint">At least 8 characters, with at least one letter and one number.</small>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register
