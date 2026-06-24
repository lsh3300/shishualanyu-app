"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = "/auth" }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasRedirectedRef = useRef(false)

  const currentPath = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, searchParams])

  const authRedirectUrl = useMemo(() => {
    if (redirectTo !== "/auth") return redirectTo
    return `/auth?view=login&redirectTo=${encodeURIComponent(currentPath)}`
  }, [redirectTo, currentPath])

  useEffect(() => {
    if (!loading && !user) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true
        toast({
          title: "请先登录",
          description: "该功能需要登录后才能使用",
          variant: "destructive",
        })
      }
      router.push(authRedirectUrl)
    }
  }, [user, loading, router, authRedirectUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}