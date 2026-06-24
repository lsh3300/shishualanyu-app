"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { useFavorites } from "@/hooks/use-favorites"

interface ProductGridCardProps {
  id: string
  routeId?: string
  href?: string
  name: string
  price: number
  originalPrice?: number
  image: string
  sales: number
  isNew?: boolean
  discount?: number
  subtitle?: string
}

export function ProductGridCard({
  id,
  routeId,
  href,
  name,
  price,
  originalPrice,
  image,
  sales,
  isNew,
  discount,
}: ProductGridCardProps) {
  const { isFavorite, addToFavorites, removeFromFavorites, loading } = useFavorites()
  const [isFav, setIsFav] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const detailHref = href || `/store/${routeId || id}`

  const badge = (() => {
    if (sales >= 50) return { text: "热销", className: "bg-red-500" }
    if (isNew) return { text: "新品", className: "bg-teal-500" }
    if (discount) return { text: `-${discount}%`, className: "bg-[#2C6FB7]" }
    return null
  })()

  useEffect(() => {
    setIsFav(isFavorite(id))
  }, [id, isFavorite])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading || isPending) return

    setIsPending(true)
    try {
      if (isFav) {
        const ok = await removeFromFavorites(id)
        if (ok) setIsFav(false)
      } else {
        const ok = await addToFavorites(id)
        if (ok) setIsFav(true)
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Link href={detailHref}>
      <div className="rounded-[22px] border border-[#d9e7f8] bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(240,247,255,0.54)_100%)] p-1.5 shadow-[0_8px_20px_rgba(58,92,145,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(58,92,145,0.12)]">
        <div className="relative mb-2 aspect-[4/5] overflow-hidden rounded-[16px] bg-muted">
          <OptimizedImage
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
            usage="card"
            sizes="(max-width: 768px) 50vw, 240px"
          />

          {/* 角标 - 左上角 */}
          {badge && (
            <div className={`absolute top-0 left-0 px-2 py-0.5 text-[9px] font-bold text-white rounded-br-lg shadow ${badge.className}`}>
              {badge.text}
            </div>
          )}

          <button
            type="button"
            onClick={handleFavorite}
            aria-label={isFav ? "取消收藏" : "收藏"}
            disabled={loading || isPending}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#6b7f9f] shadow-sm backdrop-blur-sm transition-colors hover:text-[#c94b3c]"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-current text-[#c94b3c]" : ""}`} />
          </button>
        </div>

        <div className="px-1.5 pb-1">
          <h3 className="line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-snug text-[#243d66]">
            {name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[10px] font-medium leading-none text-[#617da7]">匠选</span>
            <span className="text-[10px] leading-none text-[#6c86b0]">日常器物</span>
          </div>

          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex min-w-0 items-baseline">
              <span className="text-[11px] font-bold text-red-600">¥</span>
              <span className="text-[15px] font-bold text-red-600 leading-none tabular-nums">{price}</span>
              {originalPrice && (
                <span className="ml-1 text-[11px] leading-none text-gray-400 line-through tabular-nums">¥{originalPrice}</span>
              )}
            </div>
            
            {/* 销量信息 */}
            <span className="text-[10px] leading-none text-[#7a93bc] whitespace-nowrap tabular-nums">已售 {sales}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
