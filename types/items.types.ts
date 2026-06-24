/**
 * 道具系统类型定义
 * Item System Types
 */

/**
 * 道具类型
 */
export type ItemType = 'consumable' | 'permanent'

/**
 * 道具效果类型
 */
export type ItemEffect = 
  | 'score_boost'    // 评分提升
  | 'frame_gold'     // 金色画框
  | 'frame_silver'   // 银色画框
  | 'vip_badge'      // VIP徽章
  | 'recent_slot'    // 最近创作槽位
  | 'exp_boost'      // 经验加成

/**
 * 商店道具定义
 */
export interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  price: number
  type: ItemType
  effect: ItemEffect
}

/**
 * 用户持有的道具
 */
export interface UserItem {
  id: string
  user_id: string
  item_id: string
  quantity: number
  acquired_at: string
}

/**
 * 道具购买请求
 */
export interface PurchaseItemRequest {
  item_id: string
  quantity?: number
}

/**
 * 道具购买响应
 */
export interface PurchaseItemResponse {
  success: boolean
  message?: string
  data?: {
    item_id: string
    quantity: number
    new_currency: number
  }
}
