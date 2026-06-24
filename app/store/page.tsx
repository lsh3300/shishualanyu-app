"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ProductGridCard } from "@/components/ui/product-grid-card"
import { Bell, Search, Shirt, Sofa, Brush, Wrench, Gift, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePagination } from "@/hooks/use-pagination"
import { useInfiniteScroll, createInfiniteScrollConfig } from "@/hooks/use-infinite-scroll"
import { LoadingStateFooter } from "@/components/ui/loading-state-footer"
import { FullPageError } from "@/components/ui/error-state"
import { ProductCardSkeleton } from "@/components/ui/home-skeleton"
import { OptimizedImage } from "@/components/ui/optimized-image"

// 产品类型定义
interface StoreProduct {
  id: string
  slug?: string | null
  name: string
  price: number
  description?: string | null
  images?: string[]
  coverImage?: string | null
  image_url?: string | null
  sales?: number | null
  originalPrice?: number | null
  isNew?: boolean | null
  discount?: number | null
  category?: string | null
}

// API 响应类型
interface ProductsApiResponse {
  products: Array<Record<string, unknown>>
  total?: number
  page?: number
  hasMore?: boolean
}

// 从 API 响应提取并格式化产品数据
function transformProducts(response: unknown): StoreProduct[] {
  const data = response as ProductsApiResponse
  const productsData = data.products || []
  
  return productsData.map((product) => ({
    id: typeof product.id === 'string' ? product.id : '',
    slug: typeof product.slug === 'string' ? product.slug : null,
    name: typeof product.name === 'string' ? product.name : '蓝染产品',
    price: typeof product.price === 'number' ? product.price : 0,
    description: typeof product.description === 'string' ? product.description : null,
    images: Array.isArray(product.images) ? product.images as string[] : undefined,
    coverImage: typeof product.coverImage === 'string' ? product.coverImage : null,
    image_url: typeof product.image_url === 'string' ? product.image_url : null,
    sales: typeof product.sales === 'number' ? product.sales : null,
    originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : null,
    isNew: typeof product.isNew === 'boolean' ? product.isNew : null,
    discount: typeof product.discount === 'number' ? product.discount : null,
    category: typeof product.category === 'string' ? product.category : null,
  }))
}

// 提取总数
function extractTotal(response: unknown): number {
  const data = response as ProductsApiResponse
  return data.total || 0
}

// 解析产品图片
const resolveProductImage = (product: StoreProduct) => {
  const candidates: string[] = []

  if (Array.isArray(product.images)) {
    candidates.push(...product.images)
  }
  if (typeof product.coverImage === "string") {
    candidates.unshift(product.coverImage)
  }
  if (typeof product.image_url === "string") {
    candidates.push(product.image_url)
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "string") continue
    const trimmed = candidate.trim()
    if (!trimmed) continue
    return trimmed.startsWith("/") ? trimmed : trimmed
  }

  return "/placeholder.jpg"
}

