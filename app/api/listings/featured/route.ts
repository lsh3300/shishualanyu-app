/**
 * 设置推荐位API
 * Set Featured Listing API
 * 
 * PUT /api/listings/featured - 设置/取消推荐位
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
    const { listing_id } = body

    // 参数验证
    if (!listing_id) {
      throw new ValidationError('缺少 listing_id 参数', 'listing_id')
    }

    // 检查上架记录是否属于当前用户
    const { data: listing, error: listingError } = await supabase
      .from('shop_listings')
      .select('id, user_id, status, is_featured, shop_id')
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
          message: '只能设置已上架作品为推荐',
          userMessage: '只能设置已上架作品为推荐'
        }
      }, { status: 400 })
    }

    // 如果当前是推荐，则取消推荐
    if (listing.is_featured) {
      const { error: updateError } = await supabase
        .from('shop_listings')
        .update({ is_featured: false })
        .eq('id', listing_id)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: '已取消推荐'
      })
    }

    // 设置为推荐：先取消该商店其他推荐
    await supabase
      .from('shop_listings')
      .update({ is_featured: false })
      .eq('shop_id', listing.shop_id)
      .eq('status', 'listed')

    // 设置当前作品为推荐
    const { error: updateError } = await supabase
      .from('shop_listings')
      .update({ is_featured: true })
      .eq('id', listing_id)

    if (updateError) {
      console.error('设置推荐失败:', updateError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: '设置推荐失败',
          userMessage: '设置推荐失败，请稍后重试'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '已设为推荐'
    })

  } catch (error: unknown) {
    console.error('设置推荐API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
