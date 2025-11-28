#!/usr/bin/env node
/**
 * 简化版视频上传脚本
 * 前置条件：已在 Supabase SQL Editor 执行：
 * ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const VIDEO_BUCKET_NAME = 'course-videos'
const VIDEOS_DIR = path.resolve(process.cwd(), '整理后课堂实践作品/压缩后教程视频')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少 Supabase 配置')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// 解析文件名
function parseVideoFileName(fileName) {
  const nameWithoutSuffix = fileName.replace(/_ultra\.mp4$/i, '')
  const parts = nameWithoutSuffix.split('-')
  
  if (parts.length >= 2) {
    const author = parts[0].trim()
    const title = parts.slice(1).join('-').trim()
    return { author, title }
  }
  
  return { author: '未知', title: nameWithoutSuffix }
}

// 确保 bucket 存在
async function ensureVideoBucket() {
  console.log('📦 检查 bucket...')
  
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some((b) => b.name === VIDEO_BUCKET_NAME)
  
  if (bucketExists) {
    console.log('✅ Bucket 已存在')
    return
  }
  
  console.log('📦 创建 bucket...')
  const { error } = await supabase.storage.createBucket(VIDEO_BUCKET_NAME, {
    public: true,
    fileSizeLimit: 52428800
  })
  
  if (error) throw error
  console.log('✅ Bucket 创建成功')
}

// 上传视频
async function uploadVideo(filePath, remotePath) {
  const fileBuffer = await fs.promises.readFile(filePath)
  
  const { error } = await supabase.storage
    .from(VIDEO_BUCKET_NAME)
    .upload(remotePath, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    })
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from(VIDEO_BUCKET_NAME)
    .getPublicUrl(remotePath)
  
  return urlData.publicUrl
}

// 查找匹配课程
async function findMatchingCourse(author, title) {
  let { data: courses } = await supabase
    .from('courses')
    .select('id, title, instructor, slug')
    .eq('instructor', author)
    .ilike('title', `%${title}%`)
  
  if (courses && courses.length > 0) return courses[0]
  
  const { data: coursesByTitle } = await supabase
    .from('courses')
    .select('id, title, instructor, slug')
    .ilike('title', `%${title}%`)
  
  if (coursesByTitle && coursesByTitle.length > 0) return coursesByTitle[0]
  
  return null
}

// 更新课程
async function updateCourseVideoUrl(courseId, videoUrl) {
  const { error } = await supabase
    .from('courses')
    .update({ video_url: videoUrl })
    .eq('id', courseId)
  
  if (error) throw error
}

// 处理单个视频
async function processVideo(fileName) {
  console.log(`\n📹 ${fileName}`)
  
  const { author, title } = parseVideoFileName(fileName)
  console.log(`   作者: ${author}, 课程: ${title}`)
  
  const course = await findMatchingCourse(author, title)
  
  if (!course) {
    console.log(`   ⚠️  未找到匹配课程`)
    return { fileName, status: 'no_match', author, title }
  }
  
  console.log(`   ✅ 匹配: ${course.title}`)
  
  try {
    const localPath = path.join(VIDEOS_DIR, fileName)
    // 使用更简单的文件名：只用 slug.mp4，避免特殊字符问题
    const remotePath = `${course.slug}.mp4`
    
    const videoUrl = await uploadVideo(localPath, remotePath)
    console.log(`   ✅ 上传成功`)
    
    await updateCourseVideoUrl(course.id, videoUrl)
    console.log(`   ✅ 已更新`)
    
    return { fileName, status: 'success', courseId: course.id, courseTitle: course.title }
  } catch (error) {
    console.error(`   ❌ 失败: ${error.message}`)
    return { fileName, status: 'error', error: error.message }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始上传视频\n')
  console.log('=' . repeat(50) + '\n')
  
  try {
    await ensureVideoBucket()
    
    console.log('\n📂 扫描视频文件...')
    const files = await fs.promises.readdir(VIDEOS_DIR)
    const videoFiles = files.filter(f => f.endsWith('_ultra.mp4'))
    
    console.log(`✅ 找到 ${videoFiles.length} 个文件\n`)
    
    const results = []
    for (let i = 0; i < videoFiles.length; i++) {
      console.log(`[${i + 1}/${videoFiles.length}]`)
      const result = await processVideo(videoFiles[i])
      results.push(result)
      
      if ((i + 1) % 5 === 0) {
        console.log('\n⏸️  暂停 2 秒...\n')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('\n📊 汇总：\n')
    
    const successful = results.filter(r => r.status === 'success')
    const noMatch = results.filter(r => r.status === 'no_match')
    const errors = results.filter(r => r.status === 'error')
    
    console.log(`✅ 成功: ${successful.length}`)
    console.log(`⚠️  未匹配: ${noMatch.length}`)
    console.log(`❌ 失败: ${errors.length}`)
    
    if (noMatch.length > 0) {
      console.log('\n未匹配的视频：')
      noMatch.forEach(r => console.log(`  - ${r.fileName} (${r.author} - ${r.title})`))
    }
    
    if (errors.length > 0) {
      console.log('\n失败的视频：')
      errors.forEach(r => console.log(`  - ${r.fileName}: ${r.error}`))
    }
    
    console.log('\n✅ 完成！')
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message)
    process.exit(1)
  }
}

main()
