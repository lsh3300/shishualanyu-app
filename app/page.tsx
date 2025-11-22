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
import { Palette, Droplets, Package, Wrench, Mail, User, ChevronRight, Bell } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useGlobalState } from "@/hooks/use-global-state"
import { createClient } from "@/lib/supabase/client"

const bannerItems = [
  {
    id: "1",
    title: "传承千年的蓝染工艺",
    subtitle: "跟随匠人大师，学习传统扎染技艺",
    image: "/traditional-indigo-dyeing-master-craftsman.jpg",
    href: "/teaching",
  },
  {
    id: "2",
    title: "春季新品文创系列",
    subtitle: "融合现代设计的蓝染艺术品",
    image: "/modern-indigo-dyed-fashion-products.jpg",
    href: "/store",
  },
  {
    id: "3",
    title: "热门课程推荐",
    subtitle: "零基础入门扎染，轻松上手",
    image: "/indigo-dyeing-workshop-students-learning.jpg",
    href: "/teaching/tie-dye",
  },
]

const quickAccessItems = [
  { href: "/teaching/tie-dye", icon: Palette, label: "扎染", color: "bg-primary" },
  { href: "/teaching/wax-resist", icon: Droplets, label: "蜡染", color: "bg-secondary" },
  { href: "/store/materials", icon: Package, label: "材料包", color: "bg-accent" },
  { href: "/store/custom", icon: Wrench, label: "定制工坊", color: "bg-chart-4" },
]

const featuredCourses = [
  {
    id: "1",
    title: "传统扎染基础入门",
    instructor: "李师傅",
    duration: "2小时30分",
    students: 1234,
    thumbnail: "/tie-dye-tutorial-hands-on.jpg",
    isFree: true,
  },
  {
    id: "2",
    title: "蜡染工艺深度解析",
    instructor: "王老师",
    duration: "3小时15分",
    students: 856,
    thumbnail: "/wax-resist-dyeing-technique.jpg",
    price: 199,
  },
  {
    id: "3",
    title: "现代蓝染创新技法",
    instructor: "张艺术家",
    duration: "4小时",
    students: 567,
    thumbnail: "/modern-indigo-dyeing-art.jpg",
    price: 299,
  },
]

const featuredProducts = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "扎染T恤",
    price: 128,
    originalPrice: 168,
    image: "/handmade-tie-dye-silk-scarf.jpg",
    sales: 234,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "蜡染丝巾",
    price: 198,
    originalPrice: 228,
    image: "/wax-resist-dyeing-technique.jpg",
    sales: 156,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "蜡染抱枕",
    price: 68,
    originalPrice: 98,
    image: "/traditional-wax-resist-cushion.jpg",
    sales: 89,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "扎染帆布包",
    price: 88,
    originalPrice: 118,
    image: "/indigo-dyed-canvas-bag.jpg",
    sales: 345,
  },
]

// 文章数据从 Supabase 实时获取（见 HomePage 组件内）

export default function HomePage() {
  // 使用全局状态获取未读消息和通知数量
  const { unreadMessages, unreadNotifications } = useGlobalState();
  
  // 添加性能监控
  usePerformanceMonitor("/", 6) // 6个主要组件
  
  // 从 Supabase 获取文章数据
  const [cultureArticles, setCultureArticles] = useState<any[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  
  useEffect(() => {
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
    
    fetchArticles()
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
        <LazyBannerCarousel items={bannerItems} />
      </section>

      {/* Quick Access */}
      <section className="mb-8">
        <LazyQuickAccess items={quickAccessItems} />
      </section>

      {/* Teaching Section */}
      <section className="px-4 mb-8">
        <SectionHeader title="教学精选" href="/teaching" />
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {featuredCourses.map((course) => (
            <LazyCourseCard key={course.id} {...course} showFavorite={true} />
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 mb-8">
        <SectionHeader title="文创臻品" href="/store" />
        <div className="grid grid-cols-2 gap-4">
          {featuredProducts.map((product) => (
            <LazyProductCard key={product.id} {...product} />
          ))}
        </div>
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
