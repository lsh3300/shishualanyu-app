'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

interface Material {
  id: string
  name: string
  price: number
  image: string
  description: string
}

interface CourseMaterialsSectionProps {
  materials: Material[]
}

export function CourseMaterialsSection({ materials }: CourseMaterialsSectionProps) {
  if (!materials || materials.length === 0) {
    return null
  }

  return (
    <section className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">相关材料</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {materials.map((material) => (
              <div key={material.id} className="space-y-2">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <OptimizedImage
                    src={material.image}
                    alt={material.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-1">{material.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{material.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">¥{material.price}</span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/store/${material.id}`}>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      购买
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {materials.length > 0 && (
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/store">
                  查看更多材料
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}