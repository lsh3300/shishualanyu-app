const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少Supabase环境变量');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('开始测试数据库连接...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试基本连接
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('数据库连接测试失败:', error);
      return false;
    }
    
    console.log('数据库连接成功!');
    
    // 测试favorites表是否存在
    const { data: favData, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (favError) {
      console.error('favorites表访问失败:', favError);
      return false;
    }
    
    console.log('favorites表访问成功!');
    
    // 检查表结构
    const { data: tableInfo, error: tableError } = await supabase
      .from('favorites')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('获取表结构失败:', tableError);
      return false;
    }
    
    console.log('表结构检查完成');
    
    return true;
  } catch (err) {
    console.error('连接测试过程中发生错误:', err);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('所有测试通过，数据库连接正常');
    process.exit(0);
  } else {
    console.error('数据库连接存在问题');
    process.exit(1);
  }
});