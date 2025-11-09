import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET() {
  try {
    console.log('开始测试Supabase连接...')
    
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY
    
    console.log('Supabase URL:', supabaseUrl ? '已设置' : '未设置')
    console.log('Service Key:', serviceKey ? '已设置' : '未设置')
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量未正确设置',
        supabaseUrl: !!supabaseUrl,
        serviceKey: !!serviceKey
      }, { status: 500 })
    }
    
    // 创建客户端
    const supabase = createServiceClient()
    
    // 简单测试：获取产品表信息
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase查询错误:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    console.log('Supabase连接成功!')
    return NextResponse.json({
      success: true,
      message: 'Supabase连接成功',
      data: data
    })
    
  } catch (error: any) {
    console.error('测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}