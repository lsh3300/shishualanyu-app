"use client"

import React, { Suspense, lazy, ComponentType } from "react"
import { Loader2 } from "lucide-react"

// 懒加载组件的加载状态
const LoadingFallback = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

// 骨架屏加载状态
const SkeletonFallback = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-40 w-full mb-4"></div>
    <div className="space-y-2">
      <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
      <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
    </div>
  </div>
)

// 卡片骨架屏
const CardSkeleton = ({ count = 1 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 rounded-lg h-40 w-full mb-4"></div>
        <div className="space-y-2">
          <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)

// 列表骨架屏
const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse">
        <div className="bg-gray-200 rounded-lg w-32 h-24"></div>
        <div className="flex-1 space-y-2">
          <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)

// 网格骨架屏
const GridSkeleton = ({ cols = 2, rows = 2 }: { cols?: number; rows?: number }) => (
  <div className={`grid grid-cols-${cols} gap-4`}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 rounded-lg h-40 w-full mb-4"></div>
        <div className="space-y-2">
          <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)

// 懒加载高阶组件
export function LazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: ComponentType<any> = LoadingFallback,
  options?: {
    suspense?: boolean
    delay?: number
  }
) {
  const LazyComponent = lazy(importFunc)

  return function LazyWrapper(props: any) {
    // 处理fallback可能是函数或组件的情况
    let FallbackElement
    if (typeof fallback === 'function') {
      const FallbackComponent = fallback
      FallbackElement = <FallbackComponent />
    } else {
      FallbackElement = fallback
    }

    if (options?.suspense !== false) {
      return (
        <Suspense fallback={FallbackElement}>
          <LazyComponent {...props} />
        </Suspense>
      )
    }

    // 延迟加载
    if (options?.delay) {
      const [showComponent, setShowComponent] = React.useState(false)

      React.useEffect(() => {
        const timer = setTimeout(() => {
          setShowComponent(true)
        }, options.delay)

        return () => clearTimeout(timer)
      }, [])

      if (!showComponent) {
        return FallbackElement
      }
    }

    return (
      <Suspense fallback={FallbackElement}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// 预定义懒加载组件
export const LazyBannerCarousel = LazyLoad(
  () => import("@/components/ui/banner-carousel").then(module => ({ default: module.BannerCarousel })),
  () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyQuickAccess = LazyLoad(
  () => import("@/components/ui/quick-access").then(module => ({ default: module.QuickAccess })),
  () => (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
      ))}
    </div>
  )
)

export const LazyCourseCard = LazyLoad(
  () => import("@/components/ui/course-card").then(module => ({ default: module.CourseCard })),
  () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyProductCard = LazyLoad(
  () => import("@/components/ui/product-card").then(module => ({ default: module.ProductCard })),
  () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyCultureArticleCard = LazyLoad(
  () => import("@/components/ui/culture-article-card").then(module => ({ default: module.CultureArticleCard })),
  () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyCultureArticleListCard = LazyLoad(
  () => import("@/components/ui/culture-article-list-card").then(module => ({ default: module.CultureArticleListCard })),
  () => (
    <div className="flex gap-4 p-4 bg-gray-100 animate-pulse rounded-lg">
      <div className="w-32 h-24 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
)

export const LazyMiniProfilePopover = LazyLoad(
  () => import("@/components/ui/mini-profile-popover").then(module => ({ default: module.MiniProfilePopover })),
  () => <div className="w-64 h-80 bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyNotificationPopover = LazyLoad(
  () => import("@/components/ui/notification-popover").then(module => ({ default: module.NotificationPopover })),
  () => <div className="w-80 h-96 bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyVideoPlayer = LazyLoad(
  () => import("@/components/ui/video-player").then(module => ({ default: module.VideoPlayer })),
  () => <div className="aspect-video bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyProductImageGallery = LazyLoad(
  () => import("@/components/ui/product-image-gallery").then(module => ({ default: module.ProductImageGallery })),
  () => <div className="aspect-square bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyAddressSelector = LazyLoad(
  () => import("@/components/ui/address-selector").then(module => ({ default: module.AddressSelector })),
  () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
)

export const LazyUserMenu = LazyLoad(
  () => import("@/components/ui/mini-profile-popover").then(module => ({ default: module.MiniProfilePopover })),
  () => <div className="w-80 h-96 bg-gray-100 animate-pulse rounded-lg" />
)

// 页面级懒加载
export const LazyTeachingPage = LazyLoad(
  () => import("@/app/teaching/page"),
  LoadingFallback
)

export const LazyStorePage = LazyLoad(
  () => import("@/app/store/page"),
  LoadingFallback
)

export const LazyCartPage = LazyLoad(
  () => import("@/app/cart/page"),
  LoadingFallback
)

export const LazyProfilePage = LazyLoad(
  () => import("@/app/profile/page"),
  LoadingFallback
)

export const LazyMessagesPage = LazyLoad(
  () => import("@/app/messages/page"),
  LoadingFallback
)

export const LazyNotificationsPage = LazyLoad(
  () => import("@/app/notifications/page"),
  LoadingFallback
)

// 条件懒加载组件
export function LazyOnIntersection<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: ComponentType<any> = LoadingFallback,
  options?: {
    root?: Element | null
    rootMargin?: string
    threshold?: number | number[]
    suspense?: boolean
  }
) {
  const LazyComponent = lazy(importFunc)

  return function LazyIntersectionWrapper(props: any) {
    const [isIntersecting, setIsIntersecting] = React.useState(false)
    const [hasIntersected, setHasIntersected] = React.useState(false)
    const elementRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const element = elementRef.current
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasIntersected) {
            setIsIntersecting(true)
            setHasIntersected(true)
          }
        },
        {
          root: options?.root || null,
          rootMargin: options?.rootMargin || "0px",
          threshold: options?.threshold || 0.1,
        }
      )

      observer.observe(element)

      return () => {
        observer.disconnect()
      }
    }, [hasIntersected, options?.root, options?.rootMargin, options?.threshold])

    // 处理fallback可能是函数或组件的情况
    let FallbackElement
    if (typeof fallback === 'function') {
      const FallbackComponent = fallback
      FallbackElement = <FallbackComponent />
    } else {
      FallbackElement = fallback
    }

    if (!isIntersecting) {
      return <div ref={elementRef}>{FallbackElement}</div>
    }

    if (options?.suspense !== false) {
      return (
        <div ref={elementRef}>
          <Suspense fallback={FallbackElement}>
            <LazyComponent {...props} />
          </Suspense>
        </div>
      )
    }

    return (
      <div ref={elementRef}>
        <LazyComponent {...props} />
      </div>
    )
  }
}

export {
  LoadingFallback,
  SkeletonFallback,
  CardSkeleton,
  ListSkeleton,
  GridSkeleton,
}