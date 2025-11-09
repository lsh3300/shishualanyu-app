"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ArrowLeft, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/ui/product-card"
import { CourseCard } from "@/components/ui/course-card"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"

export default function FavoritesPage() {
  const { user } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const [searchQuery, setSearchQuery] = useState("")

  // 在客户端渲染完成后，从localStorage获取登录状态
  useEffect(() => {
    const savedLoggedInState = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(savedLoggedInState)
  }, [])

  // 使用空数组作为默认数据，实际数据应从API获取
  const favoriteProducts = []
  const favoriteCourses = []

  // 根据搜索关键词过滤收藏内容
  const filteredProducts = favoriteProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredCourses = favoriteCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 如果未登录，显示提示登录界面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
              <h1 className="text-2xl font-bold mt-4">我的收藏</h1>
              <p className="text-muted-foreground mt-2">登录后可以查看您收藏的商品和课程</p>
            </div>
            <Link href="/profile">
              <Button className="w-full">去登录</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">我的收藏</h1>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 搜索框 */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索收藏内容" 
              className="pl-10 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* 标签页 */}
      <div className="p-4">
        <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="products">商品 ({favoriteProducts.length})</TabsTrigger>
            <TabsTrigger value="courses">课程 ({favoriteCourses.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-0">
            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {favoriteProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showFavorite={true}
                    isFavorite={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">暂无收藏商品</h3>
                <p className="mt-2 text-sm text-muted-foreground">您还没有收藏任何商品</p>
                <Link href="/shop">
                  <Button className="mt-4">去逛逛</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="courses" className="mt-0">
            {favoriteCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {favoriteCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    showFavorite={true}
                    isFavorite={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">暂无收藏课程</h3>
                <p className="mt-2 text-sm text-muted-foreground">您还没有收藏任何课程</p>
                <Link href="/courses">
                  <Button className="mt-4">浏览课程</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}