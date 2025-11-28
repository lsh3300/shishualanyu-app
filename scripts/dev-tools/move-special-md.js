const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const docsDir = path.join(rootDir, 'docs');

const files = [
  '⚡快速修复卡片.md',
  '⚡终极修复方案-文章收藏.md',
  '✅优化完成总结.md',
  '✅部署错误一次性修复完成.md',
  '🎯最终修复-完整版.md',
  '📱Vercel部署修复完成.md',
  '🔥最终修复-文章收藏完全指南.md',
  '🔥立即执行-禁用RLS解决方案.md',
  '🔧第二轮优化完成.md',
];

console.log('根目录:', rootDir);
console.log('docs 目录:', docsDir);

for (const name of files) {
  const src = path.join(rootDir, name);
  const dest = path.join(docsDir, name);

  if (!fs.existsSync(src)) {
    console.log(`⏭️ 跳过（根目录不存在）：${name}`);
    continue;
  }

  try {
    fs.renameSync(src, dest);
    console.log(`✅ 已移动到 docs/: ${name}`);
  } catch (err) {
    console.error(`❌ 移动失败 ${name}:`, err.message);
  }
}
