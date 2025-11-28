#!/usr/bin/env node
/**
 * 验证产品数据
 * 运行命令：node scripts/verify-products.js
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

async function verify() {
  console.log('🔍 验证产品数据...\n')
  
  try {
    // 1. 查询产品总数
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, price, category, inventory, status')
      .order('created_at', { ascending: false })
    
    if (productsError) {
      throw productsError
    }
    
    console.log(`✅ 产品总数: ${products.length}`)
    console.log('\n产品分类统计:')
    
    const categoryStats = {}
    products.forEach(p => {
      categoryStats[p.category] = (categoryStats[p.category] || 0) + 1
    })
    
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 个`)
    })
    
    // 2. 查询媒体记录总数
    const { data: media, error: mediaError } = await supabase
      .from('product_media')
      .select('id, product_id, type, url, cover')
    
    if (mediaError) {
      throw mediaError
    }
    
    console.log(`\n✅ 媒体记录总数: ${media.length}`)
    console.log(`   封面图片: ${media.filter(m => m.cover).length} 个`)
    console.log(`   详情图片: ${media.filter(m => !m.cover).length} 个`)
    
    // 3. 检查是否有产品没有图片
    const productsWithoutMedia = products.filter(p => 
      !media.some(m => m.product_id === p.id)
    )
    
    if (productsWithoutMedia.length > 0) {
      console.log(`\n⚠️  ${productsWithoutMedia.length} 个产品没有图片:`)
      productsWithoutMedia.forEach(p => {
        console.log(`   - ${p.name}`)
      })
    } else {
      console.log(`\n✅ 所有产品都有图片`)
    }
    
    // 4. 显示前5个产品示例
    console.log('\n📦 产品示例（前5个）:')
    products.slice(0, 5).forEach((p, i) => {
      const productMedia = media.filter(m => m.product_id === p.id)
      console.log(`\n${i + 1}. ${p.name}`)
      console.log(`   ID: ${p.id}`)
      console.log(`   Slug: ${p.slug}`)
      console.log(`   分类: ${p.category}`)
      console.log(`   价格: ¥${p.price}`)
      console.log(`   库存: ${p.inventory}`)
      console.log(`   图片: ${productMedia.length} 张`)
      if (productMedia.length > 0) {
        const coverImage = productMedia.find(m => m.cover)
        if (coverImage) {
          console.log(`   封面: ${coverImage.url.substring(0, 80)}...`)
        }
      }
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 验证完成！产品数据正常。')
    console.log('='.repeat(60))
    console.log('\n下一步：访问 http://localhost:3000/store 查看产品')
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  }
}

verify()
