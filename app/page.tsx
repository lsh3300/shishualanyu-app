'use client';
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { SectionHeader } from "@/components/ui/section-header"
import { 
  LazyBannerCarousel, 
  LazyQuickAccess, 
  LazyCourseCard, 
  LazyProductCard, 
  LazyCultureArticleCard,
  LazyMiniProfilePopover 
} from "@/components/ui/lazy-load"
import { usePerformanceMonitor } from "@/components/ui/performance-monitor"
import { HeaderAuth } from "@/components/auth/header-auth"
import { Palette, Droplets, Package, Wrench, Mail, User, ChevronRight, Bell, Sparkles } from "lucide-react"
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

// 课程数据从 Supabase 实时获取（见 HomePage 组件内）
// 产品数据从 Supabase 实时获取（见 HomePage 组件内）
// 文章数据从 Supabase 实时获取（见 HomePage 组件内）

export default function HomePage() {
  // 使用全局状态获取未读消息和通知数量
  const { unreadMessages, unreadNotifications } = useGlobalState();
  
  // 添加性能监控
  usePerformanceMonitor("/", 6) // 6个主要组件
  
  // 从 Supabase 获取课程数据
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  
  // 从 Supabase 获取产品数据
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  
  // 从 Supabase 获取文章数据
  const [cultureArticles, setCultureArticles] = useState<any[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  
  // 动态生成的轮播图数据
  const [bannerItems, setBannerItems] = useState<any[]>([])
  const [bannerLoading, setBannerLoading] = useState(true)
  
  useEffect(() => {
    async function fetchCourses() {
      try {
        const supabase = createClient()
        const { data: courses, error } = await supabase
          .from('courses')
          .select('id, title, instructor, duration, price, image_url')
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (error) {
          console.error('获取课程失败:', error)
        } else {
          // 转换为组件需要的格式
          const formattedCourses = (courses || []).map(course => ({
            id: course.id,
            title: course.title,
            instructor: course.instructor,
            duration: `${course.duration}分钟`,
            students: Math.floor(Math.random() * 1000) + 100, // 临时使用随机数
            thumbnail: course.image_url || '/placeholder.svg',
            isFree: course.price === 0 || course.price === '0',
            price: course.price > 0 ? course.price : undefined,
          }))
          setFeaturedCourses(formattedCourses)
        }
      } catch (err) {
        console.error('获取课程异常:', err)
      } finally {
        setCoursesLoading(false)
      }
    }
    
    async function fetchProducts() {
      try {
        const supabase = createClient()
        // 获取产品和它们的封面图片
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            original_price,
            inventory
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(4)
        
        if (productsError) {
          console.error('获取产品失败:', productsError)
          setProductsLoading(false)
          return
        }
        
        // 获取每个产品的封面图片
        const productsWithImages = await Promise.all(
          (products || []).map(async (product) => {
            const { data: media } = await supabase
              .from('product_media')
              .select('url')
              .eq('product_id', product.id)
              .eq('cover', true)
              .single()
            
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.original_price,
              image: media?.url || '/placeholder.svg',
              sales: product.inventory || 0
            }
          })
        )
        
        setFeaturedProducts(productsWithImages)
      } catch (err) {
        console.error('获取产品异常:', err)
      } finally {
        setProductsLoading(false)
      }
    }
    
    async function fetchArticles() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('culture_articles')
          .select('id, slug, title, excerpt, cover_image, read_time')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (error) {
          console.error('获取文章失败:', error)
        } else {
          setCultureArticles(data || [])
        }
      } catch (err) {
        console.error('获取文章异常:', err)
      } finally {
        setArticlesLoading(false)
      }
    }
    
    async function generateBannerItems() {
      try {
        const supabase = createClient()
        const items = []
        
        // 1. 获取一个热门课程作为第一张轮播图
        const { data: topCourse } = await supabase
          .from('courses')
          .select('id, title, instructor, image_url')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (topCourse) {
          items.push({
            id: '1',
            title: `跟随 ${topCourse.instructor} 老师，学习《${topCourse.title}》`,
            subtitle: '掌握传统蓝染图案设计技艺',
            image: topCourse.image_url || '/traditional-indigo-dyeing-master-craftsman.jpg',
            href: `/teaching/${topCourse.id}`,
          })
        }
        
        // 2. 获取一篇热门文章作为第二张轮播图
        const { data: topArticle } = await supabase
          .from('culture_articles')
          .select('id, slug, title, cover_image')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (topArticle) {
          items.push({
            id: '2',
            title: '探索蓝染的千年历史',
            subtitle: topArticle.title,
            image: topArticle.cover_image || '/silk-road-indigo.jpg',
            href: `/culture/${topArticle.slug}`,
          })
        }
        
        // 3. 添加材料包推广作为第三张轮播图
        items.push({
          id: '3',
          title: '优质蓝染材料包',
          subtitle: '从零开始，体验传统扎染之美',
          image: '/indigo-dyeing-workshop-students-learning.jpg',
          href: '/store/materials',
        })
        
        setBannerItems(items)
      } catch (err) {
        console.error('生成轮播图异常:', err)
        // 如果失败，使用默认轮播图
        setBannerItems([
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
        ])
      } finally {
        setBannerLoading(false)
      }
    }
    
    fetchCourses()
    fetchProducts()
    fetchArticles()
    generateBannerItems()
  }, [])
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Bar with Search and Icons - Now at the top */}
      <section className="sticky top-0 z-50 bg-gradient-to-r from-background via-background/98 to-background/95 backdrop-blur-md py-3 border-b border-border/30 shadow-lg">
        <div className="container px-4 mx-auto">
          <div className="flex items-center gap-4">
            {/* Left side - Logo and Brand */}
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
            
            {/* Center - Search Bar */}
            <div className="flex-1 max-w-xl mx-auto">
              <SearchBar />
            </div>
            
            {/* Right side - Icons */}
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
      <section className="px-4 mb-6">
        {bannerLoading ? (
          <div className="w-full h-48 bg-gray-100 animate-pulse rounded-2xl" />
        ) : (
          <LazyBannerCarousel items={bannerItems} />
        )}
      </section>

      {/* Quick Access */}
      <section className="mb-8">
        <LazyQuickAccess items={quickAccessItems} />
      </section>

      {/* Teaching Section */}
      <section className="px-4 mb-8">
        <SectionHeader title="教学精选" href="/teaching" />
        {coursesLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[280px] h-72 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : featuredCourses.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {featuredCourses.map((course: any) => (
              <LazyCourseCard key={course.id} {...course} showFavorite={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无课程
          </div>
        )}
      </section>

      {/* Products Section */}
      <section className="px-4 mb-8">
        <SectionHeader title="文创臻品" href="/store" />
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {featuredProducts.map((product: any) => (
              <LazyProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无产品
          </div>
        )}
      </section>

      {/* Culture Section */}
      <section className="px-4 mb-8">
        <SectionHeader title="文化速读" href="/culture" />
        {articlesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : cultureArticles.length > 0 ? (
          cultureArticles.map((article) => (
            <LazyCultureArticleCard 
              key={article.id} 
              id={article.slug}
              articleId={article.id}
              title={article.title}
              excerpt={article.excerpt}
              image={article.cover_image}
              readTime={`${article.read_time}分钟`}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无文章
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
