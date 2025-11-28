import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '@/lib/supabase/config'

export function createClient() {
	const supabaseUrl = SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

	if (!supabaseAnonKey) {
		throw new Error('缺少Supabase环境变量。请检查.env.local文件中的NEXT_PUBLIC_SUPABASE_ANON_KEY。')
	}

	return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}