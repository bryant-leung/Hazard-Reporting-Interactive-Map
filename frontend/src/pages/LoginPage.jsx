import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1. Ask the backend to check Supabase for this user
    // Inside handleSubmit in LoginPage.jsx
const response = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: email,      
    password: password 
  })
});

    if (response.ok) {
      const userData = await response.json(); 
      
      // Save token in browser so report page can find
      localStorage.setItem('token', userData.token)

      // 2. Save this real data into AuthContext
      login(userData);

      // 3. RBAC: Redirect based on the actual database role
      if (userData.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/resident');
      }
    } else {
      alert("Login failed: User not found or incorrect password.");
    }
  } catch (error) {
    console.error("Connection error:", error);
    alert("Backend is offline. Make sure 'node server.js' is running!");
  }
};

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1>Birmingham Safety Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{
          padding: '10px',
          fontSize: '16px',
          backgroundColor: '#1a1a2e',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px'
        }}>Login</button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  )
}

export default LoginPage