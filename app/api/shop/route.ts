/**
 * 商店API
 * GET /api/shop - 获取当前用户的商店信息
 * POST /api/shop - 创建或更新商店
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 用户认证函数
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
  
  if (!token) {
    return { userId: null, error: 'Missing authorization token' }
  }
  
  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    return { userId: null, error: 'Invalid token' }
  }
  
  return { userId: data.user.id, error: null }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const supabase = createServiceClient()
    
    // 获取或创建商店
    let { data: shop, error: shopError } = await supabase
      .from('user_shops')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (shopError) {
      console.error('获取商店失败:', shopError)
      return NextResponse.json(
        { error: '获取商店失败', code: 'SHOP_FETCH_ERROR' },
        { status: 500 }
      )
    }

    // 如果商店不存在，创建一个
    if (!shop) {
      const { data: newShop, error: createError } = await supabase
        .from('user_shops')
        .insert({
          user_id: userId,
          shop_name: '我的蓝染坊'
        })
        .select()
        .single()

      if (createError) {
        console.error('创建商店失败:', createError)
        return NextResponse.json(
          { error: '创建商店失败', code: 'SHOP_CREATE_ERROR' },
          { status: 500 }
        )
      }
      
      shop = newShop
    }

    // 获取上架作品数量
    const { count: listingCount } = await supabase
      .from('shop_listings')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shop.id)
      .eq('status', 'listed')

    // 获取上架作品列表（一次性获取所有关联数据，避免 N+1 查询）
    const { data: listings, error: listingsError } = await supabase
      .from('shop_listings')
      .select(`
        *,
        cloth:cloths (
          id,
          layers,
          status,
          created_at,
          cloth_scores (
            total_score,
            grade,
            color_score,
            pattern_score,
            creativity_score,
            technique_score,
            created_at
          )
        )
      `)
      .eq('shop_id', shop.id)
      .eq('status', 'listed')
      .order('is_featured', { ascending: false })
      .order('listed_at', { ascending: false })

    // 转换数据格式（评分数据已经嵌套获取，无需额外查询）
    const listingsWithScores = (listings || []).map((listing) => {
      if (listing.cloth) {
        const scores = listing.cloth.cloth_scores || []
        const latestScore = scores.length > 0 ? scores[0] : null
        return {
          ...listing,
          cloth: {
            id: listing.cloth.id,
            layers: listing.cloth.layers,
            status: listing.cloth.status,
            created_at: listing.cloth.created_at,
            score_data: latestScore
          }
        }
      }
      return listing
    })

    return NextResponse.json({
      success: true,
      data: {
        shop,
        listings: listingsWithScores,
        listingCount: listingCount || 0
      }
    })

  } catch (error) {
    console.error('商店API错误:', error)
    return NextResponse.json(
      { error: '服务器错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const supabase = createServiceClient()
    const body = await request.json()
    const { shop_name, theme, character_customization } = body

    // 更新商店信息
    const updates: any = {
      updated_at: new Date().toISOString()
    }
    
    if (shop_name) updates.shop_name = shop_name
    if (theme) updates.theme = theme
    if (character_customization) updates.character_customization = character_customization

    const { data: shop, error: updateError } = await supabase
      .from('user_shops')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('更新商店失败:', updateError)
      return NextResponse.json(
        { error: '更新商店失败', code: 'SHOP_UPDATE_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: shop,
      message: '商店更新成功'
    })

  } catch (error) {
    console.error('商店API错误:', error)
    return NextResponse.json(
      { error: '服务器错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
