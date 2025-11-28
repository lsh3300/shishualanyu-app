'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, Clock, User, Heart, MessageCircle, Share2, Play, 
  ThumbsUp, BookOpen, Award, Trash2, Star, Eye, Users,
  CheckCircle2, TrendingUp, Zap, Target, Sparkles,
  Video, FileText, Download, BarChart3
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

  // 模拟课程章节数据
  const courseSections = [
    { id: 1, title: "第一章：蓝染基础理论", duration: "15分钟", completed: false, lessons: 3 },
    { id: 2, title: "第二章：工具与材料准备", duration: "20分钟", completed: false, lessons: 4 },
    { id: 3, title: "第三章：扎染技法详解", duration: "35分钟", completed: false, lessons: 5 },
    { id: 4, title: "第四章：实战操作演示", duration: "45分钟", completed: false, lessons: 6 },
  ]

  // 课程亮点
  const courseHighlights = [
    { icon: Target, title: "实战导向", desc: "从零到一完整实践" },
    { icon: Users, title: "小班教学", desc: "讲师一对一指导" },
    { icon: Award, title: "证书认证", desc: "完成颁发结业证书" },
    { icon: Sparkles, title: "终身回看", desc: "不限次数随时学习" },
  ]

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

  // 点赞课程（使用Bearer token）
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

  // 提交评论（使用Bearer token）
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background pb-24">
      {/* Header */}
      <header className="bg-card/95 border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4 p-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-primary/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold flex-1 line-clamp-1">课程详情</h1>
          <Button variant="ghost" size="icon" onClick={handleShare} className="hover:bg-primary/10">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Video Player Area - 更高级的渐变背景 */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20 overflow-hidden">
        {course.image_url ? (
          <div className="relative w-full h-full group">
            <Image
              src={course.image_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <Button 
                size="lg" 
                className="rounded-full h-20 w-20 bg-white/95 hover:bg-white hover:scale-110 text-primary shadow-2xl transition-all duration-300"
                onClick={() => toast.info('视频播放功能即将上线')}
              >
                <Play className="h-10 w-10 fill-current ml-1" />
              </Button>
            </div>
            
            {/* 视频信息悬浮层 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/90 backdrop-blur-sm">热门</Badge>
                <Badge variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30">
                  4.9分
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="rounded-full bg-primary/10 p-8 mb-4">
              <Play className="h-16 w-16 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">视频即将上线</p>
          </div>
        )}
      </div>

      {/* Main Content - 使用max-w容器 */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* 标题和统计信息 - 更美观的卡片 */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {course.title}
                  </h1>
                  <Badge variant="secondary" className="text-sm">
                    {course.category || '蓝染工艺'}
                  </Badge>
                </div>
                
                {/* 统计数据 - 更美观的展示 */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">4.9</span>
                    </div>
                    <span className="text-muted-foreground">(1,234 评价)</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 5000) + 500} 人学习</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{likes} 点赞</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{comments.length} 评论</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration || 30} 分钟</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - 更美观的按钮组 */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="lg"
                onClick={handleLike}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? '已点赞' : '点赞'}
              </Button>
              
              <Button
                variant={courseId && isCourseFavorite(courseId) ? "default" : "outline"}
                size="lg"
                onClick={handleFavorite}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <Heart className={`h-4 w-4 mr-2 ${courseId && isCourseFavorite(courseId) ? 'fill-current' : ''}`} />
                {courseId && isCourseFavorite(courseId) ? '已收藏' : '收藏'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveTab("comments")}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                评论
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 课程亮点 - 新增 */}
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              课程亮点
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {courseHighlights.map((highlight, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 bg-background/50 rounded-lg backdrop-blur-sm">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <highlight.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{highlight.title}</h4>
                  <p className="text-xs text-muted-foreground">{highlight.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 价格卡片 - 更吸引人的设计 */}
        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {(course.price === 0 || course.price === null) ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Award className="h-6 w-6 text-primary" />
                      <span className="text-2xl font-bold text-primary">限时免费</span>
                      <Badge className="bg-red-500">HOT</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground ml-9">原价 ¥299，现在免费学习</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">¥{course.price}</span>
                      <span className="text-lg text-muted-foreground line-through">¥{(course.price * 1.5).toFixed(0)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">已有 {Math.floor(Math.random() * 1000) + 100} 人购买</p>
                  </div>
                )}
              </div>
              <Button 
                size="lg" 
                className="shadow-lg hover:shadow-xl transition-all h-14 px-8 text-lg font-semibold"
                onClick={handleStartLearning}
              >
                {(course.price === 0 || course.price === null) ? (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    立即学习
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    立即购买
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Separator className="my-8" />

        {/* Tabs - 美化的标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50">
            <TabsTrigger value="intro" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              介绍
            </TabsTrigger>
            <TabsTrigger value="sections" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="h-4 w-4 mr-2" />
              章节
            </TabsTrigger>
            <TabsTrigger value="instructor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4 mr-2" />
              讲师
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageCircle className="h-4 w-4 mr-2" />
              评论 ({comments.length})
            </TabsTrigger>
          </TabsList>

          {/* 介绍标签 */}
          <TabsContent value="intro" className="space-y-6 mt-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  课程介绍
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {course.description || `由 ${course.instructor} 老师讲解的《${course.title}》课程，详细介绍蓝染技艺的实践操作方法。本课程从基础理论到实战操作，全方位讲解蓝染工艺的精髓。`}
                </p>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-3">你将学到</h4>
                  <div className="grid gap-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">掌握蓝染的基本原理和化学反应过程</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">学习各种扎染和绑染技法</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">完成独立的蓝染作品创作</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">了解蓝染文化的历史传承</span>
                    </div>
                  </div>
                </div>

                {course.tags && course.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">课程标签</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 章节标签 - 新增 */}
          <TabsContent value="sections" className="space-y-4 mt-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    课程章节
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    共 {courseSections.reduce((acc, s) => acc + s.lessons, 0)} 节课
                  </Badge>
                </div>
                <CardDescription>
                  系统学习，循序渐进掌握蓝染技艺
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseSections.map((section, index) => (
                  <Card key={section.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <span className="font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {section.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Video className="h-3.5 w-3.5" />
                              {section.lessons} 课时
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {section.duration}
                            </span>
                          </div>
                        </div>
                        {section.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">学习进度</span>
                    <span className="font-semibold">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 讲师标签 - 美化 */}
          <TabsContent value="instructor" className="space-y-4 mt-6">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-transparent p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                      {course.instructor?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{course.instructor}</h3>
                    <p className="text-muted-foreground mb-4">蓝染工艺讲师 · 非物质文化遗产传承人</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-background/50 rounded-lg backdrop-blur-sm">
                        <div className="text-2xl font-bold text-primary">12</div>
                        <div className="text-xs text-muted-foreground mt-1">课程数</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg backdrop-blur-sm">
                        <div className="text-2xl font-bold text-primary">8.5K</div>
                        <div className="text-xs text-muted-foreground mt-1">学员数</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg backdrop-blur-sm">
                        <div className="text-2xl font-bold text-primary">4.9</div>
                        <div className="text-xs text-muted-foreground mt-1">好评度</div>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      从事蓝染工艺研究与教学20余年，擅长传统扎染、蜡染等多种技法。作品多次在国内外展览中获奖，致力于传统工艺的现代化传承与创新。
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 评论标签 - 保持功能 */}
          <TabsContent value="comments" className="space-y-4 mt-6">
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  发表评论
                </h3>
                <textarea
                  className="w-full min-h-[100px] p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                    className="shadow-sm hover:shadow-md transition-all"
                  >
                    {isSubmitting ? '发表中...' : '发表评论'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 评论列表 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  全部评论 ({comments.length})
                </h3>
                {comments.length > 0 && (
                  <Badge variant="outline">最新</Badge>
                )}
              </div>
              
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Card key={comment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
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
                                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                                title="删除评论"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed mb-2 text-foreground/90">{comment.content}</p>
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
                <Card className="border-dashed">
                  <CardContent className="py-16">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium mb-1">暂无评论</p>
                      <p className="text-sm">快来发表第一条评论吧！</p>
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
