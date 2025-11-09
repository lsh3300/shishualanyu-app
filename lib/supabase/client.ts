import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少Supabase环境变量。请检查.env.local文件中的NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY。')
}

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// 默认客户端实例
export const supabase = createClient()