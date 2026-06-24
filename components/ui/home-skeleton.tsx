'use client'

import { Skeleton } from './skeleton'

/**
 * SkeletonGrid 组件属性
 */
export interface SkeletonGridProps {
  /** 骨架卡片数量 */
  count: number
  /** 卡片类型 */
  type: 'course' | 'product'
  /** 网格列数配置 */
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

/**
 * 默认列数配置
 */
const DEFAULT_COLUMNS = {
  course: {
    default: 2,
    sm: 3,
    md: 3,
    lg: 4,
    xl: 5,
  },
  product: {
    default: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  },
}

/**
 * 生成网格列数的 CSS 类名
 */
function getGridColumnsClass(
  type: 'course' | 'product',
  columns?: SkeletonGridProps['columns']
): string {
  const config = columns || DEFAULT_COLUMNS[type]
  
  const classes: string[] = []
  
  // 默认列数
  classes.push(`grid-cols-${config.default}`)
  
  // 响应式列数
  if (config.sm) classes.push(`sm:grid-cols-${config.sm}`)
  if (config.md) classes.push(`md:grid-cols-${config.md}`)
  if (config.lg) classes.push(`lg:grid-cols-${config.lg}`)
  if (config.xl) classes.push(`xl:grid-cols-${config.xl}`)
  
  return classes.join(' ')
}

/**
 * 统一骨架屏网格组件
 * 支持 course 和 product 两种卡片类型，支持自定义列数配置
 * 
 * @example
 * // 初始加载 9 个课程骨架
 * <SkeletonGrid count={9} type="course" />
 * 
 * // 加载更多时显示 3 个产品骨架
 * <SkeletonGrid count={3} type="product" />
 * 
 * // 自定义列数
 * <SkeletonGrid count={6} type="course" columns={{ default: 1, sm: 2, lg: 3 }} />
 */
export function SkeletonGrid({ count, type, columns }: SkeletonGridProps) {
  const gridClass = getGridColumnsClass(type, columns)
  const CardSkeleton = type === 'course' ? CourseCardSkeleton : ProductCardSkeleton
  
  return (
    <div className={`grid ${gridClass} gap-4 sm:gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

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
