/**
 * 商店服务
 * Shop Service
 * 
 * 管理商店、上架、交易等功能
 * 优化版本：使用配置文件中的常量
 */

import { createServiceClient } from '@/lib/supabaseClient'

// 使用 Service Client 绕过 RLS
const createClient = () => createServiceClient()
import { ShopConfig, PlayerDefaults } from '@/lib/game/config'
import type {
  UserShop,
  ShopListing,
  Transaction,
  ShopWithOwner,
  ListingCapacity,
  CharacterCustomization,
  ShopTheme
} from '@/types/shop.types'
import type { ClothScore, ScoreGrade } from '@/types/game.types'

// ============================================================================
// 商店管理
// ============================================================================

/**
 * 获取或创建用户商店
 */
export async function getOrCreateShop(userId: string): Promise<UserShop | null> {
  const supabase = createClient()

  try {
    // 尝试获取现有商店
    const { data: existing } = await supabase
      .from('user_shops')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing) return existing

    // 创建新商店
    const { data: newShop, error } = await supabase
      .from('user_shops')
      .insert({
        user_id: userId,
        shop_name: '我的蓝染坊'
      })
      .select()
      .single()

    if (error) throw error
    return newShop
  } catch (error) {
    console.error('Error getting/creating shop:', error)
    return null
  }
}

/**
 * 更新商店信息
 */
