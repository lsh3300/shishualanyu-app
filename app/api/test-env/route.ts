import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing environment variables...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少NEXT_PUBLIC_SUPABASE_URL环境变量'
        }, 
        { status: 500 }
      )
    }
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少Supabase服务端密钥环境变量'
        }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: '环境变量加载成功',
        supabaseUrl: supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        serviceKeyLength: supabaseServiceKey.length
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '未知错误',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}