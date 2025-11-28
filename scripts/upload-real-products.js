#!/usr/bin/env node
/**
 * 上传真实产品图片并创建产品数据
 * 运行命令：node scripts/upload-real-products.js
 * 
 * 功能：
 * 1. 扫描本地产品图片文件夹
 * 2. 根据文件名智能分组产品
 * 3. 上传图片到 Supabase Storage
 * 4. 创建产品记录和媒体记录
 */

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET_NAME = 'product-media'
const LOCAL_IMAGES_DIR = path.resolve(process.cwd(), '整理后课堂实践作品/产品图片')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少 Supabase 配置，请在 .env.local 中设置环境变量')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 分类映射
const CATEGORY_MAP = {
  '抱枕': '家居',
  '靠枕': '家居',
  '坐垫': '家居',
  '纸巾盒': '家居',
  '帆布包': '配饰',
  '双肩包': '配饰',
  '束口袋': '配饰',
  '帆布袋': '配饰',
  '扇子': '配饰',
  '渔夫帽': '配饰',
  '文化衫': '服饰',
  '短袖': '服饰',
  '衣服': '服饰',
  '壁挂': '家居',
  '方巾': '配饰',
}

// MIME 类型映射
const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function getContentType(file) {
  const ext = path.extname(file).toLowerCase()
  return MIME_MAP[ext] || 'image/jpeg'
}

// 从文件名提取产品基础名称（去除数字后缀）
function extractProductBaseName(fileName) {
  const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '')
  // 去除末尾的数字（如 "产品1.jpg" -> "产品"）
  const baseName = nameWithoutExt.replace(/[\d\s-]+$/, '')
  return baseName || nameWithoutExt
}

// 推断产品分类
function inferCategory(productName) {
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (productName.includes(keyword)) {
      return category
    }
  }
  return '其他'
}

// 生成 slug（URL 安全 - 仅 ASCII 字符）
function generateSlug(productName) {
  // 完全移除中文和特殊字符，使用时间戳
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `product-${timestamp}-${random}`
}

