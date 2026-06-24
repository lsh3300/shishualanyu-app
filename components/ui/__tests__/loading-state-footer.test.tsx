/**
 * Unit Tests for LoadingStateFooter Component
 * 
 * Feature: lazy-loading-system
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoadingStateFooter } from '../loading-state-footer'

describe('LoadingStateFooter', () => {
  // ============================================================================
  // Requirement 3.1: Loading State with Spinner
  // ============================================================================
  describe('Loading State (Requirement 3.1)', () => {
    it('displays spinner animation when loading is true', () => {
      render(<LoadingStateFooter loading={true} hasMore={true} />)
      
      // Check for loading text
      expect(screen.getByText('加载中...')).toBeInTheDocument()
      
      // Check for aria-busy attribute
      const container = screen.getByRole('status')
      expect(container).toHaveAttribute('aria-busy', 'true')
    })

    it('displays custom loading text when provided', () => {
      render(
        <LoadingStateFooter 
          loading={true} 
          hasMore={true} 
          loadingText="正在加载数据..."
        />
      )
      
      expect(screen.getByText('正在加载数据...')).toBeInTheDocument()
    })

    it('has screen reader text for loading state', () => {
      render(<LoadingStateFooter loading={true} hasMore={true} />)
      
      expect(screen.getByText('正在加载更多内容')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Requirement 3.2: HasMore State
  // ============================================================================
  describe('HasMore State (Requirement 3.2)', () => {
    it('displays "加载更多" when hasMore is true and not loading', () => {
      render(<LoadingStateFooter loading={false} hasMore={true} />)
      
      expect(screen.getByText('加载更多')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Requirement 3.3: No More Data State
  // ============================================================================
  describe('No More Data State (Requirement 3.3)', () => {
    it('displays "没有更多了" when hasMore is false', () => {
      render(<LoadingStateFooter loading={false} hasMore={false} />)
      
      expect(screen.getByText('没有更多了')).toBeInTheDocument()
    })

    it('displays custom noMoreText when provided', () => {
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={false} 
          noMoreText="已经到底啦"
        />
      )
      
      expect(screen.getByText('已经到底啦')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Requirement 3.4: Error State with Retry Button
  // ============================================================================
  describe('Error State (Requirement 3.4)', () => {
    it('displays error message when error is provided', () => {
      const error = new Error('Network error')
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
        />
      )
      
      expect(screen.getByText('加载失败，请重试')).toBeInTheDocument()
    })

    it('displays custom error text when provided', () => {
      const error = new Error('Network error')
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
          errorText="网络连接失败"
        />
      )
      
      expect(screen.getByText('网络连接失败')).toBeInTheDocument()
    })

    it('displays retry button when onRetry is provided', () => {
      const error = new Error('Network error')
      const onRetry = vi.fn()
      
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
          onRetry={onRetry}
        />
      )
      
      expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', () => {
      const error = new Error('Network error')
      const onRetry = vi.fn()
      
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
          onRetry={onRetry}
        />
      )
      
      const retryButton = screen.getByRole('button', { name: /重试/i })
      fireEvent.click(retryButton)
      
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('does not display retry button when onRetry is not provided', () => {
      const error = new Error('Network error')
      
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
        />
      )
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('has role="alert" for error state', () => {
      const error = new Error('Network error')
      
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
        />
      )
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Requirement 3.6: ARIA Accessibility
  // ============================================================================
  describe('Accessibility (Requirement 3.6)', () => {
    it('has aria-live="polite" for loading state', () => {
      render(<LoadingStateFooter loading={true} hasMore={true} />)
      
      const container = screen.getByRole('status')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })

    it('has aria-live="polite" for no more data state', () => {
      render(<LoadingStateFooter loading={false} hasMore={false} />)
      
      const container = screen.getByRole('status')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })

    it('has aria-live="polite" for error state', () => {
      const error = new Error('Network error')
      
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
        />
      )
      
      const container = screen.getByRole('alert')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })

    it('retry button has aria-label', () => {
      const error = new Error('Network error')
      const onRetry = vi.fn()
      
      render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={true} 
          error={error}
          onRetry={onRetry}
        />
      )
      
      const retryButton = screen.getByRole('button')
      expect(retryButton).toHaveAttribute('aria-label', '重试加载')
    })
  })

  // ============================================================================
  // State Priority Tests
  // ============================================================================
  describe('State Priority', () => {
    it('error state takes priority over loading state', () => {
      const error = new Error('Network error')
      
      render(
        <LoadingStateFooter 
          loading={true} 
          hasMore={true} 
          error={error}
        />
      )
      
      // Should show error, not loading
      expect(screen.getByText('加载失败，请重试')).toBeInTheDocument()
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
    })

    it('loading state takes priority over hasMore state', () => {
      render(<LoadingStateFooter loading={true} hasMore={true} />)
      
      // Should show loading, not "加载更多"
      expect(screen.getByText('加载中...')).toBeInTheDocument()
      expect(screen.queryByText('加载更多')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // Custom className Tests
  // ============================================================================
  describe('Custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <LoadingStateFooter 
          loading={false} 
          hasMore={false} 
          className="custom-class"
        />
      )
      
      const element = container.firstChild as HTMLElement
      expect(element).toHaveClass('custom-class')
    })
  })
})
