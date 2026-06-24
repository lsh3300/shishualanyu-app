import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withAdminAuth, type AdminAuthResult } from '@/lib/admin/auth-middleware'
import { successResponse, errorResponse } from '@/lib/admin/api-response'

/**
 * GET /api/admin/courses/[id]
 * 
 * 获取单个课程详情
 */
export const GET = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return errorResponse('课程 ID 不能为空', 400, 'INVALID_PARAMS')
    }

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('课程不存在', 404, 'NOT_FOUND')
      }
      console.error('获取课程失败:', error)
      return errorResponse('获取课程失败', 500, 'DATABASE_ERROR')
    }

    return successResponse(course)

  } catch (error) {
    console.error('获取课程失败:', error)
    return errorResponse('获取课程失败', 500, 'INTERNAL_ERROR')
  }
})

/**
 * PATCH /api/admin/courses/[id]
 * 
 * 更新课程
 */
export const PATCH = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const body = await request.json()

    if (!id) {
      return errorResponse('课程 ID 不能为空', 400, 'INVALID_PARAMS')
    }

    // 构建更新数据
    const updateData: Record<string, unknown> = {}
    
    if (body.title !== undefined) {
      if (body.title.trim() === '') {
        return errorResponse('课程标题不能为空', 400, 'INVALID_PARAMS')
      }
      updateData.title = body.title.trim()
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    
    if (body.instructor !== undefined) {
      if (body.instructor.trim() === '') {
        return errorResponse('讲师名称不能为空', 400, 'INVALID_PARAMS')
      }
      updateData.instructor = body.instructor.trim()
    }
    
    if (body.duration !== undefined) {
      if (body.duration < 0) {
        return errorResponse('课程时长无效', 400, 'INVALID_PARAMS')
      }
      updateData.duration = body.duration
    }
    
    if (body.price !== undefined) {
      if (body.price < 0) {
        return errorResponse('课程价格无效', 400, 'INVALID_PARAMS')
      }
      updateData.price = body.price
    }
    
    if (body.category !== undefined) {
      if (body.category.trim() === '') {
        return errorResponse('课程分类不能为空', 400, 'INVALID_PARAMS')
      }
      updateData.category = body.category.trim()
    }
    
    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || null
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('没有要更新的字段', 400, 'INVALID_PARAMS')
    }

    updateData.updated_at = new Date().toISOString()

    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('课程不存在', 404, 'NOT_FOUND')
      }
      console.error('更新课程失败:', error)
      return errorResponse('更新课程失败', 500, 'DATABASE_ERROR')
    }

    return successResponse(course, '课程更新成功')

  } catch (error) {
    console.error('更新课程失败:', error)
    return errorResponse('更新课程失败', 500, 'INTERNAL_ERROR')
  }
})

/**
 * DELETE /api/admin/courses/[id]
 * 
 * 删除课程
 */
export const DELETE = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return errorResponse('课程 ID 不能为空', 400, 'INVALID_PARAMS')
    }

    // 先检查课程是否存在
    const { data: existing, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existing) {
      return errorResponse('课程不存在', 404, 'NOT_FOUND')
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除课程失败:', error)
      return errorResponse('删除课程失败', 500, 'DATABASE_ERROR')
    }

    return successResponse({ id }, '课程删除成功')

  } catch (error) {
    console.error('删除课程失败:', error)
    return errorResponse('删除课程失败', 500, 'INTERNAL_ERROR')
  }
})
