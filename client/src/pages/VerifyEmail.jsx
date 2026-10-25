import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState(token ? 'loading' : 'error')
  const [message, setMessage] = useState(token ? '' : 'The link is missing its token.')
  // StrictMode runs effects twice in development, this makes sure we only call the API once
  const called = useRef(false)

  useEffect(() => {
    if (!token || called.current) return
    called.current = true

    api('/auth/verify-email?token=' + encodeURIComponent(token))
      .then((data) => {
        setStatus('done')
        setMessage(data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message)
      })
  }, [token])

  return (
    <div className="card form-card">
      <h2>Email verification</h2>
      {status === 'loading' && <p>Checking your link...</p>}
      {status === 'done' && (
        <>
          <p className="alert alert-success">{message}</p>
          <p>
            <Link to="/login">Go to log in</Link>
          </p>
        </>
      )}
      {status === 'error' && <p className="alert alert-error">{message}</p>}
    </div>
  )
}

export default VerifyEmail
