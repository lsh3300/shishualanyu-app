/**
 * 市场API - 获取所有商店的上架作品
 * Market API - Get all listings from all shops
 * 
 * GET /api/market - 获取市场上的所有作品（包括系统商店）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { createErrorResponse } from '@/lib/game/errors'

// 系统商店配置
const SYSTEM_SHOP = {
  id: 'system-shop',
  user_id: 'system',
  shop_name: '蓝染坊·官方店',
  description: '官方精选蓝染作品',
  theme: 'traditional',
  is_system: true
}

// 系统商店的预设作品
const SYSTEM_LISTINGS = [
  {
    id: 'system-listing-1',
    shop_id: 'system-shop',
    seller_id: 'system',
    seller_name: '蓝染坊·官方店',
    cloth_data: {
      id: 'system-cloth-1',
      name: '青花瓷韵',
      pattern: 'wave',
      colors: ['#1e3a5f', '#2d5a87', '#4a90c2', '#87ceeb'],
      technique: 'shibori',
      score: 92,
      grade: 'SS',
      preview_url: null
    },
    price: 150,
    original_price: 150,
    is_featured: true,
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'system-listing-2',
    shop_id: 'system-shop',
    seller_id: 'system',
    seller_name: '蓝染坊·官方店',
    cloth_data: {
      id: 'system-cloth-2',
      name: '靛蓝星空',
      pattern: 'dots',
      colors: ['#0a1628', '#1a3a5c', '#2d5a87', '#ffffff'],
      technique: 'tie-dye',
      score: 85,
      grade: 'S',
      preview_url: null
    },
    price: 100,
    original_price: 100,
    is_featured: false,
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'system-listing-3',
    shop_id: 'system-shop',
    seller_id: 'system',
    seller_name: '蓝染坊·官方店',
    cloth_data: {
      id: 'system-cloth-3',
      name: '海浪纹章',
      pattern: 'stripes',
      colors: ['#1e3a5f', '#3d6a9f', '#5a9fd4', '#b8d4e8'],
      technique: 'batik',
      score: 78,
      grade: 'A',
      preview_url: null
    },
    price: 80,
    original_price: 80,
    is_featured: false,
    status: 'active',
    created_at: new Date().toISOString()
  }
]

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
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: '认证失败', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const currentUserId = authData.user.id

    // 获取所有其他用户的上架作品
    const { data: userListings, error: listingsError } = await supabase
      .from('shop_listings')
      .select(`
        id,
        price,
        original_price,
        is_featured,
        status,
        created_at,
        cloths (
          id,
          name,
          pattern,
          colors,
          technique,
          score,
          grade,
          preview_url
        ),
        user_shops (
          id,
          user_id,
          shop_name
        )
      `)
      .eq('status', 'active')
      .neq('user_shops.user_id', currentUserId)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    // 格式化用户上架的作品
    const formattedUserListings = (userListings || []).map(listing => ({
      id: listing.id,
      shop_id: listing.user_shops?.id,
      seller_id: listing.user_shops?.user_id,
      seller_name: listing.user_shops?.shop_name || '未知商店',
      cloth_data: listing.cloths,
      price: listing.price,
      original_price: listing.original_price,
      is_featured: listing.is_featured,
      status: listing.status,
      created_at: listing.created_at,
      is_system: false
    }))

    // 合并系统商店作品和用户作品
    const allListings = [...SYSTEM_LISTINGS, ...formattedUserListings]

    return NextResponse.json({
      success: true,
      data: {
        listings: allListings,
        systemShop: SYSTEM_SHOP,
        totalCount: allListings.length
      }
    })

  } catch (error: unknown) {
    console.error('获取市场数据错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
