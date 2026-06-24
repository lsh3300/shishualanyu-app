'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  GraduationCap,
  FileText,
  LucideIcon
} from 'lucide-react'

// 导航项类型
export interface AdminNavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
}

// 默认导航项配置
export const defaultNavItems: AdminNavItem[] = [
  {
    title: '仪表盘',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: '内容审核',
    href: '/admin/content-review',
    icon: Shield,
  },
  {
    title: '产品管理',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: '课程管理',
    href: '/admin/courses',
    icon: GraduationCap,
  },
  {
    title: '操作日志',
    href: '/admin/logs',
    icon: FileText,
  },
]

interface AdminNavProps {
  items?: AdminNavItem[]
  pendingReviewCount?: number
  onItemClick?: () => void
  className?: string
}

/**
 * 管理后台导航菜单组件
 */
export function AdminNav({
  items = defaultNavItems,
  pendingReviewCount = 0,
  onItemClick,
  className
}: AdminNavProps) {
  const pathname = usePathname()

  // 检查当前路由是否匹配
  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  // 获取导航项的徽章数量
  const getBadgeCount = (item: AdminNavItem) => {
    if (item.badge !== undefined) {
      return item.badge
    }
    // 内容审核页面显示待审核数量
    if (item.href === '/admin/content-review') {
      return pendingReviewCount
    }
    return 0
  }

  return (
    <nav className={cn('space-y-1', className)}>
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        const badgeCount = getBadgeCount(item)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{item.title}</span>
            {badgeCount > 0 && (
              <Badge 
                variant={active ? 'secondary' : 'destructive'} 
                className="h-5 min-w-5 px-1.5"
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * 获取当前活动的导航项
 */
export function getActiveNavItem(pathname: string, items: AdminNavItem[] = defaultNavItems): AdminNavItem | null {
  // 精确匹配 /admin
  if (pathname === '/admin') {
    return items.find(item => item.href === '/admin') || null
  }
  
  // 前缀匹配其他路由
  return items.find(item => item.href !== '/admin' && pathname.startsWith(item.href)) || null
}

/**
 * 检查路由是否匹配导航项
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin'
  }
  return pathname.startsWith(href)
}
