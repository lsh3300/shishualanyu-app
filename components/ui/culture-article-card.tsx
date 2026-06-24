"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"

interface CultureArticleCardProps {
  id: string
  title: string
  excerpt: string
  image: string
  readTime: string
  showFavorite?: boolean
  articleId?: string
}

export function CultureArticleCard({ id, title, excerpt, image, readTime, showFavorite = true, articleId }: CultureArticleCardProps) {
  const { isArticleFavorite, addArticleToFavorites, removeArticleFromFavorites, loading } = useFavorites()
  const { user } = useAuth()

  const favoriteId = articleId || id
  const isFavorite = isArticleFavorite(favoriteId)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏文章",
        variant: "destructive",
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
      console.error("收藏操作失败:", error)
    }
  }

  return (
    <div className="relative group">
      <Link href={`/culture/${id}`}>
        <Card className="overflow-hidden rounded-[22px] border border-[#dce6f1] bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] shadow-[0_10px_24px_rgba(62,95,141,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(62,95,141,0.12)]">
          <div className="relative aspect-[1.06/1] max-h-[28vh] overflow-hidden">
            <Image
              src={resolveStaticAssetUrl(image) || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="220px"
            />
          </div>
          <div className="p-3">
            <h3 className="mb-1 line-clamp-2 text-[14px] font-semibold leading-6 text-[#244361] transition-colors duration-200 group-hover:text-primary">
              {title}
            </h3>
            <p className="mb-2 line-clamp-1 text-[12px] text-[#7a8ca0]">{excerpt}</p>
            <div className="flex items-center gap-1 text-[11px] text-[#8a9aad]">
              <Clock className="h-3 w-3" />
              {readTime}
            </div>
          </div>
        </Card>
      </Link>

      {showFavorite && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-20 h-7 w-7 rounded-full bg-white/95 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-xl group-hover:opacity-100"
          onClick={handleFavoriteClick}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={loading}
          type="button"
          aria-label={isFavorite ? "取消收藏" : "收藏文章"}
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-200 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
            }`}
          />
        </Button>
      )}
    </div>
  )
}
