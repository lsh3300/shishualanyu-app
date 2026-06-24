import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withAdminAuth, type AdminAuthResult } from '@/lib/admin/auth-middleware'
import { 
  successResponse, 
  parsePaginationParams, 
  calculatePagination 
} from '@/lib/admin/api-response'
import type { ReviewItem, ContentListResponse } from '@/types/admin.types'
import type { ContentType, ReviewStatus } from '@/types/database'

/**
 * GET /api/admin/content
 * 
 * 获取待审核内容列表
 */
export const GET = withAdminAuth(async (request: NextRequest, _auth: AdminAuthResult) => {
  const supabase = createServiceClient()

  // 解析查询参数
  const { searchParams } = new URL(request.url)
  const { page, pageSize, from, to } = parsePaginationParams(searchParams)
  const type = searchParams.get('type') || 'all'
  const status = searchParams.get('status') || 'pending'

  // 尝试查询 content_reviews 表（表可能不存在）
  try {
    // 构建查询
    let query = supabase
      .from('content_reviews')
      .select(`
        id,
        content_type,
        content_id,
        content_preview,
        submitter_id,
        status,
        reject_reason,
        created_at,
        reviewed_at,
        submitter:profiles!content_reviews_submitter_id_fkey(id, username, avatar_url)
      `, { count: 'exact' })

    // 类型过滤
    if (type !== 'all') {
      query = query.eq('content_type', type)
    }

    // 状态过滤
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: items, count, error: queryError } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    // 如果表不存在，返回空列表
    if (queryError) {
      if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
        const emptyResponse: ContentListResponse = {
          items: [],
          pagination: calculatePagination(page, pageSize, 0)
        }
        return successResponse(emptyResponse, 'content_reviews 表不存在，内容审核功能暂不可用')
      }
      throw queryError
    }

    const total = count || 0
    const pagination = calculatePagination(page, pageSize, total)

    // 转换数据格式
    const reviewItems: ReviewItem[] = (items || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      content_type: item.content_type as ContentType,
      content_id: item.content_id as string,
      content_preview: item.content_preview as string | null,
      submitter: item.submitter ? {
        id: (item.submitter as Record<string, unknown>).id as string,
        username: (item.submitter as Record<string, unknown>).username as string | null,
        avatar_url: (item.submitter as Record<string, unknown>).avatar_url as string | null
      } : null,
      status: item.status as ReviewStatus,
      reject_reason: item.reject_reason as string | null,
      created_at: item.created_at as string,
      reviewed_at: item.reviewed_at as string | null
    }))

    const response: ContentListResponse = {
      items: reviewItems,
      pagination
    }

    return successResponse(response)
  } catch (tableError: unknown) {
    // 表不存在的情况
    const error = tableError as { code?: string; message?: string }
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      const emptyResponse: ContentListResponse = {
        items: [],
        pagination: calculatePagination(page, pageSize, 0)
      }
      return successResponse(emptyResponse, 'content_reviews 表不存在，内容审核功能暂不可用')
    }
    
    console.error('获取审核内容失败:', tableError)
    throw tableError
  }
})
