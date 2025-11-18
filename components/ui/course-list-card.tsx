import { Play, Clock, Users, Star, Heart } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface CourseListCardProps {
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
  showFavorite?: boolean
}

export function CourseListCard({
  id,
  title,
  instructor,
  duration,
  students,
  rating,
  thumbnail,
  price,
  isFree,
  difficulty,
  category,
  showFavorite = false,
}: CourseListCardProps) {
  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  
  const isFavorite = isCourseFavorite(id)
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('收藏按钮被点击:', { id, isFavorite, user: user ? '已登录' : '未登录' })
    
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏课程",
        variant: "destructive"
      })
      return
    }
    
    try {
      console.log('开始执行收藏操作:', isFavorite ? '取消收藏' : '添加收藏')
      if (isFavorite) {
        const result = await removeCourseFromFavorites(id)
        console.log('取消收藏结果:', result)
      } else {
        const result = await addCourseToFavorites(id)
        console.log('添加收藏结果:', result)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      })
    }
  }
  
  return (
    <Card className="cultural-card hover:scale-105 transition-transform group relative">
      <Link href={`/teaching/${id}`} prefetch={false} className="block">
        <div className="flex gap-4">
          <div className="relative w-32 h-24 flex-shrink-0">
            <OptimizedImage src={thumbnail || "/placeholder.svg"} alt={title} fill className="object-cover rounded-lg" lazy={true} />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
              <Clock className="h-2 w-2" />
              {duration}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              <Badge
                variant={difficulty === "入门" ? "default" : difficulty === "进阶" ? "secondary" : "destructive"}
                className="text-xs"
              >
                {difficulty}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{instructor}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {students}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {rating}
                </div>
              </div>
              <div className="font-semibold text-accent">{isFree ? "免费" : `¥${price}`}</div>
            </div>
          </div>
        </div>
      </Link>
      
      {/* 收藏按钮 - 放在Link外面，避免事件冲突 */}
      {showFavorite && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/95 hover:bg-white backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 shadow-lg hover:shadow-xl"
          onClick={handleFavoriteClick}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={loading}
          type="button"
          aria-label={isFavorite ? "取消收藏" : "收藏课程"}
        >
          <Heart 
            className={`h-3.5 w-3.5 transition-colors duration-200 ${
              isFavorite 
                ? "text-red-500 fill-red-500" 
                : "text-muted-foreground hover:text-red-500"
            }`} 
          />
        </Button>
      )}
    </Card>
  )
}
