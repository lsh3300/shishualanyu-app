'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // 重定向到统一的认证页面
    const redirectTo = searchParams.get('redirectTo')
    const authUrl = redirectTo 
      ? `/auth?view=login&redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth?view=login'
    
    router.replace(authUrl)
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}