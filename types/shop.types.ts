/**
 * 商店游戏系统类型定义
 * Shop Game System Types
 */

import type { ClothScore } from './game.types'

// ============================================================================
// 作品相关
// ============================================================================

/**
 * 作品状态
 */
export type ClothStatus = 'draft' | 'in_inventory' | 'listed' | 'sold'

/**
 * 背包插槽类型
 */
export type SlotType = 'inventory' | 'recent'

/**
 * 背包中的作品
 */
export interface InventoryItem {
  id: string
  user_id: string
  cloth_id: string
  slot_type: SlotType
  added_at: string
  sort_order: number
  
  // 关联的作品信息（从cloth_scores join）
  cloth?: {
    id: string
    user_id: string
    cloth_data: any // PlacedPattern[]
    score_data: ClothScore
    created_at: string
  }
}

// ============================================================================
// 商店相关
// ============================================================================

/**
 * 商店主题
 */
export type ShopTheme = 'traditional' | 'modern' | 'zen' | 'vintage' | 'fantasy'

/**
 * 角色自定义配置
 */
export interface CharacterCustomization {
  hairstyle: string // 'default' | 'ponytail' | 'twintails' | 'curly' | 'bob'
  outfit_color: string // 'indigo' | 'brown' | 'green'
  accessory: string // 'none' | 'hat' | 'scarf'
}

/**
 * 用户商店
 */
export interface UserShop {
  id: string
  user_id: string
  shop_name: string
  shop_level: number
  shop_exp: number
  
  // 容量
  max_inventory_size: number
  max_listing_slots: number
  
  // 自定义
  theme: ShopTheme
  character_customization: CharacterCustomization
  
  // 统计
  total_sales: number
  total_earnings: number
  total_views: number
  total_likes: number
  
  created_at: string
  updated_at: string
}

/**
 * 商店信息（带用户名）
 */
export interface ShopWithOwner extends UserShop {
  owner_name?: string
  owner_avatar?: string
}

// ============================================================================
// 上架相关
// ============================================================================

/**
 * 上架状态
 */
export type ListingStatus = 'listed' | 'sold' | 'withdrawn'

/**
 * 商店上架作品
 */
export interface ShopListing {
  id: string
  shop_id: string
  user_id: string
  cloth_id: string
  
  // 价格
  price: number
  base_price: number
  
  // 状态
  status: ListingStatus
  
  // 展示
  display_order: number
  is_featured: boolean
  
  // 时间
  listed_at: string
  sold_at?: string
  withdrawn_at?: string
  
  // 关联的作品信息
  cloth?: {
    id: string
    cloth_data: any
    score_data: ClothScore
    created_at: string
  }
}

/**
 * 上架作品（带商店信息）
 */
export interface ListingWithShop extends ShopListing {
  shop?: UserShop
}

// ============================================================================
// 交易相关
// ============================================================================

/**
 * 交易类型
 */
export type TransactionType = 'player_buy' | 'system_buy'

/**
 * 交易记录
 */
export interface Transaction {
  id: string
  
  // 交易双方
  seller_id: string
  buyer_id?: string // NULL表示系统收购
  
  // 交易内容
  cloth_id: string
  listing_id?: string
  
  // 价格
  price: number
  actual_price: number
  
  // 类型
  transaction_type: TransactionType
  
  // 时间
  created_at: string
  
  // 关联信息
  cloth?: {
    cloth_data: any
    score_data: ClothScore
  }
  seller_name?: string
  buyer_name?: string
}

/**
 * 交易统计
 */
export interface TransactionStats {
  today_sales: number
  today_earnings: number
  week_sales: number
  week_earnings: number
  month_sales: number
  month_earnings: number
  best_selling_cloth?: {
    cloth_id: string
    price: number
    grade: string
  }
}

// ============================================================================
// 访问和收藏
// ============================================================================

/**
 * 商店访问记录
 */
export interface ShopVisit {
  id: string
  visitor_id?: string
  shop_id: string
  visited_at: string
}

/**
 * 商店收藏
 */
export interface ShopFavorite {
  user_id: string
  shop_id: string
  created_at: string
  
  // 关联的商店信息
  shop?: UserShop
}

// ============================================================================
// API 请求/响应
// ============================================================================

/**
 * 保存作品到背包请求
 */
export interface SaveToInventoryRequest {
  cloth_id: string
  slot_type?: SlotType
}

/**
 * 保存作品响应
 */
export interface SaveToInventoryResponse {
  success: boolean
  inventory_item?: InventoryItem
  message?: string
}

/**
 * 上架作品请求
 */
export interface CreateListingRequest {
  cloth_id: string
  price: number
  is_featured?: boolean
}

/**
 * 上架作品响应
 */
export interface CreateListingResponse {
  success: boolean
  listing?: ShopListing
  suggested_price?: number
  message?: string
}

/**
 * 购买作品请求
 */
export interface BuyClothRequest {
  listing_id: string
}

/**
 * 购买作品响应
 */
export interface BuyClothResponse {
  success: boolean
  transaction?: Transaction
  new_balance?: number
  message?: string
}

/**
 * 商店装饰更新请求
 */
export interface UpdateShopRequest {
  shop_name?: string
  theme?: ShopTheme
  character_customization?: Partial<CharacterCustomization>
}

/**
 * 商店装饰更新响应
 */
export interface UpdateShopResponse {
  success: boolean
  shop?: UserShop
  message?: string
}

/**
 * 推荐商店响应
 */
export interface RecommendedShopsResponse {
  success: boolean
  shops: ShopWithOwner[]
  reason?: string // 'new' | 'popular' | 'high_quality' | 'affordable' | 'random'
}

/**
 * 背包容量信息
 */
export interface InventoryCapacity {
  current: number
  max: number
  expansion_cost?: number // 扩容价格
}

/**
 * 上架容量信息
 */
export interface ListingCapacity {
  current: number
  max: number
  expansion_cost?: number
}
