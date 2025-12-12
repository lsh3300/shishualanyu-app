/**
 * 市场购买API - 购买其他商店的作品
 * Market Purchase API - Buy listings from other shops
 * 
 * POST /api/market/purchase - 购买作品
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { createErrorResponse, ValidationError } from '@/lib/game/errors'

// 系统商店的预设作品（与 market/route.ts 保持一致）
const SYSTEM_LISTINGS: Record<string, {
  id: string
  price: number
  cloth_data: {
    id: string
    name: string
    pattern: string
    colors: string[]
    technique: string
    score: number
    grade: string
  }
}> = {
  'system-listing-1': {
    id: 'system-listing-1',
    price: 150,
    cloth_data: {
      id: 'system-cloth-1',
      name: '青花瓷韵',
      pattern: 'wave',
      colors: ['#1e3a5f', '#2d5a87', '#4a90c2', '#87ceeb'],
      technique: 'shibori',
      score: 92,
      grade: 'SS'
    }
  },
  'system-listing-2': {
    id: 'system-listing-2',
    price: 100,
    cloth_data: {
      id: 'system-cloth-2',
      name: '靛蓝星空',
      pattern: 'dots',
      colors: ['#0a1628', '#1a3a5c', '#2d5a87', '#ffffff'],
      technique: 'tie-dye',
      score: 85,
      grade: 'S'
    }
  },
  'system-listing-3': {
    id: 'system-listing-3',
    price: 80,
    cloth_data: {
      id: 'system-cloth-3',
      name: '海浪纹章',
      pattern: 'stripes',
      colors: ['#1e3a5f', '#3d6a9f', '#5a9fd4', '#b8d4e8'],
      technique: 'batik',
      score: 78,
      grade: 'A'
    }
  }
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
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: '认证失败', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const buyerId = authData.user.id

    const body = await request.json()
    const { listing_id } = body

    if (!listing_id) {
      throw new ValidationError('缺少 listing_id 参数', 'listing_id')
    }

    // 检查是否是系统商店的作品
    const isSystemListing = listing_id.startsWith('system-listing-')
    
    if (isSystemListing) {
      // 处理系统商店购买
      const systemListing = SYSTEM_LISTINGS[listing_id]
      if (!systemListing) {
        return NextResponse.json({
          success: false,
          error: { code: 'NOT_FOUND', userMessage: '作品不存在' }
        }, { status: 404 })
      }

      // 获取买家信息
      const { data: buyerProfile, error: buyerError } = await supabase
        .from('player_profile')
        .select('currency, user_id')
        .eq('user_id', buyerId)
        .single()

      if (buyerError || !buyerProfile) {
        return NextResponse.json({
          success: false,
          error: { code: 'BUYER_NOT_FOUND', userMessage: '获取用户信息失败' }
        }, { status: 400 })
      }

      // 检查货币是否足够
      if (buyerProfile.currency < systemListing.price) {
        return NextResponse.json({
          success: false,
          error: { 
            code: 'INSUFFICIENT_FUNDS', 
            userMessage: `货币不足，需要 ${systemListing.price} 币，当前只有 ${buyerProfile.currency} 币` 
          }
        }, { status: 400 })
      }

      // 检查背包容量
      const { data: inventory } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', buyerId)

      const { data: profile } = await supabase
        .from('player_profile')
        .select('max_inventory')
        .eq('user_id', buyerId)
        .single()

      const maxInventory = profile?.max_inventory || 20
      const currentCount = inventory?.length || 0

      if (currentCount >= maxInventory) {
        return NextResponse.json({
          success: false,
          error: { code: 'INVENTORY_FULL', userMessage: '背包已满，请先扩容或清理背包' }
        }, { status: 400 })
      }

      // 扣除买家货币
      const newCurrency = buyerProfile.currency - systemListing.price
      await supabase
        .from('player_profile')
        .update({ currency: newCurrency })
        .eq('user_id', buyerId)

      // 创建布料记录
      const { data: newCloth, error: clothError } = await supabase
        .from('cloths')
        .insert({
          user_id: buyerId,
          name: systemListing.cloth_data.name,
          pattern: systemListing.cloth_data.pattern,
          colors: systemListing.cloth_data.colors,
          technique: systemListing.cloth_data.technique,
          score: systemListing.cloth_data.score,
          grade: systemListing.cloth_data.grade
        })
        .select('id')
        .single()

      if (clothError) {
        // 回滚货币
        await supabase
          .from('player_profile')
          .update({ currency: buyerProfile.currency })
          .eq('user_id', buyerId)
        
        console.error('创建布料失败:', clothError)
        return NextResponse.json({
          success: false,
          error: { code: 'CREATE_CLOTH_FAILED', userMessage: '创建作品失败' }
        }, { status: 500 })
      }

      // 添加到买家背包
      await supabase
        .from('user_inventory')
        .insert({
          user_id: buyerId,
          cloth_id: newCloth.id,
          source: 'purchase'
        })

      // 记录交易
      await supabase
        .from('transactions')
        .insert({
          buyer_id: buyerId,
          seller_id: 'system',
          cloth_id: newCloth.id,
          listing_price: systemListing.price,
          actual_price: systemListing.price,
          transaction_type: 'player_purchase'
        })

      return NextResponse.json({
        success: true,
        message: `成功购买 ${systemListing.cloth_data.name}`,
        data: {
          cloth_id: newCloth.id,
          price: systemListing.price,
          new_currency: newCurrency
        }
      })
    } else {
      // 处理用户商店购买（原有逻辑）
      // 获取上架信息
      const { data: listing, error: listingError } = await supabase
        .from('shop_listings')
        .select(`
          id,
          price,
          cloth_id,
          status,
          user_shops (
            user_id,
            shop_name
          ),
          cloths (
            id,
            name
          )
        `)
        .eq('id', listing_id)
        .single()

      if (listingError || !listing) {
        return NextResponse.json({
          success: false,
          error: { code: 'NOT_FOUND', userMessage: '作品不存在或已下架' }
        }, { status: 404 })
      }

      if (listing.status !== 'active') {
        return NextResponse.json({
          success: false,
          error: { code: 'NOT_AVAILABLE', userMessage: '该作品已下架' }
        }, { status: 400 })
      }

      // @ts-expect-error - Supabase returns single object for single relation
      const sellerId = listing.user_shops?.user_id as string | undefined

      // 不能购买自己的作品
      if (sellerId === buyerId) {
        return NextResponse.json({
          success: false,
          error: { code: 'SELF_PURCHASE', userMessage: '不能购买自己的作品' }
        }, { status: 400 })
      }

      // 获取买家信息
      const { data: buyerProfile } = await supabase
        .from('player_profile')
        .select('currency')
        .eq('user_id', buyerId)
        .single()

      if (!buyerProfile || buyerProfile.currency < listing.price) {
        return NextResponse.json({
          success: false,
          error: { 
            code: 'INSUFFICIENT_FUNDS', 
            userMessage: `货币不足，需要 ${listing.price} 币` 
          }
        }, { status: 400 })
      }

      // 扣除买家货币
      await supabase
        .from('player_profile')
        .update({ currency: buyerProfile.currency - listing.price })
        .eq('user_id', buyerId)

      // 增加卖家货币
      const { data: sellerProfile } = await supabase
        .from('player_profile')
        .select('currency')
        .eq('user_id', sellerId)
        .single()

      if (sellerProfile) {
        await supabase
          .from('player_profile')
          .update({ currency: sellerProfile.currency + listing.price })
          .eq('user_id', sellerId)
      }

      // 转移布料所有权
      await supabase
        .from('cloths')
        .update({ user_id: buyerId })
        .eq('id', listing.cloth_id)

      // 添加到买家背包
      await supabase
        .from('user_inventory')
        .insert({
          user_id: buyerId,
          cloth_id: listing.cloth_id,
          source: 'purchase'
        })

      // 从卖家背包移除
      await supabase
        .from('user_inventory')
        .delete()
        .eq('user_id', sellerId)
        .eq('cloth_id', listing.cloth_id)

      // 更新上架状态
      await supabase
        .from('shop_listings')
        .update({ status: 'sold' })
        .eq('id', listing_id)

      // 记录交易
      await supabase
        .from('transactions')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          cloth_id: listing.cloth_id,
          listing_id: listing_id,
          listing_price: listing.price,
          actual_price: listing.price,
          transaction_type: 'player_purchase'
        })

      // @ts-expect-error - Supabase returns single object for single relation
      const clothName = listing.cloths?.name as string | undefined
      
      return NextResponse.json({
        success: true,
        message: `成功购买 ${clothName || '作品'}`,
        data: {
          cloth_id: listing.cloth_id,
          price: listing.price,
          new_currency: buyerProfile.currency - listing.price
        }
      })
    }

  } catch (error: unknown) {
    console.error('购买作品错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
