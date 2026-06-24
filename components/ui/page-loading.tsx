"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

// 页面切换时的顶部进度条
export function PageLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 路由变化时开始加载
    setLoading(true)
    setProgress(30)

    const timer1 = setTimeout(() => setProgress(60), 100)
    const timer2 = setTimeout(() => setProgress(80), 200)
    const timer3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
    }, 400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname, searchParams])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className={cn(
          "h-full bg-primary transition-all duration-300 ease-out",
          progress === 100 && "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// 页面切换时的全屏加载遮罩（可选，用于较慢的页面）
export function PageLoadingOverlay() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9998] bg-background/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
