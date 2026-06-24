import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withAdminAuth, type AdminAuthResult } from '@/lib/admin/auth-middleware'
import { successResponse, errorResponse } from '@/lib/admin/api-response'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/products/[id]
 * 
 * 获取单个产品详情
 */
export const GET = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return errorResponse('产品 ID 不能为空', 400, 'INVALID_PARAMS')
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('产品不存在', 404, 'NOT_FOUND')
      }
      console.error('获取产品失败:', error)
      return errorResponse('获取产品失败', 500, 'DATABASE_ERROR')
    }

    return successResponse(product)

  } catch (error) {
    console.error('获取产品失败:', error)
    return errorResponse('获取产品失败', 500, 'INTERNAL_ERROR')
  }
})

/**
 * PATCH /api/admin/products/[id]
 * 
 * 更新产品
 */
export const PATCH = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const body = await request.json()

    if (!id) {
      return errorResponse('产品 ID 不能为空', 400, 'INVALID_PARAMS')
    }

    // 构建更新数据
    const updateData: Record<string, unknown> = {}
    
    if (body.name !== undefined) {
      if (body.name.trim() === '') {
        return errorResponse('产品名称不能为空', 400, 'INVALID_PARAMS')
      }
      updateData.name = body.name.trim()
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    
    if (body.price !== undefined) {
      if (body.price < 0) {
        return errorResponse('产品价格无效', 400, 'INVALID_PARAMS')
      }
      updateData.price = body.price
    }
    
    if (body.category !== undefined) {
      if (body.category.trim() === '') {
        return errorResponse('产品分类不能为空', 400, 'INVALID_PARAMS')
      }
      updateData.category = body.category.trim()
    }
    
    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || null
    }
    
    if (body.images !== undefined) {
      updateData.images = body.images || null
    }
    
    if (body.in_stock !== undefined) {
      updateData.in_stock = !!body.in_stock
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('没有要更新的字段', 400, 'INVALID_PARAMS')
    }

    updateData.updated_at = new Date().toISOString()

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('产品不存在', 404, 'NOT_FOUND')
      }
      console.error('更新产品失败:', error)
      return errorResponse('更新产品失败', 500, 'DATABASE_ERROR')
    }

    return successResponse(product, '产品更新成功')

  } catch (error) {
    console.error('更新产品失败:', error)
    return errorResponse('更新产品失败', 500, 'INTERNAL_ERROR')
  }
})

/**
 * DELETE /api/admin/products/[id]
 * 
 * 删除产品
 */
export const DELETE = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return errorResponse('产品 ID 不能为空', 400, 'INVALID_PARAMS')
    }

    // 先检查产品是否存在
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existing) {
      return errorResponse('产品不存在', 404, 'NOT_FOUND')
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除产品失败:', error)
      return errorResponse('删除产品失败', 500, 'DATABASE_ERROR')
    }

    return successResponse({ id }, '产品删除成功')

  } catch (error) {
    console.error('删除产品失败:', error)
    return errorResponse('删除产品失败', 500, 'INTERNAL_ERROR')
  }
})
