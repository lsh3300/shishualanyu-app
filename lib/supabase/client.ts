import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '@/lib/supabase/config'

// 单例模式 - 确保浏览器端只有一个 Supabase 实例
let supabaseInstance: SupabaseClient | null = null

export function createClient() {
	// 如果已有实例，直接返回
	if (supabaseInstance) {
		return supabaseInstance
	}

	const supabaseUrl = SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

	if (!supabaseAnonKey) {
		throw new Error('缺少Supabase环境变量。请检查.env.local文件中的NEXT_PUBLIC_SUPABASE_ANON_KEY。')
	}

	supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey)
	return supabaseInstance
}