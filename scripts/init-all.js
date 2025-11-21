const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 开始完整初始化...\n')

// 检查 SQL 文件是否存在
const sqlFile = path.join(__dirname, 'init-courses-table.sql')
if (!fs.existsSync(sqlFile)) {
  console.error('❌ SQL 文件不存在:', sqlFile)
  process.exit(1)
}

console.log('📝 请按以下步骤操作:\n')
console.log('步骤 1️⃣: 在 Supabase Dashboard 执行 SQL')
console.log('  1. 打开 https://supabase.com/dashboard')
console.log('  2. 选择你的项目')
console.log('  3. 点击左侧菜单的 "SQL Editor"')
console.log('  4. 点击 "New Query"')
console.log(`  5. 复制文件内容: ${sqlFile}`)
console.log('  6. 粘贴到查询编辑器')
console.log('  7. 点击 "Run" 按钮执行\n')

console.log('完成后按任意键继续...')
// 等待用户输入
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.once('data', () => {
  process.stdin.setRawMode(false)
  
  console.log('\n步骤 2️⃣: 初始化产品数据...')
  try {
    execSync('node scripts/seed-products.js', { stdio: 'inherit' })
    console.log('✅ 产品数据初始化完成\n')
  } catch (error) {
    console.error('❌ 产品数据初始化失败')
    process.exit(1)
  }

  console.log('步骤 3️⃣: 初始化课程数据...')
  try {
    execSync('node scripts/seed-courses.js', { stdio: 'inherit' })
    console.log('✅ 课程数据初始化完成\n')
  } catch (error) {
    console.error('❌ 课程数据初始化失败')
    process.exit(1)
  }

  console.log('🎉 所有数据初始化完成！')
  console.log('\n现在你可以:')
  console.log('  • 浏览商品页面并收藏商品')
  console.log('  • 浏览课程页面并收藏课程')
  console.log('  • 在 /profile/favorites 查看收藏列表\n')
  
  process.exit(0)
})
