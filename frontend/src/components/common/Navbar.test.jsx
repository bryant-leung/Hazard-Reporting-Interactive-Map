import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'
const mockLogout = vi.fn()
const mockToggleHighContrast = vi.fn()
const mockNavigate = vi.fn()
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'resident@test.com', role: 'resident' },
    logout: mockLogout,
    highContrast: false,
    toggleHighContrast: mockToggleHighContrast,
  }),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/resident' }),
  }
})
describe('Navbar', () => {
  beforeEach(() => {
    document.body.className = ''
    mockLogout.mockClear()
    mockToggleHighContrast.mockClear()
    mockNavigate.mockClear()

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => {
        if (key === 'largeUI') return 'false'
        return null
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })
  test('renders main navbar content for resident', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText(/civictrace/i)).toBeInTheDocument()
    expect(screen.getByText(/updates/i)).toBeInTheDocument()
    expect(screen.getByText(/my reports/i)).toBeInTheDocument()
    expect(screen.getByText(/resident@test\.com/i)).toBeInTheDocument()
  })
  test('toggles high contrast when button is clicked', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /high contrast/i }))
    expect(mockToggleHighContrast).toHaveBeenCalledTimes(1)
  })
  test('logs out and navigates home', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})