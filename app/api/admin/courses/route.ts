import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withAdminAuth, type AdminAuthResult } from '@/lib/admin/auth-middleware'
import { 
  successResponse, 
  errorResponse, 
  parsePaginationParams, 
  calculatePagination 
} from '@/lib/admin/api-response'

/**
 * 课程列表项类型
 */
interface CourseListItem {
  id: string
  title: string
  description: string | null
  instructor: string
  duration: number
  price: number
  image_url: string | null
  category: string
  created_at: string
  updated_at: string
}

/**
 * 课程列表响应
 */
interface CoursesListResponse {
  courses: CourseListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * GET /api/admin/courses
 * 
 * 获取课程列表，支持分页、搜索、筛选
 */
export const GET = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const { page, pageSize, from, to } = parsePaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const instructor = searchParams.get('instructor') || ''

    // 构建查询
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })

    // 搜索过滤
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 分类过滤
    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // 讲师过滤
    if (instructor) {
      query = query.ilike('instructor', `%${instructor}%`)
    }

    const { data: courses, count, error: queryError } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (queryError) {
      console.error('查询课程失败:', queryError)
      return errorResponse('获取课程列表失败', 500, 'DATABASE_ERROR')
    }

    const total = count || 0
    const pagination = calculatePagination(page, pageSize, total)

    const response: CoursesListResponse = {
      courses: (courses || []) as CourseListItem[],
      pagination
    }

    return successResponse(response)

  } catch (error) {
    console.error('获取课程列表失败:', error)
    return errorResponse('获取课程列表失败', 500, 'INTERNAL_ERROR')
  }
})

/**
 * POST /api/admin/courses
 * 
 * 创建新课程
 */
export const POST = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // 验证必填字段
    if (!body.title || body.title.trim() === '') {
      return errorResponse('课程标题不能为空', 400, 'INVALID_PARAMS')
    }
    if (!body.instructor || body.instructor.trim() === '') {
      return errorResponse('讲师名称不能为空', 400, 'INVALID_PARAMS')
    }
    if (body.duration === undefined || body.duration < 0) {
      return errorResponse('课程时长无效', 400, 'INVALID_PARAMS')
    }
    if (body.price === undefined || body.price < 0) {
      return errorResponse('课程价格无效', 400, 'INVALID_PARAMS')
    }
    if (!body.category || body.category.trim() === '') {
      return errorResponse('课程分类不能为空', 400, 'INVALID_PARAMS')
    }

    // 创建课程
    const { data: course, error: insertError } = await supabase
      .from('courses')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        instructor: body.instructor.trim(),
        duration: body.duration,
        price: body.price,
        image_url: body.image_url || null,
        category: body.category.trim()
      })
      .select()
      .single()

    if (insertError) {
      console.error('创建课程失败:', insertError)
      return errorResponse('创建课程失败', 500, 'DATABASE_ERROR')
    }

    return successResponse(course, '课程创建成功', 201)

  } catch (error) {
    console.error('创建课程失败:', error)
    return errorResponse('创建课程失败', 500, 'INTERNAL_ERROR')
  }
})
