'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowLeft, Clock, User, Heart, MessageCircle, Share2, Play, 
  ThumbsUp, Trash2, Eye, Calendar
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState("intro")
  
  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites } = useFavorites()
  
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id

  // 加载课程数据
  useEffect(() => {
    if (!courseId) return
    
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        
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
        
        setCourse(courseData)
        
        // 获取点赞状态和数量
        await fetchLikeStatus()
        
        // 获取评论
        await fetchComments()
        
      } catch (error) {
        console.error('加载课程数据失败:', error)
        toast.error('加载课程数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourse()
  }, [courseId, router])

  // 获取点赞状态（带token）
  const fetchLikeStatus = async () => {
    try {
      const token = await getToken()
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/courses/${courseId}/like`, {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setLikes(data.likesCount)
        setIsLiked(data.isLiked)
      }
    } catch (error) {
      console.error('获取点赞状态失败:', error)
    }
  }

  // 获取评论
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  // 收藏课程
  const handleFavorite = async () => {
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

  // 点赞课程
  const handleLike = async () => {
    console.log('🎯 点击点赞按钮')
    
    if (!user) {
      console.log('❌ 用户未登录')
      toast.error('请先登录')
      return
    }
    
    try {
      console.log('📝 获取token...')
      const token = await getToken()
      
      if (!token) {
        console.log('❌ Token获取失败')
        toast.error('请先登录')
        return
      }
      
      console.log('✅ Token获取成功，调用API...')
      const response = await fetch(`/api/courses/${courseId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`📡 API响应状态: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ 点赞成功:', data)
        setIsLiked(data.isLiked)
        setLikes(data.likesCount)
        toast.success(data.message)
      } else {
        const error = await response.json()
        console.error('❌ 点赞失败:', error)
        toast.error(error.error || '操作失败')
      }
    } catch (error) {
      console.error('❌ 点赞异常:', error)
      toast.error('操作失败')
    }
  }

  // 开始学习课程
  const handleStartLearning = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }
    
    try {
      const token = await getToken()
      
      if (!token) {
        toast.error('请先登录')
        return
      }
      
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
      } else {
        const error = await response.json()
        toast.error(error.error || '操作失败')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  // 提交评论
  const handleCommentSubmit = async () => {
    console.log('💬 点击发表评论')
    
    if (!user) {
      console.log('❌ 用户未登录')
      toast.error('请先登录')
      return
    }
    
    if (!newComment.trim()) {
      console.log('❌ 评论内容为空')
      toast.error('请输入评论内容')
      return
    }
    
    console.log('📝 评论内容:', newComment)
    setIsSubmitting(true)
    
    try {
      console.log('📝 获取token...')
      const token = await getToken()
      
      if (!token) {
        console.log('❌ Token获取失败')
        toast.error('请先登录')
        setIsSubmitting(false)
        return
      }
      
      console.log('✅ Token获取成功，提交评论...')
      const response = await fetch(`/api/courses/${courseId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment
        })
      })
      
      console.log(`📡 API响应状态: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ 评论成功:', data)
        setComments([data.comment, ...comments])
        setNewComment('')
        toast.success('评论发表成功')
      } else {
        const error = await response.json()
        console.error('❌ 评论失败:', error)
        toast.error(error.error || '评论提交失败')
      }
    } catch (error) {
      console.error('❌ 评论异常:', error)
      toast.error('评论提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    console.log('🗑️ 删除评论:', commentId)
    
    if (!user) {
      toast.error('请先登录')
      return
    }
    
    if (!confirm('确定要删除这条评论吗？')) {
      return
    }
    
    try {
      const token = await getToken()
      
      if (!token) {
        toast.error('请先登录')
        return
      }
      
      console.log('📝 调用删除API...')
      const response = await fetch(`/api/courses/${courseId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log(`📡 删除响应: ${response.status}`)
      
      if (response.ok) {
        console.log('✅ 删除成功')
        setComments(comments.filter(c => c.id !== commentId))
        toast.success('评论已删除')
      } else {
        const error = await response.json()
        console.error('❌ 删除失败:', error)
        toast.error(error.error || '删除失败')
      }
    } catch (error) {
      console.error('❌ 删除异常:', error)
      toast.error('删除失败')
    }
  }

  // 分享课程
  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: `推荐课程：${course?.title}`,
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold flex-1 line-clamp-1">课程详情</h1>
        </div>
      </header>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black">
        {course.image_url ? (
          <div className="relative w-full h-full">
            <Image
              src={course.image_url}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button 
                size="lg" 
                className="rounded-full h-16 w-16 bg-white/90 hover:bg-white text-primary"
                onClick={() => toast.info('视频播放功能即将上线')}
              >
                <Play className="h-8 w-8 fill-current ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Course Info - B站风格 */}
      <div className="px-4 py-4 space-y-4">
        
        {/* 讲师信息 */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {course.instructor?.charAt(0) || 'T'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{course.instructor}</div>
            <div className="text-sm text-muted-foreground">蓝染工艺讲师</div>
          </div>
          <Button 
            variant={courseId && isCourseFavorite(courseId) ? "default" : "outline"}
            size="sm"
            onClick={handleStartLearning}
          >
            开始学习
          </Button>
        </div>

        {/* 标题 */}
        <div>
          <h2 className="text-lg font-semibold leading-tight mb-2">
            {course.title}
          </h2>
          
          {/* 统计信息 - 类似B站 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {Math.floor(Math.random() * 5000) + 500}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(course.created_at).toLocaleDateString('zh-CN')}
            </span>
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}分钟
              </span>
            )}
          </div>
        </div>

        {/* 标签 */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="rounded-sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* 操作按钮 - B站风格 */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">{likes}</span>
          </button>

          <button
            onClick={handleFavorite}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Heart className={`h-5 w-5 ${courseId && isCourseFavorite(courseId) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">收藏</span>
          </button>

          <button
            onClick={() => setActiveTab("comments")}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">分享</span>
          </button>
        </div>

        <Separator />

        {/* Tabs - 简介和评论 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0">
            <TabsTrigger 
              value="intro" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              简介
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              评论 {comments.length}
            </TabsTrigger>
          </TabsList>

          {/* 简介 */}
          <TabsContent value="intro" className="mt-4 space-y-4">
            <div className="text-sm leading-relaxed text-muted-foreground">
              {course.description || `由 ${course.instructor} 老师讲解的《${course.title}》课程，详细介绍蓝染技艺的实践操作方法。`}
            </div>
          </TabsContent>

          {/* 评论 */}
          <TabsContent value="comments" className="mt-4 space-y-4">
            {/* 发表评论 */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <textarea
                  className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="发一条友善的评论..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {newComment.length}/500
                  </span>
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting || !newComment.trim()}
                    size="sm"
                  >
                    {isSubmitting ? '发表中...' : '发表评论'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 评论列表 */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {comment.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        {user && comment.user_id === user.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{comment.likes_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">暂无评论，快来抢沙发！</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
