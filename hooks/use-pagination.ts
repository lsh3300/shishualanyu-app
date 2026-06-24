"use client"

import { useReducer, useCallback, useEffect, useRef } from "react"
import { fetchJson, type FetchJsonOptions } from "@/lib/fetch-json"

// ============================================================================
// Types
// ============================================================================

export interface PaginationConfig<T> {
  /** API 端点 URL */
  endpoint: string
  /** 每页数量，默认 9 */
  pageSize?: number
  /** 数据转换函数，从 API 响应中提取数据数组 */
  transformer: (response: unknown) => T[]
  /** 总数提取函数，从 API 响应中提取总数 */
  totalExtractor?: (response: unknown) => number
  /** 初始查询参数 */
  initialParams?: Record<string, string>
  /** 是否自动加载初始数据，默认 true */
  autoLoad?: boolean
  fetchOptions?: Pick<FetchJsonOptions, "timeoutMs" | "retries" | "retryDelayMs" | "retryBackoffFactor" | "retryJitterRatio">
}

export interface PaginationState<T> {
  /** 已加载的数据项 */
  items: T[]
  /** 是否正在加载（首次加载） */
  loading: boolean
  /** 是否正在加载更多（非首次加载） */
  loadingMore: boolean
  /** 是否还有更多数据 */
  hasMore: boolean
  /** 错误信息 */
  error: Error | null
  /** 当前页码 */
  page: number
  /** 数据总数 */
  total: number
}

export interface PaginationActions {
  /** 加载下一页 */
  loadMore: () => Promise<void>
  /** 重置并重新加载 */
  reset: (newParams?: Record<string, string>) => Promise<void>
  /** 重试失败的请求 */
  retry: () => Promise<void>
}

export type UsePaginationReturn<T> = PaginationState<T> & PaginationActions

// ============================================================================
// Reducer
// ============================================================================

type PaginationAction<T> =
  | { type: "LOAD_START"; isInitial: boolean }
  | { type: "LOAD_SUCCESS"; items: T[]; total: number; pageSize: number; isInitial: boolean }
  | { type: "LOAD_ERROR"; error: Error }
  | { type: "RESET" }

function createInitialState<T>(): PaginationState<T> {
  return {
    items: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    error: null,
    page: 0,
    total: 0,
  }
}

function paginationReducer<T>(
  state: PaginationState<T>,
  action: PaginationAction<T>
): PaginationState<T> {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        loading: action.isInitial,
        loadingMore: !action.isInitial,
        error: null,
      }

    case "LOAD_SUCCESS": {
      const newItems = action.isInitial
        ? action.items
        : [...state.items, ...action.items]
      const newPage = action.isInitial ? 1 : state.page + 1
      // hasMore is false if returned items < pageSize
      const hasMore = action.items.length >= action.pageSize

      return {
        ...state,
        items: newItems,
        loading: false,
        loadingMore: false,
        hasMore,
        error: null,
        page: newPage,
        total: action.total,
      }
    }

    case "LOAD_ERROR":
      return {
        ...state,
        loading: false,
        loadingMore: false,
        error: action.error,
        // Preserve existing items on error (Requirement 1.6)
      }

    case "RESET":
      return createInitialState<T>()

    default:
      return state
  }
}

// ============================================================================
// Hook
// ============================================================================

