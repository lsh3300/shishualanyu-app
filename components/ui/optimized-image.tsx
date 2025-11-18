"use client"

import { useState, useRef, useEffect } from "react"
import Image, { ImageProps, StaticImageData } from "next/image"
import { cn } from "@/lib/utils"
import { imageConfig, generateSrcSet, generateSizes } from "@/lib/image-config"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: string
  lazy?: boolean
  blurDataURL?: string
  placeholderClassName?: string
  quality?: number
  usage?: 'thumbnail' | 'card' | 'detail' | 'fullscreen'
  placeholder?: "blur" | "empty"
}

export function OptimizedImage({
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
        rootMargin: "50px", // 开始提前50px加载图片
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

  // 生成优化的图片URL
  const getOptimizedSrc = (originalSrc: string | StaticImageData | any) => {
    // 如果是外部URL或StaticImport，直接返回
    if (typeof originalSrc !== "string" || originalSrc.startsWith("http")) {
      return originalSrc
    }

    // 如果是本地图片，添加优化参数
    const config = imageConfig.sizes[usage]
    const optimizedWidth = props.width || config.width
    const optimizedHeight = props.height || config.height

    return `${originalSrc}?w=${optimizedWidth}&h=${optimizedHeight}&format=webp&q=${quality}`
  }

  // 生成模糊占位符
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL

    // 生成一个简单的SVG占位符
    const width = props.width || 20
    const height = props.height || 20
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="100%" height="100%" fill="url(#placeholder)"/>
        <defs>
          <pattern id="placeholder" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#e5e7eb"/>
            <circle cx="12" cy="12" r="1" fill="#e5e7eb"/>
          </pattern>
        </defs>
      </svg>
    `
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  }

  // 如果图片不在视口内且需要懒加载，显示占位符
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          "bg-muted animate-pulse rounded-md",
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
        onError={() => setHasError(true)}
        {...props}
      />
    )
  }

  return (
    <div className={cn("relative overflow-hidden", props.fill ? "w-full h-full" : undefined, className)}>
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-muted animate-pulse rounded-md z-10",
            placeholderClassName
          )}
        />
      )}
      <Image
        src={getOptimizedSrc(src)}
        alt={alt}
        className={cn(
          "transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? generateBlurDataURL() : undefined}
        priority={priority}
        quality={quality}
        sizes={generateSizes(usage)}
        {...props}
      />
    </div>
  )
}