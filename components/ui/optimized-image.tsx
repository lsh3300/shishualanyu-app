"use client"

import { useState, useRef, useEffect, memo } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { imageConfig, generateSizes } from "@/lib/image-config"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: string
  lazy?: boolean
  blurDataURL?: string
  placeholderClassName?: string
  quality?: number
  usage?: 'thumbnail' | 'card' | 'detail' | 'fullscreen'
  placeholder?: "blur" | "empty"
}

// 蓝染纹理占位符组件
const IndigoPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn(
    "relative overflow-hidden bg-gradient-to-br from-[#1e3a5f]/10 via-[#4a90a4]/5 to-[#87ceeb]/10",
    className
  )}>
    {/* 扎染圆点装饰 */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-[#1e3a5f]/20 blur-sm" />
      <div className="absolute top-1/2 right-1/3 w-6 h-6 rounded-full bg-[#4a90a4]/20 blur-sm" />
      <div className="absolute bottom-1/4 left-1/2 w-10 h-10 rounded-full bg-[#87ceeb]/20 blur-sm" />
    </div>
    {/* 水波纹动画 */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-[#4a90a4]/30 animate-ping" />
    </div>
    {/* 中心水滴图标 */}
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#4a90a4]/40">
        <path
          fill="currentColor"
          d="M12 2C12 2 6 9 6 13C6 16.31 8.69 19 12 19C15.31 19 18 16.31 18 13C18 9 12 2 12 2Z"
        />
      </svg>
    </div>
  </div>
)

// 蓝染纹理错误占位符
const IndigoErrorPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn(
    "relative overflow-hidden bg-gradient-to-br from-[#1e3a5f]/5 to-[#87ceeb]/10 flex items-center justify-center",
    className
  )}>
    {/* 扎染图案背景 */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full border-2 border-[#1e3a5f]/30" />
      <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full border-2 border-[#4a90a4]/30" />
      <div className="absolute bottom-1/3 left-1/3 w-10 h-10 rounded-full border-2 border-[#87ceeb]/30" />
    </div>
    {/* 中心图标和文字 */}
    <div className="flex flex-col items-center gap-2 z-10">
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#4a90a4]/50">
        <path
          fill="currentColor"
          d="M12 2C12 2 6 9 6 13C6 16.31 8.69 19 12 19C15.31 19 18 16.31 18 13C18 9 12 2 12 2Z"
        />
      </svg>
      <span className="text-xs text-[#4a90a4]/60 font-medium">蓝染</span>
    </div>
  </div>
)

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
        rootMargin: "120px", // 控制预加载范围，减少一次性图片请求
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

  // 获取图片源
  const getImageSrc = () => {
    if (typeof src !== 'string') return src
    // 对于空字符串或无效URL，返回fallback
    if (!src || src === '') return fallback
    return resolveStaticAssetUrl(src) || fallback
  }

  // 如果图片不在视口内且需要懒加载，显示蓝染占位符
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn("rounded-xl", className)}
        style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined }}
      >
        <IndigoPlaceholder className={cn("w-full h-full rounded-xl", placeholderClassName)} />
      </div>
    )
  }

  // 如果图片加载出错，显示蓝染错误占位符
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={cn("rounded-xl", className)}
        style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined }}
      >
        <IndigoErrorPlaceholder className={cn("w-full h-full rounded-xl", placeholderClassName)} />
      </div>
    )
  }

  const imageSrc = getImageSrc()
  // 仅对 Next.js 不适合优化的资源绕过处理，例如 data/blob/svg。
  const shouldUnoptimize =
    typeof imageSrc === 'string' &&
    (imageSrc.startsWith('data:') ||
      imageSrc.startsWith('blob:') ||
      imageSrc.startsWith('http://') ||
      imageSrc.startsWith('https://') ||
      imageSrc.endsWith('.svg') ||
      imageSrc.includes('.svg?'))

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", props.fill ? "w-full h-full" : undefined)}>
      {isLoading && (
        <IndigoPlaceholder className={cn("absolute inset-0 z-10 rounded-xl", placeholderClassName)} />
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
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={generateSizes(usage)}
        unoptimized={shouldUnoptimize}
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    </div>
  )
})
