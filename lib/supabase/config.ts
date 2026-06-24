const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()

if (!envSupabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Create .env.local with your own Supabase project URL.')
}

export const SUPABASE_URL = envSupabaseUrl