export async function updateShop(
  userId: string,
  updates: {
    shop_name?: string
    theme?: ShopTheme
    character_customization?: Partial<CharacterCustomization>
  }
): Promise<{ success: boolean; message?: string; shop?: UserShop }> {
  const supabase = createClient()

  try {
    // 如果更新角色自定义，需要合并现有配置
    let finalUpdates = { ...updates }
    if (updates.character_customization) {
      const { data: current } = await supabase
        .from('user_shops')
        .select('character_customization')
        .eq('user_id', userId)
        .single()

      if (current) {
        finalUpdates.character_customization = {
          ...current.character_customization,
          ...updates.character_customization
        }
      }
    }

    const { data: shop, error } = await supabase
      .from('user_shops')
      .update({
        ...finalUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      message: '商店更新成功',
      shop
    }
  } catch (error) {
    console.error('Error updating shop:', error)
    return {
      success: false,
      message: '更新失败'
    }
  }
}

/**
 * 获取商店（包含主人信息）
 */
export async function getShopWithOwner(shopId: string): Promise<ShopWithOwner | null> {
  const supabase = createClient()

  try {
    const { data: shop } = await supabase
      .from('user_shops')
      .select('*')
      .eq('id', shopId)
      .single()

    if (!shop) return null

    // 获取用户信息（从player_profile）
    const { data: profile } = await supabase
      .from('player_profile')
      .select('user_id')
      .eq('user_id', shop.user_id)
      .single()

    // 这里可以扩展获取用户名、头像等
    return {
      ...shop,
      owner_name: `用户${shop.user_id.substring(0, 8)}`
    }
  } catch (error) {
    console.error('Error getting shop with owner:', error)
    return null
  }
}

// ============================================================================
// 上架管理
// ============================================================================

/**
 * 计算建议价格
 * 使用配置文件中的等级乘数
 */
export function calculateSuggestedPrice(score: ClothScore): number {
  const multiplier = ShopConfig.gradeMultipliers[score.grade as ScoreGrade] || 1
  return Math.round(score.total_score * multiplier)
}

/**
 * 根据总分和等级计算建议价格
 */
export function calculatePriceFromScore(totalScore: number, grade: ScoreGrade): number {
  const multiplier = ShopConfig.gradeMultipliers[grade] || 1
  return Math.round(totalScore * multiplier)
}

/**
 * 确保用户商店存在（自动创建）
 */
export async function ensureUserShop(userId: string): Promise<UserShop | null> {
  return getOrCreateShop(userId)
}

/**
 * 上架作品（优化版：减少数据库查询）
 */
export async function createListing(
  userId: string,
  clothId: string,
  price: number,
  isFeatured: boolean = false
): Promise<{ success: boolean; message?: string; listing?: ShopListing }> {
  const supabase = createClient()

  try {
    // 并行获取：商店信息、背包状态、已上架状态、评分
    const [shopResult, inventoryResult, existingResult, scoreResult] = await Promise.all([
      supabase.from('user_shops').select('id, max_listing_slots').eq('user_id', userId).maybeSingle(),
      supabase.from('user_inventory').select('id, slot_type').eq('user_id', userId).eq('cloth_id', clothId).maybeSingle(),
      supabase.from('shop_listings').select('id').eq('cloth_id', clothId).eq('status', 'listed').maybeSingle(),
      supabase.from('cloth_scores').select('total_score, grade').eq('cloth_id', clothId).maybeSingle()
    ])

    // 检查商店
    let shop = shopResult.data
    if (!shop) {
      // 创建商店
      const { data: newShop } = await supabase
        .from('user_shops')
        .insert({ user_id: userId, shop_name: '我的蓝染坊' })
        .select('id, max_listing_slots')
        .single()
      shop = newShop
    }
    if (!shop) {
      return { success: false, message: '商店创建失败' }
    }

    // 检查上架容量
    const { count: listingCount } = await supabase
      .from('shop_listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'listed')

    const maxSlots = shop.max_listing_slots || 5
    if ((listingCount || 0) >= maxSlots) {
      return { success: false, message: '上架位已满，请下架一些作品或扩展上架位' }
    }

    // 检查是否已上架
    if (existingResult.data) {
      return { success: false, message: '作品已上架' }
    }

    // 处理背包状态
    const inventoryItem = inventoryResult.data
    if (!inventoryItem) {
      // 检查作品所有权并添加到背包
      const { data: cloth } = await supabase
        .from('cloths')
        .select('creator_id')
        .eq('id', clothId)
        .maybeSingle()
      
      if (!cloth || cloth.creator_id !== userId) {
        return { success: false, message: '作品不存在或无权限' }
      }
      
      await supabase
        .from('user_inventory')
        .insert({
          user_id: userId,
          cloth_id: clothId,
          slot_type: 'inventory',
          added_at: new Date().toISOString()
        })
    } else if (inventoryItem.slot_type === 'recent') {
      await supabase
        .from('user_inventory')
        .update({ slot_type: 'inventory' })
        .eq('id', inventoryItem.id)
    }

    // 计算基础价格
    const basePrice = scoreResult.data 
      ? calculateSuggestedPrice(scoreResult.data as any) 
      : price

    // 创建上架记录并更新作品状态（并行）
    const now = new Date().toISOString()
    const [listingResult] = await Promise.all([
      supabase
        .from('shop_listings')
        .insert({
          shop_id: shop.id,
          user_id: userId,
          cloth_id: clothId,
          price,
          base_price: basePrice,
          status: 'listed',
          is_featured: isFeatured,
          listed_at: now
        })
        .select()
        .single(),
      supabase
        .from('cloths')
        .update({ status: 'listed' })
        .eq('id', clothId)
    ])

    if (listingResult.error) {
      throw listingResult.error
    }

    return {
      success: true,
      message: '上架成功',
      listing: listingResult.data
    }
  } catch (error) {
    console.error('Error creating listing:', error)
    return {
      success: false,
      message: '上架失败'
    }
  }
}

/**
 * 下架作品
 */
export async function withdrawListing(
  userId: string,
  listingId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = createClient()

  try {
    // 1. 获取上架信息
    const { data: listing } = await supabase
      .from('shop_listings')
      .select('*')
      .eq('id', listingId)
      .eq('user_id', userId)
      .single()

    if (!listing) {
      return { success: false, message: '上架记录不存在' }
    }

    // 2. 更新上架状态
    const { error: updateError } = await supabase
      .from('shop_listings')
      .update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString()
      })
      .eq('id', listingId)

    if (updateError) throw updateError

    // 3. 更新作品状态回到背包
    await supabase
      .from('cloths')
      .update({ status: 'in_inventory' })
      .eq('id', listing.cloth_id)

    return {
      success: true,
      message: '已下架'
    }
  } catch (error) {
    console.error('Error withdrawing listing:', error)
    return {
      success: false,
      message: '下架失败'
    }
  }
}

/**
 * 调整价格
 */
export async function updateListingPrice(
  userId: string,
  listingId: string,
  newPrice: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('shop_listings')
      .update({ price: newPrice })
      .eq('id', listingId)
      .eq('user_id', userId)
      .eq('status', 'listed')

    if (error) throw error

    return {
      success: true,
      message: '价格已更新'
    }
  } catch (error) {
    console.error('Error updating listing price:', error)
    return {
      success: false,
      message: '更新失败'
    }
  }
}

