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
  const { isFavorite: contextIsFavorite, toggleFavorite, loading } = useFavorites()
  const { user } = useAuth()
  
  // 如果没有传入isFavorite属性，从context获取
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : contextIsFavorite(id)
  
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
      await toggleFavorite(id)
      toast({
        title: isFavorite ? "取消收藏成功" : "收藏成功",
        description: isFavorite ? "已从收藏夹移除" : "已添加到收藏夹"
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      })
    }
  }
  return (
    <div className="relative group">
      <Link href={`/teaching/${id}`} className="block">
        <Card className="cultural-card hover:scale-105 transition-all duration-300 w-64 flex-shrink-0 shadow-md hover:shadow-lg bg-white">
          <div className="relative overflow-hidden rounded-t-xl">
            <OptimizedImage
              src={thumbnail || "/placeholder.svg"}
              alt={title}
              width={256}
              height={144}
              className="w-full h-36 object-cover transition-transform duration-700 group-hover:scale-110"
              lazy={true}
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
              <Play className="h-6 w-6 text-white fill-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            
            {/* 收藏按钮 */}
            {showFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                onClick={handleFavoriteClick}
                disabled={loading}
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
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{instructor}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {students}人学习
              </div>
              <div className="text-sm font-semibold text-accent">{isFree ? "免费" : `¥${price}`}</div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}
