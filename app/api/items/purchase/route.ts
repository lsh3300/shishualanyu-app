/**
 * 道具购买API
 * Purchase Item API
 * 
 * POST /api/items/purchase - 购买道具
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { purchaseItem } from '@/lib/services/itemService'
import { ValidationError, createErrorResponse } from '@/lib/game/errors'

export async function POST(request: NextRequest) {
  try {
    // 使用 Authorization header 认证
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
    const { item_id, quantity = 1 } = body

    // 参数验证
    if (!item_id) {
      throw new ValidationError('缺少 item_id 参数', 'item_id')
    }

    if (typeof quantity !== 'number' || quantity < 1 || quantity > 99) {
      throw new ValidationError('数量必须在 1-99 之间', 'quantity')
    }

    // 调用服务购买
    const result = await purchaseItem(userId, item_id, quantity)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PURCHASE_ERROR',
          message: result.message,
          userMessage: result.message
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    })

  } catch (error: unknown) {
    console.error('道具购买API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
