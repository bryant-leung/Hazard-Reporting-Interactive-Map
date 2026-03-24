import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./components/common/Navbar', () => ({
  default: () => <div>Mock Navbar</div>,
}))

vi.mock('./pages/LoginPage', () => ({
  default: () => <div>Mock Login Page</div>,
}))

vi.mock('./pages/RegisterPage', () => ({
  default: () => <div>Mock Register Page</div>,
}))

vi.mock('./pages/ResidentDashboard', () => ({
  default: () => <div>Mock Resident Dashboard</div>,
}))

vi.mock('./pages/StaffDashboard', () => ({
  default: () => <div>Mock Staff Dashboard</div>,
}))

vi.mock('./pages/ReportHazardPage', () => ({
  default: () => <div>Mock Report Hazard Page</div>,
}))

vi.mock('./pages/MyReportsPage', () => ({
  default: () => <div>Mock My Reports Page</div>,
}))

vi.mock('./pages/UpdatesPage', () => ({
  default: () => <div>Mock Updates Page</div>,
}))

vi.mock('./components/common/Map', () => ({
  default: () => <div>Mock Map</div>,
}))

const mockUseAuth = vi.fn()

vi.mock('./context/AuthContext', async () => {
  const actual = await vi.importActual('./context/AuthContext')
  return {
    ...actual,
    AuthProvider: ({ children }) => <>{children}</>,
    useAuth: () => mockUseAuth(),
  }
})

describe('App integration', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  test('shows login page when no user is logged in', () => {
    mockUseAuth.mockReturnValue({ user: null })

    render(<App />)

    expect(screen.getByText(/mock navbar/i)).toBeInTheDocument()
    expect(screen.getByText(/mock login page/i)).toBeInTheDocument()
  })

  test('redirects resident user to resident dashboard', async () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'resident@test.com', role: 'resident' },
    })

    render(<App />)

    expect(await screen.findByText(/mock resident dashboard/i)).toBeInTheDocument()
  })

  test('redirects staff user to staff dashboard', async () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'staff@test.com', role: 'staff' },
    })

    render(<App />)

    expect(await screen.findByText(/mock staff dashboard/i)).toBeInTheDocument()
  })

  test('allows direct access to register route', () => {
    mockUseAuth.mockReturnValue({ user: null })
    window.history.pushState({}, '', '/register')

    render(<App />)

    expect(screen.getByText(/mock register page/i)).toBeInTheDocument()
  })
})