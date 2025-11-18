const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // 使用服务密钥以确保有足够权限

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

// 测试用户ID
const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';
// 测试产品ID (使用实际存在的产品ID)
const TEST_PRODUCT_ID = '578d78c6-0b9f-4fb5-a8df-4dfd809e1edf';

async function testAddFavorite() {
  try {
    console.log('测试添加收藏功能...');
    
    // 1. 检查当前收藏数量
    console.log('1. 检查当前收藏数量...');
    const { data: currentStats } = await supabase
      .rpc('get_user_stats', { user_id: TEST_USER_ID });
    
    console.log('当前统计:', currentStats);
    
    // 2. 添加一个收藏项
    console.log('2. 添加收藏项...');
    const { data: insertData, error: insertError } = await supabase
      .from('favorites')
      .insert({
        user_id: TEST_USER_ID,
        product_id: TEST_PRODUCT_ID
      })
      .select();
    
    if (insertError) {
      console.error('添加收藏失败:', insertError);
      return;
    }
    
    console.log('添加收藏成功:', insertData);
    
    // 3. 检查更新后的收藏数量
    console.log('3. 检查更新后的收藏数量...');
    const { data: updatedStats } = await supabase
      .rpc('get_user_stats', { user_id: TEST_USER_ID });
    
    console.log('更新后统计:', updatedStats);
    
    // 4. 调用统计API
    console.log('4. 调用统计API...');
    const response = await fetch('http://localhost:3001/api/user/stats');
    const apiData = await response.json();
    
    console.log('API返回数据:', apiData);
    
    // 5. 不清理测试数据，保留用于验证
    console.log('5. 保留测试数据用于验证...');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAddFavorite();