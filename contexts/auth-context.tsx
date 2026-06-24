"use client"

import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session, SupabaseClient } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [clientInitError, setClientInitError] = useState<Error | null>(null)

  // 优化：缓存 session，避免重复调用 getSession
  const sessionRef = useRef<Session | null>(null)

  // 创建 Supabase 客户端实例
  const supabase = useMemo<SupabaseClient | null>(() => {
    try {
      return createClient()
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Supabase 客户端初始化失败")
      setClientInitError(e)
      return null
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    // 获取初始会话
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      sessionRef.current = session
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        sessionRef.current = session
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!supabase) {
      return {
        error:
          clientInitError ||
          new Error("认证服务未正确配置：缺少 Supabase 环境变量，请联系管理员。")
      }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return {
        error:
          clientInitError ||
          new Error("认证服务未正确配置：缺少 Supabase 环境变量，请联系管理员。")
      }
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: clientInitError || new Error("认证服务未正确配置") }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: clientInitError || new Error("认证服务未正确配置") }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  // 优化：使用缓存的 session，避免每次都调用 getSession
  const getToken = useCallback(async () => {
    if (!supabase) {
      return null
    }
    // 先检查缓存的 session
    if (sessionRef.current?.access_token) {
      // 检查 token 是否即将过期（5分钟内）
      const expiresAt = sessionRef.current.expires_at
      if (expiresAt && expiresAt * 1000 > Date.now() + 5 * 60 * 1000) {
        return sessionRef.current.access_token
      }
    }
    // 缓存无效或即将过期，重新获取
    const { data: { session } } = await supabase.auth.getSession()
    sessionRef.current = session
    return session?.access_token || null
  }, [supabase])

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}