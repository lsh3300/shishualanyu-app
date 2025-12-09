"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface CultureArticleCardProps {
  id: string
  title: string
  excerpt: string
  image: string
  readTime: string
  showFavorite?: boolean
  articleId?: string  // 文章的 UUID ID，用于收藏
}

export function CultureArticleCard({ id, title, excerpt, image, readTime, showFavorite = true, articleId }: CultureArticleCardProps) {
  const { isArticleFavorite, addArticleToFavorites, removeArticleFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  
  // 使用 articleId 或 id 作为收藏标识
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
    <div className="relative group">
      <Link href={`/culture/${id}`}>
        <Card className="cultural-card hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg bg-card">
        <div className="relative overflow-hidden rounded-t-xl aspect-[16/9]">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{excerpt}</p>
          <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readTime} 阅读
          </div>
        </div>
      </Card>
    </Link>
    
    {/* 收藏按钮 */}
    {showFavorite && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/95 hover:bg-white backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 shadow-lg hover:shadow-xl"
        onClick={handleFavoriteClick}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={loading}
        type="button"
        aria-label={isFavorite ? "取消收藏" : "收藏文章"}
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
  )
}
