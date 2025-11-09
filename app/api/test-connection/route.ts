import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET() {
  try {
    console.log('开始测试Supabase连接...')
    
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
    
    console.log('Supabase URL:', supabaseUrl ? '已设置' : '未设置')
    console.log('Service Key:', supabaseServiceKey ? '已设置' : '未设置')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量未正确设置',
        details: {
          url: supabaseUrl ? '已设置' : '未设置',
          key: supabaseServiceKey ? '已设置' : '未设置'
        }
      }, { status: 500 })
    }
    
    // 创建Supabase客户端
    const supabase = createServiceClient()
    
    // 测试连接 - 尝试获取products表的数据
    const { data, error } = await supabase.from('products').select('*').limit(5)
    
    if (error) {
      console.error('Supabase查询错误:', error)
      
      // 如果是表不存在的错误，提供指导
      if (error.code === 'PGRST205') {
        return NextResponse.json({
          success: false,
          error: '数据库表不存在',
          message: '请在Supabase控制台中执行数据库初始化脚本',
          instructions: '请查看 supabase/database-setup.md 文件获取详细指导',
          details: error
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: false,
        error: '查询失败',
        details: error
      }, { status: 500 })
    }
    
    console.log('Supabase连接成功!')
    
    return NextResponse.json({
      success: true,
      message: 'Supabase连接成功',
      data: {
        productsCount: data.length,
        products: data
      }
    })
    
  } catch (error: any) {
    console.error('连接测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}