/**
 * 下架作品API
 * Withdraw Listing API
 * 
 * POST /api/listings/withdraw - 下架作品
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { withdrawListing } from '@/lib/services/shopService'
import { ValidationError, createErrorResponse } from '@/lib/game/errors'

export async function POST(request: NextRequest) {
  try {
    // 使用 Authorization header 认证（与其他 API 保持一致）
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const supabase = createServiceClient()
    const { data, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !data?.user) {
      return NextResponse.json(
        { error: '认证失败', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const userId = data.user.id

    const body = await request.json()
    const { listing_id } = body

    // 参数验证
    if (!listing_id) {
      throw new ValidationError('缺少 listing_id 参数', 'listing_id')
    }

    // 调用服务下架
    const result = await withdrawListing(userId, listing_id)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'WITHDRAW_ERROR',
          message: result.message,
          userMessage: result.message
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })

  } catch (error: unknown) {
    console.error('下架API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
