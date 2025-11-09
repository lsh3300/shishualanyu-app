'use client'

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ProductImageGallery } from "@/components/ui/product-image-gallery"
import { CraftsmanStory } from "@/components/ui/craftsman-story"
import { SpecSelector } from "@/components/ui/spec-selector"
import { ArrowLeft, Heart, Share, MessageCircle, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface ProductDetailTemplateProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    images: string[]
    sales: number
    isNew?: boolean
    discount?: number
    description: string
    craftsmanStory: {
      story: string
      author: string
      title: string
    }
    specs: {
      colors: Array<{
        id: string
        label: string
        available: boolean
      }>
      sizes: Array<{
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
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Product Images */}
      <section className="p-4">
        <ProductImageGallery images={product.images} productName={product.name} />
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
          <SpecSelector title="颜色" options={product.specs.colors} onSelect={setSelectedColor} />
          <SpecSelector title="尺寸" options={product.specs.sizes} onSelect={setSelectedSize} />
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

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            <ShoppingCart className="h-4 w-4 mr-2" />
            加入购物车
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90">立即购买</Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}