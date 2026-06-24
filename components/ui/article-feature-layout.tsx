"use client"

import { EnhancedArticleCard } from "@/components/ui/enhanced-article-card"
import { cn } from "@/lib/utils"

interface Article {
  id: string
  slug?: string
  title: string
  excerpt: string
  cover_image: string
  read_time: number
  category?: string
}

interface ArticleFeatureLayoutProps {
  articles: Article[]
  className?: string
}

/**
 * 文章特色布局组件
 * 第一篇为大图特色展示，其余为紧凑列表
 */
export function ArticleFeatureLayout({ articles, className }: ArticleFeatureLayoutProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">暂无文章</div>
    )
  }

  const featuredArticle = articles[0]
  const listArticles = articles.slice(1, 5) // 最多显示4篇列表文章

  return (
    <div className={cn("space-y-4", className)}>
      {/* 特色文章 - 在所有屏幕上都显示为大图 */}
      <EnhancedArticleCard 
        id={featuredArticle.slug || featuredArticle.id}
        articleId={featuredArticle.id}
        title={featuredArticle.title}
        excerpt={featuredArticle.excerpt}
        image={featuredArticle.cover_image}
        readTime={`${featuredArticle.read_time}分钟`}
        category={featuredArticle.category}
        variant="featured"
      />

      {/* 文章列表 - 响应式网格 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {listArticles.map((article) => (
          <EnhancedArticleCard 
            key={article.id}
            id={article.slug || article.id}
            articleId={article.id}
            title={article.title}
            excerpt={article.excerpt}
            image={article.cover_image}
            readTime={`${article.read_time}分钟`}
            category={article.category}
            variant="compact"
          />
        ))}
      </div>
    </div>
  )
}
