'use client'

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { VideoPlayer } from "@/components/ui/video-player"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Share2 } from "lucide-react"
import Link from "next/link"
import { usePerformanceMonitor } from "@/components/ui/performance-monitor"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { LazyCourseInfoSection, LazyCourseTabsSection, LazyCourseMaterialsSection } from "./lazy-components"

export interface CourseDetailTemplateProps {
  course: {
    id: string
    title: string
    instructor: {
      name: string
      avatar: string
      bio: string
    }
    duration: string
    students: number
    rating: number
    thumbnail: string
    isFree: boolean
    difficulty: string
    category: string
    description: string
    chapters: Array<{
      id: string
      title: string
      duration: string
      isFree: boolean
    }>
    materials: Array<{
      id: string
      name: string
      price: number
      image: string
      description: string
    }>
  }
  courseType?: string
}

export function CourseDetailTemplate({ course, courseType = "course" }: CourseDetailTemplateProps) {
  // 添加性能监控
  usePerformanceMonitor(`/teaching/[id]`, 4) // 4个主要区块
  
  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  const isFavorite = isCourseFavorite(course.id)
  
  const handleFavoriteClick = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏课程",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (isFavorite) {
        await removeCourseFromFavorites(course.id)
      } else {
        await addCourseToFavorites(course.id)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/teaching">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1 line-clamp-1">课程详情</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            disabled={loading}
            className="relative"
          >
            <Heart 
              className={`h-5 w-5 transition-colors duration-200 ${
                isFavorite 
                  ? "text-red-500 fill-red-500" 
                  : "text-muted-foreground hover:text-red-500"
              }`} 
            />
          </Button>
        </div>
      </header>

      {/* Video Player */}
      <section className="p-4">
        <VideoPlayer thumbnail={course.thumbnail} title={course.title} duration={course.duration} />
      </section>

      {/* Course Info */}
      <LazyCourseInfoSection
        title={course.title}
        category={course.category}
        difficulty={course.difficulty}
        instructor={course.instructor}
        students={course.students}
        rating={course.rating}
        duration={course.duration}
        description={course.description}
      />

      {/* Course Tabs */}
      <LazyCourseTabsSection
        chapters={course.chapters}
        description={course.description}
        instructor={course.instructor}
      />

      {/* Materials Section */}
      <LazyCourseMaterialsSection materials={course.materials} />

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {course.isFree ? "立即学习" : "购买课程"}
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}