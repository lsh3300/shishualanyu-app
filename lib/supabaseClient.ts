import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '@/lib/supabase/config'

// 单例模式 - 确保浏览器端只有一个 Supabase 实例
let browserClient: SupabaseClient | null = null

// 获取客户端 Supabase 实例（单例）
export function getSupabaseClient() {
	// 如果已有实例，直接返回
	if (browserClient) {
		return browserClient
	}

	const supabaseUrl = SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

	if (!supabaseAnonKey) {
		throw new Error('缺少Supabase环境变量。请检查.env.local文件中的NEXT_PUBLIC_SUPABASE_ANON_KEY。')
	}

	browserClient = createClient(supabaseUrl, supabaseAnonKey)
	return browserClient
}

// 服务端客户端（仅在API路由中使用）
export const createServiceClient = () => {
	const supabaseUrl = SUPABASE_URL
	// 使用服务角色密钥
	const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim();
	if (!serviceKey) {
		throw new Error('缺少Supabase服务密钥。请检查.env.local文件中的SUPABASE_SERVICE_KEY。');
	}
	return createClient(supabaseUrl, serviceKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		},
		db: {
			schema: 'public'
		},
		global: {
			headers: {
				'apikey': serviceKey
			}
		}
	});
}