import { Link, NavLink } from 'react-router-dom'

function NavBar() {
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
    </header>
  )
}

export default NavBar
