import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#1a1a2e',
      color: 'white'
    }}>
      <h2 style={{ margin: 0 }}>Public Space Safety</h2>
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
        <Link to="/resident" style={{ color: 'white', textDecoration: 'none' }}>Resident</Link>
        <Link to="/staff" style={{ color: 'white', textDecoration: 'none' }}>Staff</Link>
      </div>
    </nav>
  )
}

export default Navbar