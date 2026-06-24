import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withAdminAuth, type AdminAuthResult } from '@/lib/admin/auth-middleware'
import { successResponse, errorResponse } from '@/lib/admin/api-response'
import type { DashboardStats, TrendDataPoint } from '@/types/admin.types'

/**
 * GET /api/admin/stats
 * 
 * 获取管理员仪表盘统计数据
 */
export const GET = withAdminAuth(async (_request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()

    // 获取今天的日期（UTC）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // 安全计数函数 - 表不存在时返回 0
    async function safeCount(
      table: string, 
      filter?: { column: string; value: string }, 
      dateFilter?: { column: string; value: string }
    ): Promise<number> {
      try {
        let query = supabase.from(table).select('id', { count: 'exact', head: true })
        if (filter) {
          query = query.eq(filter.column, filter.value)
        }
        if (dateFilter) {
          query = query.gte(dateFilter.column, dateFilter.value)
        }
        const { count, error } = await query
        return error ? 0 : (count || 0)
      } catch {
        return 0
      }
    }

    // 并行获取各项统计数据（容错处理）
    const [
      totalUsers,
      newUsersToday,
      totalCourses,
      totalProducts,
      totalOrders,
      ordersToday,
      pendingReviews
    ] = await Promise.all([
      safeCount('profiles'),
      safeCount('profiles', undefined, { column: 'created_at', value: todayISO }),
      safeCount('courses'),
      safeCount('products'),
      safeCount('orders'),
      safeCount('orders', undefined, { column: 'created_at', value: todayISO }),
      safeCount('content_reviews', { column: 'status', value: 'pending' })
    ])

    // 获取趋势数据
    const [userTrendResult, orderTrendResult] = await Promise.all([
      getUserTrend(supabase, 7),
      getOrderTrend(supabase, 7)
    ])

    const stats: DashboardStats = {
      totalUsers,
      newUsersToday,
      totalCourses,
      totalProducts,
      totalOrders,
      ordersToday,
      pendingReviews,
      userTrend: userTrendResult,
      orderTrend: orderTrendResult
    }

    return successResponse(stats)

  } catch (error) {
    console.error('获取统计数据失败:', error)
    return errorResponse('获取统计数据失败', 500, 'INTERNAL_ERROR')
  }
})

/**
 * 获取用户注册趋势
 */
async function getUserTrend(supabase: ReturnType<typeof createServiceClient>, days: number): Promise<TrendDataPoint[]> {
  const trend: TrendDataPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    let count = 0
    try {
      const result = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
      count = result.count || 0
    } catch {
      count = 0
    }

    trend.push({
      date: date.toISOString().split('T')[0],
      count
    })
  }

  return trend
}

/**
 * 获取订单趋势（表不存在时返回空数据）
 */
async function getOrderTrend(supabase: ReturnType<typeof createServiceClient>, days: number): Promise<TrendDataPoint[]> {
  const trend: TrendDataPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    let count = 0
    try {
      const result = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
      count = result.error ? 0 : (result.count || 0)
    } catch {
      count = 0
    }

    trend.push({
      date: date.toISOString().split('T')[0],
      count
    })
  }

  return trend
}
