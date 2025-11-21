import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
    
    if (!supabaseUrl) {
      return NextResponse.json({ 
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable',
        status: 'config_error'
      }, { status: 500 })
    }
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Missing SUPABASE_SERVICE_KEY environment variable',
        status: 'config_error'
      }, { status: 500 })
    }
    
    console.log('Environment variables found:', {
      supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      hasServiceKey: !!supabaseServiceKey
    })
    
    // 测试数据库连接
    const supabase = createServerClient()
    
    // 简单的连接测试
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error.message,
        status: 'connection_error'
      }, { status: 500 })
    }
    
    // 检查表是否存在
    const tables = ['profiles', 'products', 'cart_items', 'orders', 'courses']
    const tableStatus: Record<string, { exists: boolean; error: string | null }> = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        tableStatus[table] = {
          exists: !error,
          error: error?.message || null
        }
      } catch (err) {
        tableStatus[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful',
      config: {
        supabaseUrl: supabaseUrl.substring(0, 30) + '...',
        hasServiceKey: true
      },
      tables: tableStatus,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({ 
      error: 'Server error during Supabase test',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'server_error'
    }, { status: 500 })
  }
}
