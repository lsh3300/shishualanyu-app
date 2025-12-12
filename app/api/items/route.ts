/**
 * 道具API
 * Items API
 * 
 * GET /api/items - 获取道具列表和用户持有情况
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { getShopItems, getUserItems } from '@/lib/services/itemService'
import { createErrorResponse } from '@/lib/game/errors'

export async function GET(request: NextRequest) {
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

    // 获取商店道具列表
    const shopItems = getShopItems()

    // 获取用户持有的道具
    const userItemsResult = await getUserItems(userId)

    return NextResponse.json({
      success: true,
      data: {
        items: shopItems,
        userItems: userItemsResult.items,
        activeItems: userItemsResult.activeItems || {}
      }
    })

  } catch (error: unknown) {
    console.error('获取道具列表错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
