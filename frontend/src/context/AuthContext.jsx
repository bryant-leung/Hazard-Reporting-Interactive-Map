// Store the current user temporarily in memory while they use the site.
import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ email: 'test@test.com', role: 'resident' })
  const [highContrast, setHighContrast] = useState(false)

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev)
  }

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }, [highContrast])

  return (
    <AuthContext.Provider value={{ user, login, logout, highContrast, toggleHighContrast }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}