import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../Services/Firebase'
import './Navbar.css'

const Navbar = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  return (
    <nav className="navbar">
      <div>
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🕌</span>
          <span>Saanyah - Janaza Portal</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/" className="nav-link">
          Home
        </Link>

        {user ? (
          <>
            <Link to="/dashBoard" className="nav-link nav-link-highlight">
              Dashboard
            </Link>
            <Link to="/signOut" className="nav-link nav-link-danger">
              Sign Out
            </Link>
          </>
        ) : (
          <>
            <Link to="/signIn" className="nav-link">
              Sign In
            </Link>
            <Link to="/signUp" className="nav-link nav-link-highlight">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar