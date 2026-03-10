import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('resident')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Temporary mock register - replace with real API call later
    login({ email, role })
    navigate(role === 'staff' ? '/staff' : '/resident')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1>Register</h1>

      {error && (
        <p style={{ color: 'red', backgroundColor: '#ffe0e0', padding: '10px', borderRadius: '4px' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />

        <label style={{ fontSize: '16px' }}>Account Type:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          <option value="resident">Resident</option>
          <option value="staff">Council Staff</option>
        </select>

        <button type="submit" style={{
          padding: '10px',
          fontSize: '16px',
          backgroundColor: '#1a1a2e',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px'
        }}>Register</button>
      </form>

      <p>Already have an account? <Link to="/">Login here</Link></p>
    </div>
  )
}

export default RegisterPage