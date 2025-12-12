/**
 * 道具服务
 * Item Service
 * 
 * 管理道具购买、查询等功能
 */

import { createServiceClient } from '@/lib/supabaseClient'
import { ItemShopConfig, getItemById } from '@/lib/game/config'
import type { ShopItem, UserItem } from '@/types/items.types'

// ============================================================================
// 类型定义
// ============================================================================

export interface PurchaseResult {
  success: boolean
  message?: string
  data?: {
    item_id: string
    quantity: number
    new_currency: number
  }
}

export interface UserItemsResult {
  success: boolean
  items: Record<string, number>
}

// ============================================================================
// 道具服务函数
// ============================================================================

/**
 * 获取所有可购买的道具
 */
export function getShopItems(): ShopItem[] {
  return ItemShopConfig.items
}

/**
 * 获取用户持有的道具
 */
export async function getUserItems(userId: string): Promise<UserItemsResult & { activeItems?: Record<string, boolean> }> {
  const supabase = createServiceClient()

  try {
    console.log('获取用户道具, userId:', userId)
    
    const { data, error } = await supabase
      .from('user_items')
      .select('item_id, quantity, is_active')
      .eq('user_id', userId)

    console.log('用户道具查询结果:', { data, error })

    if (error) {
      console.error('获取用户道具失败:', error)
      // 如果表不存在，返回空对象而不是报错
      if (error.code === '42P01') {
        console.warn('user_items 表不存在，请运行迁移')
        return { success: true, items: {}, activeItems: {} }
      }
      return { success: false, items: {}, activeItems: {} }
    }

    // 转换为 Record<item_id, quantity> 格式
    const items: Record<string, number> = {}
    const activeItems: Record<string, boolean> = {}
    for (const item of data || []) {
      items[item.item_id] = item.quantity
      activeItems[item.item_id] = item.is_active ?? true
    }

    console.log('用户道具映射:', items)
    return { success: true, items, activeItems }
  } catch (error) {
    console.error('获取用户道具失败:', error)
    return { success: false, items: {}, activeItems: {} }
  }
}

/**
 * 购买道具
 */
export async function purchaseItem(
  userId: string,
  itemId: string,
  quantity: number = 1
): Promise<PurchaseResult> {
  const supabase = createServiceClient()

  try {
    // 获取道具信息
    const item = getItemById(itemId)
    if (!item) {
      return { success: false, message: '道具不存在' }
    }

    // 永久道具只能购买一次
    if (item.type === 'permanent') {
      const { data: existing } = await supabase
        .from('user_items')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle()

      if (existing) {
        return { success: false, message: '该道具已拥有，无法重复购买' }
      }
      quantity = 1 // 永久道具强制数量为1
    }

    const totalCost = item.price * quantity

    // 获取用户货币
    const { data: profile, error: profileError } = await supabase
      .from('player_profile')
      .select('currency')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, message: '获取用户信息失败' }
    }

    // 检查货币是否足够
    if (profile.currency < totalCost) {
      return { 
        success: false, 
        message: `货币不足，需要 ${totalCost} 币，当前只有 ${profile.currency} 币` 
      }
    }

    // 扣除货币
    const newCurrency = profile.currency - totalCost
    await supabase
      .from('player_profile')
      .update({ currency: newCurrency })
      .eq('user_id', userId)

    // 添加或更新道具
    console.log('查询现有道具, userId:', userId, 'itemId:', itemId)
    const { data: existingItem, error: queryError } = await supabase
      .from('user_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle()

    console.log('现有道具查询结果:', { existingItem, queryError })

    if (existingItem) {
      // 更新数量
      const { error: updateError } = await supabase
        .from('user_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
      
      if (updateError) {
        console.error('更新道具数量失败:', updateError)
        // 回滚货币
        await supabase
          .from('player_profile')
          .update({ currency: profile.currency })
          .eq('user_id', userId)
        return { success: false, message: '保存道具失败: ' + updateError.message }
      }
      console.log('道具数量已更新')
    } else {
      // 新增记录
      const { error: insertError } = await supabase
        .from('user_items')
        .insert({
          user_id: userId,
          item_id: itemId,
          quantity
        })
      
      if (insertError) {
        console.error('插入道具失败:', insertError)
        // 回滚货币
        await supabase
          .from('player_profile')
          .update({ currency: profile.currency })
          .eq('user_id', userId)
        return { success: false, message: '保存道具失败: ' + insertError.message }
      }
      console.log('新道具已插入')
    }

    // 处理特殊道具效果
    await applyItemEffect(userId, item, quantity)

    return {
      success: true,
      message: `成功购买 ${item.name} x${quantity}`,
      data: {
        item_id: itemId,
        quantity,
        new_currency: newCurrency
      }
    }
  } catch (error) {
    console.error('购买道具失败:', error)
    return { success: false, message: '购买失败，请稍后重试' }
  }
}

