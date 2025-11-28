#!/usr/bin/env node
/**
 * 验证课程数据
 * 运行命令：node scripts/verify-courses.js
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
  console.log('🔍 验证课程数据...\n')
  
  try {
    // 1. 查询课程总数
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, instructor, duration, price, category, image_url')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    console.log(`✅ 课程总数: ${courses.length}`)
    
    // 2. 分类统计
    console.log('\n课程分类统计:')
    const categoryStats = {}
    courses.forEach(c => {
      categoryStats[c.category] = (categoryStats[c.category] || 0) + 1
    })
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 个`)
    })
    
    // 3. 作者统计
    console.log('\n作者统计（前10位）:')
    const authorStats = {}
    courses.forEach(c => {
      authorStats[c.instructor] = (authorStats[c.instructor] || 0) + 1
    })
    Object.entries(authorStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([author, count]) => {
        console.log(`   ${author}: ${count} 个课程`)
      })
    
    // 4. 检查封面图
    const withCovers = courses.filter(c => c.image_url).length
    const withoutCovers = courses.filter(c => !c.image_url).length
    console.log(`\n封面图统计:`)
    console.log(`   有封面: ${withCovers} 个`)
    console.log(`   无封面: ${withoutCovers} 个`)
    
    if (withoutCovers > 0) {
      console.log('\n无封面的课程:')
      courses.filter(c => !c.image_url).forEach(c => {
        console.log(`   - ${c.title} (${c.instructor})`)
      })
    }
    
    // 5. 价格统计
    const freeCourses = courses.filter(c => c.price === 0 || c.price === '0').length
    const paidCourses = courses.filter(c => c.price > 0).length
    console.log(`\n价格统计:`)
    console.log(`   免费课程: ${freeCourses} 个`)
    console.log(`   付费课程: ${paidCourses} 个`)
    
    // 6. 显示前5个课程示例
    console.log('\n📚 课程示例（前5个）:')
    courses.slice(0, 5).forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.title}`)
      console.log(`   讲师: ${c.instructor}`)
      console.log(`   时长: ${c.duration} 分钟`)
      console.log(`   分类: ${c.category}`)
      console.log(`   价格: ${c.price === 0 || c.price === '0' ? '免费' : '¥' + c.price}`)
      console.log(`   封面: ${c.image_url ? '✅ 有' : '❌ 无'}`)
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 验证完成！课程数据正常。')
    console.log('='.repeat(60))
    console.log('\n下一步：访问 http://localhost:3000/teaching 查看课程')
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  }
}

verify()
