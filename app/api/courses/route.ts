import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export const revalidate = 120

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const isFree = searchParams.get('is_free')
    const debug = searchParams.get('debug') === 'true'
    
    // 支持 page/limit 分页参数（优先）或 offset/limit 参数（向后兼容）
    const limit = parseInt(searchParams.get('limit') || '9')
    const pageParam = searchParams.get('page')
    const offsetParam = searchParams.get('offset')
    
    // 如果提供了 page 参数，使用 page-based 分页；否则使用 offset-based
    let page: number
    let offset: number
    
    if (pageParam !== null) {
      page = Math.max(1, parseInt(pageParam) || 1)
      offset = (page - 1) * limit
    } else {
      offset = parseInt(offsetParam || '0')
      page = Math.floor(offset / limit) + 1
    }

    // 首先检查表中有多少数据（调试用）
    if (debug) {
      const { data: allCourses, error: countError } = await supabase
        .from('courses')
        .select('id, title, status, slug')
      
      console.log('📊 数据库中所有课程:', allCourses?.length || 0)
      console.log('📋 课程列表:', allCourses)
      
      return NextResponse.json({
        debug: true,
        totalInDb: allCourses?.length || 0,
        courses: allCourses || [],
        error: countError?.message
      })
    }

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // 只有当 status 字段存在时才过滤
    // 暂时移除 status 过滤，以便能获取所有课程
    // query = query.eq('status', 'published')

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

    const total = count || 0
    const returnedCount = courses?.length || 0
    // hasMore 为 true 当：返回的数据等于 limit 且还有更多数据
    const hasMore = returnedCount === limit && (offset + returnedCount) < total

    const response = NextResponse.json({
      courses: courses || [],
      total,
      page,
      limit,
      offset,
      hasMore
    })
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('GET /api/courses 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
