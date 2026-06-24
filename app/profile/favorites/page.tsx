"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  GraduationCap,
  Heart,
  Loader2,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"

type FavoriteTab = "products" | "courses" | "articles"

interface FavoriteProductCard {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  coverImage: string
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const {
    favoriteProducts,
    favoriteCourses,
    favoriteArticles,
    loading: favoritesLoading,
    error: favoritesError,
    fetchFavorites,
    removeFromFavorites,
    removeCourseFromFavorites,
    removeArticleFromFavorites,
  } = useFavorites()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FavoriteTab>("products")
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  useEffect(() => {
    const mobileFrame = document.querySelector(".mobile-frame")
    const body = document.body

    mobileFrame?.classList.add("shared-page-fixed-bg")
    body.classList.add("shared-page-fixed-bg")

    return () => {
      mobileFrame?.classList.remove("shared-page-fixed-bg")
      body.classList.remove("shared-page-fixed-bg")
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user, fetchFavorites])

  const products: FavoriteProductCard[] = useMemo(
    () =>
      (favoriteProducts as unknown as Array<Record<string, unknown>>).map((item) => {
        const imagesRaw = item.images
        const images = Array.isArray(imagesRaw)
          ? imagesRaw.filter((entry): entry is string => typeof entry === "string")
          : []

        const coverImage =
          (typeof item.coverImage === "string" ? item.coverImage : null) ||
          images[0] ||
          (typeof item.image_url === "string" ? item.image_url : null) ||
          "/placeholder.svg"

        return {
          id: typeof item.id === "string" ? item.id : "",
          name: typeof item.name === "string" ? item.name : "未知商品",
          description: typeof item.description === "string" ? item.description : "暂无描述",
          price: typeof item.price === "number" ? item.price : 0,
          category: typeof item.category === "string" ? item.category : "文创商品",
          coverImage,
        }
      }),
    [favoriteProducts],
  )

  const totalCount =
    products.length + favoriteCourses.length + favoriteArticles.length
  const isLoading = authLoading || favoritesLoading

  const tabs = [
    {
      id: "products" as const,
      label: "商品",
      count: products.length,
      icon: ShoppingBag,
      accent: "from-[#eff6ff] to-[#f8fbff]",
    },
    {
      id: "courses" as const,
      label: "课程",
      count: favoriteCourses.length,
      icon: GraduationCap,
      accent: "from-[#eefbf6] to-[#f8fffc]",
    },
    {
      id: "articles" as const,
      label: "文章",
      count: favoriteArticles.length,
      icon: BookOpen,
      accent: "from-[#fff8ef] to-[#fffdfa]",
    },
  ]

  const activeCount = tabs.find((tab) => tab.id === activeTab)?.count ?? 0

  const handleRemoveProduct = async (productId: string) => {
    setPendingRemove(`product-${productId}`)
    try {
      await removeFromFavorites(productId)
    } finally {
      setPendingRemove(null)
    }
  }

  const handleRemoveCourse = async (courseId: string) => {
    setPendingRemove(`course-${courseId}`)
    try {
      await removeCourseFromFavorites(courseId)
    } finally {
      setPendingRemove(null)
    }
  }

  const handleRemoveArticle = async (articleId: string) => {
    setPendingRemove(`article-${articleId}`)
    try {
      await removeArticleFromFavorites(articleId)
    } finally {
      setPendingRemove(null)
    }
  }

  const header = (
    <ProfileSubpageHeader
      title="我的收藏"
      subtitle="管理您收藏的商品和内容"
      backHref="/profile"
      rightSlot={
        <div className="rounded-full bg-white/70 px-3 py-1 text-[11px] text-[#5d7ca7] shadow-sm ring-1 ring-[#dbe7f5]">
          共 {totalCount} 项
        </div>
      }
    />
  )

  if (isLoading) {
    return (
      <div className="page-container page-background-home-echo">
        {header}
        <div className="px-4 py-10">
          <div className="flex min-h-[52vh] flex-col items-center justify-center rounded-[24px] bg-white/60 text-center shadow-[0_10px_28px_rgba(61,92,140,0.08)] ring-1 ring-white/70 backdrop-blur-[14px]">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-[#6a84a9]">正在整理您的收藏内容</p>
          </div>
        </div>
      </div>
    )
  }

  if (favoritesError) {
    return (
      <div className="page-container page-background-home-echo">
        {header}
        <div className="px-4 py-8">
          <Card className="rounded-[24px] border-white/70 bg-white/68 shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[14px]">
            <CardContent className="flex min-h-[48vh] flex-col items-center justify-center text-center">
              <Heart className="mb-4 h-12 w-12 text-rose-400" />
              <h3 className="text-lg font-semibold text-[#243d66]">收藏加载失败</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#7088ad]">
                {favoritesError}
              </p>
              <Button className="mt-6 rounded-full px-6" onClick={() => fetchFavorites()}>
                重新加载
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page-container page-background-home-echo">
        {header}
        <div className="px-4 py-8">
          <Card className="rounded-[24px] border-white/70 bg-white/68 shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[14px]">
            <CardContent className="flex min-h-[48vh] flex-col items-center justify-center text-center">
              <Heart className="mb-4 h-12 w-12 text-[#7894ba]" />
              <h3 className="text-lg font-semibold text-[#243d66]">请先登录</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#7088ad]">
                登录后即可查看和整理您收藏的商品、课程与文章。
              </p>
              <Button
                className="mt-6 rounded-full px-6"
                onClick={() =>
                  router.push(
                    `/auth?view=login&redirectTo=${encodeURIComponent("/profile/favorites")}`,
                  )
                }
              >
                立即登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container page-background-home-echo">
      {header}

      <div className="px-4 pb-10">
        <section className="rounded-[26px] bg-[linear-gradient(135deg,rgba(245,250,255,0.88)_0%,rgba(255,255,255,0.72)_100%)] px-4 py-4 shadow-[0_12px_30px_rgba(61,92,140,0.08)] ring-1 ring-white/75 backdrop-blur-[16px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.24em] text-[#7d95b8]">FAVORITES</p>
              <h2 className="mt-1 text-[1.1rem] font-semibold text-[#243d66]">
                收藏夹
              </h2>
              <p className="mt-1 max-w-[14rem] text-[12px] leading-5 text-[#6d85aa]">
                把喜欢的内容收拢到一起，方便下次继续浏览。
              </p>
            </div>

            <div className="shrink-0 rounded-[18px] bg-white/70 px-3 py-2 shadow-sm ring-1 ring-[#e5edf7]">
              <div className="text-[10px] text-[#7b92b5]">当前分类</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[13px] font-medium text-[#355889]">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </span>
                <span className="text-lg font-semibold text-[#223f69]">{activeCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-[18px] border px-3 py-2.5 text-left transition-all duration-200",
                  activeTab === tab.id
                    ? "border-[#cfe0f4] bg-white shadow-[0_10px_22px_rgba(61,92,140,0.10)]"
                    : "border-transparent bg-white/38 hover:bg-white/60",
                )}
              >
                <div
                  className={cn(
                    "mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[#355889]",
                    tab.accent,
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                </div>
                <div className="text-[13px] font-medium text-[#243d66]">{tab.label}</div>
                <div className="mt-0.5 text-[11px] text-[#7590b4]">{tab.count} 项</div>
              </button>
            ))}
          </div>
        </section>

        {activeTab === "products" && (
          <section className="mt-4">
            {products.length === 0 ? (
              <EmptyPanel
                icon={ShoppingBag}
                title="还没有收藏任何商品"
                description="把喜欢的蓝染好物先收进收藏夹，后面选购会更省事。"
                href="/store"
                cta="去逛商品"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {products.map((product) => {
                  const pending = pendingRemove === `product-${product.id}`
                  return (
                    <article
                      key={product.id}
                      className="mx-auto w-full max-w-[9.8rem] overflow-hidden rounded-[22px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(248,251,255,0.72)_100%)] shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[12px]"
                    >
                      <div className="relative">
                        <Link href={`/store/${product.id}`} className="block">
                          <div className="relative aspect-[1/1.24] overflow-hidden">
                            <OptimizedImage
                              src={product.coverImage}
                              alt={product.name}
                              fill
                              className="object-cover"
                              usage="card"
                            />
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.id)}
                          disabled={pending}
                          className="absolute right-2.5 top-[72%] z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-[0_8px_18px_rgba(61,92,140,0.12)] ring-1 ring-[#eef2f7] transition-all hover:scale-105"
                          aria-label="移除收藏商品"
                        >
                          {pending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className="h-4 w-4 fill-current" />
                          )}
                        </button>
                      </div>

                      <div className="px-2.5 pb-2.5 pt-2">
                        <Link href={`/store/${product.id}`} className="block">
                          <h3 className="line-clamp-1 pr-11 text-[12.5px] font-semibold leading-5 text-[#243d66]">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="mt-1.5 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[0.95rem] font-semibold leading-none text-[#ea7a12]">
                              ¥{product.price}
                            </p>
                            <p className="mt-1 text-[9.5px] leading-none text-[#8aa0c2]">
                              {product.category}
                            </p>
                          </div>

                          <Link href={`/store/${product.id}`}>
                            <Button
                              variant="outline"
                              className="h-8 rounded-full border-[#d7e4f2] bg-white/78 px-3 text-[11px] text-[#355889]"
                            >
                              查看
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "courses" && (
          <section className="mt-4 space-y-3">
            {favoriteCourses.length === 0 ? (
              <EmptyPanel
                icon={GraduationCap}
                title="还没有收藏任何课程"
                description="把感兴趣的课程先收起来，后面继续学会更方便。"
                href="/teaching"
                cta="浏览课程"
              />
            ) : (
              favoriteCourses
                .filter((course) => course && course.id)
                .map((course) => {
                  const pending = pendingRemove === `course-${course.id}`
                  return (
                    <article
                      key={course.id}
                      className="overflow-hidden rounded-[24px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(246,252,249,0.72)_100%)] p-3 shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[12px]"
                    >
                      <div className="flex gap-3">
                        <Link href={`/teaching/${course.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px]">
                          <OptimizedImage
                            src={course.image_url || "/placeholder.svg"}
                            alt={course.title}
                            fill
                            className="object-cover"
                            usage="card"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-[14px] font-semibold leading-6 text-[#243d66]">
                                {course.title}
                              </h3>
                              <p className="mt-1 text-[11px] text-[#738db1]">
                                {course.instructor}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCourse(course.id)}
                              disabled={pending}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm ring-1 ring-[#eef2f7]"
                              aria-label="移除收藏课程"
                            >
                              {pending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Heart className="h-4 w-4 fill-current" />
                              )}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-base font-semibold text-[#244361]">
                                ¥{course.price}
                              </p>
                              <p className="mt-1 text-[10px] text-[#8aa0c2]">
                                {course.duration} 分钟
                              </p>
                            </div>

                            <Link href={`/teaching/${course.id}`}>
                              <Button className="h-9 rounded-full bg-[#224870] px-4 text-[12px] text-white hover:bg-[#1d3d61]">
                                进入课程
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })
            )}
          </section>
        )}

        {activeTab === "articles" && (
          <section className="mt-4 space-y-3">
            {favoriteArticles.length === 0 ? (
              <EmptyPanel
                icon={BookOpen}
                title="还没有收藏任何文章"
                description="把值得回看的文化内容收起来，方便随时继续阅读。"
                href="/culture"
                cta="浏览文章"
              />
            ) : (
              favoriteArticles.map((article) => {
                const pending = pendingRemove === `article-${article.id}`
                return (
                  <article
                    key={article.id}
                    className="overflow-hidden rounded-[24px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,250,244,0.72)_100%)] p-3 shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[12px]"
                  >
                    <div className="flex gap-3">
                      <Link href={`/culture/${article.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px]">
                        <OptimizedImage
                          src={article.cover_image || article.image_url || "/placeholder.svg"}
                          alt={article.title}
                          fill
                          className="object-cover"
                          usage="card"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-[14px] font-semibold leading-6 text-[#243d66]">
                              {article.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#738db1]">
                              {article.excerpt}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveArticle(article.id)}
                            disabled={pending}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm ring-1 ring-[#eef2f7]"
                            aria-label="移除收藏文章"
                          >
                            {pending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="rounded-full bg-white/74 px-2.5 py-1 text-[10px] text-[#8aa0c2] ring-1 ring-[#e9eff6]">
                            阅读时长 {article.read_time} 分钟
                          </div>

                          <Link href={`/culture/${article.slug}`}>
                            <Button
                              variant="outline"
                              className="h-9 rounded-full border-[#d7e4f2] bg-white/72 px-4 text-[12px] text-[#355889]"
                            >
                              阅读
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof Sparkles
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <Card className="rounded-[24px] border-white/75 bg-white/66 shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[14px]">
      <CardContent className="flex min-h-[42vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff] text-[#6d87ad]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-[#243d66]">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#7088ad]">{description}</p>
        <Link href={href}>
          <Button className="mt-6 rounded-full px-6">{cta}</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
