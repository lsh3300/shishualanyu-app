/**
 * 调试API - 添加测试货币和道具
 * Debug API - Add test currency and items
 * 
 * POST /api/debug/add-currency - 添加测试货币
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

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
    const { currency = 1000, items = [] } = body

    // 更新货币
    const { data: profile, error: profileError } = await supabase
      .from('player_profile')
      .select('currency')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: '获取用户信息失败', details: profileError.message },
        { status: 500 }
      )
    }

    const newCurrency = (profile?.currency || 0) + currency
    
    const { error: updateError } = await supabase
      .from('player_profile')
      .update({ currency: newCurrency })
      .eq('user_id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: '更新货币失败', details: updateError.message },
        { status: 500 }
      )
    }

    // 添加测试道具
    const addedItems: string[] = []
    for (const itemId of items) {
      // 检查是否已有该道具
      const { data: existing } = await supabase
        .from('user_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle()

      if (existing) {
        // 更新数量
        await supabase
          .from('user_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id)
      } else {
        // 新增
        await supabase
          .from('user_items')
          .insert({
            user_id: userId,
            item_id: itemId,
            quantity: 1
          })
      }
      addedItems.push(itemId)
    }

    return NextResponse.json({
      success: true,
      message: `已添加 ${currency} 货币${addedItems.length > 0 ? `，以及道具: ${addedItems.join(', ')}` : ''}`,
      data: {
        newCurrency,
        addedItems
      }
    })

  } catch (error: unknown) {
    console.error('调试API错误:', error)
    return NextResponse.json(
      { error: '操作失败', details: String(error) },
      { status: 500 }
    )
  }
}
