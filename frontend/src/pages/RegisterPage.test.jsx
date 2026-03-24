import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'

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

describe('RegisterPage', () => {
  beforeEach(() => {
    mockLogin.mockClear()
    mockNavigate.mockClear()
    global.fetch = vi.fn()
  })

  test('renders register form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2)
  })

  test('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
      target: { value: 'user@test.com' },
    })

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i)
    fireEvent.change(passwordInputs[0], { target: { value: 'secret123' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'different123' } })

    fireEvent.click(screen.getByRole('button', { name: /create account|register|sign up/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  test('shows error when password is too short', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
      target: { value: 'user@test.com' },
    })

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i)
    fireEvent.change(passwordInputs[0], { target: { value: '123' } })
    fireEvent.change(passwordInputs[1], { target: { value: '123' } })

    fireEvent.click(screen.getByRole('button', { name: /create account|register|sign up/i }))

    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument()
  })
})