import { OptimizedImage } from "@/components/ui/optimized-image"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  sales: number
}

export function ProductCard({ id, name, price, originalPrice, image, sales }: ProductCardProps) {
  return (
    <Link href={`/store/${id}`} className="group">
      <Card className="cultural-card hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg bg-white">
        <div className="relative overflow-hidden rounded-t-xl">
          <OptimizedImage
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={200}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
            lazy={true}
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary">{name}</h3>
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
