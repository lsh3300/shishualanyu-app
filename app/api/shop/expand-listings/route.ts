/**
 * 上架位扩容API
 * Expand Listing Slots API
 * 
 * POST /api/shop/expand-listings - 扩容上架位
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { createErrorResponse } from '@/lib/game/errors'

// 上架位扩容配置
const LISTING_EXPANSION_CONFIG = {
  baseSlots: 5,        // 初始上架位
  expansionSlots: 1,   // 每次扩容增加的位数
  baseCost: 300,       // 基础扩容价格
  costIncrement: 100,  // 每次扩容价格增量
  maxSlots: 20         // 最大上架位
}

/**
 * 计算扩容价格
 * 价格 = 基础价格 + (已扩容次数 * 增量)
 */
function calculateExpansionCost(currentSlots: number): number {
  const expansions = currentSlots - LISTING_EXPANSION_CONFIG.baseSlots
  return LISTING_EXPANSION_CONFIG.baseCost + (expansions * LISTING_EXPANSION_CONFIG.costIncrement)
}

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
        .select('id, max_listing_slots')
        .eq('user_id', userId)
        .maybeSingle()
    ])

    const currentCurrency = profileResult.data?.currency || 0
    const currentSlots = shopResult.data?.max_listing_slots || LISTING_EXPANSION_CONFIG.baseSlots

    // 检查是否已达最大容量
    if (currentSlots >= LISTING_EXPANSION_CONFIG.maxSlots) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MAX_CAPACITY_REACHED',
          message: '已达到最大上架位数量',
          userMessage: `上架位已达到最大数量 (${LISTING_EXPANSION_CONFIG.maxSlots} 个)`
        }
      }, { status: 400 })
    }

    const expansionCost = calculateExpansionCost(currentSlots)

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

    const newSlots = currentSlots + LISTING_EXPANSION_CONFIG.expansionSlots
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
        .update({ max_listing_slots: newSlots })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('user_shops')
        .insert({
          user_id: userId,
          shop_name: '我的蓝染坊',
          max_listing_slots: newSlots
        })
    }

    // 计算下次扩容价格
    const nextExpansionCost = newSlots < LISTING_EXPANSION_CONFIG.maxSlots 
      ? calculateExpansionCost(newSlots) 
      : null

    return NextResponse.json({
      success: true,
      message: `上架位已扩容至 ${newSlots} 个`,
      data: {
        newSlots,
        newCurrency,
        cost: expansionCost,
        nextExpansionCost
      }
    })

  } catch (error: unknown) {
    console.error('上架位扩容API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}

// GET 方法：获取扩容信息
export async function GET(request: NextRequest) {
  try {
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

    const { data: shop } = await supabase
      .from('user_shops')
      .select('max_listing_slots')
      .eq('user_id', userId)
      .maybeSingle()

    const currentSlots = shop?.max_listing_slots || LISTING_EXPANSION_CONFIG.baseSlots
    const canExpand = currentSlots < LISTING_EXPANSION_CONFIG.maxSlots
    const expansionCost = canExpand ? calculateExpansionCost(currentSlots) : null

    return NextResponse.json({
      success: true,
      data: {
        currentSlots,
        maxSlots: LISTING_EXPANSION_CONFIG.maxSlots,
        canExpand,
        expansionCost,
        expansionAmount: LISTING_EXPANSION_CONFIG.expansionSlots
      }
    })

  } catch (error: unknown) {
    console.error('获取扩容信息错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
