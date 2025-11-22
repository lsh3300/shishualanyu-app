"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface ArticleFavoriteButtonProps {
  articleId: string
  articleTitle: string
}

export function ArticleFavoriteButton({ articleId, articleTitle }: ArticleFavoriteButtonProps) {
  const { isArticleFavorite, addArticleToFavorites, removeArticleFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  
  const isFavorite = isArticleFavorite(articleId)
  
  const handleFavoriteClick = async () => {
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
        await removeArticleFromFavorites(articleId)
      } else {
        await addArticleToFavorites(articleId)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
    }
  }
  
  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={handleFavoriteClick}
      disabled={loading}
      className="gap-2"
    >
      <Heart 
        className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} 
      />
      {isFavorite ? "已收藏" : "收藏文章"}
    </Button>
  )
}