/**
 * 使用道具
 */
export async function useItem(
  userId: string,
  itemId: string,
  quantity: number = 1
): Promise<{ success: boolean; message?: string }> {
  const supabase = createServiceClient()

  try {
    const item = getItemById(itemId)
    if (!item) {
      return { success: false, message: '道具不存在' }
    }

    // 永久道具不能使用
    if (item.type === 'permanent') {
      return { success: false, message: '该道具为永久道具，无需使用' }
    }

    // 检查用户是否拥有足够数量
    const { data: userItem } = await supabase
      .from('user_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle()

    if (!userItem || userItem.quantity < quantity) {
      return { success: false, message: '道具数量不足' }
    }

    // 应用道具效果
    const effectResult = await applyConsumableEffect(userId, item, quantity)
    if (!effectResult.success) {
      return effectResult
    }

    // 扣除道具
    const newQuantity = userItem.quantity - quantity
    if (newQuantity <= 0) {
      await supabase
        .from('user_items')
        .delete()
        .eq('id', userItem.id)
    } else {
      await supabase
        .from('user_items')
        .update({ quantity: newQuantity })
        .eq('id', userItem.id)
    }

    return { success: true, message: effectResult.message || `成功使用 ${item.name}` }
  } catch (error) {
    console.error('使用道具失败:', error)
    return { success: false, message: '使用失败，请稍后重试' }
  }
}

/**
 * 应用道具效果（购买时立即生效的永久道具）
 */
async function applyItemEffect(
  userId: string,
  item: ShopItem,
  quantity: number
): Promise<void> {
  const supabase = createServiceClient()

  switch (item.effect) {
    case 'recent_slot':
      // 增加最近创作槽位
      // 这里需要在 player_profile 或 user_shops 中添加字段
      // 暂时跳过，后续可扩展
      break

    case 'exp_boost':
      // 经验药水：立即增加经验
      const expAmount = 50 * quantity
      const { data: profile } = await supabase
        .from('player_profile')
        .select('exp')
        .eq('user_id', userId)
        .single()
      
      if (profile) {
        await supabase
          .from('player_profile')
          .update({ exp: profile.exp + expAmount })
          .eq('user_id', userId)
      }
      break

    default:
      // 其他道具效果在使用时处理
      break
  }
}

/**
 * 应用消耗品道具效果
 */
async function applyConsumableEffect(
  userId: string,
  item: ShopItem,
  quantity: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = createServiceClient()

  try {
    switch (item.effect) {
      case 'exp_boost':
        // 经验药水：立即增加经验
        const expAmount = 50 * quantity
        const { data: profile } = await supabase
          .from('player_profile')
          .select('exp, level')
          .eq('user_id', userId)
          .single()
        
        if (profile) {
          await supabase
            .from('player_profile')
            .update({ exp: profile.exp + expAmount })
            .eq('user_id', userId)
          
          return { 
            success: true, 
            message: `成功使用 ${item.name}，获得 ${expAmount} 点经验` 
          }
        }
        break

      case 'frame_gold':
      case 'frame_silver':
        // 画框道具：提示用户在上架时可以选择使用
        return { 
          success: true, 
          message: `${item.name} 已准备就绪，上架作品时可以使用` 
        }

      case 'score_boost':
        // 幸运染料：提示用户在评分时生效
        return { 
          success: true, 
          message: `${item.name} 已激活，下次评分时有机会提升等级` 
        }

      default:
        return { 
          success: true, 
          message: `成功使用 ${item.name}` 
        }
    }

    return { success: false, message: '道具效果应用失败' }
  } catch (error) {
    console.error('应用道具效果失败:', error)
    return { success: false, message: '道具效果应用失败' }
  }
}
