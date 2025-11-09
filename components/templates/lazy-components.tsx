'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"

// 懒加载课程信息部分
export const LazyCourseInfoSection = dynamic(
  () => import('./course-info-section').then(mod => ({ default: mod.CourseInfoSection })),
  {
    loading: () => <CourseInfoSectionSkeleton />,
    ssr: false
  }
)

// 懒加载课程标签页部分
export const LazyCourseTabsSection = dynamic(
  () => import('./course-tabs-section').then(mod => ({ default: mod.CourseTabsSection })),
  {
    loading: () => <CourseTabsSectionSkeleton />,
    ssr: false
  }
)

// 懒加载课程材料部分
export const LazyCourseMaterialsSection = dynamic(
  () => import('./course-materials-section').then(mod => ({ default: mod.CourseMaterialsSection })),
  {
    loading: () => <CourseMaterialsSectionSkeleton />,
    ssr: false
  }
)

// 课程信息部分骨架屏
function CourseInfoSectionSkeleton() {
  return (
    <section className="p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-20 w-full" />
    </section>
  )
}

// 课程标签页部分骨架屏
function CourseTabsSectionSkeleton() {
  return (
    <section className="p-4 space-y-4">
      <div className="flex space-x-4 border-b">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </section>
  )
}

// 课程材料部分骨架屏
function CourseMaterialsSectionSkeleton() {
  return (
    <section className="p-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </section>
  )
}