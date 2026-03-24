import { render, screen, fireEvent } from '@testing-library/react'
import ChatInput from './ChatInput'

describe('ChatInput', () => {
  test('renders input and send button', () => {
    render(<ChatInput onSend={() => {}} />)
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })
  test('calls onSend with the typed message', () => {
    const mockSend = vi.fn()
    render(<ChatInput onSend={mockSend} />)
    const input = screen.getByPlaceholderText(/type a message/i)
    const button = screen.getByRole('button', { name: /send/i })
    fireEvent.change(input, { target: { value: 'Hello world' } })
    fireEvent.click(button)
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith('Hello world')
  })
  test('clears the input after sending', () => {
    const mockSend = vi.fn()
    render(<ChatInput onSend={mockSend} />)
    const input = screen.getByPlaceholderText(/type a message/i)
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(input).toHaveValue('')
  })
  test('does not send empty or whitespace-only messages', () => {
    const mockSend = vi.fn()
    render(<ChatInput onSend={mockSend} />)
    const input = screen.getByPlaceholderText(/type a message/i)
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(mockSend).not.toHaveBeenCalled()
  })
})