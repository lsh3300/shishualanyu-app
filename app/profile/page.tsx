"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, BookOpen, ChevronRight, FileText, Info, LogOut, MapPin, MessageCircle, PackageCheck, Pencil, QrCode, Settings, ShoppingBag, ShoppingCart, Sparkles, Truck, Users, WalletCards } from "lucide-react"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { Button } from "@/components/ui/button"
import { UserAchievements } from "@/components/user/UserAchievements"
import { useAuth } from "@/contexts/auth-context"
import { usePlayerProfile } from "@/hooks/game/use-player-profile"
import { useCart } from "@/hooks/use-cart"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useUserStats } from "@/hooks/use-user-stats"
import { useGlobalState } from "@/hooks/use-global-state"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [fetchTrigger, setFetchTrigger] = useState(0) // 添加一个触发器状态

  const { profile: playerProfile, levelInfo } = usePlayerProfile()
  const { cartData, loading: cartLoading } = useCart()

  const { profile, mutate: mutateProfile } = useUserProfile(fetchTrigger)
  const { data: statsResponse, loading: statsLoading } = useUserStats(fetchTrigger)

  const userStats = useMemo(() => {
    const stats = statsResponse?.stats
    return {
      orders: stats?.orders ?? 0,
      courses: stats?.courses ?? 0,
      favorites: stats?.favorites ?? 0,
      assignments: stats?.assignments ?? 0,
      learningDays: stats?.learningDays ?? 0,
      completedCourses: stats?.completedCourses ?? 0,
    }
  }, [statsResponse?.stats])
  
  // 获取全局状态中的未读消息和通知数量
  const { unreadNotifications } = useGlobalState()
  
  // 监听统计数据更新事件
  useEffect(() => {
    const handleStatsUpdate = () => {
      setFetchTrigger(prev => prev + 1)
    }

    // 添加事件监听器
    window.addEventListener('statsUpdateRequired', handleStatsUpdate)
    
    // 清理函数
    return () => {
      window.removeEventListener('statsUpdateRequired', handleStatsUpdate)
    }
  }, [])

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

  // 用户数据 - 优先使用 API 获取的资料
  const userData = {
    name: profile?.full_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "用户",
    email: user?.email || "",
    avatar: profile?.avatar_url || user?.user_metadata?.avatar_url || "",
  }

  const handleLoginRequired = () => {
    router.push(`/auth?view=login&redirectTo=${encodeURIComponent('/profile')}`)
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const couponCount = 3

  const dyeHouseName = playerProfile?.dye_house_name

  const userLevel = levelInfo?.level ?? playerProfile?.level ?? 1
  const cartItemsCount = cartData?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0
  const cartSelectedCount = cartData?.items?.filter((item) => item.selected !== false).length ?? 0

  const quickStats = [
    { label: "我的课程", value: userStats.courses, href: "/profile/courses" },
    { label: "我的收藏", value: userStats.favorites, href: "/profile/favorites" },
    { label: "创作记录", value: userStats.assignments, href: "/profile/assignments" },
    { label: "优惠券", value: couponCount, href: "/profile/coupons" },
  ]

  const orderShortcuts = [
    { label: "待付款", icon: WalletCards, href: "/profile/orders" },
    { label: "待发货", icon: ShoppingBag, href: "/profile/orders" },
    { label: "待收货", icon: Truck, href: "/profile/orders" },
    { label: "待评价", icon: MessageCircle, href: "/profile/orders" },
    { label: "售后", icon: PackageCheck, href: "/profile/orders" },
  ]

  const profileLinks = [
    {
      label: "我的学习",
      value: user ? `${statsLoading ? "..." : userStats.courses} 门课程` : "学习记录 / 证书",
      icon: BookOpen,
      href: "/profile/courses",
    },
    {
      label: "我的创作",
      value: user ? `${statsLoading ? "..." : userStats.assignments} 条记录` : "我的作品 / 草稿箱",
      icon: FileText,
      href: "/profile/assignments",
    },
    {
      label: "我的好友",
      value: user ? "好友 / 申请 / 聊天" : "登录后添加好友",
      icon: Users,
      href: "/friends",
    },
    {
      label: "收货地址",
      value: "地址管理",
      icon: MapPin,
      href: "/profile/addresses",
    },
    {
      label: "联系客服",
      value: "9:00-18:00",
      icon: MessageCircle,
      href: "/contact",
    },
    {
      label: "关于我们",
      value: "了解世说蓝语",
      icon: Info,
      href: "/culture",
    },
  ]

  return (
    <div
      className="page-background-home-echo relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden pb-[calc(7rem+env(safe-area-inset-bottom,0px))] bg-background"
      style={{ fontFamily: "'Noto Serif SC', serif" }}
    >
      <div className="relative z-10">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.15),transparent_28%),linear-gradient(180deg,rgba(18,49,89,0.82)_0%,rgba(34,76,124,0.72)_58%,rgba(70,106,151,0.28)_100%)] px-5 pb-10 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-screen"
            style={{ backgroundImage: `url('${resolveStaticAssetUrl("/home-backgrounds/home-page-full-01.jpg") || "/home-backgrounds/home-page-full-01.jpg"}')` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_22%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_12%_68%,rgba(255,255,255,0.10),transparent_22%)]" />

          <div className="relative z-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/profile/scan")}
              className="rounded-full bg-white/10 p-2.5 text-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white/24 hover:text-white active:scale-95"
            >
              <QrCode className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    handleLoginRequired()
                    return
                  }
                  router.push("/notifications")
                }}
                className="relative rounded-full bg-white/10 p-2.5 text-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white/24 hover:text-white active:scale-95"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/profile/settings")}
                className="rounded-full bg-white/10 p-2.5 text-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white/24 hover:text-white active:scale-95"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {user ? (
            <div className="relative z-10 mt-7">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-white/35 bg-white/10 p-1 shadow-lg shadow-black/10 backdrop-blur-sm">
                  <AvatarUpload
                    currentAvatarUrl={userData.avatar}
                    onAvatarChange={(newUrl) => {
                      mutateProfile(
                        (prev) => ({
                          ...(prev || {}),
                          avatar_url: newUrl,
                        }),
                        { revalidate: false }
                      )
                    }}
                    size="md"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h1 className="truncate text-[1.35rem] font-semibold tracking-[0.06em] text-white">
                      {userData.name}
                    </h1>
                    <button
                      type="button"
                      onClick={() => router.push("/profile/settings")}
                      className="rounded-full p-1 text-white/75 transition-all duration-200 hover:scale-110 hover:bg-white/12 hover:text-white active:scale-95"
                      aria-label="编辑个人信息"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                    <span className="rounded-md bg-[#f3e7cd] px-2 py-0.5 font-medium text-[#6b4c22]">匠人学徒</span>
                    <span className="rounded-md bg-white/15 px-2 py-0.5 text-white/92 backdrop-blur-sm">LV.{userLevel}</span>
                  </div>
                  <p className="mt-1.5 truncate text-[11px] text-white/78">
                    {dyeHouseName ? `染坊：${dyeHouseName}` : "青出于蓝，染于日常"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 mt-8 rounded-[22px] border border-white/18 bg-white/10 p-5 text-center shadow-[0_12px_28px_rgba(10,24,49,0.12)] backdrop-blur-md">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/12 text-white/80">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold">欢迎来到个人中心</h2>
              <p className="mt-2 text-sm text-white/75">未登录也可以浏览课程、收藏、订单、优惠券和设置页面，涉及真实数据或互动操作时再提醒登录。</p>
              <Button onClick={handleLoginRequired} className="mt-4 bg-white text-[#1f4d82] hover:bg-white/90">
                立即登录
              </Button>
            </div>
          )}
        </section>

        <main className="-mt-6 relative overflow-hidden rounded-t-[28px] bg-transparent px-4 pb-28 pt-4 shadow-[0_-8px_28px_rgba(55,89,136,0.08)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[linear-gradient(180deg,rgba(207,225,246,0.98)_0%,rgba(220,236,251,0.84)_16%,rgba(231,243,253,0.58)_34%,rgba(241,248,254,0.28)_56%,rgba(250,252,255,0.10)_74%,rgba(255,255,255,0)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.18)_42%,rgba(255,255,255,0.04)_68%,rgba(255,255,255,0)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[18rem] bg-[linear-gradient(180deg,rgba(174,205,238,0.24)_0%,rgba(174,205,238,0.08)_52%,rgba(174,205,238,0)_100%)]" />
          <div className="relative z-10 space-y-3">
          <section className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.64)_0%,rgba(247,251,255,0.52)_100%)] px-2 py-4 shadow-[0_10px_24px_rgba(61,92,140,0.08),inset_0_1px_0_rgba(255,255,255,0.62)] ring-1 ring-[rgba(230,238,249,0.92)] backdrop-blur-[14px]">
            <div className="grid grid-cols-4 divide-x divide-[#ecf1f8]">
              {quickStats.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/52 hover:shadow-[0_10px_18px_rgba(110,142,188,0.14)] active:scale-[0.97]"
                >
                  <span className="text-xl font-semibold text-[#223f69]">{user ? (statsLoading ? "..." : item.value) : "--"}</span>
                  <span className="text-[10px] text-[#7a93bc]">{item.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-3 rounded-[22px] bg-[linear-gradient(135deg,rgba(247,240,223,0.82)_0%,rgba(239,225,194,0.68)_100%)] p-3 shadow-[0_10px_24px_rgba(160,126,64,0.10),inset_0_1px_0_rgba(255,255,255,0.45)] ring-1 ring-[rgba(234,220,188,0.86)] backdrop-blur-[12px]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-[#9a7441]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold text-[#6f5128]">世说蓝语会员</h3>
                <p className="mt-0.5 text-[11px] text-[#8f744e]">名字库标识卡、文创优先权益、匠人活动</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/store")}
                className="rounded-full bg-[#72512a] px-3 py-2 text-[11px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#60431f] hover:shadow-[0_10px_18px_rgba(114,81,42,0.26)] active:scale-[0.97]"
              >
                立即开通
              </button>
            </div>
          </section>

          <section className="mt-3 rounded-[22px] bg-[linear-gradient(135deg,rgba(232,241,253,0.88)_0%,rgba(247,250,255,0.70)_100%)] p-3 shadow-[0_10px_24px_rgba(61,92,140,0.10),inset_0_1px_0_rgba(255,255,255,0.62)] ring-1 ring-[rgba(220,232,248,0.92)] backdrop-blur-[14px]">
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-[18px] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#1f3f70_0%,#315a91_100%)] text-white shadow-[0_10px_22px_rgba(42,78,126,0.22)]">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-[#243d66]">购物车</h3>
                  {user ? (
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-medium text-[#5f7faa]">
                      {cartLoading ? "同步中" : `${cartItemsCount} 件商品`}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] text-[#6e88b0]">
                  {user
                    ? cartLoading
                      ? "正在同步购物清单"
                      : cartItemsCount > 0
                      ? `已选 ${cartSelectedCount} 件，去继续结算或调整商品`
                        : "先把喜欢的文创好物放进购物车"
                    : "登录后查看已加入的商品"}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#7f98bc]">
                <span>{user ? "查看" : "登录后查看"}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </div>
            </Link>
          </section>

          <section className="mt-3 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(247,251,255,0.56)_100%)] p-3 shadow-[0_10px_24px_rgba(61,92,140,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-[rgba(230,238,249,0.92)] backdrop-blur-[14px]">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-[15px] font-semibold text-[#243d66]">我的订单</h3>
              <Link href="/profile/orders" className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-[#6f89b0] transition-all duration-200 hover:bg-white/46 hover:text-[#3d5d89]">
                全部订单 <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center">
              {orderShortcuts.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/56 hover:shadow-[0_10px_18px_rgba(110,142,188,0.12)] active:scale-[0.97]"
                >
                  <item.icon className="h-5 w-5 text-[#7088ad]" />
                  <span className="text-[10px] text-[#7088ad]">{item.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-3 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(247,251,255,0.56)_100%)] p-1.5 shadow-[0_10px_24px_rgba(61,92,140,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-[rgba(230,238,249,0.92)] backdrop-blur-[14px]">
            {profileLinks.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-[18px] px-3 py-3 transition-all duration-200 hover:translate-x-0.5 hover:bg-white/58 hover:shadow-[0_8px_16px_rgba(110,142,188,0.10)] active:scale-[0.99] ${index !== profileLinks.length - 1 ? "border-b border-[#eef3fa]" : ""}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f4f8ff] text-[#5877a8]">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#243d66]">{item.label}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#8aa0c2]">
                  <span className="truncate">{item.value}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </div>
              </Link>
            ))}
          </section>

          {user && (
            <section className="mt-4">
              <UserAchievements />
            </section>
          )}

          {user && (
            <section className="mt-4">
              <Button
                variant="outline"
                className="w-full rounded-[18px] border-destructive/50 bg-white/56 text-destructive shadow-[0_8px_18px_rgba(215,33,60,0.06)] backdrop-blur-[10px] transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_12px_24px_rgba(215,33,60,0.14)] active:scale-[0.99]"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </Button>
            </section>
          )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}

