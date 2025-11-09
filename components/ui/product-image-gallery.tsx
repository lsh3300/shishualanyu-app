"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, Play } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { VideoPlayer } from "@/components/ui/video-player"
import { Button } from "@/components/ui/button"

interface ProductImageGalleryProps {
  images: string[]
  videos?: Array<{
    id: string
    url: string
    thumbnail: string
    title: string
    duration: string
  }>
  productName: string
}

export function ProductImageGallery({ images, videos = [], productName }: ProductImageGalleryProps) {
  // 合并图片和视频到一个数组中
  const mediaItems = [
    ...images.map((img, index) => ({ type: 'image', src: img, index })),
    ...videos.map((video, index) => ({ type: 'video', src: video.thumbnail, video, index }))
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const currentItem = mediaItems[currentIndex]
  const isVideo = currentItem.type === 'video'

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        {isVideo ? (
          <VideoPlayer 
            url={currentItem.video.url}
            thumbnail={currentItem.video.thumbnail}
            title={currentItem.video.title}
            duration={currentItem.video.duration}
          />
        ) : (
          <OptimizedImage 
            src={currentItem.src || "/placeholder.svg"} 
            alt={productName} 
            fill 
            className="object-cover" 
            priority={currentIndex === 0} // 第一张图片优先加载
          />
        )}

        {mediaItems.length > 1 && (
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

        {!isVideo && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white/90 rounded-full"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? "border-primary" : "border-transparent"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              {item.type === 'video' ? (
                <div className="relative w-full h-full">
                  <OptimizedImage
                    src={item.video.thumbnail || "/placeholder.svg"}
                    alt={item.video.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    lazy={index > 2} // 前几张缩略图立即加载，其余懒加载
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <OptimizedImage
                  src={item.src || "/placeholder.svg"}
                  alt={`${productName} ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  lazy={index > 2} // 前几张缩略图立即加载，其余懒加载
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
