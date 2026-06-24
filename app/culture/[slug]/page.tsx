import { notFound } from "next/navigation"
import { Headphones } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { CommentSection } from "@/components/ui/comment-section"
import { ArticleFavoriteButton } from "@/components/ui/article-favorite-button"
import { ArticleShareButton } from "@/components/ui/article-share-button"
import { BackButton } from "@/components/ui/back-button"
import { ArticleReadingProgress } from "@/components/ui/article-reading-progress"
import { ArticleReadingToolbar } from "@/components/ui/article-reading-toolbar"

interface CultureArticlePageProps {
  params: {
    slug: string
  }
}

function parseArticleParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block
        .replace(/^##\s*/, "")
        .replace(/^导读[:：]\s*/, "")
        .replace(/^资料来源[:：]\s*/, "资料来源：")
        .trim()
    )
}

function formatPublishDate(date: string) {
  if (!date) return ""
  return new Date(date).toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
  })
}

function AuthorMark({ author }: { author?: string | null }) {
  const mark = (author || "编").slice(0, 1)

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e8f0f8,#f8fbfe)] text-[13px] font-semibold text-[#35597f] ring-1 ring-white/80 shadow-inner">
      {mark}
    </div>
  )
}

function DividerMark() {
  return (
    <div className="my-10 flex items-center gap-4 text-[#c1c9d4]">
      <span className="h-px flex-1 bg-[#e6edf4]" />
      <span className="text-[14px] leading-none">✦</span>
      <span className="h-px flex-1 bg-[#e6edf4]" />
    </div>
  )
}

const bodyTextClassName =
  "text-[15px] leading-[2.05] tracking-[0.01em] text-[#4d5662] sm:text-[16px] sm:leading-[2.1]"

export default async function CultureArticlePage({ params }: CultureArticlePageProps) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("culture_articles").select("*").eq("slug", params.slug).maybeSingle()

  if (error) {
    console.error("加载文化文章失败:", error)
  }

  if (!data) {
    notFound()
  }

  const { id, title, excerpt, content, cover_image, read_time, author, created_at } = data
  const publishDate = created_at ? formatPublishDate(created_at) : ""
  const paragraphs = content ? parseArticleParagraphs(content) : []
  const authorName = author || "世说蓝语编辑部"
  const readingMinutes = read_time ? `${read_time} 分钟阅读` : "5 分钟阅读"

  return (
    <div className="min-h-screen bg-white pb-12">
      <ArticleReadingProgress />

      <article className="mx-auto max-w-3xl px-0 py-0">
        <header className="sticky top-0 z-20 border-b border-white/30 bg-[linear-gradient(180deg,rgba(252,254,255,0.82)_0%,rgba(244,249,255,0.88)_100%)] backdrop-blur-[12px]">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5">
            <BackButton
              href="/culture"
              iconOnly
              label="返回文化速读"
              className="h-10 w-10 rounded-full border border-white/45 bg-white/38 text-[#22476f] shadow-[0_8px_20px_rgba(42,76,117,0.08)] backdrop-blur-xl hover:bg-white/52 hover:text-[#183b62]"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/34 text-[#22476f] shadow-[0_8px_20px_rgba(42,76,117,0.08)] backdrop-blur-xl hover:bg-white/52"
                aria-label="沉浸阅读"
              >
                <Headphones className="h-4.5 w-4.5" />
              </button>
              <ArticleFavoriteButton
                articleId={id}
                articleTitle={title}
                iconOnly
                className="h-10 w-10 rounded-full border border-white/45 bg-white/34 text-[#22476f] shadow-[0_8px_20px_rgba(42,76,117,0.08)] backdrop-blur-xl hover:bg-white/52"
              />
              <ArticleShareButton
                title={title}
                className="h-10 w-10 rounded-full border border-white/45 bg-white/34 text-[#22476f] shadow-[0_8px_20px_rgba(42,76,117,0.08)] backdrop-blur-xl hover:bg-white/52"
              />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[700px] bg-white px-5 pb-24 pt-6 sm:px-6">
          <div className="max-w-[40rem]">
            <h1
              className="text-[26px] font-semibold leading-[1.42] text-[#29496e] sm:text-[31px]"
              style={{ fontFamily: "'Source Han Serif CN', 'Noto Serif SC', serif" }}
            >
              {title}
            </h1>

            {excerpt ? (
              <p className="mt-4 text-[15px] leading-8 text-[#6a7380] sm:text-[16px]">{excerpt}</p>
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <AuthorMark author={author} />
            <div>
              <div className="text-[13px] font-semibold text-[#35597f]">{authorName}</div>
              <div className="mt-1 text-[12px] text-[#8d98a5]">
                {publishDate ? `整理于 ${publishDate}` : ""}
                {publishDate ? " · " : ""}
                {readingMinutes}
              </div>
            </div>
          </div>

          {cover_image ? (
            <div className="mt-8 overflow-hidden rounded-[12px] bg-white shadow-[0_14px_28px_rgba(39,63,97,0.08)]">
              <div className="relative aspect-[1.62/1] overflow-hidden rounded-[12px]">
                <OptimizedImage src={cover_image} alt={title} fill priority usage="detail" className="object-cover" />
              </div>
            </div>
          ) : null}

          <DividerMark />

          <div className="space-y-7">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p
                  key={`paragraph-${index}`}
                  className={bodyTextClassName}
                  style={{ fontFamily: "'Source Han Serif CN', 'Noto Serif SC', serif" }}
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <>
                <p className={bodyTextClassName} style={{ fontFamily: "'Source Han Serif CN', 'Noto Serif SC', serif" }}>
                  在蓝白之间，藏着中国人低调而深远的审美。每一枚纹样，都是时间的印记，也是匠心留下的低语。
                </p>
                <p className={bodyTextClassName} style={{ fontFamily: "'Source Han Serif CN', 'Noto Serif SC', serif" }}>
                  蓝印花布的纹样源于生活，也高于生活。人们把几何、植物与吉祥寓意织进布面，让日常器物也带着审美与祝愿。
                </p>
              </>
            )}
          </div>

          <div id="comments" className="mt-12">
            <CommentSection itemType="article" itemId={id} title="读者评论" variant="plain" showComposer={false} />
          </div>
        </div>

        <ArticleReadingToolbar articleId={id} />
      </article>
    </div>
  )
}
