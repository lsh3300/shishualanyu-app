-- 步骤5最终版：添加业务约束（数据已清理）

-- 添加业务约束，确保product_id和course_id互斥且与item_type匹配
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_or_course_check 
CHECK (
  (item_type = 'product' AND product_id IS NOT NULL AND course_id IS NULL) OR
  (item_type = 'course' AND course_id IS NOT NULL AND product_id IS NULL)
);