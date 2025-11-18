-- 步骤6最终版：创建部分唯一索引和组合索引（course_id现在是UUID类型）

-- 删除现有的索引（如果存在）
DROP INDEX IF EXISTS idx_favorites_user_product;
DROP INDEX IF EXISTS idx_favorites_user_course;
DROP INDEX IF EXISTS idx_favorites_user_item_type;

-- 创建用户-产品部分唯一索引（仅当product_id不为NULL时）
CREATE UNIQUE INDEX idx_favorites_user_product 
ON favorites(user_id, product_id) 
WHERE product_id IS NOT NULL;

-- 创建用户-课程部分唯一索引（仅当course_id不为NULL时）
CREATE UNIQUE INDEX idx_favorites_user_course 
ON favorites(user_id, course_id) 
WHERE course_id IS NOT NULL;

-- 创建用户+类型的组合索引
CREATE INDEX idx_favorites_user_item_type 
ON favorites(user_id, item_type);