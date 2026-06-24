"use client"

import { OptimizedImage } from "@/components/ui/optimized-image"
import { Card } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  sales: number
  showFavorite?: boolean
  isFavorite?: boolean
  className?: string
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  originalPrice, 
  image, 
  sales, 
  showFavorite = false,
  isFavorite: controlledIsFavorite,
  className
}: ProductCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite: checkIsFavorite } = useFavorites()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isCurrentlyFavorite = controlledIsFavorite !== undefined 
    ? controlledIsFavorite 
    : checkIsFavorite(id)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return

    setIsLoading(true)
    try {
      if (isCurrentlyFavorite) {
        await removeFromFavorites(id)
      } else {
        await addToFavorites(id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = () => {
    router.push(`/store/${id}`)
  }

  // 计算折扣百分比
  const discountPercent = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

  return (
    <div className="group block w-full max-w-[240px] mx-auto cursor-pointer" onClick={handleCardClick}>
      <Card className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 relative",
        className
      )}>
        <div className="relative overflow-hidden aspect-square">
          <OptimizedImage
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={200}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            lazy={true}
          />
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* 折扣标签 */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm">
              -{discountPercent}%
            </div>
          )}
          
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 shadow-lg",
                isCurrentlyFavorite && "text-red-500 hover:text-red-600 opacity-100",
                !isCurrentlyFavorite && "text-gray-600 hover:text-red-500"
              )}
              onClick={handleFavoriteClick}
              disabled={isLoading}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isCurrentlyFavorite && "fill-current"
                )} 
              />
            </Button>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-1 transition-colors duration-200 group-hover:text-primary">{name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">¥{price}</span>
              {originalPrice && <span className="text-xs text-muted-foreground line-through">¥{originalPrice}</span>}
            </div>
            <span className="text-xs text-muted-foreground">{sales}人付款</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
