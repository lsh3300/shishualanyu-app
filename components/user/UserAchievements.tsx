'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, BookOpen, Calendar, ThumbsUp, MessageCircle, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AchievementsData {
  user_id: string | null
  completed_courses: number
  in_progress_courses: number
  learning_days: number
  total_likes: number
  total_comments: number
  total_engagements: number
  first_learning_date?: string | null
  last_learning_date?: string | null
}

export function UserAchievements() {
  const { getToken } = useAuth()
  const [data, setData] = useState<AchievementsData>({
    user_id: null,
    completed_courses: 0,
    in_progress_courses: 0,
    learning_days: 0,
    total_likes: 0,
    total_comments: 0,
    total_engagements: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const token = await getToken()
      
      if (!token) {
        console.log('未登录，跳过获取成就')
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/user/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const achievements = await response.json()
        setData(achievements)
      }
    } catch (error) {
      console.error('获取成就数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const achievements = [
    {
      icon: Trophy,
      label: '完成课程',
      value: data.completed_courses,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Calendar,
      label: '学习天数',
      value: data.learning_days,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: TrendingUp,
      label: '点赞、评论',
      value: data.total_engagements,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">最近成就</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center">
              <div className={`mx-auto w-12 h-12 rounded-full ${achievement.bgColor} flex items-center justify-center mb-2`}>
                <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{achievement.value}</div>
              <div className="text-xs text-muted-foreground">{achievement.label}</div>
            </div>
          ))}
        </div>

        {data.in_progress_courses > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">进行中的课程</span>
              <Badge variant="secondary">{data.in_progress_courses} 个</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 详细成就页面组件
export function UserAchievementsDetailed() {
  const { getToken } = useAuth()
  const [data, setData] = useState<AchievementsData>({
    user_id: null,
    completed_courses: 0,
    in_progress_courses: 0,
    learning_days: 0,
    total_likes: 0,
    total_comments: 0,
    total_engagements: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const token = await getToken()
      
      if (!token) {
        console.log('未登录，跳过获取成就')
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/user/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const achievements = await response.json()
        setData(achievements)
      }
    } catch (error) {
      console.error('获取成就数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

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
      value: data.completed_courses,
      description: '已完成的课程总数',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: BookOpen,
      label: '进行中',
      value: data.in_progress_courses,
      description: '正在学习的课程',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Calendar,
      label: '学习天数',
      value: data.learning_days,
      description: '累计学习天数',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: ThumbsUp,
      label: '点赞',
      value: data.total_likes,
      description: '给课程的点赞',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: MessageCircle,
      label: '评论',
      value: data.total_comments,
      description: '发表的评论',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: TrendingUp,
      label: '互动',
      value: data.total_engagements,
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

      {data.first_learning_date && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">学习历程</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">开始学习时间</span>
                <span className="font-medium">
                  {new Date(data.first_learning_date).toLocaleDateString('zh-CN')}
                </span>
              </div>
              {data.last_learning_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最近学习时间</span>
                  <span className="font-medium">
                    {new Date(data.last_learning_date).toLocaleDateString('zh-CN')}
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
