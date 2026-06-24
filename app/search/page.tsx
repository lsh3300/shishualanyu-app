'use client'

import { useEffect, useMemo, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search, X, SlidersHorizontal, Flame, Clock, TrendingUp, Package, BookOpen, FileText } from "lucide-react"
import { SearchResultItem, SearchEntityType } from "@/types/search"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useSearchController, type SearchControllerType } from "@/hooks/use-search-controller"

// 类型选项配置
const TYPE_OPTIONS: { id: 'all' | SearchEntityType, label: string, icon: typeof Package }[] = [
  { id: 'all', label: '全部', icon: Search },
  { id: 'product', label: '商品', icon: Package },
  { id: 'course', label: '课程', icon: BookOpen },
  { id: 'article', label: '文章', icon: FileText },
]

// 热门搜索
const HOT_SEARCHES = [
  { text: '扎染入门', type: 'course', hot: true },
  { text: '蓝染丝巾', type: 'product', hot: true },
  { text: '蜡染工艺', type: 'course' },
  { text: '靛蓝染料', type: 'product' },
  { text: '传统蓝染', type: 'article', hot: true },
  { text: '手工DIY套装', type: 'product' },
]

// 构建结果链接
function buildResultLink(result: SearchResultItem, returnTo?: string): string {
  const slugOrId = result.slug || result.entity_id
  const suffix = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''
  switch (result.entity_type) {
    case 'product': return `/store/${slugOrId}${suffix}`
    case 'course': return `/teaching/${slugOrId}${suffix}`
    case 'article': return `/culture/${slugOrId}${suffix}`
    default: return '/'
  }
}

// 获取类型颜色
function getTypeColor(type: SearchEntityType): string {
  switch (type) {
    case 'product': return 'bg-amber-500'
    case 'course': return 'bg-indigo-500'
    case 'article': return 'bg-emerald-500'
    default: return 'bg-gray-500'
  }
}

