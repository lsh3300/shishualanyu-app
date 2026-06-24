/**
 * 价格调整API
 * Update Listing Price API
 * 
 * PUT /api/listings/price - 调整上架作品价格
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { ValidationError, createErrorResponse } from '@/lib/game/errors'

export async function PUT(request: NextRequest) {
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
    const { listing_id, new_price } = body

    // 参数验证
    if (!listing_id) {
      throw new ValidationError('缺少 listing_id 参数', 'listing_id')
    }

    if (!new_price || typeof new_price !== 'number') {
      throw new ValidationError('缺少有效的 new_price 参数', 'new_price')
    }

    // 价格范围验证 (1-99999)
    if (new_price < 1 || new_price > 99999) {
      throw new ValidationError('价格必须在 1-99999 之间', 'new_price')
    }

    // 检查上架记录是否属于当前用户
    const { data: listing, error: listingError } = await supabase
      .from('shop_listings')
      .select('id, user_id, status')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'LISTING_NOT_FOUND',
          message: '上架记录不存在',
          userMessage: '上架记录不存在'
        }
      }, { status: 404 })
    }

    if (listing.user_id !== userId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无权限修改此上架记录',
          userMessage: '无权限修改此上架记录'
        }
      }, { status: 403 })
    }

    if (listing.status !== 'listed') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '只能修改已上架作品的价格',
          userMessage: '只能修改已上架作品的价格'
        }
      }, { status: 400 })
    }

    // 更新价格
    const { error: updateError } = await supabase
      .from('shop_listings')
      .update({ price: new_price })
      .eq('id', listing_id)

    if (updateError) {
      console.error('更新价格失败:', updateError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: '更新价格失败',
          userMessage: '更新价格失败，请稍后重试'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '价格已更新'
    })

  } catch (error: unknown) {
    console.error('价格调整API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
