"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/hooks/use-favorites"
import { ProductCard } from "@/components/ui/product-card"
import { Loader2, Heart, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Link from "next/link"
interface FavoriteProductCard {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  coverImage: string
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const { favoriteProducts, favoriteCourses, loading: favoritesLoading, error: favoritesError, fetchFavorites } = useFavorites()
  const [activeTab, setActiveTab] = useState("products")
  const router = useRouter()
  const renderHeader = () => (
    <div className="mb-8 flex items-center gap-4">
      <Link href="/profile">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold mb-2">我的收藏</h1>
        <p className="text-muted-foreground">管理您收藏的商品和内容</p>
      </div>
    </div>
  )

  // 移除自动重定向，改为显示登录提示
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push("/auth")
  //     return
  //   }
  // }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user, fetchFavorites])

  const isLoading = authLoading || favoritesLoading

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="w-full">
          {renderHeader()}
          <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载收藏内容中...</p>
        </div>
        </div>
      </div>
    )
  }

  if (favoritesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderHeader()}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <Heart className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">加载收藏失败</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {favoritesError}
            </p>
            <Button onClick={() => fetchFavorites()}>重新加载</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 用户未登录时显示登录提示
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderHeader()}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">请先登录</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              登录后可以查看和管理您的收藏内容
            </p>
            <Button onClick={() => router.push('/auth')}>
              立即登录
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 处理收藏数据，确保符合Product类型
  const products: FavoriteProductCard[] = favoriteProducts.map((item: any) => {
    const images: string[] = Array.isArray(item.images) ? item.images : []
    const coverImage =
      item.coverImage ||
      images[0] ||
      item.image_url ||
      '/placeholder.svg'

    return {
      id: item.id || '',
      name: item.name || '未知商品',
      description: item.description || '暂无描述',
      price: typeof item.price === 'number' ? item.price : 0,
      category: item.category || '默认分类',
      coverImage,
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">我的收藏</h1>
          <p className="text-muted-foreground">管理您收藏的商品和内容</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            商品收藏 ({products.length})
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            课程收藏 ({favoriteCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">还没有收藏任何商品</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  浏览我们的商品目录，点击心形图标将您喜欢的商品添加到收藏夹
                </p>
                <Link href="/store">
                  <Button>浏览商品</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.coverImage}
                  sales={0}
                  showFavorite={true}
                  isFavorite={true}
                  showAddToCart={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {favoriteCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">还没有收藏任何课程</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  浏览我们的课程目录，点击心形图标将您喜欢的课程添加到收藏夹
                </p>
                <Link href="/teaching">
                  <Button>浏览课程</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteCourses.filter(course => course && course.id).map((course) => (
                <Card key={course.id || `course-${course.title}-${Math.random()}`} className="overflow-hidden">
                  <Link href={`/teaching/${course.id}`}>
                    <div className="relative aspect-video w-full">
                      <img
                        src={course.image_url || '/placeholder.svg'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{course.instructor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">¥{course.price}</span>
                        <span className="text-xs text-muted-foreground">{course.duration}分钟</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}