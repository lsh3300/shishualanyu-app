import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withAdminAuth, type AdminAuthResult } from '@/lib/admin/auth-middleware'
import { successResponse, errorResponse } from '@/lib/admin/api-response'
import type { UpdateUserRequest } from '@/types/admin.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export const PATCH = withAdminAuth(async (
  request: NextRequest,
  auth: AdminAuthResult
) => {
  try {
    const supabase = createServiceClient()
    const url = new URL(request.url)
    const targetUserId = url.pathname.split('/').pop()

    if (!targetUserId) {
      return errorResponse('用户 ID 不能为空', 400, 'INVALID_PARAMS')
    }

    if (targetUserId === auth.userId) {
      return errorResponse('不能修改自己的账号状态或角色', 400, 'INVALID_PARAMS')
    }

    const body: UpdateUserRequest = await request.json()
    const { status, role } = body

    if (!status && !role) {
      return errorResponse('请提供需要更新的字段', 400, 'INVALID_PARAMS')
    }

    if (status && !['active', 'disabled', 'pending'].includes(status)) {
      return errorResponse('无效的状态值', 400, 'INVALID_PARAMS')
    }

    if (role && !['user', 'admin'].includes(role)) {
      return errorResponse('无效的角色值', 400, 'INVALID_PARAMS')
    }

    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (role) updateData.role = role

    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', targetUserId)
      .select('id, username, full_name, avatar_url, role, status, created_at, updated_at')
      .single()

    if (updateError) {
      return errorResponse('更新用户失败', 500, 'DATABASE_ERROR')
    }

    await supabase.from('admin_logs').insert({
      admin_id: auth.userId,
      action: status ? (status === 'disabled' ? 'user_disable' : 'user_enable') : 'user_role_change',
      target_type: 'user',
      target_id: targetUserId,
      details: { status, role },
    })

    return successResponse(updatedUser, '用户信息已更新')
  } catch (error) {
    console.error('更新用户失败:', error)
    return errorResponse('更新用户失败', 500, 'INTERNAL_ERROR')
  }
})
