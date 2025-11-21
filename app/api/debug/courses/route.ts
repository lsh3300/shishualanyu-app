import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // 获取所有课程
    const { data: courses, error, count } = await supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('查询课程失败:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      count,
      courses: courses || []
    })
  } catch (error: any) {
    console.error('调试课程 API 错误:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