// 生成安全的文件名（仅包含字母、数字、连字符和下划线）
function generateSafeFileName(originalName) {
  const ext = path.extname(originalName)
  const nameWithoutExt = originalName.replace(ext, '')
  // 移除所有非ASCII字符和特殊字符
  const safeName = nameWithoutExt
    .replace(/[^\w-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 50)
  return safeName + ext
}

// 估算价格（基于分类）
function estimatePrice(category) {
  const priceRanges = {
    '服饰': { base: 98, range: 60 },
    '配饰': { base: 68, range: 50 },
    '家居': { base: 78, range: 40 },
    '其他': { base: 58, range: 30 },
  }
  const range = priceRanges[category] || priceRanges['其他']
  const price = range.base + Math.floor(Math.random() * range.range)
  const originalPrice = Math.floor(price * (1 + Math.random() * 0.5))
  return { price, originalPrice }
}

// 确保 bucket 存在
async function ensureBucket() {
  console.log('📦 检查 Storage Bucket...')
  const { data: buckets } = await supabase.storage.listBuckets()
  if (buckets?.some((bucket) => bucket.name === BUCKET_NAME)) {
    console.log('✅ Bucket 已存在')
    return
  }
  
  console.log('📦 创建 Bucket...')
  const { error } = await supabase.storage.createBucket(BUCKET_NAME, { 
    public: true,
    fileSizeLimit: 52428800 // 50MB
  })
  
  if (error && !error.message?.includes('already exists')) {
    throw error
  }
  console.log('✅ Bucket 创建成功')
}

// 上传单个图片
async function uploadImage(localPath, remotePath) {
  const buffer = await fs.promises.readFile(localPath)
  const fileName = path.basename(localPath)
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(remotePath, buffer, { 
      contentType: getContentType(fileName), 
      upsert: true 
    })
  
  if (error) {
    throw error
  }
  
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(remotePath)
  return data.publicUrl
}

// 扫描并分组产品图片
async function scanAndGroupImages() {
  console.log('📂 扫描产品图片...')
  
  const files = await fs.promises.readdir(LOCAL_IMAGES_DIR)
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  
  console.log(`找到 ${imageFiles.length} 个图片文件`)
  
  // 按产品名称分组
  const productGroups = {}
  
  for (const fileName of imageFiles) {
    const baseName = extractProductBaseName(fileName)
    if (!productGroups[baseName]) {
      productGroups[baseName] = []
    }
    productGroups[baseName].push(fileName)
  }
  
  console.log(`识别出 ${Object.keys(productGroups).length} 个产品`)
  return productGroups
}

// 处理单个产品
async function processProduct(productName, imageFiles) {
  console.log(`\n📦 处理产品: ${productName}`)
  
  const category = inferCategory(productName)
  const slug = generateSlug(productName)
  const { price, originalPrice } = estimatePrice(category)
  const productId = uuidv4()
  
  console.log(`   分类: ${category}, 价格: ¥${price}, 图片数: ${imageFiles.length}`)
  
  // 创建产品记录
  const productData = {
    id: productId,
    name: productName,
    slug: `${slug}-${productId.substring(0, 8)}`,
    description: `精美${category}商品，采用传统蓝染工艺制作，图案独特，质量上乘。`,
    price,
    original_price: originalPrice,
    category,
    inventory: Math.floor(50 + Math.random() * 100),
    status: 'published',
    is_new: Math.random() > 0.7,
    discount: Math.floor(((originalPrice - price) / originalPrice) * 100),
    metadata: {
      technique: '蓝染/扎染',
      handmade: true
    }
  }
  
  const { error: productError } = await supabase
    .from('products')
    .upsert(productData, { onConflict: 'id' })
  
  if (productError) {
    console.error(`   ❌ 产品创建失败:`, productError.message)
    return null
  }
  
  console.log(`   ✅ 产品记录已创建`)
  
  // 上传图片并创建 media 记录
  const mediaRecords = []
  
  for (let i = 0; i < imageFiles.length; i++) {
    const fileName = imageFiles[i]
    const localPath = path.join(LOCAL_IMAGES_DIR, fileName)
    const safeFileName = generateSafeFileName(fileName)
    const remotePath = `${slug}/${i}-${safeFileName}`
    
    try {
      console.log(`   📤 上传图片 ${i + 1}/${imageFiles.length}: ${fileName}`)
      const url = await uploadImage(localPath, remotePath)
      
      mediaRecords.push({
        id: uuidv4(),
        product_id: productId,
        type: 'image',
        url,
        position: i,
        cover: i === 0,
        metadata: {}
      })
      
      console.log(`   ✅ 图片已上传`)
    } catch (error) {
      console.error(`   ⚠️ 图片上传失败:`, error.message)
    }
  }
  
  // 批量插入 media 记录
  if (mediaRecords.length > 0) {
    const { error: mediaError } = await supabase
      .from('product_media')
      .insert(mediaRecords)
    
    if (mediaError) {
      console.error(`   ❌ 媒体记录创建失败:`, mediaError.message)
    } else {
      console.log(`   ✅ ${mediaRecords.length} 条媒体记录已创建`)
    }
  }
  
  return { productId, productName, imageCount: mediaRecords.length }
}

// 主函数
async function main() {
  console.log('🚀 开始上传真实产品数据...\n')
  
  try {
    // 1. 确保 bucket 存在
    await ensureBucket()
    
    // 2. 扫描并分组图片
    const productGroups = await scanAndGroupImages()
    
    // 3. 清空现有产品（可选，根据需求）
    console.log('\n🗑️  清空现有测试产品...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有
    
    if (deleteError) {
      console.warn('⚠️  删除现有产品失败:', deleteError.message)
    } else {
      console.log('✅ 现有产品已清空')
    }
    
    // 4. 处理每个产品
    const results = []
    let successCount = 0
    
    for (const [productName, imageFiles] of Object.entries(productGroups)) {
      const result = await processProduct(productName, imageFiles)
      if (result) {
        results.push(result)
        successCount++
      }
    }
    
    // 5. 输出统计
    console.log('\n' + '='.repeat(60))
    console.log('🎉 上传完成！')
    console.log('='.repeat(60))
    console.log(`✅ 成功创建 ${successCount} 个产品`)
    console.log(`📊 总图片数: ${results.reduce((sum, r) => sum + r.imageCount, 0)}`)
    console.log('\n产品列表:')
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.productName} (${r.imageCount} 张图片)`)
    })
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

main()
