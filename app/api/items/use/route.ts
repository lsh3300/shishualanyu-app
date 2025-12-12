/**
 * 使用道具API
 * Use Item API
 * 
 * POST /api/items/use - 使用道具
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { useItem } from '@/lib/services/itemService'
import { createErrorResponse } from '@/lib/game/errors'

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

    // 解析请求体
    const body = await request.json()
    const { item_id, quantity = 1 } = body

    if (!item_id) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_INPUT',
            userMessage: '缺少道具ID'
          }
        },
        { status: 400 }
      )
    }

    // 使用道具
    const result = await useItem(userId, item_id, quantity)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USE_FAILED',
            userMessage: result.message || '使用失败'
          }
        },
        { status: 400 }
      )
    }

  } catch (error: unknown) {
    console.error('使用道具错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
