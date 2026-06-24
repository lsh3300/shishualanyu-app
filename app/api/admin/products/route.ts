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
 * 产品列表项类型
 */
interface ProductListItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  images: string[] | null
  in_stock: boolean
  created_at: string
  updated_at: string
}

/**
 * 产品列表响应
 */
interface ProductsListResponse {
  products: ProductListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * GET /api/admin/products
 * 
 * 获取产品列表，支持分页、搜索、筛选
 */
export const GET = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const { page, pageSize, from, to } = parsePaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const inStock = searchParams.get('inStock')

    // 构建查询
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 分类过滤
    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // 库存过滤
    if (inStock === 'true') {
      query = query.eq('in_stock', true)
    } else if (inStock === 'false') {
      query = query.eq('in_stock', false)
    }

    const { data: products, count, error: queryError } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (queryError) {
      console.error('查询产品失败:', queryError)
      return errorResponse('获取产品列表失败', 500, 'DATABASE_ERROR')
    }

    const total = count || 0
    const pagination = calculatePagination(page, pageSize, total)

    const response: ProductsListResponse = {
      products: (products || []) as ProductListItem[],
      pagination
    }

    return successResponse(response)

  } catch (error) {
    console.error('获取产品列表失败:', error)
    return errorResponse('获取产品列表失败', 500, 'INTERNAL_ERROR')
  }
})

/**
 * POST /api/admin/products
 * 
 * 创建新产品
 */
export const POST = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // 验证必填字段
    if (!body.name || body.name.trim() === '') {
      return errorResponse('产品名称不能为空', 400, 'INVALID_PARAMS')
    }
    if (body.price === undefined || body.price < 0) {
      return errorResponse('产品价格无效', 400, 'INVALID_PARAMS')
    }
    if (!body.category || body.category.trim() === '') {
      return errorResponse('产品分类不能为空', 400, 'INVALID_PARAMS')
    }

    // 创建产品
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        price: body.price,
        category: body.category.trim(),
        image_url: body.image_url || null,
        images: body.images || null,
        in_stock: body.in_stock !== false
      })
      .select()
      .single()

    if (insertError) {
      console.error('创建产品失败:', insertError)
      return errorResponse('创建产品失败', 500, 'DATABASE_ERROR')
    }

    return successResponse(product, '产品创建成功', 201)

  } catch (error) {
    console.error('创建产品失败:', error)
    return errorResponse('创建产品失败', 500, 'INTERNAL_ERROR')
  }
})
