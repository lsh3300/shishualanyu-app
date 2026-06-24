"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { BookOpen, CheckCircle2, Clock3, GraduationCap, Loader2, PlayCircle } from "lucide-react"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { useAuth } from "@/contexts/auth-context"
import { useUserCourses } from "@/hooks/use-user-courses"

function getCourseCover(imageUrl?: string | null, thumbnailUrl?: string | null) {
  return imageUrl || thumbnailUrl || "/placeholder.svg"
}

function getCourseStatus(progress?: number | null, completedAt?: string | null, status?: string | null) {
  const normalizedProgress = typeof progress === "number" ? progress : 0

  if (completedAt || status === "completed" || normalizedProgress >= 100) {
    return {
      label: "已完成",
      icon: CheckCircle2,
      badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    }
  }

  return {
    label: "学习中",
    icon: BookOpen,
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
  }
}

function getLastLearnedLabel(lastAccessedAt?: string | null) {
  if (!lastAccessedAt) {
    return "最近学习时间未记录"
  }

  return `最近学习 ${formatDistanceToNow(new Date(lastAccessedAt), {
    addSuffix: true,
    locale: zhCN,
  })}`
}

export default function CoursesPage() {
  const { user } = useAuth()
  const { coursesData, learningDays, loading, error, refresh } = useUserCourses()

  if (!user) {
    return (
      <div className="page-container flex flex-col">
        <ProfileSubpageHeader title="我的课程" subtitle="继续学习，沉淀自己的工艺路径" backHref="/profile" />
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
          <GraduationCap className="mb-4 h-14 w-14 text-[#7d95b6]" />
          <h2 className="text-lg font-semibold text-[#243d66]">请先登录</h2>
          <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#6d85a6]">
            登录后可以查看您已报名或正在学习的课程内容。
          </p>
          <Link href={`/auth?view=login&redirectTo=${encodeURIComponent("/profile/courses")}`}>
            <Button className="mt-6 rounded-full px-6">去登录</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-container flex flex-col page-background-home-echo">
      <ProfileSubpageHeader
        title="我的课程"
        subtitle="继续学习，沉淀自己的工艺路径"
        backHref="/profile"
        rightSlot={
          <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[#5f7ba2] ring-1 ring-[#d9e5f4]">
            学习 {learningDays} 天
          </div>
        }
      />

      <section className="flex-1 px-4 pb-24">
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="rounded-[18px] border-white/70 bg-white/72 shadow-[0_8px_18px_rgba(61,92,140,0.05)]">
            <CardContent className="px-3.5 py-2.5">
              <p className="text-[11px] text-[#7a91b2]">课程总数</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#29446e]">{coursesData?.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[18px] border-white/70 bg-white/72 shadow-[0_8px_18px_rgba(61,92,140,0.05)]">
            <CardContent className="px-3.5 py-2.5">
              <p className="text-[11px] text-[#7a91b2]">学习中</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#29446e]">{coursesData?.inProgress ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[18px] border-white/70 bg-white/72 shadow-[0_8px_18px_rgba(61,92,140,0.05)]">
            <CardContent className="px-3.5 py-2.5">
              <p className="text-[11px] text-[#7a91b2]">已完成</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#29446e]">{coursesData?.completed ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-[#6d85a6]">正在加载课程记录</p>
          </div>
        ) : error ? (
          <Card className="mt-4 rounded-[24px] border-white/70 bg-white/72 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
            <CardContent className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-[#8aa0bf]" />
              <h3 className="text-lg font-semibold text-[#243d66]">课程加载失败</h3>
              <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#6d85a6]">{error.message}</p>
              <Button className="mt-6 rounded-full px-6" onClick={() => refresh()}>
                重新加载
              </Button>
            </CardContent>
          </Card>
        ) : (coursesData?.list.length ?? 0) > 0 ? (
          <div className="mt-3 space-y-2.5">
            {coursesData?.list.map((enrollment) => {
              const course = enrollment.courses || {}
              const progress = typeof enrollment.progress === "number" ? enrollment.progress : 0
              const statusMeta = getCourseStatus(progress, enrollment.completed_at, enrollment.status)
              const StatusIcon = statusMeta.icon

              return (
                <Card
                  key={enrollment.id}
                  className="overflow-hidden rounded-[20px] border-white/75 bg-white/78 shadow-[0_8px_20px_rgba(61,92,140,0.06)]"
                >
                  <CardContent className="p-3">
                    <div className="flex gap-2.5">
                      <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[14px] bg-[#eef4fb]">
                        <Image
                          src={getCourseCover(course.image_url, course.thumbnail_url)}
                          alt={course.title || "课程封面"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14345d]/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 right-2 rounded-full bg-white/92 p-1.5 text-[#295085] shadow-sm">
                          <PlayCircle className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#29446e]">
                              {course.title || "未命名课程"}
                            </h3>
                            <p className="mt-0.5 text-[10px] text-[#6f87aa]">
                              {course.instructor || "课程讲师待补充"}
                            </p>
                          </div>
                          <Badge className={`rounded-full px-2.5 py-1 text-[10px] ring-1 ${statusMeta.badgeClass}`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusMeta.label}
                          </Badge>
                        </div>

                        <div className="mt-2 flex items-end justify-between gap-2.5">
                          <div className="min-w-0 text-[10px] text-[#6f87aa]">
                            <div className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5 shrink-0" />
                              <span className="line-clamp-2 leading-5">
                                {getLastLearnedLabel(enrollment.last_accessed_at)}
                              </span>
                            </div>
                          </div>
                          <Link href={`/teaching/${enrollment.course_id || course.id || ""}`}>
                            <Button size="sm" className="h-8 rounded-full px-3.5 text-[12px]">
                              {progress >= 100 ? "回看课程" : "继续学习"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
            <GraduationCap className="mb-4 h-14 w-14 text-[#7d95b6]" />
            <h3 className="text-lg font-semibold text-[#243d66]">暂无课程</h3>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#6d85a6]">
              还没有学习记录，先去看看课程内容。
            </p>
            <Link href="/teaching">
              <Button className="mt-6 rounded-full px-6">浏览课程</Button>
            </Link>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
