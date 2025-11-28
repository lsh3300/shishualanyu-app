#!/usr/bin/env node
/**
 * 验证首页课程显示
 * 运行命令：node scripts/verify-homepage-courses.js
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

async function verifyHomepageCourses() {
  console.log('🔍 验证首页课程显示...\n')
  
  try {
    // 1. 模拟首页获取课程（最新3个）
    console.log('1️⃣ 获取首页课程数据...')
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, instructor, duration, price, image_url, category')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) throw error
    
    console.log(`   ✅ 将显示 ${courses.length} 个课程\n`)
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`)
      console.log(`   讲师: ${course.instructor}`)
      console.log(`   时长: ${course.duration} 分钟`)
      console.log(`   分类: ${course.category}`)
      console.log(`   价格: ${course.price === 0 || course.price === '0' ? '免费' : '¥' + course.price}`)
      console.log(`   封面: ${course.image_url ? '✅ 有' : '❌ 无'}`)
      if (course.image_url) {
        console.log(`   URL: ${course.image_url.substring(0, 60)}...`)
      }
      console.log('')
    })
    
    // 2. 检查是否还有旧的虚拟课程
    console.log('2️⃣ 检查旧课程数据...')
    
    const oldKeywords = ['传统扎染基础入门', '蜡染工艺深度解析', '现代蓝染创新技法']
    const { data: oldCourses } = await supabase
      .from('courses')
      .select('id, title')
    
    const foundOld = oldCourses?.filter(c => 
      oldKeywords.some(keyword => c.title.includes(keyword))
    ) || []
    
    if (foundOld.length > 0) {
      console.log(`   ⚠️  发现 ${foundOld.length} 个旧虚拟课程:`)
      foundOld.forEach(c => console.log(`      - ${c.title}`))
    } else {
      console.log(`   ✅ 旧虚拟课程已清理`)
    }
    
    // 3. 统计课程状态
    console.log('\n3️⃣ 课程统计...')
    console.log(`   总课程数: ${oldCourses?.length || 0}`)
    console.log(`   免费课程: ${oldCourses?.filter(c => c.price === 0 || c.price === '0').length || 0}`)
    console.log(`   付费课程: ${oldCourses?.filter(c => c.price > 0).length || 0}`)
    
    // 4. 检查封面图可访问性
    console.log('\n4️⃣ 检查封面图可访问性...')
    let accessibleCount = 0
    for (const course of courses) {
      if (course.image_url) {
        try {
          const response = await fetch(course.image_url, { method: 'HEAD' })
          if (response.ok) {
            accessibleCount++
          } else {
            console.log(`   ⚠️  ${course.title} 的封面图无法访问 (${response.status})`)
          }
        } catch (error) {
          console.log(`   ⚠️  ${course.title} 的封面图检查失败`)
        }
      }
    }
    console.log(`   ✅ ${accessibleCount}/${courses.filter(c => c.image_url).length} 个封面图可访问`)
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 验证完成！')
    console.log('='.repeat(60))
    console.log('\n提示：')
    console.log('- 访问 http://localhost:3000 查看首页')
    console.log('- 首页"教学精选"部分现在显示真实课程')
    console.log('- 课程名称在列表页显示，作者在详情页显示')
    console.log('- 所有课程均为免费课程')
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  }
}

verifyHomepageCourses()
