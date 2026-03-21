import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, logout, highContrast, toggleHighContrast } = useAuth()
  const [isLargeUI, setIsLargeUI] = useState(false)
  const navigate = useNavigate()

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
      padding: '10px 20px',
      backgroundColor: '#1a1a2e',
      color: 'white'
    }}>
      <h2 style={{ margin: 0 }}>CivicTrace</h2>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button onClick={toggleLargeUI} style={{
          background: 'none',
          border: '1px solid white',
          color: 'white',
          padding: '5px 10px',
          cursor: 'pointer',
          borderRadius: '4px'
        }}>
          {isLargeUI ? 'Standard Size' : 'Enlarge UI'}
        </button>
        
        <button onClick={toggleHighContrast} style={{
          background: 'none',
          border: '1px solid white',
          color: 'white',
          padding: '5px 10px',
          cursor: 'pointer',
          borderRadius: '4px'
        }}>
          {highContrast ? 'Standard Mode' : 'High Contrast'}
        </button>

        {user ? (
          <>
            <span>{user.email} ({user.role})</span>
            <button onClick={handleLogout} style={{
              background: 'none',
              border: '1px solid white',
              color: 'white',
              padding: '5px 10px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar