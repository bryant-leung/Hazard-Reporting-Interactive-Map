import { render, screen } from '@testing-library/react'
import ChatMessage from './ChatMessage'

describe('ChatMessage', () => {
  test('renders the username and message text', () => {
    render(<ChatMessage user="Resident" text="This pavement is blocked." />)
    expect(screen.getByText(/resident:/i)).toBeInTheDocument()
    expect(screen.getByText(/this pavement is blocked\./i)).toBeInTheDocument()
  })

  test('renders admin messages', () => {
    render(<ChatMessage user="Admin" text="We are investigating." />)
    expect(screen.getByText(/admin:/i)).toBeInTheDocument()
    expect(screen.getByText(/we are investigating\./i)).toBeInTheDocument()
  })
})