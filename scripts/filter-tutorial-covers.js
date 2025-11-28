#!/usr/bin/env node
/**
 * 过滤教程封面产品
 * 运行命令：node scripts/filter-tutorial-covers.js
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

// 识别教程封面的关键词
const TUTORIAL_KEYWORDS = ['封面', '教程', '讲解', '2.0']

async function filterTutorialCovers() {
  console.log('🔍 查找教程封面产品...\n')
  
  try {
    // 1. 获取所有产品
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, category, status')
      .order('name')
    
    if (error) throw error
    
    console.log(`📊 总产品数: ${products.length}`)
    
    // 2. 识别教程封面产品
    const tutorialCovers = products.filter(product => 
      TUTORIAL_KEYWORDS.some(keyword => product.name.includes(keyword))
    )
    
    console.log(`\n⚠️  发现 ${tutorialCovers.length} 个可能的教程封面产品:\n`)
    
    tutorialCovers.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   价格: ¥${product.price}`)
      console.log(`   分类: ${product.category}`)
      console.log(`   状态: ${product.status}`)
      console.log('')
    })
    
    // 3. 询问处理方式
    console.log('=' .repeat(60))
    console.log('建议的处理方式：')
    console.log('=' .repeat(60))
    console.log('\n选项 1: 删除这些产品（推荐）')
    console.log('  - 这些是教程封面，不应该作为商品出售')
    console.log('  - 会同时删除相关的图片和媒体记录')
    console.log('')
    console.log('选项 2: 设置为草稿状态')
    console.log('  - 保留数据但不在商店显示')
    console.log('  - 可以后续决定如何处理')
    console.log('')
    console.log('选项 3: 仅列出，不做任何修改')
    console.log('  - 查看后手动处理')
    console.log('')
    
    // 显示将保留的真正产品
    const realProducts = products.filter(product => 
      !TUTORIAL_KEYWORDS.some(keyword => product.name.includes(keyword))
    )
    
    console.log(`\n✅ 将保留 ${realProducts.length} 个真正的产品:`)
    console.log('\n【服饰类】')
    realProducts.filter(p => p.category === '服饰').forEach(p => console.log(`  - ${p.name}`))
    console.log('\n【配饰类】')
    realProducts.filter(p => p.category === '配饰').forEach(p => console.log(`  - ${p.name}`))
    console.log('\n【家居类】')
    realProducts.filter(p => p.category === '家居').forEach(p => console.log(`  - ${p.name}`))
    console.log('\n【其他类】')
    realProducts.filter(p => p.category === '其他' && !TUTORIAL_KEYWORDS.some(k => p.name.includes(k))).forEach(p => console.log(`  - ${p.name}`))
    
    return { tutorialCovers, realProducts }
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

async function deleteTutorialCovers(productIds) {
  console.log('\n🗑️  删除教程封面产品...\n')
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds)
    
    if (error) throw error
    
    console.log(`✅ 成功删除 ${productIds.length} 个教程封面产品`)
    
  } catch (error) {
    console.error('❌ 删除失败:', error)
    throw error
  }
}

async function setToDraft(productIds) {
  console.log('\n📝 设置为草稿状态...\n')
  
  try {
    const { error } = await supabase
      .from('products')
      .update({ status: 'draft' })
      .in('id', productIds)
    
    if (error) throw error
    
    console.log(`✅ 成功将 ${productIds.length} 个产品设置为草稿`)
    
  } catch (error) {
    console.error('❌ 更新失败:', error)
    throw error
  }
}

// 主函数
async function main() {
  const { tutorialCovers } = await filterTutorialCovers()
  
  if (tutorialCovers.length === 0) {
    console.log('\n✅ 没有发现教程封面产品')
    return
  }
  
  // 自动删除教程封面产品
  console.log('\n' + '='.repeat(60))
  console.log('执行操作：删除教程封面产品')
  console.log('='.repeat(60))
  
  const productIds = tutorialCovers.map(p => p.id)
  await deleteTutorialCovers(productIds)
  
  console.log('\n✅ 处理完成！')
  console.log('\n下一步：')
  console.log('1. 访问 http://localhost:3000/store 查看商店')
  console.log('2. 运行 node scripts/verify-products.js 验证产品数据')
}

main()
