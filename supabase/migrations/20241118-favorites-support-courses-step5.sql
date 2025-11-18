-- 步骤5：添加业务约束
-- 先删除已存在的约束
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_product_or_course_check;

-- 添加新的业务约束
ALTER TABLE favorites
  ADD CONSTRAINT favorites_product_or_course_check
  CHECK (
    (product_id IS NOT NULL AND course_id IS NULL AND item_type = 'product')
    OR
    (product_id IS NULL AND course_id IS NOT NULL AND item_type = 'course')
  );