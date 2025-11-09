import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    const supabase = createServiceClient()
    
    // 测试基本连接
    const { data, error } = await supabase.from('products').select('count').limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error
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
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}