"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function PublicRoute({ children, redirectTo = "/" }: PublicRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  useEffect(() => {
    if (loading || user || pathname !== "/auth") return

    try {
      const bypassAuthOnce = window.sessionStorage.getItem("sslyapp-auth-bypass-once")
      if (bypassAuthOnce === "1") {
        window.sessionStorage.removeItem("sslyapp-auth-bypass-once")
        router.replace("/")
      }
    } catch {
      // ignore storage failures
    }
  }, [loading, pathname, router, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
}
