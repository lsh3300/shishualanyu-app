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
import { ShoppingBag, BookOpen, Heart, FileText, MapPin, MessageCircle, Settings, LogOut, User, Star, Trophy, TrendingUp, Gift, Bell } from "lucide-react"
import { useGlobalState } from "@/hooks/use-global-state"

export default function ProfilePage() {
  // 初始状态总是设置为false，确保服务器端和客户端首次渲染一致
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  
  // 获取全局状态中的未读消息和通知数量
  const { unreadMessages, unreadNotifications } = useGlobalState()

  // 在客户端渲染完成后，使用useEffect从localStorage获取实际的登录状态
  useEffect(() => {
    const savedLoggedInState = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(savedLoggedInState)
  }, [])

  // Mock user data
  const userData = {
    name: "张艺术",
    email: "zhang@example.com",
    avatar: "/placeholder.svg",
    signature: "热爱传统文化，专注蓝染艺术",
    stats: {
      orders: 12,
      courses: 8,
      favorites: 24,
      assignments: 5,
    },
  }

  const handleLoginRequired = () => {
    setShowLoginForm(true)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary/5 to-transparent pt-12 pb-6">
        <div className="px-4">
          <Card className="p-6">
            {isLoggedIn ? (
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

            {/* Stats */}
            {isLoggedIn && (
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{userData.stats.orders}</div>
                  <div className="text-xs text-muted-foreground">订单</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{userData.stats.courses}</div>
                  <div className="text-xs text-muted-foreground">课程</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{userData.stats.favorites}</div>
                  <div className="text-xs text-muted-foreground">收藏</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{userData.stats.assignments}</div>
                  <div className="text-xs text-muted-foreground">作业</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </header>

      {/* 会员卡片 */}
      {isLoggedIn && (
        <section className="px-4 mb-6">
          <CouponCard count={3} href="/profile/coupons" />
        </section>
      )}

      {/* 用户成就 */}
      {isLoggedIn && (
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
                <p className="text-xl font-bold text-primary">{userData.stats.courses}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <p className="text-sm font-medium text-foreground">学习天数</p>
                <p className="text-xl font-bold text-secondary">32</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground">收藏夹</p>
                <p className="text-xl font-bold text-accent">{userData.stats.favorites}</p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* 功能菜单 */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ProfileMenuItem href="/profile/orders" icon={ShoppingBag} title="我的订单" showArrow={false} onClick={isLoggedIn ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
          <ProfileMenuItem href="/profile/courses" icon={BookOpen} title="我的课程" showArrow={false} onClick={isLoggedIn ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
          <ProfileMenuItem href="/profile/favorites" icon={Heart} title="我的收藏" showArrow={false} onClick={isLoggedIn ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
          <ProfileMenuItem href="/profile/assignments" icon={FileText} title="我的作业" showArrow={false} onClick={isLoggedIn ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
        </div>

        <div className="space-y-3">
          <ProfileMenuItem 
            href="/messages" 
            icon={MessageCircle} 
            title="消息中心" 
            subtitle="查看所有消息"
            badge={unreadMessages > 0 ? unreadMessages : undefined}
            onClick={isLoggedIn ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
          <ProfileMenuItem 
            href="/notifications" 
            icon={Bell} 
            title="通知中心" 
            subtitle="查看所有通知"
            badge={unreadNotifications > 0 ? unreadNotifications : undefined}
            onClick={isLoggedIn ? undefined : handleLoginRequired} 
            className="bg-white hover:bg-primary/5 transition-colors" 
          />
          <ProfileMenuItem href="/profile/addresses" icon={MapPin} title="地址管理" onClick={isLoggedIn ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
          {!isLoggedIn && (
            <ProfileMenuItem href="/profile/coupons" icon={Gift} title="优惠券" subtitle="3张可用" onClick={handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
          )}
          <ProfileMenuItem href="/profile/support" icon={MessageCircle} title="联系客服" className="bg-white hover:bg-primary/5 transition-colors" />
          <ProfileMenuItem href="/profile/settings" icon={Settings} title="设置" onClick={isLoggedIn ? undefined : handleLoginRequired} className="bg-white hover:bg-primary/5 transition-colors" />
        </div>
      </section>

      {/* Logout */}
      {isLoggedIn && (
        <section className="px-4">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={() => {
              setIsLoggedIn(false)
              // 从localStorage中移除登录状态
              localStorage.removeItem('isLoggedIn')
            }}
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
                setIsLoggedIn(true)
                // 保存登录状态到localStorage
                localStorage.setItem('isLoggedIn', 'true')
                setShowLoginForm(false)
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
