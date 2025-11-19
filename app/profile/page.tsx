"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { LoginForm } from "@/components/ui/login-form"
import { RegisterForm } from "@/components/ui/register-form"
import { ProfileMenuItem } from "@/components/ui/profile-menu-item"
import { CouponCard } from "@/components/ui/coupon-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, BookOpen, Heart, FileText, MapPin, MessageCircle, Settings, LogOut, User, Star, Trophy, TrendingUp, Gift, Bell, ShoppingCart } from "lucide-react"
import { useGlobalState } from "@/hooks/use-global-state"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, loading, signOut, getToken } = useAuth()
  const router = useRouter()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [userStats, setUserStats] = useState({
    orders: 0,
    courses: 0,
    favorites: 0,
    assignments: 0,
    learningDays: 0,
    completedCourses: 0
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [fetchTrigger, setFetchTrigger] = useState(0) // 添加一个触发器状态
  
  // 添加一个简单的测试，确保组件正在渲染
  console.log('ProfilePage component rendering, user:', user ? 'User exists' : 'No user')
  
  // 获取全局状态中的未读消息和通知数量
  const { unreadMessages, unreadNotifications } = useGlobalState()

  // 获取用户统计数据
  useEffect(() => {
    console.log('useEffect triggered, user:', user ? 'User exists' : 'No user')
    
    const fetchUserStats = async () => {
    console.log('fetchUserStats called, user:', user ? 'User exists' : 'No user')
    
    if (!user) {
      console.log('No user found, skipping stats fetch')
      return
    }
    
    setStatsLoading(true)
    try {
        // 获取访问令牌
        const token = await getToken()
        
        console.log('Token retrieved:', token ? 'Token exists' : 'No token')
        
        if (!token) {
          console.error('无法获取访问令牌')
          return
        }
        
        console.log('Making request to /api/user/stats')
        const response = await fetch('/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Response data:', data)
          const newStats = {
            orders: data.stats.orders || 0,
            courses: data.stats.courses || 0,
            favorites: data.stats.favorites || 0,
            assignments: data.stats.courses || 0, // 暂时使用课程数作为作业数
            learningDays: data.stats.learningDays || 0,
            completedCourses: data.stats.completedCourses || 0
          }
          console.log('Setting user stats to:', newStats)
          setUserStats(newStats)
        } else {
          console.error('获取用户统计数据失败:', response.status)
          const errorText = await response.text()
          console.error('Error response:', errorText)
        }
      } catch (error) {
        console.error('获取用户统计数据出错:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchUserStats()
  }, [user, getToken, fetchTrigger]) // 添加fetchTrigger到依赖项
  
  // 监听统计数据更新事件
  useEffect(() => {
    const handleStatsUpdate = () => {
      console.log('Stats update event received, refreshing stats')
      setFetchTrigger(prev => prev + 1)
    }

    // 添加事件监听器
    window.addEventListener('statsUpdateRequired', handleStatsUpdate)
    
    // 清理函数
    return () => {
      window.removeEventListener('statsUpdateRequired', handleStatsUpdate)
    }
  }, [])

  // 用户数据
  const userData = {
    name: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "用户",
    email: user?.email || "",
    avatar: user?.user_metadata?.avatar_url || "",
    signature: "",
    stats: userStats,
  }

  const handleLoginRequired = () => {
    setShowLoginForm(true)
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary/5 to-transparent pt-12 pb-6">
        <div className="px-4">
          <Card className="p-6">
            {user ? (
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                  <AvatarFallback className="text-lg">{userData.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground mb-1">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{userData.email}</p>
                  <p className="text-sm text-foreground">{userData.signature}</p>
                </div>
                <Button variant="outline" size="sm">
                  编辑
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <div className="h-8 w-8 text-muted-foreground">👤</div>
                </div>
                <h2 className="text-lg font-medium text-foreground mb-2">欢迎来到个人中心</h2>
                <p className="text-sm text-muted-foreground text-center mb-4">登录后可以查看您的个人信息和使用更多功能</p>
                <Button onClick={handleLoginRequired} className="bg-primary hover:bg-primary/90">
                  立即登录
                </Button>
              </div>
            )}

            {/* Stats - 只在用户登录时显示统计 */}
            {user && (
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{statsLoading ? "..." : userStats.orders}</div>
                  <div className="text-xs text-muted-foreground">订单</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{statsLoading ? "..." : userStats.courses}</div>
                  <div className="text-xs text-muted-foreground">课程</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{statsLoading ? "..." : userStats.favorites}</div>
                  <div className="text-xs text-muted-foreground">收藏</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{statsLoading ? "..." : userStats.assignments}</div>
                  <div className="text-xs text-muted-foreground">作业</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </header>

      {/* 会员卡片 - 只在用户登录时显示 */}
      {user && (
        <section className="px-4 mb-6">
          <CouponCard count={3} href="/profile/coupons" />
        </section>
      )}

      {/* 用户成就 - 只在用户登录时显示 */}
      {user && (
        <section className="px-4 mb-6">
          <Card className="p-5 border-0 bg-gradient-to-br from-primary/5 to-background shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary" />
              最近成就
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 rounded-lg p-3 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">完成课程</p>
                <p className="text-xl font-bold text-primary">{statsLoading ? "..." : userStats.completedCourses}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <p className="text-sm font-medium text-foreground">学习天数</p>
                <p className="text-xl font-bold text-secondary">{statsLoading ? "..." : userStats.learningDays}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground">收藏夹</p>
                <p className="text-xl font-bold text-accent">{statsLoading ? "..." : userStats.favorites}</p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* 功能菜单 */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ProfileMenuItem 
            href="/profile/orders" 
            icon={ShoppingBag} 
            title="我的订单" 
            showArrow={false} 
            badge={statsLoading ? "..." : userStats.orders}
            onClick={user ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
          <ProfileMenuItem
            href="/cart"
            icon={ShoppingCart}
            title="我的购物车"
            showArrow={false}
            onClick={user ? undefined : handleLoginRequired}
            className="bg-white hover:bg-primary/5 transition-colors"
          />
          <ProfileMenuItem 
            href="/profile/courses" 
            icon={BookOpen} 
            title="我的课程" 
            showArrow={false} 
            badge={statsLoading ? "..." : userStats.courses}
            onClick={user ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
          <ProfileMenuItem 
            href="/profile/favorites" 
            icon={Heart} 
            title="我的收藏" 
            showArrow={false} 
            badge={statsLoading ? "..." : userStats.favorites}
            onClick={user ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
          <ProfileMenuItem 
            href="/profile/assignments" 
            icon={FileText} 
            title="我的作业" 
            showArrow={false} 
            badge={statsLoading ? "..." : userStats.assignments}
            onClick={user ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
        </div>

        <div className="space-y-3">
          <ProfileMenuItem 
            href="/messages" 
            icon={MessageCircle} 
            title="消息中心" 
            subtitle="查看所有消息"
            badge={unreadMessages > 0 ? unreadMessages : undefined}
            onClick={user ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
          <ProfileMenuItem 
            href="/notifications" 
            icon={Bell} 
            title="通知中心" 
            subtitle="查看所有通知"
            badge={unreadNotifications > 0 ? unreadNotifications : undefined}
            onClick={user ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
          <ProfileMenuItem href="/profile/addresses" icon={MapPin} title="地址管理" onClick={user ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
          {!user && (
            <ProfileMenuItem href="/profile/coupons" icon={Gift} title="优惠券" subtitle="0张可用" onClick={handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
          )}
          <ProfileMenuItem href="/profile/support" icon={MessageCircle} title="联系客服" className="bg-white hover:bg-primary/5 transition-colors" />
          <ProfileMenuItem href="/profile/settings" icon={Settings} title="设置" onClick={user ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
        </div>
      </section>

      {/* Logout */}
      {user && (
        <section className="px-4">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </section>
      )}

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">登录账户</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLoginForm(false)}>
                关闭
              </Button>
            </div>
            <div className="p-4">
              <LoginForm onSuccess={() => {
                setShowLoginForm(false)
                // 登录成功后，useAuth会自动更新user状态
                // 不需要手动设置isLoggedIn
              }} onSwitchToRegister={() => {
                // 简化实现，暂时不支持注册切换
                alert('注册功能暂未实现')
              }} />
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
