import React, { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

// 懒加载课程详情页的各个部分
const CourseInfoSection = lazy(() => import('./course-info-section').then(module => ({ default: module.CourseInfoSection })))
const CourseTabsSection = lazy(() => import('./course-tabs-section').then(module => ({ default: module.CourseTabsSection })))
const CourseMaterialsSection = lazy(() => import('./course-materials-section').then(module => ({ default: module.CourseMaterialsSection })))

// 骨架屏组件
const CourseInfoSkeleton = () => (
  <div className="px-4 mb-6 space-y-4">
    <div className="flex gap-2 mb-3">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-full rounded" />
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-40 rounded" />
      </div>
    </div>
    <div className="flex items-center gap-6 mb-4">
      <Skeleton className="h-4 w-16 rounded" />
      <Skeleton className="h-4 w-16 rounded" />
      <Skeleton className="h-4 w-16 rounded" />
    </div>
    <Skeleton className="h-4 w-full rounded" />
    <Skeleton className="h-4 w-3/4 rounded" />
  </div>
)

const CourseTabsSkeleton = () => (
  <div className="px-4 mb-6">
    <div className="flex gap-4 border-b border-border mb-4">
      <Skeleton className="h-8 w-16 rounded-t" />
      <Skeleton className="h-8 w-16 rounded-t" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full rounded mb-2" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </Card>
      ))}
    </div>
  </div>
)

const CourseMaterialsSkeleton = () => (
  <div className="px-4 mb-6">
    <Skeleton className="h-6 w-24 rounded mb-4" />
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

// 懒加载组件包装器
interface LazyCourseInfoSectionProps {
  title: string
  category: string
  difficulty: string
  instructor: {
    name: string
    avatar: string
    bio: string
  }
  students: number
  rating: number
  duration: string
  description: string
}

export const LazyCourseInfoSection = (props: LazyCourseInfoSectionProps) => (
  <Suspense fallback={<CourseInfoSkeleton />}>
    <CourseInfoSection {...props} />
  </Suspense>
)

interface LazyCourseTabsSectionProps {
  chapters: Array<{
    id: string
    title: string
    duration: string
    isFree: boolean
  }>
  description: string
  instructor: {
    name: string
    avatar: string
    bio: string
  }
}

export const LazyCourseTabsSection = (props: LazyCourseTabsSectionProps) => (
  <Suspense fallback={<CourseTabsSkeleton />}>
    <CourseTabsSection {...props} />
  </Suspense>
)

interface LazyCourseMaterialsSectionProps {
  materials: Array<{
    id: string
    name: string
    price: number
    image: string
    description: string
  }>
}

export const LazyCourseMaterialsSection = (props: LazyCourseMaterialsSectionProps) => (
  <Suspense fallback={<CourseMaterialsSkeleton />}>
    <CourseMaterialsSection {...props} />
  </Suspense>
)