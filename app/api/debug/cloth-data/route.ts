/**
 * 调试API - 检查作品数据
 * GET /api/debug/cloth-data?cloth_id=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    const url = new URL(request.url)
    const clothId = url.searchParams.get('cloth_id')
    
    if (clothId) {
      // 查询特定作品
      const { data: cloth, error } = await supabase
        .from('cloths')
        .select('*')
        .eq('id', clothId)
        .single()
      
      return NextResponse.json({
        success: true,
        cloth,
        error,
        layersInfo: {
          exists: !!cloth?.layers,
          type: typeof cloth?.layers,
          isArray: Array.isArray(cloth?.layers),
          length: cloth?.layers?.length,
          sample: cloth?.layers?.[0]
        }
      })
    }
    
    // 查询所有上架的作品
    const { data: listings, error: listingsError } = await supabase
      .from('shop_listings')
      .select(`
        id,
        cloth_id,
        price,
        status,
        cloth:cloths (
          id,
          layers,
          status,
          creator_id
        )
      `)
      .eq('status', 'listed')
      .limit(5)
    
    return NextResponse.json({
      success: true,
      listings,
      error: listingsError,
      listingsInfo: listings?.map(l => ({
        listingId: l.id,
        clothId: l.cloth_id,
        hasCloth: !!l.cloth,
        hasLayers: !!l.cloth?.layers,
        layersType: typeof l.cloth?.layers,
        layersIsArray: Array.isArray(l.cloth?.layers),
        layersLength: l.cloth?.layers?.length,
        layersSample: l.cloth?.layers?.[0]
      }))
    })
    
  } catch (error) {
    console.error('调试API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
