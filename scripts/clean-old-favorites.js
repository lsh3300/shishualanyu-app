#!/usr/bin/env node
/**
 * 清理旧的收藏数据（指向已删除产品的收藏）
 * 运行命令：node scripts/clean-old-favorites.js
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少 Supabase 配置')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function cleanOldFavorites() {
  console.log('🧹 开始清理旧的收藏数据...\n')
  
  try {
    // 1. 获取所有产品ID
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
    
    if (productsError) throw productsError
    
    const validProductIds = new Set(products.map(p => p.id))
    console.log(`✅ 找到 ${validProductIds.size} 个有效产品`)
    
    // 2. 获取所有收藏记录
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, product_id, user_id')
      .not('product_id', 'is', null)
    
    if (favoritesError) throw favoritesError
    
    console.log(`📊 找到 ${favorites.length} 条产品收藏记录`)
    
    // 3. 找出无效的收藏记录
    const invalidFavorites = favorites.filter(f => !validProductIds.has(f.product_id))
    
    console.log(`⚠️  发现 ${invalidFavorites.length} 条无效收藏记录`)
    
    if (invalidFavorites.length === 0) {
      console.log('✅ 没有需要清理的数据')
      return
    }
    
    // 4. 删除无效记录
    const invalidIds = invalidFavorites.map(f => f.id)
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .in('id', invalidIds)
    
    if (deleteError) throw deleteError
    
    console.log(`\n✅ 成功清理 ${invalidFavorites.length} 条无效收藏记录`)
    
    // 5. 显示剩余的有效收藏
    const { data: remainingFavorites, error: remainingError } = await supabase
      .from('favorites')
      .select('id, product_id')
      .not('product_id', 'is', null)
    
    if (remainingError) throw remainingError
    
    console.log(`📊 剩余有效产品收藏: ${remainingFavorites.length} 条`)
    
  } catch (error) {
    console.error('❌ 清理失败:', error)
    process.exit(1)
  }
}

cleanOldFavorites()
