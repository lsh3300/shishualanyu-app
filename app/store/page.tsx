"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { ProductGridCard } from "@/components/ui/product-grid-card"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { productsData } from "@/data/models"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "clothing", label: "服饰" },
  { id: "home", label: "家居" },
  { id: "accessories", label: "配饰" },
  { id: "tie-dye", label: "扎染" },
  { id: "wax-resist", label: "蜡染" },
]

// 将productsData对象转换为数组格式，以便在页面中使用
const products = Object.values(productsData)

export default function StorePage() {
  const [filteredProducts, setFilteredProducts] = useState(products)

  const handleFilterChange = (filterId: string) => {
    if (filterId === "all") {
      setFilteredProducts(products)
    } else {
      // 根据筛选条件过滤商品
      const filtered = products.filter((product) => {
        // 根据筛选条件进行过滤
        if (filterId === "tie-dye") {
          return product.name.includes("扎染")
        } else if (filterId === "wax-resist") {
          return product.name.includes("蜡染")
        } else if (filterId === "clothing") {
          return product.name.includes("T恤") || product.name.includes("丝巾")
        } else if (filterId === "home") {
          return product.name.includes("抱枕") || product.name.includes("桌布") || product.name.includes("壁挂")
        } else if (filterId === "accessories") {
          return product.name.includes("帆布包")
        }
        return false
      })
      setFilteredProducts(filtered)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
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
        <SearchBar placeholder="搜索商品..." />
      </section>

      {/* Filters */}
      <section className="px-4 mb-6">
        <FilterBar options={filterOptions} onFilterChange={handleFilterChange} />
      </section>

      {/* Product Grid */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductGridCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.images[0]} // 使用images数组的第一个元素作为主图
              sales={product.sales}
              isNew={product.isNew}
              discount={product.discount}
            />
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
