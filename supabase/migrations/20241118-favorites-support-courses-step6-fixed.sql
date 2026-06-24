-- 修正版：步骤6 - 创建唯一索引（使用TEXT类型）
-- 删除旧的约束
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;

-- 删除可能存在的旧索引
DROP INDEX IF EXISTS idx_favorites_user_product_unique;
DROP INDEX IF EXISTS idx_favorites_user_course_unique;

-- 创建新的部分唯一索引（course_id是TEXT类型）
CREATE UNIQUE INDEX idx_favorites_user_product_unique
  ON favorites(user_id, product_id)
  WHERE product_id IS NOT NULL;

CREATE UNIQUE INDEX idx_favorites_user_course_unique
  ON favorites(user_id, course_id)
  WHERE course_id IS NOT NULL;

-- 创建用户+类型的组合索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_itemtype
  ON favorites(user_id, item_type);