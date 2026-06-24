'use client'

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MessageCircle,
  Minus,
  Share,
  ShoppingBag,
  ShoppingCart,
  Plus,
} from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { VideoPlayer } from "@/components/ui/video-player"
import { Button } from "@/components/ui/button"
import { CommentSection } from "@/components/ui/comment-section"
import { LikeButton } from "@/components/ui/like-button"
import { useFavorites } from "@/hooks/use-favorites"
import { useCart } from "@/hooks/use-cart"
import { useStoreProducts } from "@/hooks/use-store-products"
import { cn } from "@/lib/utils"

export interface ProductDetailTemplateProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    images: string[]
    videos?: Array<{
      id: string
      url: string
      thumbnail: string
      title: string
      duration: string
    }>
    sales: number
    isNew?: boolean
    discount?: number
    description: string
    craftsmanStory: {
      story: string
      author: string
      title: string
    }
    specs?: {
      colors?: Array<{
        id: string
        label: string
        available: boolean
      }>
      sizes?: Array<{
        id: string
        label: string
        available: boolean
      }>
    }
    details: string[]
  }
}

type MediaItem =
  | {
      type: "image"
      src: string
    }
  | {
      type: "video"
      src: string
      video: {
        id: string
        url: string
        thumbnail: string
        title: string
        duration: string
      }
    }

