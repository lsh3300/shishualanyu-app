#!/usr/bin/env node
/**
 * 上传真实课程数据
 * 运行命令：node scripts/upload-real-courses.js
 * 
 * 功能：
 * 1. 解析视频文件名（作者-课程名称）
 * 2. 上传效果图到 Supabase Storage
 * 3. 清理旧的虚拟课程
 * 4. 创建真实课程数据（免费）
 */

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET_NAME = 'course-covers'

const VIDEOS_DIR = path.resolve(process.cwd(), '整理后课堂实践作品/视频教程')
const COVERS_DIR = path.resolve(process.cwd(), '整理后课堂实践作品/图案效果图')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少 Supabase 配置')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// MIME 类型
const MIME_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

function getContentType(file) {
  const ext = path.extname(file).toLowerCase()
  return MIME_MAP[ext] || 'image/png'
}

// 解析文件名：作者-课程名称
function parseFileName(fileName) {
  const nameWithoutExt = fileName.replace(/\.(mp4|mov|png)$/i, '')
  const parts = nameWithoutExt.split('-')
  
  if (parts.length >= 2) {
    const author = parts[0].trim()
    const title = parts.slice(1).join('-').trim()
    return { author, title }
  }
  
  return { author: '未知', title: nameWithoutExt }
}

// 生成 slug（纯 ASCII，URL 安全）
function generateSlug(title, author) {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}${random}`
}

// 估算课程时长（基于视频文件大小）
function estimateDuration(fileSize) {
  // 粗略估算：100MB ≈ 10分钟
  const minutes = Math.ceil(fileSize / (10 * 1024 * 1024))
  return Math.max(5, Math.min(minutes, 60)) // 限制在 5-60 分钟
}

// 推断分类
function inferCategory(title) {
  const keywords = {
    '扎染': '扎染技艺',
    '蜡染': '蜡染技艺',
    '花': '图案设计',
    '纹': '图案设计',
    '教程': '基础入门',
    '讲解': '基础入门',
  }
  
  for (const [keyword, category] of Object.entries(keywords)) {
    if (title.includes(keyword)) {
      return category
    }
  }
  
  return '蓝染工艺'
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
    fileSizeLimit: 10485760 // 10MB
  })
  
  if (error && !error.message?.includes('already exists')) {
    throw error
  }
  console.log('✅ Bucket 创建成功')
}

// 上传封面图片
async function uploadCover(localPath, remotePath) {
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

// 扫描并解析课程数据
async function scanCourses() {
  console.log('📂 扫描课程视频...')
  
  const videoFiles = await fs.promises.readdir(VIDEOS_DIR)
  const videos = videoFiles.filter(f => /\.(mp4|mov)$/i.test(f))
  
  console.log(`找到 ${videos.length} 个课程视频`)
  
  const courses = []
  
  for (const videoFile of videos) {
    const { author, title } = parseFileName(videoFile)
    
    // 查找对应的封面图
    const coverFiles = await fs.promises.readdir(COVERS_DIR)
    const coverFile = coverFiles.find(f => {
      const baseName = videoFile.replace(/\.(mp4|mov)$/i, '')
      return f.startsWith(baseName) && /\.(png|jpg|jpeg)$/i.test(f)
    })
    
    // 获取视频文件大小
    const videoPath = path.join(VIDEOS_DIR, videoFile)
    const stats = await fs.promises.stat(videoPath)
    const duration = estimateDuration(stats.size)
    
    courses.push({
      videoFile,
      coverFile,
      author,
      title,
      duration,
      category: inferCategory(title),
      videoSize: stats.size
    })
  }
  
  return courses
}

// 处理单个课程
async function processCourse(course) {
  console.log(`\n📚 处理课程: ${course.title}`)
  console.log(`   作者: ${course.author}`)
  console.log(`   时长: 约 ${course.duration} 分钟`)
  console.log(`   分类: ${course.category}`)
  
  const courseId = uuidv4()
  const slug = generateSlug(course.title, course.author)
  
  // 上传封面图
  let imageUrl = null
  if (course.coverFile) {
    try {
      const localPath = path.join(COVERS_DIR, course.coverFile)
      const ext = path.extname(course.coverFile)
      const remotePath = `${slug}${ext}` // 简化路径，直接用 slug 作为文件名
      console.log(`   📤 上传封面: ${course.coverFile}`)
      imageUrl = await uploadCover(localPath, remotePath)
      console.log(`   ✅ 封面已上传`)
    } catch (error) {
      console.error(`   ⚠️ 封面上传失败:`, error.message)
    }
  } else {
    console.log(`   ⚠️ 未找到封面图`)
  }
  
  // 创建课程记录
  const courseData = {
    id: courseId,
    title: course.title,
    slug,
    instructor: course.author,
    duration: course.duration,
    price: 0, // 免费课程
    image_url: imageUrl,
    category: course.category,
    tags: ['蓝染', '手工', '传统工艺'],
    description: `由 ${course.author} 老师讲解的《${course.title}》课程，详细介绍蓝染技艺的实践操作方法。`,
  }
  
  const { error } = await supabase
    .from('courses')
    .upsert(courseData, { onConflict: 'id' })
  
  if (error) {
    console.error(`   ❌ 课程创建失败:`, error.message)
    return null
  }
  
  console.log(`   ✅ 课程记录已创建`)
  
  return { courseId, title: course.title, author: course.author }
}

// 清理旧课程
async function cleanOldCourses() {
  console.log('\n🗑️  清理旧的虚拟课程...')
  
  const { error } = await supabase
    .from('courses')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有
  
  if (error) {
    console.warn('⚠️  删除旧课程失败:', error.message)
  } else {
    console.log('✅ 旧课程已清空')
  }
}

// 主函数
async function main() {
  console.log('🚀 开始上传真实课程数据...\n')
  
  try {
    // 1. 确保 bucket 存在
    await ensureBucket()
    
    // 2. 扫描课程
    const courses = await scanCourses()
    
    // 3. 清空旧课程
    await cleanOldCourses()
    
    // 4. 处理每个课程
    const results = []
    let successCount = 0
    
    for (const course of courses) {
      const result = await processCourse(course)
      if (result) {
        results.push(result)
        successCount++
      }
    }
    
    // 5. 输出统计
    console.log('\n' + '='.repeat(60))
    console.log('🎉 上传完成！')
    console.log('='.repeat(60))
    console.log(`✅ 成功创建 ${successCount} 个课程`)
    console.log(`📊 课程总数: ${results.length}`)
    
    // 按作者分组统计
    const authorStats = {}
    results.forEach(r => {
      authorStats[r.author] = (authorStats[r.author] || 0) + 1
    })
    
    console.log('\n📊 作者统计:')
    Object.entries(authorStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([author, count]) => {
        console.log(`   ${author}: ${count} 个课程`)
      })
    
    console.log('\n💡 提示:')
    console.log('- 所有课程均为免费课程（price = 0）')
    console.log('- 课程名称显示在列表页')
    console.log('- 作者信息显示在详情页')
    console.log('- 视频暂未上传，预留了字段')
    console.log('- 封面图已上传到 Supabase Storage')
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

main()
