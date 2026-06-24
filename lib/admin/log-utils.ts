import { createServiceClient } from '@/lib/supabaseClient'
import type { AdminAction } from '@/types/admin.types'

/**
 * 日志记录参数
 */
export interface LogActionParams {
  adminId: string
  action: AdminAction
  targetType: 'user' | 'product' | 'course' | 'content'
  targetId: string
  targetName?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * 记录管理员操作日志
 * 
 * @param params 日志参数
 * @returns 是否记录成功
 */
export async function logAdminAction(params: LogActionParams): Promise<boolean> {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: params.adminId,
        action: params.action,
        target_type: params.targetType,
        target_id: params.targetId,
        details: {
          target_name: params.targetName,
          ...params.details
        },
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null
      })

    if (error) {
      console.error('记录操作日志失败:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('记录操作日志异常:', error)
    return false
  }
}

/**
 * 从请求中提取客户端信息
 */
export function extractClientInfo(request: Request): { ipAddress?: string; userAgent?: string } {
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    undefined
  const userAgent = request.headers.get('user-agent') || undefined

  return { ipAddress, userAgent }
}

/**
 * 操作描述映射
 */
export const actionDescriptions: Record<AdminAction, string> = {
  'user_disable': '禁用用户',
  'user_enable': '启用用户',
  'user_role_change': '修改用户角色',
  'content_approve': '通过内容审核',
  'content_reject': '拒绝内容审核',
  'product_create': '创建产品',
  'product_update': '更新产品',
  'product_delete': '删除产品',
  'course_create': '创建课程',
  'course_update': '更新课程',
  'course_delete': '删除课程'
}

/**
 * 获取操作描述
 */
export function getActionDescription(action: AdminAction): string {
  return actionDescriptions[action] || action
}

/**
 * 目标类型描述映射
 */
export const targetTypeDescriptions: Record<string, string> = {
  'user': '用户',
  'product': '产品',
  'course': '课程',
  'content': '内容'
}

/**
 * 获取目标类型描述
 */
export function getTargetTypeDescription(targetType: string): string {
  return targetTypeDescriptions[targetType] || targetType
}
