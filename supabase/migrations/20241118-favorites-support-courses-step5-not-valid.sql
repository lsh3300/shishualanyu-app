-- 方案2：使用NOT VALID选项，允许现有数据存在但约束新数据

-- 添加约束但不验证现有数据
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_or_course_check 
CHECK (
  (item_type = 'product' AND product_id IS NOT NULL AND course_id IS NULL) OR
  (item_type = 'course' AND course_id IS NOT NULL AND product_id IS NULL)
) NOT VALID;