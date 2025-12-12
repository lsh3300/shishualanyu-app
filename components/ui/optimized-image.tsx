"use client"

import { useState, useRef, useEffect, memo } from "react"
import Image, { ImageProps, StaticImageData } from "next/image"
import { cn } from "@/lib/utils"
import { imageConfig, generateSizes } from "@/lib/image-config"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: string
  lazy?: boolean
  blurDataURL?: string
  placeholderClassName?: string
  quality?: number
  usage?: 'thumbnail' | 'card' | 'detail' | 'fullscreen'
  placeholder?: "blur" | "empty"
}

// 使用 memo 优化重渲染
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  lazy = true,
  blurDataURL,
  placeholderClassName,
  className,
  priority = false,
  quality = imageConfig.quality.webp,
  usage = "card",
  placeholder = "empty",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lazy || priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "200px", // 提前200px加载图片，减少白屏
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [lazy, priority])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // 检查是否是 Supabase 存储的图片
  const isSupabaseImage = (url: string) => {
    return typeof url === 'string' && url.includes('supabase.co/storage')
  }

  // 检查是否是外部图片
  const isExternalImage = (url: string | StaticImageData) => {
    if (typeof url !== 'string') return false
    return url.startsWith('http://') || url.startsWith('https://')
  }

  // 获取图片源
  const getImageSrc = (originalSrc: string | StaticImageData) => {
    if (typeof originalSrc !== 'string') return originalSrc
    // 对于空字符串或无效URL，返回fallback
    if (!originalSrc || originalSrc === '') return fallback
    return originalSrc
  }

  // 如果图片不在视口内且需要懒加载，显示占位符
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          "bg-muted/50 rounded-md",
          placeholderClassName,
          className
        )}
        style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined }}
      />
    )
  }

  // 如果图片加载出错，显示备用图片
  if (hasError) {
    return (
      <Image
        src={fallback}
        alt={alt}
        className={cn("object-cover", className)}
        unoptimized
        {...props}
      />
    )
  }

  const imageSrc = getImageSrc(src)
  // 对于 Supabase 图片，使用 unoptimized 避免 Next.js 再次处理
  // 对于本地图片，启用 Next.js 优化
  const shouldUnoptimize = isExternalImage(imageSrc)

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", props.fill ? "w-full h-full" : undefined)}>
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-muted/50 rounded-md z-10",
            placeholderClassName
          )}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes={generateSizes(usage)}
        unoptimized={shouldUnoptimize}
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    </div>
  )
})