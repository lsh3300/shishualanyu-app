import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { CultureArticleListCard } from "@/components/ui/culture-article-list-card"
import { ArrowRight, BookOpen, Search } from "lucide-react"

export const revalidate = 3600

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image: string
  category: string
  tags: string[]
  read_time: number
  featured: boolean
  created_at: string
}

interface CulturePageProps {
  searchParams: { category?: string; view?: string; q?: string }
}

type ViewMode = "all" | "featured" | "latest" | "popular"

function formatDate(date: string) {
  if (!date) return ""
  return new Date(date).toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
  })
}

function formatCollectedDate(date: string) {
  const formatted = formatDate(date)
  return formatted ? `整理于 ${formatted}` : ""
}

function buildCultureHref(view: ViewMode, category: string, q: string) {
  const params = new URLSearchParams()
  if (view !== "all") params.set("view", view)
  if (category !== "all") params.set("category", category)
  if (q) params.set("q", q)
  const query = params.toString()
  return query ? `/culture?${query}` : "/culture"
}

export default async function CulturePage({ searchParams }: CulturePageProps) {
  const supabase = await createServerClient()
  const category = searchParams.category || "all"
  const currentView = (searchParams.view || "all") as ViewMode
  const queryText = (searchParams.q || "").trim()

  let query = supabase
    .from("culture_articles")
    .select("id, slug, title, excerpt, cover_image, category, tags, read_time, featured, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (category !== "all") {
    query = query.eq("category", category)
  }

  const { data: articles, error } = await query
  if (error) {
    console.error("加载文化文章失败:", error)
  }

  const rawArticles = (articles as Article[] | null) || []
  const searchNeedle = queryText.toLowerCase()
  const articleList = searchNeedle
    ? rawArticles.filter((article) => {
        const haystacks = [
          article.title,
          article.excerpt,
          article.category,
          ...(Array.isArray(article.tags) ? article.tags : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return haystacks.includes(searchNeedle)
      })
    : rawArticles

  const { data: categories } = await supabase
    .from("culture_articles")
    .select("category")
    .eq("status", "published")

  const categoryStats =
    categories?.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {}) || {}

  const featuredArticles = articleList.filter((article) => article.featured)
  const latestArticles = articleList.slice(0, 12)
  const popularArticles = latestArticles

  const activeArticleSet =
    currentView === "featured"
      ? featuredArticles.length > 0
        ? featuredArticles
        : latestArticles
      : currentView === "popular"
        ? popularArticles
        : latestArticles

  const heroArticle = activeArticleSet[0] || articleList[0]
  const listArticles = activeArticleSet

  const viewTabs: Array<{ id: ViewMode; label: string }> = [
    { id: "all", label: "推荐" },
    { id: "featured", label: "纹样故事" },
    { id: "latest", label: "染坊日记" },
    { id: "popular", label: "热门阅读" },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-36">
      <div className="mx-auto max-w-[414px] px-0">
        <header className="px-5 pb-4 pt-5">
          <div className="mb-2 flex items-center justify-center">
            <div
              className="flex items-end gap-1 text-[#15284b]"
              style={{ fontFamily: "'Noto Serif SC', 'Songti SC', serif" }}
            >
              <h1 className="text-[28px] font-black tracking-[0.08em]">世说蓝语</h1>
              <span className="mb-1 rounded-[2px] border border-[#d14a4a] px-[2px] py-[1px] text-[10px] leading-none text-[#d14a4a]">
                印
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[12px] tracking-[0.28em] text-[#b0b8c6]">
            <span className="h-px w-3 bg-gradient-to-l from-[#b0b8c6] to-transparent" />
            <span>千年蓝韵 匠心传承</span>
            <span className="h-px w-3 bg-gradient-to-r from-[#b0b8c6] to-transparent" />
          </div>

          <form action="/culture" method="get" className="mt-4">
            {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
            {currentView !== "all" ? <input type="hidden" name="view" value={currentView} /> : null}
            <div className="flex items-center gap-2 rounded-full border border-[#dde5ee] bg-white p-1.5 pl-4 shadow-[0_6px_18px_rgba(21,40,75,0.06)]">
              <Search className="h-4 w-4 shrink-0 text-[#8a97a8]" />
              <input
                type="text"
                name="q"
                defaultValue={queryText}
                placeholder="搜索文章标题、摘要或分类"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#15284b] outline-none placeholder:text-[#a4afbc]"
              />
              <button
                type="submit"
                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#15284b] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#1c3661]"
              >
                <span>搜索</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </header>

        <nav className="mb-5 grid grid-cols-4 gap-2 px-5">
          {viewTabs.map((tab) => (
            <Link
              key={tab.id}
              href={buildCultureHref(tab.id, category, queryText)}
              className={`flex min-w-0 items-center justify-center rounded-full px-2 py-2 text-center text-[14px] font-medium leading-none transition-all ${
                currentView === tab.id ? "bg-[#15284b] text-white shadow-[0_8px_18px_rgba(21,40,75,0.14)]" : "text-[#15284b]"
              }`}
            >
              <span className="truncate whitespace-nowrap">{tab.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mb-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={buildCultureHref(currentView, "all", queryText)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition-all ${
              category === "all"
                ? "border-[#15284b] bg-[#15284b] text-white"
                : "border-[#d8e2ec] bg-white text-[#647b93]"
            }`}
          >
            全部
          </Link>
          {Object.entries(categoryStats).map(([cat, count]) => (
            <Link
              key={cat}
              href={buildCultureHref(currentView, cat, queryText)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition-all ${
                category === cat
                  ? "border-[#15284b] bg-[#15284b] text-white"
                  : "border-[#d8e2ec] bg-white text-[#647b93]"
              }`}
            >
              {cat} {count > 0 ? `· ${count}` : ""}
            </Link>
          ))}
        </div>

        <main>
          {heroArticle ? (
            <section className="mb-6 px-5">
              <Link href={`/culture/${heroArticle.slug}`} className="group block">
                <div className="relative h-[212px] overflow-hidden rounded-[18px] shadow-[0_8px_20px_rgba(21,40,75,0.15)]">
                  <OptimizedImage
                    src={heroArticle.cover_image}
                    alt={heroArticle.title}
                    fill
                    priority
                    usage="detail"
                    className="object-cover [filter:sepia(1)_hue-rotate(180deg)_saturate(1.2)_brightness(0.62)_contrast(1.15)]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,24,44,0.14)_0%,rgba(17,32,56,0.34)_30%,rgba(16,31,54,0.86)_100%)] px-6 py-5">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
                          精选文章
                        </div>
                        <div className="text-[12px] text-white/90">{formatCollectedDate(heroArticle.created_at)}</div>
                      </div>

                      <div className="max-w-[15rem]">
                        <h2
                          className="line-clamp-2 text-[20px] font-semibold leading-[1.26] text-white"
                          style={{ fontFamily: "'Noto Serif SC', 'Songti SC', serif" }}
                        >
                          {heroArticle.title}
                        </h2>
                        <p className="mt-2 line-clamp-1 max-w-[14.5rem] text-[11px] leading-5 text-white/82">
                          {heroArticle.excerpt || "探索蓝白花布背后的千年故事。"}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-medium text-[#15284b] shadow-[0_6px_16px_rgba(255,255,255,0.18)]">
                          <span>阅读文章</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          ) : null}

          <section className="flex flex-col gap-3 px-5 pb-6">
            {listArticles.map((article) => (
              <CultureArticleListCard
                key={article.id}
                id={article.slug}
                articleId={article.id}
                title={article.title}
                excerpt={article.excerpt || "点击查看这篇蓝染文化文章。"}
                image={article.cover_image}
                readTime={`${article.read_time || 5}分钟`}
              />
            ))}

            {articleList.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#d8e2ec] bg-white px-6 py-14 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#aab7c6]" />
                <h3 className="text-[18px] font-semibold text-[#15284b]">没有找到相关文章</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#8892a0]">
                  {queryText ? `当前关键词“${queryText}”暂无匹配内容。` : "内容整理完成后，这里会展示新的蓝染文化文章。"}
                </p>
              </div>
            ) : null}
          </section>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
