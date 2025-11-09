"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      // 如果用户未登录，重定向到登录页面
      if (!user) {
        router.push("/auth")
        return
      }

      // 检查用户是否为管理员（这里简化处理，实际应用中应该从后端获取）
      // 在实际应用中，你可能需要检查用户的角色或权限
      // 这里我们假设用户邮箱包含 "admin" 的为管理员
      const isAdmin = user.email?.includes("admin") || user.user_metadata?.role === "admin"
      
      if (!isAdmin) {
        // 如果不是管理员，重定向到主页
        router.push("/")
        return
      }

      setIsLoading(false)
    }

    checkAdminStatus()
  }, [user, router])

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">正在验证权限...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}