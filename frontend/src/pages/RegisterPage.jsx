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

  const handleSubmit = async (e) => { // Added 'async' here
    e.preventDefault()
    setError('')

    // Validation
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

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password, // This goes to 'password_hash' in your server.js
          role: role
        }),
      });

      if (response.ok) {
        // Removed former mock user logic
        // Log in automatically and redirect
        login({ email, role });
        alert("Registration Successful!");
        navigate(role === 'staff' ? '/staff' : '/resident');
      } else {
        const errorText = await response.text();
        setError(errorText || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError("Could not connect to the server. Is the backend running?");
    }
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
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
          required
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