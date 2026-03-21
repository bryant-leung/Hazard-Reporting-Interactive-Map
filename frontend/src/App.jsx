import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResidentDashboard from './pages/ResidentDashboard'
import StaffDashboard from './pages/StaffDashboard'
import Map from './components/common/Map'
import ReportHazardPage from './pages/ReportHazardPage'
import MyReports from './pages/MyReportsPage'

const ProtectedRoute = ({children, allowedRole}) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'staff' ? '/staff' : '/resident'} replace />;
  }
  return children;
}


function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          user.role === 'staff'
            ? <Navigate to="/staff" />
            : user.role === 'resident'
              ? <Navigate to="/resident" />
              : <Navigate to="/map" />
        ) : (
          <LoginPage />
        )
      } />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/resident" element={
        user && user.role === 'resident' ? <ResidentDashboard /> : <Navigate to="/" />
      } />
      <Route path="/report-hazard" element={
        user && (user.role === 'resident' || user.role === 'staff') ? <ReportHazardPage /> : <Navigate to="/" />
      } />
      <Route path="/staff" element={
        user && user.role === 'staff' ? <StaffDashboard /> : <Navigate to="/" />
      } />
      <Route path="/map" element={
        user ? <Map /> : <Navigate to="/" />
      } />
      <Route path="/my-reports" element={
        user && user.role === 'resident' ? <MyReports /> : <Navigate to="/" />
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main style={{ padding: '20px' }}>
          <AppRoutes />
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App