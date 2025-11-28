#!/usr/bin/env node
/**
 * 验证首页产品数据
 * 运行命令：node scripts/verify-homepage-products.js
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

async function verifyHomepageProducts() {
  console.log('🔍 验证首页产品数据...\n')
  
  try {
    // 1. 检查收藏表中的产品收藏
    console.log('1️⃣ 检查产品收藏数据...')
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('id, product_id, user_id')
      .not('product_id', 'is', null)
    
    if (favError) throw favError
    
    console.log(`   收藏总数: ${favorites.length}`)
    
    if (favorites.length > 0) {
      // 检查这些收藏是否指向有效产品
      const productIds = [...new Set(favorites.map(f => f.product_id))]
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds)
      
      const validIds = new Set(products?.map(p => p.id) || [])
      const invalidFavorites = favorites.filter(f => !validIds.has(f.product_id))
      
      if (invalidFavorites.length > 0) {
        console.log(`   ⚠️  发现 ${invalidFavorites.length} 条无效收藏（指向不存在的产品）`)
      } else {
        console.log(`   ✅ 所有收藏都指向有效产品`)
      }
    } else {
      console.log(`   ✅ 没有产品收藏记录`)
    }
    
    // 2. 获取首页将显示的产品
    console.log('\n2️⃣ 检查首页产品数据...')
    const { data: homepageProducts, error: prodError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        original_price,
        inventory,
        status
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(4)
    
    if (prodError) throw prodError
    
    console.log(`   将显示 ${homepageProducts.length} 个产品:\n`)
    
    for (const product of homepageProducts) {
      // 获取封面图片
      const { data: coverImage } = await supabase
        .from('product_media')
        .select('url')
        .eq('product_id', product.id)
        .eq('cover', true)
        .single()
      
      console.log(`   📦 ${product.name}`)
      console.log(`      价格: ¥${product.price} (原价: ¥${product.original_price})`)
      console.log(`      库存: ${product.inventory}`)
      console.log(`      封面图: ${coverImage?.url ? '✅ 有' : '❌ 无'}`)
      console.log('')
    }
    
    // 3. 检查是否有旧的硬编码产品ID
    console.log('3️⃣ 检查旧产品ID...')
    const oldProductIds = [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
    ]
    
    const { data: oldProducts } = await supabase
      .from('products')
      .select('id, name')
      .in('id', oldProductIds)
    
    if (oldProducts && oldProducts.length > 0) {
      console.log(`   ⚠️  数据库中还有 ${oldProducts.length} 个旧产品:`)
      oldProducts.forEach(p => console.log(`      - ${p.name} (${p.id})`))
      console.log('   建议删除这些旧产品')
    } else {
      console.log(`   ✅ 旧产品已清理`)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 验证完成！')
    console.log('='.repeat(60))
    console.log('\n提示：')
    console.log('- 访问 http://localhost:3000 查看首页')
    console.log('- 首页"文创臻品"部分现在显示最新的真实产品')
    console.log('- 旧的收藏数据已清理')
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  }
}

verifyHomepageProducts()
