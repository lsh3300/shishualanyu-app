/**
 * 背包服务
 * Inventory Service
 * 
 * 管理用户作品的保存、移动和容量
 */

import { createClient } from '@/lib/supabase/client'
import { InventoryConfig } from '@/lib/game/config'

// 模块级别的 supabase 客户端缓存（用于传入的客户端）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _injectedSupabase: any = null

/**
 * 设置外部注入的 Supabase 客户端
 * 用于 API Route 中传入已认证的客户端
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setSupabaseClient(client: any) {
  _injectedSupabase = client
}

/**
 * 获取 Supabase 客户端
 * 优先使用注入的客户端，否则创建新的（仅客户端）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  // 如果有注入的客户端，优先使用（服务端场景）
  if (_injectedSupabase) {
    return _injectedSupabase
  }
  
  // 客户端场景
  return createClient()
}
import { 
  InventoryFullError, 
  NotFoundError, 
  ClothStatusError,
  GameError 
} from '@/lib/game/errors'
import type { InventoryItem, InventoryCapacity, SlotType } from '@/types/shop.types'

// ============================================================================
// 类型定义
// ============================================================================

export interface SaveToRecentResult {
  success: boolean
  item?: InventoryItem
  message?: string
}

export interface MoveToInventoryResult {
  success: boolean
  item?: InventoryItem
  message?: string
}

// ============================================================================
// 背包服务函数
// ============================================================================

/**
 * 保存作品到最近创作
 */
