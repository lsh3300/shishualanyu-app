-- 收藏表扩展迁移：支持课程收藏功能（分步执行版本）
-- 请按顺序执行每个步骤

-- 步骤1：添加基础字段
ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'product' CHECK (item_type IN ('product', 'course'));

ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS course_id UUID;