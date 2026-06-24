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
 * 日志列表项类型
 */
interface LogListItem {
  id: string
  admin_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin?: {
    id: string
    username: string | null
    full_name: string | null
  } | null
}

/**
 * 日志列表响应
 */
interface LogsListResponse {
  logs: LogListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * GET /api/admin/logs
 * 
 * 获取操作日志列表，支持分页和筛选
 */
export const GET = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const { page, pageSize, from, to } = parsePaginationParams(searchParams)
    const action = searchParams.get('action') || ''
    const targetType = searchParams.get('targetType') || ''
    const adminId = searchParams.get('adminId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    // 构建查询
    let query = supabase
      .from('admin_logs')
      .select(`
        *,
        admin:profiles!admin_logs_admin_id_fkey(id, username, full_name)
      `, { count: 'exact' })

    // 操作类型筛选
    if (action) {
      query = query.eq('action', action)
    }

    // 目标类型筛选
    if (targetType) {
      query = query.eq('target_type', targetType)
    }

    // 管理员筛选
    if (adminId) {
      query = query.eq('admin_id', adminId)
    }

    // 日期范围筛选
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      // 结束日期加一天，包含当天
      const endDateTime = new Date(endDate)
      endDateTime.setDate(endDateTime.getDate() + 1)
      query = query.lt('created_at', endDateTime.toISOString())
    }

    const { data: logs, count, error: queryError } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (queryError) {
      // 表不存在的情况
      if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
        const emptyResponse: LogsListResponse = {
          logs: [],
          pagination: calculatePagination(page, pageSize, 0)
        }
        return successResponse(emptyResponse, 'admin_logs 表不存在，操作日志功能暂不可用')
      }
      console.error('查询日志失败:', queryError)
      return errorResponse('获取操作日志失败', 500, 'DATABASE_ERROR')
    }

    const total = count || 0
    const pagination = calculatePagination(page, pageSize, total)

    const response: LogsListResponse = {
      logs: (logs || []) as LogListItem[],
      pagination
    }

    return successResponse(response)

  } catch (error) {
    console.error('获取操作日志失败:', error)
    return errorResponse('获取操作日志失败', 500, 'INTERNAL_ERROR')
  }
})
