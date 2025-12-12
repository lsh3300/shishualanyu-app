/**
 * 切换道具激活状态API
 * Toggle Item Active Status API
 * 
 * POST /api/items/toggle - 切换永久道具的使用状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { getItemById } from '@/lib/game/config'
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
    const { item_id } = body

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

    // 检查道具是否存在
    const item = getItemById(item_id)
    if (!item) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            userMessage: '道具不存在'
          }
        },
        { status: 404 }
      )
    }

    // 只有永久道具可以切换状态
    if (item.type !== 'permanent') {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_ITEM_TYPE',
            userMessage: '只有永久道具可以切换使用状态'
          }
        },
        { status: 400 }
      )
    }

    // 检查用户是否拥有该道具
    const { data: userItem, error: queryError } = await supabase
      .from('user_items')
      .select('id, is_active')
      .eq('user_id', userId)
      .eq('item_id', item_id)
      .maybeSingle()

    if (queryError || !userItem) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_OWNED',
            userMessage: '你还没有购买该道具'
          }
        },
        { status: 400 }
      )
    }

    // 切换状态
    const newActiveState = !userItem.is_active
    const { error: updateError } = await supabase
      .from('user_items')
      .update({ is_active: newActiveState })
      .eq('id', userItem.id)

    if (updateError) {
      console.error('更新道具状态失败:', updateError)
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            userMessage: '更新状态失败'
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: newActiveState ? `${item.name} 已启用` : `${item.name} 已停用`,
      data: {
        item_id,
        is_active: newActiveState
      }
    })

  } catch (error: unknown) {
    console.error('切换道具状态错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
