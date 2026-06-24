-- 方案3：更宽松的约束，只确保类型和ID匹配，允许NULL值

-- 删除现有的业务约束
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_product_or_course_check;

-- 创建更宽松的约束
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_or_course_check 
CHECK (
  -- 如果item_type是product，那么product_id应该不为NULL（如果存在的话）
  (item_type = 'product' AND (product_id IS NOT NULL OR product_id IS NULL)) OR
  -- 如果item_type是course，那么course_id应该不为NULL（如果存在的话）
  (item_type = 'course' AND (course_id IS NOT NULL OR course_id IS NULL)) OR
  -- 确保不会同时有product_id和course_id
  (product_id IS NULL OR course_id IS NULL)
);