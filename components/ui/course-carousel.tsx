"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeatureCourseCard } from "@/components/ui/feature-course-card"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  title: string
  instructor: string
  duration: string
  students: number
  thumbnail: string
  price?: number
  isFree?: boolean
}

interface CourseCarouselProps {
  courses: Course[]
  className?: string
}

/**
 * 课程横向滚动组件
 * 统一卡片大小，支持触摸滑动
 */
export function CourseCarousel({ 
  courses, 
  className 
}: CourseCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // 检查滚动状态
  const checkScrollState = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScrollState()
    const scrollEl = scrollRef.current
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScrollState)
      return () => scrollEl.removeEventListener('scroll', checkScrollState)
    }
  }, [courses])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = direction === 'left' ? -300 : 300
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">暂无课程</div>
    )
  }

  return (
    <div className={cn("relative group/carousel", className)}>
      {/* 滚动容器 */}
      <div 
        ref={scrollRef}
        className="scroll-container px-1"
      >
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="scroll-item w-[200px] sm:w-[240px] md:w-[280px]"
          >
            <FeatureCourseCard 
              {...course}
              variant="normal"
            />
          </div>
        ))}
      </div>

      {/* 左滚动按钮 */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 shadow-lg border border-border/50 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 hover:bg-background"
          onClick={() => scroll('left')}
          aria-label="向左滚动"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* 右滚动按钮 */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 shadow-lg border border-border/50 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 hover:bg-background"
          onClick={() => scroll('right')}
          aria-label="向右滚动"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* 滚动指示器 */}
      <div className="flex justify-center mt-3 gap-1">
        {courses.slice(0, Math.min(courses.length, 6)).map((_, index) => (
          <div 
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === 0 ? "w-4 bg-primary" : "w-1.5 bg-primary/30"
            )}
          />
        ))}
      </div>
    </div>
  )
}
