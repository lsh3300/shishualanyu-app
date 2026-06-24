'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BottomNav } from "@/components/navigation/bottom-nav";
import { ImmersiveWelcome } from "@/components/welcome/immersive-welcome";
import { useGlobalState } from "@/hooks/use-global-state";
import { useSearchController, type SearchControllerType } from "@/hooks/use-search-controller";
import { useAuth } from "@/contexts/auth-context";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { fetchJson } from "@/lib/fetch-json";
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths";
import { cn } from "@/lib/utils";
import { 
  Search, Bell, History, Briefcase, Store, Sparkles, 
  ArrowRight, User, Settings, LogOut, Heart, ShoppingBag,
  X, TrendingUp, Clock, Flame, Shield
} from 'lucide-react';

// 快捷入口配置
const CATEGORIES = [
  { name: '传统工艺', icon: History, color: 'bg-indigo-50 text-indigo-600', href: '/teaching' },
  { name: '材料工具', icon: Briefcase, color: 'bg-blue-50 text-blue-600', href: '/store/materials' },
  { name: '定制工坊', icon: Store, color: 'bg-cyan-50 text-cyan-600', href: '/store/custom' },
  { name: 'AI创作', icon: Sparkles, color: 'bg-purple-50 text-purple-600', href: '/store/ai-create' },
];

// 热门搜索数据
const HOT_SEARCHES = [
  { text: '扎染入门', type: 'course', hot: true },
  { text: '蓝染丝巾', type: 'product', hot: true },
  { text: '蜡染工艺', type: 'course' },
  { text: '靛蓝染料', type: 'product' },
  { text: '传统蓝染', type: 'article', hot: true },
  { text: '手工DIY', type: 'course' },
];

// 搜索分类
const SEARCH_CATEGORIES = [
  { id: 'all', name: '全部', color: 'bg-gray-100 text-gray-700' },
  { id: 'product', name: '商品', color: 'bg-amber-50 text-amber-600' },
  { id: 'course', name: '课程', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'article', name: '文章', color: 'bg-emerald-50 text-emerald-600' },
];

// 轮播图数据类型
interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  tag: string;
}

type HomeCourse = {
  id: string
  slug?: string
  title: string
  duration: string
  students: number
  imageUrl: string
  price: 'free' | number
  level: string
}

type HomeProduct = {
  id: string
  name: string
  price: number | null
  sales: string
  imageUrl: string
  tag: string | null
}

type HomeArticle = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string
  readTime: number
  category: string
  views: number
}

type HomeApiResponse = {
  featuredCourses?: HomeCourse[]
  featuredProducts?: HomeProduct[]
  cultureArticles?: HomeArticle[]
  bannerItems?: BannerItem[]
}

const BLUE_CARD_SURFACE =
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(240,247,255,0.54)_100%)] backdrop-blur-[3px]'
const FLOATING_PANEL_SURFACE =
  'bg-[linear-gradient(180deg,rgba(252,254,255,0.9)_0%,rgba(244,249,255,0.94)_100%)] backdrop-blur-[10px]'

