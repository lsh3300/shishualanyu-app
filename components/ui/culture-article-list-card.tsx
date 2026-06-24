"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"

interface CultureArticleListCardProps {
  id: string
  title: string
  excerpt: string
  image: string
  readTime: string
  showFavorite?: boolean
  articleId?: string
}

export function CultureArticleListCard({
  id,
  title,
  excerpt,
  image,
  readTime,
  showFavorite = true,
  articleId,
}: CultureArticleListCardProps) {
  const { isArticleFavorite, addArticleToFavorites, removeArticleFromFavorites, loading } = useFavorites()
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const favoriteId = articleId || id
  const isFavorite = isArticleFavorite(favoriteId)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  return (
    <div className="mx-auto block w-full max-w-4xl cursor-pointer" onClick={handleCardClick}>
      <Card
        className="group gap-0 overflow-hidden rounded-[18px] border border-[#dce6f1] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfd_100%)] py-0 shadow-[0_8px_18px_rgba(62,95,141,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_22px_rgba(62,95,141,0.09)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-2 p-2">
          <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[12px] bg-muted sm:h-[78px] sm:w-[78px]">
            <div className="relative h-full w-full">
              <Image
                src={resolveStaticAssetUrl(image) || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 72px, 78px"
              />
            </div>

            <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px] leading-none text-white backdrop-blur-sm">
              <Clock className="h-2 w-2" />
              {readTime}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-start pt-0.5">
            <div className="flex items-start gap-1.5">
              <h3 className="line-clamp-2 flex-1 text-[12px] font-semibold leading-[1.3] text-[#244361] transition-colors duration-200 group-hover:text-primary">
                {title}
              </h3>

              {showFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`z-10 mt-[-1px] h-5 w-5 shrink-0 rounded-full p-0 transition-all duration-200 ${isHovered ? "opacity-100" : "opacity-80 sm:opacity-100"}`}
                  onClick={handleFavoriteClick}
                  disabled={loading}
                  type="button"
                  aria-label={isFavorite ? "取消收藏" : "收藏文章"}
                >
                  <Heart
                    className={`h-3.5 w-3.5 transition-colors duration-200 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                    }`}
                  />
                </Button>
              )}
            </div>

            <p className="mt-0.5 line-clamp-1 text-[10px] leading-[1.25] text-[#7a8ca0]">{excerpt}</p>

            <div className="mt-0.5 flex items-center gap-2 text-[9px] text-[#8a9aad]">
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
