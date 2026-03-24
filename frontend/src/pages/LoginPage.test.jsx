import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockClear()
    mockNavigate.mockClear()
    global.fetch = vi.fn()

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  test('renders login form fields and buttons', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue as guest/i })).toBeInTheDocument()
  })

  test('allows typing into email and password inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })

    expect(emailInput).toHaveValue('test@test.com')
    expect(passwordInput).toHaveValue('secret123')
  })

  test('shows error when login fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
      target: { value: 'wrong@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'wrongpass' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid email or password\./i)).toBeInTheDocument()
  })

  test('guest login calls login and navigates to resident dashboard', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /continue as guest/i }))

    expect(mockLogin).toHaveBeenCalledWith({ email: 'guest@guest.com', role: 'guest' })
    expect(mockNavigate).toHaveBeenCalledWith('/resident')
  })

  test('successful login stores token and redirects resident', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'abc123',
        email: 'resident@test.com',
        role: 'resident',
      }),
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
      target: { value: 'resident@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123')
      expect(mockNavigate).toHaveBeenCalledWith('/resident')
    })
  })
})