export default function StorePage() {
  useEffect(() => {
    const mobileFrame = document.querySelector('.mobile-frame')
    const body = document.body

    mobileFrame?.classList.add('shared-page-fixed-bg')
    body.classList.add('shared-page-fixed-bg')

    return () => {
      mobileFrame?.classList.remove('shared-page-fixed-bg')
      body.classList.remove('shared-page-fixed-bg')
    }
  }, [])

  // 使用 usePagination 进行分页加载
  const {
    items: products,
    loading,
    loadingMore,
    hasMore,
    error,
    total,
    loadMore,
    retry,
  } = usePagination<StoreProduct>({
    endpoint: '/api/products',
    pageSize: 6,
    transformer: transformProducts,
    totalExtractor: extractTotal,
    autoLoad: true,
    fetchOptions: {
      timeoutMs: 7000,
      retries: 0,
    },
  })

  // 使用 useInfiniteScroll 实现滚动加载
  const infiniteScrollConfig = createInfiniteScrollConfig(
    { hasMore, loading, loadingMore },
    loadMore,
    { enabled: !loading && products.length > 0, threshold: 100 }
  )
  const { triggerRef } = useInfiniteScroll(infiniteScrollConfig)

  const errorMessage = error
    ? "当前暂时无法加载文创商品，请稍后刷新重试。"
    : null
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [activeTag, setActiveTag] = useState<"all" | "new" | "hot">("all")

  // 本地筛选后的产品列表
  const filteredProducts = useMemo(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (activeCategory === "all") {
      // no-op
    } else if (activeCategory === "tie-dye") {
      filtered = filtered.filter((product) => product.name.includes("扎染"))
    } else if (activeCategory === "wax-resist") {
      filtered = filtered.filter((product) => product.name.includes("蜡染"))
    } else if (activeCategory === "clothing") {
      filtered = filtered.filter(
        (product) => product.name.includes("T恤") || product.name.includes("丝巾")
      )
    } else if (activeCategory === "home") {
      filtered = filtered.filter(
        (product) =>
          product.name.includes("抱枕") ||
          product.name.includes("桌布") ||
          product.name.includes("壁挂")
      )
    } else if (activeCategory === "accessories") {
      filtered = filtered.filter((product) => product.name.includes("布包"))
    }

    if (activeTag === "new") {
      filtered = filtered.filter((product) => !!product.isNew)
    } else if (activeTag === "hot") {
      filtered = filtered.filter((product) => (product.sales ?? 0) >= 50)
    }

    return filtered
  }, [searchTerm, products, activeCategory, activeTag])

  // 分类筛选处理
  const handleCategoryFilter = useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
  }, [])

  // 标签筛选处理
  const handleTagFilter = useCallback((tag: "all" | "new" | "hot") => {
    setActiveTag(tag)
  }, [])

  const featuredProduct = filteredProducts[0] || products[0]
  const featuredImage = featuredProduct ? resolveProductImage(featuredProduct) : "/placeholder.jpg"
  const featuredRouteId = featuredProduct ? (featuredProduct.slug || featuredProduct.id) : null

  return (
    <div className="page-container page-background-home-echo pb-36">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-48 h-48 bg-indigo-300/8 rounded-full blur-3xl" />
      </div>
      {errorMessage && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      <header className="nav-header shadow-sm">
        <div className="px-5 pt-3 pb-2 flex justify-between items-center">
          <div className="relative group cursor-default">
            <h1
              className="text-2xl font-serif text-indigo-900 relative z-10 drop-shadow-sm"
              style={{ fontFamily: "'Ma Shan Zheng', cursive, serif" }}
            >
              蓝染市集
            </h1>
            <div className="absolute -bottom-2 -left-2 w-full h-3 bg-indigo-200/40 -rotate-2 rounded-full blur-[1px] -z-0 group-hover:bg-indigo-300/50 transition-colors duration-500" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors active:scale-90"
              type="button"
              aria-label="搜索"
            >
              <Search className="w-[22px] h-[22px] text-indigo-800" strokeWidth={1.5} />
            </button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-indigo-50" aria-label="通知">
              <Bell className="w-[22px] h-[22px] text-indigo-800" strokeWidth={1.5} />
            </Button>
            <Link
              href="/store/ai-create"
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors active:scale-90"
              aria-label="AI 创作"
            >
              <Sparkles className="w-[22px] h-[22px] text-indigo-800" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {showSearch && (
          <div className="px-5 pb-2 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索手工蓝染好物..."
                className="w-full h-10 search-input rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      <main className="px-4 space-y-5 pt-4 relative z-10">
        {/* Featured */}
        {featuredProduct && featuredRouteId && (
          <section>
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-base font-bold text-indigo-900">特色推荐</h2>
              <Link
                className="text-xs text-muted-foreground flex items-center hover:text-primary transition-colors"
                href="/store"
              >
                查看更多
              </Link>
            </div>
            <Link href={`/store/${featuredRouteId}?from=store`} className="block">
              <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-sm group bg-muted">
                <OptimizedImage
                  src={featuredImage}
                  alt={featuredProduct.name}
                  fill
                  usage="detail"
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full text-white flex flex-col justify-end">
                  <div className="flex items-end justify-between w-full gap-4">
                    <div className="flex-1">
                      <span className="px-1.5 py-0.5 bg-primary/80 backdrop-blur-sm rounded text-[10px] font-medium mb-1 inline-block tracking-wide">
                        蓝染推荐
                      </span>
                      <h3 className="text-base font-bold mb-0.5 leading-snug line-clamp-1">{featuredProduct.name}</h3>
                      <p className="text-[10px] text-gray-200 line-clamp-1 opacity-90">{featuredProduct.description || "精选匠心好物"}</p>
                    </div>
                    <div className="shrink-0 bg-app-card text-primary px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-muted/70 transition-colors mb-0.5 border border-border">
                      立即购买
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Categories */}
        <section>
          <h2 className="text-base font-bold text-indigo-900 mb-3">热门分类</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button
              className="flex-shrink-0 flex flex-col items-center space-y-2"
              onClick={() => handleCategoryFilter("clothing")}
              type="button"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border transition-colors active:scale-95">
                <Shirt className="h-6 w-6 text-indigo-700" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">服饰系列</span>
            </button>
            <button
              className="flex-shrink-0 flex flex-col items-center space-y-2"
              onClick={() => handleCategoryFilter("home")}
              type="button"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border transition-colors active:scale-95">
                <Sofa className="h-6 w-6 text-orange-700" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">家居美物</span>
            </button>
            <button
              className="flex-shrink-0 flex flex-col items-center space-y-2"
              onClick={() => handleCategoryFilter("all")}
              type="button"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border transition-colors active:scale-95">
                <Brush className="h-6 w-6 text-teal-700" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">文创周边</span>
            </button>
            <button
              className="flex-shrink-0 flex flex-col items-center space-y-2"
              onClick={() => handleCategoryFilter("wax-resist")}
              type="button"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border transition-colors active:scale-95">
                <Wrench className="h-6 w-6 text-slate-700" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">染料工具</span>
            </button>
            <button
              className="flex-shrink-0 flex flex-col items-center space-y-2"
              onClick={() => handleCategoryFilter("tie-dye")}
              type="button"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border transition-colors active:scale-95">
                <Gift className="h-6 w-6 text-pink-700" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">礼品套装</span>
            </button>
          </div>
        </section>

        {/* Tag Pills */}
        <section className="pb-2">
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTagFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-sm ${activeTag === "all" ? "bg-indigo-600 text-white" : "bg-app-card text-muted-foreground border border-border"}`}
            >
              全部{total > 0 && ` (${total})`}
            </button>
            <button
              type="button"
              onClick={() => handleTagFilter("new")}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-sm ${activeTag === "new" ? "bg-indigo-600 text-white" : "bg-app-card text-muted-foreground border border-border"}`}
            >
              新品上架
            </button>
            <button
              type="button"
              onClick={() => handleTagFilter("hot")}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-sm ${activeTag === "hot" ? "bg-indigo-600 text-white" : "bg-app-card text-muted-foreground border border-border"}`}
            >
              热销排行
            </button>
            <button
              type="button"
              onClick={() => handleCategoryFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-sm ${activeCategory === "all" ? "bg-muted text-primary border border-border" : "bg-app-card text-muted-foreground border border-border"}`}
            >
              分类: 全部
            </button>
          </div>
        </section>

        {/* Product Grid */}
        <section>
          {/* 初始加载失败时的全屏错误状态 */}
          {error && products.length === 0 ? (
            <FullPageError
              error={error}
              onRetry={retry}
              title="产品加载失败"
              description="无法加载产品列表，请检查网络连接后重试"
            />
          ) : /* 初始加载骨架屏 */
          loading && products.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => {
                  const coverImage = resolveProductImage(product)
                  const routeId = product.slug || product.id

                  return (
                    <ProductGridCard
                      key={product.id}
                      id={product.id}
                      routeId={routeId}
                      href={`/store/${routeId}?from=store`}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.originalPrice ?? undefined}
                      image={coverImage}
                      sales={product.sales ?? 0}
                      isNew={product.isNew ?? undefined}
                      discount={product.discount ?? undefined}
                      subtitle={product.description ?? undefined}
                    />
                  )
                })}
              </div>

              {/* 加载更多时的骨架屏 */}
              {loadingMore && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ProductCardSkeleton key={`loading-more-${i}`} />
                  ))}
                </div>
              )}
            </>
          ) : !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">没有找到匹配的商品</p>
            </div>
          ) : null}

          {/* 滚动触发器和加载状态 */}
          <div ref={triggerRef}>
            <LoadingStateFooter
              loading={loadingMore}
              hasMore={hasMore && filteredProducts.length > 0}
              error={error}
              onRetry={retry}
              loadingText="加载更多产品..."
              noMoreText="--- 宸插姞杞藉叏閮ㄤ骇鍝?---"
              errorText="加载失败，请重试"
            />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}


