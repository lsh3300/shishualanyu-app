'use client'

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ProductImageGallery } from "@/components/ui/product-image-gallery"
import { CraftsmanStory } from "@/components/ui/craftsman-story"
import { SpecSelector } from "@/components/ui/spec-selector"
import { LikeButton } from "@/components/ui/like-button"
import { CommentSection } from "@/components/ui/comment-section"
import { ArrowLeft, Heart, Share, MessageCircle, ShoppingCart, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useFavorites } from "@/hooks/use-favorites"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export interface ProductDetailTemplateProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    images: string[]
    videos?: Array<{
      id: string
      url: string
      thumbnail: string
      title: string
      duration: string
    }>
    sales: number
    isNew?: boolean
    discount?: number
    description: string
    craftsmanStory: {
      story: string
      author: string
      title: string
    }
    specs?: {
      colors?: Array<{
        id: string
        label: string
        available: boolean
      }>
      sizes?: Array<{
        id: string
        label: string
        available: boolean
      }>
    }
    details: string[]
  }
  productType?: string
}

export function ProductDetailTemplate({ product, productType = "product" }: ProductDetailTemplateProps) {
  const { addToFavorites, removeFromFavorites, isFavorite: checkIsFavorite } = useFavorites()
  const { addToCart, selectExclusiveCartItems } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(false)

  // 检查收藏状态
  useEffect(() => {
    setIsCurrentlyFavorite(checkIsFavorite(product.id))
  }, [product.id, checkIsFavorite])

  const handleFavoriteClick = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏产品",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      if (isCurrentlyFavorite) {
        await removeFromFavorites(product.id)
        setIsCurrentlyFavorite(false)
        toast({
          title: "取消收藏成功",
          description: "已从收藏夹移除"
        })
      } else {
        await addToFavorites(product.id)
        setIsCurrentlyFavorite(true)
        toast({
          title: "收藏成功",
          description: "已添加到收藏夹"
        })
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以添加购物车",
        variant: "destructive"
      })
      return
    }

    console.log('🛒 [ProductDetail] 准备加入购物车:', {
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      color: selectedColor,
      size: selectedSize
    })

    setIsLoading(true)
    try {
      await addToCart({ 
        product_id: product.id, 
        quantity: 1,
        color: selectedColor,
        size: selectedSize
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以购买商品",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await addToCart({
        product_id: product.id,
        quantity: 1,
        color: selectedColor,
        size: selectedSize
      })

      if (result.success) {
        if (result.addedItemId) {
          selectExclusiveCartItems([result.addedItemId])
          router.push(`/checkout?mode=buy-now&cartItem=${result.addedItemId}`)
        } else {
          router.push('/checkout')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/store">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex-1",
                isCurrentlyFavorite && "text-red-500"
              )}
              onClick={handleFavoriteClick}
              disabled={isLoading}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 mr-2",
                  isCurrentlyFavorite && "fill-current"
                )} 
              />
              {isCurrentlyFavorite ? "已收藏" : "收藏"}
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              咨询
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      </header>

      {/* Product Images */}
      <section className="p-4">
        <ProductImageGallery 
          images={product.images} 
          videos={product.videos}
          productName={product.name} 
        />
      </section>

      {/* Product Info */}
      <section className="px-4 mb-6">
        <div className="flex gap-2 mb-3">
          {product.isNew && (
            <Badge variant="destructive" className="text-xs">
              新品
            </Badge>
          )}
          {product.discount && (
            <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
              限时优惠
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-accent">¥{product.price}</span>
          {product.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">¥{product.originalPrice}</span>
          )}
          {product.discount && (
            <span className="text-sm text-destructive font-medium">
              省¥{product.originalPrice! - product.price}
            </span>
          )}
        </div>

        <h1 className="heading-primary mb-3">{product.name}</h1>
        <p className="body-text mb-4">{product.description}</p>
        <p className="text-sm text-muted-foreground">已售 {product.sales} 件</p>
      </section>

      {/* Craftsman Story */}
      <section className="px-4 mb-6">
        <CraftsmanStory {...product.craftsmanStory} />
      </section>

      {/* Specifications */}
      <section className="px-4 mb-6">
        <div className="bg-card rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-foreground">请选择规格</h3>
          {product.specs && product.specs.colors && (
            <SpecSelector title="颜色" options={product.specs.colors} onSelect={setSelectedColor} />
          )}
          {product.specs && product.specs.sizes && (
            <SpecSelector title="尺寸" options={product.specs.sizes} onSelect={setSelectedSize} />
          )}
          {(!product.specs || (!product.specs.colors && !product.specs.sizes)) && (
            <p className="text-muted-foreground">暂无可选规格</p>
          )}
        </div>
      </section>

      <Separator className="mx-4 mb-6" />

      {/* Product Details */}
      <section className="px-4 mb-6">
        <h3 className="heading-secondary mb-4">商品详情</h3>
        <div className="space-y-3">
          {product.details.map((detail, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
              <span className="text-foreground">{detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* More Product Images/Details would go here */}
      <section className="px-4 mb-6">
        <h3 className="heading-secondary mb-4">实拍图片</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg"></div>
          ))}
        </div>
      </section>

      {/* 点赞和互动 */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-center">
          <LikeButton 
            itemType="product" 
            itemId={product.id}
            size="lg"
            showCount={true}
          />
        </div>
      </section>

      {/* 用户评价 */}
      <section className="px-4 mb-6">
        <CommentSection 
          itemType="product" 
          itemId={product.id}
          title="用户评价"
        />
      </section>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            加入购物车
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isLoading}
            onClick={handleBuyNow}
          >
            立即购买
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}