import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_URL } from '@/lib/supabase/config'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!supabaseAnonKey) {
    throw new Error('缺少Supabase环境变量。请检查.env.local文件中的NEXT_PUBLIC_SUPABASE_ANON_KEY。')
  }

  return createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// 服务端客户端（使用service key，绕过RLS）
export function createServiceClient() {
  const supabaseUrl = SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY?.trim()

  if (!supabaseServiceKey) {
    throw new Error('缺少Supabase环境变量。请检查.env.local文件中的SUPABASE_SERVICE_KEY。')
  }

  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 别名导出，兼容不同的导入方式
export const createServerClient = createClient