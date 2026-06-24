import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    href: 'http://localhost:3000/',
  },
  writable: true,
})

// Mock fetch globally
global.fetch = vi.fn()
