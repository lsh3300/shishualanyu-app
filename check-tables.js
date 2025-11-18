const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('使用ANON_KEY测试数据库连接...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    // 测试基本连接
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('数据库连接测试失败:', error);
      return false;
    }
    
    console.log('数据库连接成功!');
    
    // 列出所有表
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.error('获取表列表失败:', tablesError);
      
      // 尝试直接查询favorites表
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('*')
        .limit(1);
      
      if (favError) {
        console.error('favorites表不存在:', favError.message);
        console.log('需要在Supabase控制台手动创建favorites表');
        console.log('请访问: https://ihsghruaglrolmpnxewt.supabase.co/project/default/sql');
        console.log('然后执行以下SQL:');
        console.log(`
          CREATE TABLE IF NOT EXISTS favorites (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users NOT NULL,
            product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, product_id)
          );
          
          ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Users can view own favorites" 
            ON favorites FOR SELECT 
            USING (auth.uid() = user_id);
          
          CREATE POLICY IF NOT EXISTS "Users can insert own favorites" 
            ON favorites FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY IF NOT EXISTS "Users can delete own favorites" 
            ON favorites FOR DELETE 
            USING (auth.uid() = user_id);
          
          CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
          CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
        `);
      } else {
        console.log('favorites表已存在');
      }
    } else {
      console.log('数据库中的表:', tables);
    }
    
    return true;
  } catch (err) {
    console.error('检查过程中发生错误:', err);
    return false;
  }
}

checkTables().then(success => {
  if (success) {
    console.log('检查完成');
    process.exit(0);
  } else {
    console.error('检查失败');
    process.exit(1);
  }
});