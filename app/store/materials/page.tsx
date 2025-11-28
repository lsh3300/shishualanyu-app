'use client'
import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { MaterialCard } from "@/components/ui/material-card"
import { ArrowLeft, ShoppingCart, SearchIcon, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "tie-dye", label: "扎染材料" },
  { id: "wax-resist", label: "蜡染材料" },
  { id: "beginner", label: "初学者套装" },
  { id: "advanced", label: "进阶工具" },
  { id: "natural", label: "天然染料" },
]

export default function MaterialsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  // 从 Supabase 获取材料包产品
  useEffect(() => {
    async function fetchMaterials() {
      try {
        const supabase = createClient()
        
        // 获取所有材料包类别的产品
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', '材料包')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('获取材料包失败:', error)
          setMaterials([])
          return
        }

        // 获取每个产品的封面图
        const materialsWithImages = await Promise.all(
          (products || []).map(async (product) => {
            const { data: media } = await supabase
              .from('product_media')
              .select('url')
              .eq('product_id', product.id)
              .eq('cover', true)
              .single()
            
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              image: media?.url || '/placeholder.svg',
              description: product.description || '',
              category: getTechnique(product.metadata?.technique),
              level: product.metadata?.level || 'beginner',
            }
          })
        )
        
        setMaterials(materialsWithImages)
      } catch (err) {
        console.error('获取材料包异常:', err)
        setMaterials([])
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  // 将技术类型转换为筛选分类
  const getTechnique = (technique: string) => {
    if (!technique) return 'other'
    if (technique.includes('扎染')) return 'tie-dye'
    if (technique.includes('蜡染')) return 'wax-resist'
    if (technique.includes('天然')) return 'natural'
    return 'other'
  }

  const filteredMaterials = selectedFilter === "all" 
    ? materials 
    : materials.filter(material => 
        material.category === selectedFilter || material.level === selectedFilter
      )

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-background border-b">
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-full p-1 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">材料包</h1>
        </div>
        
        <div className="hidden md:flex">
          <SearchBar placeholder="搜索材料包..." />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <SearchIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="h-auto">
            <SearchBar placeholder="搜索材料包..." className="mt-4" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">手工染色材料</h2>
          <p className="text-muted-foreground">为您的扎染和蜡染创作提供优质材料</p>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          options={filterOptions} 
          selectedOption={selectedFilter} 
          onSelectOption={setSelectedFilter} 
        />

        {/* Material List */}
        {loading ? (
          <div className="mt-6 flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">加载材料包中...</p>
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} {...material} />
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4 text-6xl">📦</div>
              <h3 className="text-xl font-semibold mb-2">材料包即将上线</h3>
              <p className="text-muted-foreground mb-6">
                我们正在精心准备各类扎染、蜡染材料包，敬请期待！
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/teaching">
                  <Button variant="default">
                    浏览课程
                  </Button>
                </Link>
                <Link href="/store">
                  <Button variant="outline">
                    查看商品
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-10 bg-muted p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-3">材料选购小贴士</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>初学者建议选择入门套装，包含所有基础工具和材料</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>天然染料更加环保，但需要更多的操作时间和技巧</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>购买前请确认您已了解相关课程的需求，避免重复购买</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}