/**
 * 上架作品API
 * Create Listing API
 * 
 * POST /api/listings/create - 上架作品到商店
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { createListing, calculatePriceFromScore } from '@/lib/services/shopService'
import { ValidationError, createErrorResponse } from '@/lib/game/errors'
import type { ScoreGrade } from '@/types/game.types'

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
    console.log('🏪 上架作品，用户ID:', userId)

    const body = await request.json()
    const { cloth_id, price, is_featured, score_data } = body

    // 参数验证
    if (!cloth_id) {
      throw new ValidationError('缺少 cloth_id 参数', 'cloth_id')
    }

    // 如果没有提供价格，根据评分计算建议价格
    let finalPrice = price
    if (!finalPrice && score_data) {
      finalPrice = calculatePriceFromScore(
        score_data.total_score,
        score_data.grade as ScoreGrade
      )
    }

    if (!finalPrice || finalPrice <= 0) {
      throw new ValidationError('价格必须大于0', 'price')
    }

    // 调用服务上架
    const result = await createListing(
      userId,
      cloth_id,
      finalPrice,
      is_featured || false
    )

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'LISTING_ERROR',
          message: result.message,
          userMessage: result.message
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.listing,
      message: result.message
    })

  } catch (error: unknown) {
    console.error('上架API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
