'use client';
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { SectionHeader } from "@/components/ui/section-header"
import { 
  LazyBannerCarousel, 
  LazyQuickAccess, 
  LazyCourseCard, 
  LazyProductCard, 
  LazyCultureArticleListCard,
} from "@/components/ui/lazy-load"
import { 
  BannerSkeleton, 
  CoursesGridSkeleton, 
  ProductsGridSkeleton, 
  ArticlesListSkeleton 
} from "@/components/ui/home-skeleton"
import { usePerformanceMonitor } from "@/components/ui/performance-monitor"
import { HeaderAuth } from "@/components/auth/header-auth"
import { Palette, Package, Wrench, Mail, Bell, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useGlobalState } from "@/hooks/use-global-state"
import { createClient } from "@/lib/supabase/client"

// 快捷入口配置（静态）
const quickAccessItems = [
  { href: "/teaching", icon: Palette, label: "传统工艺", color: "bg-primary" },
  { href: "/store/materials", icon: Package, label: "材料包", color: "bg-accent" },
  { href: "/store/custom", icon: Wrench, label: "定制工坊", color: "bg-chart-4" },
  { href: "/store/ai-create", icon: Sparkles, label: "AI创作", color: "bg-secondary" },
]

// 默认轮播图数据
const defaultBannerItems = [
  {
    id: '1',
    title: '传承千年的蓝染工艺',
    subtitle: '跟随匠人大师，学习传统扎染技艺',
    image: '/traditional-indigo-dyeing-master-craftsman.jpg',
    href: '/teaching',
  },
  {
    id: '2',
    title: '探索蓝染文化',
    subtitle: '了解传统工艺背后的文化故事',
    image: '/silk-road-indigo.jpg',
    href: '/culture',
  },
  {
    id: '3',
    title: '优质蓝染材料包',
    subtitle: '从零开始，体验传统扎染之美',
    image: '/indigo-dyeing-workshop-students-learning.jpg',
    href: '/store/materials',
  },
]

