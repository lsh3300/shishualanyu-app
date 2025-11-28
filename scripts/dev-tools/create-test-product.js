const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 简单的UUID生成函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function createTestProduct() {
  try {
    console.log('创建测试产品...');
    
    // 生成一个UUID作为测试产品ID
    const testProductId = generateUUID();
    console.log('生成的测试产品ID:', testProductId);
    
    // 创建测试产品
    const { data, error } = await supabase
      .from('products')
      .insert({
        id: testProductId,
        name: '测试产品',
        description: '这是一个用于测试收藏功能的产品',
        price: 99.99,
        category: 'test',
        in_stock: true,
        image_url: 'https://via.placeholder.com/300x300.png?text=Test+Product'
      })
      .select();
    
    if (error) {
      console.error('创建测试产品失败:', error);
    } else {
      console.log('创建测试产品成功:', data);
      
      // 更新测试页面中的产品ID
      const fs = require('fs');
      const path = require('path');
      const pagePath = path.join(__dirname, 'app', 'test-favorites', 'page.tsx');
      let pageContent = fs.readFileSync(pagePath, 'utf8');
      
      // 替换测试产品ID
      pageContent = pageContent.replace(
        /body: JSON\.stringify\(\{ productId: '.*?' \}\)/,
        `body: JSON.stringify({ productId: '${testProductId}' })`
      );
      
      fs.writeFileSync(pagePath, pageContent);
      console.log('已更新测试页面中的产品ID');
    }
    
  } catch (error) {
    console.error('创建测试产品失败:', error);
  }
}

createTestProduct();