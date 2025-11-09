"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { CategoryNav } from "@/components/navigation/category-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { ProductGridCard } from "@/components/ui/product-grid-card"
import { ArrowLeft, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { SearchIcon } from "lucide-react"
import Image from "next/image"

interface CategoryPageProps {
  title: string
  description: string
  bannerImage: string
  bannerTitle: string
  bannerDescription: string
  filterOptions: Array<{ id: string; label: string }>
  products: Array<{
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    sales: number
    isNew?: boolean
    discount?: number
    category?: string
  }>
  categoryType: "clothing" | "home" | "accessories"
}

export function CategoryPageTemplate({
  title,
  description,
  bannerImage,
  bannerTitle,
  bannerDescription,
  filterOptions,
  products,
  categoryType
}: CategoryPageProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const isMobile = useIsMobile()

  // 面包屑导航配置
  const breadcrumbItems = [
    { id: "home", label: "首页", href: "/" },
    { id: "store", label: "文创", href: "/store" },
    { id: "category", label: title, href: `/store/${categoryType}` },
  ]

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId)
    
    if (filterId === "all") {
      setFilteredProducts(products)
    } else if (filterId === "tie-dye") {
      setFilteredProducts(products.filter(p => p.name.includes("扎染")))
    } else if (filterId === "wax-resist") {
      setFilteredProducts(products.filter(p => p.name.includes("蜡染")))
    } else if (filterId === "indigo") {
      setFilteredProducts(products.filter(p => p.name.includes("蓝染")))
    } else {
      // 根据分类类型进行筛选
      setFilteredProducts(products.filter(p => p.category === categoryType))
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-background border-b">
        <div className="flex items-center gap-2">
          <Link href="/store" className="rounded-full p-1 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="hidden md:flex">
          <SearchBar placeholder={`搜索${title}...`} />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-5 w-5" />
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <SearchIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto">
              <SearchBar placeholder={`搜索${title}...`} className="mt-4" />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 面包屑导航 */}
      <div className="px-4 py-2">
        <CategoryNav categories={breadcrumbItems} />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Filter Bar */}
        {isFilterOpen && (
          <div className="mb-8">
            <FilterBar 
              options={filterOptions} 
              selectedOption={selectedFilter} 
              onSelectOption={handleFilterChange} 
            />
          </div>
        )}

        {/* Featured Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <Image 
            src={bannerImage} 
            alt={title} 
            className="w-full h-48 object-cover"
            width={1200}
            height={300}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-6">
            <h3 className="text-white text-2xl font-bold mb-2">{bannerTitle}</h3>
            <p className="text-white/80 mb-4">{bannerDescription}</p>
            <Button className="bg-primary hover:bg-primary/90 self-start">
              探索{title}
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductGridCard key={product.id} {...product} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}