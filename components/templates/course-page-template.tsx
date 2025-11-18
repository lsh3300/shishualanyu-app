"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { CourseListCard } from "@/components/ui/course-list-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { SearchIcon } from "lucide-react"
import Image from "next/image"

interface CoursePageTemplateProps {
  title: string
  description: string
  bannerImage: string
  bannerTitle: string
  bannerDescription: string
  filterOptions: Array<{ id: string; label: string }>
  courses: Array<{
    id: string
    title: string
    instructor: string
    duration: string
    students: number
    rating: number
    thumbnail: string
    price?: number
    isFree?: boolean
    difficulty: "入门" | "进阶" | "高级"
    category: string
  }>
  courseType: "tie-dye" | "wax-resist" | "indigo" | "comprehensive"
}

export function CoursePageTemplate({
  title,
  description,
  bannerImage,
  bannerTitle,
  bannerDescription,
  filterOptions,
  courses,
  courseType
}: CoursePageTemplateProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const isMobile = useIsMobile()

  const filteredCourses = selectedFilter === "all" 
    ? courses 
    : courses.filter(course => {
        if (selectedFilter === "入门" || selectedFilter === "进阶" || selectedFilter === "高级") {
          return course.difficulty === selectedFilter
        }
        if (selectedFilter === "free") {
          return course.isFree || false
        }
        if (selectedFilter === "latest") {
          // 简单模拟最新课程逻辑
          return parseInt(course.id) > 3
        }
        if (selectedFilter === "popular") {
          // 简单模拟人气课程逻辑
          return course.students > 800
        }
        return true
      })

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-background border-b">
        <div className="flex items-center gap-2">
          <Link href="/teaching" className="rounded-full p-1 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="hidden md:flex">
          <SearchBar placeholder={`搜索${title}...`} />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <SearchIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="h-auto">
            <SearchBar placeholder={`搜索${title}...`} className="mt-4" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar 
            options={filterOptions} 
            selectedOption={selectedFilter} 
            onSelectOption={setSelectedFilter} 
          />
        </div>

        {/* Featured Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <Image 
            src={bannerImage} 
            alt={title} 
            className="w-full h-48 object-cover"
            width={1200}
            height={300}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-6">
            <h3 className="text-white text-2xl font-bold mb-2">{bannerTitle}</h3>
            <p className="text-white/80 mb-4">{bannerDescription}</p>
            <Button className="bg-primary hover:bg-primary/90 self-start">
              探索{title}
            </Button>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseListCard key={course.id} {...course} showFavorite={true} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}