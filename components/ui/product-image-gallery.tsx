"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Button } from "@/components/ui/button"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        <OptimizedImage 
          src={images[currentIndex] || "/placeholder.svg"} 
          alt={productName} 
          fill 
          className="object-cover" 
          priority={currentIndex === 0} // 第一张图片优先加载
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white/90 rounded-full"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? "border-primary" : "border-transparent"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <OptimizedImage
                src={image || "/placeholder.svg"}
                alt={`${productName} ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                lazy={index > 2} // 前几张缩略图立即加载，其余懒加载
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
