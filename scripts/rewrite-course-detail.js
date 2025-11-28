const fs = require('fs')
const path = require('path')

// 读取增强版内容
const enhancedPath = path.resolve(__dirname, '../app/teaching/[id]/page-enhanced.tsx')
const content = fs.readFileSync(enhancedPath, 'utf8')

/*
const content = `'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, User, Heart, Share2, Play } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useFavorites } from "@/hooks/use-favorites"
import Image from "next/image"

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<any>(null)
  
  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites } = useFavorites()
  
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id

  useEffect(() => {
    if (!courseId) return
    
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        console.log('正在获取课程ID:', courseId)
        
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()
        
        if (courseError) {
          console.error('获取课程失败:', courseError)
          toast.error('课程不存在')
          setTimeout(() => router.push('/teaching'), 1500)
          return
        }
        
        console.log('成功获取课程数据:', courseData)
        setCourse(courseData)
        
      } catch (error) {
        console.error('加载课程数据失败:', error)
        toast.error('加载课程数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourse()
  }, [courseId, router])

  const handleLike = async () => {
    if (!courseId) return
    
    try {
      const isFav = isCourseFavorite(courseId)
      if (isFav) {
        await removeCourseFromFavorites(courseId)
        toast.success('已取消收藏')
      } else {
        await addCourseToFavorites(courseId)
        toast.success('已收藏课程')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: \`分享课程：\${course?.title}\`,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('链接已复制到剪贴板')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="text-center py-20">
          <p className="text-muted-foreground">课程不存在</p>
          <Button onClick={() => router.push('/teaching')} className="mt-4">
            返回课程列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="heading-secondary flex-1 line-clamp-1">课程详情</h1>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="relative w-full aspect-video bg-muted">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Play className="h-16 w-16 text-primary" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-2xl font-bold flex-1">{course.title}</h2>
            <Badge variant="secondary">{course.category || '蓝染工艺'}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{course.instructor}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration} 分钟</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {(course.price === 0 || course.price === null) ? (
              <Badge variant="default" className="text-lg px-4 py-1">免费课程</Badge>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">¥{course.price}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={courseId && isCourseFavorite(courseId) ? "default" : "outline"}
              size="icon"
              onClick={handleLike}
            >
              <Heart className={\`h-5 w-5 \${courseId && isCourseFavorite(courseId) ? 'fill-current' : ''}\`} />
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">课程介绍</h3>
          <p className="text-muted-foreground">
            {course.description || \`由 \${course.instructor} 老师讲解的《\${course.title}》课程，详细介绍蓝染技艺的实践操作方法。\`}
          </p>
        </div>

        <Separator />

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">讲师信息</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{course.instructor}</p>
                <p className="text-sm text-muted-foreground">蓝染工艺讲师</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {course.tags && course.tags.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">课程标签</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => toast.info('视频播放功能即将上线')}
          >
            <Play className="h-5 w-5 mr-2" />
            预览课程
          </Button>
          <Button className="flex-1">
            {(course.price === 0 || course.price === null) ? '立即学习' : '立即购买'}
          </Button>
        </div>
      </div>
    </div>
  )
}
`

*/

const filePath = path.resolve(__dirname, '../app/teaching/[id]/page.tsx')
fs.writeFileSync(filePath, content, 'utf8')
console.log('✅ 增强版课程详情页已部署:', filePath)
