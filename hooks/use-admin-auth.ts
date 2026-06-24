'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole, UserStatus } from '@/types/database'

interface AdminProfile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
}

interface UseAdminAuthReturn {
  isAdmin: boolean
  isLoading: boolean
  profile: AdminProfile | null
  error: string | null
  checkAdminAccess: () => Promise<boolean>
}

/**
 * 管理员权限验证 Hook
 * 
 * 用于检查当前用户是否为管理员，并处理权限验证逻辑
 * 
 * @param redirectOnFail - 如果验证失败是否自动重定向
 * @returns 管理员状态和相关方法
 */
export function useAdminAuth(redirectOnFail: boolean = true): UseAdminAuthReturn {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 检查管理员权限
  const checkAdminAccess = useCallback(async (): Promise<boolean> => {
    // 如果认证还在加载中，等待
    if (authLoading) {
      return false
    }

    // 如果用户未登录
    if (!user) {
      setIsAdmin(false)
      setProfile(null)
      setError('未登录')
      
      if (redirectOnFail) {
        router.push('/auth?redirect=/admin')
      }
      return false
    }

    try {
      const supabase = createClient()
      
      // 获取用户 profile，包含角色和状态
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, role, status')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('获取用户资料失败:', profileError)
        setError('获取用户资料失败')
        setIsAdmin(false)
        
        if (redirectOnFail) {
          router.push('/')
        }
        return false
      }

      // 检查用户状态是否正常
      if (profileData.status === 'disabled') {
        setError('账户已被禁用')
        setIsAdmin(false)
        setProfile(null)
        
        if (redirectOnFail) {
          router.push('/')
        }
        return false
      }

      // 检查是否为管理员
      if (profileData.role !== 'admin') {
        setError('无管理员权限')
        setIsAdmin(false)
        setProfile(profileData as AdminProfile)
        
        if (redirectOnFail) {
          router.push('/')
        }
        return false
      }

      // 验证通过
      setIsAdmin(true)
      setProfile(profileData as AdminProfile)
      setError(null)
      return true

    } catch (err) {
      console.error('权限验证失败:', err)
      setError('权限验证失败')
      setIsAdmin(false)
      
      if (redirectOnFail) {
        router.push('/')
      }
      return false
    }
  }, [user, authLoading, router, redirectOnFail])

  // 初始化时检查权限
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await checkAdminAccess()
      setIsLoading(false)
    }

    // 只有在认证加载完成后才检查
    if (!authLoading) {
      init()
    }
  }, [authLoading, checkAdminAccess])

  return {
    isAdmin,
    isLoading: isLoading || authLoading,
    profile,
    error,
    checkAdminAccess
  }
}

/**
 * 检查用户是否为管理员（纯函数版本，用于服务端或 API）
 * 
 * @param userId - 用户 ID
 * @returns 是否为管理员
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return data.role === 'admin' && data.status === 'active'
  } catch {
    return false
  }
}

/**
 * 获取用户角色
 * 
 * @param userId - 用户 ID
 * @returns 用户角色或 null
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return data.role as UserRole
  } catch {
    return null
  }
}
