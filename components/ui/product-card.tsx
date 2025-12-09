import { OptimizedImage } from "@/components/ui/optimized-image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Heart, ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { useCart } from "@/hooks/use-cart"
import { useState } from "react"
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
  showAddToCart?: boolean
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
  showAddToCart = true,
  className
}: ProductCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite: checkIsFavorite } = useFavorites()
  const { addToCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return

    setIsLoading(true)
    try {
      await addToCart({ product_id: id, quantity: 1 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link href={`/store/${id}`} prefetch={false} className="group block w-full max-w-[240px] mx-auto">
      <Card className={cn(
        "cultural-card hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg bg-card relative",
        className
      )}>
        <div className="relative overflow-hidden rounded-t-xl aspect-square">
          <OptimizedImage
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={200}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            lazy={true}
          />
          
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background transition-all duration-200",
                isCurrentlyFavorite && "text-red-500 hover:text-red-600",
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
        <div className="p-2">
          <h3 className="text-xs font-medium text-foreground mb-1 line-clamp-1 transition-colors duration-200 group-hover:text-primary">{name}</h3>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-bold text-accent">¥{price}</span>
            {originalPrice && <span className="text-[10px] text-muted-foreground line-through">¥{originalPrice}</span>}
          </div>
          <p className="text-[10px] text-muted-foreground">已售 {sales}</p>
        </div>
      </Card>
    </Link>
  )
}
