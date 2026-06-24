import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { 
  FullPageError, 
  InlineError, 
  EmptyState, 
  getErrorMessage, 
  ERROR_MESSAGES 
} from '../error-state'

/**
 * Error State Component Tests
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
describe('Error State Components', () => {
  // ============================================================================
  // getErrorMessage Tests - Requirements: 7.5
  // ============================================================================
  describe('getErrorMessage (Requirement 7.5)', () => {
    it('returns default message for null error', () => {
      expect(getErrorMessage(null)).toBe(ERROR_MESSAGES.default)
    })

    it('returns default message for undefined error', () => {
      expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES.default)
    })

    it('returns network error message for fetch failures', () => {
      const error = new Error('Failed to fetch')
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NetworkError)
    })

    it('returns timeout error message for timeout errors', () => {
      const error = new Error('Request timeout')
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.TimeoutError)
    })

    it('returns server error message for 500 errors', () => {
      const error = new Error('Server returned 500')
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.ServerError)
    })

    it('returns Chinese error message as-is', () => {
      const chineseMessage = '自定义中文错误消息'
      const error = new Error(chineseMessage)
      expect(getErrorMessage(error)).toBe(chineseMessage)
    })

    it('returns abort error message for aborted requests', () => {
      const error = new Error('Request aborted')
      error.name = 'AbortError'
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.AbortError)
    })
  })

  // ============================================================================
  // FullPageError Tests - Requirements: 7.1
  // ============================================================================
  describe('FullPageError (Requirement 7.1)', () => {
    it('renders error title', () => {
      render(<FullPageError error={new Error('Test error')} />)
      expect(screen.getByText('加载失败')).toBeInTheDocument()
    })

    it('renders custom title when provided', () => {
      render(
        <FullPageError 
          error={new Error('Test error')} 
          title="自定义标题" 
        />
      )
      expect(screen.getByText('自定义标题')).toBeInTheDocument()
    })

    it('renders error message from error object', () => {
      render(<FullPageError error={new Error('Failed to fetch')} />)
      expect(screen.getByText(ERROR_MESSAGES.NetworkError)).toBeInTheDocument()
    })

    it('renders custom description when provided', () => {
      render(
        <FullPageError 
          error={new Error('Test error')} 
          description="自定义描述" 
        />
      )
      expect(screen.getByText('自定义描述')).toBeInTheDocument()
    })

    it('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      render(<FullPageError error={new Error('Test error')} onRetry={onRetry} />)
      expect(screen.getByRole('button', { name: /重试加载/i })).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<FullPageError error={new Error('Test error')} onRetry={onRetry} />)
      fireEvent.click(screen.getByRole('button', { name: /重试加载/i }))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('does not render retry button when onRetry is not provided', () => {
      render(<FullPageError error={new Error('Test error')} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('has role="alert" for accessibility', () => {
      render(<FullPageError error={new Error('Test error')} />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-live="assertive" for screen readers', () => {
      render(<FullPageError error={new Error('Test error')} />)
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
    })
  })

  // ============================================================================
  // InlineError Tests - Requirements: 7.2, 7.3, 7.4
  // ============================================================================
  describe('InlineError (Requirements 7.2, 7.3, 7.4)', () => {
    it('renders error message from error object', () => {
      render(<InlineError error={new Error('Failed to fetch')} />)
      expect(screen.getByText(ERROR_MESSAGES.NetworkError)).toBeInTheDocument()
    })

    it('renders custom error text when provided', () => {
      render(<InlineError error={new Error('Test')} errorText="自定义错误" />)
      expect(screen.getByText('自定义错误')).toBeInTheDocument()
    })

    it('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      render(<InlineError error={new Error('Test')} onRetry={onRetry} />)
      expect(screen.getByRole('button', { name: /重试加载/i })).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked (Requirement 7.3)', () => {
      const onRetry = vi.fn()
      render(<InlineError error={new Error('Test')} onRetry={onRetry} />)
      fireEvent.click(screen.getByRole('button', { name: /重试加载/i }))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('does not render retry button when onRetry is not provided', () => {
      render(<InlineError error={new Error('Test')} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('has role="alert" for accessibility', () => {
      render(<InlineError error={new Error('Test')} />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-live="polite" for screen readers', () => {
      render(<InlineError error={new Error('Test')} />)
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
    })
  })

  // ============================================================================
  // EmptyState Tests
  // ============================================================================
  describe('EmptyState', () => {
    it('renders default title', () => {
      render(<EmptyState />)
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })

    it('renders custom title when provided', () => {
      render(<EmptyState title="没有课程" />)
      expect(screen.getByText('没有课程')).toBeInTheDocument()
    })

    it('renders default description', () => {
      render(<EmptyState />)
      expect(screen.getByText('当前没有可显示的内容')).toBeInTheDocument()
    })

    it('renders custom description when provided', () => {
      render(<EmptyState description="请稍后再试" />)
      expect(screen.getByText('请稍后再试')).toBeInTheDocument()
    })

    it('renders action button when provided', () => {
      render(<EmptyState action={<button>刷新</button>} />)
      expect(screen.getByRole('button', { name: '刷新' })).toBeInTheDocument()
    })

    it('has role="status" for accessibility', () => {
      render(<EmptyState />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })
})