/**
 * 获取上架作品列表（优化版：一次性获取所有数据）
 */
export async function getListings(
  shopId: string,
  status: string = 'listed'
): Promise<ShopListing[]> {
  const supabase = createClient()

  try {
    // 一次性获取所有关联数据，避免 N+1 查询
    const { data, error } = await supabase
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
      .eq('shop_id', shopId)
      .eq('status', status)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })

    if (error) throw error

    // 转换数据格式（无需额外查询）
    return (data || []).map((listing) => {
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
  } catch (error) {
    console.error('Error getting listings:', error)
    return []
  }
}

/**
 * 获取上架容量信息
 */
export async function getListingCapacity(userId: string): Promise<ListingCapacity> {
  const supabase = createClient()

  try {
    // 获取商店信息
    const { data: shop } = await supabase
      .from('user_shops')
      .select('max_listing_slots')
      .eq('user_id', userId)
      .single()

    // 获取当前上架数量
    const { count } = await supabase
      .from('shop_listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'listed')

    const max = shop?.max_listing_slots || 5
    const current = count || 0

    // 计算扩容价格
    const expansions = max - 5
    const expansion_cost = (expansions + 1) * 300

    return {
      current,
      max,
      expansion_cost: max < 20 ? expansion_cost : undefined
    }
  } catch (error) {
    console.error('Error getting listing capacity:', error)
    return {
      current: 0,
      max: 5,
      expansion_cost: 300
    }
  }
}

// ============================================================================
// 交易系统
// ============================================================================

/**
 * 购买作品
 */
export async function buyCloth(
  buyerId: string,
  listingId: string
): Promise<{ success: boolean; message?: string; transaction?: Transaction }> {
  const supabase = createClient()

  try {
    // 1. 获取上架信息
    const { data: listing } = await supabase
      .from('shop_listings')
      .select('*')
      .eq('id', listingId)
      .eq('status', 'listed')
      .single()

    if (!listing) {
      return { success: false, message: '作品不存在或已售出' }
    }

    // 2. 检查是否购买自己的作品
    if (listing.user_id === buyerId) {
      return { success: false, message: '不能购买自己的作品' }
    }

    // 3. 检查买家金币是否足够
    const { data: buyerProfile } = await supabase
      .from('player_profile')
      .select('currency')
      .eq('user_id', buyerId)
      .single()

    if (!buyerProfile || buyerProfile.currency < listing.price) {
      return { success: false, message: '金币不足' }
    }

    // 4. 扣除买家金币
    await supabase
      .from('player_profile')
      .update({
        currency: buyerProfile.currency - listing.price
      })
      .eq('user_id', buyerId)

    // 5. 增加卖家金币
    const { data: sellerProfile } = await supabase
      .from('player_profile')
      .select('currency')
      .eq('user_id', listing.user_id)
      .single()

    await supabase
      .from('player_profile')
      .update({
        currency: (sellerProfile?.currency || 0) + listing.price
      })
      .eq('user_id', listing.user_id)

    // 6. 创建交易记录
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        seller_id: listing.user_id,
        buyer_id: buyerId,
        cloth_id: listing.cloth_id,
        listing_id: listingId,
        price: listing.price,
        actual_price: listing.price,
        transaction_type: 'player_buy'
      })
      .select()
      .single()

    if (txError) throw txError

    // 7. 更新上架状态
    await supabase
      .from('shop_listings')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString()
      })
      .eq('id', listingId)

    // 8. 更新作品状态
    await supabase
      .from('cloths')
      .update({ status: 'sold' })
      .eq('id', listing.cloth_id)

    // 9. 作品从卖家背包移除，添加到买家背包
    await supabase
      .from('user_inventory')
      .delete()
      .eq('cloth_id', listing.cloth_id)

    await supabase
      .from('user_inventory')
      .insert({
        user_id: buyerId,
        cloth_id: listing.cloth_id,
        slot_type: 'inventory',
        added_at: new Date().toISOString()
      })

    return {
      success: true,
      message: '购买成功！',
      transaction
    }
  } catch (error) {
    console.error('Error buying cloth:', error)
    return {
      success: false,
      message: '购买失败'
    }
  }
}

/**
 * 系统自动收购（定时任务调用）
 */
