import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '@/lib/supabase/config'

export function getSupabaseClient() {
  const supabaseUrl = SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('缺少Supabase环境变量。请检查.env.local文件中的NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY。')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// 服务端客户端（仅在API路由中使用）
export const createServiceClient = () => {
  const supabaseUrl = SUPABASE_URL
  // 暂时使用匿名密钥，因为服务角色密钥无效
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!serviceKey) {
    throw new Error('缺少Supabase密钥。请检查.env.local文件中的NEXT_PUBLIC_SUPABASE_ANON_KEY。');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}