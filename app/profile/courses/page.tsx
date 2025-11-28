"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { ArrowLeft, Play, Clock, BookOpen, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

interface Course {
  id: string
  title: string
  thumbnail?: string
  status?: string
  instructor?: string
  completedLessons?: number
  totalLessons?: number
  progress: number
  lastWatched?: string
}

// 使用空数组作为默认数据，实际数据应从API获取
const courses: Course[] = []

export default function CoursesPage() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">我的课程</h1>
        </div>
      </header>

      {/* Courses List */}
        <section className="p-4 space-y-4">
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
          <Card key={course.id} className="p-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-18 flex-shrink-0">
                <Image
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{course.title}</h3>
                  <Badge
                    variant={course.status === "completed" ? "default" : "secondary"}
                    className={course.status === "completed" ? "bg-green-100 text-green-800" : ""}
                  >
                    {course.status === "completed" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        已完成
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-3 w-3 mr-1" />
                        学习中
                      </>
                    )}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-3">{course.instructor}</p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} 课时
                    </span>
                    <span className="text-primary font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    最近学习: {course.lastWatched}
                  </div>
                  <Link href={`/teaching/${course.id}`}>
                    <Button size="sm" variant="outline">
                      {course.status === "completed" ? "复习" : "继续学习"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">暂无课程</h3>
          <p className="mt-2 text-sm text-muted-foreground">您还没有购买任何课程</p>
          <Link href="/courses">
            <Button className="mt-4">浏览课程</Button>
          </Link>
        </div>
      )}
        </section>

      <BottomNav />
    </div>
  )
}
