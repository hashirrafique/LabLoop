import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const roleNames = {
  student: 'Student',
  lab_engineer: 'Lab Engineer',
  hod: 'HoD',
}

function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        LabLoop
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>
          Home
        </NavLink>
      </nav>

      <div className="nav-user">
        {user ? (
          <>
            <span>
              {user.fullName} ({roleNames[user.role]})
            </span>
            <button className="btn-link" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <NavLink to="/login">Log in</NavLink>
        )}
      </div>
    </header>
  )
}

export default NavBar
