'use client'

import { Skeleton } from './skeleton'

/**
 * 轮播图骨架屏
 */
export function BannerSkeleton() {
  return (
    <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  )
}

/**
 * 课程卡片骨架屏
 */
export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      <Skeleton className="w-full aspect-video" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}

/**
 * 产品卡片骨架屏
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      <Skeleton className="w-full aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}

/**
 * 文章列表项骨架屏
 */
export function ArticleListSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-lg border border-border/50">
      <Skeleton className="w-32 sm:w-40 h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

/**
 * 课程列表骨架屏
 */
export function CoursesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 产品列表骨架屏
 */
export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 文章列表骨架屏
 */
export function ArticlesListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleListSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 首页完整骨架屏
 */
export function HomePageSkeleton() {
  return (
    <div className="space-y-8">
      <BannerSkeleton />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <CoursesGridSkeleton count={6} />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <ProductsGridSkeleton count={8} />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <ArticlesListSkeleton count={6} />
      </div>
    </div>
  )
}
