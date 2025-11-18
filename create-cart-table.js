const { createClient } = require('@supabase/supabase-js');

// 直接使用Supabase配置
const supabaseUrl = 'https://ihsghruaglrolmpnxewt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2docnVhZ2xyb2xtcG54ZXd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5OTM0OSwiZXhwIjoyMDc3ODc1MzQ5fQ.xLz4xb4eHzq9i6E40d8vMYzgOloLBuNPJM1tZ4oTzF8';

// 创建Supabase客户端（使用服务角色密钥，具有管理员权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCartTable() {
  try {
    console.log('开始创建cart_items表...');
    
    // 1. 检查表是否存在
    const { data: tableExists, error: checkError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'cart_items'
        );`
      });
    
    if (checkError) {
      console.log('无法检查表是否存在，尝试直接创建...');
    } else {
      console.log('表存在检查结果:', tableExists);
    }
    
    // 2. 创建表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS cart_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          product_id UUID NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          color TEXT DEFAULT '',
          size TEXT DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('执行创建表SQL...');
    const { data: createResult, error: createError } = await supabase
      .rpc('exec_sql', { sql: createTableSQL });
      
    if (createError) {
      console.error('创建表失败:', createError);
      console.log('尝试使用REST API直接执行SQL...');
      
      // 尝试使用REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: createTableSQL })
      });
      
      if (!response.ok) {
        console.error('REST API创建表也失败:', await response.text());
        console.log('请在Supabase控制台手动执行以下SQL:');
        console.log(createTableSQL);
      } else {
        console.log('通过REST API成功创建表');
      }
    } else {
      console.log('成功创建表');
    }
    
    // 3. 创建索引
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
    `;
    
    console.log('执行创建索引SQL...');
    const { data: indexResult, error: indexError } = await supabase
      .rpc('exec_sql', { sql: createIndexSQL });
      
    if (indexError) {
      console.error('创建索引失败:', indexError);
    } else {
      console.log('成功创建索引');
    }
    
    // 4. 删除外键约束
    const dropFKSQL = `
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1 FROM information_schema.table_constraints       
              WHERE constraint_name = 'cart_items_user_id_fkey'        
              AND table_name = 'cart_items'
          ) THEN
              ALTER TABLE cart_items DROP CONSTRAINT cart_items_user_id_fkey;
          END IF;
      END $$;
    `;
    
    console.log('执行删除外键约束SQL...');
    const { data: dropFKResult, error: dropFKError } = await supabase
      .rpc('exec_sql', { sql: dropFKSQL });
      
    if (dropFKError) {
      console.error('删除外键约束失败:', dropFKError);
    } else {
      console.log('成功删除外键约束');
    }
    
    // 5. 创建RLS策略
    const createPolicySQL = `
      DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;     
      DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
      DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
      DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
      
      CREATE POLICY "Enable all operations for cart_items" ON cart_items
        FOR ALL USING (true) WITH CHECK (true);
        
      ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
    `;
    
    console.log('执行创建RLS策略SQL...');
    const { data: policyResult, error: policyError } = await supabase
      .rpc('exec_sql', { sql: createPolicySQL });
      
    if (policyError) {
      console.error('创建RLS策略失败:', policyError);
    } else {
      console.log('成功创建RLS策略');
    }
    
    // 6. 测试查询
    const { data: testData, error: testError } = await supabase
      .from('cart_items')
      .select('*');
      
    if (testError) {
      console.error('测试查询失败:', testError);
    } else {
      console.log('测试查询成功，当前购物车商品数量:', testData.length);
    }
    
    console.log('cart_items表创建和配置完成！');
    
  } catch (error) {
    console.error('创建cart_items表时出错:', error);
  }
}

createCartTable();