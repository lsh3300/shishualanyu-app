"use client"

import { useAdminAuth } from "@/hooks/use-admin-auth"
import { AlertCircle, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AdminRouteProps {
  children: React.ReactNode
  /** 是否显示无权限提示（默认为 false，直接重定向） */
  showAccessDenied?: boolean
}

/**
 * 管理员路由保护组件
 * 
 * 包装管理后台页面，统一进行权限检查
 * - 未登录用户 -> 重定向到登录页
 * - 普通用户 -> 重定向到首页或显示无权限提示
 * - 管理员用户 -> 显示子组件
 */
export function AdminRoute({ children, showAccessDenied = false }: AdminRouteProps) {
  const { isAdmin, isLoading, error, profile } = useAdminAuth(!showAccessDenied)

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">正在验证权限...</p>
        </div>
      </div>
    )
  }

  // 如果需要显示无权限提示
  if (showAccessDenied && !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">访问被拒绝</h1>
          <p className="text-muted-foreground mb-6">
            {error || '您没有权限访问此页面'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/">返回首页</Link>
            </Button>
            {!profile && (
              <Button asChild>
                <Link href="/auth">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 如果不是管理员且不显示提示，useAdminAuth 会自动重定向
  // 这里只是防止闪烁
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">正在跳转...</p>
        </div>
      </div>
    )
  }

  // 管理员用户，显示子组件
  return <>{children}</>
}

/**
 * 管理员权限检查 HOC
 * 
 * 用于包装需要管理员权限的页面组件
 */
export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { showAccessDenied?: boolean }
) {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminRoute showAccessDenied={options?.showAccessDenied}>
        <WrappedComponent {...props} />
      </AdminRoute>
    )
  }
}
