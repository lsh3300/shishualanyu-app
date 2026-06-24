import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withAdminAuth, type AdminAuthResult } from '@/lib/admin/auth-middleware'
import { 
  successResponse, 
  errorResponse, 
  parsePaginationParams, 
  calculatePagination 
} from '@/lib/admin/api-response'
import type { UserListItem, UsersListResponse } from '@/types/admin.types'

/**
 * GET /api/admin/users
 * 
 * 获取用户列表，支持分页、搜索、筛选
 */
export const GET = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  try {
    const supabase = createServiceClient()

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const { page, pageSize, from, to } = parsePaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const status = searchParams.get('status') || 'all'

    // 构建查询 - profiles 表没有 email 字段
    let query = supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, role, status, created_at, updated_at', { count: 'exact' })

    // 搜索过滤 - 只搜索 profiles 表中存在的字段
    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // 角色过滤
    if (role !== 'all') {
      query = query.eq('role', role)
    }

    // 状态过滤
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: users, count, error: queryError } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (queryError) {
      throw queryError
    }

    // 获取用户邮箱（从 auth.users）
    const userIds = (users || []).map((u: { id: string }) => u.id)
    let emailMap: Record<string, string> = {}
    
    if (userIds.length > 0) {
      try {
        const { data: authData } = await supabase.auth.admin.listUsers({
          perPage: 1000
        })
        if (authData?.users) {
          emailMap = authData.users.reduce((acc: Record<string, string>, user: { id: string; email?: string }) => {
            if (user.email) acc[user.id] = user.email
            return acc
          }, {})
        }
      } catch (e) {
        console.log('无法获取用户邮箱:', e)
      }
    }

    // 合并数据，添加邮箱
    const usersWithEmail = (users || []).map((user: { id: string }) => ({
      ...user,
      email: emailMap[user.id] || ''
    }))

    const total = count || 0
    const pagination = calculatePagination(page, pageSize, total)

    const response: UsersListResponse = {
      users: usersWithEmail as UserListItem[],
      pagination
    }

    return successResponse(response)

  } catch (error) {
    console.error('获取用户列表失败:', error)
    return errorResponse('获取用户列表失败', 500, 'INTERNAL_ERROR')
  }
})
