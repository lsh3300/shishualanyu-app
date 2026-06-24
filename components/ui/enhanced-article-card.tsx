"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"

type ArticleCategory = "history" | "technique" | "people" | "story" | "news"

interface EnhancedArticleCardProps {
  id: string
  articleId?: string
  title: string
  excerpt: string
  image: string
  readTime: string
  category?: string
  variant?: "featured" | "compact"
  showFavorite?: boolean
}

const categoryConfig: Record<ArticleCategory, { label: string; className: string }> = {
  history: { label: "历史", className: "category-history" },
  technique: { label: "技艺", className: "category-technique" },
  people: { label: "人物", className: "category-people" },
  story: { label: "故事", className: "category-story" },
  news: { label: "资讯", className: "category-news" },
}

export function EnhancedArticleCard({
  id,
  articleId,
  title,
  excerpt,
  image,
  readTime,
  category,
  variant = "compact",
  showFavorite = true,
}: EnhancedArticleCardProps) {
  const { isArticleFavorite, addArticleToFavorites, removeArticleFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  const router = useRouter()

  const favoriteId = articleId || id
  const isFavorite = isArticleFavorite(favoriteId)
  const categoryInfo = category && categoryConfig[category as ArticleCategory]

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

  const handleCardClick = () => {
    router.push(`/culture/${id}`)
  }

  if (variant === "featured") {
    return (
      <div className="block h-full w-full cursor-pointer group" onClick={handleCardClick}>
        <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-md transition-all duration-300 hover:shadow-xl">
          <div className="relative h-[200px] bg-muted sm:h-[250px] md:h-[280px]">
            <Image
              src={resolveStaticAssetUrl(image) || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {categoryInfo && (
              <div
                className={cn(
                  "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium",
                  categoryInfo.className,
                )}
              >
                {categoryInfo.label}
              </div>
            )}

            {showFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-9 w-9 rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/60 group-hover:opacity-100"
                onClick={handleFavoriteClick}
                disabled={loading}
                type="button"
                aria-label={isFavorite ? "取消收藏" : "收藏文章"}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    isFavorite ? "fill-red-500 text-red-500" : "text-white hover:text-red-400",
                  )}
                />
              </Button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="mb-2 line-clamp-2 text-xl font-bold text-white drop-shadow-lg">{title}</h3>

              <p className="excerpt-expand mb-3 line-clamp-2 text-sm text-white/80">{excerpt}</p>

              <div className="flex items-center justify-between text-xs text-white/70">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="block w-full cursor-pointer group" onClick={handleCardClick}>
      <Card className="overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
        <div className="flex gap-3 p-3">
          <div className="relative aspect-square w-[90px] flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:w-[110px]">
            <Image
              src={resolveStaticAssetUrl(image) || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              sizes="120px"
            />

            {categoryInfo && (
              <div
                className={cn(
                  "absolute left-1.5 top-1.5 rounded px-2 py-0.5 text-[10px] font-medium",
                  categoryInfo.className,
                )}
              >
                {categoryInfo.label}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div>
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary">
                {title}
              </h3>

              <div className="excerpt-expand">
                <p className="line-clamp-2 text-xs text-muted-foreground">{excerpt}</p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{readTime}</span>
              </div>

              {showFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={handleFavoriteClick}
                  disabled={loading}
                  type="button"
                  aria-label={isFavorite ? "取消收藏" : "收藏文章"}
                >
                  <Heart
                    className={cn(
                      "h-3.5 w-3.5 transition-colors duration-200",
                      isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
                    )}
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
