/**
 * 上架API
 * POST /api/listings/create
 * 
 * 从背包上架作品到商店
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 解析请求body
    const body = await request.json()
    const { cloth_id, custom_price } = body

    if (!cloth_id) {
      return NextResponse.json(
        { error: '缺少cloth_id参数' },
        { status: 400 }
      )
    }

    // 1. 检查作品是否存在且属于当前用户
    const { data: cloth, error: clothError } = await supabase
      .from('cloths')
      .select('*')
      .eq('id', cloth_id)
      .eq('user_id', user.id)
      .single()

    if (clothError || !cloth) {
      return NextResponse.json(
        { error: '作品不存在或无权操作' },
        { status: 404 }
      )
    }

    // 2. 检查作品是否已上架
    const { data: existingListing } = await supabase
      .from('shop_listings')
      .select('id')
      .eq('cloth_id', cloth_id)
      .eq('status', 'active')
      .single()

    if (existingListing) {
      return NextResponse.json(
        { error: '该作品已上架' },
        { status: 400 }
      )
    }

    // 3. 获取作品评分
    const { data: score, error: scoreError } = await supabase
      .from('cloth_scores')
      .select('*')
      .eq('cloth_id', cloth_id)
      .single()

    if (scoreError || !score) {
      return NextResponse.json(
        { error: '作品未评分，无法上架' },
        { status: 400 }
      )
    }

    // 4. 获取用户商店
    const { data: shop, error: shopError } = await supabase
      .from('user_shops')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // 如果商店不存在，创建一个
    let shopId: string
    if (shopError || !shop) {
      const { data: newShop, error: createShopError } = await supabase
        .from('user_shops')
        .insert({
          user_id: user.id,
          shop_name: `${user.email?.split('@')[0]}的蓝染坊`,
          description: '欢迎来到我的蓝染工坊！',
          theme: 'indigo'
        })
        .select()
        .single()

      if (createShopError || !newShop) {
        return NextResponse.json(
          { error: '创建商店失败' },
          { status: 500 }
        )
      }
      shopId = newShop.id
    } else {
      shopId = shop.id
    }

    // 5. 检查商店上架数量限制
    const { count: listingCount } = await supabase
      .from('shop_listings')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('status', 'active')

    const maxListings = shop?.max_listings || 5
    if (listingCount && listingCount >= maxListings) {
      return NextResponse.json(
        { 
          error: `已达到上架数量上限（${maxListings}件）`,
          message: '请下架部分作品或扩充上架位'
        },
        { status: 400 }
      )
    }

    // 6. 计算价格（基于评分）
    const calculatedPrice = calculatePrice(score.grade, score.total_score)
    const finalPrice = custom_price || calculatedPrice

    // 7. 创建上架记录
    const { data: listing, error: listingError } = await supabase
      .from('shop_listings')
      .insert({
        shop_id: shopId,
        cloth_id: cloth_id,
        price: finalPrice,
        status: 'active'
      })
      .select()
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { error: '上架失败' },
        { status: 500 }
      )
    }

    // 8. 更新作品状态
    await supabase
      .from('cloths')
      .update({ status: 'listed' })
      .eq('id', cloth_id)

    // 9. 更新商店统计
    await supabase.rpc('increment_shop_listing_count', {
      p_shop_id: shopId
    })

    return NextResponse.json({
      success: true,
      data: {
        listing_id: listing.id,
        cloth_id: cloth_id,
        price: finalPrice,
        calculated_price: calculatedPrice,
        grade: score.grade
      },
      message: '上架成功！'
    })

  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: '上架失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 根据评分计算价格
 */
function calculatePrice(grade: string, totalScore: number): number {
  // 基础价格
  const basePrice = 100

  // 等级系数
  const gradeMultipliers: Record<string, number> = {
    'SSS': 3.0,
    'SS': 2.5,
    'S': 2.0,
    'A': 1.5,
    'B': 1.0,
    'C': 0.5
  }

  const multiplier = gradeMultipliers[grade] || 1.0

  // 计算价格
  const price = Math.round(basePrice * multiplier)

  // 加上分数浮动（每10分+10币）
  const scoreBonus = Math.floor(totalScore / 10) * 10

  return price + scoreBonus
}
