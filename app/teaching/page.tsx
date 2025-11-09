"use client"

import { useState } from "react"
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

const courses = [
  {
    id: "1",
    title: "传统扎染基础入门课程",
    instructor: "李师傅",
    duration: "2小时30分",
    students: 1234,
    rating: 4.8,
    thumbnail: "/tie-dye-tutorial-hands-on.jpg",
    isFree: true,
    difficulty: "入门" as const,
    category: "扎染",
  },
  {
    id: "2",
    title: "蜡染工艺深度解析与实践",
    instructor: "王老师",
    duration: "3小时15分",
    students: 856,
    rating: 4.9,
    thumbnail: "/wax-resist-dyeing-technique.jpg",
    price: 199,
    difficulty: "进阶" as const,
    category: "蜡染",
  },
  {
    id: "3",
    title: "现代蓝染创新技法探索",
    instructor: "张艺术家",
    duration: "4小时",
    students: 567,
    rating: 4.7,
    thumbnail: "/modern-indigo-dyeing-art.jpg",
    price: 299,
    difficulty: "高级" as const,
    category: "创新技法",
  },
  {
    id: "4",
    title: "植物染料制作与应用",
    instructor: "陈教授",
    duration: "2小时45分",
    students: 432,
    rating: 4.6,
    thumbnail: "/traditional-indigo-dyeing-master-craftsman.jpg",
    price: 159,
    difficulty: "进阶" as const,
    category: "染料制作",
  },
]

export default function TeachingPage() {
  const [filteredCourses, setFilteredCourses] = useState(courses)

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
        {filteredCourses.map((course) => (
          <CourseListCard key={course.id} {...course} />
        ))}
      </section>

      <BottomNav />
    </div>
  )
}
