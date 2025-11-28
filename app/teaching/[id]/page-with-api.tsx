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
  ThumbsUp, Eye, Star, BookOpen, CheckCircle2, Award
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useFavorites } from "@/hooks/use-favorites"
import Image from "next/image"

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
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
        
        // 获取课程基本信息
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
        fetchLikeStatus()
        
        // 获取评论
        fetchComments()
        
      } catch (error) {
        console.error('加载课程数据失败:', error)
        toast.error('加载课程数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourse()
  }, [courseId, router])

  // 获取点赞状态
  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/like`)
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

  // 点赞课程 - 使用真实API
  const handleLike = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/like`, {
        method: 'POST'
      })
      
      if (response.status === 401) {
        toast.error('请先登录')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikes(data.likesCount)
        toast.success(data.message)
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  // 开始学习课程
  const handleStartLearning = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST'
      })
      
      if (response.status === 401) {
        toast.error('请先登录')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setIsEnrolled(true)
        toast.success(data.message)
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  // 提交评论 - 使用真实API
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.error('请输入评论内容')
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment
        })
      })
      
      if (response.status === 401) {
        toast.error('请先登录')
        setIsSubmitting(false)
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setNewComment('')
        toast.success('评论发表成功')
      } else {
        const error = await response.json()
        toast.error(error.error || '评论提交失败')
      }
    } catch (error) {
      toast.error('评论提交失败')
    } finally {
      setIsSubmitting(false)
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
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-card/95">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold flex-1 line-clamp-1">课程详情</h1>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Video Player Area */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-background">
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
                className="rounded-full h-16 w-16 bg-white/90 hover:bg-white text-primary shadow-2xl"
                onClick={() => toast.info('视频播放功能即将上线')}
              >
                <Play className="h-8 w-8 fill-current" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Play className="h-20 w-20 text-primary/30 mb-4" />
            <p className="text-muted-foreground text-sm">视频即将上线</p>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-4 space-y-4">
        {/* Title and Stats */}
        <div>
          <div className="flex items-start gap-3 mb-3">
            <h2 className="text-2xl font-bold flex-1 leading-tight">{course.title}</h2>
            <Badge variant="secondary" className="mt-1">{course.category || '蓝染工艺'}</Badge>
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{likes} 点赞</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length} 评论</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className="flex-1"
          >
            <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {isLiked ? '已点赞' : '点赞'}
          </Button>
          <Button
            variant={courseId && isCourseFavorite(courseId) ? "default" : "outline"}
            size="sm"
            onClick={handleFavorite}
            className="flex-1"
          >
            <Heart className={`h-4 w-4 mr-2 ${courseId && isCourseFavorite(courseId) ? 'fill-current' : ''}`} />
            {courseId && isCourseFavorite(courseId) ? '已收藏' : '收藏'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("comments")}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            评论
          </Button>
        </div>

        <Separator />

        {/* Price Tag */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {(course.price === 0 || course.price === null) ? (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold text-primary">限时免费</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">¥{course.price}</span>
                  </div>
                )}
              </div>
              <Button size="lg" className="shadow-lg" onClick={handleStartLearning}>
                {(course.price === 0 || course.price === null) ? '立即学习' : '立即购买'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Tabs - 继续使用之前的标签页代码，但评论部分使用真实数据 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="intro">
              <BookOpen className="h-4 w-4 mr-2" />
              介绍
            </TabsTrigger>
            <TabsTrigger value="instructor">
              <User className="h-4 w-4 mr-2" />
              讲师
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageCircle className="h-4 w-4 mr-2" />
              评论 ({comments.length})
            </TabsTrigger>
          </TabsList>

          {/* 介绍和讲师标签与之前相同 */}
          <TabsContent value="intro" className="space-y-4 mt-4">
            {/* 课程介绍内容保持不变 */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    课程介绍
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description || `由 ${course.instructor} 老师讲解的《${course.title}》课程，详细介绍蓝染技艺的实践操作方法。`}
                  </p>
                </div>

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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-4 mt-4">
            {/* 讲师信息内容保持不变 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {course.instructor?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{course.instructor}</h3>
                    <p className="text-sm text-muted-foreground">蓝染工艺讲师</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 评论区 - 使用真实数据 */}
          <TabsContent value="comments" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">发表评论</h3>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="分享你的学习心得和感受..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-muted-foreground">
                    {newComment.length}/500
                  </span>
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    {isSubmitting ? '发表中...' : '发表评论'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 评论列表 - 真实数据 */}
            <div className="space-y-3">
              <h3 className="font-semibold px-1">
                全部评论 ({comments.length})
              </h3>
              
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {comment.user_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.user_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed mb-2">{comment.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-primary transition-colors">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{comment.likes_count || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>暂无评论，快来发表第一条评论吧！</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
