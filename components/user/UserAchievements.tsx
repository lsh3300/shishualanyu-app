'use client'

import { useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, BookOpen, Calendar, ThumbsUp, MessageCircle, TrendingUp } from "lucide-react"
import { useUserAchievements } from "@/hooks/use-user-achievements"

export function UserAchievements() {
  const { data, loading } = useUserAchievements()
  const safeData = useMemo(
    () =>
      data ?? {
        user_id: null,
        completed_courses: 0,
        in_progress_courses: 0,
        learning_days: 0,
        total_likes: 0,
        total_comments: 0,
        total_engagements: 0,
      },
    [data]
  )

  const achievements = [
    {
      icon: Trophy,
      label: '完成课程',
      value: safeData.completed_courses,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Calendar,
      label: '学习天数',
      value: safeData.learning_days,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: TrendingUp,
      label: '点赞、评论',
      value: safeData.total_engagements,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ]

  if (loading) {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">最近成就</h3>
          <div className="flex-1 h-px bg-indigo-200/60" />
        </div>
        <div className="mt-3 relative overflow-hidden rounded-2xl border border-indigo-100/70 bg-app-card">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(79,109,163,0.18),transparent_55%)]" />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,rgba(79,109,163,0.12)_1px,transparent_1px)] [background-size:14px_14px]" />
          <div className="relative grid grid-cols-3 divide-x divide-indigo-200/40">
            <div className="px-3 py-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
              <div className="mt-2 h-5 w-10 rounded bg-indigo-100/60" />
              <div className="mt-1 h-3 w-12 rounded bg-indigo-100/40" />
            </div>
            <div className="px-3 py-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
              <div className="mt-2 h-5 w-10 rounded bg-indigo-100/60" />
              <div className="mt-1 h-3 w-12 rounded bg-indigo-100/40" />
            </div>
            <div className="px-3 py-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
              <div className="mt-2 h-5 w-10 rounded bg-indigo-100/60" />
              <div className="mt-1 h-3 w-12 rounded bg-indigo-100/40" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">最近成就</h3>
        <div className="flex-1 h-px bg-indigo-200/60" />
      </div>

      <div className="mt-3 relative overflow-hidden rounded-2xl border border-indigo-100/70 bg-app-card">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(79,109,163,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,rgba(79,109,163,0.12)_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="absolute inset-x-0 top-0 h-full opacity-30 bg-[linear-gradient(90deg,transparent,rgba(79,109,163,0.10),transparent)]" />

        <div className="relative grid grid-cols-3 divide-x divide-indigo-200/40">
          {achievements.map((achievement, index) => (
            <div key={index} className="px-3 py-4 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${achievement.bgColor} flex items-center justify-center border border-indigo-100/60`}>
                <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
              </div>
              <div className="mt-2 text-2xl font-bold text-indigo-900">{achievement.value}</div>
              <div className="mt-0.5 text-[11px] text-indigo-700/70 tracking-[0.25em]">{achievement.label}</div>
            </div>
          ))}
        </div>
      </div>

      {safeData.in_progress_courses > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm px-1">
          <span className="text-muted-foreground">进行中的课程</span>
          <Badge variant="secondary">{safeData.in_progress_courses} 个</Badge>
        </div>
      )}
    </div>
  )
}

// 详细成就页面组件
export function UserAchievementsDetailed() {
  const { data, loading } = useUserAchievements()
  const safeData = useMemo(
    () =>
      data ?? {
        user_id: null,
        completed_courses: 0,
        in_progress_courses: 0,
        learning_days: 0,
        total_likes: 0,
        total_comments: 0,
        total_engagements: 0,
      },
    [data]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = [
    {
      icon: Trophy,
      label: '完成课程',
      value: safeData.completed_courses,
      description: '已完成的课程总数',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: BookOpen,
      label: '进行中',
      value: safeData.in_progress_courses,
      description: '正在学习的课程',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Calendar,
      label: '学习天数',
      value: safeData.learning_days,
      description: '累计学习天数',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: ThumbsUp,
      label: '点赞',
      value: safeData.total_likes,
      description: '给课程的点赞',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: MessageCircle,
      label: '评论',
      value: safeData.total_comments,
      description: '发表的评论',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: TrendingUp,
      label: '互动',
      value: safeData.total_engagements,
      description: '总互动次数',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">我的成就</h2>
        <p className="text-muted-foreground">查看你的学习进度和成就</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center mb-4`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {safeData.first_learning_date && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">学习历程</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">开始学习时间</span>
                <span className="font-medium">
                  {new Date(safeData.first_learning_date).toLocaleDateString('zh-CN')}
                </span>
              </div>
              {safeData.last_learning_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最近学习时间</span>
                  <span className="font-medium">
                    {new Date(safeData.last_learning_date).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
