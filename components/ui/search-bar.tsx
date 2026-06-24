'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Filter, History, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from './badge'
import { Separator } from './separator'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { SearchEntityType, SearchResponse } from '@/types/search'

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string, category?: string) => void
}

type SuggestionItem = {
  text: string
  category: string
}

const categories = [
  { id: 'all', name: '全部' },
  { id: 'products', name: '商品' },
  { id: 'courses', name: '课程' },
  { id: 'videos', name: '视频' },
  { id: 'articles', name: '文章' },
  { id: 'materials', name: '材料' },
  { id: 'techniques', name: '技法' },
]

const categoryEntityMap: Record<string, SearchEntityType | null> = {
  all: null,
  products: 'product',
  materials: 'product',
  courses: 'course',
  videos: 'course',
  articles: 'article',
  techniques: 'article',
}

const hotSearches: SuggestionItem[] = [
  { text: '扎染入门教程', category: 'courses' },
  { text: '蓝染丝巾', category: 'products' },
  { text: '蜡染工艺', category: 'courses' },
  { text: '靛蓝染料', category: 'materials' },
  { text: '传统蓝染历史', category: 'articles' },
  { text: '手工扎染 DIY', category: 'courses' },
]

export function SearchBar({
  placeholder = '搜索蓝染艺术、课程与文创...',
  className,
  onSearch,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (!savedHistory) return

    try {
      setSearchHistory(JSON.parse(savedHistory))
    } catch {
      localStorage.removeItem('searchHistory')
    }
  }, [])

  useEffect(() => {
    const keyword = searchQuery.trim()
    if (!keyword) {
      setSuggestions([])
      setLoadingSuggestions(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true)
        const params = new URLSearchParams({
          q: keyword,
          limit: '6',
        })

        const entityType = categoryEntityMap[selectedCategory || 'all']
        if (entityType) {
          params.append('type', entityType)
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`搜索建议请求失败: ${response.status}`)
        }

        const data = (await response.json()) as SearchResponse
        const nextSuggestions = data.results
          .map((item) => ({
            text: item.title?.trim() || '',
            category:
              item.entity_type === 'product'
                ? 'products'
                : item.entity_type === 'course'
                  ? 'courses'
                  : 'articles',
          }))
          .filter((item) => item.text)
          .filter(
            (item, index, array) =>
              array.findIndex(
                (current) =>
                  current.text === item.text && current.category === item.category
              ) === index
          )

        setSuggestions(nextSuggestions)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('加载搜索建议失败:', error)
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSuggestions(false)
        }
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [searchQuery, selectedCategory])

  const filteredSuggestions = useMemo(() => suggestions, [suggestions])

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return

    const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  const handleSearch = (query: string = searchQuery, category?: string) => {
    if (!query.trim()) return

    saveSearchToHistory(query)

    if (onSearch) {
      onSearch(query, category || selectedCategory || 'all')
    } else {
      const params = new URLSearchParams()
      params.set('q', query.trim())
      const inferredCategory = category || selectedCategory || 'all'
      const entityType = categoryEntityMap[inferredCategory || 'all']
      if (entityType) {
        params.append('type', entityType)
      }
      router.push(`/search?${params.toString()}`)
    }

    setShowSuggestions(false)
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
    toast({
      title: '历史记录已清除',
      variant: 'default',
    })
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setShowSuggestions(true)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    } else if (event.key === 'Escape') {
      setShowSuggestions(false)
      setShowCategories(false)
    }
  }

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
    setShowCategories(false)
  }

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion)
    handleSearch(suggestion)
  }

  const selectHistory = (historyItem: string) => {
    setSearchQuery(historyItem)
    handleSearch(historyItem)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(true)
  }

  return (
    <div className={cn('relative group', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a90a4] transition-all group-hover:text-[#1e3a5f]">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <button
          onClick={() => setShowCategories(!showCategories)}
          className="absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a90a4] transition-all hover:text-[#1e3a5f]"
          aria-label="筛选搜索分类"
        >
          <Filter className="h-3.5 w-3.5" />
        </button>

        <Input
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => {
              setShowSuggestions(false)
              setShowCategories(false)
            }, 200)
          }}
          className="h-11 rounded-full border-[#4a90a4]/30 bg-gradient-to-r from-[#1e3a5f]/5 to-[#4a90a4]/5 pl-16 pr-14 placeholder:text-[#4a90a4]/60 focus:border-[#4a90a4]/50 focus:ring-2 focus:ring-[#4a90a4]/30"
        />

        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4a90a4] transition-all hover:text-[#1e3a5f] focus:outline-none"
            aria-label="清除搜索"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => handleSearch()}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#4a90a4] text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#4a90a4]/30 focus:outline-none"
          aria-label="执行搜索"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {showCategories && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-border bg-background p-2 shadow-lg">
          <div className="grid grid-cols-2 gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => selectCategory(category.id)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  selectedCategory === category.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
              >
                {category.name}
                {selectedCategory === category.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
          {searchHistory.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">搜索历史</span>
                </div>
                <button onClick={clearSearchHistory} className="text-xs text-muted-foreground hover:text-primary">
                  清除
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    onClick={() => selectHistory(item)}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <History className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
              {(!searchQuery ? hotSearches.length : filteredSuggestions.length) > 0 && (
                <Separator className="my-2" />
              )}
            </div>
          )}

          {!searchQuery && hotSearches.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">热点搜索</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {hotSearches.map((hot, index) => (
                  <button
                    key={`${hot.text}-${index}`}
                    onClick={() => selectSuggestion(hot.text)}
                    className="flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span>{hot.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchQuery && (
            <div className="p-2">
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">搜索建议</span>
              </div>

              {loadingSuggestions ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">正在加载建议...</div>
              ) : filteredSuggestions.length > 0 ? (
                <div className="space-y-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.text}-${index}`}
                      onClick={() => selectSuggestion(suggestion.text)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <span className="truncate pr-3 text-left">{suggestion.text}</span>
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((item) => item.id === suggestion.category)?.name || suggestion.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">没有找到相关建议</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
