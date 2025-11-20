'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { SearchBar } from "@/components/ui/search-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2, Filter, ArrowLeft } from "lucide-react"
import { SearchResponse, SearchResultItem, SearchEntityType } from "@/types/search"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { OptimizedImage } from "@/components/ui/optimized-image"

const TYPE_OPTIONS: { id: 'all' | SearchEntityType, label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'product', label: '商品' },
  { id: 'course', label: '视频/课程' },
  { id: 'article', label: '文章' },
]

function buildResultLink(result: SearchResultItem): string {
  const slugOrId = result.slug || result.entity_id
  switch (result.entity_type) {
    case 'product':
      return `/store/${slugOrId}`
    case 'course':
      return `/teaching/${slugOrId}`
    case 'article':
      return `/culture/${slugOrId}`
    default:
      return '/'
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q')?.trim() ?? ''
  const typeParams = searchParams.getAll('type').map((t) => t.toLowerCase()) as SearchEntityType[]
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const activeTypes = useMemo<SearchEntityType[]>(() => {
    if (!typeParams.length) {
      return []
    }
    return Array.from(new Set(typeParams)) as SearchEntityType[]
  }, [typeParams])

  const normalizedQueryKey = useMemo(() => `${query}::${activeTypes.sort().join(',')}`, [query, activeTypes])

  const fetchResults = useCallback(async (currentPage: number = 1) => {
    const currentQuery = query
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (currentQuery) params.set('q', currentQuery)
      activeTypes.forEach((type) => params.append('type', type))
      params.set('page', String(currentPage))
      params.set('limit', '20')

      const response = await fetch(`/api/search?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('搜索 API 错误:', response.status, errorText)
        throw new Error('搜索服务暂时不可用')
      }

      const data: SearchResponse = await response.json()
      setHasMore(data.hasMore)
      setResults((prev) => (currentPage === 1 ? data.results : [...prev, ...data.results]))
    } catch (err) {
      console.error('搜索失败:', err)
      setError(err instanceof Error ? err.message : '搜索失败')
    } finally {
      setLoading(false)
    }
  }, [query, activeTypes])

  useEffect(() => {
    setPage(1)
    setResults([])
    let cancelled = false
    
    const doFetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        activeTypes.forEach((type) => params.append('type', type))
        params.set('page', '1')
        params.set('limit', '20')

        const response = await fetch(`/api/search?${params.toString()}`, {
          cache: 'no-store',
        })

        if (cancelled) return

        if (!response.ok) {
          throw new Error('搜索服务暂时不可用')
        }

        const data: SearchResponse = await response.json()
        if (!cancelled) {
          setHasMore(data.hasMore)
          setResults(data.results)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '搜索失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    doFetch()
    return () => {
      cancelled = true
    }
  }, [normalizedQueryKey]) // 只依赖 normalizedQueryKey，它已经包含了 query 和 activeTypes

  const handleTypeChange = (typeId: 'all' | SearchEntityType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (typeId === 'all') {
      params.delete('type')
    } else {
      params.delete('type')
      params.append('type', typeId)
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleSearchSubmit = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  const selectedType = activeTypes.length === 1 ? activeTypes[0] : 'all'

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="heading-secondary flex-1">全局搜索</h1>
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>
      </header>

      <section className="p-4 border-b border-border bg-background/95 backdrop-blur">
        <SearchBar placeholder="搜索商品、课程、文章..." onSearch={(value) => handleSearchSubmit(value)} />
        <div className="mt-4 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={selectedType === option.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="px-4 py-6 space-y-4">
        {error && (
          <Card className="p-4">
            <p className="text-sm text-red-500">{error}</p>
            <Button className="mt-3" onClick={() => fetchResults(1)} variant="outline">重新尝试</Button>
          </Card>
        )}

        {!error && results.length === 0 && !loading && (
          <Card className="p-10 text-center">
            <p className="text-lg font-semibold mb-2">暂无结果</p>
            <p className="text-sm text-muted-foreground">尝试调整搜索词或筛选条件</p>
          </Card>
        )}

        {results.map((result) => (
          <Link href={buildResultLink(result)} key={`${result.entity_type}-${result.entity_id}`} className="block">
            <Card className="p-4 flex gap-4 hover:shadow-lg transition-shadow">
              <div className="w-32 h-24 relative flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <OptimizedImage
                  src={result.cover_image || '/placeholder.svg'}
                  alt={result.title || '搜索结果'}
                  fill
                  className="object-cover"
                  lazy
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {TYPE_OPTIONS.find((option) => option.id === result.entity_type)?.label || result.entity_type}
                  </Badge>
                  {result.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-2">{result.title || '未命名内容'}</h3>
                {result.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{result.summary}</p>
                )}
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  {result.price !== null && <span className="font-semibold text-primary">¥{result.price}</span>}
                  {result.updated_at && (
                    <span>
                      {new Date(result.updated_at).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {hasMore && !loading && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              fetchResults(nextPage)
            }}
          >
            加载更多
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            搜索中...
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}

