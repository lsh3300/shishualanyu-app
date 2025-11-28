const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkProducts() {
  try {
    console.log('检查产品表...');
    
    // 获取产品列表
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    if (error) {
      console.error('获取产品失败:', error);
      return;
    }
    
    console.log('产品列表:');
    products.forEach(product => {
      console.log(`ID: ${product.id}, 名称: ${product.name}`);
    });
    
    if (products.length === 0) {
      console.log('没有找到产品，尝试创建一个测试产品...');
      
      // 创建测试产品
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: '测试产品',
          price: 99.99,
          description: '这是一个测试产品',
          category: 'clothing',
          images: ['https://example.com/image.jpg']
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('创建测试产品失败:', insertError);
      } else {
        console.log('创建测试产品成功:', newProduct);
      }
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkProducts();