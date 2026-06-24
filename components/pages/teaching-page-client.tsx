"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useGlobalState } from "@/hooks/use-global-state"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { usePagination } from "@/hooks/use-pagination"
import { useInfiniteScroll, createInfiniteScrollConfig } from "@/hooks/use-infinite-scroll"
import { LoadingStateFooter } from "@/components/ui/loading-state-footer"
import { FullPageError } from "@/components/ui/error-state"
import { toast } from "sonner"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { getCourseVisualPriority, getCuratedVideoCover } from "@/lib/course-cover-presets"
import { 
  Search, Bell, Heart, Play, Filter,
  Flower2, Diamond, BookOpen, Wrench
} from "lucide-react"

// 课程分类配置
const COURSE_CATEGORIES = [
  { id: 'beginner', name: '初级入门', icon: Flower2, filter: '入门' },
  { id: 'advanced', name: '高级技艺', icon: Diamond, filter: '进阶' },
  { id: 'culture', name: '历史文化', icon: BookOpen, filter: '文化' },
  { id: 'workshop', name: '实践工坊', icon: Wrench, filter: '实践' },
]

// 难度标签颜色映射
const DIFFICULTY_COLORS: Record<string, string> = {
  '入门': 'text-green-700 bg-green-50 border-green-100',
  '进阶': 'text-indigo-600 bg-indigo-50 border-indigo-100',
  '高级': 'text-purple-600 bg-purple-50 border-purple-100',
  '文化': 'text-[#B74134] bg-red-50 border-red-100',
}

// 课程标签颜色
const TAG_COLORS: Record<string, string> = {
  '热门': 'bg-[#B74134]',
  '新课': 'bg-[#CFB068]',
  '推荐': 'bg-indigo-600',
  '免费': 'bg-green-600',
}

interface Course {
  id: string
  slug?: string
  title: string
  description?: string
  instructor?: string
  duration?: string
  students?: number
  image_url?: string
  thumbnail?: string
  video_url?: string
  is_free?: boolean
  price?: number
  difficulty?: string
  category?: string
  lessons_count?: number
  progress?: number
  tag?: string
  visualPriority?: number
}

// API 响应类型
interface CoursesApiResponse {
  courses: Array<Record<string, unknown>>
  total?: number
  page?: number
  hasMore?: boolean
}

// 数据转换函数：从 API 响应中提取并格式化课程数据
function transformCourses(response: unknown): Course[] {
  const data = response as CoursesApiResponse
  const coursesData = data.courses || []
  let missingVideoCoverIndex = 0
  
  return coursesData.map((course, index) => {
    const id = typeof course.id === 'string' ? course.id : ''
    const title = typeof course.title === 'string' ? course.title : '蓝染课程'
    const rawImageUrl = typeof course.image_url === 'string' ? course.image_url : undefined
    const videoUrl = typeof course.video_url === 'string' ? course.video_url : undefined
    const presetCover =
      !rawImageUrl && videoUrl
        ? getCuratedVideoCover(missingVideoCoverIndex++)
        : null
    const imageUrl = rawImageUrl || presetCover || undefined
    const description =
      typeof course.description === 'string'
        ? course.description
        : typeof course.excerpt === 'string'
          ? course.excerpt
          : ''
    const instructor =
      typeof course.instructor === 'string'
        ? course.instructor
        : typeof course.instructor_name === 'string'
          ? course.instructor_name
          : '蓝染工坊'
    const duration =
      typeof course.duration === 'string'
        ? course.duration
        : `${Math.floor(Math.random() * 10) + 5}课时`
    const students = typeof course.students === 'number' ? course.students : Math.floor(Math.random() * 500) + 100
    const price = typeof course.price === 'number' ? course.price : undefined

    return {
      id,
      slug: typeof course.slug === 'string' ? course.slug : undefined,
      title,
      description,
      instructor,
      duration,
      students,
      image_url: imageUrl,
      thumbnail: imageUrl || '/placeholder.svg',
      video_url: videoUrl,
      is_free: typeof course.is_free === 'boolean' ? course.is_free : price === 0,
      price,
      difficulty:
        typeof course.difficulty === 'string'
          ? course.difficulty
          : ['入门', '进阶', '文化'][index % 3],
      category: typeof course.category === 'string' ? course.category : '未分类',
      lessons_count: typeof course.lessons_count === 'number' ? course.lessons_count : Math.floor(Math.random() * 15) + 5,
      // 模拟学习进度（实际项目中应从用户数据获取）
      progress: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : 0,
      // 添加标签
      tag: index === 0 ? '热门' : index === 1 ? '新课' : undefined,
      visualPriority: getCourseVisualPriority(imageUrl, videoUrl),
    }
  })
}