function formatPrice(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`
}

function resolveProductImage(product: Record<string, unknown>) {
  if (Array.isArray(product.images)) {
    const image = product.images.find((item) => typeof item === "string" && item.length > 0)
    if (typeof image === "string") return image
  }
  if (typeof product.coverImage === "string" && product.coverImage) return product.coverImage
  if (typeof product.image_url === "string" && product.image_url) return product.image_url
  return "/placeholder.svg"
}

function buildSubtitle(product: ProductDetailTemplateProps["product"]) {
  const tags = [
    product.isNew ? "新品" : null,
    product.discount ? `限时${product.discount}折` : null,
    product.sales > 0 ? `已售 ${product.sales}` : null,
  ].filter(Boolean)

  return tags.length > 0 ? tags.join(" / ") : "植物染色 / 手工制作 / 独特纹理"
}

function MediaHero({
  mediaItems,
  currentIndex,
  onPrev,
  onNext,
  productName,
}: {
  mediaItems: MediaItem[]
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  productName: string
}) {
  if (mediaItems.length === 0) {
    return <div className="relative h-[23.75rem] w-full bg-[#d8d2c8]" />
  }

  const currentItem = mediaItems[currentIndex]

  return (
    <div className="relative h-[23.75rem] w-full overflow-hidden bg-[#d8d2c8]">
      {currentItem.type === "video" ? (
        <VideoPlayer
          url={currentItem.video.url}
          thumbnail={currentItem.video.thumbnail}
          title={currentItem.video.title}
          duration={currentItem.video.duration}
        />
      ) : (
        <OptimizedImage
          src={currentItem.src || "/placeholder.svg"}
          alt={productName}
          fill
          priority={currentIndex === 0}
          className="object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/28 to-transparent" />

      {mediaItems.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[#0f172a] shadow-[0_8px_20px_rgba(15,23,42,0.14)]"
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[#0f172a] shadow-[0_8px_20px_rgba(15,23,42,0.14)]"
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div className="absolute bottom-6 right-5 rounded-full bg-black/42 px-3 py-1 text-xs font-medium text-white">
        {currentIndex + 1}/{mediaItems.length}
      </div>
    </div>
  )
}

function InfoCard({
  product,
  isCurrentlyFavorite,
  onFavoriteClick,
  isLoading,
}: {
  product: ProductDetailTemplateProps["product"]
  isCurrentlyFavorite: boolean
  onFavoriteClick: () => void
  isLoading: boolean
}) {
  const savings =
    typeof product.originalPrice === "number" && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0

  return (
    <section className="relative z-10 -mt-5 mx-4 rounded-[22px] bg-white px-5 pb-5 pt-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[1.35rem] font-semibold leading-tight text-[#1d1d1f]">
              {product.name}
            </h1>
            <span className="rounded-md bg-[#f3ece4] px-2 py-1 text-[0.65rem] font-medium text-[#8c7b68]">
              匠人手作
            </span>
          </div>
          <p className="mt-2 text-[0.78rem] leading-5 text-[#8f8f95]">
            {buildSubtitle(product)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[1.9rem] font-semibold leading-none text-[#0c1e3c]">
              {formatPrice(product.price)}
            </span>
            {typeof product.originalPrice === "number" ? (
              <span className="text-sm text-[#b2b2b8] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            ) : null}
          </div>
          {savings > 0 ? (
            <div className="mt-2 inline-flex rounded-full bg-[#f5efe9] px-3 py-1 text-[0.72rem] text-[#8c7b68]">
              会员价 {formatPrice(product.price)} / 立省 {formatPrice(savings)}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onFavoriteClick}
          disabled={isLoading}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[0.82rem] font-medium transition-colors",
            isCurrentlyFavorite ? "bg-[#fff1f3] text-[#e11d48]" : "bg-[#f8f7f4] text-[#0c1e3c]",
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn("h-4 w-4", isCurrentlyFavorite && "fill-current")} />
          )}
          {isCurrentlyFavorite ? "已收藏" : "收藏"}
        </button>
      </div>

      <div className="my-4 h-px bg-[#efefef]" />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8edf2] text-sm font-semibold text-[#38506d]">
          匠
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#2c2c30]">{product.craftsmanStory.title}</p>
          <p className="mt-1 line-clamp-2 text-[0.78rem] leading-5 text-[#8c8c92]">
            {product.craftsmanStory.story}
          </p>
        </div>
        <div className="text-xs text-[#9a9aa1]">查看故事</div>
      </div>
    </section>
  )
}

function SpecPillButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean
  disabled?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-w-[4.5rem] rounded-[10px] border px-3 py-2 text-sm transition-colors",
        active
          ? "border-[#0c1e3c] bg-white text-[#0c1e3c]"
          : "border-transparent bg-[#f5f5f5] text-[#666]",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {label}
    </button>
  )
}

function QuantitySelector({
  value,
  onChange,
}: {
  value: number
  onChange: (nextValue: number) => void
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-[#ece8e2]">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-8 w-8 items-center justify-center bg-[#faf9f7] text-[#666]"
        aria-label="减少数量"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <div className="flex h-8 min-w-[2.75rem] items-center justify-center border-x border-[#ece8e2] text-sm text-[#333]">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center bg-[#faf9f7] text-[#666]"
        aria-label="增加数量"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function BottomActions({
  onAddToCart,
  onBuyNow,
  isLoading,
}: {
  onAddToCart: () => void
  onBuyNow: () => void
  isLoading: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="flex w-14 shrink-0 flex-col items-center justify-center text-[0.65rem] text-[#666]"
        aria-label="联系客服"
      >
        <MessageCircle className="mb-1 h-5 w-5 text-[#0c1e3c]" />
        客服
      </button>
      <Button
        variant="outline"
        className="h-11 min-w-0 flex-1 rounded-full border-[#0c1e3c] bg-white text-[0.95rem] font-semibold text-[#0c1e3c] hover:bg-[#f8f7f4]"
        onClick={onAddToCart}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
        加入购物车
      </Button>
      <Button
        className="h-11 min-w-0 flex-1 rounded-full bg-[#0c1e3c] text-[0.95rem] font-semibold text-white hover:bg-[#12294d]"
        onClick={onBuyNow}
        disabled={isLoading}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        立即购买
      </Button>
    </div>
  )
}

export function ProductDetailTemplate({ product }: ProductDetailTemplateProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToFavorites, removeFromFavorites, isFavorite: checkIsFavorite } = useFavorites()
  const { addToCart, selectExclusiveCartItems } = useCart()
  const { products: allProducts } = useStoreProducts()

  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [contentTab, setContentTab] = useState<"details" | "comments">("details")
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const returnTo = searchParams.get("returnTo")
  const from = searchParams.get("from")

  const detailBackHref = useMemo(() => {
    if (returnTo) return returnTo
    if (from === "home") return "/"
    if (from === "store") return "/store"
    return null
  }, [from, returnTo])

  const inheritedParams = new URLSearchParams(returnTo ? { returnTo } : from ? { from } : {})
  const inheritedQuery = inheritedParams.toString()
  const inheritedSuffix = inheritedQuery ? `?${inheritedQuery}` : ""

  const handleBackClick = () => {
    if (detailBackHref) {
      router.push(detailBackHref)
      return
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push("/store")
  }

  const mediaItems = useMemo<MediaItem[]>(
    () => [
      ...product.images.map((src) => ({ type: "image" as const, src })),
      ...(product.videos || []).map((video) => ({
        type: "video" as const,
        src: video.thumbnail,
        video,
      })),
    ],
    [product.images, product.videos],
  )

  const patternImages = product.images.slice(0, 4)

  const recommendedProducts = useMemo(
    () =>
      allProducts
        .filter((item) => typeof item.id === "string" && item.id !== product.id)
        .slice(0, 6),
    [allProducts, product.id],
  )

  useEffect(() => {
    if (typeof document === "undefined") return
    setPortalRoot(document.getElementById("mobile-fixed-actions-root"))
  }, [])

  useEffect(() => {
    setIsCurrentlyFavorite(checkIsFavorite(product.id))
  }, [checkIsFavorite, product.id])

  const handleFavoriteClick = async () => {
    setIsLoading(true)
    try {
      if (isCurrentlyFavorite) {
        const ok = await removeFromFavorites(product.id)
        if (ok) setIsCurrentlyFavorite(false)
      } else {
        const ok = await addToFavorites(product.id)
        if (ok) setIsCurrentlyFavorite(true)
      }
    } catch (error) {
      console.error("收藏操作失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await addToCart({
        product_id: product.id,
        quantity,
        color: selectedColor,
        size: selectedSize,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = async () => {
    setIsLoading(true)
    try {
      const result = await addToCart({
        product_id: product.id,
        quantity,
        color: selectedColor,
        size: selectedSize,
      })

      if (result.success) {
        if (result.addedItemId) {
          selectExclusiveCartItems([result.addedItemId])
          router.push(`/checkout?mode=buy-now&cartItem=${result.addedItemId}`)
        } else {
          router.push("/checkout")
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const actionsBar = (
    <div className="border-t border-[#ece7df] bg-[rgba(255,255,255,0.96)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)] pt-3 backdrop-blur-xl">
      <BottomActions onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} isLoading={isLoading} />
    </div>
  )

  const fixedBar = portalRoot
    ? createPortal(
        <div className="pointer-events-auto absolute inset-x-0 bottom-0">
          {actionsBar}
        </div>,
        portalRoot,
      )
    : <div className="fixed inset-x-0 bottom-0 z-[60]">{actionsBar}</div>

  return (
    <div className="min-h-screen bg-[#f8f7f4] pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)]">
      <section className="relative">
        <MediaHero
          mediaItems={mediaItems}
          currentIndex={currentIndex}
          onPrev={() => setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
          onNext={() => setCurrentIndex((prev) => (prev + 1) % mediaItems.length)}
          productName={product.name}
        />

        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-4 pt-10">
          <button
            type="button"
            onClick={handleBackClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/24 text-white backdrop-blur-md"
            aria-label="返回上一页"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/24 text-white backdrop-blur-md"
              aria-label={isCurrentlyFavorite ? "取消收藏" : "收藏"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn("h-4 w-4", isCurrentlyFavorite && "fill-current")} />
              )}
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/24 text-white backdrop-blur-md"
              aria-label="分享"
            >
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <InfoCard
        product={product}
        isCurrentlyFavorite={isCurrentlyFavorite}
        onFavoriteClick={handleFavoriteClick}
        isLoading={isLoading}
      />

      <main className="px-4 pb-6 pt-3">
        <section className="rounded-[18px] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          {patternImages.length > 1 ? (
            <div className="mb-4 flex items-start gap-3">
              <div className="w-12 pt-2 text-sm text-[#333]">图案</div>
              <div className="flex flex-1 flex-wrap gap-2.5">
                {patternImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "relative h-8 w-14 overflow-hidden rounded-md border",
                      currentIndex === index ? "border-[#0c1e3c] p-[1px]" : "border-transparent",
                    )}
                    aria-label={`切换到图案 ${index + 1}`}
                  >
                    <OptimizedImage
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} 图案 ${index + 1}`}
                      fill
                      className="object-cover"
                      lazy={index > 1}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {product.specs?.colors?.length ? (
            <div className="mb-4 flex items-start gap-3">
              <div className="w-12 pt-2 text-sm text-[#333]">颜色</div>
              <div className="flex flex-1 flex-wrap gap-2.5">
                {product.specs.colors.map((option) => (
                  <SpecPillButton
                    key={option.id}
                    label={option.label}
                    active={selectedColor === option.id}
                    disabled={!option.available}
                    onClick={() => setSelectedColor(option.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {product.specs?.sizes?.length ? (
            <div className="mb-4 flex items-start gap-3">
              <div className="w-12 pt-2 text-sm text-[#333]">尺码</div>
              <div className="flex flex-1 flex-wrap gap-2.5">
                {product.specs.sizes.map((option) => (
                  <SpecPillButton
                    key={option.id}
                    label={option.label}
                    active={selectedSize === option.id}
                    disabled={!option.available}
                    onClick={() => setSelectedSize(option.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-[#333]">数量</div>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>
        </section>

        <section className="mt-3 rounded-[18px] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-[#f5f3ee] p-1">
              <button
                type="button"
                onClick={() => setContentTab("details")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  contentTab === "details"
                    ? "bg-[#0c1e3c] text-white"
                    : "text-[#7b7b84]",
                )}
              >
                说明
              </button>
              <button
                type="button"
                onClick={() => setContentTab("comments")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  contentTab === "comments"
                    ? "bg-[#0c1e3c] text-white"
                    : "text-[#7b7b84]",
                )}
              >
                评价
              </button>
            </div>

            {contentTab === "comments" ? (
              <LikeButton itemType="product" itemId={product.id} size="sm" />
            ) : null}
          </div>

          {contentTab === "details" ? (
            <>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-[#1f1f23]">商品说明</h2>
                <p className="mt-1 text-xs text-[#98989f]">{product.description}</p>
              </div>
              <div className="space-y-2.5">
                {product.details.map((detail, index) => (
                  <div
                    key={`${detail}-${index}`}
                    className="rounded-[12px] bg-[#f8f7f4] px-3.5 py-3 text-sm leading-6 text-[#4e4e57]"
                  >
                    {detail}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-[#1f1f23]">用户评价</h2>
                <p className="mt-1 text-xs text-[#98989f]">真实反馈与购买互动</p>
              </div>
              <CommentSection itemType="product" itemId={product.id} title="商品评论" className="space-y-5" />
            </>
          )}
        </section>

        {recommendedProducts.length > 0 ? (
          <section className="mt-3 rounded-[18px] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-3 text-sm font-semibold text-[#1f1f23]">搭配推荐</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recommendedProducts.map((item) => {
                const routeId =
                  typeof item.slug === "string" && item.slug.length > 0 ? item.slug : String(item.id)

                return (
                  <Link
                    key={String(item.id)}
                    href={`/store/${routeId}${inheritedSuffix}`}
                    className="w-[6.5rem] shrink-0"
                  >
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-[10px] bg-[#efefef]">
                      <OptimizedImage
                        src={resolveProductImage(item) || "/placeholder.svg"}
                        alt={typeof item.name === "string" ? item.name : "推荐商品"}
                        fill
                        className="object-cover"
                        lazy
                      />
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-[#333]">
                      {typeof item.name === "string" ? item.name : "蓝染商品"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#c4a77d]">
                      {formatPrice(typeof item.price === "number" ? item.price : 0)}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}
      </main>

      {fixedBar}
    </div>
  )
}
