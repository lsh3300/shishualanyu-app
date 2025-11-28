#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function checkStatus() {
  console.log('🔍 检查课程 status 字段...\n')
  
  // 检查所有课程
  const { data: allCourses } = await supabase
    .from('courses')
    .select('id, title, status')
    .limit(5)
  
  console.log('前5个课程的 status:')
  allCourses?.forEach(c => {
    console.log(`  ${c.title}: ${c.status || '(null)'}`)
  })
  
  // 统计 status
  const { data: courses } = await supabase
    .from('courses')
    .select('status')
  
  const statusCount = {}
  courses?.forEach(c => {
    const status = c.status || 'null'
    statusCount[status] = (statusCount[status] || 0) + 1
  })
  
  console.log('\nstatus 统计:')
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} 个`)
  })
  
  // 修复：设置所有课程为 published
  console.log('\n📝 设置所有课程为 published...')
  const { error } = await supabase
    .from('courses')
    .update({ status: 'published' })
    .is('status', null)
  
  if (error) {
    console.error('更新失败:', error)
  } else {
    console.log('✅ 已更新所有课程状态')
  }
}

checkStatus()
