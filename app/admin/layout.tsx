'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AdminRoute } from '@/components/auth/admin-route'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { adminFetch } from '@/lib/admin-fetch'
import {
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Shield,
  Users,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const navItems = [
  { title: '数据总览', href: '/admin', icon: LayoutDashboard },
  { title: '用户管理', href: '/admin/users', icon: Users },
  { title: '内容审核', href: '/admin/content-review', icon: Shield, hasBadge: true },
  { title: '商品管理', href: '/admin/products', icon: Package },
  { title: '课程管理', href: '/admin/courses', icon: GraduationCap },
  { title: '操作日志', href: '/admin/logs', icon: FileText },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { profile } = useAdminAuth(false)
  const { signOut } = useAuth()
  const [pendingReviewCount, setPendingReviewCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await adminFetch('/api/admin/content?status=pending&pageSize=1')
        if (!response.ok) return

        const data = await response.json()
        setPendingReviewCount(data.data?.pagination?.total || 0)
      } catch (error) {
        console.error('Failed to fetch pending review count:', error)
      }
    }

    fetchPendingCount()
    const timer = window.setInterval(fetchPendingCount, 60000)
    return () => window.clearInterval(timer)
  }, [])

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href))

  const handleSignOut = async () => {
    await signOut()
  }

  const profileName = profile?.full_name || profile?.username || '管理员'
  const profileInitial = profileName.charAt(0) || 'A'

  const AdminMenu = ({ compact = false }: { compact?: boolean }) => (
    <div className="space-y-4">
      <div className={cn('rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[0_16px_36px_rgba(61,92,140,0.10)] backdrop-blur-[16px]', compact && 'shadow-none')}>
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-white/80 shadow-sm">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{profileInitial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[#274166]">{profileName}</div>
            <div className="text-xs text-[#7890b1]">后台管理账号</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <Button variant="outline" className="w-full rounded-2xl border-[#d9e6f6] bg-white/90">
              <Home className="mr-2 h-4 w-4" />
              返回前台
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full rounded-2xl border-[#f0d8da] bg-white/90 text-rose-600 hover:bg-rose-50 hover:text-rose-600"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出
          </Button>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/80 bg-white/78 p-2 shadow-[0_16px_36px_rgba(61,92,140,0.10)] backdrop-blur-[16px]">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm transition-all',
                active
                  ? 'bg-[linear-gradient(135deg,#1f3f70_0%,#315a91_100%)] text-white shadow-[0_12px_22px_rgba(42,78,126,0.22)]'
                  : 'text-[#4b6489] hover:bg-[#f5f9ff] hover:text-[#223f69]'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-2xl',
                  active ? 'bg-white/14 text-white' : 'bg-[#edf4ff] text-[#5d7fad]'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1 font-medium">{item.title}</span>
              {item.hasBadge && pendingReviewCount > 0 ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    'min-w-6 rounded-full px-2 text-[11px]',
                    active ? 'bg-white/18 text-white' : 'bg-rose-100 text-rose-700'
                  )}
                >
                  {pendingReviewCount > 99 ? '99+' : pendingReviewCount}
                </Badge>
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <AdminRoute>
      <div className="page-background-home-echo min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_40%)] text-slate-900">
        <div className="mx-auto min-h-[100dvh] w-full max-w-5xl">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-[rgba(241,247,255,0.86)] backdrop-blur-xl">
            <div className="px-4 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#1f3f70_0%,#315a91_100%)] text-white shadow-[0_12px_24px_rgba(42,78,126,0.24)]">
                  <Shield className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium tracking-[0.16em] text-[#6f89b0]">ADMIN CONSOLE</div>
                  <h1
                    className="mt-1 text-[1.2rem] font-semibold text-[#264268]"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    世说蓝语后台
                  </h1>
                  <p className="mt-1 text-[12px] text-[#6f87aa]">
                    现在按手机外框内页的方式展示，方便直接演示后台闭环。
                  </p>
                </div>

                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-2xl border-white/80 bg-white/80 shadow-sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[88vw] max-w-sm border-l-0 bg-[#eef5ff] p-4">
                    <div className="pt-8">
                      <AdminMenu compact />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.76)_0%,rgba(244,249,255,0.86)_100%)] p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[14px]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/80">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{profileInitial}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#264268]">{profileName}</div>
                    <div className="text-[12px] text-[#7b92b4]">后台入口已切换为移动端演示视图</div>
                  </div>
                  {pendingReviewCount > 0 ? (
                    <Link href="/admin/content-review">
                      <Badge className="rounded-full bg-rose-500 px-2.5 py-1 text-white hover:bg-rose-500">
                        待审 {pendingReviewCount > 99 ? '99+' : pendingReviewCount}
                      </Badge>
                    </Link>
                  ) : null}
                </div>

                <div className="-mx-1 mt-4 overflow-x-auto pb-1">
                  <div className="flex min-w-max gap-2 px-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-medium transition-all',
                            active
                              ? 'border-[#28466f] bg-[#28466f] text-white shadow-[0_8px_18px_rgba(42,78,126,0.18)]'
                              : 'border-[#dce8f6] bg-white/88 text-[#52709b] hover:border-[#bfd3eb] hover:text-[#274166]'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.title}</span>
                          {item.hasBadge && pendingReviewCount > 0 ? (
                            <span
                              className={cn(
                                'rounded-full px-1.5 py-0.5 text-[10px]',
                                active ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                              )}
                            >
                              {pendingReviewCount > 99 ? '99+' : pendingReviewCount}
                            </span>
                          ) : null}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-4">
            <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_0%,rgba(248,251,255,0.92)_100%)] p-4 shadow-[0_18px_42px_rgba(61,92,140,0.10)] backdrop-blur-[16px] sm:p-5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}
