"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Play, ZoomIn } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { VideoPlayer } from "@/components/ui/video-player"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

type ImageMediaItem = {
  type: "image"
  src: string
  index: number
}

type VideoMediaItem = {
  type: "video"
  src: string
  index: number
  video: {
    id: string
    url: string
    thumbnail: string
    title: string
    duration: string
  }
}

type MediaItem = ImageMediaItem | VideoMediaItem

export function ProductImageGallery({ images, videos = [], productName }: ProductImageGalleryProps) {
  const mediaItems: MediaItem[] = [
    ...images.map<MediaItem>((img, index) => ({ type: "image", src: img, index })),
    ...videos.map<MediaItem>((video, index) => ({ type: "video", src: video.thumbnail, video, index })),
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  if (mediaItems.length === 0) {
    return <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] bg-muted" />
  }

  const currentItem = mediaItems[currentIndex]
  const isVideo = currentItem.type === "video"

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] bg-slate-100 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
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
            priority={currentIndex === 0}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <div className="rounded-full bg-slate-900/82 px-3 py-1 text-sm font-medium text-white">
            {currentIndex + 1} / {mediaItems.length}
          </div>
          {!isVideo ? (
            <div className="rounded-full bg-slate-900/82 p-2 text-white">
              <ZoomIn className="h-4 w-4" />
            </div>
          ) : null}
        </div>

        {mediaItems.length > 1 ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-white/88 text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.16)] hover:bg-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-white/88 text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.16)] hover:bg-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        ) : null}
      </div>

      {mediaItems.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto">
          {mediaItems.map((item, index) => (
            <button
              key={`${item.type}-${index}`}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[22px] border-2 bg-white transition-all",
                index === currentIndex
                  ? "border-primary shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                  : "border-white/70 opacity-92 hover:opacity-100",
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`查看第 ${index + 1} 个媒体`}
            >
              {item.type === "video" ? (
                <div className="relative h-full w-full">
                  <OptimizedImage
                    src={item.video.thumbnail || "/placeholder.svg"}
                    alt={item.video.title}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    lazy={index > 2}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/28">
                    <Play className="h-4 w-4 fill-white text-white" />
                  </div>
                </div>
              ) : (
                <OptimizedImage
                  src={item.src || "/placeholder.svg"}
                  alt={`${productName} ${index + 1}`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  lazy={index > 2}
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
