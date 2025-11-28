#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function runMigration() {
  console.log('🚀 开始执行用户成就系统数据库迁移...\n')
  
  try {
    // 读取迁移文件
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20251127_user_achievements.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 读取迁移文件成功')
    console.log('📝 准备执行 SQL 语句...\n')
    
    // 分割 SQL 语句（按 -- ===== 分隔）
    const statements = sql
      .split(/-- ={40,}/g)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📊 共 ${statements.length} 个 SQL 块\n`)
    
    // 执行每个语句块
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      const title = statement.split('\n')[0].replace('--', '').trim()
      
      console.log(`[${i + 1}/${statements.length}] ${title}`)
      
      try {
        // Supabase 不支持直接执行复杂 SQL，需要在 Dashboard 中执行
        console.log('   ⚠️  请在 Supabase Dashboard 的 SQL Editor 中执行此迁移')
      } catch (error) {
        console.error(`   ❌ 执行失败:`, error.message)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📝 迁移文件已准备好')
    console.log('='.repeat(60))
    console.log('\n请按照以下步骤手动执行迁移：')
    console.log('\n1. 访问 Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. 选择你的项目')
    console.log('3. 点击左侧菜单 "SQL Editor"')
    console.log('4. 点击 "New query"')
    console.log('5. 复制以下文件内容并粘贴：')
    console.log(`   ${migrationPath}`)
    console.log('6. 点击 "Run" 执行')
    console.log('\n或者使用 Supabase CLI:')
    console.log(`   supabase db push`)
    
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  }
}

runMigration()
