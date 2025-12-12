/**
 * 背包扩容API
 * Expand Inventory API
 * 
 * POST /api/inventory/expand - 扩容背包
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { createErrorResponse } from '@/lib/game/errors'
import { InventoryConfig } from '@/lib/game/config'

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

    // 并行获取用户货币和商店信息
    const [profileResult, shopResult] = await Promise.all([
      supabase
        .from('player_profile')
        .select('currency')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('user_shops')
        .select('id, max_inventory_size')
        .eq('user_id', userId)
        .maybeSingle()
    ])

    const currentCurrency = profileResult.data?.currency || 0
    const currentMax = shopResult.data?.max_inventory_size || InventoryConfig.defaultMaxInventory
    const expansionCost = InventoryConfig.expansionCost
    const expansionSlots = InventoryConfig.expansionSlots

    // 检查货币是否足够
    if (currentCurrency < expansionCost) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_CURRENCY',
          message: `货币不足，需要 ${expansionCost} 币`,
          userMessage: `货币不足，需要 ${expansionCost} 币，当前只有 ${currentCurrency} 币`
        }
      }, { status: 400 })
    }

    const newMax = currentMax + expansionSlots
    const newCurrency = currentCurrency - expansionCost

    // 更新货币
    await supabase
      .from('player_profile')
      .update({ currency: newCurrency })
      .eq('user_id', userId)

    // 更新或创建商店
    if (shopResult.data) {
      await supabase
        .from('user_shops')
        .update({ max_inventory_size: newMax })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('user_shops')
        .insert({
          user_id: userId,
          shop_name: '我的蓝染坊',
          max_inventory_size: newMax
        })
    }

    return NextResponse.json({
      success: true,
      message: `背包已扩容 ${expansionSlots} 格`,
      data: {
        newMax,
        newCurrency,
        cost: expansionCost
      }
    })

  } catch (error: unknown) {
    console.error('背包扩容API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
