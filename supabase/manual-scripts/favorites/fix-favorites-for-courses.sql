-- 修改favorites表以支持课程收藏
-- 此脚本应在Supabase SQL编辑器中执行

-- 1. 首先，添加新字段（如果不存在）
DO $$ 
BEGIN
  -- 添加item_type字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' AND column_name = 'item_type'
  ) THEN
    ALTER TABLE favorites ADD COLUMN item_type TEXT DEFAULT 'product' CHECK (item_type IN ('product', 'course'));
    CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);
  END IF;

  -- 添加course_id字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE favorites ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);
  END IF;
END $$;

-- 2. 修改product_id字段，使其变为可选（如果还没有）
-- 注意：这需要先删除外键约束，然后重新添加
DO $$
BEGIN
  -- 检查product_id是否允许NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' 
    AND column_name = 'product_id' 
    AND is_nullable = 'NO'
  ) THEN
    -- 先删除现有的唯一约束（如果存在）
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;
    
    -- 删除外键约束
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;
    
    -- 使product_id变为可选
    ALTER TABLE favorites ALTER COLUMN product_id DROP NOT NULL;
    
    -- 重新添加外键约束（现在允许NULL）
    ALTER TABLE favorites 
    ADD CONSTRAINT favorites_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. 添加检查约束，确保product_id和course_id至少有一个存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'favorites_product_or_course_check'
  ) THEN
    ALTER TABLE favorites 
    ADD CONSTRAINT favorites_product_or_course_check 
    CHECK (
      (product_id IS NOT NULL AND course_id IS NULL AND item_type = 'product') OR
      (product_id IS NULL AND course_id IS NOT NULL AND item_type = 'course')
    );
  END IF;
END $$;

-- 4. 创建新的唯一约束，支持商品和课程
-- 对于商品：确保(user_id, product_id)唯一
-- 对于课程：确保(user_id, course_id)唯一
DO $$
BEGIN
  -- 删除旧的唯一约束（如果存在）
  ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;
  
  -- 创建部分唯一索引来替代唯一约束
  -- 商品收藏的唯一约束
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_favorites_user_product_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_favorites_user_product_unique 
    ON favorites(user_id, product_id) 
    WHERE product_id IS NOT NULL;
  END IF;
  
  -- 课程收藏的唯一约束
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_favorites_user_course_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_favorites_user_course_unique 
    ON favorites(user_id, course_id) 
    WHERE course_id IS NOT NULL;
  END IF;
END $$;

-- 5. 更新RLS策略（如果需要）
-- 现有的RLS策略应该仍然有效，因为它们基于user_id

-- 验证修改
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;

