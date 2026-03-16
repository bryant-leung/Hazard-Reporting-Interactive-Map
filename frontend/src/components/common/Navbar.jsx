import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, logout, highContrast, toggleHighContrast } = useAuth()
  const navigate = useNavigate()

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
      backgroundColor: '#1a1a2e',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <span style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '0.05em', color: '#f59e0b' }}>
        W S W N T G ?
      </span>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
              <span style={{
                marginLeft: '6px',
                background: '#f59e0b',
                color: '#1a1a2e',
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
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
            <Link to="/register" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
