import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import type { ReviewActionRequest } from '@/types/admin.types'

// 从 Authorization header 获取用户 ID
function parseJwtUserId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload.sub || null;
  } catch {
    return null;
  }
}

async function getUserId(request: NextRequest, supabase: ReturnType<typeof createServiceClient>): Promise<string | null> {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const quickUserId = parseJwtUserId(token)
  if (quickUserId) {
    return quickUserId
  }
  
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return null
  }

  return data.user.id
}

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/content/[id]/review
 * 
 * 审核内容（通过或拒绝）
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: contentId } = await params
    const supabase = createServiceClient()
    
    // 验证用户身份
    const userId = await getUserId(request, supabase)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 验证管理员权限
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single()

    if (profileError || !adminProfile || adminProfile.role !== 'admin' || adminProfile.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '无管理员权限' },
        { status: 403 }
      )
    }

    // 解析请求体
    const body: ReviewActionRequest = await request.json()
    const { action, reason } = body

    // 验证参数
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '无效的审核操作' },
        { status: 400 }
      )
    }

    // 拒绝操作需要提供原因
    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { success: false, error: '拒绝操作需要提供原因' },
        { status: 400 }
      )
    }

    // 检查内容是否存在且为待审核状态
    const { data: content, error: contentError } = await supabase
      .from('content_reviews')
      .select('id, status, content_type, content_id')
      .eq('id', contentId)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { success: false, error: '审核内容不存在' },
        { status: 404 }
      )
    }

    if (content.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '该内容已被审核' },
        { status: 400 }
      )
    }

    // 更新审核状态
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error: updateError } = await supabase
      .from('content_reviews')
      .update({
        status: newStatus,
        reviewer_id: userId,
        reject_reason: action === 'reject' ? reason : null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', contentId)

    if (updateError) {
      throw updateError
    }

    // 记录操作日志
    await supabase.from('admin_logs').insert({
      admin_id: userId,
      action: action === 'approve' ? 'content_approve' : 'content_reject',
      target_type: content.content_type,
      target_id: content.content_id,
      details: { review_id: contentId, reason }
    })

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '内容已通过审核' : '内容已被拒绝'
    })

  } catch (error) {
    console.error('审核操作失败:', error)
    return NextResponse.json(
      { success: false, error: '审核操作失败' },
      { status: 500 }
    )
  }
}
