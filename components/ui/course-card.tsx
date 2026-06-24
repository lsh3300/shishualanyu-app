"use client"

import { OptimizedImage } from "@/components/ui/optimized-image"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Clock, Play, Users, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
  id: string
  slug?: string
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
  slug,
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
  const router = useRouter()
  
  // 如果没有传入isFavorite属性，从context获取
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : isCourseFavorite(id)
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏课程",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (isFavorite) {
        await removeCourseFromFavorites(id)
      } else {
        await addCourseToFavorites(id)
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

  const handleCardClick = () => {
    router.push(`/teaching/${slug || id}`)
  }

  return (
    <div className="relative group w-full max-w-[280px] mx-auto cursor-pointer" onClick={handleCardClick}>
      <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
        <div className="block">
          <div className="relative overflow-hidden aspect-video">
            <OptimizedImage
              src={thumbnail || "/placeholder.svg"}
              alt={title}
              width={256}
              height={144}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              lazy={true}
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 时长标签 */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
            
            {/* 播放按钮 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 shadow-lg">
              <Play className="h-6 w-6 text-white fill-white transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-foreground mb-1.5 line-clamp-1 transition-colors duration-200 group-hover:text-primary">{title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{instructor}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {students}人学习
              </div>
              {/* 价格/免费标签 */}
              {isFree ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                  免费
                </span>
              ) : (
                <span className="text-sm font-bold text-accent">¥{price}</span>
              )}
            </div>
          </div>
        </div>
        
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
