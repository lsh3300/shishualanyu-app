-- Migration: Extend favorites table to support courses
-- 收藏表扩展迁移：支持课程收藏功能

BEGIN;

-- 1. 添加item_type字段（产品或课程类型）
ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'product' CHECK (item_type IN ('product', 'course'));

CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);

-- 2. 添加course_id字段（关联课程表）
ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);

-- 3. 允许product_id为NULL（课程收藏时可以为空）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'favorites'
      AND column_name = 'product_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;
    ALTER TABLE favorites ALTER COLUMN product_id DROP NOT NULL;
    ALTER TABLE favorites
      ADD CONSTRAINT favorites_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. 删除已存在的约束（如果存在），然后重新创建
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_product_or_course_check;

-- 添加约束：确保product_id和course_id互斥
ALTER TABLE favorites
  ADD CONSTRAINT favorites_product_or_course_check
  CHECK (
    (product_id IS NOT NULL AND course_id IS NULL AND item_type = 'product')
    OR
    (product_id IS NULL AND course_id IS NOT NULL AND item_type = 'course')
  );

-- 5. 删除已存在的约束和索引，然后重新创建
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;

-- 删除可能存在的旧索引
DROP INDEX IF EXISTS idx_favorites_user_product_unique;
DROP INDEX IF EXISTS idx_favorites_user_course_unique;

-- 创建新的部分唯一索引
CREATE UNIQUE INDEX idx_favorites_user_product_unique
  ON favorites(user_id, product_id)
  WHERE product_id IS NOT NULL;

CREATE UNIQUE INDEX idx_favorites_user_course_unique
  ON favorites(user_id, course_id)
  WHERE course_id IS NOT NULL;

-- 6. 创建用户+类型的组合索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_itemtype
  ON favorites(user_id, item_type);

COMMIT;