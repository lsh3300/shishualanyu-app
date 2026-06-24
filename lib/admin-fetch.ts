import { createClient } from '@/lib/supabase/client'

/**
 * 获取当前有效的 access token
 * 优先使用缓存的 session，如果无效则刷新
 */
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  
  // 先尝试获取当前 session
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('获取 session 失败:', error)
    return null
  }
  
  if (session?.access_token) {
    // 检查 token 是否即将过期（5分钟内）
    const expiresAt = session.expires_at
    if (expiresAt && expiresAt * 1000 > Date.now() + 5 * 60 * 1000) {
      return session.access_token
    }
    
    // token 即将过期，尝试刷新
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    if (!refreshError && refreshData.session?.access_token) {
      return refreshData.session.access_token
    }
  }
  
  return session?.access_token || null
}

/**
 * 带认证的 fetch 函数，用于管理后台 API 请求
 * 自动添加 Authorization header
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken()
  
  const headers = new Headers(options.headers)
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else {
    console.warn('adminFetch: 无法获取 access token，请求可能会失败')
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include' // 确保发送 cookies
  })
}

/**
 * 带认证的 JSON fetch 函数
 */
export async function adminFetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await adminFetch(url, options)
  return response.json()
}
