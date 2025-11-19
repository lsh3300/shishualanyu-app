"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { ProductGridCard } from "@/components/ui/product-grid-card"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Product } from "@/types/product"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "clothing", label: "服饰" },
  { id: "home", label: "家居" },
  { id: "accessories", label: "配饰" },
  { id: "tie-dye", label: "扎染" },
  { id: "wax-resist", label: "蜡染" },
]

const resolveProductImage = (product: any) => {
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
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('获取产品数据失败')
        }
        const data = await response.json()
        
        // 处理产品数据，确保属性名正确
        const processedProducts = (data.products || []).map((product: any) => {
          const imagesArray = Array.isArray(product.images)
            ? product.images
            : product.image_url
              ? [product.image_url]
              : []

          const coverImage = resolveProductImage({
            ...product,
            images: imagesArray,
          })

          return {
            ...product,
            images: imagesArray,
            coverImage,
            sales: product.sales ?? 0,
            originalPrice: product.originalPrice ?? null,
          }
        })
        
        setProducts(processedProducts)
        setFilteredProducts(processedProducts)
      } catch (error) {
        console.error('获取产品数据失败:', error)
        setProducts([])
        setFilteredProducts([])
        setError('无法连接到 Supabase，文创商店暂时不可用。请先执行 `supabase/products-schema.sql` 并运行 `npm run seed:products` 后重新加载。')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 搜索功能
  useEffect(() => {
    let filtered = products

    // 应用搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const handleFilterChange = (filterId: string) => {
    let filtered = products

    // 应用搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 应用分类过滤
    if (filterId === "all") {
      // 不进行额外过滤
    } else if (filterId === "tie-dye") {
      filtered = filtered.filter(product => product.name.includes("扎染"))
    } else if (filterId === "wax-resist") {
      filtered = filtered.filter(product => product.name.includes("蜡染"))
    } else if (filterId === "clothing") {
      filtered = filtered.filter(product => 
        product.name.includes("T恤") || product.name.includes("丝巾")
      )
    } else if (filterId === "home") {
      filtered = filtered.filter(product => 
        product.name.includes("抱枕") || product.name.includes("桌布") || product.name.includes("壁挂")
      )
    } else if (filterId === "accessories") {
      filtered = filtered.filter(product => product.name.includes("帆布包"))
    }

    setFilteredProducts(filtered)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              <div className="mt-2">
                <a 
                  href="/setup-database" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  点击此处初始化数据库
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">文创商店</h1>
          <Link href="/store/ai-create">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>AI创作</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Search */}
      <section className="p-4">
        <SearchBar 
          placeholder="搜索商品..." 
          onSearch={(query) => setSearchTerm(query)}
        />
      </section>

      {/* Filters */}
      <section className="px-4 mb-6">
        <FilterBar options={filterOptions} onFilterChange={handleFilterChange} />
      </section>

      {/* Product Grid */}
      <section className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">加载产品数据中...</p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product: any) => {
              const coverImage = resolveProductImage(product)
              const routeId = product.slug || product.id

              return (
              <ProductGridCard
                  key={product.id}
                  id={product.id}
                  routeId={routeId}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={coverImage}
                  sales={product.sales}
                  isNew={product.isNew}
                  discount={product.discount}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到匹配的产品</p>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
