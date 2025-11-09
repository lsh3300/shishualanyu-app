import { OptimizedImage } from "@/components/ui/optimized-image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface MaterialCardProps {
  id: string
  name: string
  price: number
  image: string
  description: string
}

export function MaterialCard({ id, name, price, image, description }: MaterialCardProps) {
  return (
    <Card className="cultural-card">
      <div className="flex gap-4">
        <OptimizedImage
          src={image || "/placeholder.svg"}
          alt={name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
          lazy={true}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground mb-1">{name}</h4>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-accent">¥{price}</span>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4 mr-1" />
              去购买
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
