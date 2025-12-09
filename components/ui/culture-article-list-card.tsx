"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Heart, Eye } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

interface CultureArticleListCardProps {
  id: string
  title: string
  excerpt: string
  image: string
  readTime: string
  showFavorite?: boolean
  articleId?: string
  views?: number
}

/**
 * B站风格的横向文章卡片组件
 * 左侧缩略图 + 右侧信息
 */
export function CultureArticleListCard({ 
  id, 
  title, 
  excerpt, 
  image, 
  readTime, 
  showFavorite = true, 
  articleId,
  views = 0
}: CultureArticleListCardProps) {
  const { isArticleFavorite, addArticleToFavorites, removeArticleFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  
  const favoriteId = articleId || id
  const isFavorite = isArticleFavorite(favoriteId)
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏文章",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (isFavorite) {
        await removeArticleFromFavorites(favoriteId)
      } else {
        await addArticleToFavorites(favoriteId)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
    }
  }

  return (
    <Link href={`/culture/${id}`} className="block w-full max-w-4xl mx-auto">
      <Card 
        className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-card border-border/50 hover:border-primary/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
          {/* 左侧缩略图 */}
          <div className="relative flex-shrink-0 w-[100px] sm:w-[140px] md:w-[160px] aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 120px, (max-width: 768px) 160px, 180px"
            />
            
            {/* 阅读时间标签 */}
            <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {readTime}
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* 标题 */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary leading-tight">
                {title}
              </h3>
              
              {/* 摘要 - 移动端隐藏 */}
              <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                {excerpt}
              </p>
            </div>

            {/* 底部信息栏 */}
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {/* 浏览量 */}
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{views > 10000 ? `${(views / 10000).toFixed(1)}万` : views}</span>
                </div>
                
                {/* 阅读时间 */}
                <div className="hidden sm:flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{readTime} 阅读</span>
                </div>
              </div>

              {/* 收藏按钮 */}
              {showFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all duration-200 ${
                    isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'
                  }`}
                  onClick={handleFavoriteClick}
                  disabled={loading}
                  type="button"
                  aria-label={isFavorite ? "取消收藏" : "收藏文章"}
                >
                  <Heart 
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors duration-200 ${
                      isFavorite 
                        ? "text-red-500 fill-red-500" 
                        : "text-muted-foreground hover:text-red-500"
                    }`} 
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