export async function saveToRecent(
  userId: string,
  clothId: string
): Promise<SaveToRecentResult> {
  const supabase = getSupabase()

  // 检查是否已存在
  const { data: existing } = await supabase
    .from('user_inventory')
    .select('id, slot_type')
    .eq('user_id', userId)
    .eq('cloth_id', clothId)
    .single()

  if (existing) {
    if (existing.slot_type === 'recent') {
      // 更新时间
      await supabase
        .from('user_inventory')
        .update({ added_at: new Date().toISOString() })
        .eq('id', existing.id)
      
      return { success: true, message: '已更新最近创作时间' }
    } else {
      return { success: false, message: '作品已在背包中' }
    }
  }

  // 检查最近创作数量
  const { count } = await supabase
    .from('user_inventory')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('slot_type', 'recent')

  // 如果超过限制，删除最旧的
  if (count && count >= InventoryConfig.maxRecentCreations) {
    const { data: oldest } = await supabase
      .from('user_inventory')
      .select('id, cloth_id')
      .eq('user_id', userId)
      .eq('slot_type', 'recent')
      .order('added_at', { ascending: true })
      .limit(1)
      .single()

    if (oldest) {
      await supabase
        .from('user_inventory')
        .delete()
        .eq('id', oldest.id)

      await supabase
        .from('cloths')
        .update({ is_recent: false })
        .eq('id', oldest.cloth_id)
    }
  }

  // 添加新记录
  const { data: newItem, error } = await supabase
    .from('user_inventory')
    .insert({
      user_id: userId,
      cloth_id: clothId,
      slot_type: 'recent',
      added_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('保存到最近创作失败:', error)
    throw new GameError('保存失败', 'SAVE_ERROR', 500)
  }

  // 更新作品状态
  await supabase
    .from('cloths')
    .update({ 
      status: 'draft',
      is_recent: true 
    })
    .eq('id', clothId)

  return { success: true, item: newItem }
}

/**
 * 移动作品到背包
 */
export async function moveToInventory(
  userId: string,
  clothId: string
): Promise<MoveToInventoryResult> {
  const supabase = getSupabase()

  // 获取背包容量
  const capacity = await getInventoryCapacity(userId)
  
  // 检查容量
  if (capacity.current >= capacity.max) {
    throw new InventoryFullError(capacity.current, capacity.max)
  }

  // 检查作品是否存在于最近创作
  const { data: existing } = await supabase
    .from('user_inventory')
    .select('id, slot_type')
    .eq('user_id', userId)
    .eq('cloth_id', clothId)
    .single()

  if (existing) {
    if (existing.slot_type === 'inventory') {
      return { success: false, message: '作品已在背包中' }
    }

    // 从最近创作移动到背包
    const { data: updated, error } = await supabase
      .from('user_inventory')
      .update({ 
        slot_type: 'inventory',
        added_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw new GameError('移动失败', 'MOVE_ERROR', 500)
    }

    // 更新作品状态
    await supabase
      .from('cloths')
      .update({ 
        status: 'in_inventory',
        is_recent: false 
      })
      .eq('id', clothId)

    return { success: true, item: updated }
  }

  // 作品不在任何位置，直接添加到背包
  const { data: newItem, error } = await supabase
    .from('user_inventory')
    .insert({
      user_id: userId,
      cloth_id: clothId,
      slot_type: 'inventory',
      added_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new GameError('保存到背包失败', 'SAVE_ERROR', 500)
  }

  // 更新作品状态
  await supabase
    .from('cloths')
    .update({ 
      status: 'in_inventory',
      is_recent: false 
    })
    .eq('id', clothId)

  return { success: true, item: newItem }
}

/**
 * 获取背包容量信息（优化版：并行查询）
 */
export async function getInventoryCapacity(userId: string): Promise<InventoryCapacity> {
  const supabase = getSupabase()

  // 并行获取所有数据
  const [shopResult, inventoryCountResult, recentCountResult] = await Promise.all([
    supabase
      .from('user_shops')
      .select('max_inventory_size')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('user_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('slot_type', 'inventory'),
    supabase
      .from('user_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('slot_type', 'recent')
  ])

  const maxInventory = shopResult.data?.max_inventory_size || InventoryConfig.defaultMaxInventory

  return {
    current: inventoryCountResult.count || 0,
    max: maxInventory,
    recentCount: recentCountResult.count || 0,
    maxRecent: InventoryConfig.maxRecentCreations
  }
}

/**
 * 获取用户背包列表
 */
export async function getInventoryItems(
  userId: string,
  slotType?: SlotType
): Promise<InventoryItem[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('user_inventory')
    .select(`
      *,
      cloth:cloths(
        id,
        layers,
        status,
        created_at,
        cloth_scores(
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
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (slotType) {
    query = query.eq('slot_type', slotType)
  }

  const { data, error } = await query

  if (error) {
    console.error('获取背包列表失败:', error)
    throw new GameError('获取背包失败', 'QUERY_ERROR', 500)
  }

  return data || []
}

/**
 * 从背包删除作品
 */
export async function removeFromInventory(
  userId: string,
  clothId: string
): Promise<boolean> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('user_inventory')
    .delete()
    .eq('user_id', userId)
    .eq('cloth_id', clothId)

  if (error) {
    console.error('删除背包项失败:', error)
    throw new GameError('删除失败', 'DELETE_ERROR', 500)
  }

  // 更新作品状态
  await supabase
    .from('cloths')
    .update({ 
      status: 'draft',
      is_recent: false 
    })
    .eq('id', clothId)

  return true
}

/**
 * 扩容背包
 */
export async function expandInventory(userId: string): Promise<{
  success: boolean
  newMax: number
  cost: number
}> {
  const supabase = getSupabase()

  // 获取当前容量和用户货币
  const { data: shop } = await supabase
    .from('user_shops')
    .select('max_inventory_size')
    .eq('user_id', userId)
    .single()

  const { data: profile } = await supabase
    .from('player_profile')
    .select('currency')
    .eq('user_id', userId)
    .single()

  const currentMax = shop?.max_inventory_size || InventoryConfig.defaultMaxInventory
  const currentCurrency = profile?.currency || 0
  const cost = InventoryConfig.expansionCost

  // 检查货币是否足够
  if (currentCurrency < cost) {
    throw new GameError(
      '货币不足',
      'INSUFFICIENT_CURRENCY',
      400,
      `扩容需要 ${cost} 蓝草币，当前只有 ${currentCurrency}`
    )
  }

  const newMax = currentMax + InventoryConfig.expansionSlots

  // 更新背包容量
  await supabase
    .from('user_shops')
    .update({ max_inventory_size: newMax })
    .eq('user_id', userId)

  // 扣除货币
  await supabase
    .from('player_profile')
    .update({ currency: currentCurrency - cost })
    .eq('user_id', userId)

  return {
    success: true,
    newMax,
    cost
  }
}