// 总数提取函数
function extractTotal(response: unknown): number {
  const data = response as CoursesApiResponse
  return data.total || 0
}

function getCourseCardSummary(course: Course): string {
  const difficulty = course.difficulty || "入门"
  const category = course.category || "蓝染"
  return `${difficulty}${category.includes(difficulty) ? "" : " · " + category}课程，适合用来了解图案、工艺与上手方式。`
}

function getCourseCardMeta(course: Course): string {
  const parts = [course.category, course.difficulty].filter(Boolean)
  return parts.join(" · ") || "蓝染课程"
}

export function TeachingPageClient() {
  const { unreadNotifications } = useGlobalState()
  const { user } = useAuth()
  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites } = useFavorites()

  useEffect(() => {
    const mobileFrame = document.querySelector('.mobile-frame')
    const body = document.body

    mobileFrame?.classList.add('shared-page-fixed-bg')
    body.classList.add('shared-page-fixed-bg')

    return () => {
      mobileFrame?.classList.remove('shared-page-fixed-bg')
      body.classList.remove('shared-page-fixed-bg')
    }
  }, [])
  
  // 筛选状态
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 使用 usePagination Hook 进行分页加载
  // Requirements: 4.1, 4.2
  const {
    items: courses,
    loading,
    loadingMore,
    hasMore,
    error,
    total,
    loadMore,
    // reset is available for server-side filtering if needed
    // reset,
    retry,
  } = usePagination<Course>({
    endpoint: '/api/courses',
    pageSize: 6,
    transformer: transformCourses,
    totalExtractor: extractTotal,
    autoLoad: true,
    fetchOptions: {
      timeoutMs: 7000,
      retries: 0,
    },
  })

  // 使用 useInfiniteScroll Hook 实现滚动加载
  // Requirements: 4.2
  const infiniteScrollConfig = createInfiniteScrollConfig(
    { hasMore, loading, loadingMore },
    loadMore,
    { enabled: !loading && courses.length > 0, threshold: 100 }
  )
  const { triggerRef } = useInfiniteScroll(infiniteScrollConfig)

  // 本地筛选后的课程列表
  // Requirements: 4.4 - 保留筛选状态
  const filteredCourses = useMemo(() => {
    let result = courses

    // 分类筛选
    if (activeCategory) {
      const category = COURSE_CATEGORIES.find(c => c.id === activeCategory)
      if (category) {
        result = result.filter(course => 
          course.difficulty?.includes(category.filter) || 
          course.category?.includes(category.filter)
        )
      }
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query)
      )
    }

    return [...result].sort((a, b) => {
      const aPriority = a.visualPriority || 0
      const bPriority = b.visualPriority || 0
      if (aPriority !== bPriority) return bPriority - aPriority

      const aStudents = a.students || 0
      const bStudents = b.students || 0
      return bStudents - aStudents
    })
  }, [courses, activeCategory, searchQuery])

  // 精选课程（第一个有图片的课程）
  const featuredCourse = useMemo(() => {
    return filteredCourses.find(c => c.image_url && c.image_url !== '/placeholder.svg') || null
  }, [filteredCourses])

  // 分类筛选处理
  // Requirements: 4.5 - 筛选变化时重置分页
  const handleCategoryFilter = useCallback((categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null)
    } else {
      setActiveCategory(categoryId)
    }
    // 注意：这里使用本地筛选，不需要重新请求 API
    // 如果需要服务端筛选，可以调用 reset({ category: categoryId })
  }, [activeCategory])

  // 搜索处理
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // 注意：这里使用本地搜索，不需要重新请求 API
    // 如果需要服务端搜索，可以调用 reset({ search: query })
  }, [])

  // 收藏切换 - 连接真实后端
  const toggleFavorite = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('请先登录')
      return
    }
    
    try {
      const isFav = isCourseFavorite(courseId)
      if (isFav) {
        await removeCourseFromFavorites(courseId)
      } else {
        await addCourseToFavorites(courseId)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      toast.error('操作失败')
    }
  }

  return (
    <div className="page-container page-background-home-echo pb-16" style={{ fontFamily: "'Noto Serif SC', serif" }}>
      {/* 背景装饰 - 与首页保持一致 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-48 h-48 bg-indigo-300/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="nav-header shadow-sm">
        <div className="px-5 pt-4 pb-2 flex justify-between items-center">
          {/* 书法风格标题 */}
          <div className="relative group cursor-default">
            <h1 className="text-2xl font-serif text-indigo-900 relative z-10 drop-shadow-sm" style={{ fontFamily: "'Ma Shan Zheng', cursive, serif" }}>
              蓝染课程
            </h1>
            <div className="absolute -bottom-2 -left-2 w-full h-3 bg-indigo-200/40 -rotate-2 rounded-full blur-[1px] -z-0 group-hover:bg-indigo-300/50 transition-colors duration-500" />
          </div>
          
          {/* 右侧按钮 */}
          <div className="flex gap-3">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors active:scale-90"
            >
              <Search className="w-[22px] h-[22px] text-indigo-800" strokeWidth={1.5} />
            </button>
            <Link 
              href="/notifications"
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors active:scale-90"
            >
              <Bell className="w-[22px] h-[22px] text-indigo-800" strokeWidth={1.5} />
              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#B74134] rounded-full border border-white" />
              )}
            </Link>
          </div>
        </div>
        
        {/* 搜索框（展开时显示） */}
        {showSearch && (
          <div className="px-5 pb-2 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索课程、讲师..."
                className="w-full h-10 search-input rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      <main className="px-4 mt-4 space-y-5 relative z-10">
        {/* 精选横幅 - 今日推荐 */}
        {featuredCourse && (
          <Link 
            href={`/teaching/${featuredCourse.slug || featuredCourse.id}?from=teaching`}
            className="block relative w-full h-40 rounded-2xl overflow-hidden shadow-xl shadow-indigo-900/10 group animate-fade-in"
          >
            {/* 背景图片 */}
            <div className="absolute inset-0 overflow-hidden">
              <OptimizedImage
                src={featuredCourse.image_url || '/placeholder.svg'}
                alt={featuredCourse.title}
                fill
                className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 opacity-90"
                usage="detail"
                sizes="(max-width: 768px) 100vw, 640px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-900/60 to-transparent" />
            </div>
            
            {/* 内容 */}
            <div className="absolute inset-0 p-4 flex flex-col justify-center">
              {/* 今日推荐标签 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm w-fit flex items-center gap-1 mb-2">
                <span className="w-1 h-1 rounded-full bg-[#B74134] animate-pulse" />
                今日推荐
              </div>
              
              <div className="flex justify-between items-end w-full">
                <div className="max-w-[70%]">
                  <h2 className="text-lg font-bold mb-1 leading-tight drop-shadow-md text-white line-clamp-2">
                    {featuredCourse.title}
                  </h2>
                  <p className="text-indigo-100 text-[10px] line-clamp-1 opacity-90 font-light tracking-wide">
                    {featuredCourse.description || `跟随${featuredCourse.instructor}，探索蓝染之美...`}
                  </p>
                </div>
                
                {/* 试看按钮 */}
                <button className="bg-white/95 text-indigo-900 pl-3 pr-1 py-1.5 rounded-full text-xs font-bold hover:bg-white transition-all duration-300 active:scale-95 flex items-center gap-1 shadow-md">
                  试看
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                </button>
              </div>
            </div>
          </Link>
        )}

        {/* 课程分类 - 4格网格 */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="ui-section-title tracking-wide flex items-center gap-2">
              <span className="w-0.5 h-3.5 bg-indigo-600 rounded-full" />
              课程分类
            </h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2.5">
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border transition-all active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-app-card border-border active:bg-muted/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${
                  activeCategory === cat.id ? 'text-white' : 'text-foreground'
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 全部课程列表 */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          {/* 标题栏 - Requirements: 4.6 显示总数 */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="ui-section-title tracking-wide flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-600 rounded-full" />
              全部课程
              {total > 0 && (
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  ({total}门)
                </span>
              )}
            </h3>
            <button className="text-xs text-primary font-medium flex items-center gap-1 bg-app-card px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform border border-border">
              筛选 <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 课程列表 */}
          <div className="flex flex-col space-y-4 pb-4">
            {/* 初始加载失败 - 全屏错误状态 - Requirements: 7.1 */}
            {error && courses.length === 0 ? (
              <FullPageError
                error={error}
                onRetry={retry}
                title="课程加载失败"
                description="无法加载课程列表，请检查网络连接后重试"
              />
            ) : /* 初始加载骨架屏 - Requirements: 4.3 */
            loading && courses.length === 0 ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="ui-card-glass rounded-[22px] p-2.5 flex gap-3 animate-pulse">
                  <div className="h-[8.4rem] w-[38%] flex-shrink-0 rounded-[16px] bg-muted" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <div className="h-4 bg-muted rounded w-4/5" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-2 bg-muted rounded-full w-full mt-3" />
                  </div>
                </div>
              ))
            ) : filteredCourses.length > 0 ? (
              <>
                {filteredCourses.map((course) => {
                  const difficultyColor = DIFFICULTY_COLORS[course.difficulty || '入门'] || DIFFICULTY_COLORS['入门']
                  const tagColor = course.tag ? TAG_COLORS[course.tag] || 'bg-indigo-600' : ''
                  
                  return (
                    <Link
                      key={course.id}
                      href={`/teaching/${course.slug || course.id}?from=teaching`}
                      className="ui-card-glass group relative flex gap-3 overflow-hidden rounded-[22px] p-2 transition-all duration-200 active:scale-[0.99]"
                    >
                      {/* 缩略图 */}
                      <div className="relative h-[7.9rem] w-[37%] flex-shrink-0 overflow-hidden rounded-[16px] bg-muted shadow-inner">
                        <OptimizedImage
                          src={course.image_url || course.thumbnail || '/placeholder.svg'}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          usage="card"
                          sizes="128px"
                        />
                        {/* 标签（热门/新课） */}
                        {course.tag && (
                          <div className={`absolute left-2 top-2 ${tagColor} rounded-full px-2 py-1 text-[10px] font-semibold text-white shadow-sm z-10`}>
                            {course.tag}
                          </div>
                        )}
                      </div>
                      
                      {/* 课程信息 */}
                      <div className="flex min-h-[7.9rem] flex-1 flex-col pr-8 py-0.5">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-2 text-[16px] font-semibold leading-[1.22] text-[#243d66] transition-colors group-hover:text-indigo-700">
                              {course.title}
                            </h4>
                          </div>
                          <p className="text-[10px] font-medium tracking-[0.06em] text-[#7a8fb2]">
                            {getCourseCardMeta(course)}
                          </p>
                          <p className="line-clamp-3 text-[12px] leading-[1.45] text-[#5f759a]">
                            {getCourseCardSummary(course)}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/55 pt-2">
                          <span className={`text-[10px] ${difficultyColor} border px-2 py-0.5 rounded-full font-medium`}>
                            {course.difficulty || '入门'}
                          </span>
                          <span className="text-[10px] text-[#8aa0c2]">点击查看详情</span>
                        </div>
                      </div>
                      
                      {/* 收藏按钮 */}
                      <button 
                        onClick={(e) => toggleFavorite(course.id, e)}
                        className={`absolute top-3 right-3 transition-colors active:scale-110 z-20 ${
                          isCourseFavorite(course.id) 
                            ? 'text-[#B74134]' 
                            : 'text-slate-300 hover:text-[#B74134]'
                        }`}
                      >
                        <Heart className={`w-[22px] h-[22px] ${isCourseFavorite(course.id) ? 'fill-current' : ''}`} />
                      </button>
                    </Link>
                  )
                })}

                {/* 加载更多时的骨架屏 - Requirements: 4.3 */}
                {loadingMore && (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={`loading-more-${i}`} className="ui-card-glass rounded-[22px] p-2.5 flex gap-3 animate-pulse">
                      <div className="h-[8.4rem] w-[38%] flex-shrink-0 rounded-[16px] bg-muted" />
                      <div className="flex-1 space-y-2.5 py-1">
                        <div className="h-4 bg-muted rounded w-4/5" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="h-2 bg-muted rounded-full w-full mt-3" />
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : !loading ? (
              <div className="text-center py-12 text-indigo-300 text-sm">
                暂无课程
              </div>
            ) : null}
          </div>

          {/* 滚动触发器和加载状态 */}
          <div ref={triggerRef}>
            <LoadingStateFooter
              loading={loadingMore}
              hasMore={hasMore && filteredCourses.length > 0}
              error={error}
              onRetry={retry}
              loadingText="加载更多课程..."
              noMoreText="--- 已加载全部课程 ---"
              errorText="加载失败，请重试"
            />
          </div>
        </section>

        {/* 底部装饰 */}
        <div className="h-12 flex items-center justify-center text-xs text-indigo-300 font-serif opacity-60">
          --- 世说蓝语 · 匠心传承 ---
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
