/**
 * 背包服务
 * Inventory Service
 * 
 * 管理用户背包和最近创作
 */

import { createClient } from '@/lib/supabase/client'
import type { InventoryItem, SlotType, InventoryCapacity } from '@/types/shop.types'

// ============================================================================
// 背包管理
// ============================================================================

/**
 * 保存作品到背包
 */
export async function saveToInventory(
  userId: string,
  clothId: string,
  slotType: SlotType = 'inventory'
): Promise<{ success: boolean; message?: string; item?: InventoryItem }> {
  const supabase = createClient()

  try {
    // 1. 检查背包容量
    if (slotType === 'inventory') {
      const capacity = await getInventoryCapacity(userId)
      if (capacity.current >= capacity.max) {
        return {
          success: false,
          message: '背包已满，请扩容或删除一些作品'
        }
      }
    }

    // 2. 如果是保存到背包，检查"最近创作"中是否已存在
    if (slotType === 'inventory') {
      const { data: existing } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('cloth_id', clothId)
        .eq('slot_type', 'recent')
        .single()

      if (existing) {
        // 从"最近创作"移到"背包"
        const { error } = await supabase
          .from('user_inventory')
          .update({
            slot_type: 'inventory',
            added_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (error) throw error

        // 更新作品状态
        await updateClothStatus(clothId, 'in_inventory')

        return {
          success: true,
          message: '已从最近创作移至背包'
        }
      }
    }

    // 3. 添加到背包
    const { data: item, error } = await supabase
      .from('user_inventory')
      .insert({
        user_id: userId,
        cloth_id: clothId,
        slot_type: slotType,
        added_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // 4. 更新作品状态
    await updateClothStatus(clothId, slotType === 'inventory' ? 'in_inventory' : 'draft')

    // 5. 如果是"最近创作"，清理超过5个的旧记录
    if (slotType === 'recent') {
      await cleanupRecentCreations(userId)
    }

    return {
      success: true,
      message: slotType === 'inventory' ? '已保存到背包' : '已添加到最近创作',
      item
    }
  } catch (error) {
    console.error('Error saving to inventory:', error)
    return {
      success: false,
      message: '保存失败'
    }
  }
}

/**
 * 获取背包内容
 */
export async function getInventory(
  userId: string,
  slotType?: SlotType
): Promise<InventoryItem[]> {
  const supabase = createClient()

  try {
    let query = supabase
      .from('user_inventory')
      .select(`
        *,
        cloth:cloths (
          id,
          user_id,
          cloth_data,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (slotType) {
      query = query.eq('slot_type', slotType)
    }

    const { data, error } = await query

    if (error) throw error

    // 加载评分信息
    const itemsWithScores = await Promise.all(
      (data || []).map(async (item) => {
        if (item.cloth) {
          const { data: score } = await supabase
            .from('cloth_scores')
            .select('*')
            .eq('cloth_id', item.cloth.id)
            .single()

          return {
            ...item,
            cloth: {
              ...item.cloth,
              score_data: score
            }
          }
        }
        return item
      })
    )

    return itemsWithScores
  } catch (error) {
    console.error('Error getting inventory:', error)
    return []
  }
}

/**
 * 从背包删除作品
 */
export async function removeFromInventory(
  userId: string,
  clothId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = createClient()

  try {
    // 1. 检查作品是否已上架
    const { data: listing } = await supabase
      .from('shop_listings')
      .select('id')
      .eq('cloth_id', clothId)
      .eq('status', 'listed')
      .single()

    if (listing) {
      return {
        success: false,
        message: '作品已上架，请先下架'
      }
    }

    // 2. 从背包删除
    const { error } = await supabase
      .from('user_inventory')
      .delete()
      .eq('user_id', userId)
      .eq('cloth_id', clothId)

    if (error) throw error

    // 3. 删除作品（可选，或者只是标记为删除）
    await supabase
      .from('cloths')
      .delete()
      .eq('id', clothId)
      .eq('user_id', userId)

    return {
      success: true,
      message: '已删除'
    }
  } catch (error) {
    console.error('Error removing from inventory:', error)
    return {
      success: false,
      message: '删除失败'
    }
  }
}

/**
 * 获取背包容量信息
 */
export async function getInventoryCapacity(userId: string): Promise<InventoryCapacity> {
  const supabase = createClient()

  try {
    // 获取商店信息（包含最大容量）
    const { data: shop } = await supabase
      .from('user_shops')
      .select('max_inventory_size')
      .eq('user_id', userId)
      .single()

    // 获取当前数量
    const { count } = await supabase
      .from('user_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('slot_type', 'inventory')

    const max = shop?.max_inventory_size || 20
    const current = count || 0

    // 计算扩容价格（每次+10个，价格递增）
    const expansions = Math.floor((max - 20) / 10)
    const expansion_cost = (expansions + 1) * 200 // 200, 400, 600...

    return {
      current,
      max,
      expansion_cost
    }
  } catch (error) {
    console.error('Error getting inventory capacity:', error)
    return {
      current: 0,
      max: 20,
      expansion_cost: 200
    }
  }
}

/**
 * 扩容背包
 */
export async function expandInventory(
  userId: string
): Promise<{ success: boolean; message?: string; new_max?: number }> {
  const supabase = createClient()

  try {
    // 1. 获取当前容量和价格
    const capacity = await getInventoryCapacity(userId)

    if (!capacity.expansion_cost) {
      return {
        success: false,
        message: '已达到最大容量'
      }
    }

    // 2. 检查金币是否足够
    const { data: profile } = await supabase
      .from('player_profile')
      .select('currency')
      .eq('user_id', userId)
      .single()

    if (!profile || profile.currency < capacity.expansion_cost) {
      return {
        success: false,
        message: `金币不足，需要${capacity.expansion_cost}币`
      }
    }

    // 3. 扣除金币
    const { error: deductError } = await supabase
      .from('player_profile')
      .update({
        currency: profile.currency - capacity.expansion_cost
      })
      .eq('user_id', userId)

    if (deductError) throw deductError

    // 4. 增加容量
    const new_max = capacity.max + 10
    const { error: updateError } = await supabase
      .from('user_shops')
      .update({
        max_inventory_size: new_max
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

    return {
      success: true,
      message: `背包扩容成功！现在可存放${new_max}件作品`,
      new_max
    }
  } catch (error) {
    console.error('Error expanding inventory:', error)
    return {
      success: false,
      message: '扩容失败'
    }
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 更新作品状态
 */
async function updateClothStatus(clothId: string, status: string): Promise<void> {
  const supabase = createClient()

  await supabase
    .from('cloths')
    .update({
      status,
      saved_at: status === 'in_inventory' ? new Date().toISOString() : null
    })
    .eq('id', clothId)
}

/**
 * 清理"最近创作"，保留最新5个
 */
async function cleanupRecentCreations(userId: string): Promise<void> {
  const supabase = createClient()

  try {
    // 获取所有"最近创作"
    const { data: recent } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('slot_type', 'recent')
      .order('added_at', { ascending: false })

    if (recent && recent.length > 5) {
      // 删除超过5个的旧记录
      const toDelete = recent.slice(5).map(item => item.id)
      await supabase
        .from('user_inventory')
        .delete()
        .in('id', toDelete)
    }
  } catch (error) {
    console.error('Error cleaning up recent creations:', error)
  }
}
