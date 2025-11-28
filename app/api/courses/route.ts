import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const isFree = searchParams.get('is_free')
    const limit = parseInt(searchParams.get('limit') || '100') // 增加默认limit到100
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (isFree !== null) {
      query = query.eq('is_free', isFree === 'true')
    }

    query = query.range(offset, offset + limit - 1)

    const { data: courses, error, count } = await query

    if (error) {
      console.error('获取课程列表失败:', error)
      return NextResponse.json({ error: '获取课程列表失败' }, { status: 500 })
    }

    return NextResponse.json({
      courses: courses || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('GET /api/courses 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
