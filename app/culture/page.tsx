import { createServerClient } from '@/lib/supabase/server'
import { CultureArticleCard } from '@/components/ui/culture-article-card'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp, Clock } from 'lucide-react'

export const revalidate = 3600 // 重新验证周期：1小时

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image: string
  category: string
  tags: string[]
  read_time: number
  views: number
  featured: boolean
  created_at: string
}

interface CulturePageProps {
  searchParams: { category?: string }
}

export default async function CulturePage({ searchParams }: CulturePageProps) {
  const supabase = await createServerClient()
  const category = searchParams.category || 'all'

  // 获取文章数据
  let query = supabase
    .from('culture_articles')
    .select('id, slug, title, excerpt, cover_image, category, tags, read_time, views, featured, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: articles, error } = await query

  if (error) {
    console.error('加载文章失败:', error)
  }

  // 获取分类统计
  const { data: categories } = await supabase
    .from('culture_articles')
    .select('category')
    .eq('status', 'published')

  const categoryStats = categories?.reduce((acc: Record<string, number>, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {}) || {}

  // 精选文章（featured=true）
  const featuredArticles = articles?.filter(a => a.featured).slice(0, 3) || []
  // 最新文章
  const latestArticles = articles?.slice(0, 6) || []
  // 热门文章（按浏览量排序）
  const popularArticles = [...(articles || [])]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <BackButton href="/" label="返回首页" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">蓝染文化速读</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            探索蓝染的千年历史，学习传统工艺技法，感受东方美学魅力
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 分类导航 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={category === 'all' ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <a href="/culture">全部 ({articles?.length || 0})</a>
          </Button>
          {Object.entries(categoryStats).map(([cat, count]) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <a href={`/culture?category=${cat}`}>{cat} ({count})</a>
            </Button>
          ))}
        </div>

        {/* 精选文章 */}
        {featuredArticles.length > 0 && category === 'all' && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">精选推荐</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <CultureArticleCard
                  key={article.id}
                  id={article.slug}
                  articleId={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  image={article.cover_image}
                  readTime={`${article.read_time}分钟`}
                />
              ))}
            </div>
          </section>
        )}

        {/* 最新文章 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">最新发布</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <div key={article.id} className="relative">
                {article.featured && (
                  <Badge className="absolute top-2 right-2 z-10" variant="destructive">
                    精选
                  </Badge>
                )}
                <CultureArticleCard
                  id={article.slug}
                  articleId={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  image={article.cover_image}
                  readTime={`${article.read_time}分钟`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 热门文章 */}
        {category === 'all' && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">热门阅读</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.map((article) => (
                <div key={article.id} className="relative">
                  <Badge className="absolute top-2 right-2 z-10" variant="secondary">
                    {article.views} 阅读
                  </Badge>
                  <CultureArticleCard
                    id={article.slug}
                    articleId={article.id}
                    title={article.title}
                    excerpt={article.excerpt || ''}
                    image={article.cover_image}
                    readTime={`${article.read_time}分钟`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 空状态 */}
        {(!articles || articles.length === 0) && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
            <p className="text-muted-foreground">精彩内容即将奉上，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  )
}