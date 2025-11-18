const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFavoritesAPI() {
  try {
    console.log('测试收藏API...');
    
    // 测试获取收藏列表
    console.log('1. 测试获取收藏列表...');
    const { data, error } = await supabase
      .from('favorites')
      .select('*');
    
    if (error) {
      console.error('获取收藏列表失败:', error);
    } else {
      console.log('获取收藏列表成功:', data);
    }
    
    // 测试关联查询
    console.log('2. 测试关联查询...');
    const { data: joinedData, error: joinError } = await supabase
      .from('favorites')
      .select(`
        *,
        products (
          id,
          name,
          price,
          images,
          category
        )
      `);
    
    if (joinError) {
      console.error('关联查询失败:', joinError);
    } else {
      console.log('关联查询成功:', joinedData);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testFavoritesAPI();