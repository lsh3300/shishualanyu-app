#!/usr/bin/env node
/**
 * 压缩产品图片
 * 运行命令：node scripts/compress-product-images.js
 * 
 * 功能：
 * 1. 压缩所有产品图片到合适大小
 * 2. 保持原图在 backup 文件夹
 * 3. 将压缩后的图片替换原图
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const IMAGES_DIR = path.resolve(process.cwd(), '整理后课堂实践作品/产品图片')
const BACKUP_DIR = path.join(IMAGES_DIR, 'originals-backup')
const MAX_WIDTH = 1920 // 最大宽度
const MAX_HEIGHT = 1920 // 最大高度
const QUALITY = 85 // JPEG 质量
const MAX_FILE_SIZE = 500 * 1024 // 500KB 目标文件大小

async function compressImage(inputPath, outputPath) {
  const stats = await fs.promises.stat(inputPath)
  const originalSize = stats.size
  
  // 如果文件小于 500KB，跳过
  if (originalSize < MAX_FILE_SIZE) {
    return { skipped: true, originalSize, newSize: originalSize }
  }
  
  const ext = path.extname(inputPath).toLowerCase()
  let pipeline = sharp(inputPath).rotate() // 自动旋转
  
  // 调整尺寸
  pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
    fit: 'inside',
    withoutEnlargement: true
  })
  
  // 根据格式压缩
  if (ext === '.png') {
    pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 })
  } else {
    pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true })
  }
  
  await pipeline.toFile(outputPath)
  
  const newStats = await fs.promises.stat(outputPath)
  const newSize = newStats.size
  
  return { skipped: false, originalSize, newSize }
}

async function main() {
  console.log('🖼️  开始压缩产品图片...\n')
  
  try {
    // 检查 sharp 是否安装
    try {
      require('sharp')
    } catch (error) {
      console.error('❌ sharp 模块未安装')
      console.log('请运行: npm install sharp')
      process.exit(1)
    }
    
    // 创建备份目录
    if (!fs.existsSync(BACKUP_DIR)) {
      await fs.promises.mkdir(BACKUP_DIR, { recursive: true })
      console.log(`📁 创建备份目录: ${BACKUP_DIR}\n`)
    }
    
    // 扫描图片文件
    const files = await fs.promises.readdir(IMAGES_DIR)
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png|webp)$/i.test(f) && 
      !f.startsWith('.') &&
      fs.statSync(path.join(IMAGES_DIR, f)).isFile()
    )
    
    console.log(`找到 ${imageFiles.length} 个图片文件`)
    
    let compressedCount = 0
    let skippedCount = 0
    let totalOriginalSize = 0
    let totalNewSize = 0
    
    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = imageFiles[i]
      const inputPath = path.join(IMAGES_DIR, fileName)
      const backupPath = path.join(BACKUP_DIR, fileName)
      const tempPath = path.join(IMAGES_DIR, `temp-${fileName}`)
      
      try {
        console.log(`[${i + 1}/${imageFiles.length}] 处理: ${fileName}`)
        
        const result = await compressImage(inputPath, tempPath)
        
        if (result.skipped) {
          console.log(`  ⏭️  跳过（文件已足够小: ${(result.originalSize / 1024).toFixed(1)} KB）`)
          skippedCount++
          if (fs.existsSync(tempPath)) {
            await fs.promises.unlink(tempPath)
          }
        } else {
          // 备份原图
          await fs.promises.copyFile(inputPath, backupPath)
          
          // 替换原图
          await fs.promises.unlink(inputPath)
          await fs.promises.rename(tempPath, inputPath)
          
          const savedSize = result.originalSize - result.newSize
          const savedPercent = ((savedSize / result.originalSize) * 100).toFixed(1)
          
          console.log(`  ✅ 压缩完成: ${(result.originalSize / 1024).toFixed(1)} KB -> ${(result.newSize / 1024).toFixed(1)} KB (节省 ${savedPercent}%)`)
          
          compressedCount++
          totalOriginalSize += result.originalSize
          totalNewSize += result.newSize
        }
      } catch (error) {
        console.error(`  ❌ 处理失败:`, error.message)
        // 清理临时文件
        if (fs.existsSync(tempPath)) {
          await fs.promises.unlink(tempPath)
        }
      }
    }
    
    // 输出统计
    console.log('\n' + '='.repeat(60))
    console.log('🎉 压缩完成！')
    console.log('='.repeat(60))
    console.log(`✅ 压缩: ${compressedCount} 个文件`)
    console.log(`⏭️  跳过: ${skippedCount} 个文件`)
    
    if (compressedCount > 0) {
      const totalSaved = totalOriginalSize - totalNewSize
      const totalSavedPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(1)
      console.log(`💾 节省空间: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${totalSavedPercent}%)`)
      console.log(`📦 原始总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`📦 压缩后总大小: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`)
    }
    
    console.log(`\n📁 原始文件备份在: ${BACKUP_DIR}`)
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

main()