export function HomePageClient() {
  const router = useRouter();
  const { unreadNotifications } = useGlobalState();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminAuth(false);
  const [welcomeState, setWelcomeState] = useState<'checking' | 'show' | 'hide'>('checking');

  useEffect(() => {
    try {
      const bypassWelcomeOnce = window.sessionStorage.getItem('sslyapp-welcome-bypass-once') === '1';

      if (bypassWelcomeOnce) {
        window.sessionStorage.removeItem('sslyapp-welcome-bypass-once');
        window.sessionStorage.setItem('sslyapp-welcome-seen', '1');
        setWelcomeState('hide');
        return;
      }

      const hasSeenWelcome = window.sessionStorage.getItem('sslyapp-welcome-seen');
      setWelcomeState(hasSeenWelcome === '1' ? 'hide' : 'show');
    } catch {
      setWelcomeState('show');
    }
  }, []);

  const handleEnterApp = () => {
    try {
      window.sessionStorage.setItem('sslyapp-welcome-seen', '1');
    } catch {
      // ignore storage failures and still let the user continue
    }
    setWelcomeState('hide');
  };


  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const {
    searchHistory,
    clearHistory: clearSearchHistory,
    removeHistoryItem: removeSearchHistoryItem,
    selectedType: selectedCategory,
    setSelectedType: setSelectedCategory,
    executeSearch,
  } = useSearchController();

  // 用户菜单弹窗状态
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // 点击外部关闭搜索面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target as Node)) {
        setShowSearchPanel(false);
      }
    };
    
    if (showSearchPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchPanel]);
  
  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
  // 状态管理
  const [featuredCourses, setFeaturedCourses] = useState<HomeCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<HomeProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cultureArticles, setCultureArticles] = useState<HomeArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  
  // 轮播图状态
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerLoading, setBannerLoading] = useState(true);

  const { profile } = useUserProfile()

  useEffect(() => {
    const mobileFrame = document.querySelector('.mobile-frame')
    const body = document.body

    mobileFrame?.classList.add('home-page-fixed-bg')
    body.classList.add('home-page-fixed-bg')

    return () => {
      mobileFrame?.classList.remove('home-page-fixed-bg')
      body.classList.remove('home-page-fixed-bg')
    }
  }, [])
  
  // 轮播图自动切换
  useEffect(() => {
    if (bannerItems.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerItems.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [bannerItems.length]);
  
  // 处理登出
  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/');
  };
  
  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (!user) return '游客';
    return user.user_metadata?.nickname || user.user_metadata?.name || user.email?.split('@')[0] || '用户';
  };
  
  // 获取用户头像
  const getUserAvatar = () => {
    if (!user) return null;
    return profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
  };
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchPanel(false);
    executeSearch(searchQuery);
  };

  const removeHistoryItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSearchHistoryItem(item);
  };

  // 数据获取
  useEffect(() => {
    let isActive = true;

    async function fetchAllData() {
      try {
        const data = await fetchJson<HomeApiResponse>('/api/home', {
          timeoutMs: 15000,
          retries: 1,
        });

        if (!isActive) return;

        setFeaturedCourses(data.featuredCourses || []);
        setFeaturedProducts(data.featuredProducts || []);
        setCultureArticles(data.cultureArticles || []);
        setBannerItems(data.bannerItems || []);
        setCoursesLoading(false);
        setProductsLoading(false);
        setArticlesLoading(false);
        setBannerLoading(false);
      } catch (err) {
        console.error('获取首页数据异常:', err);
        if (!isActive) return;
        setCoursesLoading(false);
        setProductsLoading(false);
        setArticlesLoading(false);
        setBannerLoading(false);
      }
    }
    
    fetchAllData();

    return () => {
      isActive = false;
    };
  }, []);

  if (welcomeState === 'checking') {
    return <div className="min-h-screen bg-background" />;
  }

  if (welcomeState === 'show') {
    return (
      <ImmersiveWelcome
        mode="gate"
        onEnterApp={handleEnterApp}
        onSkip={handleEnterApp}
      />
    );
  }

  return (
    <div
      className="page-container home-page-clean-bg relative flex min-h-screen flex-col bg-transparent"
      style={{
        fontFamily: "'Noto Serif SC', serif",
        backgroundColor: 'transparent',
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
      {/* 顶部导航栏 */}
      <header className="nav-header px-4 py-2.5 shadow-sm" style={{ paddingTop: 'max(env(safe-area-inset-top), 10px)' }}>
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/brand/ssly-logo-current.png"
              alt="世说蓝语"
              fill
              className="object-contain"
              sizes="40px"
              priority
            />
          </div>

          {/* 搜索框区域 */}
          <div className="flex-1 relative" ref={searchPanelRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                <input
                  ref={searchInputRef}
                  data-testid="home-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchPanel(true)}
                  placeholder="搜索染艺·匠人·好物"
                  className="w-full h-9 search-input rounded-full pl-9 pr-10 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  data-testid="home-search-submit"
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
            
            {/* 搜索面板 */}
            {showSearchPanel && (
              <div className={`absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-[#d8e6f8] ${FLOATING_PANEL_SURFACE} shadow-[0_18px_38px_rgba(50,88,146,0.16)] z-50 animate-dropdown`}>
                {/* 搜索分类 */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {SEARCH_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as SearchControllerType)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : cat.color + ' hover:opacity-80'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 搜索历史 */}
                {searchHistory.length > 0 && (
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span>搜索历史</span>
                      </div>
                      <button
                        onClick={clearSearchHistory}
                        className="text-xs text-indigo-700 hover:text-indigo-800"
                      >
                        清除
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 6).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setShowSearchPanel(false);
                            executeSearch(item);
                          }}
                          className="group flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-muted/70 rounded-full text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <span>{item}</span>
                          <X 
                            className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                            onClick={(e) => removeHistoryItem(item, e)}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 热门搜索 */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>热门搜索</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HOT_SEARCHES.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setShowSearchPanel(false);
                          executeSearch(item.text, { type: item.type as SearchControllerType });
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                          item.type === 'product' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                          item.type === 'course' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' :
                          'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {item.hot && <Flame className="w-3 h-3 text-red-500" />}
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 快捷搜索提示 */}
                {searchQuery && (
                  <div className="p-3 border-t border-border bg-muted/40">
                    <button
                      onClick={() => {
                        setShowSearchPanel(false);
                        executeSearch(searchQuery);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary font-medium hover:text-primary/90"
                    >
                      <Search className="w-4 h-4" />
                      搜索 &ldquo;{searchQuery}&rdquo;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="w-9 h-9 rounded-full flex items-center justify-center text-[#35537f] hover:bg-[#eaf1fb] transition-all relative shrink-0">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </Link>
            
            {/* 用户头像 */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-200 hover:border-indigo-400 transition-all shrink-0 shadow-sm"
              >
                {getUserAvatar() ? (
                  <img src={getUserAvatar()!} alt="用户头像" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-700" />
                  </div>
                )}
              </button>
              
              {/* 下拉菜单 */}
              {showUserMenu && (
                <div className={`absolute top-full right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-[#d8e6f8] ${FLOATING_PANEL_SURFACE} shadow-[0_18px_38px_rgba(50,88,146,0.16)] z-50 animate-dropdown`}>
                  <div className={`absolute -top-2 right-3 h-4 w-4 rotate-45 border-l border-t border-[#d8e6f8] ${FLOATING_PANEL_SURFACE}`}></div>
                  
                  <div className="relative bg-app-background-blur p-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {getUserAvatar() ? (
                          <img src={getUserAvatar()!} alt="头像" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-indigo-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#29436e] truncate">{getUserDisplayName()}</p>
                        <p className="text-[10px] text-indigo-700 truncate">{user ? '已登录' : '未登录'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {user ? (
                      <>
                        {isAdmin && (
                          <>
                            <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#355889] hover:bg-[#edf4ff] transition-colors">
                              <Shield className="w-4 h-4 text-indigo-600" /><span>管理后台</span>
                            </Link>
                            <div className="border-t border-indigo-100 my-1"></div>
                          </>
                        )}
                        <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#355889] hover:bg-[#edf4ff] transition-colors">
                          <User className="w-4 h-4 text-indigo-400" /><span>个人中心</span>
                        </Link>
                        <Link href="/profile/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#355889] hover:bg-[#edf4ff] transition-colors">
                          <Heart className="w-4 h-4 text-red-400" /><span>我的收藏</span>
                        </Link>
                        <Link href="/profile/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#355889] hover:bg-[#edf4ff] transition-colors">
                          <ShoppingBag className="w-4 h-4 text-amber-500" /><span>我的订单</span>
                        </Link>
                        <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#355889] hover:bg-[#edf4ff] transition-colors">
                          <Settings className="w-4 h-4 text-gray-400" /><span>设置</span>
                        </Link>
                        <div className="border-t border-indigo-100 my-1"></div>
                        <button onClick={handleSignOut} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                          <LogOut className="w-4 h-4" /><span>退出登录</span>
                        </button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setShowUserMenu(false)} className="flex items-center justify-center gap-2 mx-2 my-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                        登录 / 注册
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 pb-20">
        {/* 轮播图 - 适合手机屏幕的比例 */}
        <section className="px-4 pt-2.5 pb-1.5">
          {bannerLoading ? (
            <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[rgba(248,252,255,0.78)] p-1 shadow-[0_18px_42px_rgba(29,58,102,0.18),0_6px_18px_rgba(255,255,255,0.42)_inset]">
              <div className="aspect-[16/9] bg-gradient-to-br from-indigo-100 to-indigo-50 animate-pulse" />
            </div>
          ) : bannerItems.length > 0 ? (
            <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-[rgba(248,252,255,0.78)] p-1 shadow-[0_18px_42px_rgba(29,58,102,0.18),0_6px_18px_rgba(255,255,255,0.42)_inset]">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[22px]">
                {bannerItems.map((item, index) => (
                  <Link 
                    key={item.id} 
                    href={item.href}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <Image 
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 640px"
                    />
                  </Link>
                ))}
                
                {/* 渐变遮罩 */}
                <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(7,21,46,0.04)_0%,rgba(7,21,46,0.0)_34%,rgba(7,21,46,0.18)_60%,rgba(7,21,46,0.68)_82%,rgba(7,21,46,0.9)_100%)]"></div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[42%] bg-[radial-gradient(ellipse_at_bottom,rgba(9,25,53,0.34)_0%,rgba(9,25,53,0.16)_48%,rgba(9,25,53,0)_100%)]"></div>
              </div>
              
              {/* 内容区域 */}
              <Link href={bannerItems[currentBannerIndex]?.href || '#'} className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2 z-30">
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full shadow-md">
                        {bannerItems[currentBannerIndex]?.tag}
                      </span>
                    </div>
                    <h2 className="text-lg font-serif font-bold text-white leading-tight line-clamp-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                      {bannerItems[currentBannerIndex]?.title}
                    </h2>
                  </div>
                  
                  {/* 轮播指示器 */}
                  <div className="flex items-center gap-1.5">
                    {bannerItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentBannerIndex(index);
                        }}
                        className={`rounded-full transition-all duration-300 ${
                          index === currentBannerIndex 
                            ? 'w-5 h-1.5 bg-white' 
                            : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-indigo-100 to-indigo-200 aspect-[16/9] flex items-center justify-center">
              <p className="text-indigo-500 text-sm">暂无轮播内容</p>
            </div>
          )}
        </section>

        {/* 快捷入口 */}
        <section className="px-4 pt-2.5 pb-2">
          <div className="grid grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat, idx) => (
              <Link 
                key={idx}
                href={cat.href}
                className={`flex flex-col items-center justify-center rounded-[20px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} py-3.5 shadow-[0_8px_20px_rgba(58,92,145,0.08)] group transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(58,92,145,0.12)]`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color} mb-1.5 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-[#314c76]">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>


        {/* 分隔线 */}
        <div className="flex items-center justify-center px-6 my-1">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full"></div>
        </div>

        {/* 精选教程 */}
        <section className="px-4 py-2">
          <div className="flex justify-between items-start mb-2.5">
            <h3 className="text-base font-bold text-[#233e69] flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
              精选教程
            </h3>
            <Link href="/teaching" className="text-xs text-[#3f5f8f] flex items-center gap-1 hover:text-[#2e4c79]">
              更多 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`overflow-hidden rounded-[22px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} animate-pulse shadow-[0_8px_20px_rgba(58,92,145,0.08)]`}>
                  <div className="aspect-square bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)]" />
                  <div className="p-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5">
              {featuredCourses.slice(0, 3).map((course) => (
                <Link 
                  key={course.id} 
                  href={`/teaching/${course.slug || course.id}?from=home`} 
                  className={`overflow-hidden rounded-[22px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} shadow-[0_8px_20px_rgba(58,92,145,0.08)] group transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(58,92,145,0.12)]`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image 
                      src={resolveStaticAssetUrl(course.imageUrl) || "/placeholder.svg"} 
                      alt={course.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      sizes="(max-width: 768px) 33vw, 180px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-app-background-blur backdrop-blur text-primary text-[9px] font-bold rounded">{course.level}</span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className={`text-xs font-bold ${course.price === 'free' ? 'text-green-400' : 'text-white'}`}>
                        {course.price === 'free' ? '免费' : `¥${course.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-[11px] font-medium text-[#243d66] line-clamp-2 leading-snug">{course.title}</h4>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#617da7]">
                      <span className="rounded-full bg-[#edf4ff] px-1.5 py-0.5">入门推荐</span>
                      <span>轻松上手</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-indigo-500 text-sm">暂无精选教程</div>
          )}
        </section>

        {/* 分隔线 */}
        <div className="flex items-center justify-center px-6 my-1">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent flex-1"></div>
          <div className="mx-3 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-indigo-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-200"></div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent flex-1"></div>
        </div>

        {/* 匠心优品 */}
        <section className="px-4 py-2">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-base font-bold text-[#233e69] flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
              匠心优品
            </h3>
            <Link href="/store" className="text-xs text-[#3f5f8f] flex items-center gap-1 hover:text-[#2e4c79]">
              进店逛逛 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`rounded-[22px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} p-1 animate-pulse shadow-[0_8px_20px_rgba(58,92,145,0.08)]`}>
                  <div className="aspect-[0.92] rounded-[15px] bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)] mb-1" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {featuredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/store/${product.id}?from=home`} 
                  className={`rounded-[22px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} p-1 shadow-[0_8px_20px_rgba(58,92,145,0.08)] group transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(58,92,145,0.12)]`}
                >
                  <div className="relative aspect-[0.92] overflow-hidden rounded-[15px] bg-muted mb-1">
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      sizes="(max-width: 768px) 50vw, 240px"
                    />
                    {product.tag && (
                      <div className={`absolute top-0 left-0 px-2 py-0.5 text-[9px] font-bold text-white rounded-br-lg shadow ${product.tag.includes('热销') ? 'bg-red-500' : 'bg-indigo-500'}`}>
                        {product.tag}
                      </div>
                    )}
                  </div>
                  <div className="px-1.5 py-1">
                    <h4 className="text-[11px] font-medium text-[#243d66] line-clamp-1 mb-0.5">{product.name}</h4>
                    <div className="mb-1 flex items-center gap-1">
                      <span className="rounded-full bg-[#fef3c7] px-1.5 py-0.5 text-[9px] text-[#a16207]">匠选</span>
                      <span className="text-[9px] text-[#617da7]">日常器物</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline">
                        <span className="text-[10px] font-bold text-red-600">¥</span>
                        <span className="text-sm font-serif font-bold text-red-600 leading-none">{product.price}</span>
                      </div>
                      <span className="text-[9px] text-[#58749e]">{product.sales}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 分隔线 */}
        <div className="flex items-center justify-center px-6 my-1">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent flex-1"></div>
          <svg className="mx-2 w-4 h-4 text-indigo-200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z" />
          </svg>
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent flex-1"></div>
        </div>

        {/* 文化速读 */}
        <section className="px-4 pt-2 pb-3 mb-2">
          <div className="mb-2.5 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-emerald-500"></span>
              <div>
                <h3 className="text-base font-bold text-[#233e69]">文化速读</h3>
                <p className="mt-0.5 text-[10px] tracking-[0.08em] text-[#617da7]">READING SCROLL</p>
              </div>
            </div>
            <Link href="/culture" className="text-xs text-[#3f5f8f] flex items-center gap-1 hover:text-[#2e4c79]">
              更多 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {articlesLoading ? (
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[linear-gradient(180deg,rgba(134,165,208,0.18)_0%,rgba(134,165,208,0.42)_22%,rgba(134,165,208,0.18)_100%)]" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-6 top-5 flex h-5 w-5 items-center justify-center rounded-full border border-[#cfe0f4] bg-white shadow-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#7da37f]" />
                    </div>
                    <div className={`rounded-[22px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} p-3 shadow-[0_8px_20px_rgba(58,92,145,0.08)]`}>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-5 w-12 rounded-full bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)]" />
                        <div className="h-3 w-10 rounded bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)]" />
                      </div>
                      <div className="h-4 w-4/5 rounded bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)]" />
                      <div className="mt-2 h-3 w-3/5 rounded bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : cultureArticles.length > 0 ? (
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[linear-gradient(180deg,rgba(134,165,208,0.18)_0%,rgba(134,165,208,0.42)_22%,rgba(134,165,208,0.18)_100%)]" />
              <div className="space-y-3">
                {cultureArticles.slice(0, 5).map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/culture/${article.slug}`}
                    className="group relative block"
                  >
                    <div className="absolute -left-6 top-5 flex h-5 w-5 items-center justify-center rounded-full border border-[#cfe0f4] bg-white shadow-sm transition-all group-hover:scale-110 group-hover:border-[#9fbde3]">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        index % 3 === 0 ? "bg-[#3f7f63]" : index % 3 === 1 ? "bg-[#4f74a6]" : "bg-[#a57942]"
                      )} />
                    </div>

                    <div className={`rounded-[22px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} p-3 shadow-[0_8px_20px_rgba(58,92,145,0.08)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_28px_rgba(58,92,145,0.12)]`}>
                      <div className="mb-2 flex items-center gap-2 text-[10px] text-[#446489]">
                        <span className="rounded-full bg-[#edf7f1] px-1.5 py-0.5 font-medium text-[#356f58]">{article.category}</span>
                        <span>{article.readTime}分钟</span>
                        <span className="text-[#6f87ad]">第 {index + 1} 则</span>
                      </div>

                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-[13px] font-semibold leading-6 text-[#1f3657]">{article.title}</h4>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#496886]">
                            {article.excerpt || "从工艺、纹样与日常生活的连接中，重新理解蓝染文化的当代表达。"}
                          </p>
                        </div>

                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[14px] border border-[#e2edf9] bg-muted">
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="64px"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className={`rounded-[22px] border border-[#d9e7f8] ${BLUE_CARD_SURFACE} py-8 text-center text-sm text-[#5d789f]`}>
              暂无文化文章
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      </div>
    </div>
  );
}
