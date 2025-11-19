#!/usr/bin/env node
/**
 * 批量上传产品媒体并写入 Supabase（示例数据）
 * 运行命令：npm run seed:products
 *
 * 依赖环境变量：
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_KEY
 * - SUPABASE_PRODUCT_BUCKET（可选，默认 product-media）
 */

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET_NAME = process.env.SUPABASE_PRODUCT_BUCKET || 'product-media'
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('缺少 Supabase 配置，请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SAMPLE_PRODUCTS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '扎染T恤',
    slug: 'tie-dye-tshirt',
    description: '传统扎染工艺制作的纯棉T恤，舒适透气，图案独特',
    price: 128,
    original_price: 168,
    category: '服饰',
    inventory: 120,
    is_new: true,
    discount: 24,
    metadata: { colors: ['靛蓝', '墨蓝'], sizes: ['S', 'M', 'L', 'XL'] },
    media: [
      { type: 'image', file: 'handmade-tie-dye-silk-scarf.jpg', cover: true },
      { type: 'image', file: 'tie-dye-tutorial-hands-on.jpg', cover: false },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: '蜡染丝巾',
    slug: 'wax-resist-scarf',
    description: '手工蜡染真丝丝巾，精美图案，优雅大方',
    price: 198,
    original_price: 258,
    category: '配饰',
    inventory: 80,
    is_new: true,
    discount: 23,
    metadata: { colors: ['湖蓝', '暮紫'] },
    media: [
      { type: 'image', file: 'wax-resist-dyeing-technique.jpg', cover: true },
      { type: 'image', file: 'handmade-tie-dye-silk-scarf.jpg', cover: false },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: '扎染帆布包',
    slug: 'tie-dye-bag',
    description: '环保帆布材质，传统扎染图案，实用时尚',
    price: 88,
    original_price: 118,
    category: '配饰',
    inventory: 150,
    media: [{ type: 'image', file: 'indigo-dyed-canvas-bag.jpg', cover: true }],
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: '蜡染抱枕',
    slug: 'wax-resist-pillow',
    description: '精美蜡染图案抱枕，为家居增添艺术气息',
    price: 68,
    original_price: 98,
    category: '家居',
    inventory: 60,
    media: [{ type: 'image', file: 'traditional-wax-resist-cushion.jpg', cover: true }],
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: '扎染壁挂',
    slug: 'tie-dye-tapestry',
    description: '大型扎染艺术壁挂，适合客厅或卧室装饰',
    price: 268,
    original_price: 318,
    category: '家居',
    inventory: 45,
    is_new: true,
    discount: 18,
    media: [{ type: 'image', file: 'modern-indigo-dyeing-art.jpg', cover: true }],
  },
]

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
}

function getContentType(file) {
  const ext = path.extname(file).toLowerCase()
  return MIME_MAP[ext] || 'application/octet-stream'
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (buckets?.some((bucket) => bucket.name === BUCKET_NAME)) return
  const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true })
  if (error && !error.message?.includes('already exists')) {
    throw error
  }
}

async function uploadMedia(fileName, remotePath) {
  const absolutePath = path.join(PUBLIC_DIR, fileName)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`找不到本地文件: ${fileName}`)
  }
  const buffer = await fs.promises.readFile(absolutePath)
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(remotePath, buffer, { contentType: getContentType(fileName), upsert: true })
  if (error) {
    throw error
  }
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(remotePath)
  return data.publicUrl
}

async function seed() {
  console.log('📦 开始初始化产品数据')
  await ensureBucket()

  for (const product of SAMPLE_PRODUCTS) {
    const productId = product.id || uuidv4()
    const productPayload = {
      ...product,
      id: productId,
      metadata: product.metadata || {},
      image_url: null,
    }
    delete productPayload.media

    const { error: upsertError } = await supabase
      .from('products')
      .upsert(productPayload, { onConflict: 'id' })
    if (upsertError) {
      console.error(`❌ 产品 ${product.name} 写入失败:`, upsertError.message)
      continue
    }

    const mediaRecords = []
    if (Array.isArray(product.media)) {
      let position = 0
      for (const media of product.media) {
        const remotePath = `${product.slug || productId}/${position}-${media.file}`
        try {
          const url = await uploadMedia(media.file, remotePath)
          mediaRecords.push({
            id: uuidv4(),
            product_id: productId,
            type: media.type || 'image',
            url,
            position,
            cover: media.cover ?? position === 0,
            metadata: media.metadata || {},
          })
          position += 1
        } catch (error) {
          console.error(`⚠️ 上传 ${media.file} 失败:`, error.message)
        }
      }
    }

    if (mediaRecords.length) {
      await supabase.from('product_media').delete().eq('product_id', productId)
      const { error: mediaError } = await supabase.from('product_media').insert(mediaRecords)
      if (mediaError) {
        console.error(`写入媒体失败:`, mediaError.message)
      } else {
        console.log(`✅ 产品 ${product.name} 媒体已更新 (${mediaRecords.length} 条)`)
      }
    }
  }

  console.log('🎉 产品初始化完成')
}

seed().catch((error) => {
  console.error('执行失败:', error)
  process.exit(1)
})
