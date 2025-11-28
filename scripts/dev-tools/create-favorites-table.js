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
console.log('使用SERVICE_KEY创建favorites表...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFavoritesTable() {
  try {
    // 创建favorites表
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- 创建收藏表
        CREATE TABLE IF NOT EXISTS favorites (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users NOT NULL,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, product_id)
        );
        
        -- 启用行级安全
        ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
        
        -- 创建RLS策略
        CREATE POLICY IF NOT EXISTS "Users can view own favorites" 
          ON favorites FOR SELECT 
          USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can insert own favorites" 
          ON favorites FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can delete own favorites" 
          ON favorites FOR DELETE 
          USING (auth.uid() = user_id);
        
        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
      `
    });
    
    if (error) {
      console.error('创建favorites表失败:', error);
      return false;
    }
    
    console.log('favorites表创建成功!');
    
    // 验证表是否创建成功
    const { data: favData, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (favError) {
      console.error('验证favorites表失败:', favError);
      return false;
    }
    
    console.log('favorites表验证成功!');
    
    return true;
  } catch (err) {
    console.error('创建表过程中发生错误:', err);
    return false;
  }
}

createFavoritesTable().then(success => {
  if (success) {
    console.log('favorites表创建完成');
    process.exit(0);
  } else {
    console.error('创建favorites表失败');
    process.exit(1);
  }
});