import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="card">
      <h2>Page not found</h2>
      <p>
        <Link to="/">Go back to the home page</Link>
      </p>
    </div>
  )
}

export default NotFound
