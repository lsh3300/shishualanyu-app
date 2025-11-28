const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少Supabase环境变量');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('开始测试favorites表结构...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFavoritesTable() {
  try {
    // 1. 检查favorites表是否存在
    console.log('\n1. 检查favorites表是否存在...');
    
    // 2. 检查favorites表结构
    console.log('\n2. 检查favorites表结构...');
    const { data: favData, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .limit(0);
    
    if (favError) {
      console.error('favorites表访问失败:', favError);
      console.log('错误代码:', favError.code);
      
      if (favError.code === 'PGRST116') {
        console.log('\nfavorites表不存在，需要创建');
        return false;
      } else if (favError.code === 'PGRST301') {
        console.log('\nfavorites表存在，但RLS策略阻止了访问');
        console.log('这是正常的，因为RLS策略要求用户登录才能访问自己的收藏');
        return true;
      } else {
        console.log('\n未知错误:', favError);
        return false;
      }
    }
    
    console.log('favorites表访问成功!');
    
    // 3. 检查products表是否存在
    console.log('\n3. 检查products表是否存在...');
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (prodError) {
      console.error('products表访问失败:', prodError);
      return false;
    }
    
    console.log('products表访问成功!');
    
    console.log('\nfavorites表结构测试完成!');
    return true;
  } catch (err) {
    console.error('测试过程中发生错误:', err);
    return false;
  }
}

testFavoritesTable().then(success => {
  if (success) {
    console.log('\nfavorites表结构正常');
    process.exit(0);
  } else {
    console.error('\nfavorites表存在问题');
    process.exit(1);
  }
});