import { OptimizedImage } from "@/components/ui/optimized-image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Clock, Play, Users, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
  id: string
  title: string
  instructor: string
  duration: string
  students: number
  thumbnail: string
  price?: number
  isFree?: boolean
  showFavorite?: boolean
  isFavorite?: boolean
}

export function CourseCard({ 
  id, 
  title, 
  instructor, 
  duration, 
  students, 
  thumbnail, 
  price, 
  isFree,
  showFavorite = false,
  isFavorite: propIsFavorite
}: CourseCardProps) {
  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  
  // 如果没有传入isFavorite属性，从context获取
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : isCourseFavorite(id)
  
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
    <div className="relative group w-full max-w-[280px] mx-auto">
      <Card className="cultural-card hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg bg-card">
        <Link href={`/teaching/${id}`} prefetch={false} className="block">
          <div className="relative overflow-hidden rounded-t-xl aspect-video">
            <OptimizedImage
              src={thumbnail || "/placeholder.svg"}
              alt={title}
              width={256}
              height={144}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              lazy={true}
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
              <Play className="h-6 w-6 text-white fill-white transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>
          <div className="p-2.5">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1 line-clamp-1 transition-colors duration-200 group-hover:text-primary">{title}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">{instructor}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
                <Users className="h-2.5 w-2.5 mr-0.5" />
                {students}人
              </div>
              <div className="text-xs sm:text-sm font-semibold text-accent">{isFree ? "免费" : `¥${price}`}</div>
            </div>
          </div>
        </Link>
        
        {/* 收藏按钮 */}
        {showFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 shadow-lg hover:shadow-xl"
            onClick={handleFavoriteClick}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={loading}
            type="button"
            aria-label={isFavorite ? "取消收藏" : "收藏课程"}
          >
            <Heart 
              className={`h-4 w-4 transition-colors duration-200 ${
                isFavorite 
                  ? "text-red-500 fill-red-500" 
                  : "text-muted-foreground hover:text-red-500"
              }`} 
            />
          </Button>
        )}
      </Card>
    </div>
  )
}
