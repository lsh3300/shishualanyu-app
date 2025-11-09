import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('Testing detailed Supabase connection...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment variables loaded')
    
    // 直接创建客户端，不使用我们的包装函数
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('Supabase client created')
    
    // 测试基本连接
    const { data, error } = await supabase.from('products').select('count').limit(1)
    
    console.log('Query executed')
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error,
          hint: error.hint,
          code: error.code
        }, 
        { status: 500 }
      )
    }
    
    console.log('Supabase connection successful')
    return NextResponse.json(
      { 
        success: true, 
        message: 'Supabase连接成功',
        data: data
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '未知错误',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}