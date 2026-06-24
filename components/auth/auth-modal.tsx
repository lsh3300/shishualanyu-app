'use client'

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/ui/login-form"
import { RegisterForm } from "@/components/ui/register-form"
import { ResetPasswordForm } from "@/components/ui/reset-password-form"
import { NewPasswordForm } from "@/components/ui/new-password-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function AuthModal() {
  const [currentView, setCurrentView] = useState<"login" | "register" | "reset" | "new-password">("login")
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // 检查URL参数，如果有token和email参数，则显示新密码表单
  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")
    const view = searchParams.get("view")
    
    if (token && email) {
      setCurrentView("new-password")
      return
    }

    if (view === "register") {
      setCurrentView("register")
      return
    }

    if (view === "reset") {
      setCurrentView("reset")
      return
    }

    if (view === "login") {
      setCurrentView("login")
    }
  }, [searchParams])

  // 如果用户已登录，重定向
  useEffect(() => {
    if (!loading && user) {
      const redirectTo = searchParams.get("redirectTo")
      if (redirectTo) {
        try {
          router.push(decodeURIComponent(redirectTo))
          return
        } catch {
          router.push(redirectTo)
          return
        }
      }
      router.push("/")
    }
  }, [user, loading, router, searchParams])

  const handleAuthSuccess = () => {
    // 身份验证成功后，关闭模态框或重定向
    const redirectTo = searchParams.get("redirectTo")
    if (redirectTo) {
      try {
        router.push(decodeURIComponent(redirectTo))
        return
      } catch {
        router.push(redirectTo)
        return
      }
    }
    router.push("/")
  }

  const handleBack = () => {
    const redirectTo = searchParams.get("redirectTo")
    if (redirectTo) {
      try {
        router.push(decodeURIComponent(redirectTo))
        return
      } catch {
        router.push(redirectTo)
        return
      }
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push("/")
  }

  const switchToRegister = () => {
    setCurrentView("register")
    // 更新URL参数
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('view', 'register')
    router.replace(`/auth?${newParams.toString()}`)
  }

  const switchToLogin = () => {
    setCurrentView("login")
    // 更新URL参数
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('view', 'login')
    router.replace(`/auth?${newParams.toString()}`)
  }

  const switchToReset = () => {
    setCurrentView("reset")
    // 更新URL参数
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('view', 'reset')
    router.replace(`/auth?${newParams.toString()}`)
  }

  const handleContinueAsGuest = () => {
    try {
      window.sessionStorage.setItem("sslyapp-welcome-bypass-once", "1")
      window.sessionStorage.setItem("sslyapp-auth-bypass-once", "1")
    } catch {
      // ignore storage failures and still continue
    }

    if (typeof window !== "undefined") {
      window.location.replace("/")
    }
  }

  // 如果正在加载身份验证状态，显示加载指示器
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">正在验证身份...</p>
        </div>
      </div>
    )
  }

  // 如果用户已登录，显示加载状态
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">登录成功，正在跳转...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.75),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(196,210,255,0.34),transparent_30%)]" />
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2 text-gray-600 hover:bg-white/50 hover:text-gray-800">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>
        
        <div className="overflow-hidden rounded-[28px] border border-white/50 bg-white/85 shadow-[0_24px_60px_rgba(66,88,140,0.18)] backdrop-blur-xl">
          {currentView === "login" && (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={switchToRegister}
              onSwitchToReset={switchToReset}
              onContinueAsGuest={handleContinueAsGuest}
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
        
        {/* 装饰性元素 */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-200/30 rounded-full blur-xl"></div>
      </div>
    </div>
  )
}
