import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => { // Added 'async' for 'await'
    e.preventDefault();

    try {
      // 1. Send login credentials to Node.js backend
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        // 2. Parse the user data (including the 'role' from Supabase)
        const userData = await response.json();

        // 3. Update the AuthContext
        // userData will look like { id: 1, email: '...', role: 'staff' }
        login(userData);

        // 4. RBAC redirection based on role
        // Use the actual 'role' column from our database to decide where they go
        console.log(`User logged in as: ${userData.role}`);
        navigate(userData.role === 'staff' ? '/staff' : '/resident');
        
      } else {
        // Handle errors
        const errorText = await response.text();
        alert(`Login Failed: ${errorText}`);
      }
    } catch (error) {
      // Handle network errors 
      console.error("Connection Error:", error);
      alert("Could not connect to the server. Is the backend running?");
    }
  }

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