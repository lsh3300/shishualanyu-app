"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGlobalState } from "@/hooks/use-global-state"

interface ProductGridCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  sales: number
  isNew?: boolean
  discount?: number
}

export function ProductGridCard({
  id,
  name,
  price,
  originalPrice,
  image,
  sales,
  isNew,
  discount,
}: ProductGridCardProps) {
  const { isFavorited, addToFavorites, removeFromFavorites } = useGlobalState();
  const [isFav, setIsFav] = useState(false);
  
  // 初始化时检查是否已收藏
  useEffect(() => {
    setIsFav(isFavorited(id));
  }, [id, isFavorited]);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFav) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
    setIsFav(!isFav);
  };
  return (
    <Link href={`/store/${id}`}>
      <Card className="cultural-card hover:scale-105 transition-transform relative">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isNew && (
            <Badge variant="destructive" className="text-xs">
              新品
            </Badge>
          )}
          {discount && (
            <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 z-10 ${isFav ? 'bg-pink-100' : 'bg-white/80'} hover:bg-white/90 rounded-full h-8 w-8`}
          onClick={handleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
        </Button>

        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={200}
          height={200}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-4">
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 text-sm">{name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-accent">¥{price}</span>
            {originalPrice && <span className="text-sm text-muted-foreground line-through">¥{originalPrice}</span>}
          </div>
          <p className="text-xs text-muted-foreground">已售 {sales}</p>
        </div>
      </Card>
    </Link>
  )
}
