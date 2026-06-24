'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchEntityType, SearchResponse, SearchResultItem } from '@/types/search'

export type SearchControllerType = 'all' | SearchEntityType

type ExecuteSearchOptions = {
  type?: SearchControllerType
}

type UseSearchControllerOptions = {
  query?: string
  typeParam?: SearchEntityType | null
  enableFetch?: boolean
  limit?: number
}

export function useSearchController(options: UseSearchControllerOptions = {}) {
  const { query = '', typeParam = null, enableFetch = false, limit = 20 } = options

  const router = useRouter()

  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const [selectedType, setSelectedType] = useState<SearchControllerType>(typeParam || 'all')

  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory')
    if (!saved) return

    try {
      setSearchHistory(JSON.parse(saved))
    } catch (e) {
      console.error('加载搜索历史失败:', e)
    }
  }, [])

  useEffect(() => {
    setSelectedType(typeParam || 'all')
  }, [typeParam])

  const saveToHistory = useCallback((text: string) => {
    const value = text.trim()
    if (!value) return

    setSearchHistory((prev) => {
      const next = [value, ...prev.filter((item) => item !== value)].slice(0, 10)
      localStorage.setItem('searchHistory', JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }, [])

  const removeHistoryItem = useCallback((item: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((h) => h !== item)
      localStorage.setItem('searchHistory', JSON.stringify(next))
      return next
    })
  }, [])

  const buildSearchUrl = useCallback((text: string, type?: SearchControllerType) => {
    const q = text.trim()
    const params = new URLSearchParams()
    params.set('q', q)

    const targetType = type ?? selectedType
    if (targetType && targetType !== 'all') {
      params.set('type', targetType)
    }

    return `/search?${params.toString()}`
  }, [selectedType])

  const executeSearch = useCallback(
    (text: string, opts: ExecuteSearchOptions = {}) => {
      const q = text.trim()
      if (!q) return

      saveToHistory(q)
      router.push(buildSearchUrl(q, opts.type))
    },
    [buildSearchUrl, router, saveToHistory]
  )

  const handleTypeChange = useCallback(
    (type: SearchControllerType) => {
      setSelectedType(type)
      if (!query) return

      router.push(buildSearchUrl(query, type))
    },
    [buildSearchUrl, query, router]
  )

  const fetchResults = useCallback(
    async (currentPage: number, append: boolean) => {
      if (!enableFetch) return
      if (!query) return

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('q', query)
        if (selectedType !== 'all') {
          params.append('type', selectedType)
        }
        params.set('page', String(currentPage))
        params.set('limit', String(limit))

        const response = await fetch(`/api/search?${params.toString()}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('搜索服务暂时不可用')
        }

        const data: SearchResponse = await response.json()
        setHasMore(data.hasMore)
        setResults((prev) => (append ? [...prev, ...data.results] : data.results))
      } catch (err) {
        console.error('搜索失败:', err)
        setError(err instanceof Error ? err.message : '搜索失败')
      } finally {
        setLoading(false)
      }
    },
    [enableFetch, limit, query, selectedType]
  )

  useEffect(() => {
    if (!enableFetch) return

    setPage(1)
    if (query) {
      void fetchResults(1, false)
    } else {
      setResults([])
      setHasMore(false)
      setError(null)
    }
  }, [enableFetch, fetchResults, query, selectedType])

  useEffect(() => {
    if (!enableFetch) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (!hasMore || loading) return

        const nextPage = page + 1
        setPage(nextPage)
        void fetchResults(nextPage, true)
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [enableFetch, fetchResults, hasMore, loading, page])

  const showEmptyState = useMemo(() => !query && results.length === 0, [query, results.length])

  const retry = useCallback(() => {
    void fetchResults(1, false)
  }, [fetchResults])

  return {
    searchHistory,
    saveToHistory,
    clearHistory,
    removeHistoryItem,

    selectedType,
    setSelectedType,
    handleTypeChange,

    buildSearchUrl,
    executeSearch,

    results,
    loading,
    error,
    hasMore,
    page,
    loadMoreRef,
    showEmptyState,
    retry,
  }
}
