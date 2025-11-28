#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function testCourseDetail() {
  console.log('🧪 测试课程详情页数据获取...\n')
  
  // 1. 获取第一个课程ID
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .limit(5)
  
  if (!courses || courses.length === 0) {
    console.log('❌ 没有找到任何课程')
    return
  }
  
  console.log(`找到 ${courses.length} 个课程:\n`)
  courses.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   ID: ${c.id}`)
    console.log(`   URL: http://localhost:3000/teaching/${c.id}\n`)
  })
  
  // 2. 测试获取第一个课程的详细信息
  const testCourseId = courses[0].id
  console.log(`\n🔍 测试获取课程详情: ${courses[0].title}`)
  console.log(`   课程ID: ${testCourseId}\n`)
  
  const { data: courseDetail, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', testCourseId)
    .single()
  
  if (error) {
    console.error('❌ 获取课程详情失败:', error)
    return
  }
  
  if (!courseDetail) {
    console.log('❌ 课程不存在')
    return
  }
  
  console.log('✅ 成功获取课程详情:')
  console.log(`   标题: ${courseDetail.title}`)
  console.log(`   讲师: ${courseDetail.instructor}`)
  console.log(`   时长: ${courseDetail.duration} 分钟`)
  console.log(`   分类: ${courseDetail.category}`)
  console.log(`   价格: ${courseDetail.price === 0 ? '免费' : '¥' + courseDetail.price}`)
  console.log(`   封面: ${courseDetail.image_url ? '有' : '无'}`)
  
  console.log('\n📋 完整数据:')
  console.log(JSON.stringify(courseDetail, null, 2))
  
  console.log('\n\n✅ 测试完成！')
  console.log('\n请访问以下URL测试:')
  console.log(`http://localhost:3000/teaching/${testCourseId}`)
}

testCourseDetail()
