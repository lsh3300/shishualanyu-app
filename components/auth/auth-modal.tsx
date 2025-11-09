"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/ui/login-form"
import { RegisterForm } from "@/components/ui/register-form"
import { ResetPasswordForm } from "@/components/ui/reset-password-form"
import { NewPasswordForm } from "@/components/ui/new-password-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

export function AuthModal() {
  const [currentView, setCurrentView] = useState<"login" | "register" | "reset" | "new-password">("login")
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // 检查URL参数，如果有token和email参数，则显示新密码表单
  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")
    
    if (token && email) {
      setCurrentView("new-password")
    }
  }, [searchParams])

  // 如果用户已登录，重定向到主页
  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleAuthSuccess = () => {
    // 身份验证成功后，关闭模态框或重定向
    router.push("/")
  }

  const switchToRegister = () => {
    setCurrentView("register")
  }

  const switchToLogin = () => {
    setCurrentView("login")
  }

  const switchToReset = () => {
    setCurrentView("reset")
  }

  // 如果正在加载身份验证状态，显示加载指示器
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 如果用户已登录，不显示任何内容（将重定向）
  if (user) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        {currentView === "login" && (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={switchToRegister}
          />
        )}
        
        {currentView === "register" && (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
        
        {currentView === "reset" && (
          <ResetPasswordForm
            onSuccess={switchToLogin}
            onBackToLogin={switchToLogin}
          />
        )}
        
        {currentView === "new-password" && (
          <NewPasswordForm
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  )
}