export async function systemAutoPurchase(): Promise<number> {
  const supabase = createClient()

  try {
    // 获取超过24小时的上架作品
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data: listings } = await supabase
      .from('shop_listings')
      .select('*')
      .eq('status', 'listed')
      .lt('listed_at', twentyFourHoursAgo.toISOString())

    if (!listings || listings.length === 0) return 0

    let purchaseCount = 0

    for (const listing of listings) {
      const autoPurchasePrice = Math.round(listing.price * 0.6)

      // 增加卖家金币
      const { data: sellerProfile } = await supabase
        .from('player_profile')
        .select('currency')
        .eq('user_id', listing.user_id)
        .single()

      await supabase
        .from('player_profile')
        .update({
          currency: (sellerProfile?.currency || 0) + autoPurchasePrice
        })
        .eq('user_id', listing.user_id)

      // 创建交易记录
      await supabase
        .from('transactions')
        .insert({
          seller_id: listing.user_id,
          buyer_id: null,
          cloth_id: listing.cloth_id,
          listing_id: listing.id,
          price: listing.price,
          actual_price: autoPurchasePrice,
          transaction_type: 'system_buy'
        })

      // 更新上架状态
      await supabase
        .from('shop_listings')
        .update({
          status: 'sold',
          sold_at: new Date().toISOString()
        })
        .eq('id', listing.id)

      // 更新作品状态
      await supabase
        .from('cloths')
        .update({ status: 'sold' })
        .eq('id', listing.cloth_id)

      purchaseCount++
    }

    return purchaseCount
  } catch (error) {
    console.error('Error in system auto purchase:', error)
    return 0
  }
}

/**
 * 获取交易记录（优化版：一次性获取所有数据）
 */
export async function getTransactions(
  userId: string,
  type: 'sell' | 'buy' = 'sell'
): Promise<Transaction[]> {
  const supabase = createClient()

  try {
    const column = type === 'sell' ? 'seller_id' : 'buyer_id'

    // 一次性获取所有关联数据
    const { data, error } = await supabase
      .from('transactions')
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
            technique_score
          )
        )
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // 转换数据格式（无需额外查询）
    return (data || []).map((tx) => {
      if (tx.cloth) {
        const scores = tx.cloth.cloth_scores || []
        const latestScore = scores.length > 0 ? scores[0] : null
        return {
          ...tx,
          cloth: {
            id: tx.cloth.id,
            layers: tx.cloth.layers,
            status: tx.cloth.status,
            created_at: tx.cloth.created_at,
            score_data: latestScore
          }
        }
      }
      return tx
    })
  } catch (error) {
    console.error('Error getting transactions:', error)
    return []
  }
}

// ============================================================================
// 社交功能
// ============================================================================

/**
 * 记录访问
 */
export async function recordVisit(
  shopId: string,
  visitorId?: string
): Promise<void> {
  const supabase = createClient()

  try {
    await supabase
      .from('shop_visits')
      .insert({
        shop_id: shopId,
        visitor_id: visitorId,
        visited_at: new Date().toISOString()
      })

    // 更新商店访问统计
    await supabase.rpc('increment_shop_views', { shop_id: shopId })
  } catch (error) {
    console.error('Error recording visit:', error)
  }
}

/**
 * 收藏商店
 */
export async function favoriteShop(
  userId: string,
  shopId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('shop_favorites')
      .insert({
        user_id: userId,
        shop_id: shopId
      })

    if (error) {
      if (error.code === '23505') {
        return { success: false, message: '已收藏过该商店' }
      }
      throw error
    }

    return { success: true, message: '收藏成功' }
  } catch (error) {
    console.error('Error favoriting shop:', error)
    return { success: false, message: '收藏失败' }
  }
}

/**
 * 取消收藏
 */
export async function unfavoriteShop(
  userId: string,
  shopId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = createClient()

  try {
    await supabase
      .from('shop_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('shop_id', shopId)

    return { success: true, message: '已取消收藏' }
  } catch (error) {
    console.error('Error unfavoriting shop:', error)
    return { success: false, message: '取消收藏失败' }
  }
}

/**
 * 获取推荐商店
 */
export async function getRecommendedShops(limit: number = 5): Promise<ShopWithOwner[]> {
  const supabase = createClient()

  try {
    // 混合推荐：新店铺 + 热门店铺
    const { data: shops } = await supabase
      .from('user_shops')
      .select('*')
      .order('total_sales', { ascending: false })
      .limit(limit)

    return shops || []
  } catch (error) {
    console.error('Error getting recommended shops:', error)
    return []
  }
}
