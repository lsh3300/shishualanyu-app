const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key starts with:', supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'undefined');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('测试Supabase连接...');
    
    // 测试简单查询
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('查询失败:', error);
    } else {
      console.log('连接成功，产品数量:', data);
    }
    
    // 测试RLS策略
    console.log('\n测试RLS策略...');
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (favoritesError) {
      console.error('查询favorites表失败:', favoritesError);
    } else {
      console.log('查询favorites表成功:', favoritesData);
    }
    
  } catch (error) {
    console.error('测试连接失败:', error);
  }
}

testConnection();