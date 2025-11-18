-- 方案1：先清理数据，然后添加约束

-- 步骤1：删除或修复问题数据
-- 选项A：删除违反约束的数据
DELETE FROM favorites 
WHERE item_type = 'course' AND course_id IS NULL;

-- 或者选项B：修复数据（如果有对应的课程ID）
-- UPDATE favorites 
-- SET course_id = '对应的课程UUID'
-- WHERE id = '7f8d9f5d-909d-4630-a608-624cbf66f785';

-- 步骤2：添加业务约束
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_or_course_check 
CHECK (
  (item_type = 'product' AND product_id IS NOT NULL AND course_id IS NULL) OR
  (item_type = 'course' AND course_id IS NOT NULL AND product_id IS NULL)
);