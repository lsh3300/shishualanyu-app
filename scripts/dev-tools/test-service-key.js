const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase环境变量');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('SERVICE_KEY前10位:', supabaseServiceKey.substring(0, 10) + '...');
console.log('SERVICE_KEY长度:', supabaseServiceKey.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testServiceKey() {
  try {
    // 测试服务端密钥是否有效
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('SERVICE_KEY测试失败:', error);
      return false;
    }
    
    console.log('SERVICE_KEY测试成功!');
    
    // 尝试创建favorites表
    console.log('尝试创建favorites表...');
    
    const { data: tableData, error: tableError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (tableError) {
      console.error('创建favorites表失败:', tableError);
      console.log('尝试使用直接SQL创建...');
      
      // 尝试直接使用SQL
      const { data: sqlData, error: sqlError } = await supabase
        .from('favorites')
        .select('*')
        .limit(1);
      
      if (sqlError && sqlError.code === 'PGRST205') {
        console.log('favorites表不存在，需要手动在Supabase控制台创建');
        console.log('请在Supabase控制台的SQL编辑器中执行以下SQL:');
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
      } else if (sqlError) {
        console.error('其他SQL错误:', sqlError);
      } else {
        console.log('favorites表已存在');
      }
    } else {
      console.log('favorites表创建成功!');
    }
    
    return true;
  } catch (err) {
    console.error('测试过程中发生错误:', err);
    return false;
  }
}

testServiceKey().then(success => {
  if (success) {
    console.log('测试完成');
    process.exit(0);
  } else {
    console.error('测试失败');
    process.exit(1);
  }
});