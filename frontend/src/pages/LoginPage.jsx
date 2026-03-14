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
      // ask backend to check if login is valid
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

        // save token so other pages can use it later
        localStorage.setItem('token', userData.token)

        // save logged in user in auth context
        login(userData);

        // redirect based on role
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
      alert("Backend is offline. Make sure backend is running!");
    }
  };

  // let user continue without logging in
  const handleGuestLogin = () => {
    login({
      email: 'guest@guest.com',
      role: 'guest'
    });

    navigate('/map');
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

        <button
          type="submit"
          style={{
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Login
        </button>
      </form>

      {/* guest option for viewing hazards without an account */}
      <button
        onClick={handleGuestLogin}
        style={{
          marginTop: '10px',
          padding: '10px',
          fontSize: '16px',
          backgroundColor: '#e0e0e0',
          color: 'black',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          width: '100%'
        }}
      >
        Continue as Guest
      </button>

      <p style={{ marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  )
}

export default LoginPage