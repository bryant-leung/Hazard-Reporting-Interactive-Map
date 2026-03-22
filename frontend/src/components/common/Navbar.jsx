import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, logout, highContrast, toggleHighContrast } = useAuth()
  const [isLargeUI, setIsLargeUI] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const savedLargeUI = localStorage.getItem('largeUI') === 'true'
    if (savedLargeUI) {
      setIsLargeUI(true)
      document.body.classList.add('large-ui')
    }
  }, [])

  const toggleLargeUI = () => {
    const newState = !isLargeUI
    setIsLargeUI(newState)
    localStorage.setItem('largeUI', newState)
    document.body.classList.toggle('large-ui')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 24px',
      height: '56px',
      backgroundColor: '#0f4c3a',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <span style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '0.05em', color: '#10b981' }}>
        W S W N T G ?
      </span>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {user && user.role === 'resident' && (
          <Link to="/my-reports" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>
            My Reports
          </Link>
        )}

        <button onClick={toggleLargeUI} style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.4)',
          color: 'rgba(255,255,255,0.8)',
          padding: '5px 12px',
          cursor: 'pointer',
          borderRadius: '6px',
          fontSize: '13px'
        }}>
          {isLargeUI ? 'Standard Size' : 'Enlarge UI'}
        </button>

        <button onClick={toggleHighContrast} style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.4)',
          color: 'rgba(255,255,255,0.8)',
          padding: '5px 12px',
          cursor: 'pointer',
          borderRadius: '6px',
          fontSize: '13px'
        }}>
          {highContrast ? 'Standard Mode' : 'High Contrast'}
        </button>

        {user ? (
          <>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
              {user.email}
              <span className="role-badge" style={{
                marginLeft: '6px',
                background: '#10b981',
                color: '#fff',
                padding: '2px 7px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {user.role}
              </span>
            </span>
            <button onClick={handleLogout} style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'rgba(255,255,255,0.8)',
              padding: '5px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            {location.pathname !== '/' && <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>Login</Link>}
            {location.pathname !== '/register' && <Link to="/register" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>Register</Link>}
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