export function usePagination<T>(
  config: PaginationConfig<T>
): UsePaginationReturn<T> {
  const {
    endpoint,
    pageSize = 9,
    transformer,
    totalExtractor,
    initialParams = {},
    autoLoad = true,
    fetchOptions,
  } = config

  const [state, dispatch] = useReducer(
    paginationReducer<T>,
    undefined,
    createInitialState<T>
  )

  // Store current params in a ref to avoid stale closures
  const paramsRef = useRef<Record<string, string>>(initialParams)
  const configRef = useRef({ endpoint, pageSize, transformer, totalExtractor, fetchOptions })

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = { endpoint, pageSize, transformer, totalExtractor, fetchOptions }
  }, [endpoint, pageSize, transformer, totalExtractor, fetchOptions])

  // Track if initial load has been done
  const initialLoadDone = useRef(false)

  // Track the last failed page for retry
  const lastFailedPage = useRef<number | null>(null)

  /**
   * Internal fetch function
   */
  const fetchPage = useCallback(
    async (pageNum: number, isInitial: boolean): Promise<void> => {
      const { endpoint, pageSize, transformer, totalExtractor, fetchOptions } = configRef.current
      const params = paramsRef.current

      dispatch({ type: "LOAD_START", isInitial })

      try {
        // Build URL with query parameters
        const url = new URL(endpoint, window.location.origin)
        url.searchParams.set("page", String(pageNum))
        url.searchParams.set("limit", String(pageSize))

        // Add additional params
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.set(key, value)
          }
        })

        const response = await fetchJson<unknown>(url.pathname + url.search, {
          timeoutMs: 12000,
          retries: 1,
          ...fetchOptions,
        })

        const items = transformer(response)
        const total = totalExtractor ? totalExtractor(response) : 0

        // Clear failed page on success
        lastFailedPage.current = null

        dispatch({
          type: "LOAD_SUCCESS",
          items,
          total,
          pageSize,
          isInitial,
        })
      } catch (err) {
        // Store failed page for retry
        lastFailedPage.current = pageNum

        dispatch({
          type: "LOAD_ERROR",
          error: err instanceof Error ? err : new Error(String(err)),
        })
      }
    },
    []
  )

  /**
   * Load more items (next page)
   * Requirements: 1.4
   */
  const loadMore = useCallback(async (): Promise<void> => {
    // Prevent duplicate requests (Requirement 2.4)
    if (state.loading || state.loadingMore || !state.hasMore) {
      return
    }

    const nextPage = state.page + 1
    await fetchPage(nextPage, false)
  }, [state.loading, state.loadingMore, state.hasMore, state.page, fetchPage])

  /**
   * Reset and reload from first page
   * Requirements: 1.7
   */
  const reset = useCallback(
    async (newParams?: Record<string, string>): Promise<void> => {
      // Update params if provided
      if (newParams !== undefined) {
        paramsRef.current = newParams
      }

      dispatch({ type: "RESET" })
      initialLoadDone.current = false

      // Fetch first page
      await fetchPage(1, true)
      initialLoadDone.current = true
    },
    [fetchPage]
  )

  /**
   * Retry the last failed request
   */
  const retry = useCallback(async (): Promise<void> => {
    if (lastFailedPage.current !== null) {
      const pageToRetry = lastFailedPage.current
      const isInitial = pageToRetry === 1
      await fetchPage(pageToRetry, isInitial)
    } else if (state.error) {
      // If no specific failed page, retry current page + 1
      const nextPage = state.page + 1
      await fetchPage(nextPage, state.page === 0)
    }
  }, [state.error, state.page, fetchPage])

  /**
   * Initial load effect
   * Requirements: 1.3
   */
  useEffect(() => {
    if (autoLoad && !initialLoadDone.current) {
      initialLoadDone.current = true
      fetchPage(1, true)
    }
  }, [autoLoad, fetchPage])

  return {
    ...state,
    loadMore,
    reset,
    retry,
  }
}

// ============================================================================
// Utility: Create typed pagination hook for specific data types
// ============================================================================

export function createPaginationHook<T>(
  defaultConfig: Partial<PaginationConfig<T>>
) {
  return function useTypedPagination(
    overrideConfig: Partial<PaginationConfig<T>> = {}
  ): UsePaginationReturn<T> {
    const mergedConfig = {
      ...defaultConfig,
      ...overrideConfig,
    } as PaginationConfig<T>

    return usePagination<T>(mergedConfig)
  }
}
