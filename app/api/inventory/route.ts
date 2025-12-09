/**
 * 背包查看API
 * GET /api/inventory
 * 
 * 获取用户的背包内容（最近创作 + 背包作品）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // 验证用户（支持测试模式）
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 测试模式：如果没有用户，使用固定的测试用户ID（有效UUID格式）
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    const isTestMode = !user
    
    if (isTestMode) {
      console.log('🧪 测试模式：查询背包', userId)
    }

    // 获取最近创作（最新5个）
    const { data: recentItems, error: recentError } = await supabase
      .from('user_inventory')
      .select(`
        id,
        cloth_id,
        added_at,
        cloths (
          id,
          layers,
          created_at,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('slot_type', 'recent')
      .order('added_at', { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    // 获取背包作品
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('user_inventory')
      .select(`
        id,
        cloth_id,
        added_at,
        cloths (
          id,
          layers,
          created_at,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('slot_type', 'inventory')
      .order('added_at', { ascending: false })

    if (inventoryError) throw inventoryError

    // 获取容量信息（测试模式下可能没有shop记录）
    const { data: shop } = await supabase
      .from('user_shops')
      .select('max_inventory_slots')
      .eq('user_id', userId)
      .maybeSingle()

    const maxSlots = shop?.max_inventory_slots || 20
    const currentCount = inventoryItems?.length || 0

    // 为每个作品获取评分信息
    const enrichedRecent = await Promise.all(
      (recentItems || []).map(async (item: any) => {
        if (item.cloths) {
          // 使用maybeSingle避免没有评分时报错
          const { data: score } = await supabase
            .from('cloth_scores')
            .select('*')
            .eq('cloth_id', item.cloth_id)
            .maybeSingle()

          return {
            ...item,
            cloth: {
              ...item.cloths,
              score_data: score || null
            }
          }
        }
        return item
      })
    )

    const enrichedInventory = await Promise.all(
      (inventoryItems || []).map(async (item: any) => {
        if (item.cloths) {
          // 使用maybeSingle避免没有评分时报错
          const { data: score } = await supabase
            .from('cloth_scores')
            .select('*')
            .eq('cloth_id', item.cloth_id)
            .maybeSingle()

          return {
            ...item,
            cloth: {
              ...item.cloths,
              score_data: score || null
            }
          }
        }
        return item
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        recent: enrichedRecent,
        inventory: enrichedInventory,
        capacity: {
          current: currentCount,
          max: maxSlots
        }
      }
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: '获取背包失败' },
      { status: 500 }
    )
  }
}