export default function HomePage() {
  // 使用全局状态获取未读消息和通知数量
  const { unreadMessages, unreadNotifications } = useGlobalState();
  
  // 添加性能监控
  usePerformanceMonitor("/", 6)
  
  // 状态管理
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [cultureArticles, setCultureArticles] = useState<any[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [bannerItems, setBannerItems] = useState<any[]>([])
  const [bannerLoading, setBannerLoading] = useState(true)
  
  // 优化：使用 Promise.all 并行请求所有数据
  useEffect(() => {
    const supabase = createClient()
    
    async function fetchAllData() {
      try {
        // 并行发起所有数据请求
        const [coursesResult, productsResult, articlesResult, bannerDataResult] = await Promise.all([
          // 1. 获取课程
          supabase
            .from('courses')
            .select('id, title, instructor, duration, price, image_url')
            .order('created_at', { ascending: false })
            .limit(6),
          
          // 2. 获取产品（包含封面图片，使用 JOIN 避免 N+1 查询）
          supabase
            .from('products')
            .select('id, name, price, original_price, inventory, product_media!inner(url)')
            .eq('status', 'published')
            .eq('product_media.cover', true)
            .order('created_at', { ascending: false })
            .limit(8),
          
          // 3. 获取文章
          supabase
            .from('culture_articles')
            .select('id, slug, title, excerpt, cover_image, read_time')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(6),
          
          // 4. 获取轮播图数据（热门课程和文章）
          Promise.all([
            supabase.from('courses').select('id, title, instructor, image_url').order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('culture_articles').select('id, slug, title, cover_image').eq('status', 'published').order('created_at', { ascending: false }).limit(1).single()
          ])
        ])

        // 处理课程数据
        if (!coursesResult.error && coursesResult.data) {
          const formattedCourses = coursesResult.data.map(course => ({
            id: course.id,
            title: course.title,
            instructor: course.instructor,
            duration: `${course.duration}分钟`,
            students: Math.floor(Math.random() * 1000) + 100,
            thumbnail: course.image_url || '/placeholder.svg',
            isFree: course.price === 0 || course.price === '0',
            price: course.price > 0 ? course.price : undefined,
          }))
          setFeaturedCourses(formattedCourses)
        }
        setCoursesLoading(false)

        // 处理产品数据（已通过 JOIN 获取图片）
        if (!productsResult.error && productsResult.data) {
          const productsWithImages = productsResult.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.original_price,
            image: product.product_media?.[0]?.url || '/placeholder.svg',
            sales: product.inventory || 0
          }))
          setFeaturedProducts(productsWithImages)
        }
        setProductsLoading(false)

        // 处理文章数据
        if (!articlesResult.error && articlesResult.data) {
          setCultureArticles(articlesResult.data)
        }
        setArticlesLoading(false)

        // 处理轮播图数据
        const [topCourseResult, topArticleResult] = bannerDataResult
        const bannerItemsList: any[] = []
        
        if (topCourseResult.data) {
          const topCourse = topCourseResult.data
          bannerItemsList.push({
            id: '1',
            title: `跟随 ${topCourse.instructor} 老师，学习《${topCourse.title}》`,
            subtitle: '掌握传统蓝染图案设计技艺',
            image: topCourse.image_url || '/traditional-indigo-dyeing-master-craftsman.jpg',
            href: `/teaching/${topCourse.id}`,
          })
        }
        
        if (topArticleResult.data) {
          const topArticle = topArticleResult.data
          bannerItemsList.push({
            id: '2',
            title: '探索蓝染的千年历史',
            subtitle: topArticle.title,
            image: topArticle.cover_image || '/silk-road-indigo.jpg',
            href: `/culture/${topArticle.slug}`,
          })
        }
        
        bannerItemsList.push({
          id: '3',
          title: '优质蓝染材料包',
          subtitle: '从零开始，体验传统扎染之美',
          image: '/indigo-dyeing-workshop-students-learning.jpg',
          href: '/store/materials',
        })
        
        setBannerItems(bannerItemsList.length > 0 ? bannerItemsList : defaultBannerItems)
        setBannerLoading(false)

      } catch (err) {
        console.error('获取首页数据异常:', err)
        setCoursesLoading(false)
        setProductsLoading(false)
        setArticlesLoading(false)
        setBannerItems(defaultBannerItems)
        setBannerLoading(false)
      }
    }
    
    fetchAllData()
  }, [])
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Bar */}
      <section className="sticky top-0 z-50 bg-gradient-to-r from-background via-background/98 to-background/95 backdrop-blur-md py-3 border-b border-border/30 shadow-lg">
        <div className="max-w-7xl px-4 mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 mr-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M2 3h20v18H2z" />
                  <path d="M2 8h20" />
                  <path d="M2 13h20" />
                  <path d="M2 18h20" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary tracking-tight">世说蓝语</span>
                <span className="text-[10px] text-muted-foreground -mt-1">传承千年·匠心之美</span>
              </div>
            </Link>
            
            <div className="flex-1 max-w-xl mx-auto">
              <SearchBar />
            </div>
            
            <div className="flex items-center gap-3">
              <HeaderAuth />
              <Link href="/messages" className="p-2.5 rounded-full hover:bg-muted/80 hover:scale-105 transition-all duration-200 group relative">
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                {unreadMessages > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-5 bg-primary text-white text-xs font-medium rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </Link>
              <Link href="/notifications" className="p-2.5 rounded-full hover:bg-muted/80 hover:scale-105 transition-all duration-200 group relative">
                <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-5 bg-primary text-white text-xs font-medium rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="max-w-7xl mx-auto px-4 mb-6">
        {bannerLoading ? <BannerSkeleton /> : <LazyBannerCarousel items={bannerItems} />}
      </section>

      {/* Quick Access */}
      <section className="max-w-7xl mx-auto mb-8">
        <LazyQuickAccess items={quickAccessItems} />
      </section>

      {/* Teaching Section */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <SectionHeader title="教学精选" href="/teaching" />
        {coursesLoading ? (
          <CoursesGridSkeleton count={6} />
        ) : featuredCourses.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {featuredCourses.map((course: any) => (
              <LazyCourseCard key={course.id} {...course} showFavorite={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">暂无课程</div>
        )}
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <SectionHeader title="文创臻品" href="/store" />
        {productsLoading ? (
          <ProductsGridSkeleton count={8} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {featuredProducts.map((product: any) => (
              <LazyProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">暂无产品</div>
        )}
      </section>

      {/* Culture Section */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <SectionHeader title="文化速读" href="/culture" />
        {articlesLoading ? (
          <ArticlesListSkeleton count={6} />
        ) : cultureArticles.length > 0 ? (
          <div className="space-y-3">
            {cultureArticles.map((article) => (
              <LazyCultureArticleListCard 
                key={article.id} 
                id={article.slug}
                articleId={article.id}
                title={article.title}
                excerpt={article.excerpt}
                image={article.cover_image}
                readTime={`${article.read_time}分钟`}
                views={Math.floor(Math.random() * 100000) + 1000}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">暂无文章</div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
