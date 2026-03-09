import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResidentDashboard from './pages/ResidentDashboard'
import StaffDashboard from './pages/StaffDashboard'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/resident" element={<ResidentDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App