// 获取类型标签
function getTypeLabel(type: SearchEntityType): string {
  const option = TYPE_OPTIONS.find(o => o.id === type)
  return option?.label || type
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q')?.trim() ?? ''
  const typeParam = searchParams.get('type') as SearchEntityType | null
  const currentSearchPath = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  
  // 状态
  const [searchInput, setSearchInput] = useState(query)
  const [showFilters, setShowFilters] = useState(false)
  
  const {
    searchHistory,
    clearHistory,
    removeHistoryItem,
    selectedType,
    handleTypeChange,
    executeSearch,
    results,
    loading,
    error,
    hasMore,
    loadMoreRef,
    showEmptyState,
    retry,
  } = useSearchController({
    query,
    typeParam,
    enableFetch: true,
    limit: 20,
  })
  
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  // 执行搜索
  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch(searchInput)
  }

  // 删除单条历史
  const handleRemoveHistoryItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeHistoryItem(item)
  }

  // 计算瀑布流列
  const columns = useMemo(() => {
    const col1: SearchResultItem[] = []
    const col2: SearchResultItem[] = []
    let height1 = 0
    let height2 = 0
    
    results.forEach((item) => {
      // 估算高度：图片高度 + 内容高度
      const estimatedHeight = (item.cover_image ? 180 : 100) + 
        (item.title?.length || 0) * 2 + 
        (item.summary ? 40 : 0) + 
        (item.price !== null ? 30 : 20)
      
      if (height1 <= height2) {
        col1.push(item)
        height1 += estimatedHeight
      } else {
        col2.push(item)
        height2 += estimatedHeight
      }
    })
    
    return [col1, col2]
  }, [results])

  return (
    <div 
      className="page-container flex flex-col pb-20"
      style={{ fontFamily: "'Noto Serif SC', serif" }}
    >

      {/* 顶部导航栏 */}
      <header className="nav-header shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button 
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-bold text-indigo-900">探索发现</h1>
          
          <div className="flex-1" />
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              showFilters ? 'bg-indigo-100 text-indigo-600' : 'text-indigo-500 hover:bg-indigo-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 搜索区域 */}
      <section className="px-4 pt-3 pb-2">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            <input
              ref={searchInputRef}
              data-testid="search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索染艺·匠人·好物"
              className="w-full h-12 search-input rounded-2xl pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-14 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              data-testid="search-submit"
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* 类型筛选 - Tab 样式 */}
        <div className="mt-3 flex items-center border-b border-indigo-100">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleTypeChange(option.id as SearchControllerType)}
              data-testid={`search-type-${option.id}`}
              className={`relative flex-1 py-2.5 text-sm font-medium transition-colors ${
                selectedType === option.id
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-indigo-500'
              }`}
            >
              {option.label}
              {selectedType === option.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="px-4 py-3 bg-app-background-blur border-b border-border animate-dropdown">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">排序方式</span>
          </div>
          <div className="flex gap-2">
            {['综合排序', '最新发布', '价格升序', '价格降序'].map((sort) => (
              <button
                key={sort}
                className="px-3 py-1.5 text-xs rounded-full bg-muted text-primary hover:bg-muted/70 transition-colors"
              >
                {sort}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="flex-1 px-4 py-3">
        {/* 空状态 - 无搜索词时显示 */}
        {showEmptyState && (
          <div className="space-y-6">
            {/* 搜索历史 */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>搜索历史</span>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-primary hover:text-primary/90"
                  >
                    清除
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => executeSearch(item)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 bg-app-card rounded-full text-sm text-muted-foreground hover:bg-muted/70 hover:text-primary border border-border transition-colors shadow-sm"
                    >
                      <span>{item}</span>
                      <X 
                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => handleRemoveHistoryItem(item, e)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 热门搜索 */}
            <div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>热门搜索</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {HOT_SEARCHES.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => executeSearch(item.text, { type: item.type as SearchControllerType })}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hot-tag-hover ${
                      item.type === 'product' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' :
                      item.type === 'course' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200' :
                      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {item.hot && <Flame className="w-3.5 h-3.5 text-red-500" />}
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 探索提示 */}
            <div className="mt-8 text-center py-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                <Search className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">探索蓝染世界</p>
              <p className="text-sm text-muted-foreground">搜索商品、课程、文章，发现更多精彩</p>
            </div>
          </div>
        )}

        {/* 搜索结果统计 */}
        {query && results.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              找到 <span className="font-medium text-primary">{results.length}</span> 个结果
            </p>
          </div>
        )}

        {/* 瀑布流布局 */}
        {results.length > 0 && (
          <div className="flex gap-3">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex-1 space-y-3">
                {column.map((result, index) => (
                  <Link
                    key={`${result.entity_type}-${result.entity_id}`}
                    href={buildResultLink(result, currentSearchPath)}
                    className="block group waterfall-item"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="bg-app-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 waterfall-card">
                      {/* 图片区域 */}
                      {result.cover_image && (
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                          <Image
                            src={result.cover_image}
                            alt={result.title || '搜索结果'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* 类型标签 */}
                          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${getTypeColor(result.entity_type)}`}>
                            {getTypeLabel(result.entity_type)}
                          </div>
                        </div>
                      )}
                      
                      {/* 内容区域 */}
                      <div className="p-3">
                        {/* 标签 */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {result.tags.slice(0, 2).map((tag) => (
                              <span 
                                key={tag} 
                                className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-muted text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* 标题 */}
                        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                          {result.title || '未命名内容'}
                        </h3>
                        
                        {/* 摘要 - 仅部分显示 */}
                        {result.summary && colIndex === 0 && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
                            {result.summary}
                          </p>
                        )}
                        
                        {/* 底部信息 */}
                        <div className="flex items-center justify-between">
                          {result.price !== null ? (
                            <div className="flex items-baseline">
                              <span className="text-[10px] font-bold text-red-600">¥</span>
                              <span className="text-base font-bold text-red-600">{result.price}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium">免费</span>
                          )}
                          {result.updated_at && (
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(result.updated_at).toLocaleDateString('zh-CN', {
                                month: 'numeric',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 无结果状态 */}
        {query && !loading && results.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
              <Search className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">未找到相关结果</p>
            <p className="text-sm text-muted-foreground mb-4">试试其他关键词或调整筛选条件</p>
            <button
              onClick={() => {
                setSearchInput('')
                router.push('/search')
              }}
              className="px-4 py-2 text-sm font-medium text-primary bg-muted rounded-full hover:bg-muted/70 transition-colors"
            >
              清除搜索
            </button>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl">😢</span>
            </div>
            <p className="text-base font-medium text-foreground mb-1">搜索出错了</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
            >
              重新尝试
            </button>
          </div>
        )}

        {/* 加载更多触发器 */}
        <div ref={loadMoreRef} className="h-4" />

        {/* 加载状态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-10 h-10 mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-border"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            </div>
            <span className="text-sm text-muted-foreground">搜索中...</span>
          </div>
        )}

        {/* 已加载全部 */}
        {query && results.length > 0 && !hasMore && !loading && (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
              <span className="text-xs text-primary">已显示全部结果</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
