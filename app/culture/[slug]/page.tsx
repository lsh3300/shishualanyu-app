import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { ArticleFavoriteButton } from "@/components/ui/article-favorite-button"
import { createServerClient } from "@/lib/supabase/server"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface CultureArticlePageProps {
  params: {
    slug: string
  }
}

export default async function CultureArticlePage({ params }: CultureArticlePageProps) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('culture_articles')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (error) {
    console.error('加载文化文章失败:', error)
  }

  if (!data) {
    notFound()
  }

  const {
    id,
    title,
    excerpt,
    content,
    cover_image,
    tags,
    read_time,
    author,
    created_at,
  } = data

  const formattedContent = content
    ? content.split(/\n{2,}/).map((paragraph: string, index: number) => (
        <p key={index} className="text-base leading-7 text-muted-foreground mb-6 whitespace-pre-line">
          {paragraph.trim()}
        </p>
      ))
    : null

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <BackButton href="/culture" label="返回文化速读" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {(tags || []).map((tag: string) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
          {read_time && (
            <Badge variant="outline">{read_time} 分钟阅读</Badge>
          )}
        </div>
        <ArticleFavoriteButton articleId={id} articleTitle={title} />
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
      {excerpt && <p className="text-lg text-muted-foreground mb-6">{excerpt}</p>}

      <div className="text-sm text-muted-foreground mb-8">
        <span>{author || '世说蓝语'}</span>
        {created_at && (
          <>
            <span className="mx-2">•</span>
            <time dateTime={created_at}>{new Date(created_at).toLocaleDateString('zh-CN')}</time>
          </>
        )}
      </div>

      {cover_image && (
        <div className="relative w-full h-72 mb-8 rounded-xl overflow-hidden">
          <OptimizedImage src={cover_image} alt={title} fill className="object-cover" priority />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {formattedContent || (
          <p className="text-muted-foreground">内容即将奉上，敬请期待。</p>
        )}
      </div>

      <div className="mt-10 flex justify-between items-center border-t border-border pt-6">
        <div>
          <p className="text-sm text-muted-foreground">喜欢这篇文章？分享给朋友吧。</p>
        </div>
        <Button asChild>
          <Link href="/culture">更多文化故事</Link>
        </Button>
      </div>
    </article>
  )
}

