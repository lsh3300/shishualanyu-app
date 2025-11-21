"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { CourseListCard } from "@/components/ui/course-list-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "tie-dye", label: "扎染" },
  { id: "wax-resist", label: "蜡染" },
  { id: "beginner", label: "入门" },
  { id: "advanced", label: "进阶" },
  { id: "latest", label: "最新" },
]

export default function TeachingPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 从 API 获取课程数据
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        if (response.ok) {
          const data = await response.json()
          const coursesData = data.courses || []
          // 格式化课程数据以匹配 CourseListCard 的期望
          const formattedCourses = coursesData.map((course: any) => ({
            id: course.id,
            title: course.title,
            instructor: course.instructor_name || '未知讲师',
            duration: course.duration,
            students: course.students || 0,
            rating: course.rating || 0,
            thumbnail: course.thumbnail || '/placeholder.svg',
            isFree: course.is_free,
            price: course.price,
            difficulty: course.difficulty || '未知',
            category: course.category || '未分类',
          }))
          setCourses(formattedCourses)
          setFilteredCourses(formattedCourses)
        }
      } catch (error) {
        console.error('获取课程失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    setFilteredCourses(courses)
  }, [courses])

  const handleFilterChange = (filterId: string) => {
    if (filterId === "all") {
      setFilteredCourses(courses)
    } else {
      // Simple filter logic - in real app would be more sophisticated
      const filtered = courses.filter(
        (course) =>
          course.category.includes(filterId) ||
          course.difficulty.includes(filterId) ||
          (filterId === "tie-dye" && course.category === "扎染") ||
          (filterId === "wax-resist" && course.category === "蜡染"),
      )
      setFilteredCourses(filtered)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">教学课程</h1>
        </div>
      </header>

      {/* Search */}
      <section className="p-4">
        <SearchBar placeholder="搜索课程、讲师..." />
      </section>

      {/* Filters */}
      <section className="px-4 mb-6">
        <FilterBar options={filterOptions} onFilterChange={handleFilterChange} />
      </section>

      {/* Course List */}
      <section className="px-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseListCard key={course.id} {...course} showFavorite={true} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            暂无课程
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
