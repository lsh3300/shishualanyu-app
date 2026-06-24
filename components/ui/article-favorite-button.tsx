"use client"

import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ArticleFavoriteButtonProps {
  articleId: string
  articleTitle: string
  iconOnly?: boolean
  className?: string
}

export function ArticleFavoriteButton({
  articleId,
  iconOnly = false,
  className,
}: ArticleFavoriteButtonProps) {
  const { isArticleFavorite, addArticleToFavorites, removeArticleFromFavorites, loading } = useFavorites()
  const { user } = useAuth()

  const isFavorite = isArticleFavorite(articleId)

  const handleFavoriteClick = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后才可以收藏文章",
        variant: "destructive",
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
      console.error("收藏操作失败:", error)
    }
  }

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFavoriteClick}
        disabled={loading}
        className={cn(
          "h-10 w-10 rounded-full border border-[#d7d0c6] bg-white/86 text-[#6f6a62] hover:bg-white hover:text-[#355b87]",
          className
        )}
        aria-label={isFavorite ? "取消收藏" : "收藏文章"}
      >
        <Bookmark className={cn("h-4.5 w-4.5", isFavorite ? "fill-[#355b87] text-[#355b87]" : "")} />
      </Button>
    )
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={handleFavoriteClick}
      disabled={loading}
      className={cn("gap-2", className)}
    >
      <Bookmark className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
      {isFavorite ? "已收藏" : "收藏文章"}
    </Button>
  )
}
