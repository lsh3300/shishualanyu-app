"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Clock, Play, Users, Heart, Award } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FeatureCourseCardProps {
  id: string
  slug?: string
  title: string
  instructor: string
  duration: string
  students: number
  thumbnail: string
  price?: number
  isFree?: boolean
  variant?: 'featured' | 'normal'
  showFavorite?: boolean
}

/**
 * 特色课程卡片组件
 * - featured: 大卡片，显示更多信息
 * - normal: 普通卡片，紧凑布局
 */
export function FeatureCourseCard({ 
  id, 
  slug,
  title, 
  instructor, 
  duration, 
  students, 
  thumbnail, 
  price, 
  isFree,
  variant = 'normal',
  showFavorite = true
}: FeatureCourseCardProps) {
  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  const router = useRouter()
  
  const isFavorite = isCourseFavorite(id)
  
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

  // 统一卡片布局 - 所有卡片使用相同结构，只是宽度不同
  const isFeatured = variant === 'featured'
  
  return (
    <div 
      className="relative group w-full cursor-pointer" 
      onClick={handleCardClick}
    >
      <Card className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 ink-spread-hover",
        isFeatured && "shadow-md hover:shadow-xl hover:shadow-primary/15"
      )}>
        {/* 统一使用 aspect-video 比例 */}
        <div className="relative overflow-hidden aspect-video bg-muted">
          <Image
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            fill
            sizes={isFeatured 
              ? "(max-width: 640px) 260px, (max-width: 1024px) 300px, 340px"
              : "(max-width: 640px) 180px, (max-width: 1024px) 220px, 260px"
            }
            className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
          />
          {/* 渐变遮罩 */}
          <div className={cn(
            "absolute inset-0 transition-opacity duration-300",
            isFeatured 
              ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              : "bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100"
          )} />
          
          {/* 时长标签 */}
          <div className={cn(
            "absolute bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm",
            isFeatured ? "top-2 left-2" : "bottom-2 right-2"
          )}>
            <Clock className="h-3 w-3" />
            {duration}
          </div>
          
          {/* 免费/价格标签 - 特色卡片显示在图片上 */}
          {isFeatured && (isFree ? (
            <div className="droplet-tag absolute top-2 right-2">
              免费
            </div>
          ) : price && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ¥{price}
            </div>
          ))}
          
          {/* 播放按钮 */}
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 shadow-lg",
            isFeatured ? "p-3" : "p-2.5"
          )}>
            <Play className={cn("text-white fill-white", isFeatured ? "h-6 w-6" : "h-5 w-5")} />
          </div>
        </div>
        
        {/* 底部信息区域 - 统一结构 */}
        <div className="p-3">
          <h3 className={cn(
            "font-semibold text-foreground mb-1.5 line-clamp-1 transition-colors duration-200 group-hover:text-primary",
            isFeatured ? "text-sm" : "text-sm"
          )}>
            {title}
          </h3>
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs text-muted-foreground">{instructor}</p>
            <span className="craftsman-badge text-[9px] py-0.5 px-1.5">
              <Award className="h-2 w-2" />
              匠人
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {students}人学习
            </div>
            {/* 价格/免费标签 */}
            {isFree ? (
              <span className="droplet-tag text-[10px] py-0.5 px-2">
                免费
              </span>
            ) : price && (
              <span className="text-sm font-bold price-gold-gradient">¥{price}</span>
            )}
          </div>
        </div>
      </Card>
      
      {/* 收藏按钮 */}
      {showFavorite && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute h-8 w-8 rounded-full backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 shadow-lg",
            isFeatured 
              ? "top-2 right-10 bg-black/40 hover:bg-black/60"
              : "top-2 right-2 bg-background/80 hover:bg-background"
          )}
          onClick={handleFavoriteClick}
          disabled={loading}
          type="button"
          aria-label={isFavorite ? "取消收藏" : "收藏课程"}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              isFavorite ? "text-red-500 fill-red-500" : isFeatured ? "text-white hover:text-red-400" : "text-muted-foreground hover:text-red-500"
            )} 
          />
        </Button>
      )}
    </div>
  )
}
