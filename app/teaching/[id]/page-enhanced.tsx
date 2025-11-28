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
        // 模拟数据
        setLikes(Math.floor(Math.random() * 500) + 50)
        setComments([])
        
      } catch (error) {
        console.error('加载课程数据失败:', error)
        toast.error('加载课程数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourse()
  }, [courseId, router])

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
  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1)
      setIsLiked(false)
      toast.success('已取消点赞')
    } else {
      setLikes(likes + 1)
      setIsLiked(true)
      toast.success('点赞成功')
    }
  }

  // 提交评论
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.error('请输入评论内容')
      return
    }
    
    setIsSubmitting(true)
    try {
      // TODO: 实现真实的评论API
      const mockComment = {
        id: Date.now().toString(),
        user_name: '当前用户',
        content: newComment,
        created_at: new Date().toISOString(),
        likes: 0
      }
      
      setComments([mockComment, ...comments])
      setNewComment('')
      toast.success('评论发表成功')
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
              <Eye className="h-4 w-4" />
              <span>{Math.floor(Math.random() * 5000) + 500} 次观看</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{likes} 点赞</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>4.8</span>
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
                    {course.original_price && (
                      <span className="text-sm text-muted-foreground line-through">¥{course.original_price}</span>
                    )}
                  </div>
                )}
              </div>
              <Button size="lg" className="shadow-lg">
                {(course.price === 0 || course.price === null) ? '立即学习' : '立即购买'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Tabs */}
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

          {/* 课程介绍 */}
          <TabsContent value="intro" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    课程介绍
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description || `由 ${course.instructor} 老师讲解的《${course.title}》课程，详细介绍蓝染技艺的实践操作方法。通过本课程，你将学习到传统蓝染工艺的核心技术，掌握从材料准备到成品制作的完整流程。`}
                  </p>
                </div>

                <Separator />

                {/* 课程亮点 */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    课程亮点
                  </h3>
                  <div className="space-y-2">
                    {[
                      '系统讲解蓝染工艺的理论知识',
                      '实战演示操作技巧和注意事项',
                      '提供完整的材料清单和工具指南',
                      '适合零基础学员快速入门',
                    ].map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
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

          {/* 讲师信息 */}
          <TabsContent value="instructor" className="space-y-4 mt-4">
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
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>👥 学员 {Math.floor(Math.random() * 1000) + 100}</span>
                      <span>📚 课程 {Math.floor(Math.random() * 10) + 1}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold mb-2">讲师简介</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {course.instructor} 老师从事蓝染工艺教学多年，擅长将传统技艺与现代设计相结合，帮助学员快速掌握蓝染的核心技术。课程讲解细致入微，深受学员好评。
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">专业领域</h4>
                  <div className="flex flex-wrap gap-2">
                    {['传统蓝染', '图案设计', '工艺创新', '材料应用'].map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 评论区 */}
          <TabsContent value="comments" className="space-y-4 mt-4">
            {/* 评论输入框 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">发表评论</h3>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="分享你的学习心得和感受..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
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

            {/* 评论列表 */}
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
                              <span>{comment.likes || 0}</span>
                            </button>
                            <button className="hover:text-primary transition-colors">
                              回复
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
