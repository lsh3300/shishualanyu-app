"use client"

import { ReactNode, useRef, useEffect } from "react"
import { SWRConfig } from "swr"
import { AuthProvider } from "@/contexts/auth-context"
import { useAuth } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/hooks/use-favorites"

interface AuthLayoutProps {
  children: ReactNode
}

function SWRUserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // 使用 ref 保持缓存 Map 实例不变，避免页面切换时缓存丢失
  const cacheRef = useRef(new Map())
  const prevUserIdRef = useRef<string | undefined>(undefined)

  // 仅当用户登录/登出时清空缓存，页面导航间缓存保留
  useEffect(() => {
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== user?.id) {
      cacheRef.current = new Map()
    }
    prevUserIdRef.current = user?.id
  }, [user?.id])

  return (
    <SWRConfig
      value={{
        provider: () => cacheRef.current,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 30000,
      }}
    >
      {children}
    </SWRConfig>
  )
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <SWRUserProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </SWRUserProvider>
    </AuthProvider>
  )
}