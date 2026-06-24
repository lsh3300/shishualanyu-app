"use client"

import { useEffect, useRef, useCallback } from "react"

// ============================================================================
// Types
// ============================================================================

export interface InfiniteScrollConfig {
  /** 是否启用 */
  enabled: boolean
  /** 是否还有更多数据 */
  hasMore: boolean
  /** 是否正在加载 */
  loading: boolean
  /** 触发加载的回调 */
  onLoadMore: () => void
  /** 触发阈值（像素），默认 100 */
  threshold?: number
}

export interface UseInfiniteScrollReturn {
  /** 绑定到触发元素的 ref */
  triggerRef: React.RefObject<HTMLDivElement>
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useInfiniteScroll Hook
 * 
 * 使用 Intersection Observer API 检测元素可见性，实现滚动加载更多功能。
 * 
 * Requirements:
 * - 2.1: 使用 Intersection Observer 检测触发元素进入视口
 * - 2.2: 当触发元素可见且 hasMore 为 true 且 loading 为 false 时调用 loadMore
 * - 2.3: 提供可配置的触发阈值（默认 100px）
 * - 2.4: 加载进行中时防止重复请求
 * - 2.5: 组件卸载时清理 Intersection Observer
 */
export function useInfiniteScroll(
  config: InfiniteScrollConfig
): UseInfiniteScrollReturn {
  const {
    enabled,
    hasMore,
    loading,
    onLoadMore,
    threshold = 100,
  } = config

  const triggerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Store callback in ref to avoid stale closures
  const onLoadMoreRef = useRef(onLoadMore)
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  /**
   * Check if load should be triggered
   * Property 6: Scroll Trigger Conditions
   * loadMore should only be called when:
   * 1. element is visible (intersection)
   * 2. hasMore is true
   * 3. loading is false
   */
  const shouldTriggerLoad = useCallback(
    (isIntersecting: boolean): boolean => {
      return isIntersecting && hasMore && !loading
    },
    [hasMore, loading]
  )

  /**
   * Intersection Observer callback
   */
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry && shouldTriggerLoad(entry.isIntersecting)) {
        onLoadMoreRef.current()
      }
    },
    [shouldTriggerLoad]
  )

  /**
   * Set up and clean up Intersection Observer
   * Requirements: 2.1, 2.3, 2.5
   */
  useEffect(() => {
    const triggerElement = triggerRef.current

    // Don't observe if disabled or no element
    if (!enabled || !triggerElement) {
      return
    }

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer with threshold
    // rootMargin adds extra space to trigger earlier
    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin: `${threshold}px`,
      threshold: 0,
    })

    observer.observe(triggerElement)
    observerRef.current = observer

    // Cleanup on unmount or config change (Requirement 2.5)
    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [enabled, threshold, handleIntersection])

  return {
    triggerRef,
  }
}

// ============================================================================
// Utility: Combine with usePagination
// ============================================================================

/**
 * Helper to create infinite scroll config from pagination state
 */
export function createInfiniteScrollConfig(
  paginationState: {
    hasMore: boolean
    loading: boolean
    loadingMore: boolean
  },
  loadMore: () => void,
  options?: {
    enabled?: boolean
    threshold?: number
  }
): InfiniteScrollConfig {
  return {
    enabled: options?.enabled ?? true,
    hasMore: paginationState.hasMore,
    loading: paginationState.loading || paginationState.loadingMore,
    onLoadMore: loadMore,
    threshold: options?.threshold ?? 100,
  }
}
