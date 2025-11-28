#!/usr/bin/env node
/**
 * 上传课程视频到 Supabase Storage
 * 运行命令：node scripts/upload-course-videos.js
 * 
 * 功能：
 * 1. 执行数据库迁移，添加 video_url 字段
 * 2. 创建 course-videos bucket（如果不存在）
 * 3. 上传压缩后的视频文件
 * 4. 根据文件名匹配课程记录并更新 video_url
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
  console.error('请确保 .env.local 中包含:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 解析文件名：作者-课程名称_ultra.mp4
function parseVideoFileName(fileName) {
  // 移除 _ultra.mp4 后缀
  const nameWithoutSuffix = fileName.replace(/_ultra\.mp4$/i, '')
  const parts = nameWithoutSuffix.split('-')
  
  if (parts.length >= 2) {
    const author = parts[0].trim()
    const title = parts.slice(1).join('-').trim()
    return { author, title }
  }
  
  return { author: '未知', title: nameWithoutSuffix }
}

// 执行数据库迁移
async function runMigration() {
  console.log('\n📊 执行数据库迁移...')
  
  const migrationSQL = `
    -- 为 courses 表添加 video_url 字段
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;
    
    -- 添加注释
    COMMENT ON COLUMN courses.video_url IS '课程视频URL（Supabase Storage）';
  `
  
  // 尝试查询 video_url 字段，如果不存在会提示需要手动迁移
  const { error } = await supabase.from('courses').select('video_url').limit(1)
  
  if (error && !error.message.includes('already exists')) {
    console.log('⚠️  迁移可能需要手动执行')
    console.log('   请在 Supabase SQL Editor 中执行：')
    console.log('   ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;')
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    return new Promise((resolve) => {
      readline.question('\n已手动执行迁移？(y/n): ', (answer) => {
        readline.close()
        if (answer.toLowerCase() !== 'y') {
          console.error('❌ 取消上传')
          process.exit(1)
        }
        console.log('✅ 继续执行...')
        resolve()
      })
    })
  }
  
  console.log('✅ 数据库迁移完成')
}

// 确保 bucket 存在
async function ensureVideoBucket() {
  console.log('\n📦 检查视频 Storage Bucket...')
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('❌ 无法列出 buckets:', listError.message)
    throw listError
  }
  
  const bucketExists = buckets?.some((bucket) => bucket.name === VIDEO_BUCKET_NAME)
  
  if (bucketExists) {
    console.log('✅ Bucket 已存在:', VIDEO_BUCKET_NAME)
    return
  }
  
  console.log('📦 创建新的 bucket:', VIDEO_BUCKET_NAME)
  const { error: createError } = await supabase.storage.createBucket(VIDEO_BUCKET_NAME, {
    public: true,
    fileSizeLimit: 52428800 // 50MB 限制（虽然我们的视频都小于 5MB）
  })
  
  if (createError) {
    console.error('❌ Bucket 创建失败:', createError.message)
    throw createError
  }
  
  console.log('✅ Bucket 创建成功')
}

// 上传单个视频
async function uploadVideo(filePath, remotePath) {
  console.log(`   📤 上传: ${path.basename(filePath)}`)
  
  const fileBuffer = await fs.promises.readFile(filePath)
  
  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET_NAME)
    .upload(remotePath, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    })
  
  if (error) {
    throw error
  }
  
  // 获取公开 URL
  const { data: urlData } = supabase.storage
    .from(VIDEO_BUCKET_NAME)
    .getPublicUrl(remotePath)
  
  return urlData.publicUrl
}

// 查找匹配的课程记录
async function findMatchingCourse(author, title) {
  // 尝试精确匹配
  let { data: courses } = await supabase
    .from('courses')
    .select('id, title, instructor, slug')
    .eq('instructor', author)
    .ilike('title', `%${title}%`)
  
  if (courses && courses.length > 0) {
    return courses[0]
  }
  
  // 尝试只匹配标题
  const { data: coursesByTitle } = await supabase
    .from('courses')
    .select('id, title, instructor, slug')
    .ilike('title', `%${title}%`)
  
  if (coursesByTitle && coursesByTitle.length > 0) {
    return coursesByTitle[0]
  }
  
  return null
}

// 更新课程的 video_url
async function updateCourseVideoUrl(courseId, videoUrl) {
  const { error } = await supabase
    .from('courses')
    .update({ video_url: videoUrl })
    .eq('id', courseId)
  
  if (error) {
    throw error
  }
}

// 处理单个视频文件
async function processVideo(fileName) {
  console.log(`\n📹 处理视频: ${fileName}`)
  
  const { author, title } = parseVideoFileName(fileName)
  console.log(`   作者: ${author}`)
  console.log(`   课程名: ${title}`)
  
  // 查找匹配的课程
  const course = await findMatchingCourse(author, title)
  
  if (!course) {
    console.log(`   ⚠️  未找到匹配的课程记录`)
    return { fileName, status: 'no_match', author, title }
  }
  
  console.log(`   ✅ 找到课程: ${course.title} (${course.instructor})`)
  
  // 上传视频
  try {
    const localPath = path.join(VIDEOS_DIR, fileName)
    const remotePath = `${course.slug}_${fileName}` // 使用 slug + 原文件名
    
    const videoUrl = await uploadVideo(localPath, remotePath)
    console.log(`   ✅ 上传成功: ${videoUrl}`)
    
    // 更新课程记录
    await updateCourseVideoUrl(course.id, videoUrl)
    console.log(`   ✅ 课程记录已更新`)
    
    return {
      fileName,
      status: 'success',
      courseId: course.id,
      courseTitle: course.title,
      videoUrl
    }
  } catch (error) {
    console.error(`   ❌ 处理失败:`, error.message)
    return {
      fileName,
      status: 'error',
      error: error.message
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始上传课程视频到 Supabase Storage\n')
  console.log('=' . repeat(60))
  
  try {
    // 步骤 1: 执行数据库迁移
    await runMigration()
    
    // 步骤 2: 确保 bucket 存在
    await ensureVideoBucket()
    
    // 步骤 3: 获取所有视频文件
    console.log('\n📂 扫描视频文件...')
    const files = await fs.promises.readdir(VIDEOS_DIR)
    const videoFiles = files.filter(f => f.endsWith('_ultra.mp4'))
    
    console.log(`✅ 找到 ${videoFiles.length} 个视频文件`)
    
    // 步骤 4: 处理所有视频
    const results = []
    for (let i = 0; i < videoFiles.length; i++) {
      const fileName = videoFiles[i]
      console.log(`\n[${i + 1}/${videoFiles.length}]`)
      const result = await processVideo(fileName)
      results.push(result)
      
      // 每处理 5 个文件暂停一下，避免API限流
      if ((i + 1) % 5 === 0) {
        console.log('\n⏸️  暂停 2 秒...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // 总结
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 上传完成！汇总报告：\n')
    
    const successful = results.filter(r => r.status === 'success')
    const noMatch = results.filter(r => r.status === 'no_match')
    const errors = results.filter(r => r.status === 'error')
    
    console.log(`✅ 成功上传: ${successful.length} 个`)
    console.log(`⚠️  未匹配课程: ${noMatch.length} 个`)
    console.log(`❌ 上传失败: ${errors.length} 个`)
    
    if (noMatch.length > 0) {
      console.log('\n未匹配的视频：')
      noMatch.forEach(r => {
        console.log(`  - ${r.fileName} (${r.author} - ${r.title})`)
      })
    }
    
    if (errors.length > 0) {
      console.log('\n失败的视频：')
      errors.forEach(r => {
        console.log(`  - ${r.fileName}: ${r.error}`)
      })
    }
    
    if (successful.length > 0) {
      console.log('\n✅ 成功上传的课程视频现在可以在课程详情页播放了！')
    }
    
  } catch (error) {
    console.error('\n❌ 执行失败:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// 运行主函数
main()
